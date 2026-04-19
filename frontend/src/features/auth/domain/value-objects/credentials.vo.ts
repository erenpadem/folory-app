/**
 * Value Object: LoginCredentials
 * Encapsulates login credentials with validation
 */
import { Email } from './email.vo';

export class LoginCredentials {
  private constructor(
    public readonly email: Email,
    public readonly password: string,
    public readonly remember: boolean
  ) {}

  static create(data: {
    email: string;
    password: string;
    remember?: boolean;
  }): LoginCredentials {
    if (!data.password || data.password.length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const email = Email.create(data.email);

    return new LoginCredentials(email, data.password, data.remember ?? false);
  }

  equals(other: LoginCredentials): boolean {
    return (
      this.email.equals(other.email) &&
      this.password === other.password &&
      this.remember === other.remember
    );
  }
}

