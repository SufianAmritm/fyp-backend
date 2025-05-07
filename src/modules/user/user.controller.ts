import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from 'src/common/constants';
import { Context } from 'src/common/decorators/context';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AppContext } from 'src/common/interfaces/context';
import { MAX_FILE_SIZES, SUPPORT_TYPES } from '../../common/constants/enums';
import { SingleFile } from '../../common/decorators/single-file.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserService } from './interfaces/user.interface';

@ApiTags(DOMAIN_ENTITY.USER)
@ApiBearerAuth(JWT)
@ApiBearerAuth(X_API_KEY)
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
      phoneNumber: {
        type: 'string',
        pattern: '^\\+923[0-9]{9}$',
        example: '+923001234567',
        description:
          'The phone number should be a valid Pakistani phone number with format +923xxxxxxxxx',
      },
    },
    true,
  )
  @Patch('profile')
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
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
    @Context()
    user: AppContext,
  ) {
    return this.userService.updateProfile(user.UserId, updateUserDto, picture);
  }

  @Patch('settings')
  updateSettings(
    @Body() updateUserDto: UpdateSettingsDto,
    @Context() user: AppContext,
  ) {
    return this.userService.updateAppSettings(user, updateUserDto);
  }
}
