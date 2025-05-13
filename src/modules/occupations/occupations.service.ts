import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadGatewayException,
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
import { Apartment } from '../apartment/entities/apartment.entity';
import { IEmailService } from '../email/interfaces/email.interface';
import { Employee } from '../employee/entities/employee.entity';
import { IEmployeeService } from '../employee/interfaces/employee.interface';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { AssignOccupationDto } from './dto/assign-occupation.dto';
import { CreateOccupationDto } from './dto/create-occupations.dto';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { CreateVacancyRequestDto } from './dto/create-vacancy-request.dto';
import { UpdateOccupationDto } from './dto/update-occupations.dto';
import {
  UpdateVacancyRequestByAdminDto,
  UpdateVacancyRequestDto,
} from './dto/update-vacany-request.dto';
import {
  UpdateTransferRequestByAdminDto,
  UpdateTransferRequestDto,
} from './dto/updateTransferRequest.dto';
import { Occupation } from './entities/occupations.entity';
import { TransferRequest } from './entities/transfer-requests.entity';
import { VacancyRequest } from './entities/vacancy-requests.entity';
import { IOccupationService } from './interfaces/occupations.interface';
import { IOccupationRepository } from './repositories/interface/occupations-repository.interface';
import { ITransferRequestRepository } from './repositories/interface/transfer-request-repository.interface';
import { IVacancyRequestRepository } from './repositories/interface/vacancy-requests-repository.interface';

@Injectable()
export class OccupationService implements IOccupationService {
  constructor(
    @Inject(IOccupationRepository)
    private readonly occupationsRepository: IOccupationRepository,
    @Inject(IEmployeeService)
    private readonly employeeService: IEmployeeService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    @Inject(IManagersService)
    private readonly managerService: IManagersService,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @Inject(IVacancyRequestRepository)
    private readonly vacancyRequestRepository: IVacancyRequestRepository,
    @Inject(ITransferRequestRepository)
    private readonly transferRequestRepository: ITransferRequestRepository,
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly occupationsMapper: Mapper,
  ) {}
  async updateTransferRequestByAdmin(
    id: number,
    updateTransferRequestByAdminDto: UpdateTransferRequestByAdminDto,
    userId: number,
  ) {
    const { status } = updateTransferRequestByAdminDto;
    const findOptions = new FindOptionsBuilder<TransferRequest>()
      .where({ id })
      .select({
        fromColony: {
          station: {
            managers: {
              id: true,
              user: {
                id: true,
              },
            },
          },
        },
        toColony: {
          station: {
            managers: {
              id: true,
              user: {
                id: true,
              },
            },
          },
        },
        employee: {
          user: true,
        },
      })
      .relations({
        fromColony: {
          station: {
            managers: {
              user: true,
            },
          },
        },
        toColony: {
          station: {
            managers: {
              user: true,
            },
          },
        },
        employee: {
          user: true,
        },
      })
      .build();
    const transferRequest =
      await this.transferRequestRepository.findOneWithBuilderOption(
        findOptions,
      );

    if (!transferRequest) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.NOT_FOUND('Transfer Request'),
      );
    }

    if (transferRequest.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Transfer Request',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (transferRequest.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Transfer Request',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    if (transferRequest.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Transfer Request',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }

    const colonyFrom = transferRequest.fromColony;
    const colonyTo = transferRequest.toColony;
    const isUserFrom = colonyFrom.station.managers.some(
      (manager) => manager.user.id === userId,
    );
    const isUserTo = colonyTo.station.managers.some(
      (manager) => manager.user.id === userId,
    );
    const user = await this.userService.findOneById(userId);
    const isAdmin = user.role.name === UserRoles.ADMIN;
    if (!isUserFrom && !isUserTo && !isAdmin) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.UNAUTHORIZED);
    }

    const mapped = this.occupationsMapper.map(
      updateTransferRequestByAdminDto,
      UpdateTransferRequestByAdminDto,
      TransferRequest,
    );
    mapped.approvedByFromId = transferRequest.approvedByFromId;
    mapped.approvedByToId = transferRequest.approvedByToId;
    mapped.rejectedByFromId = transferRequest.rejectedByFromId;
    mapped.rejectedByToId = transferRequest.rejectedByToId;
    mapped.status = transferRequest.status;
    if (isUserTo) {
      if (status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        mapped.approvedByToId = userId;
      }
      if (status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
        mapped.rejectedByToId = userId;
      }
    }
    if (isUserFrom) {
      if (status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        mapped.approvedByFromId = userId;
      }
      if (status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
        mapped.rejectedByFromId = userId;
      }
    }
    if (isAdmin) {
      if (status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        mapped.approvedByFromId = userId;
        mapped.approvedByToId = userId;
      }
      if (status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
        mapped.rejectedByFromId = userId;
        mapped.rejectedByToId = userId;
      }
    }
    if (mapped.approvedByFromId && mapped.approvedByToId) {
      mapped.status = EMPLOYEE_VERIFICATION_STATUS.APPROVED;
    }
    if (mapped.rejectedByFromId || mapped.rejectedByToId) {
      mapped.status = EMPLOYEE_VERIFICATION_STATUS.REJECTED;
    }

    const runner = await this.transactionFactory.transactionRunner();

    try {
      await runner.start();
      const manager = runner.manager;
      await this.transferRequestRepository.updateWithTransaction(
        {
          id: transferRequest.id,
        },
        mapped,
        TransferRequest,
        manager,
      );
      let apartment: Apartment = null;
      if (
        mapped.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED &&
        updateTransferRequestByAdminDto.apartmentId &&
        (isAdmin || isUserFrom)
      ) {
        const { apartmentId } = updateTransferRequestByAdminDto;
        if (!apartmentId) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.REQUIRED('apartmentId'),
          );
        }
        const occupation = await this.findOneByApartmentId(
          updateTransferRequestByAdminDto.apartmentId,
        );
        apartment = occupation.apartment;
        if (occupation.apartment.colonyId !== transferRequest.toColonyId) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Apartment'),
          );
        }
        if (occupation.status === OCCUPATION_STATUS.OCCUPIED) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'occupied'),
          );
        }
        if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
          throw new BadRequestException(APP_ERROR_MESSAGES.ABOUT_TO_VACANT);
        }
        const employee = await this.employeeService.findOneByUserId(
          transferRequest.createdById,
        );
        if (!employee) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.NOT_FOUND('Employee'),
          );
        }
        const employeeCurrentOccupation = employee.occupations.find(
          (occupation) => occupation.status === OCCUPATION_STATUS.OCCUPIED,
        );
        await this.transferRequestRepository.updateWithTransaction(
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
        if (employeeCurrentOccupation) {
          await this.transferRequestRepository.updateWithTransaction(
            {
              id: employeeCurrentOccupation.id,
            },
            {
              lastAboutToVacantOn: new Date(),
              status: OCCUPATION_STATUS.ABOUT_TO_VACANT,
              deAssignedById: userId,
            },
            Occupation,
            manager,
          );
        }
        await this.transferRequestRepository.updateWithTransaction<Employee>(
          {
            id: employee.id,
          },
          {
            colonyId: transferRequest.toColonyId,
          },
          Employee,
          manager,
        );
      }
      if (mapped.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
        await this.emailService.send(
          transferRequest.employee.user.email,
          EMAIL_SUBJECTS.TRANSFER_REQUEST_REJECTED,
          EMAIL_TEMPLATES.TRANSFER_REQUEST_REJECTED,
          {
            reason: updateTransferRequestByAdminDto.reason,
            transfer: {
              fromColony: colonyFrom.name,
              toColony: colonyTo.name,
            },
          },
        );
      }
      if (mapped.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        await this.emailService.send(
          transferRequest.employee.user.email,
          EMAIL_SUBJECTS.TRANSFER_REQUEST_APPROVED,
          EMAIL_TEMPLATES.TRANSFER_REQUEST_APPROVED,
          {
            reason: updateTransferRequestByAdminDto.reason,
            transfer: {
              fromColony: colonyFrom.name,
              toColony: colonyTo.name,
              apartment: {
                houseNo: apartment.houseNo,
                streetNo: apartment.streetNo,
                address: apartment.address,
                colonyName: colonyTo.name,
              },
            },
          },
        );
      }
      await runner.end();
      return this.findOneTransferRequest(transferRequest.id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateTransferRequest(
    id: number,
    updateTransferRequestDto: UpdateTransferRequestDto,
    userId: number,
  ) {
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const exists = await this.transferRequestRepository.findOne({
      id,
    });
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Transfer Request'),
      );
    }
    const updates = this.occupationsMapper.map(
      updateTransferRequestDto,
      UpdateTransferRequestDto,
      TransferRequest,
    );
    await this.transferRequestRepository.update({ id }, updates);
    return this.findOneTransferRequest(id);
  }
  async findOneTransferRequest(id: number) {
    const findOptions = new FindOptionsBuilder<TransferRequest>()
      .where({ id })
      .relations({
        createdBy: true,
        approvedByFrom: {
          manager: true,
        },
        employee: {
          user: true,
        },
        approvedByTo: {
          manager: true,
        },
        rejectedByFrom: {
          manager: true,
        },
        rejectedByTo: {
          manager: true,
        },
        fromColony: true,
        toColony: true,
      })
      .build();
    const request =
      await this.transferRequestRepository.findOneWithBuilderOption(
        findOptions,
      );
    if (request.approvedByFrom) request.approvedByFrom.password = undefined;
    if (request.approvedByTo) request.approvedByTo.password = undefined;
    if (request.rejectedByFrom) request.rejectedByFrom.password = undefined;
    if (request.rejectedByTo) request.rejectedByTo.password = undefined;
    if (request.createdBy) request.createdBy.password = undefined;
    if (request.employee) request.employee.user.password = undefined;

    return request;
  }

  async createTransferRequest(
    createTransferRequestDto: CreateTransferRequestDto,
    userId: number,
  ) {
    const findOptions = new FindOptionsBuilder<TransferRequest>()
      .where({ createdById: userId })
      .order({
        createdAt: 'DESC',
      })
      .build();
    const exists =
      await this.transferRequestRepository.findOneWithBuilderOption(
        findOptions,
      );
    if (exists?.status === EMPLOYEE_VERIFICATION_STATUS.PENDING) {
      throw new BadGatewayException(
        'Your vacancy request is still pending. Please wait for the admin to review it.',
      );
    }
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const currentOccupation = await this.occupationsRepository.find({
      occupiedById: employee.id,
    });
    if (currentOccupation.length === 0) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.NOT_FOUND('Occupation'));
    }
    const newTransferRequest = this.occupationsMapper.map(
      createTransferRequestDto,
      CreateTransferRequestDto,
      TransferRequest,
    );
    newTransferRequest.createdById = userId;
    newTransferRequest.employeeId = employee.id;
    if (newTransferRequest.fromColonyId === newTransferRequest.toColonyId) {
      newTransferRequest.withinStation = true;
    }
    return await this.transferRequestRepository.create(newTransferRequest);
  }

  async cancelTransferRequest(id: number, userId: number) {
    const exists = await this.transferRequestRepository.findOne({
      createdById: userId,
      id,
    });
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Transfer Request'),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Transfer Request',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Transfer Request',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Transfer Request',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    const transferRequestUpdate = this.occupationsMapper.map(
      {
        status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        reason: 'Cancelled by Employee',
      },
      UpdateVacancyRequestByAdminDto,
      TransferRequest,
    );
    await this.transferRequestRepository.update({ id }, transferRequestUpdate);
    return this.findOne(id);
  }

  async leaveOccupation(id: number, userId: number) {
    const findOptions = new FindOptionsBuilder<VacancyRequest>()
      .where({
        occupationId: id,
        createdById: userId,
      })
      .order({
        createdAt: 'DESC',
      })
      .build();
    const vacancyRequest =
      await this.vacancyRequestRepository.findOneWithBuilderOption(findOptions);
    if (!vacancyRequest) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.NOT_FOUND('Vacancy Request'),
      );
    }
    if (vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadGatewayException(
        'Your vacancy request has been rejected. Please create a new one or contact the support.',
      );
    }
    if (vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.PENDING) {
      throw new BadGatewayException(
        'Your vacancy request is still pending. Please wait for the admin to review it.',
      );
    }
    if (vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      await this.occupationsRepository.update(
        {
          id,
        },
        {
          status: OCCUPATION_STATUS.VACANT,
          occupiedById: null,
          lastVacantOn: new Date(),
          vacantById: userId,
        },
      );
      return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
    }
  }

  async cancelVacancyRequest(id: number, userId: number) {
    const exists = await this.vacancyRequestRepository.findOne({
      createdById: userId,
      id,
    });
    if (!exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.NOT_FOUND('Vacancy Request'),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Vacancy Request',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Vacancy Request',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
        ),
      );
    }
    if (exists.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Vacancy Request',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    const vacancyRequestUpdate = this.occupationsMapper.map(
      {
        status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        reason: 'Cancelled by Employee',
      },
      UpdateVacancyRequestByAdminDto,
      VacancyRequest,
    );
    await this.vacancyRequestRepository.update({ id }, vacancyRequestUpdate);
    return this.findOne(id);
  }
  async vacantOccupation(userId: number) {
    const employee = await this.employeeService.findOneByUserId(userId);
    const { occupations } = employee;
    const occupation = occupations.find(
      (o) => o.status === OCCUPATION_STATUS.OCCUPIED,
    );
    if (!occupation) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.NOT_FOUND('Occupation'));
    }
    if (!occupation) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.NOT_FOUND('Apartment'));
    }
    if (occupation.occupiedById !== employee.id) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.NOT_OCCUPIED_BY_YOU);
    }

    if (occupation.status === OCCUPATION_STATUS.VACANT) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'vacant'),
      );
    }
    if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'about to vacant'),
      );
    }
    const findOptions = new FindOptionsBuilder<VacancyRequest>()
      .where({
        occupationId: occupation.id,
        status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        createdById: userId,
      })
      .order({
        createdAt: 'DESC',
      })
      .build();
    const exists =
      await this.vacancyRequestRepository.findOneWithBuilderOption(findOptions);
    if (exists) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Apartment',
          'requested for vacancy',
        ),
      );
    }
    const createVacancyRequest = {};
    const newVacancyRequest = this.occupationsMapper.map(
      createVacancyRequest,
      CreateVacancyRequestDto,
      VacancyRequest,
    );
    newVacancyRequest.occupationId = occupation.id;
    newVacancyRequest.createdById = userId;
    await this.vacancyRequestRepository.create(newVacancyRequest);
  }
  async updateVacancyRequest(
    id: number,
    updateVacancyRequestDto: UpdateVacancyRequestByAdminDto,
    userId: number,
  ) {
    const { status } = updateVacancyRequestDto;
    const findOptions = new FindOptionsBuilder<VacancyRequest>()
      .where({
        id,
      })
      .relations({
        employee: {
          user: true,
        },
        occupation: {
          apartment: {
            colony: true,
          },
        },
      })
      .build();
    const vacancyRequest =
      await this.vacancyRequestRepository.findOneWithBuilderOption(findOptions);

    if (!vacancyRequest) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.NOT_FOUND('Vacancy Request'),
      );
    }

    if (vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Vacancy Request',
          EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        ),
      );
    }
    if (vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.CANCELLED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Vacancy Request',
          EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
        ),
      );
    }
    if (vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED(
          'Vacancy Request',
          EMPLOYEE_VERIFICATION_STATUS.REJECTED,
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
      const canManagerUpdateVerification =
        manager.station.colonies.some(
          (colony) => colony.id === vacancyRequest.employee.colonyId,
        ) ||
        manager.station.colonies.some(
          (colony) =>
            colony.id === vacancyRequest.occupation.apartment.colonyId,
        );

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const mapped = this.occupationsMapper.map(
      updateVacancyRequestDto,
      UpdateVacancyRequestDto,
      VacancyRequest,
    );
    const occupation = await this.occupationsRepository.findOne({
      id: vacancyRequest.occupationId,
    });
    const runner = await this.transactionFactory.transactionRunner();
    try {
      if (status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        mapped.approvedById = userId;
        if (occupation.status === OCCUPATION_STATUS.VACANT) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'vacant'),
          );
        }
        if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'about to vacant'),
          );
        }
        await this.occupationsRepository.updateWithTransaction(
          { id: occupation.id },
          {
            lastAboutToVacantOn: new Date(),
            status: OCCUPATION_STATUS.ABOUT_TO_VACANT,
            deAssignedById: userId,
          },
          Occupation,
          runner.manager,
        );
      }
      if (status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
        mapped.rejectedById = userId;
      }
      await this.vacancyRequestRepository.update(
        { id },
        updateVacancyRequestDto,
      );
      if (
        updateVacancyRequestDto.status === EMPLOYEE_VERIFICATION_STATUS.REJECTED
      ) {
        await this.emailService.send(
          vacancyRequest.employee.user.email,
          EMAIL_SUBJECTS.VACANCY_REQUEST_REJECTED,
          EMAIL_TEMPLATES.VACANCY_REQUEST_REJECTED,
          {
            reason: updateVacancyRequestDto.reason,
            apartment: {
              houseNo: vacancyRequest.occupation.apartment.houseNo,
              streetNo: vacancyRequest.occupation.apartment.streetNo,
              address: vacancyRequest.occupation.apartment.address,
              colonyName: vacancyRequest.occupation.apartment.colony.name,
            },
          },
        );
      }
      if (
        updateVacancyRequestDto.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED
      ) {
        await this.emailService.send(
          vacancyRequest.employee.user.email,
          EMAIL_SUBJECTS.VACANCY_REQUEST_APPROVED,
          EMAIL_TEMPLATES.VACANCY_REQUEST_APPROVED,
          {
            reason: updateVacancyRequestDto.reason,
            apartment: {
              houseNo: vacancyRequest.occupation.apartment.houseNo,
              streetNo: vacancyRequest.occupation.apartment.streetNo,
              address: vacancyRequest.occupation.apartment.address,
              colonyName: vacancyRequest.occupation.apartment.colony.name,
            },
          },
        );
      }
      await runner.end();
      return this.findOneVacancyRequest(id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneVacancyRequest(id: number): Promise<VacancyRequest> {
    const findOptions = new FindOptionsBuilder<VacancyRequest>()
      .where({
        id,
      })
      .relations({
        occupation: {
          apartment: true,
        },
        approvedBy: {
          manager: true,
        },
        rejectedBy: {
          manager: true,
        },
        employee: {
          user: true,
        },
        createdBy: {
          manager: true,
        },
      })
      .build();
    const vacancyRequest =
      await this.vacancyRequestRepository.findOneWithBuilderOption(findOptions);
    if (vacancyRequest.approvedBy)
      vacancyRequest.approvedBy.password = undefined;
    if (vacancyRequest.rejectedBy)
      vacancyRequest.rejectedBy.password = undefined;
    if (vacancyRequest.createdBy) vacancyRequest.createdBy.password = undefined;
    if (vacancyRequest.employee)
      vacancyRequest.employee.user.password = undefined;
    return vacancyRequest;
  }
  async findOneByOccupiedById(occupiedById: number): Promise<Occupation> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        occupiedById,
      })
      .relations({
        apartment: true,
        assignedBy: {
          manager: true,
        },
        deAssignedBy: {
          manager: true,
        },
        occupiedBy: {
          user: true,
        },
        vacantBy: {
          user: true,
        },
      })
      .build();

    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);
    if (occupation.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation.vacantBy) occupation.vacantBy.user.password = undefined;
    return occupation;
  }
  async findOneByApartmentId(apartmentId: number): Promise<Occupation> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        apartmentId,
      })
      .relations({
        apartment: {
          colony: true,
        },
        assignedBy: {
          manager: true,
        },
        deAssignedBy: {
          manager: true,
        },
        occupiedBy: {
          user: true,
        },
        vacantBy: {
          user: true,
        },
      })
      .build();

    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);
    if (occupation.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation.vacantBy) occupation.vacantBy.user.password = undefined;
    return occupation;
  }
  async assignOccupation(
    id: number,
    assignOccupationDto: AssignOccupationDto,
    userId: number,
  ): Promise<any> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        id,
      })
      .relations({
        apartment: true,
      })
      .build();
    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);

    if (occupation.status === OCCUPATION_STATUS.OCCUPIED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'occupied'),
      );
    }

    if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.ABOUT_TO_VACANT);
    }
    const employee = await this.employeeService.findOne(
      assignOccupationDto.employeeId,
    );
    const updator = await this.userService.findOneById(userId);
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        updator.id,
      );
      const canManagerUpdateVerification = manager.station.colonies.some(
        (colony) => colony.id === occupation.apartment.colonyId,
      );

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    await this.occupationsRepository.update(
      { id: occupation.id },
      {
        lastOccupiedOn: new Date(),
        status: OCCUPATION_STATUS.OCCUPIED,
        occupiedById: assignOccupationDto.employeeId,
        assignedById: userId,
      },
    );
    await this.emailService.send(
      employee.user.email,
      EMAIL_SUBJECTS.APARTMENT_ASSIGNED,
      EMAIL_TEMPLATES.APARTMENT_ASSIGNED,
      {
        apartment: {
          employeeName: employee.user.name,
          houseNo: occupation.apartment.houseNo,
          colonyName: occupation.apartment.colony.name,
          streetNo: occupation.apartment.streetNo,
          address: occupation.apartment.address,
        },
      },
    );
    return this.findOne(occupation.id);
  }
  async deAssignOccupation(id: number, userId: number): Promise<any> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        id,
      })
      .relations({
        apartment: true,
      })
      .build();
    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);

    if (occupation.status === OCCUPATION_STATUS.VACANT) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'vacant'),
      );
    }
    const employee = await this.employeeService.findOne(
      occupation.occupiedById,
    );
    const updator = await this.userService.findOneById(userId);
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        updator.id,
      );
      const canManagerUpdateVerification = manager.station.colonies.some(
        (colony) => colony.id === occupation.apartment.colonyId,
      );

      if (!canManagerUpdateVerification) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const manager = runner.manager;
      await this.occupationsRepository.updateWithTransaction(
        {
          id: occupation.id,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        },
        {
          status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
          reason: 'Apartment vacant by admin or manager.',
        },
        VacancyRequest,
        manager,
      );
      await this.occupationsRepository.updateWithTransaction(
        { id: occupation.id },
        {
          lastVacantOn: new Date(),
          status: OCCUPATION_STATUS.VACANT,
          vacantById: occupation.occupiedById,
          deAssignedById: userId,
        },
        Occupation,
        manager,
      );
      await this.emailService.send(
        employee.user.email,
        EMAIL_SUBJECTS.APARTMENT_DEASSIGNED,
        EMAIL_TEMPLATES.APARTMENT_DEASSIGNED,
        {
          apartment: {
            employeeName: employee.user.name,
            houseNo: occupation.apartment.houseNo,
            colonyName: occupation.apartment.colony.name,
            streetNo: occupation.apartment.streetNo,
            address: occupation.apartment.address,
          },
        },
      );
      await runner.end();
      return this.findOne(occupation.id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(createOccupationDto: CreateOccupationDto) {
    const newOccupation = this.occupationsMapper.map(
      createOccupationDto,
      CreateOccupationDto,
      Occupation,
    );
    return this.occupationsRepository.create(newOccupation);
  }

  findAll(paginationDto: PaginationDto, ctx: AppContext) {
    return this.occupationsRepository.findAll(paginationDto, ctx);
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        id,
      })
      .relations({
        apartment: true,
        assignedBy: {
          manager: true,
        },
        deAssignedBy: {
          manager: true,
        },
        occupiedBy: {
          user: true,
        },
        vacantBy: {
          user: true,
        },
      })
      .build();

    const occupation =
      await this.occupationsRepository.findOneWithBuilderOption(findOptions);
    if (occupation.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation.vacantBy) occupation.vacantBy.user.password = undefined;
    return occupation;
  }

  async update(id: number, updateOccupationDto: UpdateOccupationDto) {
    const occupationsUpdate = this.occupationsMapper.map(
      updateOccupationDto,
      CreateOccupationDto,
      Occupation,
    );
    await this.occupationsRepository.update({ id }, occupationsUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.occupationsRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
