import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { GetApartmentDto } from '../dto/request/get.dto';
import { Apartment } from '../entities/apartment.entity';
import { IApartmentRepository } from './interface/apartment-repository.interface';

@Injectable()
export class ApartmentRepository
  extends BaseRepository<Apartment>
  implements IApartmentRepository
{
  constructor(
    @InjectRepository(Apartment)
    public readonly repository: Repository<Apartment>,
  ) {
    super(repository);
  }

  async findAll(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Apartment>> {
    const { search } = getApartmentDto;
    const whereOptions: FindOptionsWhere<Apartment> = {};
    search && (whereOptions.houseNo = `%${ILike(search)}%`);
    const findOption = new FindOptionsBuilder<Apartment>()
      .where(whereOptions)
      .relations({
        colony: {
          station: true,
        },
        occupation: true,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
