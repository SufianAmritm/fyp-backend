import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY } from 'src/common/constants';
import { IdDto } from 'src/common/dtos/request/id.dto';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { IRolePermissionService } from './interfaces/role-permission.interface';

@ApiTags(DOMAIN_ENTITY.ROLE_PERMISSION)
@Controller('role-permission')
export class RolePermissionController {
  constructor(
    @Inject(IRolePermissionService)
    private readonly rolePermissionService: IRolePermissionService,
  ) {}

  @Post()
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @Get()
  findAll() {
    return this.rolePermissionService.findAll();
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    const { id } = idDto;

    return this.rolePermissionService.findOne(+id);
  }

  @Get(':id/role')
  findByRoleId(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.rolePermissionService.findByRoleId(+id);
  }

  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateRolePermissionDto: UpdateRolePermissionDto,
  ) {
    const { id } = idDto;

    return this.rolePermissionService.update(+id, updateRolePermissionDto);
  }

  @Delete(':id')
  remove(@Param() idDto: IdDto) {
    const { id } = idDto;

    return this.rolePermissionService.remove(+id);
  }
}
