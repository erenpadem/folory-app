# Features Directory

Bu dizin **Feature-Based Clean Architecture** prensibiyle organize edilmiştir.

## 📁 Feature Yapısı

Her feature kendi bağımsız modülü olarak organize edilmiştir:

```
features/
├── auth/              # Authentication & Authorization
│   ├── domain/        # Business logic
│   ├── application/   # Use cases
│   ├── infrastructure/# API & repositories
│   ├── presentation/  # UI components & hooks
│   └── index.ts       # Public API
├── stories/           # Story management
├── reading/           # Reading experience
└── profile/           # User profiles
```

## 🎯 Feature Eklemek

Yeni bir feature eklemek için:

1. **Domain katmanını tanımla**
   ```typescript
   // features/new-feature/domain/entities/entity.entity.ts
   export class NewEntity {
     // Domain logic
   }
   ```

2. **Use case'leri oluştur**
   ```typescript
   // features/new-feature/application/use-cases/action.use-case.ts
   export class ActionUseCase {
     async execute() {
       // Application logic
     }
   }
   ```

3. **Repository implementasyonunu yap**
   ```typescript
   // features/new-feature/infrastructure/repositories/repo.impl.ts
   export class RepositoryImpl implements Repository {
     // Infrastructure logic
   }
   ```

4. **UI katmanını hazırla**
   ```typescript
   // features/new-feature/presentation/components/Component.tsx
   export function Component() {
     // UI logic
   }
   ```

5. **Public API export et**
   ```typescript
   // features/new-feature/index.ts
   export { useHook } from './presentation/hooks/use-hook';
   export { Entity } from './domain/entities/entity';
   ```

## 📚 Mevcut Features

### Auth (`features/auth`)
Kimlik doğrulama ve yetkilendirme işlemleri.

**Public API:**
```typescript
import { useAuth, UserEntity } from '@/features/auth';
```

### Stories (`features/stories`)
Hikaye yönetimi ve işlemleri.

**Public API:**
```typescript
import { StoryEntity, ChapterEntity } from '@/features/stories';
```

## 🔒 Feature Isolation

- ✅ Her feature kendi domain modeline sahip
- ✅ Feature'lar birbirine direkt bağımlı değil
- ✅ Ortak kod `shared/` dizininde
- ✅ Sadece public API'ler export edilir

## 📖 Detaylı Bilgi

- [Clean Architecture Guide](../ARCHITECTURE.md)
- [Migration Guide](../MIGRATION.md)

