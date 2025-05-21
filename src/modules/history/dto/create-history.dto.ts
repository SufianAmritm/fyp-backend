import { AutoMap } from '@automapper/classes';
import { HISTORY_TYPE } from '../../../common/constants/enums';

export class CreateHistoryDto {
  @AutoMap()
  text: string;
  @AutoMap()
  employeeId?: number;
  @AutoMap()
  apartmentId?: number;
  @AutoMap()
  type: HISTORY_TYPE;
}
