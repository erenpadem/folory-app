/**
 * Domain Entity: User
 * Represents the core user domain model with business logic
 */
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly emailVerifiedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly role?: string,
    public readonly avatar?: string | null,
    public readonly username?: string | null,
    public readonly bio?: string | null,
    public readonly coverImage?: string | null,
    public readonly phone?: string | null,
    public readonly booksTotalCount?: number,
    public readonly booksPublishedCount?: number,
    public readonly booksDraftCount?: number | null
  ) {}

  get isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }

  canPerformAction(): boolean {
    return this.isEmailVerified;
  }

  static fromPrimitives(data: {
    id: string | number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    role?: string;
    avatar?: string | null;
    username?: string | null;
    bio?: string | null;
    cover_image?: string | null;
    phone?: string | null;
    books_total_count?: number;
    books_published_count?: number;
    books_draft_count?: number | null;
  }): UserEntity {
    return new UserEntity(
      String(data.id),
      data.name,
      data.email,
      data.email_verified_at ? new Date(data.email_verified_at) : null,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date(),
      data.role,
      data.avatar,
      data.username ?? null,
      data.bio ?? null,
      data.cover_image ?? null,
      data.phone ?? null,
      data.books_total_count,
      data.books_published_count,
      data.books_draft_count ?? null
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      email_verified_at: this.emailVerifiedAt?.toISOString() || null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}

