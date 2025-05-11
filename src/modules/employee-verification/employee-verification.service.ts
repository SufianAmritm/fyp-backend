import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
    const exists = await this.employeeVerificationRepository.find({
      employeeId: createEmployeeVerificationDto.employeeId,
    });
    if (exists.length > 0) {
      const pending = exists.find(
        (x) => x.status === EMPLOYEE_VERIFICATION_STATUS.PENDING,
      );
      if (pending) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_EXISTS(
            'Employee Verification in pending state',
          ),
        );
      }
      const approved = exists.find(
        (x) => x.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED,
      );
      if (approved) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_ACTIONED(
            'Employee Verification',
            EMPLOYEE_VERIFICATION_STATUS.APPROVED,
          ),
        );
      }
    }
    const newEmployeeVerification = this.employeeVerificationMapper.map(
      createEmployeeVerificationDto,
      CreateEmployeeVerificationDto,
      EmployeeVerification,
    );
    return this.employeeVerificationRepository.create(newEmployeeVerification);
  }

  async findAll(paginationDto: PaginationDto, ctx: AppContext) {
    const result = await this.employeeVerificationRepository.findAll(
      paginationDto,
      ctx,
    );
    result.items.forEach((item) => {
      item.employee.user.password = undefined;
      if (item.approvedBy) item.approvedBy.password = undefined;
      if (item.rejectedBy) item.rejectedBy.password = undefined;
      if (item.createdBy) item.createdBy.password = undefined;
    });
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<EmployeeVerification>()
      .where({ id })
      .relations({
        employee: {
          user: true,
        },
        approvedBy: {
          manager: true,
        },
        rejectedBy: {
          manager: true,
        },
        createdBy: {
          manager: true,
        },
      })
      .build();
    const result =
      await this.employeeVerificationRepository.findOneWithBuilderOption(
        findOptions,
      );
    result.employee.user.password = undefined;
    if (result.approvedBy) result.approvedBy.password = undefined;
    if (result.rejectedBy) result.rejectedBy.password = undefined;
    if (result.createdBy) result.createdBy.password = undefined;
    return result;
  }

  async update(
    id: number,
    updateEmployeeVerificationDto: UpdateEmployeeVerificationDto,
    userId: number,
  ) {
    const { status } = updateEmployeeVerificationDto;
    const exists = await this.employeeVerificationRepository.findOne({
      id,
    });
    if (status && exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (status && exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    const employeeVerificationUpdate = this.employeeVerificationMapper.map(
      updateEmployeeVerificationDto,
      UpdateEmployeeVerificationDto,
      EmployeeVerification,
    );
    if (
      employeeVerificationUpdate.status ===
      EMPLOYEE_VERIFICATION_STATUS.APPROVED
    ) {
      employeeVerificationUpdate.approvedById = userId;
    }
    if (
      employeeVerificationUpdate.status ===
      EMPLOYEE_VERIFICATION_STATUS.REJECTED
    ) {
      employeeVerificationUpdate.rejectedById = userId;
    }
    await this.employeeVerificationRepository.update(
      { id },
      employeeVerificationUpdate,
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.employeeVerificationRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
