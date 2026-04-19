/**
 * Use Case: Logout
 * Application logic for user logout
 */
import { AuthRepository } from '../../domain/repositories/auth.repository.interface';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return await this.authRepository.logout();
  }
}

