import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { OCCUPATION_STATUS } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import {
  AssignOccupationDto,
  DeAssignOccupationDto,
} from './dto/assign-occupation.dto';
import { CreateOccupationDto } from './dto/create-occupations.dto';
import { UpdateOccupationDto } from './dto/update-occupations.dto';
import { Occupation } from './entities/occupations.entity';
import { IOccupationService } from './interfaces/occupations.interface';
import { IOccupationRepository } from './repositories/interface/occupations-repository.interface';

@Injectable()
export class OccupationService implements IOccupationService {
  constructor(
    @Inject(IOccupationRepository)
    private readonly occupationsRepository: IOccupationRepository,
    @InjectMapper() private readonly occupationsMapper: Mapper,
  ) {}
  async findOneByOccupiedById(occupiedById: number): Promise<Occupation> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        occupiedById,
      })
      .relations({
        apartment: true,
        assignedBy: {
          manager: true,
        },
        deAssignedBy: {
          manager: true,
        },
        occupiedBy: {
          user: true,
        },
        vacantBy: {
          user: true,
        },
      })
      .build();

    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);
    if (occupation.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation.vacantBy) occupation.vacantBy.user.password = undefined;
    return occupation;
  }
  async findOneByApartmentId(apartmentId: number): Promise<Occupation> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        apartmentId,
      })
      .relations({
        apartment: true,
        assignedBy: {
          manager: true,
        },
        deAssignedBy: {
          manager: true,
        },
        occupiedBy: {
          user: true,
        },
        vacantBy: {
          user: true,
        },
      })
      .build();

    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);
    if (occupation.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation.vacantBy) occupation.vacantBy.user.password = undefined;
    return occupation;
  }
  async assignOccupation(
    assignOccupationDto: AssignOccupationDto,
    userId: number,
  ): Promise<any> {
    const occupation = await this.occupationsRepository.findOne({
      apartmentId: assignOccupationDto.apartmentId,
    });

    if (occupation.status === OCCUPATION_STATUS.OCCUPIED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'occupied'),
      );
    }
    if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.ABOUT_TO_VACANT);
    }
    await this.occupationsRepository.update(
      { id: occupation.id },
      {
        lastOccupiedOn: new Date(),
        status: OCCUPATION_STATUS.OCCUPIED,
        occupiedById: assignOccupationDto.employeeId,
        assignedById: userId,
      },
    );
    return this.findOne(occupation.id);
  }
  async deAssignOccupation(
    deAssignOccupationDto: DeAssignOccupationDto,
    userId: number,
  ): Promise<any> {
    const occupation = await this.occupationsRepository.findOne({
      apartmentId: deAssignOccupationDto.apartmentId,
    });
    if (occupation.status === OCCUPATION_STATUS.VACANT) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'vacant'),
      );
    }
    await this.occupationsRepository.update(
      { id: occupation.id },
      {
        lastVacantOn: new Date(),
        status: OCCUPATION_STATUS.VACANT,
        vacantById: occupation.occupiedById,
        deAssignedById: userId,
      },
    );
    return this.findOne(occupation.id);
  }

  async create(createOccupationDto: CreateOccupationDto) {
    const newOccupation = this.occupationsMapper.map(
      createOccupationDto,
      CreateOccupationDto,
      Occupation,
    );
    return this.occupationsRepository.create(newOccupation);
  }

  findAll(paginationDto: PaginationDto, ctx: AppContext) {
    return this.occupationsRepository.findAll(paginationDto, ctx);
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        id,
      })
      .relations({
        apartment: true,
        assignedBy: {
          manager: true,
        },
        deAssignedBy: {
          manager: true,
        },
        occupiedBy: {
          user: true,
        },
        vacantBy: {
          user: true,
        },
      })
      .build();

    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);
    if (occupation.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation.vacantBy) occupation.vacantBy.user.password = undefined;
    return occupation;
  }

  async update(id: number, updateOccupationDto: UpdateOccupationDto) {
    const occupationsUpdate = this.occupationsMapper.map(
      updateOccupationDto,
      CreateOccupationDto,
      Occupation,
    );
    await this.occupationsRepository.update({ id }, occupationsUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.occupationsRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
