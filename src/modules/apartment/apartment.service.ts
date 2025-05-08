import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
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
    return this.apartmentRepository.create(newApartment);
  }

  findAll(getApartmentDto: GetApartmentDto, paginationDto: PaginationDto) {
    return this.apartmentRepository.findAll(getApartmentDto, paginationDto);
  }

  findOne(id: number) {
    const findOption = new FindOptionsBuilder<Apartment>()
      .where({ id })
      .relations({})
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
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.apartmentRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
