import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATES,
  EMPLOYEE_VERIFICATION_STATUS,
  UserRoles,
} from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { IEmailService } from '../email/interfaces/email.interface';
import { IEmployeeService } from '../employee/interfaces/employee.interface';
import { IEventsGateway } from '../events/interface/events.interface';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { IUserNotificationService } from '../notifications/interfaces/user-notification.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateEmployeeVerificationDto } from './dto/create-employee-verification.dto';
import { GetEmployeeVerificationDto } from './dto/get-employee-verification.dto';
import { UpdateEmployeeVerificationByAdminDto } from './dto/update-employee-verification.dto';
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
    @Inject(IManagersService)
    private readonly managerService: IManagersService,
    @Inject(IEmployeeService)
    private readonly employeeService: IEmployeeService,
    @Inject(IUserNotificationService)
    private readonly notificationService: IUserNotificationService,
    @Inject(IEventsGateway)
    private readonly eventGateway: IEventsGateway,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @InjectMapper() private readonly employeeVerificationMapper: Mapper,
  ) {}

  async myVerifications(userId: number): Promise<EmployeeVerification[]> {
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const findOptions = new FindOptionsBuilder<EmployeeVerification>()
      .where({ employeeId: employee.id })
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
      .order({
        createdAt: 'DESC',
      })
      .build();
    const res =
      await this.employeeVerificationRepository.findManyWithBuilderOption(
        findOptions,
      );
    res.forEach((result) => {
      if (result?.employee) result.employee.user.password = undefined;
      if (result?.approvedBy) result.approvedBy.password = undefined;
      if (result?.rejectedBy) result.rejectedBy.password = undefined;
      if (result?.createdBy) result.createdBy.password = undefined;
    });
    return res;
  }

  getEmployeeVerificationStatus(
    employeeId: number,
  ): Promise<EmployeeVerification> {
    const findOptions = new FindOptionsBuilder<EmployeeVerification>()
      .where({
        employeeId,
      })
      .build();
    return this.employeeVerificationRepository.findOneWithBuilderOption(
      findOptions,
    );
  }

  async create(createEmployeeVerificationDto: CreateEmployeeVerificationDto) {
    const employee = await this.employeeService.findOneByUserId(
      createEmployeeVerificationDto.createdById,
    );
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const exists = await this.employeeVerificationRepository.find({
      employeeId: employee.id,
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
    createEmployeeVerificationDto.employeeId = employee.id;
    const newEmployeeVerification = this.employeeVerificationMapper.map(
      createEmployeeVerificationDto,
      CreateEmployeeVerificationDto,
      EmployeeVerification,
    );
    return this.employeeVerificationRepository.create(newEmployeeVerification);
  }

  async findAll(
    getDto: GetEmployeeVerificationDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ) {
    const result = await this.employeeVerificationRepository.findAll(
      getDto,
      paginationDto,
      ctx,
    );
    result.items.forEach((item) => {
      item.employee.user.password = undefined;
      if (item.approvedBy) item.approvedBy.password = undefined;
      if (item.rejectedBy) item.rejectedBy.password = undefined;
      if (item.createdBy) item.createdBy.password = undefined;
    });
    return result;
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
    if (result?.employee) result.employee.user.password = undefined;
    if (result?.approvedBy) result.approvedBy.password = undefined;
    if (result?.rejectedBy) result.rejectedBy.password = undefined;
    if (result?.createdBy) result.createdBy.password = undefined;
    return result;
  }

  async cancel(id: number, userId: number) {
    const findOptions = new FindOptionsBuilder<EmployeeVerification>()
      .where({ id, createdById: userId })

      .build();
    const exists =
      await this.employeeVerificationRepository.findOneWithBuilderOption(
        findOptions,
      );
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Employee Verification'),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    const employeeVerificationUpdate = this.employeeVerificationMapper.map(
      {
        status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        reason: 'Cancelled by Employee',
      },
      UpdateEmployeeVerificationByAdminDto,
      EmployeeVerification,
    );
    await this.employeeVerificationRepository.update(
      { id },
      employeeVerificationUpdate,
    );
    return this.findOne(id);
  }

  async update(
    id: number,
    updateEmployeeVerificationDto: UpdateEmployeeVerificationByAdminDto,
    userId: number,
  ) {
    const findOptions = new FindOptionsBuilder<EmployeeVerification>()
      .where({
        id,
      })
      .relations({
        employee: {
          colony: true,
          user: true,
        },
      })
      .build();
    const exists =
      await this.employeeVerificationRepository.findOneWithBuilderOption(
        findOptions,
      );
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Employee Verification'),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Employee Verification',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    const updator = await this.userService.findOneById(userId);
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        updator.id,
      );
      const canManagerUpdateVerification = manager.station.colonies.some(
        (colony) => colony.id === exists.employee.colonyId,
      );

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const employeeVerificationUpdate = this.employeeVerificationMapper.map(
      updateEmployeeVerificationDto,
      UpdateEmployeeVerificationByAdminDto,
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
    if (
      employeeVerificationUpdate.status ===
      EMPLOYEE_VERIFICATION_STATUS.APPROVED
    ) {
      await this.emailService.send(
        exists.employee.user.email,
        EMAIL_SUBJECTS.EMPLOYEE_VERIFICATION_APPROVED,
        EMAIL_TEMPLATES.EMPLOYEE_VERIFICATION_APPROVED,
        {
          reason: employeeVerificationUpdate.reason,
          employee: {
            name: exists.employee.user.name,
            email: exists.employee.user.email,
            phone: exists.employee.user.phoneNumber,
            colonyName: exists.employee.colony.name,
          },
        },
      );
      await this.notificationService.create({
        userId: exists.employee.user.id,
        title: 'Employee Verification Approved',
        text: 'Your profile has been verified successfully.',
      });
      await this.eventGateway.sendEvent({
        to: exists.employee.userId.toString(),
        pub: 'notification',
        data: {},
      });
    }
    if (
      employeeVerificationUpdate.status ===
      EMPLOYEE_VERIFICATION_STATUS.REJECTED
    ) {
      await this.emailService.send(
        exists.employee.user.email,
        EMAIL_SUBJECTS.EMPLOYEE_VERIFICATION_REJECTED,
        EMAIL_TEMPLATES.EMPLOYEE_VERIFICATION_REJECTED,
        {
          reason: employeeVerificationUpdate.reason,
          employee: {
            name: exists.employee.user.name,
            email: exists.employee.user.email,
            phone: exists.employee.user.phoneNumber,
            colonyName: exists.employee.colony.name,
          },
        },
      );
      await this.notificationService.create({
        userId: exists.employee.user.id,
        title: 'Employee Verification Rejected',
        text: 'Your profile has been rejected.',
      });
      await this.eventGateway.sendEvent({
        to: exists.employee.userId.toString(),
        pub: 'notification',
        data: {},
      });
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.employeeVerificationRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
