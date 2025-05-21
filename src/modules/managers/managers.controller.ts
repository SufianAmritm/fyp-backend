import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
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
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { SingleFile } from '../../common/decorators/single-file.decorator';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateManagersDto } from './dto/create-managers.dto';
import { GetManagersDto } from './dto/get-managers.dto';
import { IsFromDto } from './dto/isfrom.dto';
import { UpdateManagersDto } from './dto/update-managers.dto';
import { IManagersService } from './interfaces/managers.interface';

@ApiTags(DOMAIN_ENTITY.MANAGERS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Controller('managers')
export class ManagersController {
  constructor(
    @Inject(IManagersService)
    private readonly managersService: IManagersService,
  ) {}

  @Roles([UserRoles.ADMIN])
  @Post()
  @SingleFile(
    'picture',
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
      stationId: {
        type: 'integer',
        example: 1,
        description: 'Station ID associated with the user',
        minimum: 1,
      },
      description: {
        type: 'string',
        example: 'user@example.com',
        description: 'Please provide email',
      },
    },
    true,
    ['name', 'email', 'phoneNumber', 'stationId'],
  )
  create(
    @Body() createManagersDto: CreateManagersDto,
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
    @Context() context: AppContext,
  ) {
    createManagersDto.createdById = context.UserId;
    return this.managersService.create(createManagersDto, picture);
  }

  @Roles(ManagementRoles)
  @Get()
  findAll(
    @Query() getManagersDto: GetManagersDto,
    @Query() paginationDto: PaginationDto,
    @Context() context: AppContext,
  ) {
    return this.managersService.findAll(getManagersDto, paginationDto, context);
  }

  @Roles([UserRoles.MANAGER])
  @Post('check-access')
  isFrom(@Context() context: AppContext, @Body() isFromDto: IsFromDto) {
    return this.managersService.isFrom(
      context,
      isFromDto.fromColonyId,
      isFromDto.toColonyId,
    );
  }

  @Roles(ManagementRoles)
  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.managersService.findOne(+id);
  }

  @Roles([UserRoles.ADMIN])
  @Patch(':id')
  @SingleFile(
    'picture',
    {
      name: {
        type: 'string',
        example: 'John Doe',
        description: 'Full name of the user',
      },

      phoneNumber: {
        type: 'string',
        pattern: '^\\+923[0-9]{9}$',
        example: '+923001234567',
        description:
          'The phone number should be a valid Pakistani phone number with format +923xxxxxxxxx',
      },
      stationId: {
        type: 'integer',
        example: 1,
        description: 'Station ID associated with the user',
        minimum: 1,
      },
    },
    true,
  )
  update(
    @Param() idDto: IdDto,
    @Body() updateManagersDto: UpdateManagersDto,
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
  ) {
    const { id } = idDto;

    return this.managersService.update(+id, updateManagersDto, picture);
  }
  @Roles([UserRoles.ADMIN])
  @Delete(':id')
  remove(@Param() idDto: IdDto, @Context() context: AppContext) {
    const { id } = idDto;

    return this.managersService.remove(+id, context);
  }
}
