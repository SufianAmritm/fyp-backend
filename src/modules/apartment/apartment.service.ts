import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { CreateOccupationDto } from '../occupations/dto/create-occupations.dto';
import { Occupation } from '../occupations/entities/occupations.entity';
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
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly apartmentMapper: Mapper,
  ) {}

  async create(createApartmentDto: CreateApartmentDto) {
    const { houseNo, streetNo } = createApartmentDto;
    const exists = await this.apartmentRepository.findOne({
      houseNo,
      streetNo,
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
      const manager = runner.manager;
      await this.apartmentRepository.createWithTransaction(
        newApartment,
        Apartment,
        manager,
      );
      await this.apartmentRepository.createWithTransaction(
        newOccupation,
        Occupation,
        manager,
      );
      await runner.end()
      return this.findOne(newApartment.id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll(getApartmentDto: GetApartmentDto, paginationDto: PaginationDto) {
    return this.apartmentRepository.findAll(getApartmentDto, paginationDto);
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

  async update(id: number, updateApartmentDto: UpdateApartmentDto) {
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
