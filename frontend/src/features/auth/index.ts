/**
 * Auth Feature Public API
 * Exports only what's needed from outside the feature
 */
export { useAuth } from './presentation/hooks/use-auth.hook';
export { UserEntity } from './domain/entities/user.entity';
export type { LoginRequestDto, RegisterRequestDto } from './application/dto/auth.dto';

