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
import { In, LessThanOrEqual } from 'typeorm';
import { RESPONSE_MESSAGES } from '../../common/constants';
import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATES,
  EMPLOYEE_VERIFICATION_STATUS,
  HISTORY_TYPE,
  OCCUPATION_STATUS,
  UserRoles,
} from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { PagedList } from '../../common/types/paged-list';
import { Apartment } from '../apartment/entities/apartment.entity';
import { IColonyService } from '../colony/interfaces/colony.interface';
import { IEmailService } from '../email/interfaces/email.interface';
import { Employee } from '../employee/entities/employee.entity';
import { IEmployeeService } from '../employee/interfaces/employee.interface';
import { IEventsGateway } from '../events/interface/events.interface';
import { History } from '../history/entities/history.entity';
import { IHistoryService } from '../history/interfaces/history.interface';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { IUserNotificationService } from '../notifications/interfaces/user-notification.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { AssignOccupationDto } from './dto/assign-occupation.dto';
import { CreateOccupationDto } from './dto/create-occupations.dto';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { CreateVacancyRequestDto } from './dto/create-vacancy-request.dto';
import { GetTransferRequestDto } from './dto/get-transfer-requests.dto';
import { GetVacancyRequestDto } from './dto/get-vacany-requests.dto';
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
    @Inject(IColonyService)
    private readonly colonyService: IColonyService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    @Inject(IHistoryService)
    private readonly historyService: IHistoryService,
    @Inject(IUserNotificationService)
    private readonly notificationService: IUserNotificationService,
    @Inject(IEventsGateway)
    private readonly eventGateway: IEventsGateway,
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

  async findMyOccupations(userId: number): Promise<Occupation[]> {
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        occupiedById: employee.id,
        status: In([
          OCCUPATION_STATUS.OCCUPIED,
          OCCUPATION_STATUS.ABOUT_TO_VACANT,
        ]),
      })
      .relations({
        apartment: {
          colony: {
            station: {
              division: true,
            },
          },
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

    const occupations =
      await this.occupationsRepository.findManyWithBuilderOption(findOptions);
    occupations.forEach((occupation) => {
      if (occupation?.assignedBy) occupation.assignedBy.password = undefined;
      if (occupation?.deAssignedBy)
        occupation.deAssignedBy.password = undefined;
      if (occupation?.occupiedBy)
        occupation.occupiedBy.user.password = undefined;
      if (occupation?.vacantBy) occupation.vacantBy.user.password = undefined;
    });
    return occupations;
  }

  async findMyVacancyRequests(
    getDto: GetVacancyRequestDto,
    paginationDto: PaginationDto,
    context: AppContext,
  ): Promise<PagedList<VacancyRequest>> {
    const employee = await this.employeeService.findOneByUserId(context.UserId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const vacancyRequests = await this.vacancyRequestRepository.findAll(
      getDto,
      paginationDto,
      context,
    );
    vacancyRequests.items.forEach((vacancyRequest) => {
      if (vacancyRequest?.approvedBy)
        vacancyRequest.approvedBy.password = undefined;
      if (vacancyRequest?.rejectedBy)
        vacancyRequest.rejectedBy.password = undefined;
      if (vacancyRequest?.createdBy)
        vacancyRequest.createdBy.password = undefined;
      if (vacancyRequest?.employee)
        vacancyRequest.employee.user.password = undefined;
    });

    return vacancyRequests;
  }

  async findMyTransferRequests(userId: number): Promise<TransferRequest[]> {
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const findOptions = new FindOptionsBuilder<TransferRequest>()
      .where({ employeeId: employee.id })
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
      .order({
        createdAt: 'DESC',
      })
      .build();
    const res =
      await this.transferRequestRepository.findManyWithBuilderOption(
        findOptions,
      );
    res.forEach((request) => {
      if (request?.approvedByFrom) request.approvedByFrom.password = undefined;
      if (request?.approvedByTo) request.approvedByTo.password = undefined;
      if (request?.rejectedByFrom) request.rejectedByFrom.password = undefined;
      if (request?.rejectedByTo) request.rejectedByTo.password = undefined;
      if (request?.createdBy) request.createdBy.password = undefined;
      if (request?.employee) request.employee.user.password = undefined;
    });
    return res;
  }

  async bulkUpdate(updates: Occupation[]) {
    await this.occupationsRepository.bulkUpdate(updates, 'id', 10);
    const creates = updates.map((u) => ({
      type: HISTORY_TYPE.APARTMENT,
      text: `Apartment left by ${u.occupiedBy.user.email}.`,
      apartmentId: u.apartmentId,
    }));
    await this.historyService.bulkCreate(creates);
  }

  findAllForCronJob(days: Date): Promise<Occupation[]> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        status: OCCUPATION_STATUS.ABOUT_TO_VACANT,
        lastAboutToVacantOn: LessThanOrEqual(days),
      })
      .relations({
        occupiedBy: {
          user: true,
        },
      })
      .build();
    return this.occupationsRepository.findManyWithBuilderOption(findOptions);
  }

  async findAllTransferRequest(
    getDto: GetTransferRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<TransferRequest>> {
    const transferRequests = await this.transferRequestRepository.findAll(
      getDto,
      paginationDto,
      ctx,
    );
    transferRequests.items.forEach((item) => {
      item.employee.user.password = undefined;
    });
    return transferRequests;
  }

  async findAllVacancyRequest(
    getDto: GetVacancyRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<VacancyRequest>> {
    const vacancyRequests = await this.vacancyRequestRepository.findAll(
      getDto,
      paginationDto,
      ctx,
    );
    vacancyRequests.items.forEach((item) => {
      item.employee.user.password = undefined;
    });
    return vacancyRequests;
  }

  async updateTransferRequestByAdmin(
    id: number,
    updateTransferRequestByAdminDto: UpdateTransferRequestByAdminDto,
    userId: number,
  ) {
    const { status } = updateTransferRequestByAdminDto;
    const findOptions = new FindOptionsBuilder<TransferRequest>()
      .where({ id })
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
        if (!updateTransferRequestByAdminDto.apartmentId) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.REQUIRED('Apartment'),
          );
        }
        mapped.cacheApartmentId = updateTransferRequestByAdminDto.apartmentId;
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
      const { manager } = runner;
      await this.transferRequestRepository.updateWithTransaction(
        {
          id: transferRequest.id,
        },
        mapped,
        TransferRequest,
        manager,
      );
      let apartment: Apartment = null;
      if (mapped.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        const { apartmentId } = updateTransferRequestByAdminDto;
        const actualApartmentId =
          transferRequest.cacheApartmentId || apartmentId;
        if (!actualApartmentId) {
          throw new BadRequestException(
            APP_ERROR_MESSAGES.REQUIRED('Apartment'),
          );
        }
        const occupation = await this.findOneByApartmentId(actualApartmentId);
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
            deAssignedById: null,
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
              assignedById: null,
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
        await this.transferRequestRepository.createWithTransaction<History>(
          {
            type: HISTORY_TYPE.EMPLOYEE,
            text: `Transfer Request #${transferRequest.uId} approved by ${user.name} and assigned house ${apartment.houseNo} in colony ${apartment.colony.name}`,
            employeeId: employee.id,
          },
          History,
          manager,
        );
        await this.transferRequestRepository.createWithTransaction<History>(
          {
            type: HISTORY_TYPE.APARTMENT,
            text: `Apartment assigned in colony ${apartment.colony.name}, address: ${apartment.address}.`,
            apartmentId: apartment.id,
          },
          History,
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
            uid: transferRequest.uId,
            transfer: {
              fromColony: colonyFrom.name,
              toColony: colonyTo.name,
            },
          },
        );
        await this.notificationService.create({
          userId: transferRequest.createdById,
          title: 'Transfer Request Rejected',
          text: `Your transfer request #${transferRequest.uId} has been rejected.`,
        });
        await this.eventGateway.sendEvent({
          to: transferRequest.createdById.toString(),
          pub: 'notification',
          data: {},
        });
        await this.historyService.create({
          type: HISTORY_TYPE.EMPLOYEE,
          text: `Transfer Request #${transferRequest.uId} Rejected by ${user.name}`,
          employeeId: transferRequest.employee.id,
        });
      }
      if (mapped.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        await this.emailService.send(
          transferRequest.employee.user.email,
          EMAIL_SUBJECTS.TRANSFER_REQUEST_APPROVED,
          EMAIL_TEMPLATES.TRANSFER_REQUEST_APPROVED,
          {
            reason: updateTransferRequestByAdminDto.reason,
            uid: transferRequest.uId,
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
        await this.notificationService.create({
          userId: transferRequest.createdById,
          title: 'Transfer Request Approved',
          text: `Your transfer request #${transferRequest.uId} has been approved.`,
        });
        await this.eventGateway.sendEvent({
          to: transferRequest.createdById.toString(),
          pub: 'notification',
          data: {},
        });
      }
      await runner.end();
      return this.findOneTransferRequest(transferRequest.id);
    } catch (error) {
      console.error(error);
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
    if (request?.approvedByFrom) request.approvedByFrom.password = undefined;
    if (request?.approvedByTo) request.approvedByTo.password = undefined;
    if (request?.rejectedByFrom) request.rejectedByFrom.password = undefined;
    if (request?.rejectedByTo) request.rejectedByTo.password = undefined;
    if (request?.createdBy) request.createdBy.password = undefined;
    if (request?.employee) request.employee.user.password = undefined;

    return request;
  }

  async createTransferRequest(
    createTransferRequestDto: CreateTransferRequestDto,
    userId: number,
  ) {
    const toColony = await this.colonyService.findOne(
      createTransferRequestDto.toColonyId,
    );
    if (!toColony) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Colony'));
    }

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
        'Your transfer request is still pending. Please wait for the admin to review it, or cancel it if you want.',
      );
    }
    const employee = await this.employeeService.findOneByUserId(userId);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const findOptionsOccupation = new FindOptionsBuilder<Occupation>()
      .where({
        occupiedById: employee.id,
        status: OCCUPATION_STATUS.OCCUPIED,
      })
      .relations({
        apartment: {
          colony: true,
        },
      })
      .build();
    const currentOccupation =
      await this.occupationsRepository.findOneWithBuilderOption(
        findOptionsOccupation,
      );
    if (!currentOccupation) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.NOT_FOUND('Occupation'));
    }
    const newTransferRequest = this.occupationsMapper.map(
      createTransferRequestDto,
      CreateTransferRequestDto,
      TransferRequest,
    );
    const randomId = Math.floor(Math.random() * 1000000).toString();

    newTransferRequest.createdById = userId;
    newTransferRequest.employeeId = employee.id;
    newTransferRequest.fromColonyId = currentOccupation.apartment.colonyId;
    newTransferRequest.uId = randomId;
    if (newTransferRequest.fromColonyId === newTransferRequest.toColonyId) {
      newTransferRequest.withinStation = true;
    }
    if (currentOccupation.apartment.colony.stationId === toColony.stationId) {
      newTransferRequest.withinStation = true;
    }
    const req = await this.transferRequestRepository.create(newTransferRequest);
    await this.historyService.create({
      type: HISTORY_TYPE.EMPLOYEE,
      text: `Transfer Request #${randomId} Created`,
      employeeId: employee.id,
    });
    return req;
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
      UpdateTransferRequestByAdminDto,
      TransferRequest,
    );
    await this.transferRequestRepository.update({ id }, transferRequestUpdate);
    await this.historyService.create({
      type: HISTORY_TYPE.EMPLOYEE,
      text: `Transfer Request #${exists.uId} cancelled`,
      employeeId: exists.employeeId,
    });
    return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
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
      .relations({
        occupation: {
          apartment: {
            colony: true,
          },
        },
        createdBy: true,
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
        'Your vacancy request is still pending. Please wait for the admin to review it, or cancel it if you want.',
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
          vacantById: vacancyRequest.employeeId,
        },
      );
      await this.historyService.create({
        type: HISTORY_TYPE.EMPLOYEE,
        text: `Apartment with house no ${vacancyRequest.occupation.apartment.houseNo}in colony ${vacancyRequest.occupation.apartment.colony.name} has been left.`,
        employeeId: vacancyRequest.employeeId,
      });
      await this.historyService.create({
        type: HISTORY_TYPE.APARTMENT,
        text: `Apartment left by ${vacancyRequest.createdBy.email}.`,
        apartmentId: vacancyRequest.occupation.apartmentId,
      });
      return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
    }
    return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
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
    await this.historyService.create({
      type: HISTORY_TYPE.EMPLOYEE,
      text: `Vacancy Request #${exists.uId} cancelled`,
      employeeId: exists.employeeId,
    });
    return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
  }

  async vacantOccupation(
    userId: number,
    createVacancyRequestDto: CreateVacancyRequestDto,
  ) {
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
    const randomId = Math.floor(Math.random() * 1000000).toString();
    newVacancyRequest.occupationId = occupation.id;
    newVacancyRequest.createdById = userId;
    newVacancyRequest.employeeId = employee.id;
    newVacancyRequest.vacancyReason = createVacancyRequestDto.reason;
    newVacancyRequest.uId = randomId;
    const request =
      await this.vacancyRequestRepository.create(newVacancyRequest);
    await this.historyService.create({
      type: HISTORY_TYPE.EMPLOYEE,
      text: `Vacancy Request #${newVacancyRequest.uId} created for apartment with house no ${occupation.apartment.houseNo} in colony ${employee.colony.name}`,
      employeeId: exists.employeeId,
    });
    return this.findOneVacancyRequest(request.id);
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
      await runner.start();
      const { manager } = runner;
      if (status === EMPLOYEE_VERIFICATION_STATUS.APPROVED) {
        mapped.approvedById = userId;
        mapped.status = EMPLOYEE_VERIFICATION_STATUS.APPROVED;
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
            assignedById: null,
          },
          Occupation,
          manager,
        );
      }
      if (status === EMPLOYEE_VERIFICATION_STATUS.REJECTED) {
        mapped.rejectedById = userId;
        mapped.status = EMPLOYEE_VERIFICATION_STATUS.REJECTED;
      }
      await this.vacancyRequestRepository.updateWithTransaction(
        { id },
        mapped,
        VacancyRequest,
        manager,
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
            uid: vacancyRequest.uId,
            apartment: {
              houseNo: vacancyRequest.occupation.apartment.houseNo,
              streetNo: vacancyRequest.occupation.apartment.streetNo,
              address: vacancyRequest.occupation.apartment.address,
              colonyName: vacancyRequest.occupation.apartment.colony.name,
            },
          },
        );
        await this.notificationService.create({
          userId: vacancyRequest.createdById,
          title: 'Vacancy Request Rejected',
          text: `Your vacancy request #${vacancyRequest.uId} has been rejected.`,
        });
        await this.eventGateway.sendEvent({
          to: vacancyRequest.createdById.toString(),
          pub: 'notification',
          data: {},
        });
        await this.historyService.create({
          type: HISTORY_TYPE.EMPLOYEE,
          text: `Vacancy Request #${vacancyRequest.uId} rejected for apartment with house no ${vacancyRequest.occupation.apartment.houseNo} in colony ${vacancyRequest.occupation.apartment.colony.name}`,
          employeeId: vacancyRequest.employeeId,
        });
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
            uid: vacancyRequest.uId,
            apartment: {
              houseNo: vacancyRequest.occupation.apartment.houseNo,
              streetNo: vacancyRequest.occupation.apartment.streetNo,
              address: vacancyRequest.occupation.apartment.address,
              colonyName: vacancyRequest.occupation.apartment.colony.name,
            },
          },
        );
        await this.notificationService.create({
          userId: vacancyRequest.createdById,
          title: 'Vacancy Request Approved',
          text: `Your vacancy request #${vacancyRequest.uId} has been approved.`,
        });
        await this.eventGateway.sendEvent({
          to: vacancyRequest.createdById.toString(),
          pub: 'notification',
          data: {},
        });
        await this.historyService.create({
          type: HISTORY_TYPE.EMPLOYEE,
          text: `Vacancy Request #${vacancyRequest.uId} approved for apartment with house no ${vacancyRequest.occupation.apartment.houseNo} in colony ${vacancyRequest.occupation.apartment.colony.name}`,
          employeeId: vacancyRequest.employeeId,
        });
      }
      await runner.end();
      return this.findOneVacancyRequest(id);
    } catch (error) {
      console.error(error);
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
    if (vacancyRequest?.approvedBy)
      vacancyRequest.approvedBy.password = undefined;
    if (vacancyRequest?.rejectedBy)
      vacancyRequest.rejectedBy.password = undefined;
    if (vacancyRequest?.createdBy)
      vacancyRequest.createdBy.password = undefined;
    if (vacancyRequest?.employee)
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
    if (occupation?.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation?.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation?.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation?.vacantBy) occupation.vacantBy.user.password = undefined;
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
    if (occupation?.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation?.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation?.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation?.vacantBy) occupation.vacantBy.user.password = undefined;
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
        apartment: {
          colony: true,
        },
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
    const employee =
      await this.employeeService.findOneWithOccupationsAndRequests(
        assignOccupationDto.employeeId,
      );
    const employeeOccupations = employee.occupations;
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
      const { manager } = runner;
      await this.occupationsRepository.updateWithTransaction(
        { id: occupation.id },
        {
          lastOccupiedOn: new Date(),
          status: OCCUPATION_STATUS.OCCUPIED,
          occupiedById: assignOccupationDto.employeeId,
          assignedById: userId,
          deAssignedById: null,
        },
        Occupation,
        manager,
      );
      const employeeCurrentOccupation = employeeOccupations.find(
        (occupation) => occupation.status === OCCUPATION_STATUS.OCCUPIED,
      );
      if (employeeCurrentOccupation) {
        await this.occupationsRepository.updateWithTransaction(
          { id: employeeCurrentOccupation.id },
          {
            lastVacantOn: new Date(),
            status: OCCUPATION_STATUS.VACANT,
            occupiedById: null,
            deAssignedById: userId,
            assignedById: null,
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
              houseNo: employeeCurrentOccupation.apartment.houseNo,
              colonyName: employeeCurrentOccupation.apartment.colony.name,
              streetNo: employeeCurrentOccupation.apartment.streetNo,
              address: employeeCurrentOccupation.apartment.address,
            },
          },
        );
        await this.notificationService.create({
          userId: employee.userId,
          title: 'Apartment Deassigned',
          text: `You have been deassigned from an apartment in ${employeeCurrentOccupation.apartment.colony.name}, ${employeeCurrentOccupation.apartment.address}.`,
        });
        await this.eventGateway.sendEvent({
          to: employee.userId.toString(),
          pub: 'notification',
          data: {},
        });
        await this.historyService.create({
          type: HISTORY_TYPE.EMPLOYEE,
          text: `Apartment Deassigned in colony ${employeeCurrentOccupation.apartment.colony.name}, address: ${employeeCurrentOccupation.apartment.address}.`,
          employeeId: employee.id,
        });
        await this.historyService.create({
          type: HISTORY_TYPE.APARTMENT,
          text: `Apartment left by ${employee.user.email}.`,
          apartmentId: employeeCurrentOccupation.apartment.id,
        });
      }
      const pendingVacancyRequest = employee.vacancyRequests.find(
        (vacancyRequest) =>
          vacancyRequest.status === EMPLOYEE_VERIFICATION_STATUS.PENDING,
      );
      if (pendingVacancyRequest) {
        await this.vacancyRequestRepository.updateWithTransaction(
          { id: pendingVacancyRequest.id },
          {
            status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
            reason:
              'Admin directly assigned user an apartment, leading to any existing vacancy requests being cancelled.',
          },
          VacancyRequest,
          manager,
        );
        await this.emailService.send(
          employee.user.email,
          EMAIL_SUBJECTS.VACANCY_REQUEST_REJECTED,
          EMAIL_TEMPLATES.VACANCY_REQUEST_REJECTED,
          {
            reason:
              'Admin directly assigned user an apartment, leading to any existing vacancy requests being cancelled.',
            uid: pendingVacancyRequest.uId,
            apartment: {
              houseNo: pendingVacancyRequest.occupation.apartment.houseNo,
              streetNo: pendingVacancyRequest.occupation.apartment.streetNo,
              address: pendingVacancyRequest.occupation.apartment.address,
              colonyName:
                pendingVacancyRequest.occupation.apartment.colony.name,
            },
          },
        );
        await this.notificationService.create({
          userId: pendingVacancyRequest.createdById,
          title: 'Vacancy Request Rejected',
          text: `Your vacancy request #${pendingVacancyRequest.uId} has been rejected.`,
        });
        await this.eventGateway.sendEvent({
          to: pendingVacancyRequest.createdById.toString(),
          pub: 'notification',
          data: {},
        });
        await this.historyService.create({
          type: HISTORY_TYPE.EMPLOYEE,
          text: `Vacancy Request #${pendingVacancyRequest.uId} rejected by ${updator.name} with email: ${updator.email}.`,
          employeeId: employee.id,
        });
      }
      const pendingTransferRequest = employee.transferRequests.find(
        (transferRequest) =>
          transferRequest.status === EMPLOYEE_VERIFICATION_STATUS.PENDING,
      );
      if (pendingTransferRequest) {
        await this.vacancyRequestRepository.updateWithTransaction(
          { id: pendingTransferRequest.id },
          {
            status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
            reason:
              'Admin directly assigned user an apartment, leading to any existing transfer requests being cancelled.',
          },
          TransferRequest,
          manager,
        );
        await this.emailService.send(
          pendingTransferRequest.employee.user.email,
          EMAIL_SUBJECTS.TRANSFER_REQUEST_REJECTED,
          EMAIL_TEMPLATES.TRANSFER_REQUEST_REJECTED,
          {
            reason:
              'Admin directly assigned user an apartment, leading to any existing transfer requests being cancelled.',
            uid: pendingTransferRequest.uId,
            transfer: {
              fromColony: pendingTransferRequest.fromColony.name,
              toColony: pendingTransferRequest.toColony.name,
            },
          },
        );
        await this.notificationService.create({
          userId: pendingTransferRequest.createdById,
          title: 'Transfer Request Rejected',
          text: `Your transfer request #${pendingTransferRequest.uId} has been rejected.`,
        });
        await this.eventGateway.sendEvent({
          to: pendingTransferRequest.createdById.toString(),
          pub: 'notification',
          data: {},
        });
        await this.historyService.create({
          type: HISTORY_TYPE.EMPLOYEE,
          text: `Transfer Request #${pendingTransferRequest.uId} rejected by ${updator.name} with email: ${updator.email}.`,
          employeeId: employee.id,
        });
      }
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
      await this.notificationService.create({
        userId: employee.userId,
        title: 'Apartment Assigned',
        text: `You have been assigned an apartment #${occupation.apartment.houseNo} in ${occupation.apartment.colony.name} colony.`,
      });
      await this.eventGateway.sendEvent({
        to: employee.userId.toString(),
        pub: 'notification',
        data: {},
      });
      await this.vacancyRequestRepository.updateWithTransaction<Employee>(
        { id: employee.id },
        {
          colonyId: occupation.apartment.colonyId,
        },
        Employee,
        manager,
      );
      await this.historyService.create({
        type: HISTORY_TYPE.EMPLOYEE,
        text: `Apartment assigned in colony ${occupation.apartment.colony.name}, address: ${occupation.apartment.address}.`,
        employeeId: employee.id,
      });
      await this.historyService.create({
        type: HISTORY_TYPE.APARTMENT,
        text: `Apartment assigned to employee ${employee.user.name}, email: ${employee.user.email}.`,
        apartmentId: occupation.apartment.id,
      });
      await runner.end();
      return this.findOne(occupation.id);
    } catch (error) {
      console.error(error);
      if (runner) await runner.rollbackTransaction();
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deAssignOccupation(id: number, userId: number): Promise<any> {
    const findOptions = new FindOptionsBuilder<Occupation>()
      .where({
        id,
      })
      .relations({
        apartment: {
          colony: true,
        },
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
      const { manager } = runner;
      await this.occupationsRepository.updateWithTransaction(
        {
          occupationId: occupation.id,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        },
        {
          status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
          reason: 'Apartment vacant by admin or manager.',
        },
        VacancyRequest,
        manager,
      );
      await this.occupationsRepository.updateWithTransaction<TransferRequest>(
        {
          employeeId: employee.id,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        },
        {
          status: EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
          reason: 'Apartment vacant by admin or manager.',
        },
        TransferRequest,
        manager,
      );
      await this.occupationsRepository.updateWithTransaction(
        { id: occupation.id },
        {
          lastVacantOn: new Date(),
          status: OCCUPATION_STATUS.VACANT,
          vacantById: occupation.occupiedById,
          deAssignedById: userId,
          assignedById: null,
          occupiedById: null,
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
      await this.notificationService.create({
        userId: employee.userId,
        title: 'Apartment Deassigned',
        text: `You have been deassigned from an apartment in ${occupation.apartment.colony.name}, ${occupation.apartment.address}.`,
      });
      await this.eventGateway.sendEvent({
        to: employee.userId.toString(),
        pub: 'notification',
        data: {},
      });
      await this.historyService.create({
        type: HISTORY_TYPE.EMPLOYEE,
        text: `Apartment Deassigned in colony ${occupation.apartment.colony.name}, address: ${occupation.apartment.address}.`,
        employeeId: employee.id,
      });
      await this.historyService.create({
        type: HISTORY_TYPE.APARTMENT,
        text: `Apartment left by employee ${employee.user.name}, email: ${employee.user.email}.`,
        apartmentId: occupation.apartment.id,
      });

      await runner.end();
      return this.findOne(occupation.id);
    } catch (error) {
      console.error(error);

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
    if (occupation?.assignedBy) occupation.assignedBy.password = undefined;
    if (occupation?.deAssignedBy) occupation.deAssignedBy.password = undefined;
    if (occupation?.occupiedBy) occupation.occupiedBy.user.password = undefined;
    if (occupation?.vacantBy) occupation.vacantBy.user.password = undefined;
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
