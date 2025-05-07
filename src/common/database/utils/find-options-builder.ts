import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';
export interface FindOptionsCustom<T> {
  select: FindOptionsSelect<T>;
  where: FindOptionsWhere<T>;
  relations: FindOptionsRelations<T>;
  order: FindOptionsOrder<T>;
}

interface IFindOptionsBuilder<T> {
  select(options?: FindOptionsSelect<T>): FindOptionsBuilder<T>;
  where(options?: FindOptionsWhere<T>): FindOptionsBuilder<T>;
  relation(options?: FindOptionsRelations<T>): FindOptionsBuilder<T>;
  order(options?: FindOptionsOrder<T>): FindOptionsBuilder<T>;
  build(): FindOptionsCustom<T>;
}
export class FindOptionsBuilder<T> implements IFindOptionsBuilder<T> {
  private selectOption: FindOptionsSelect<T>;
  private whereOption: FindOptionsWhere<T>;
  private relationOption: FindOptionsRelations<T>;
  private orderOption: FindOptionsOrder<T>;

  select(options?: FindOptionsSelect<T>): FindOptionsBuilder<T> {
    this.selectOption = options;
    return this;
  }
  where(options?: FindOptionsWhere<T>): FindOptionsBuilder<T> {
    this.whereOption = options;
    return this;
  }
  relation(options?: FindOptionsRelations<T>): FindOptionsBuilder<T> {
    this.relationOption = options;
    return this;
  }
  order(options?: FindOptionsOrder<T>): FindOptionsBuilder<T> {
    this.orderOption = options;
    return this;
  }
  build = (): FindOptionsCustom<T> => ({
    select: this.selectOption || {},
    where: this.whereOption || {},
    relations: this.relationOption || {},
    order: this.orderOption || {},
  });
}
