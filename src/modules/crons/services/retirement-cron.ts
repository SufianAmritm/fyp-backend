import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import { HISTORY_TYPE } from '../../../common/constants/enums';
import { IEmployeeService } from '../../employee/interfaces/employee.interface';
import { CreateHistoryDto } from '../../history/dto/create-history.dto';
import { IHistoryService } from '../../history/interfaces/history.interface';
import { IManagersService } from '../../managers/interfaces/managers.interface';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { IUserNotificationService } from '../../notifications/interfaces/user-notification.interface';
import { IUserService } from '../../user/interfaces/user.interface';
dotenv.config();
@Injectable()
export class RetirementCron {
  private readonly logger = new Logger(RetirementCron.name);

  constructor(
    @Inject(IEmployeeService)
    private readonly employeeService: IEmployeeService,
    @Inject(IManagersService)
    private readonly managerService: IManagersService,
    @Inject(IUserNotificationService)
    private readonly notificationService: IUserNotificationService,
    @Inject(IHistoryService)
    private readonly historyService: IHistoryService,
    @Inject(IUserService)
    private readonly userService: IUserService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEmployeeRetirementDates() {
    this.logger.log('Running retirement status update cron job');

    const todayEmployeeRetirements =
      await this.employeeService.getTodayRetirements();

    const todayManagerRetirements =
      await this.managerService.getTodayRetirements();

    const notifications: CreateNotificationDto[] = [];
    const histories: CreateHistoryDto[] = [];

    const employeeManagerStationIds = todayEmployeeRetirements.map(
      (employee) => employee.colony.stationId,
    );
    const employeeManagers = await this.managerService.findByStationIds(
      employeeManagerStationIds,
    );
    const admin = await this.userService.getAdmin();
    for (const retirement of todayEmployeeRetirements) {
      histories.push({
        text: 'Retired today.',
        employeeId: retirement.id,
        type: HISTORY_TYPE.EMPLOYEE,
      });
      const stationId = retirement.colony.stationId;
      const managers = employeeManagers.filter(
        (manager) => manager.stationId === stationId,
      );
      notifications.push(
        ...managers.map((manager) => ({
          text: `Employee name: ${retirement.user.name}, email: ${retirement.user.email}, serviceNumber: ${retirement.serviceNumber}  has retired today!`,
          title: 'Retirement',
          userId: manager.userId,
        })),
      );
      notifications.push({
        text: `Employee name: ${retirement.user.name}, email: ${retirement.user.email}, serviceNumber: ${retirement.serviceNumber}  has retired today!`,
        title: 'Retirement',
        userId: admin.id,
      });
    }
    notifications.push(
      ...todayManagerRetirements.map((manager) => ({
        text: `Manager name: ${manager.user.name}, email: ${manager.user.email} has retired today!`,
        title: 'Retirement',
        userId: admin.id,
      })),
    );

    await this.notificationService.createBulk(notifications);
    await this.historyService.bulkCreate(histories);
  }
}
