export enum ENVIRONMENTS {
  DEV = 'dev',
  QA = 'qa',
  UAT = 'uat',
  PROD = 'prod',
}

export enum ORDER_BY {
  DESC = 'DESC',
  ASC = 'ASC',
}
export enum SUPPORT_TYPES {
  AVATAR = '.(png|jpg|jpeg|PNG|JPG|JPEG)',
  PDF = '.(pdf)',
  CSV = '.(csv)',
}
export enum MAX_FILE_SIZES {
  AVATAR = 1024 * 1024 * 5,
  VISA_DOCUMENT = 1024 * 1024 * 15,
  DOCUMENT = 1024 * 1024 * 5,
}
export enum OTP_TYPE {
  REGISTRATION = 'registration',
  RESET_PASSWORD = 'reset_password',
}
export enum TIME_IN_SECONDS {
  ONE_DAY = 86400,
  ONE_WEEK = 604800,
  ONE_MONTH = 2592000,
  ONE_YEAR = 31536000,
}

export enum EMAIL_TEMPLATES {
  REGISTER = 'welcome-email',
  PASSWORD_RESET = 'password-reset',
  APPLICATION_APPROVED = 'application-approved',
  APPLICATION_REJECTED = 'application-rejected',
  EMPLOYEE_VERIFICATION_REJECTED = 'employee-verification-rejected',
  EMPLOYEE_VERIFICATION_APPROVED = 'employee-verification-approved',
  TRANSFER_REQUEST_REJECTED = 'transfer-request-rejected',
  TRANSFER_REQUEST_APPROVED = 'transfer-request-approved',
  VACANCY_REQUEST_REJECTED = 'vacancy-request-rejected',
  VACANCY_REQUEST_APPROVED = 'vacancy-request-approved',
  APARTMENT_DEASSIGNED = 'apartment-deassigned',
  APARTMENT_ASSIGNED = 'apartment-assigned',
}
export enum EMAIL_SUBJECTS {
  APPLICATION_APPROVED = 'Railway Housing Application Approved',
  APPLICATION_REJECTED = 'Railway Housing Application Rejected',
  REGISTER = 'Welcome to Pakistan Railway Residency Portal',
  EMPLOYEE_VERIFICATION_REJECTED = 'Employee Verification Rejected',
  EMPLOYEE_VERIFICATION_APPROVED = 'Employee Verification Approved',
  TRANSFER_REQUEST_REJECTED = 'Transfer Request Rejected',
  TRANSFER_REQUEST_APPROVED = 'Transfer Request Approved',
  VACANCY_REQUEST_REJECTED = 'Vacancy Request Rejected',
  VACANCY_REQUEST_APPROVED = 'Vacancy Request Approved',
  APARTMENT_DEASSIGNED = 'Apartment Deassigned',
  APARTMENT_ASSIGNED = 'Apartment Assigned',
  PASSWORD_RESET = 'Reset Password',
}
export enum DATE_FILTER {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum NOTIFICATION_SEND_TYPE {
  DASHBOARD = 'dashboard',
  MESSAGE = 'message',
  BOTH = 'both',
}
export enum NOTIFICATION_TYPE {
  MOCK = 'mock',
}

export enum TOGGLE_ON_OFF {
  ON = 'on',
  OFF = 'off',
}

export enum AWS_PROVIDERS {
  S3 = 's3',
}

export enum UserRoles {
  ADMIN = 'admin',
  MANAGER = 'station_manager',
  EMPLOYEE = 'employee',
}

export enum EMPLOYEE_VERIFICATION_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum OCCUPATION_STATUS {
  OCCUPIED = 'occupied',
  VACANT = 'vacant',
  ABOUT_TO_VACANT = 'about_to_vacant',
}
export enum  ApartmentCsvHeaders  {
  HOUSE_NO='HouseNo*',
  ADDRESS='Address*',
  STREET_NO='StreetNo*',
  COLONY='Colony*',
  STATION='Station*',
  ROOMS='Rooms*',
  BATHROOMS='Bathrooms*',
  DESCRIPTION='Description',
};
export enum ColonyCsvHeaders {
  COLONY = 'Colony*',
  STATION = 'Station*',
  DESCRIPTION = 'Description',
  DIVISION = 'Division*',
}
