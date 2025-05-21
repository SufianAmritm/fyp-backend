import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindOptions } from '../../builder-pattern/find-options.builder';
import { IRead } from '../interfaces/read.interface';
import { IWrite } from '../interfaces/write.interface';
import { BadRequestException } from '@nestjs/common';

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  public readonly tableName: string;

  constructor(public repository: Repository<T>) {
    this.tableName = this.repository.metadata.tableName;
  }

  count(whereOption: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where: whereOption });
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
    whereOption: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    selectOption?: FindOptionsSelect<T>,
    relationOption?: FindOptionsRelations<T>,
  ): Promise<T> {
    try {
      return await this.repository.findOne({
        select: selectOption || {},
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
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T> {
    try {
      return await transactionManager.getRepository(target).save(item);
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
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<T[]> {
    try {
      return await transactionManager.getRepository(target).save(item);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteWithTransaction<T>(
    where: FindOptionsWhere<T>,
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<DeleteResult> {
    try {
      const repo = transactionManager.getRepository(target);
      return await repo.delete(where);
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async softDeleteWithTransaction<T>(
    where: FindOptionsWhere<T>,
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<DeleteResult> {
    try {
      const repo = transactionManager.getRepository(target);
      return await repo.softDelete(where);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    const columns = this.repository.metadata.columns;
    const validUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (columns.find((column) => column.propertyName === key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as QueryDeepPartialEntity<T>);
    return this.repository.update(conditions, validUpdates);
  }
  private formatValue(val: any, param?: boolean): string | boolean {
    if (val instanceof Date)
      return param ? `${val.toISOString()}` : `'${val.toISOString()}'`;
    if (typeof val === 'string')
      return param
        ? `${val.replace(/'/g, "''")}`
        : `'${val.replace(/'/g, "''")}'`;
    if (typeof val === 'boolean') {
      if (param) {
        return val;
      }
      return val ? 'TRUE' : 'FALSE';
    }
    return val;
  }
  /**
   * Performs a bulk update of entities in batches using raw SQL queries for improved performance.
   *
   * @param items - An array of partial entity objects to update. Each object must include the `by` field (e.g., `id`) with a unique value.
   * @param by - The property name to use as the unique identifier for matching rows to update.
   *             This field is used in the `CASE` statements to conditionally update each column.
   *             It must be a key in each `item` and should resolve to a `number` or `string`.
   * @param batchSize - (Optional) The number of items to process per batch. Default is 20.
   *
   * Example:
   * ```ts
   * await bulkUpdate([
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' }
   * ], 'id');
   * ```
   * Note:
   * `It skips reference by, and also skips undefined values`
   */
  async bulkUpdate(
    items: QueryDeepPartialEntity<T>[],
    by: any,
    batchSize: number = 20,
  ): Promise<void> {
    if (items.length === 0) return undefined;
    try {
      const itemLength = items.length;
      const columnMap = new Map<string, string>();

      this.repository.metadata.columns.forEach((col) => {
        columnMap.set(col.propertyName, col.databaseName);
      });
      const referenceBy = columnMap.get(by);
      if (!referenceBy) {
        throw new BadRequestException(`Invalid reference for bulk update${by}`);
      }
      const queryColumnMap = new Map<string, { identity: any; val: any }[]>();
      const identities = [];
      for (let i = 0; i < itemLength; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        for (const item of batch) {
          const identity = this.formatValue(item[by]);
          identities.push(identity);

          for (const [col, val] of Object.entries(item)) {
            if (!columnMap.has(col) || col === by || val === undefined)
              continue;

            const dbCol = columnMap.get(col)!;

            if (!queryColumnMap.has(dbCol)) {
              queryColumnMap.set(dbCol, []);
            }

            queryColumnMap
              .get(dbCol)!
              .push({ identity, val: this.formatValue(val, true) });
          }
        }
      }
      const params = [];
      let paramIndex = 0;
      const cases = Array.from(queryColumnMap, ([key, val]) => {
        const cases = val.map((v) => {
          paramIndex++;

          params.push(v.val);

          return ` WHEN ${v.identity} THEN $${paramIndex}`;
        });
        return `${key} = CASE "${referenceBy}" ${cases.join(' ')} ELSE ${key} END`;
      });

      const query = `UPDATE "${this.repository.metadata.tableName}" SET ${cases.join(', ')} WHERE "${referenceBy}" IN (${identities.join(',')})`;
      return await this.repository.query(query, params);
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async updateWithTransaction<T>(
    conditions: FindOptionsWhere<T>,
    updates: QueryDeepPartialEntity<T>,
    target: EntityTarget<T>,
    transactionManager: EntityManager,
  ): Promise<void> {
    try {
      console.log('updates', updates);
      const repository = transactionManager.getRepository(target);
      const columns = repository.metadata.columns;
      console.log('columns', columns);
      const validUpdates = Object.entries(updates).reduce(
        (acc, [key, value]) => {
          if (columns.find((column) => column.propertyName === key)) {
            acc[key] = value;
          }
          return acc;
        },
        {} as QueryDeepPartialEntity<T>,
      );
      await repository.update(conditions, validUpdates);
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

  async softDeleteWithRelations(entity: T): Promise<void> {
    await this.repository.softRemove(entity);
  }

  async restore(where: FindOptionsWhere<T>): Promise<void> {
    await this.repository.restore(where);
  }

  async find(
    whereOption?: FindOptionsWhere<T>,
    selectOption?: FindOptionsSelect<T>,
    orderOptions?: FindOptionsOrder<T>,
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
    options?: FindOptions<T>,
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
    options?: FindOptions<T>,
  ): Promise<PagedList<T>> {
    try {
      const { page, take } = paginationDto;
      const skip = (page - 1) * take;
      const items = await this.repository.find({
        ...options,
        take,
        skip,
      });
      return new PagedList<T>(items, 1000, take, page);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findManyWithBuilderOption(options?: FindOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
    });
  }

  async findOneWithBuilderOption(options?: FindOptions<T>): Promise<T> {
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
