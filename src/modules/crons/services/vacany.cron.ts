import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import * as dotenv from 'dotenv';
import { OCCUPATION_STATUS } from '../../../common/constants/enums';
import { IOccupationService } from '../../occupations/interfaces/occupations.interface';
dotenv.config();
@Injectable()
export class OccupationCronService {
  private readonly logger = new Logger(OccupationCronService.name);

  constructor(
    @Inject(IOccupationService)
    private readonly occupationService: IOccupationService,
  ) {}

  @Cron(
    process.env.LAST_VACANCY_CRON_RUN_TIME ||
      CronExpression.EVERY_DAY_AT_MIDNIGHT,
  )
  async handleOccupationStatusUpdate() {
    this.logger.log('Running occupation status update cron job');
    const lastVacancyDays = Number(process.env.LAST_VACANCY_DAYS) || 3;
    const threeDaysAgo = dayjs().subtract(lastVacancyDays, 'day').toDate();

    const occupations =
      await this.occupationService.findAllForCronJob(threeDaysAgo);

    if (!occupations.length) {
      this.logger.log('No occupations to update');
      return;
    }

    for (const occupation of occupations) {
      const currentOcc = occupation.occupiedById;
      occupation.status = OCCUPATION_STATUS.VACANT;
      occupation.lastVacantOn = new Date();
      occupation.vacantById = currentOcc;
      occupation.occupiedById = null;
    }

    await this.occupationService.bulkUpdate(occupations);

    this.logger.log(`Updated ${occupations.length} occupations to vacant`);
  }
}
