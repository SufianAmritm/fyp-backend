import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, ManagementRoles } from 'src/common/constants';
import {
  MAX_FILE_SIZES,
  SUPPORT_TYPES,
  UserRoles,
} from '../../common/constants/enums';
import { Context } from '../../common/decorators/context';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { MultiFileValidatorPipe } from '../../common/pipes/multi-file-validation.pipe';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeeDto } from './dto/get-employee-dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { IEmployeeService } from './interfaces/employee.interface';

@ApiTags(DOMAIN_ENTITY.EMPLOYEES)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(
    @Inject(IEmployeeService)
    private readonly employeeService: IEmployeeService,
  ) {}

  @Roles(ManagementRoles)
  @Post()
  @MultiFile(
    ['picture', 'cnicFront', 'cnicBack', 'serviceCard'],
    {
      name: {
        type: 'string',
        example: 'John Doe',
        description: 'Full name of the user',
      },
      email: {
        type: 'string',
        example: 'user@example.com',
        description: 'Please provide email',
      },
      phoneNumber: {
        type: 'string',
        pattern: '^\\+923[0-9]{9}$',
        example: '+923001234567',
        description:
          'The phone number should be a valid Pakistani phone number with format +923xxxxxxxxx',
      },
      colonyId: {
        type: 'string',
        example: 1,
        description: 'colony ID associated with the user',
        minimum: 1,
      },
      address: {
        type: 'string',
        example: 'razabad',
        description: 'Please provide address',
      },
      members: {
        type: 'string',
        example: 1,
        description: 'Number of family members',
        minimum: 1,
      },
    },
    // [
    //   'name',
    //   'email',
    //   'phoneNumber',
    //   'colonyId',
    //   'cnic-front',
    //   'cnic-back',
    //   'service-card',
    // ],
  )
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFiles(
      new MultiFileValidatorPipe(
        ['picture', 'cnicFront', 'cnicBack', 'serviceCard'].map((value) => ({
          field: value,
          validations: {
            maxFileSize: MAX_FILE_SIZES.AVATAR,
            fileType: new RegExp(SUPPORT_TYPES.AVATAR),
            required: value !== 'picture',
          },
        })),
      ),
    )
    files: {
      picture?: Express.Multer.File[];
      cnicFront?: Express.Multer.File[];
      cnicBack?: Express.Multer.File[];
      serviceCard?: Express.Multer.File[];
    },

    @Context() context: AppContext,
  ) {
    const picture = files.picture?.[0];
    const cnicFront = files.cnicFront?.[0];
    const cnicBack = files.cnicBack?.[0];
    const serviceCard = files.serviceCard?.[0];
    createEmployeeDto.createdById = context.UserId;
    return this.employeeService.create(
      createEmployeeDto,
      cnicFront,
      cnicBack,
      serviceCard,
      picture,
    );
  }

  @Roles(ManagementRoles)
  @Get()
  findAll(
    @Query() getEmployeeDto: GetEmployeeDto,
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.employeeService.findAll(getEmployeeDto, paginationDto, context);
  }

  @Roles([UserRoles.EMPLOYEE, ...ManagementRoles])
  @Get('verification-status')
  getVerificationStatus(@Context() context: AppContext) {
    return this.employeeService.getVerificationStatus(context.UserId);
  }

  @Roles(ManagementRoles)
  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.employeeService.findOne(+id);
  }

  @Roles(ManagementRoles)
  @Patch(':id')
  @MultiFile(
    ['picture', 'cnicFront', 'cnicBack', 'serviceCard'],
    {
      name: {
        type: 'string',
        example: 'John Doe',
        description: 'Full name of the user',
      },
      email: {
        type: 'string',
        example: 'user@example.com',
        description: 'Please provide email',
      },
      phoneNumber: {
        type: 'string',
        pattern: '^\\+923[0-9]{9}$',
        example: '+923001234567',
        description:
          'The phone number should be a valid Pakistani phone number with format +923xxxxxxxxx',
      },
      colonyId: {
        type: 'string',
        example: 1,
        description: 'colony ID associated with the user',
        minimum: 1,
      },
      address: {
        type: 'string',
        example: 'razabad',
        description: 'Please provide address',
      },
      members: {
        type: 'string',
        example: 1,
        description: 'Number of family members',
        minimum: 1,
      },
    },
    // [
    //   'name',
    //   'email',
    //   'phoneNumber',
    //   'colonyId',
    //   'cnic-front',
    //   'cnic-back',
    //   'service-card',
    // ],
  )
  update(
    @Param() idDto: IdDto,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @UploadedFiles(
      new MultiFileValidatorPipe(
        ['picture', 'cnicFront', 'cnicBack', 'serviceCard'].map((value) => ({
          field: value,
          validations: {
            maxFileSize: MAX_FILE_SIZES.AVATAR,
            fileType: new RegExp(SUPPORT_TYPES.AVATAR),
            required: null,
          },
        })),
      ),
    )
    files: {
      picture?: Express.Multer.File[];
      cnicFront?: Express.Multer.File[];
      cnicBack?: Express.Multer.File[];
      serviceCard?: Express.Multer.File[];
    },
    @Context() context: AppContext,
  ) {
    const { id } = idDto;
    const picture = files.picture?.[0];
    const cnicFront = files.cnicFront?.[0];
    const cnicBack = files.cnicBack?.[0];
    const serviceCard = files.serviceCard?.[0];
    return this.employeeService.update(
      +id,
      updateEmployeeDto,
      context.UserId,
      cnicFront,
      cnicBack,
      serviceCard,
      picture,
    );
  }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.employeeService.remove(+id);
  // }
}
