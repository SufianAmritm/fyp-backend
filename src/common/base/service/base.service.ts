import { Mapper } from '@automapper/core';
import { RESPONSE_MESSAGES } from 'src/common/constants';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import BaseEntity from '../entity/base.entity';
import { BaseRepository } from '../repository/base/base.repository';
import { IBaseService } from './interface/base-service';

export class BaseService<T extends BaseEntity> implements IBaseService<T> {
  constructor(
    private readonly repository: BaseRepository<T>,
    private readonly mapper: Mapper,
  ) {}

  async findAllWithoutOptions(
    paginationDto?: PaginationDto,
  ): Promise<PagedList<T> | T[]> {
    if (!paginationDto) return await this.repository.find();
    return await this.repository.findWithPagination(paginationDto);
  }

  async findOneById(id: number): Promise<T> {
    return await this.repository.findOne({ id } as FindOptionsWhere<T>);
  }

  async updateOneById<U>(
    id: number,
    data: U,
    modelIdentifier: new () => U,
    entityClass: new () => T,
  ): Promise<string> {
    const entity = this.mapper.map(data, modelIdentifier, entityClass);
    await this.repository.update(
      { id } as FindOptionsWhere<T>,
      entity as QueryDeepPartialEntity<T>,
    );
    return RESPONSE_MESSAGES.UPDATED;
  }

  async deleteOneById(id: number): Promise<string> {
    await this.repository.softDelete({ id } as FindOptionsWhere<T>);
    return RESPONSE_MESSAGES.DELETED;
  }
  async createOne<U>(
    data: U,
    modelIdentifier: new () => U,
    entityClass: new () => T,
  ): Promise<T> {
    const entity = this.mapper.map(data, modelIdentifier, entityClass);
    return await this.repository.create(entity);
  }
}
