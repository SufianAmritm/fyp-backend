import { AppContext } from '../../../common/interfaces/context';

export const IDashboardService = Symbol('IDashboardService');
export interface IDashboardService {
  adminDashboard();
  managerDashboard(context: AppContext);
  employeeDashboard(context: AppContext);
}
