import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { EmployeeProfileCompleteColumns } from '../../../common/constants';
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
    const updates = [];
    let query = `UPDATE managers set `;
    if (picture) {
      updates.push(`picture = $${++index}`);
      params.push(picture);
    }
    if (description) {
      updates.push(`description = $${++index}`);
      params.push(description);
    }
    query += updates.join(', ');
    query = query.replace(/,\s*$/, '');
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
      stationId,
      address,
      members,
      profileComplete,
    } = dto;

    let index = 0;
    const params = [];
    const updates = [];
    let query = `UPDATE employees set `;
    if (picture) {
      updates.push(`picture = $${++index}`);
      params.push(picture);
    }
    if (serviceCard) {
      updates.push(`service_card = $${++index}`);
      params.push(serviceCard);
    }
    if (cnicBack) {
      updates.push(`cnic_back = $${++index}`);
      params.push(cnicBack);
    }
    if (cnicFront) {
      updates.push(`cnic_front = $${++index}`);
      params.push(cnicFront);
    }
    if (stationId) {
      updates.push(`station_id = $${++index}`);
      params.push(stationId);
    }
    if (address) {
      updates.push(`address = $${++index}`);
      params.push(address);
    }
    if (members) {
      updates.push(`members = $${++index}`);
      params.push(members);
    }
    if (profileComplete) {
      updates.push(`profile_complete = $${++index}`);
      params.push(profileComplete);
    }
    query += updates.join(', ');
    query = query.replace(/,\s*$/, '');
    query += ` where user_id = $${++index}`;
    params.push(userId);
    if (index > 1) await this.repository.query(query, params);
    return;
  }

  async isEmployeeProfileComplete(userId: number): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id: userId },
      relations: { employee: true },
    });

    return Object.entries(user.employee)
      .filter(([key, _]) => EmployeeProfileCompleteColumns.includes(key))
      .every(
        ([_, value]) => value !== '' && value !== null && value !== undefined,
      );
  }
}
