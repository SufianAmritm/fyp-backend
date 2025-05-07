import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from 'src/common/constants';
import { Context } from 'src/common/decorators/context';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AppContext } from 'src/common/interfaces/context';
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

  @Get('')
  findOne(@Context() user: AppContext) {
    return this.userService.findOneById(user.UserId);
  }

  @Patch('')
  update(@Body() updateUserDto: UpdateUserDto, @Context() user: AppContext) {
    return this.userService.update(user.UserId, updateUserDto);
  }


  @Delete(':id')
  remove(@Param() id: string) {
    return this.userService.remove(+id);
  }

  @Patch('settings')
  updateSettings(
    @Body() updateUserDto: UpdateSettingsDto,
    @Context() user: AppContext,
  ) {
    return this.userService.updateAppSettings(user, updateUserDto);
  }
}
