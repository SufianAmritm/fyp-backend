import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT } from 'src/common/constants';
import { Context } from 'src/common/decorators/context';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AppContext } from 'src/common/interfaces/context';
import { MAX_FILE_SIZES, SUPPORT_TYPES } from '../../common/constants/enums';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
import { MultiFileValidatorPipe } from '../../common/pipes/multi-file-validation.pipe';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserService } from './interfaces/user.interface';

@ApiTags(DOMAIN_ENTITY.USER)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    @Inject(IUserService) private readonly userService: IUserService,
  ) {}

  @Get('profile')
  getProfile(@Context() user: AppContext) {
    return this.userService.getProfile(user.UserId);
  }

  @MultiFile(['picture', 'cnicFront', 'cnicBack', 'serviceCard'], {
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
      type: 'integer',
      example: 1,
      description: 'Number of family members',
      minimum: 1,
    },
  })
  @Patch('profile')
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles(
      new MultiFileValidatorPipe(
        ['picture', 'cnicFront', 'cnicBack', 'serviceCard'].map((value) => ({
          field: value,
          validations: {
            maxFileSize: MAX_FILE_SIZES.AVATAR,
            fileType: new RegExp(SUPPORT_TYPES.AVATAR),
            required: false,
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

    @Context()
    user: AppContext,
  ) {
    const picture = files.picture?.[0];
    const cnicFront = files.cnicFront?.[0];
    const cnicBack = files.cnicBack?.[0];
    const serviceCard = files.serviceCard?.[0];
    return this.userService.updateProfile(
      user.UserId,
      updateUserDto,
      cnicFront,
      cnicBack,
      serviceCard,
      picture,
    );
  }

  @Patch('settings')
  updateSettings(
    @Body() updateUserDto: UpdateSettingsDto,
    @Context() user: AppContext,
  ) {
    return this.userService.updateAppSettings(user, updateUserDto);
  }
}
