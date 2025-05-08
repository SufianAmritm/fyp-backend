import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { UpdateEmployeeDto } from '../../employee/dto/update-employee.dto';
import { UpdateManagersDto } from '../../managers/dto/update-managers.dto';
import { User } from '../entities/user.entity';
import { IUserRepository } from './interfaces/user-repository.interface';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor(
    @InjectRepository(User)
    public readonly repository: Repository<User>,
  ) {
    super(repository);
  }

  async findAll(paginationDto: PaginationDto): Promise<PagedList<User>> {
    const findOption = new FindOptionsBuilder<User>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }

  async updateManagerFromUser(
    userId: number,
    dto: UpdateManagersDto,
  ): Promise<void> {
    const { picture, description } = dto;
    let index = 0;
    const params = [];
    let query = `UPDATE managers set `;
    if (picture) {
      query += `picture = $${++index},`;
      params.push(picture);
    }
    if (description) {
      query += `description = $${++index},`;
      params.push(description);
    }
    query.replace(/,$/, '');
    query += ` where user_id = $${++index}`;
    params.push(userId);
    if (index > 1) await this.repository.query(query, params);
    return;
  }

  async updateEmployeeFromUser(
    userId: number,
    dto: UpdateEmployeeDto,
  ): Promise<void> {
    const {
      picture,
      serviceCard,
      cnicBack,
      cnicFront,
      colonyId,
      address,
      members,
      profileComplete,
    } = dto;

    let index = 0;
    const params = [];
    let query = `UPDATE employees set `;
    if (picture) {
      query += `picture = $${++index},`;
      params.push(picture);
    }
    if (serviceCard) {
      query += `service_card = $${++index},`;
      params.push(serviceCard);
    }
    if (cnicBack) {
      query += `cnic_back = $${++index},`;
      params.push(cnicBack);
    }
    if (cnicFront) {
      query += `cnic_front = $${++index},`;
      params.push(cnicFront);
    }
    if (colonyId) {
      query += `colony_id = $${++index},`;
      params.push(colonyId);
    }
    if (address) {
      query += `address = $${++index},`;
      params.push(address);
    }
    if (members) {
      query += `members = $${++index},`;
      params.push(members);
    }
    if (profileComplete) {
      query += `profile_complete = $${++index},`;
      params.push(profileComplete);
    }
    query.replace(/,$/, '');
    query += ` where user_id = $${++index}`;
    params.push(userId);
    if (index > 1) await this.repository.query(query, params);
    return;
  }
}
