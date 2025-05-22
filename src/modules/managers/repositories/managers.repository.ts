import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { UserRoles } from '../../../common/constants/enums';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
import { GetManagersDto } from '../dto/get-managers.dto';
import { Manager } from '../entities/managers.entity';
import { IManagersRepository } from './interface/managers-repository.interface';

@Injectable()
export class ManagersRepository
  extends BaseRepository<Manager>
  implements IManagersRepository
{
  constructor(
    @InjectRepository(Manager)
    public readonly repository: Repository<Manager>,
  ) {
    super(repository);
  }

  async findAll(
    getDto: GetManagersDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Manager>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getDto;
    if (search) {
      whereOr.push(`user.name ILIKE :search`);
      whereOr.push(`user.email ILIKE :search`);
      whereOr.push(`user.phoneNumber ILIKE :search`);

      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`division.name ILIKE :search`);

      params.search = `%${search}%`;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereAnd.push(`manager.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    const res = await this.repository
      .createQueryBuilder('manager')
      .innerJoinAndSelect('manager.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .innerJoinAndSelect('manager.user', 'user')

      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `manager.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
    // const findOption = new FindOptionsBuilder<Manager>()
    //   .where({
    //     deletedAt: null,
    //   })
    //   .relations({
    //     user: true,
    //     station: true,
    //   })
    //   .order({ id: ORDER_BY.DESC })
    //   .build();
    // return this.findWithPagination(paginationDto, findOption);
  }
}
