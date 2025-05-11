import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { IS3Service } from '../aws/interface/aws-s3.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
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
    @Inject(IS3Service)
    private readonly s3Service: IS3Service,
    private readonly utilService: UtilsService,
  ) {}
  async create(
    createEmployeeDto: CreateEmployeeDto,
    cnicFront: Express.Multer.File,
    cnicBack: Express.Multer.File,
    serviceCard: Express.Multer.File,
    picture?: Express.Multer.File,
  ) {
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
      await this.userService.sendEmailForNoPassword(user, emailData);
      runner.end();
      user.password = undefined;
      return { user, employee };
    } catch (error) {
      console.log(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;
      throw new Error(error.message);
    }
  }
  findAll(paginationDto: PaginationDto, ctx: AppContext) {
    return this.employeeRepository.findAll(paginationDto, ctx);
  }

  findOne(id: number) {
    return this.employeeRepository.findOne({ id });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employeeUpdate = this.employeeMapper.map(
      updateEmployeeDto,
      CreateEmployeeDto,
      Employee,
    );
    await this.employeeRepository.update({ id }, employeeUpdate);
    return this.employeeRepository.findOne({ id });
  }

  async remove(id: number) {
    await this.employeeRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }

  private async uploadPic(file: Express.Multer.File, folder: string,field:string) {
    const key = this.utilService.awsUploadKeyBuilder(file.originalname, folder);
    const uploadOptions: PutObjectCommandInput = {
      Bucket: 'RESIDENCE_BUCKET',
      Body: file.buffer,
      Key: key,
    };
    const url = await this.s3Service.uploadFile(uploadOptions);
    return {url:this.utilService.awsPublicUrlBuilder(url.bucket, url.key),field};
  }
}
