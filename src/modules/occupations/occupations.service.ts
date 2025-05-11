import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadGatewayException,
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
import { AssignOccupationDto } from './dto/assign-occupation.dto';
import { CreateOccupationDto } from './dto/create-occupations.dto';
import { CreateVacancyRequestDto } from './dto/create-vacancy-request.dto';
import { UpdateOccupationDto } from './dto/update-occupations.dto';
import { UpdateVacancyRequestDto } from './dto/update-vacany-request.dto';
import { Occupation } from './entities/occupations.entity';
import { VacancyRequest } from './entities/vacancy-requests.entity';
import { IOccupationService } from './interfaces/occupations.interface';
import { IOccupationRepository } from './repositories/interface/occupations-repository.interface';
import { IVacancyRequestRepository } from './repositories/interface/vacancy-requests-repository.interface';

@Injectable()
export class OccupationService implements IOccupationService {
  constructor(
    @Inject(IOccupationRepository)
    private readonly occupationsRepository: IOccupationRepository,
    @Inject(IVacancyRequestRepository)
    private readonly vacancyRequestRepository: IVacancyRequestRepository,
    private readonly transactionFactory: DbTransactionFactory,
    @InjectMapper() private readonly occupationsMapper: Mapper,
  ) {}
  async leaveOccupation(id: number, userId: number) {
    const vacancyRequest = await this.vacancyRequestRepository.findOne({
      occupationId: id,
    });
    if (!vacancyRequest) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.NOT_FOUND('Vacancy Request'),
      );
    }
    if (vacancyRequest.createdById !== userId) {
      throw new BadGatewayException(
        'Vacancy request found but you are not the one who created it.',
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
  async vacantOccupation(
    createVacancyRequest: CreateVacancyRequestDto,
    userId: number,
  ) {
    const occupation = await this.occupationsRepository.findOne({
      apartmentId: createVacancyRequest.apartmentId,
    });
    if (!occupation) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.NOT_FOUND('Apartment'));
    }
    if (occupation.occupiedById !== userId) {
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
    const exists = await this.vacancyRequestRepository.findOne({
      occupationId: occupation.id,
      status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
      createdById: userId,
    });
    if (exists) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'vacancy request'),
      );
    }
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
    updateVacancyRequestDto: UpdateVacancyRequestDto,
    userId: number,
  ) {
    const { status } = updateVacancyRequestDto;
    const vacancyRequest = await this.vacancyRequestRepository.findOne({
      id,
    });

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
      await runner.end();
      return this.findOneVacancyRequest(id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
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
        createdBy: {
          user: true,
        },
      })
      .build();
    const vacancyRequest =
      await this.vacancyRequestRepository.findOneWithBuilderOption(findOptions);
    if (vacancyRequest.approvedBy)
      vacancyRequest.approvedBy.password = undefined;
    if (vacancyRequest.rejectedBy)
      vacancyRequest.rejectedBy.password = undefined;
    if (vacancyRequest.createdBy)
      vacancyRequest.createdBy.user.password = undefined;
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
  async assignOccupation(
    id: number,
    assignOccupationDto: AssignOccupationDto,
    userId: number,
  ): Promise<any> {
    const occupation = await this.occupationsRepository.findOne({
      id,
    });

    if (occupation.status === OCCUPATION_STATUS.OCCUPIED) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'occupied'),
      );
    }
    if (occupation.status === OCCUPATION_STATUS.ABOUT_TO_VACANT) {
      throw new BadGatewayException(APP_ERROR_MESSAGES.ABOUT_TO_VACANT);
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
    return this.findOne(occupation.id);
  }
  async deAssignOccupation(id: number, userId: number): Promise<any> {
    const occupation = await this.occupationsRepository.findOne({
      id,
    });
    if (occupation.status === OCCUPATION_STATUS.VACANT) {
      throw new BadGatewayException(
        APP_ERROR_MESSAGES.ALREADY_ACTIONED('Apartment', 'vacant'),
      );
    }
    const runner = await this.transactionFactory.transactionRunner();
    try {
      await runner.start();
      const manager = runner.manager;
      await this.occupationsRepository.deleteWithTransaction(
        {
          id: occupation.id,
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
      await runner.end();
      return this.findOne(occupation.id);
    } catch (error) {
      if (runner) await runner.rollbackTransaction();
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
