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
    return await this.authRepository.register(request);
  }
}

