import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import {
  EMPLOYEE_VERIFICATION_STATUS,
  OCCUPATION_STATUS,
} from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { IEmployeeVerificationService } from '../employee-verification/interfaces/employee-verification.interface';
import { Occupation } from '../occupations/entities/occupations.entity';
import { IOccupationService } from '../occupations/interfaces/occupations.interface';
import { CreateApplicationPriorityDto } from './dto/application-colonies/create-applications-priority.dto';
import { CreateApplicationDto } from './dto/applications/create-applications.dto';
import { UpdateApplicationDto } from './dto/applications/update-applications.dto';
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
    @Inject(IEmployeeVerificationService)
    private readonly employeeVerificationService: IEmployeeVerificationService,
    @Inject(IApplicationPriorityRepository)
    private readonly applicationPriorityRepository: IApplicationPriorityRepository,
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly applicationsMapper: Mapper,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const employeeVerification =
      await this.employeeVerificationService.getEmployeeVerificationStatus(
        createApplicationDto.employeeId,
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

    const exists = await this.applicationsRepository.find({
      employeeId: createApplicationDto.employeeId,
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
    const newApplicationPriorities = this.applicationsMapper.mapArray(
      createApplicationDto.colonyPriorities,
      CreateApplicationPriorityDto,
      ApplicationPriority,
    );
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const manager = runner.manager;
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
      throw new InternalServerErrorException(
        error.message || APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(paginationDto: PaginationDto, ctx: AppContext) {
    const result = await this.applicationsRepository.findAll(
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
    result.employee.user.password = undefined;
    if (result.approvedBy) result.approvedBy.password = undefined;
    if (result.rejectedBy) result.rejectedBy.password = undefined;
    if (result.createdBy) result.createdBy.password = undefined;
    return result;
  }

  async update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    userId: number,
  ) {
    const { status } = updateApplicationDto;
    const exists = await this.applicationsRepository.findOne({
      id,
    });
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Application'),
      );
    }
    if (status && exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (status && exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Application',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const manager = runner.manager;
      const applicationsUpdate = this.applicationsMapper.map(
        updateApplicationDto,
        UpdateApplicationDto,
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
      await this.applicationPriorityRepository.deleteWithTransaction(
        {
          applicationId: id,
        },
        ApplicationPriority,
        manager,
      );
      if (updateApplicationDto.colonyPriorities.length > 0) {
        const newApplicationPriorities = this.applicationsMapper.mapArray(
          updateApplicationDto.colonyPriorities,
          CreateApplicationPriorityDto,
          ApplicationPriority,
        );
        newApplicationPriorities.forEach((x) => {
          x.applicationId = id;
        });
        await this.applicationPriorityRepository.bulkCreateWithTransaction(
          newApplicationPriorities,
          ApplicationPriority,
          manager,
        );
      }
      if (
        updateApplicationDto.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED
      ) {
        if (!updateApplicationDto.apartmentId)
          throw new BadRequestException(
            APP_ERROR_MESSAGES.REQUIRED('Apartment'),
          );
        const occupation = await this.occupationService.findOneByApartmentId(
          updateApplicationDto.apartmentId,
        );
        if (occupation.status === OCCUPATION_STATUS.OCCUPIED) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'occupied'),
          );
        }
        if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
          throw new BadRequestException(APP_ERROR_MESSAGES.ABOUT_TO_VACANT);
        }
        await this.applicationsRepository.updateWithTransaction(
          {
            id: occupation.id,
          },
          {
            lastOccupiedOn: new Date(),
            status: OCCUPATION_STATUS.OCCUPIED,
            occupiedById: updateApplicationDto.employeeId,
            assignedById: userId,
          },
          Occupation,
          manager,
        );
      }
      await runner.end();

      return this.findOne(id);
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
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
