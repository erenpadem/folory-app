/**
 * Use Case: Login
 * Application logic for user authentication
 */
import { AuthRepository } from '../../domain/repositories/auth.repository.interface';
import { LoginCredentials } from '../../domain/value-objects/credentials.vo';
import { UserEntity } from '../../domain/entities/user.entity';
import { LoginRequestDto } from '../dto/auth.dto';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(request: LoginRequestDto): Promise<UserEntity> {
    const credentials = LoginCredentials.create({
      email: request.email,
      password: request.password,
      remember: request.remember,
    });

    return await this.authRepository.login(credentials);
  }
}

