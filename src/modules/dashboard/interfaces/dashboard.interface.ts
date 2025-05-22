import { AppContext } from '../../../common/interfaces/context';
import { GenerateReportDto } from '../dto/generate-report.dto';

export const IDashboardService = Symbol('IDashboardService');
export interface IDashboardService {
  adminDashboard();
  managerDashboard(context: AppContext);
  employeeDashboard(context: AppContext);
  generateReport(context: AppContext, generateReportDto: GenerateReportDto);
}
