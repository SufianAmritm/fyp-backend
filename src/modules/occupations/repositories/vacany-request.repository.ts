import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { GetVacancyRequestDto } from '../dto/get-vacany-requests.dto';
import { VacancyRequest } from '../entities/vacancy-requests.entity';
import { IVacancyRequestRepository } from './interface/vacancy-requests-repository.interface';

@Injectable()
export class VacancyRequestRepository
  extends BaseRepository<VacancyRequest>
  implements IVacancyRequestRepository
{
  constructor(
    @InjectRepository(VacancyRequest)
    public readonly repository: Repository<VacancyRequest>,
  ) {
    super(repository);
  }

  async findAll(
    getDto: GetVacancyRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<VacancyRequest>> {
    const { search } = getDto;
    const whereOptions: FindOptionsWhere<VacancyRequest> = {};
    const findOption = new FindOptionsBuilder<VacancyRequest>()
      .where(whereOptions)
      .relations({
        occupation: {
          apartment: {
            colony: {
              station: true,
            },
          },
        },
        employee: {
          user: true,
        },
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
