import {
  BadRequestException,
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
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { MultiFile } from '../../common/decorators/multi-file.decorator';
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

  @MultiFile(['picture', 'cnic_front', 'cnic_back', 'service_card'], {
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
  })
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
        fileIsRequired: false,
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
        fileIsRequired: false,
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
        fileIsRequired: false,
      }),
    )
    serviceCard: Express.Multer.File,

    @Context()
    user: AppContext,
  ) {
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
