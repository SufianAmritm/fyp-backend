import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindOptionsCustom } from '../../../database/utils/find-options-builder';
import { IRead } from '../interfaces/read.interface';
import { IWrite } from '../interfaces/write.interface';
import { BadRequestException } from '@nestjs/common';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  public readonly tableName: string;

  constructor(public repository: Repository<T>) {
    this.tableName = this.repository.metadata.tableName;
  }

  truncate(): Promise<void> {
    return this.repository.clear();
  }

  async whereIn(whereOption: FindManyOptions<T>): Promise<T[]> {
    try {
      return await this.repository.find({
        where: whereOption.where,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }


  async findOne(
    whereOption: FindOptionsWhere<T>,
    selectOption: FindOptionsSelect<T> = {},
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T> {
    try {
      return await this.repository.findOne({
        select: selectOption,
        where: whereOption,
        relations: relationOption,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async exist(whereOption: FindOptionsWhere<T>): Promise<T> {
    return this.repository.findOneBy(whereOption);
  }

  async create(item: T): Promise<T> {
    try {
      return await this.repository.save(this.repository.create(item));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createWithTransaction<T>(
    item: DeepPartial<T>,
    repository: Repository<T>,
    transactionManager: EntityManager,
  ): Promise<T> {
    try {
      return await transactionManager
        .getRepository(repository.target)
        .save(item);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkCreate(item: T[]): Promise<T[]> {
    try {
      return await this.repository.save(this.repository.create(item));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkCreateWithTransaction<T>(
    item: T[],
    repository: Repository<T>,
    transactionManager: EntityManager,
  ): Promise<T[]> {
    try {
      return await transactionManager
        .getRepository(repository.target)
        .save(item);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteWithTransaction<T>(
    whereOptions: FindOptionsWhere<T>,
    repository: Repository<T>,
    updateItem: QueryDeepPartialEntity<T>,

    // Todo incase of delete column branch merge

    transactionManager: EntityManager,
  ): Promise<any> {
    try {
      await transactionManager
        .getRepository(repository.target)
        .update(whereOptions, updateItem);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.repository.update(conditions, updates);
  }

  async updateWithTransaction<T>(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
    repository: Repository<T>,
    transactionManager: EntityManager,
  ): Promise<void> {
    try {
      await transactionManager
        .getRepository(repository.target)
        .update(conditions, updates);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(where: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(where);
  }

  async softDelete(where: FindOptionsWhere<T>): Promise<void> {
    await this.repository.softDelete(where);
  }

  async restore(where: FindOptionsWhere<T>): Promise<void> {
    await this.repository.restore(where);
  }

  async find(
    selectOption?: FindOptionsSelect<T>,
    orderOptions?: FindOptionsOrder<T>,
    whereOption?: FindOptionsWhere<T>,
    relationOption?: FindOptionsRelations<T>,
    take?: number,
  ): Promise<T[]> {
    try {
      return await this.repository.find({
        select: selectOption,
        order: orderOptions,
        where: whereOption,
        relations: relationOption,
        take,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findWithBatch(
    skip: number,
    take: number,
    whereOption?: FindOptionsWhere<T>,
    selectOption?: FindOptionsSelect<T>,
    orderOptions?: FindOptionsOrder<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T[]> {
    try {
      return await this.repository.find({
        select: selectOption,
        order: orderOptions,
        where: whereOption,
        relations: relationOption,
        take,
        skip,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findWithPagination(
    paginationDto: PaginationDto,
    options?: FindOptionsCustom<T>,
  ): Promise<PagedList<T>> {
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;
    const [items, count] = await this.repository.findAndCount({
      ...options,
      take,
      skip,
    });
    return new PagedList<T>(items, count, take, page);
  }

  async findWithPaginationWithoutCount(
    paginationDto: PaginationDto,
    options?: FindOptionsCustom<T>,
  ): Promise<PagedList<T>> {
    try {
      const { page, take } = paginationDto;
      const skip = (page - 1) * take;
      const items = await this.repository.find({
        ...options,
        take,
        skip,
      });
      return new PagedList<T>(items, 1000, take, page); // adding count as 1000
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findManyWithBuilderOption(
    options?: FindOptionsCustom<T>,
  ): Promise<T[]> {
    return this.repository.find({
      ...options,
    });
  }

  async findOneWithBuilderOption(options?: FindOptionsCustom<T>): Promise<T> {
    return this.repository.findOne({
      ...options,
    });
  }

  async updateFieldBasedOnConditionsWithRawApproach(
    tableName: string,
    fieldToUpdate: string,
    updateValue: any,
    whereConditions: string,
  ) {
    const query = `
          UPDATE ${tableName}
          SET ${fieldToUpdate} = $1
          WHERE ${whereConditions}
        `;

    await this.repository.query(query, [updateValue]);
  }

  async getRowsByJsonbColumnLength(
    columnName: string,
    lengthToMatch: number,
    paginationDto: PaginationDto,
  ): Promise<T[]> {
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;
    return this.repository
      .createQueryBuilder(`${this.tableName}`)
      .where(
        `jsonb_array_length(${this.tableName}.${columnName}) = ${lengthToMatch}`,
      )
      .skip(skip)
      .take(take)
      .getMany();
  }

  async selectNotValidIds(
    tableName: string,
    selectColumns: string[],
    subquery: string,
    subqueryAlias: string,
    joinConditions: string,
    whereConditions: string,
  ) {
    const selectColumnsStr = selectColumns.join(', ');
    const query = `
          SELECT ${selectColumnsStr}
          FROM (
            ${subquery}
          ) AS ${subqueryAlias}
          LEFT JOIN ${tableName} ON ${joinConditions}
          WHERE ${whereConditions}
        `;
    const result = await this.repository.query(query);
    return result;
  }
}
