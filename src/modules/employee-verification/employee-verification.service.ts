import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { CreateEmployeeVerificationDto } from './dto/create-employee-verification.dto';
import { UpdateEmployeeVerificationDto } from './dto/update-employee-verification.dto';
import { EmployeeVerification } from './entities/employee-verification.entity';
import { IEmployeeVerificationService } from './interfaces/employee-verification.interface';
import { IEmployeeVerificationRepository } from './repositories/interface/employee-verification-repository.interface';

@Injectable()
export class EmployeeVerificationService
  implements IEmployeeVerificationService
{
  constructor(
    @Inject(IEmployeeVerificationRepository)
    private readonly employeeVerificationRepository: IEmployeeVerificationRepository,
    @InjectMapper() private readonly employeeVerificationMapper: Mapper,
  ) {}

  async create(createEmployeeVerificationDto: CreateEmployeeVerificationDto) {
    const exists = await this.employeeVerificationRepository.findOne({
      employeeId: createEmployeeVerificationDto.employeeId,
      status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
    });
    if (exists) {
      throw new Error(
        APP_ERROR_MESSAGES.ALREADY_EXISTS(
          'Employee Verification with pending state',
        ),
      );
    }
    const newEmployeeVerification = this.employeeVerificationMapper.map(
      createEmployeeVerificationDto,
      CreateEmployeeVerificationDto,
      EmployeeVerification,
    );
    return this.employeeVerificationRepository.create(newEmployeeVerification);
  }

  findAll(paginationDto: PaginationDto, ctx: AppContext) {
    return this.employeeVerificationRepository.findAll(paginationDto, ctx);
  }

  findOne(id: number) {
    const findOptions = new FindOptionsBuilder<EmployeeVerification>()
      .where({ id })
      .relations({
        employee: true,
      })
      .build();
    return this.employeeVerificationRepository.findOneWithBuilderOption(
      findOptions,
    );
  }

  async update(
    id: number,
    updateEmployeeVerificationDto: UpdateEmployeeVerificationDto,
  ) {
    const employeeVerificationUpdate = this.employeeVerificationMapper.map(
      updateEmployeeVerificationDto,
      CreateEmployeeVerificationDto,
      EmployeeVerification,
    );
    await this.employeeVerificationRepository.update(
      { id },
      employeeVerificationUpdate,
    );
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.employeeVerificationRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
