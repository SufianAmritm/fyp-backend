import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, UserRoles } from 'src/common/constants';
import { Context } from '../../common/decorators/context';
import { Roles } from '../../common/decorators/role-metadata.decorator';
import { SingleFile } from '../../common/decorators/single-file.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppContext } from '../../common/interfaces/context';
import { CreateManagersDto } from './dto/create-managers.dto';
import { IManagersService } from './interfaces/managers.interface';

@ApiTags(DOMAIN_ENTITY.MANAGERS)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard, RolesGuard)
@Roles([UserRoles.ADMIN])
@Controller('managers')
export class ManagersController {
  constructor(
    @Inject(IManagersService)
    private readonly managersService: IManagersService,
  ) {}

  @Post()
  @SingleFile(
    'picture',
    {
      name: {
        type: 'string',
        example: 'John Doe',
        description: 'Full name of the user',
      },
      password: {
        type: 'string',
        minLength: 6,
        example: 'P@ssw0rd123',
        description: 'Please provide a strong password',
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
    },
    true,
    ['name', 'password', 'email', 'phoneNumber', 'stationId'],
  )
  create(
    @Body() createManagersDto: CreateManagersDto,
    @UploadedFile('picture') picture: Express.Multer.File,
    @Context() context: AppContext,
  ) {
    createManagersDto.createdById = context.UserId;
    return this.managersService.create(createManagersDto, picture);
  }

  // @Get()
  // findAll(@Query() paginationDto: PaginationDto) {
  //   return this.managersService.findAll(paginationDto);
  // }

  // @Get(':id')
  // findOne(@Param() idDto: IdDto) {
  //   const { id } = idDto;
  //   return this.managersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param() idDto: IdDto, @Body() updateManagersDto: UpdateManagersDto) {
  //   const { id } = idDto;

  //   return this.managersService.update(+id, updateManagersDto);
  // }

  // @Delete(':id')
  // remove(@Param() idDto: IdDto) {
  //   const { id } = idDto;

  //   return this.managersService.remove(+id);
  // }
}
