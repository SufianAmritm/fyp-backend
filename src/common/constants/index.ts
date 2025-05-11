import { UserRoles } from './enums';

/** */
export const PROJECT_NAME = 'LEAD-MATE BACKEND 🚀';
export const JWT = 'JWT';
export const X_API_KEY = 'x-api-key';
export const PAGE_SIZE = Number.MAX_SAFE_INTEGER;
export const DEFAULT_PAGE = 1;
export const EMPTY_STRING = '';
export const ALL_STRING = 'All';
export const SWAGGER_PATH = '/api-docs';
export const RESPONSE_MESSAGES = {
  INTERNAL_SERVER_ERROR:
    "We're sorry, but our server encountered an unexpected error while processing your request. Please try again later, or contact our support team if the problem persists.",
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  IN_ACTIVATED: 'Successfully inactivated',
  ACTIVATED: 'Successfully activated',
  DEACTIVATED: 'Successfully deactivated',
  VERIFY:
    'Your email has been successfully verified. You can now log in to your account',
  CREATED: 'Successfully created',
  VERIFICATION: 'Verification email sent successfully',
  SIGN_IN: 'Successfully signed in',
  RESET_PASSWORD_EMAIL: 'Reset password email sent successfully',
  RESET_PASSWORD: 'Password reset successfully',
  ALREADY_SENT_VERIFICATION:
    'Email has already been sent for verification. Please check your email',
  SYNCED: 'Successfully synced',
  NO_UPDATE_NEEDED: 'Not Updated',
  EMAIL_SENT: 'Email sent successfully',
  CSV_UPLOAD_SUCCESS: 'Successfully uploaded csv',
  SUCCESSFUL_OPERATION: 'Operation completed successfully',
};

export const DUMMY_DATA = {
  email: 'user@gmail.com',
  password: 'i*RyNx7YCckM2*',
  name: 'Propellus-Partner-1',
  roleName: 'Dummy Role',
  token: 'eyJhbGci',
};

export const DOMAIN_ENTITY = {
  USER: 'User',
  ROLE: 'Role',
  AUTH: 'Auth',
  ROLE_PERMISSION: 'RolePermission',
  NOTIFICATIONS: 'Notifications',
  ADMIN: 'Admin',
  DIVISION: 'Division',
  STATIONS: 'Stations',
  MANAGERS: 'Managers',
  APARTMENTS: 'Apartments',
  COLONIES: 'Colonies',
  EMPLOYEES: 'Employees',
  EMPLOYEE_VERIFICATIONS: 'EmployeeVerifications',
  APPLICATIONS: 'Applications',
};

export const REGEX = {
  ISO_DATE: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\b/g,
};

export const WeekDayMap = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
export const MonthWeekMap = {
  0: 'week-1',
  1: 'week-2',
  2: 'week-3',
  3: 'week-4',
};
export const YearMonthMap = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

export const ManagementRoles = [UserRoles.ADMIN, UserRoles.MANAGER];
export const EmployeeProfileCompleteColumns = [
  'picture',
  'cnicFront',
  'cnicBack',
  'serviceCard',
  'colonyId',
  'address',
  'members',
];
