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
import {
  ApartmentCsvHeaders,
  HISTORY_TYPE,
  UserRoles,
} from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { Colony } from '../colony/entities/colony.entity';
import { History } from '../history/entities/history.entity';
import { IHistoryService } from '../history/interfaces/history.interface';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { CreateOccupationDto } from '../occupations/dto/create-occupations.dto';
import { Occupation } from '../occupations/entities/occupations.entity';
import { VacancyRequest } from '../occupations/entities/vacancy-requests.entity';
import { Station } from '../station/entities/station.entity';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { GetApartmentDto } from './dto/request/get.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { Apartment } from './entities/apartment.entity';
import { IApartmentService } from './interfaces/apartment.interface';
import { IApartmentRepository } from './repositories/interface/apartment-repository.interface';

@Injectable()
export class ApartmentService implements IApartmentService {
  constructor(
    @Inject(IApartmentRepository)
    private readonly apartmentRepository: IApartmentRepository,
    @Inject(IHistoryService)
    private readonly historyService: IHistoryService,
    @Inject(IUserService) private readonly userService: IUserService,
    @Inject(IManagersService) private readonly managerService: IManagersService,
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly apartmentMapper: Mapper,
    private readonly utilService: UtilsService,
  ) {}
  downloadCsv(context: AppContext): Promise<PassThrough> {
    return this.apartmentRepository.downloadCsv(context);
  }

  async uploadCsv(context: AppContext, file: Express.Multer.File) {
    const dto = {
      houseNo: 'HouseNo',
      streetNo: 'StreetNo',
      address: 'Address',
      description: 'Description',
      colony: 'Colony',
      station: 'Station',
      rooms: 'Rooms',
      bathrooms: 'Bathrooms',
    };
    let records: (typeof dto)[] = [];
    try {
      records = await this.utilService.processCSVFile<typeof dto>(file, {
        dto,
        validatorColumns: Object.values(ApartmentCsvHeaders),
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
    const findOptions = new FindOptionsBuilder<Apartment>()
      .where({})
      .relations({
        colony: true,
      })
      .build();
    const existingApartments =
      await this.apartmentRepository.findManyWithBuilderOption(findOptions);
    const runner = await this.transactionFactory.transactionRunner();
    const manager = runner.manager;
    const stationNames = records.map((rec) => rec.station);
    const colonyNames = records.map((rec) => rec.colony);
    const stations = await manager.getRepository(Station).find({
      where: {
        name: In(stationNames),
      },
    });
    const colonies = await manager.getRepository(Colony).find({
      where: {
        name: In(colonyNames),
      },
    });
    try {
      await runner.start();
      const recordsMapped = records.map((rec) => {
        const station = stations.find((s) => s.name === rec.station);
        const colony = colonies.find((s) => s.name === rec.colony);
        if (!station) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Station' + rec.station),
          );
        }
        if (!colony) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Colony' + rec.colony),
          );
        }
        if (colony.stationId !== station.id) {
          throw new BadRequestException(
            `Colony ${rec.colony} does not belong to Station ${rec.station}`,
          );
        }
        if (context.Role === UserRoles.MANAGER) {
          if (context.StationId !== station.id) {
            throw new BadRequestException(
              `You can not add apartments for station ${rec.station}`,
            );
          }
        }
        const exists = existingApartments.find((apartment) => {
          return (
            apartment.colonyId === colony.id &&
            apartment.streetNo === rec.streetNo &&
            apartment.houseNo === rec.houseNo &&
            apartment.colony.stationId === station.id
          );
        });
        if (exists) {
          throw new BadRequestException(
            `Apartment streetNo: ${rec.streetNo} houseNo: ${rec.houseNo} already exists`,
          );
        }
        rec['colonyId'] = colony.id;
        rec['createdById'] = context.UserId;
        const nw = plainToInstance(Apartment, rec);
        const occ = new Occupation();
        nw.occupation = occ;
        return nw;
      });
      const apartments =
        await this.apartmentRepository.bulkCreateWithTransaction(
          recordsMapped,
          Apartment,
          manager,
        );
      await this.apartmentRepository.bulkCreateWithTransaction(
        recordsMapped.map((apartment) => ({
          ...apartment.occupation,
          apartmentId: apartment.id,
        })),
        Occupation,
        manager,
      );
      await this.apartmentRepository.bulkCreateWithTransaction(
        apartments.map((ap) => ({
          apartmentId: ap.id,
          type: HISTORY_TYPE.APARTMENT,
          text: 'Apartment Created',
        })),
        History,
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
  async create(createApartmentDto: CreateApartmentDto) {
    const { houseNo, streetNo, colonyId } = createApartmentDto;
    const user = await this.userService.findOneById(
      createApartmentDto.createdById,
    );
    if (!user)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (user.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        user.id,
      );
      const canManagerCreateApartment = manager.station.colonies.some(
        (colony) => colony.id === colonyId,
      );
      if (!canManagerCreateApartment) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const exists = await this.apartmentRepository.findOne({
      houseNo,
      streetNo,
      colonyId,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS(
          'Apartment',
          `houseNo: ${houseNo} and streetNo: ${streetNo}`,
        ),
      );
    }
    const newApartment = this.apartmentMapper.map(
      createApartmentDto,
      CreateApartmentDto,
      Apartment,
    );
    const newOccupation = this.apartmentMapper.map(
      {
        apartmentId: newApartment.id,
      },
      CreateOccupationDto,
      Occupation,
    );
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const { manager } = runner;
      const aprtment = await this.apartmentRepository.createWithTransaction(
        newApartment,
        Apartment,
        manager,
      );
      newOccupation.apartmentId = aprtment.id;
      await this.apartmentRepository.createWithTransaction(
        newOccupation,
        Occupation,
        manager,
      );
      await this.apartmentRepository.createWithTransaction(
        {
          apartmentId: aprtment.id,
          type: HISTORY_TYPE.APARTMENT,
          text: 'Apartment Created',
        },
        History,
        manager,
      );
      await runner.end();
      return this.findOne(newApartment.id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
    context: AppContext,
  ) {
    return this.apartmentRepository.findAll(
      getApartmentDto,
      paginationDto,
      context,
    );
  }

  findAllForTransfer(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
  ) {
    return this.apartmentRepository.findAllForTransfer(
      getApartmentDto,
      paginationDto,
    );
  }

  findOne(id: number) {
    const findOption = new FindOptionsBuilder<Apartment>()
      .where({ id })
      .relations({
        occupation: true,
        colony: true,
      })
      .build();
    return this.apartmentRepository.findOneWithBuilderOption(findOption);
  }

  async update(
    id: number,
    updateApartmentDto: UpdateApartmentDto,
    userId: number,
  ) {
    const user = await this.userService.findOneById(userId);
    if (!user)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (user.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        user.id,
      );
      const canManagerUpdateApartment = manager.station.colonies.some(
        (colony) => colony.id === updateApartmentDto.colonyId,
      );
      if (!canManagerUpdateApartment) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const apartmentUpdate = this.apartmentMapper.map(
      updateApartmentDto,
      CreateApartmentDto,
      Apartment,
    );
    await this.apartmentRepository.update({ id }, apartmentUpdate);
    await this.historyService.create({
      type: HISTORY_TYPE.APARTMENT,
      text: 'Apartment Updated',
      apartmentId: id,
    });
    return this.apartmentRepository.findOne({ id });
  }

  async remove(id: number, context: AppContext) {
    const apartment = await this.findOne(id);
    if (!apartment)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Apartment'));
    if (context.Role === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        context.UserId,
      );
      const canManagerDeleteApartment = manager.station.colonies.some(
        (colony) => colony.id === apartment.colony.id,
      );
      if (!canManagerDeleteApartment) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const { manager } = runner;
      await this.apartmentRepository.softDeleteWithTransaction(
        {
          occupationId: apartment.occupation.id,
        },
        VacancyRequest,
        manager,
      );
      await this.apartmentRepository.softDeleteWithTransaction(
        {
          apartmentId: id,
        },
        History,
        manager,
      );
      await this.apartmentRepository.softDeleteWithTransaction(
        {
          apartmentId: id,
        },
        Occupation,
        manager,
      );
      await this.apartmentRepository.softDeleteWithTransaction(
        {
          id,
        },
        Apartment,
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
