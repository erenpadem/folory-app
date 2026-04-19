# Clean Architecture & DDD - Frontend Documentation

## 📁 Yapısal Organizasyon

Bu proje **Feature-Based Clean Architecture** ve **Domain-Driven Design (DDD)** prensiplerine göre organize edilmiştir.

### Genel Yapı

```
src/
├── features/                    # Feature modülleri (her feature bağımsız)
│   ├── auth/
│   │   ├── domain/             # Domain katmanı (business logic)
│   │   │   ├── entities/       # Domain entities
│   │   │   ├── value-objects/  # Value objects
│   │   │   ├── repositories/   # Repository interfaces (ports)
│   │   │   └── services/       # Domain services
│   │   ├── application/        # Application katmanı (use cases)
│   │   │   ├── use-cases/      # Use case implementations
│   │   │   └── dto/            # Data Transfer Objects
│   │   ├── infrastructure/     # Infrastructure katmanı
│   │   │   ├── api/            # API clients
│   │   │   └── repositories/   # Repository implementations (adapters)
│   │   ├── presentation/       # Presentation katmanı
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── stores/         # State management (Zustand)
│   │   │   └── pages/          # Page components (Next.js)
│   │   └── index.ts            # Public API (barrel export)
│   ├── stories/
│   └── reading/
├── shared/                      # Shared kernel
│   ├── kernel/                 # Common domain logic
│   │   ├── types/              # Shared types
│   │   └── utils/              # Shared utilities
│   ├── lib/                    # Infrastructure utilities
│   │   └── api-client.ts       # HTTP client setup
│   └── ui/                     # Shared UI components
│       └── components/         # Reusable UI components
└── app/                        # Next.js App Router pages
    └── [feature]/
        └── page.tsx            # Routes to feature pages
```

## 🏗️ Clean Architecture Katmanları

### 1. Domain Layer (İş Mantığı)
**Bağımlılık Yok** - En içteki katman, hiçbir şeye bağımlı değil.

- **Entities**: İş kurallarını içeren domain modelleri
- **Value Objects**: Değer nesneleri (immutable)
- **Repository Interfaces (Ports)**: Data erişimi için kontratlar
- **Domain Services**: Birden fazla entity'yi kullanan iş mantığı

**Örnek:**
```typescript
// features/auth/domain/entities/user.entity.ts
export class UserEntity {
  get isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }
  
  canPerformAction(): boolean {
    return this.isEmailVerified;
  }
}
```

### 2. Application Layer (Use Cases)
**Sadece Domain'e bağımlı** - İş akışlarını koordine eder.

- **Use Cases**: Tek bir iş operasyonunu temsil eden sınıflar
- **DTOs**: Katmanlar arası veri transfer nesneleri

**Örnek:**
```typescript
// features/auth/application/use-cases/login.use-case.ts
export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}
  
  async execute(request: LoginRequestDto): Promise<UserEntity> {
    const credentials = LoginCredentials.create(request);
    return await this.authRepository.login(credentials);
  }
}
```

### 3. Infrastructure Layer (Teknik Detaylar)
**Application ve Domain'e bağımlı** - Harici sistemlerle iletişim.

- **API Clients**: HTTP istekleri
- **Repository Implementations**: Port'ların somut implementasyonları

**Örnek:**
```typescript
// features/auth/infrastructure/repositories/auth.repository.impl.ts
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authApi: AuthApi) {}
  
  async login(credentials: LoginCredentials): Promise<UserEntity> {
    const response = await this.authApi.login(credentials);
    return UserEntity.fromPrimitives(response.data);
  }
}
```

### 4. Presentation Layer (UI)
**Application'a bağımlı** - Kullanıcı arayüzü ve state yönetimi.

- **Components**: React bileşenleri
- **Hooks**: Custom React hooks
- **Stores**: Zustand state management
- **Pages**: Next.js sayfa bileşenleri

**Örnek:**
```typescript
// features/auth/presentation/stores/auth.store.ts
const loginUseCase = new LoginUseCase(authRepository);

export const useAuthStore = create<AuthState>()((set) => ({
  login: async (credentials) => {
    const user = await loginUseCase.execute(credentials);
    set({ user, isAuthenticated: true });
  },
}));
```

## 🎯 DDD Prensipleri

### Bounded Context (Sınırlı Bağlam)
Her feature kendi bounded context'idir ve bağımsızdır:
- `auth`: Kimlik doğrulama ve yetkilendirme
- `stories`: Hikaye yönetimi
- `reading`: Okuma deneyimi
- `profile`: Kullanıcı profili

### Aggregate Roots
Her feature'ın aggregate root'u vardır:
- **Auth**: `UserEntity`
- **Stories**: `StoryEntity`

### Value Objects
Immutable değer nesneleri:
- `Email`
- `LoginCredentials`
- `ChapterPosition`

### Domain Services
Birden fazla entity'yi koordine eden iş mantığı.

## 📦 Feature Organizasyonu

### Feature Bazlı İzolasyon
Her feature:
- ✅ Kendi domain modeline sahip
- ✅ Kendi use case'lerine sahip
- ✅ Kendi repository implementasyonuna sahip
- ✅ Kendi UI component'lerine sahip
- ✅ `index.ts` ile sınırlı public API export eder

### Feature'lar Arası İletişim
- Feature'lar birbirine **doğrudan bağımlı değildir**
- Ortak tipler `shared/kernel/types` içinde
- Ortak UI bileşenleri `shared/ui` içinde

## 🔄 Dependency Flow

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Domain
```

**Kural**: İç katmanlar dış katmanları bilmez!
- Domain, Application/Infrastructure/Presentation'ı bilmez
- Application, Infrastructure/Presentation'ı bilmez
- Infrastructure, Presentation'ı bilmez

## 📝 Kullanım Örnekleri

### Use Case Çağırma

```typescript
// Presentation Layer'da
import { LoginUseCase } from '@/features/auth/application/use-cases/login.use-case';
import { AuthRepositoryImpl } from '@/features/auth/infrastructure/repositories/auth.repository.impl';
import { AuthApi } from '@/features/auth/infrastructure/api/auth.api';

const authApi = new AuthApi();
const authRepository = new AuthRepositoryImpl(authApi);
const loginUseCase = new LoginUseCase(authRepository);

const user = await loginUseCase.execute({ email, password });
```

### Hook Kullanımı

```typescript
// Component'te
import { useAuth } from '@/features/auth';

function LoginForm() {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (data) => {
    await login(data);
  };
  
  // ...
}
```

### Public API Kullanımı

```typescript
// Feature dışından sadece public API kullanılır
import { useAuth, UserEntity } from '@/features/auth';
import { StoryEntity } from '@/features/stories';
```

## ✅ Best Practices

1. **Feature Isolation**: Feature'lar arası direkt bağımlılık yok
2. **Dependency Injection**: Use case'ler constructor'da inject edilir
3. **DTOs**: Katmanlar arası veri transferinde DTO kullan
4. **Entities**: Domain logic entity'lerde kalır
5. **Value Objects**: Primitive obsession'dan kaçın
6. **Repository Pattern**: Data erişimi interface üzerinden
7. **Use Cases**: Her use case tek bir sorumluluğa sahip
8. **Public API**: Feature'lar sadece `index.ts` üzerinden export eder

## 🚀 Yeni Feature Ekleme

1. `src/features/[feature-name]` klasörü oluştur
2. Domain katmanını tanımla (entities, value objects, repository interfaces)
3. Application katmanını oluştur (use cases, DTOs)
4. Infrastructure implementasyonunu yap (API, repository impl)
5. Presentation katmanını hazırla (components, hooks, stores)
6. `index.ts` ile public API export et
7. Next.js app router'da route oluştur

## 📚 Referanslar

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Feature-Sliced Design](https://feature-sliced.design/)

