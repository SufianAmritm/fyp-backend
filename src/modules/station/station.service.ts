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
import { StationCsvHeaders } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { Division } from '../division/entities/division.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { GetStationDto } from './dto/request/get.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Station } from './entities/station.entity';
import { IStationService } from './interfaces/station.interface';
import { IStationRepository } from './repositories/interface/station-repository.interface';

@Injectable()
export class StationService implements IStationService {
  constructor(
    @Inject(IStationRepository)
    private readonly stationRepository: IStationRepository,
    @InjectMapper() private readonly stationMapper: Mapper,
    private readonly utilService: UtilsService,
    private readonly transactionFactory: DbTransactionFactory,
  ) {}

  async create(createStationDto: CreateStationDto) {
    const { name, divisionId } = createStationDto;
    const exists = await this.stationRepository.findOne({
      name,
      divisionId,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS('Station', `name: ${name}`),
      );
    }
    const newStation = this.stationMapper.map(
      createStationDto,
      CreateStationDto,
      Station,
    );
    return this.stationRepository.create(newStation);
  }
  downloadCsv(context: AppContext): Promise<PassThrough> {
    return this.stationRepository.downloadCsv(context);
  }
  async uploadCsv(context: AppContext, file: Express.Multer.File) {
    const dto = {
      name: 'Station',
      division: 'Division',
      description: 'Description',
    };
    let records: (typeof dto)[] = [];
    try {
      records = await this.utilService.processCSVFile<typeof dto>(file, {
        dto,
        validatorColumns: Object.values(StationCsvHeaders),
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
    const findOptions = new FindOptionsBuilder<Station>()
      .where({})
      .relations({
        division: true,
      })
      .build();
    const existingColonies =
      await this.stationRepository.findManyWithBuilderOption(findOptions);
    const runner = await this.transactionFactory.transactionRunner();
    const manager = runner.manager;
    const divisionNames = records.map((rec) => rec.division);
    const divisions = await manager.getRepository(Division).find({
      where: {
        name: In(divisionNames),
      },
    });
    try {
      await runner.start();
      const recordsMapped = records.map((rec) => {
        const division = divisions.find((s) => s.name === rec.division);
        if (!division) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Division' + rec.division),
          );
        }
        const exists = existingColonies.find((colony) => {
          return colony.divisionId === division.id && colony.name === rec.name;
        });
        if (exists) {
          throw new BadRequestException(
            `Station ${rec.name} already exists in division: ${rec.division}`,
          );
        }
        rec['divisionId'] = division.id;
        rec['createdById'] = context.UserId;
        return plainToInstance(Station, rec);
      });
      await this.stationRepository.bulkCreateWithTransaction(
        recordsMapped,
        Station,
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

  findAll(getStationDto: GetStationDto, paginationDto: PaginationDto) {
    return this.stationRepository.findAll(getStationDto, paginationDto);
  }

  findAllForTransfer(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
  ) {
    return this.stationRepository.findAllForTransfer(
      getStationDto,
      paginationDto,
    );
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Station>()
      .where({
        id,
      })
      .relations({
        managers: {
          user: true,
        },
      })
      .build();

    const stations =
      await this.stationRepository.findOneWithBuilderOption(findOptions);
    stations.managers = stations.managers.map((manager) => {
      manager.user.password = undefined;
      return manager;
    });
  }

  async update(id: number, updateStationDto: UpdateStationDto) {
    const { name, divisionId } = updateStationDto;
    if (name) {
      const exists = await this.stationRepository.findOne({
        name,
        divisionId,
        id: Not(Equal(id)),
      });
      if (exists) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_EXISTS('Station', `name: ${name}`),
        );
      }
    }
    const stationUpdate = this.stationMapper.map(
      updateStationDto,
      CreateStationDto,
      Station,
    );
    await this.stationRepository.update({ id }, stationUpdate);
    return this.stationRepository.findOne({ id });
  }

  async remove(id: number) {
    const findOptions = new FindOptionsBuilder<Station>()
      .where({ id })
      .relations({})
      .build();
    const station =
      await this.stationRepository.findOneWithBuilderOption(findOptions);
    if (!station) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Station'));
    }
    await this.stationRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
