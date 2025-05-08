import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, ManagementRoles } from 'src/common/constants';
import { MAX_FILE_SIZES, SUPPORT_TYPES } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { Context } from '../../common/decorators/context';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { IEmployeeService } from './interfaces/employee.interface';

@ApiTags(DOMAIN_ENTITY.EMPLOYEES)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Roles(ManagementRoles)
@Controller('employees')
export class EmployeeController {
  constructor(
    @Inject(IEmployeeService)
    private readonly employeeService: IEmployeeService,
  ) {}
  @Post()
  @MultiFile(
    ['picture', 'cnic_front', 'cnic_back', 'service_card'],
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
        type: 'integer',
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
        type: 'integer',
        example: 1,
        description: 'Number of family members',
        minimum: 1,
      },
    },
    [
      'name',
      'email',
      'phoneNumber',
      'colonyId',
      'cnic-front',
      'cnic-back',
      'service-card',
    ],
  )
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFile(
      'picture',
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZES.AVATAR,
          }),
          new FileTypeValidator({
            fileType: SUPPORT_TYPES.AVATAR,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    picture: Express.Multer.File,
    @UploadedFile(
      'cnic-front',
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZES.AVATAR,
          }),
          new FileTypeValidator({
            fileType: SUPPORT_TYPES.AVATAR,
          }),
        ],
        exceptionFactory: (error) => {
          if (error.includes('required')) {
            throw new BadRequestException(
              APP_ERROR_MESSAGES.REQUIRED('Cnic Front'),
            );
          }
        },
        fileIsRequired: true,
      }),
    )
    cnicFront: Express.Multer.File,
    @UploadedFile(
      'cnic-back',
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZES.AVATAR,
          }),
          new FileTypeValidator({
            fileType: SUPPORT_TYPES.AVATAR,
          }),
        ],
        exceptionFactory: (error) => {
          if (error.includes('required')) {
            throw new BadRequestException(
              APP_ERROR_MESSAGES.REQUIRED('Cnic Back'),
            );
          }
        },
        fileIsRequired: true,
      }),
    )
    cnicBack: Express.Multer.File,
    @UploadedFile(
      'service-card',
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZES.AVATAR,
          }),
          new FileTypeValidator({
            fileType: SUPPORT_TYPES.AVATAR,
          }),
        ],
        exceptionFactory: (error) => {
          if (error.includes('required')) {
            throw new BadRequestException(
              APP_ERROR_MESSAGES.REQUIRED('Service Card'),
            );
          }
        },
        fileIsRequired: true,
      }),
    )
    serviceCard: Express.Multer.File,
    @Context() context: AppContext,
  ) {
    createEmployeeDto.createdById = context.UserId;
    return this.employeeService.create(
      createEmployeeDto,
      cnicFront,
      cnicBack,
      serviceCard,
      picture,
    );
  }

  // @Post()
  // create(@Body() createEmployeeDto: CreateEmployeeDto) {
  //   return this.employeeService.create(createEmployeeDto);
  // }

  // @Get()
  // findAll(
  //   @Query() paginationDto: PaginationDto,
  //   @Context() context: AppContext,
  // ) {
  //   return this.employeeService.findAll(paginationDto, context);
  // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.employeeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateEmployeeDto: UpdateEmployeeDto) {
  //   const { id } = idDto;

  //   return this.employeeService.update(+id, updateEmployeeDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.employeeService.remove(+id);
  // }
}
