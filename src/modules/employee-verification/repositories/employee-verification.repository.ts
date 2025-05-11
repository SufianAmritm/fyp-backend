import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { EmployeeVerification } from '../entities/employee-verification.entity';
import { IEmployeeVerificationRepository } from './interface/employee-verification-repository.interface';

@Injectable()
export class EmployeeVerificationRepository
  extends BaseRepository<EmployeeVerification>
  implements IEmployeeVerificationRepository
{
  constructor(
    @InjectRepository(EmployeeVerification)
    public readonly repository: Repository<EmployeeVerification>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<EmployeeVerification>> {
    const findOption = new FindOptionsBuilder<EmployeeVerification>()
      .where({
        deletedAt: null,
      })
      .relations({
        employee: {
          user: true,
        },
        approvedBy: true,
        rejectedBy: true,
        createdBy: true,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
