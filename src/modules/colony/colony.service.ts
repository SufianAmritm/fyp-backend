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
import { In } from 'typeorm';
import { DefaultCsvSettings, RESPONSE_MESSAGES } from '../../common/constants';
import { ColonyCsvHeaders, UserRoles } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { Apartment } from '../apartment/entities/apartment.entity';
import { Division } from '../division/entities/division.entity';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { Station } from '../station/entities/station.entity';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateColonyDto } from './dto/create-colony.dto';
import { GetColonyDto } from './dto/request/get.dto';
import { UpdateColonyDto } from './dto/update-colony.dto';
import { Colony } from './entities/colony.entity';
import { IColonyService } from './interfaces/colony.interface';
import { IColonyRepository } from './repositories/interface/colony-repository.interface';

@Injectable()
export class ColonyService implements IColonyService {
  constructor(
    @Inject(IColonyRepository)
    private readonly colonyRepository: IColonyRepository,
    @Inject(IManagersService)
    private readonly managerService: IManagersService,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @InjectMapper() private readonly colonyMapper: Mapper,
    private readonly utilService: UtilsService,
    private readonly transactionFactory: DbTransactionFactory,
  ) {}

  async create(createColonyDto: CreateColonyDto) {
    const { name, stationId } = createColonyDto;
    const exists = await this.colonyRepository.findOne({
      name,
      stationId,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS('Colony', `name: ${name}`),
      );
    }
    const updator = await this.userService.findOneById(
      createColonyDto.createdById,
    );
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserId(updator.id);
      const canManagerUpdateVerification = manager.stationId === stationId;

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const newColony = this.colonyMapper.map(
      createColonyDto,
      CreateColonyDto,
      Colony,
    );
    return this.colonyRepository.create(newColony);
  }

  findAll(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
    transfer?: boolean,
  ) {
    return this.colonyRepository.findAll(
      getColonyDto,
      paginationDto,
      ctx,
      transfer,
    );
  }
  downloadCsv(context: AppContext): Promise<PassThrough> {
    return this.colonyRepository.downloadCsv(context);
  }
  async uploadCsv(context: AppContext, file: Express.Multer.File) {
    const dto = {
      name: 'Colony',
      division: 'Division',
      station: 'Station',
      description: 'Description',
    };
    let records: (typeof dto)[] = [];
    try {
      records = await this.utilService.processCSVFile<typeof dto>(file, {
        dto,
        validatorColumns: Object.values(ColonyCsvHeaders),
        ...DefaultCsvSettings,
        rowStart: 2,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) return error;
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }

    if (!records || records.length === 0) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.FAILED_OPERATION('parse csv'),
      );
    }
    const findOptions = new FindOptionsBuilder<Colony>()
      .where({})
      .relations({
        station: true,
      })
      .build();
    const existingColonies =
      await this.colonyRepository.findManyWithBuilderOption(findOptions);
    const runner = await this.transactionFactory.transactionRunner();
    const manager = runner.manager;
    const stationNames = records.map((rec) => rec.station);
    const divisionNames = records.map((rec) => rec.division);
    const stations = await manager.getRepository(Station).find({
      where: {
        name: In(stationNames),
      },
    });
    const divisions = await manager.getRepository(Division).find({
      where: {
        name: In(divisionNames),
      },
    });
    try {
      await runner.start();
      const recordsMapped = records.map((rec) => {
        const station = stations.find((s) => s.name === rec.station);
        const division = divisions.find((s) => s.name === rec.division);
        if (!station) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Station' + rec.station),
          );
        }
        if (!division) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Division' + rec.division),
          );
        }
        if (station.divisionId !== division.id) {
          throw new BadRequestException(
            `Station ${rec.station} does not belong to Division ${rec.division}`,
          );
        }
        const exists = existingColonies.find((colony) => {
          return (
            colony.stationId === station.id &&
            colony.station.divisionId === division.id &&
            colony.name === rec.name
          );
        });
        if (exists) {
          throw new BadRequestException(
            `Colony ${rec.name} in station:${rec.station} and division:${rec.division} already exists`,
          );
        }
        rec['stationId'] = station.id;
        rec['createdById'] = context.UserId;
        return plainToInstance(Apartment, rec);
      });
      await this.colonyRepository.bulkCreateWithTransaction(
        recordsMapped,
        Colony,
        manager,
      );
      await runner.end();
      return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) return error;
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAllForTransfer(getColonyDto: GetColonyDto, paginationDto: PaginationDto) {
    return this.colonyRepository.findAllForTransfer(
      getColonyDto,
      paginationDto,
    );
  }

  findOne(id: number) {
    const findOption = new FindOptionsBuilder<Colony>()
      .where({ id })
      .relations({
        apartments: {
          occupation: true,
        },
      })
      .build();
    return this.colonyRepository.findOneWithBuilderOption(findOption);
  }

  async update(id: number, updateColonyDto: UpdateColonyDto, userId: number) {
    const colony = await this.findOne(id);
    if (!colony)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Colony'));
    const updator = await this.userService.findOneById(userId);
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserId(updator.id);
      const canManagerUpdateVerification =
        manager.stationId === colony.stationId;

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const ifOccupied = colony.apartments.some(
      (apartment) => apartment.occupation.occupiedById !== null,
    );
    if (ifOccupied && updateColonyDto?.stationId !== colony.stationId) {
      throw new BadRequestException(
        'Can not update colony station, because colony apartments are occupied',
      );
    }
    const colonyUpdate = this.colonyMapper.map(
      updateColonyDto,
      CreateColonyDto,
      Colony,
    );
    await this.colonyRepository.update({ id }, colonyUpdate);
    return this.colonyRepository.findOne({ id });
  }

  async remove(id: number) {
    await this.colonyRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
