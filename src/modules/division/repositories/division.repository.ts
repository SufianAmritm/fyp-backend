import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { GetDivisionsDto } from '../dto/request/get.dto';
import { Division } from '../entities/division.entity';
import { IDivisionRepository } from './interface/division-repository.interface';

@Injectable()
export class DivisionRepository
  extends BaseRepository<Division>
  implements IDivisionRepository
{
  constructor(
    @InjectRepository(Division)
    public readonly repository: Repository<Division>,
  ) {
    super(repository);
  }

  async findAll(
    getDivisionDto: GetDivisionsDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Division>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getDivisionDto;
    if (search) {
      whereAnd.push(`division.name ILIKE :search`);
      whereAnd.push(`division.description ILIKE :search`);

      params.search = `%${search}%`;
    }
    const res = await this.repository
      .createQueryBuilder('division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `division.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
  }
}
