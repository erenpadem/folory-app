/**
 * Use Case: Get Current User
 * Application logic for fetching authenticated user
 */
import { AuthRepository } from '../../domain/repositories/auth.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<UserEntity | null> {
    return await this.authRepository.getCurrentUser();
  }
}

