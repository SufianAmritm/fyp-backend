import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { UserRoles } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateColonyDto } from './dto/create-colony.dto';
import { GetColonyDto } from './dto/request/get.dto';
import { UpdateColonyDto } from './dto/update-colony.dto';
import { Colony } from './entities/colony.entity';
import { IColonyService } from './interfaces/colony.interface';
import { IColonyRepository } from './repositories/interface/colony-repository.interface';
import { AppContext } from '../../common/interfaces/context';

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
      const manager = await this.managerService.findOne(updator.id);
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
  ) {
    return this.colonyRepository.findAll(getColonyDto, paginationDto, ctx);
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
    const colony = await this.colonyRepository.findOne({ id });
    if (!colony)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Colony'));
    const updator = await this.userService.findOneById(userId);
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOne(updator.id);
      const canManagerUpdateVerification =
        manager.stationId === colony.stationId;

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
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
