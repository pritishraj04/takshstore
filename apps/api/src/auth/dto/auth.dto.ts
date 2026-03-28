export class RegisterDto {
  email!: string;
  password!: string;
  name?: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class ForgotPasswordDto {
  email!: string;
  type!: 'USER' | 'ADMIN';
}

export class ResetPasswordDto {
  token!: string;
  newPassword!: string;
  type!: 'USER' | 'ADMIN';
}
