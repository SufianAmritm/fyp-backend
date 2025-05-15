import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import {
  EMPLOYEE_VERIFICATION_STATUS,
  UserRoles,
} from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { IS3Service } from '../aws/interface/aws-s3.interface';
import { IManagersService } from '../managers/interfaces/managers.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeeDto } from './dto/get-employee-dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { IEmployeeService } from './interfaces/employee.interface';
import { IEmployeeRepository } from './repositories/interface/employee-repository.interface';

@Injectable()
export class EmployeeService implements IEmployeeService {
  constructor(
    @Inject(IEmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository,
    @InjectMapper() private readonly employeeMapper: Mapper,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @Inject(IManagersService)
    private readonly managerService: IManagersService,
    @Inject(IS3Service)
    private readonly s3Service: IS3Service,
    private readonly utilService: UtilsService,
  ) {}

  async findOneWithOccupationsAndRequests(id: number): Promise<Employee> {
    const findOptions = new FindOptionsBuilder<Employee>()
      .where({ id })
      .relations({
        user: true,
        colony: {
          station: true,
        },
        occupations: {
          apartment: {
            colony: true,
          },
        },
        transferRequests: {
          fromColony: true,
          toColony: true,
        },
        vacancyRequests: {
          occupation: {
            apartment: true,
          },
        },
      })
      .build();
    const employee =
      await this.employeeRepository.findOneWithBuilderOption(findOptions);
    if (employee?.user) employee.user.password = undefined;
    return employee;
  }

  async getVerificationStatus(userId: number): Promise<{ status: boolean }> {
    const findOptions = new FindOptionsBuilder<Employee>()
      .where({ userId })
      .relations({
        verification: true,
      })
      .build();
    const employee =
      await this.employeeRepository.findOneWithBuilderOption(findOptions);
    const recentRequest = employee.verification?.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })?.[0];
    return {
      status: recentRequest?.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED,
    };
  }

  findOneByUserIdWithColonies(userId: number): Promise<Employee> {
    const findOptions = new FindOptionsBuilder<Employee>()
      .where({ userId })
      .relations({
        user: true,
        colony: {
          station: {
            colonies: true,
          },
        },
        occupations: true,
      })
      .build();
    return this.employeeRepository.findOneWithBuilderOption(findOptions);
  }

  findOneByUserId(userId: number): Promise<Employee> {
    const findOptions = new FindOptionsBuilder<Employee>()
      .where({ userId })
      .relations({
        user: true,
        colony: {
          station: true,
        },
        occupations: true,
      })
      .build();
    return this.employeeRepository.findOneWithBuilderOption(findOptions);
  }

  async create(
    createEmployeeDto: CreateEmployeeDto,
    cnicFront: Express.Multer.File,
    cnicBack: Express.Multer.File,
    serviceCard: Express.Multer.File,
    picture?: Express.Multer.File,
  ) {
    const creator = await this.userService.findOneById(
      createEmployeeDto.createdById,
    );
    if (!creator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (creator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        creator.id,
      );
      const canManagerCreateEmployee = manager.station.colonies.some(
        (colony) => colony.id === createEmployeeDto.colonyId,
      );

      if (!canManagerCreateEmployee) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }

    const { runner, user, transactionManager, emailData } =
      await this.userService.createEmployee(createEmployeeDto);
    try {
      const uploadOperations = [];

      if (picture) {
        uploadOperations.push(this.uploadPic(picture, 'profile', 'picture'));
      }
      if (cnicFront) {
        uploadOperations.push(this.uploadPic(cnicFront, 'cnic', 'cnicFront'));
      }
      if (cnicBack) {
        uploadOperations.push(this.uploadPic(cnicBack, 'cnic', 'cnicBack'));
      }
      if (serviceCard) {
        uploadOperations.push(
          this.uploadPic(serviceCard, 'serviceCard', 'serviceCard'),
        );
      }

      const uploadResults = await Promise.all(uploadOperations);

      uploadResults.forEach(({ field, url }) => {
        createEmployeeDto[field] = url;
      });

      const newEmployee = this.employeeMapper.map(
        createEmployeeDto,
        CreateEmployeeDto,
        Employee,
      );
      newEmployee.userId = user.id;
      newEmployee.profileComplete = true;
      const employee = await this.employeeRepository.createWithTransaction(
        newEmployee,
        Employee,
        transactionManager,
      );
      await this.userService.sendEmailForNoPassword(
        user,
        emailData,
        transactionManager,
      );
      runner.end();
      user.password = undefined;
      return { ...user, employee };
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;
      throw new Error(error.message);
    }
  }

  async findAll(
    getEmployeeDto: GetEmployeeDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ) {
    const employees = await this.employeeRepository.findAll(
      getEmployeeDto,
      paginationDto,
      ctx,
    );
    employees.items = employees.items.map((item) => {
      item.user.password = undefined;
      return item;
    });
    return employees;
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Employee>()
      .where({ id })
      .relations({
        user: true,
        colony: {
          station: true,
        },
      })
      .build();
    const employee =
      await this.employeeRepository.findOneWithBuilderOption(findOptions);
    if (employee?.user) employee.user.password = undefined;
    return employee;
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    userId: number,
    cnicFront?: Express.Multer.File,
    cnicBack?: Express.Multer.File,
    serviceCard?: Express.Multer.File,
    picture?: Express.Multer.File,
  ) {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Employee'));
    }
    const updator = await this.userService.findOneById(userId);
    if (!updator)
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    if (updator.role.name === UserRoles.MANAGER) {
      const manager = await this.managerService.findOneByUserIdWithColonies(
        updator.id,
      );
      const canManagerCreateEmployee = manager.station.colonies.some(
        (colony) => colony.id === employee.colonyId,
      );

      if (!canManagerCreateEmployee) {
        throw new BadRequestException(APP_ERROR_MESSAGES.UNAUTHORIZED);
      }
    }
    const uploadOperations = [];

    if (picture) {
      uploadOperations.push(this.uploadPic(picture, 'profile', 'picture'));
    }
    if (cnicFront) {
      uploadOperations.push(this.uploadPic(cnicFront, 'cnic', 'cnicFront'));
    }
    if (cnicBack) {
      uploadOperations.push(this.uploadPic(cnicBack, 'cnic', 'cnicBack'));
    }
    if (serviceCard) {
      uploadOperations.push(
        this.uploadPic(serviceCard, 'serviceCard', 'serviceCard'),
      );
    }

    const uploadResults = await Promise.all(uploadOperations);

    uploadResults.forEach(({ field, url }) => {
      updateEmployeeDto[field] = url;
    });
    const employeeUpdate = this.employeeMapper.map(
      updateEmployeeDto,
      CreateEmployeeDto,
      Employee,
    );
    await this.employeeRepository.update({ id }, employeeUpdate);
    await this.userService.updateProfile(employee.userId, updateEmployeeDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.employeeRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }

  private async uploadPic(
    file: Express.Multer.File,
    folder: string,
    field: string,
  ) {
    const key = this.utilService.awsUploadKeyBuilder(file.originalname, folder);
    const uploadOptions: PutObjectCommandInput = {
      Bucket: 'RESIDENCE_BUCKET',
      Body: file.buffer,
      Key: key,
    };
    const url = await this.s3Service.uploadFile(uploadOptions);
    return {
      url: this.utilService.awsPublicUrlBuilder(url.bucket, url.key),
      field,
    };
  }
}
