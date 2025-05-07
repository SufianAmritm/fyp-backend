import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IWrite<T> {
  create(item: T): Promise<T>;
  bulkCreate(item: T[]): Promise<T[]>;
  bulkCreateWithTransaction<T>(
    item: T[],
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T[]>;
  deleteWithTransaction<T>(
    where: FindOptionsWhere<T>,
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<DeleteResult>;
  update(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult>;
  delete(where: FindOptionsWhere<T>): Promise<void>;
  softDelete(where: FindOptionsWhere<T>): Promise<void>;
  softDeleteWithRelations(entity: T): Promise<void>;
  restore(where: FindOptionsWhere<T>): Promise<void>;
  getRowsByJsonbColumnLength(
    columnName: string,
    lengthToMatch: number,
    paginationDto: PaginationDto,
  ): Promise<T[]>;
  truncate(): Promise<void>;
  createWithTransaction<T>(
    item: DeepPartial<T>,
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T>;
  updateWithTransaction<T>(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<void>;
}
