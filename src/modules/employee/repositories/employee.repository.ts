import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { Employee } from '../entities/employee.entity';
import { IEmployeeRepository } from './interface/employee-repository.interface';

@Injectable()
export class EmployeeRepository
  extends BaseRepository<Employee>
  implements IEmployeeRepository
{
  constructor(
    @InjectRepository(Employee)
    public readonly repository: Repository<Employee>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Employee>> {
    const findOption = new FindOptionsBuilder<Employee>()
      .where({
        deletedAt: null,
      })
      .relations({
        user: true,
        colony: {
          station: true,
        },
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
