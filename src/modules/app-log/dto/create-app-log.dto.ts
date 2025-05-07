import { AutoMap } from '@automapper/classes';

export class CreateAppLogDto {
  @AutoMap()
  log: string;

  @AutoMap()
  logType: string;

  @AutoMap()
  logData: any;
}
