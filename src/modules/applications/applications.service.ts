import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATES,
  EMPLOYEE_VERIFICATION_STATUS,
  OCCUPATION_STATUS,
  UserRoles,
} from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { IEmailService } from '../email/interfaces/email.interface';
import { IEmployeeVerificationService } from '../employee-verification/interfaces/employee-verification.interface';
import { Employee } from '../employee/entities/employee.entity';
import { IEmployeeService } from '../employee/interfaces/employee.interface';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { Occupation } from '../occupations/entities/occupations.entity';
import { IOccupationService } from '../occupations/interfaces/occupations.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateApplicationPriorityDto } from './dto/application-colonies/create-applications-priority.dto';
import { CreateApplicationDto } from './dto/applications/create-applications.dto';
import { GetApplicationDto } from './dto/applications/get-applications.dto';
import {
  UpdateApplicationByAdminDto,
  UpdateApplicationDto,
} from './dto/applications/update-applications.dto';
import { ApplicationPriority } from './entities/application-colonies.entity';
import { Application } from './entities/applications.entity';
import { IApplicationService } from './interfaces/applications.interface';
import { IApplicationPriorityRepository } from './repositories/interface/application-priority-repository.interface';
import { IApplicationRepository } from './repositories/interface/applications-repository.interface';

@Injectable()
export class ApplicationService implements IApplicationService {
  constructor(
    @Inject(IApplicationRepository)
    private readonly applicationsRepository: IApplicationRepository,
    @Inject(IOccupationService)
    private readonly occupationService: IOccupationService,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @Inject(IManagersService)
    private readonly managerService: IManagersService,
    @Inject(IEmployeeService)
    private readonly employeeService: IEmployeeService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    @Inject(IEmployeeVerificationService)
    private readonly employeeVerificationService: IEmployeeVerificationService,
    @Inject(IApplicationPriorityRepository)
    private readonly applicationPriorityRepository: IApplicationPriorityRepository,
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly applicationsMapper: Mapper,
  ) {}

  async myApplications(userId: number): Promise<Application[]> {
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const findOptions = new FindOptionsBuilder<Application>()
      .where({ employeeId: employee.id })
      .relations({
        colonyPriorities: {
          colony: true,
        },
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
      await this.applicationsRepository.findManyWithBuilderOption(findOptions);
    res.forEach((result) => {
      if (result?.employee) result.employee.user.password = undefined;
      if (result?.approvedBy) result.approvedBy.password = undefined;
      if (result?.rejectedBy) result.rejectedBy.password = undefined;
      if (result?.createdBy) result.createdBy.password = undefined;
    });
    return res;
  }

  async update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    userId: number,
  ) {
    const employee =
      await this.employeeService.findOneByUserIdWithColonies(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const exists = await this.applicationsRepository.findOne({
      id,
    });
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Application'),
      );
    }
    if (updateApplicationDto.colonyPriorities.length > 0) {
      const runner = await this.transactionFactory.transactionRunner();
      try {
        await runner.start();
        const { manager } = runner;

        const newApplicationPriorities = this.applicationsMapper.mapArray(
          updateApplicationDto.colonyPriorities,
          CreateApplicationPriorityDto,
          ApplicationPriority,
        );
        newApplicationPriorities.forEach((x) => {
          x.applicationId = id;
        });
        const employee = await this.employeeService.findOne(exists.employeeId);

        if (!employee) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Employee'),
          );
        }
        await this.verifyPriorities(
          updateApplicationDto.colonyPriorities,
          employee,
        );
        await this.applicationPriorityRepository.deleteWithTransaction(
          {
            applicationId: id,
          },
          ApplicationPriority,
          manager,
        );
        await this.applicationPriorityRepository.bulkCreateWithTransaction(
          newApplicationPriorities,
          ApplicationPriority,
          manager,
        );
        await runner.end();
        return this.findOne(id);
      } catch (error) {
        if (runner) await runner.rollbackTransaction();
        if (error instanceof HttpException) throw error;

        throw new InternalServerErrorException(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return this.findOne(id);
  }

  async create(createApplicationDto: CreateApplicationDto) {
    const employee = await this.employeeService.findOneByUserIdWithColonies(
      createApplicationDto.createdById,
    );
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const employeeId = employee.id;
    const employeeVerification =
      await this.employeeVerificationService.getEmployeeVerificationStatus(
        employeeId,
      );
    if (!employeeVerification) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_VERIFIED_ENTITY('Employee'),
      );
    }
    if (employeeVerification.status !== EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_VERIFIED_ENTITY('Employee'),
      );
    }

    const occupation =
      await this.occupationService.findOneByOccupiedById(employeeId);
    if (occupation) {
      throw new BadRequestException(
        'You have already occupied an apartment, please create a transfer request, or vacant the house first.',
      );
    }

    await this.verifyPriorities(
      createApplicationDto.colonyPriorities,
      employee,
    );
    const exists = await this.applicationsRepository.find({
      employeeId,
    });
    if (exists.length > 0) {
      const pending = exists.find(
        (x) => x.status === EMPLOYEE_VERIFICATION_STATUS.PENDING,
      );
      if (pending) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_EXISTS('Application in pending state'),
        );
      }
    }
    const newApplication = this.applicationsMapper.map(
      createApplicationDto,
      CreateApplicationDto,
      Application,
    );
    newApplication.employeeId = employeeId;
    const newApplicationPriorities = this.applicationsMapper.mapArray(
      createApplicationDto.colonyPriorities,
      CreateApplicationPriorityDto,
      ApplicationPriority,
    );
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const { manager } = runner;
      const application =
        await this.applicationsRepository.createWithTransaction(
          newApplication,
          Application,
          manager,
        );
      newApplicationPriorities.forEach((x) => {
        x.applicationId = application.id;
      });
      await this.applicationPriorityRepository.bulkCreateWithTransaction(
        newApplicationPriorities,
        ApplicationPriority,
        manager,
      );
      await runner.end();
      return this.findOne(application.id);
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        error.message || APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async verifyPriorities(
    createApplicationPriorityDto: CreateApplicationPriorityDto[],
    employee: Employee,
  ) {
    const colonyIds = createApplicationPriorityDto.map((x) => x.colonyId);
    const colonies = employee.colony.station.colonies.filter((x) =>
      colonyIds.includes(x.id),
    );
    if (colonies.length !== colonyIds.length) {
      throw new BadRequestException(
        "Some colonies selected don't belong to your station.",
      );
    }
  }

  async findAll(
    getApplicationDto: GetApplicationDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ) {
    const result = await this.applicationsRepository.findAll(
      getApplicationDto,
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
    const findOptions = new FindOptionsBuilder<Application>()
      .where({ id })
      .relations({
        colonyPriorities: {
          colony: true,
        },
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
      await this.applicationsRepository.findOneWithBuilderOption(findOptions);
    if (result?.employee) result.employee.user.password = undefined;
    if (result?.approvedBy) result.approvedBy.password = undefined;
    if (result?.rejectedBy) result.rejectedBy.password = undefined;
    if (result?.createdBy) result.createdBy.password = undefined;
    return result;
  }

  async cancel(id: number, userId: number) {
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const findOptions = new FindOptionsBuilder<Application>()
      .where({ id, createdById: userId })
      .build();
    const exists =
      await this.applicationsRepository.findOneWithBuilderOption(findOptions);
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Application'),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    const applicationUpdate = this.applicationsMapper.map(
      {
        status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        reason: 'Cancelled by Employee',
        apartmentId: null,
      },
      UpdateApplicationByAdminDto,
      Application,
    );
    await this.applicationsRepository.update({ id }, applicationUpdate);
    return this.findOne(id);
  }

  async updateByAdmin(
    id: number,
    updateApplicationDto: UpdateApplicationByAdminDto,
    userId: number,
  ) {
    const exists = await this.applicationsRepository.findOne({
      id,
    });
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Application'),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }

    const user = await this.userService.findOneById(userId);
    const employee = await this.employeeService.findOne(exists.employeeId);
    if (!user)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (user.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        user.id,
      );
      const canManagerUpdateApplication = manager.station.colonies.some(
        (colony) =>
          colony.employees.some((emp) => emp.id === exists.employeeId),
      );
      if (!canManagerUpdateApplication) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }

    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const { manager } = runner;
      const applicationsUpdate = this.applicationsMapper.map(
        updateApplicationDto,
        UpdateApplicationByAdminDto,
        Application,
      );
      if (updateApplicationDto.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED)
        applicationsUpdate.approvedById = userId;

      if (updateApplicationDto.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED)
        applicationsUpdate.rejectedById = userId;

      await this.applicationsRepository.updateWithTransaction(
        { id },
        applicationsUpdate,
        Application,
        manager,
      );
      if (
        updateApplicationDto.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED
      ) {
        await this.emailService.send(
          employee.user.email,
          EMAIL_SUBJECTS.APPLICATION_REJECTED,
          EMAIL_TEMPLATES.APPLICATION_REJECTED,
          {
            reason: updateApplicationDto.reason,
            employeeName: employee.user.name,
          },
        );
      }

      if (
        updateApplicationDto.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED
      ) {
        const occupation = await this.occupationService.findOneByApartmentId(
          updateApplicationDto.apartmentId,
        );
        if (!occupation)
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Occupation'),
          );
        if (occupation.status === OCCUPATION_STATUS.OCCUPIED) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'occupied'),
          );
        }
        if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
          throw new BadRequestException(APP_ERROR_MESSAGES.ABOUT_TO_VACANT);
        }
        const employee = await this.employeeService.findOneByUserId(
          exists.createdById,
        );
        if (!employee) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Employee'),
          );
        }
        await this.applicationsRepository.updateWithTransaction(
          {
            id: occupation.id,
          },
          {
            lastOccupiedOn: new Date(),
            status: OCCUPATION_STATUS.OCCUPIED,
            occupiedById: employee.id,
            assignedById: userId,
          },
          Occupation,
          manager,
        );
        await this.emailService.send(
          employee.user.email,
          EMAIL_SUBJECTS.APPLICATION_APPROVED,
          EMAIL_TEMPLATES.APPLICATION_APPROVED,
          {
            reason: updateApplicationDto.reason,
            apartment: {
              employeeName: employee.user.name,
              houseNo: occupation.apartment.houseNo,
              colonyName: occupation.apartment.colony.name,
              streetNo: occupation.apartment.streetNo,
              address: occupation.apartment.address,
            },
          },
        );
      }
      await runner.end();

      return this.findOne(id);
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        error.message || APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    await this.applicationsRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
