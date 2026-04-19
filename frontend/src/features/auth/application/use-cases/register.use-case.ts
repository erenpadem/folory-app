/**
 * Use Case: Register
 * Application logic for user registration
 */
import { AuthRepository } from '../../domain/repositories/auth.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterRequestDto } from '../dto/auth.dto';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(request: RegisterRequestDto): Promise<UserEntity> {
    if (request.password !== request.password_confirmation) {
      throw new Error('Passwords do not match');
    }

    if (request.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return await this.authRepository.register(request);
  }
}

