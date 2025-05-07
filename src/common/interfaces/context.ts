export interface Context {
  [key: string]: any;
}

export interface ApplicationContext extends Context {
  get UserId(): number;
  get Email(): string;
  get Role(): string;
  get EmailVerified(): boolean;
}

export class AppContext implements ApplicationContext {
  private readonly userId: number;

  private readonly email: string;

  private readonly role: string;

  private readonly emailVerified: boolean;

  constructor(data: {
    id: number;
    email: string;
    role: string;
    emailVerified: boolean;
  }) {
    this.userId = data.id;
    this.email = data.email;
    this.role = data.role;
    this.emailVerified = data.emailVerified;
  }
  [key: string]: any;
  get Role(): string {
    return this.role;
  }
  get EmailVerified(): boolean {
    return this.emailVerified;
  }

  get UserId(): number {
    return this.userId;
  }

  get Email(): string {
    return this.email;
  }
}
