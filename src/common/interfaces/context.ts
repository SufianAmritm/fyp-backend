export interface Context {
  [key: string]: any;
}

export interface ApplicationContext extends Context {
  get UserId(): number;
  get Email(): string;
  get RoleId(): number;
  get TenantId(): number;
}

export class AppContext implements ApplicationContext {
  private readonly userId: number;

  private readonly email: string;

  private readonly roleId: number;

  private readonly tenantId: number;

  constructor(data: {
    id: number;
    email: string;
    roleId: number;
    tenantId: number;
  }) {
    this.userId = data.id;
    this.email = data.email;
    this.roleId = data.roleId;
    this.tenantId = data.tenantId;
  }

  get UserId(): number {
    return this.userId;
  }

  get Email(): string {
    return this.email;
  }

  get RoleId(): number {
    return this.roleId;
  }

  get TenantId(): number {
    return this.tenantId;
  }
}
