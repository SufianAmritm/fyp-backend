import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PassThrough } from 'stream';
import { Equal, In, Not } from 'typeorm';
import { DefaultCsvSettings, RESPONSE_MESSAGES } from '../../common/constants';
import { DivisionCsvHeaders } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { Apartment } from '../apartment/entities/apartment.entity';
import { Colony } from '../colony/entities/colony.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Manager } from '../managers/entities/managers.entity';
import { Station } from '../station/entities/station.entity';
import { User } from '../user/entities/user.entity';
import { CreateDivisionDto } from './dto/create-division.dto';
import { GetDivisionsDto } from './dto/request/get.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { Division } from './entities/division.entity';
import { IDivisionService } from './interfaces/division.interface';
import { IDivisionRepository } from './repositories/interface/division-repository.interface';

@Injectable()
export class DivisionService implements IDivisionService {
  constructor(
    @Inject(IDivisionRepository)
    private readonly divisionRepository: IDivisionRepository,
    @InjectMapper() private readonly divisionMapper: Mapper,
    private readonly utilService: UtilsService,
    private readonly transactionFactory: DbTransactionFactory,
  ) {}

  async create(createDivisionDto: CreateDivisionDto) {
    const { name } = createDivisionDto;
    const exists = await this.divisionRepository.findOne({
      name,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS('Division', `name: ${name}`),
      );
    }
    const newDivision = this.divisionMapper.map(
      createDivisionDto,
      CreateDivisionDto,
      Division,
    );
    return this.divisionRepository.create(newDivision);
  }

  findAll(getDivisionDto: GetDivisionsDto, paginationDto: PaginationDto) {
    return this.divisionRepository.findAll(getDivisionDto, paginationDto);
  }
  downloadCsv(context: AppContext): Promise<PassThrough> {
    return this.divisionRepository.downloadCsv(context);
  }
  async uploadCsv(context: AppContext, file: Express.Multer.File) {
    const dto = {
      name: 'Division',
      description: 'Description',
    };
    let records: (typeof dto)[] = [];
    try {
      records = await this.utilService.processCSVFile<typeof dto>(file, {
        dto,
        validatorColumns: Object.values(DivisionCsvHeaders),
        ...DefaultCsvSettings,
        rowStart: 2,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }

    if (!records || records.length === 0) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.FAILED_OPERATION('parse csv'),
      );
    }
    const findOptions = new FindOptionsBuilder<Division>().where({}).build();
    const existingDivisions =
      await this.divisionRepository.findManyWithBuilderOption(findOptions);
    const runner = await this.transactionFactory.transactionRunner();
    const manager = runner.manager;
    try {
      await runner.start();
      const recordsMapped = records.map((rec) => {
        const exists = existingDivisions.find((colony) => {
          return colony.name === rec.name;
        });
        if (exists) {
          throw new BadRequestException(`Division ${rec.name} already exists`);
        }
        rec['createdById'] = context.UserId;
        return plainToInstance(Division, rec);
      });
      await this.divisionRepository.bulkCreateWithTransaction(
        recordsMapped,
        Division,
        manager,
      );
      await runner.end();
      return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Division>()
      .where({
        id,
      })
      .relations({
        stations: true,
      })
      .build();

    return this.divisionRepository.findOneWithBuilderOption(findOptions);
  }
  findOneForDelete(id: number) {
    const findOptions = new FindOptionsBuilder<Division>()
      .where({
        id,
      })
      .relations({
        stations: {
          managers: {
            user: true,
          },
          colonies: {
            apartments: true,
            employees: {
              user: true,
            },
          },
        },
      })
      .build();

    return this.divisionRepository.findOneWithBuilderOption(findOptions);
  }

  async update(id: number, updateDivisionDto: UpdateDivisionDto) {
    const { name } = updateDivisionDto;
    if (name) {
      const exists = await this.divisionRepository.findOne({
        name: updateDivisionDto.name,
        id: Not(Equal(id)),
      });
      if (exists) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_EXISTS(
            'Division',
            `name: ${updateDivisionDto.name}`,
          ),
        );
      }
    }
    const divisionUpdate = this.divisionMapper.map(
      updateDivisionDto,
      CreateDivisionDto,
      Division,
    );
    await this.divisionRepository.update({ id }, divisionUpdate);
    return this.divisionRepository.findOne({ id });
  }

  async remove(id: number, context: AppContext) {
    const division = await this.findOneForDelete(id);
    if (!division)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Manager'));
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const { manager } = runner;
      await this.divisionRepository.softDeleteWithTransaction(
        {
          divisionId: division.id,
        },
        Station,
        manager,
      );
      await this.divisionRepository.softDeleteWithTransaction(
        {
          stationId: In(division.stations.map((st) => st.id)),
        },
        Manager,
        manager,
      );

      await this.divisionRepository.softDeleteWithTransaction(
        {
          id: In(
            division.stations.flatMap((st) =>
              st.managers.map((man) => man.userId),
            ),
          ),
        },
        User,
        manager,
      );
      await this.divisionRepository.softDeleteWithTransaction(
        {
          colonyId: In(
            division.stations.flatMap((st) => st.colonies.map((ap) => ap.id)),
          ),
        },
        Employee,
        manager,
      );

      await this.divisionRepository.softDeleteWithTransaction(
        {
          id: In(
            division.stations.flatMap((st) =>
              st.colonies.flatMap((man) => man.employees.map((emp) => emp.id)),
            ),
          ),
        },
        User,
        manager,
      );
      await this.divisionRepository.softDeleteWithTransaction(
        {
          stationId: In(division.stations.map((st) => st.id)),
        },
        Colony,
        manager,
      );

      await this.divisionRepository.softDeleteWithTransaction(
        {
          colonyId: In(
            division.stations.flatMap((st) => st.colonies.map((ap) => ap.id)),
          ),
        },
        Apartment,
        manager,
      );

      await this.divisionRepository.softDeleteWithTransaction(
        {
          id,
        },
        Division,
        manager,
      );
      await runner.end();
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
    return RESPONSE_MESSAGES.DELETED;
  }
}
