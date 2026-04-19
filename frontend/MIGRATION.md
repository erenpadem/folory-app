# Migration Guide: Clean Architecture Refactoring

## 🎯 Genel Bakış

Proje **Feature-Based Clean Architecture** ve **DDD** prensiplerine göre yeniden yapılandırılmıştır.

## 📋 Değişiklikler

### Eski Yapı
```
src/
├── components/        # Tüm componentler karışık
├── hooks/            # Tüm hooks karışık
├── services/         # Servisler
├── stores/           # Stores
├── types/            # Tüm tipler karışık
└── lib/              # Utilities
```

### Yeni Yapı
```
src/
├── features/         # Feature bazlı modüller
│   ├── auth/
│   ├── stories/
│   └── reading/
├── shared/           # Ortak kod
│   ├── kernel/       # Domain logic
│   ├── lib/          # Infrastructure
│   └── ui/           # UI components
└── app/              # Next.js pages
```

## 🔄 Migration Adımları

### 1. Auth Feature Migration

#### Eski Kullanım:
```typescript
// Eski
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { User } from '@/types/auth';
```

#### Yeni Kullanım:
```typescript
// Yeni
import { useAuth, UserEntity } from '@/features/auth';
// veya spesifik import
import { useAuth } from '@/features/auth';
import type { LoginRequestDto } from '@/features/auth';
```

#### Store Kullanımı:
```typescript
// Eski
import { useAuthStore } from '@/stores/auth.store';

// Yeni - Aynı interface, ama yeni lokasyonda
import { useAuthStore } from '@/features/auth/presentation/stores/auth.store';
// veya hook üzerinden
import { useAuth } from '@/features/auth';
```

### 2. Stories Feature Migration

#### Eski Kullanım:
```typescript
// Eski
import { Story } from '@/types/story';
import { fetchStories } from '@/lib/api/story/api';
```

#### Yeni Kullanım:
```typescript
// Yeni
import { StoryEntity } from '@/features/stories';
import type { StoryFiltersDto } from '@/features/stories';

// Use case kullanımı
import { GetStoriesUseCase } from '@/features/stories/application/use-cases/get-stories.use-case';
import { StoryRepositoryImpl } from '@/features/stories/infrastructure/repositories/story.repository.impl';
import { StoryApi } from '@/features/stories/infrastructure/api/story.api';

const storyApi = new StoryApi();
const storyRepository = new StoryRepositoryImpl(storyApi);
const getStoriesUseCase = new GetStoriesUseCase(storyRepository);

const stories = await getStoriesUseCase.execute({ page: 1, per_page: 10 });
```

### 3. Component Migration

#### Eski Component:
```typescript
// components/Auth/AuthForm.tsx
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/auth';

export function AuthForm() {
  const { login, loading } = useAuth();
  // ...
}
```

#### Yeni Component:
```typescript
// features/auth/presentation/components/AuthForm.tsx
import { useAuth } from '../hooks/use-auth.hook';
import type { LoginRequestDto } from '../../application/dto/auth.dto';

export function AuthForm() {
  const { login, loading } = useAuth();
  
  const handleSubmit = async (data: LoginRequestDto) => {
    await login(data);
  };
  // ...
}
```

### 4. Page Migration

#### Eski Page:
```typescript
// app/auth/login/page.tsx
'use client';
import { AuthForm } from '@/components/Auth/AuthForm';

export default function LoginPage() {
  return <AuthForm />;
}
```

#### Yeni Page:
```typescript
// app/auth/login/page.tsx
'use client';
import { AuthForm } from '@/features/auth/presentation/components/AuthForm';

export default function LoginPage() {
  return <AuthForm />;
}
```

## 📝 Import Path Güncellemeleri

### TypeScript Path Mapping

`tsconfig.json` dosyasına şu path mapping'leri ekleyin:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

### ESLint Import Rules

ESLint kurallarını güncelleyin:

```javascript
// eslint.config.mjs
export default {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/features/*/domain/**',
            from: './src/features/*/infrastructure/**',
            message: 'Domain layer should not import from infrastructure',
          },
          {
            target: './src/features/*/domain/**',
            from: './src/features/*/presentation/**',
            message: 'Domain layer should not import from presentation',
          },
          {
            target: './src/features/*/application/**',
            from: './src/features/*/presentation/**',
            message: 'Application layer should not import from presentation',
          },
        ],
      },
    ],
  },
};
```

## 🔧 Adım Adım Migration Checklist

### Phase 1: Auth Feature ✅
- [x] Domain entities oluşturuldu
- [x] Value objects oluşturuldu
- [x] Repository interfaces tanımlandı
- [x] Use cases implement edildi
- [x] Infrastructure repositories implement edildi
- [x] Presentation store ve hooks taşındı
- [x] Public API export edildi

### Phase 2: Stories Feature ✅
- [x] Domain entities oluşturuldu
- [x] Repository interfaces tanımlandı
- [x] Use cases implement edildi
- [x] Infrastructure repositories implement edildi
- [x] Public API export edildi

### Phase 3: Component Migration
- [ ] Auth components taşınacak
- [ ] Story components taşınacak
- [ ] Reading components taşınacak
- [ ] Profile components taşınacak

### Phase 4: Pages Update
- [ ] Auth pages güncellenecek
- [ ] Story pages güncellenecek
- [ ] Dashboard pages güncellenecek

### Phase 5: Cleanup
- [ ] Eski dosyalar silinecek
- [ ] Eski importlar temizlenecek
- [ ] Test dosyaları güncellenecek

## 🚨 Breaking Changes

### 1. Type Exports
- `User` type artık `UserEntity` class olarak export ediliyor
- `Story` type artık `StoryEntity` class olarak export ediliyor
- Entity'ler class olduğu için primitive object'lerden farklı kullanılmalı

### 2. Service Calls
- Direkt service çağrıları yerine use case'ler kullanılmalı
- Repository pattern üzerinden çalışılmalı

### 3. Import Paths
- Tüm feature bazlı importlar güncellenmeli
- Eski `@/types/*`, `@/services/*` importları kaldırılmalı

## 💡 Best Practices

### Do's ✅
- Feature'lar arası direkt bağımlılık kurmayın
- Sadece public API'leri import edin (`@/features/*/index.ts`)
- Use case'leri presentation layer'da kullanın
- Domain logic'i entity'lerde tutun

### Don'ts ❌
- Domain layer'dan infrastructure'a bağımlılık kurmayın
- Feature'lar arası direkt entity import etmeyin
- Use case'leri domain layer'da kullanmayın
- Infrastructure logic'i domain'e koymayın

## 📚 Örnekler

Daha fazla örnek için `ARCHITECTURE.md` dosyasına bakın.

## 🐛 Sorun Giderme

### Import Hatası
```
Cannot find module '@/features/auth'
```
**Çözüm**: `src/features/auth/index.ts` dosyasının export'larını kontrol edin.

### Circular Dependency
```
Circular dependency detected
```
**Çözüm**: Dependency flow'u kontrol edin. Domain → Application → Infrastructure → Presentation sırası olmalı.

### Type Errors
```
Property 'isEmailVerified' does not exist on type 'User'
```
**Çözüm**: `User` type yerine `UserEntity` class'ını kullanın. Primitive object yerine entity instance kullanın.

## 📞 Yardım

Migration sırasında sorun yaşarsanız:
1. `ARCHITECTURE.md` dosyasını kontrol edin
2. Feature örneklerini inceleyin (`features/auth`, `features/stories`)
3. Lint hatalarını kontrol edin

