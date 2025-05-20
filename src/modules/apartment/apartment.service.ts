import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PassThrough } from 'stream';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { UserRoles } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { CreateOccupationDto } from '../occupations/dto/create-occupations.dto';
import { Occupation } from '../occupations/entities/occupations.entity';
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
    @Inject(IUserService) private readonly userService: IUserService,
    @Inject(IManagersService) private readonly managerService: IManagersService,
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly apartmentMapper: Mapper,
  ) {}
  downloadCsv(context: AppContext): Promise<PassThrough> {
    return this.apartmentRepository.downloadCsv(context);
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
    return this.apartmentRepository.findOne({ id });
  }

  async remove(id: number) {
    await this.apartmentRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
