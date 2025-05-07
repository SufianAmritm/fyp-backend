export enum ENVIRONMENTS {
  DEV = 'dev',
  QA = 'qa',
  UAT = 'uat',
  PROD = 'prod',
}

export const enum ORDER_BY {
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
}
export enum EMAIL_SUBJECTS {
  REGISTER = 'Welcome to Pakistan Railway Residency Portal',
  PASSWORD_RESET='Reset Password',
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
  ADMIN= 'admin',
  MANAGER= 'station_manager',
  EMPLOYEE= 'employee',
};
