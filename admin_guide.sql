-- 관리자 관리 방법 게시글 추가
-- UTF-8 인코딩 설정
SET NAMES utf8mb4;

INSERT INTO posts (title, content, author, category_id, language, is_markdown, views, created_at) VALUES (
'FastAPI + Next.js 관리자 권한 관리 완벽 가이드',
'# FastAPI + Next.js 관리자 권한 관리 완벽 가이드

웹 애플리케이션에서 관리자 권한을 안전하게 관리하고 관리자 페이지에 대한 접근을 제어하는 방법을 단계별로 설명합니다.

---

## 📋 목차

1. [현재 시스템 분석](#현재-시스템-분석)
2. [관리자 지정 방법](#관리자-지정-방법)
3. [백엔드 권한 검증](#백엔드-권한-검증)
4. [프론트엔드 접근 제어](#프론트엔드-접근-제어)
5. [관리자 페이지 구성](#관리자-페이지-구성)
6. [보안 강화 전략](#보안-강화-전략)

---

## 🔍 현재 시스템 분석

### 데이터베이스 구조

```sql
-- users 테이블
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,  -- 관리자 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**핵심 컬럼:**
- `is_superuser`: 관리자 권한 여부 (TRUE/FALSE)
- `is_active`: 계정 활성화 여부

---

## 👑 관리자 지정 방법

### 방법 1️⃣: 데이터베이스에서 직접 수정

```sql
-- 특정 사용자를 관리자로 승격
UPDATE users
SET is_superuser = TRUE
WHERE username = ''admin'';

-- 관리자 목록 확인
SELECT id, username, email, is_superuser, created_at
FROM users
WHERE is_superuser = TRUE;
```

**장점:**
- 즉시 적용 가능
- 별도 코드 불필요

**단점:**
- 데이터베이스 직접 접근 필요
- 로그 남지 않음

---

### 방법 2️⃣: 초기 관리자 생성 스크립트

```python
# backend/create_admin.py
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_initial_admin():
    db = SessionLocal()

    # 기존 admin 계정 확인
    existing_admin = db.query(User).filter(User.username == "admin").first()

    if existing_admin:
        print("⚠️  Admin user already exists")
        return

    # 새 관리자 생성
    admin = User(
        username="admin",
        email="admin@example.com",
        full_name="System Administrator",
        hashed_password=get_password_hash("secure_password_here"),
        is_superuser=True,
        is_active=True
    )

    db.add(admin)
    db.commit()
    print("✅ Admin user created successfully")
    db.close()

if __name__ == "__main__":
    create_initial_admin()
```

**실행 방법:**
```bash
# Docker 컨테이너 내부에서
docker-compose exec backend python create_admin.py
```

---

### 방법 3️⃣: 관리자 페이지에서 권한 부여

```python
# backend/app/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.put("/users/{user_id}/promote")
def promote_to_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """관리자 권한 부여 (관리자만 가능)"""
    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if target_user.is_superuser:
        raise HTTPException(status_code=400, detail="이미 관리자입니다.")

    target_user.is_superuser = True
    db.commit()

    return {"message": f"{target_user.username}님을 관리자로 승격했습니다."}

@router.put("/users/{user_id}/demote")
def demote_from_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """관리자 권한 해제 (관리자만 가능)"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="자기 자신의 권한은 해제할 수 없습니다.")

    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    target_user.is_superuser = False
    db.commit()

    return {"message": f"{target_user.username}님의 관리자 권한을 해제했습니다."}
```

---

## 🔐 백엔드 권한 검증

### 관리자 전용 의존성 함수

```python
# backend/app/core/security.py
from fastapi import Depends, HTTPException, status

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """현재 사용자가 관리자인지 검증"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다."
        )
    return current_user
```

### 사용 예시

```python
# 관리자 전용 API
@router.get("/api/admin/users")
def get_all_users(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """전체 사용자 목록 조회 (관리자만)"""
    users = db.query(User).all()
    return users

@router.delete("/api/admin/posts/{post_id}")
def delete_any_post(
    post_id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """모든 게시글 삭제 (관리자만)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")

    db.delete(post)
    db.commit()
    return {"message": "삭제되었습니다."}
```

---

## 🖥️ 프론트엔드 접근 제어

### 1단계: 헤더에 관리자 메뉴 추가

```tsx
// components/Header.tsx
interface HeaderProps {
  username?: string | null;
  userInfo?: UserInfo | null;  // is_superuser 포함
  onLogout?: () => void;
}

export default function Header({ username, userInfo, onLogout }: HeaderProps) {
  return (
    <header>
      {username && (
        <>
          <Link href="/mypage">마이페이지</Link>

          {/* 관리자 전용 메뉴 */}
          {userInfo?.is_superuser && (
            <Link
              href="/admin"
              className="bg-purple-600 text-white"
            >
              🛠️ 관리자
            </Link>
          )}

          <button onClick={onLogout}>로그아웃</button>
        </>
      )}
    </header>
  );
}
```

### 2단계: 관리자 페이지 가드

```tsx
// app/admin/page.tsx
''use client'';

import { useState, useEffect } from ''react'';
import { useRouter } from ''next/navigation'';
import axios from ''axios'';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem(''token'');
      if (!token) {
        alert(''로그인이 필요합니다.'');
        router.push(''/auth/login'');
        return;
      }

      const response = await axios.get(
        ''http://localhost:8000/api/auth/me'',
        {
          headers: { ''Authorization'': `Bearer ${token}` }
        }
      );

      if (!response.data.is_superuser) {
        alert(''관리자 권한이 필요합니다.'');
        router.push(''/'');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert(''접근 권한 확인 실패'');
      router.push(''/'');
    }
  };

  if (loading) {
    return <div>권한 확인 중...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <h1>관리자 페이지</h1>
      {/* 관리자 전용 콘텐츠 */}
    </div>
  );
}
```

### 3단계: 재사용 가능한 관리자 가드 훅

```tsx
// hooks/useAdminGuard.ts
import { useEffect, useState } from ''react'';
import { useRouter } from ''next/navigation'';
import axios from ''axios'';

export function useAdminGuard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem(''token'');
        if (!token) throw new Error(''No token'');

        const { data } = await axios.get(''/api/auth/me'', {
          headers: { ''Authorization'': `Bearer ${token}` }
        });

        if (!data.is_superuser) {
          throw new Error(''Not admin'');
        }

        setIsAdmin(true);
      } catch (error) {
        alert(''관리자 권한이 필요합니다.'');
        router.push(''/'');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  return { isAdmin, loading };
}

// 사용 예시
export default function AdminPage() {
  const { isAdmin, loading } = useAdminGuard();

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null;

  return <div>관리자 페이지</div>;
}
```

---

## 🎯 관리자 페이지 구성

### 추천 구조

```
/admin
  ├── /dashboard        # 대시보드 (통계, 개요)
  ├── /users           # 사용자 관리
  ├── /posts           # 게시글 관리
  ├── /categories      # 카테고리 관리
  └── /settings        # 시스템 설정
```

### 사용자 관리 페이지 예시

```tsx
// app/admin/users/page.tsx
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const token = localStorage.getItem(''token'');
    const { data } = await axios.get(''/api/admin/users'', {
      headers: { ''Authorization'': `Bearer ${token}` }
    });
    setUsers(data);
  };

  const handlePromote = async (userId: number) => {
    if (!confirm(''관리자로 승격하시겠습니까?'')) return;

    const token = localStorage.getItem(''token'');
    await axios.put(`/api/admin/users/${userId}/promote`, {}, {
      headers: { ''Authorization'': `Bearer ${token}` }
    });

    alert(''승격되었습니다.'');
    fetchUsers();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>사용자명</th>
            <th>이메일</th>
            <th>권한</th>
            <th>상태</th>
            <th>가입일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {user.is_superuser ? (
                  <span className="badge-purple">관리자</span>
                ) : (
                  <span className="badge-gray">일반</span>
                )}
              </td>
              <td>
                {user.is_active ? (
                  <span className="text-green-600">활성</span>
                ) : (
                  <span className="text-red-600">비활성</span>
                )}
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                {!user.is_superuser && (
                  <button
                    onClick={() => handlePromote(user.id)}
                    className="btn-primary"
                  >
                    관리자 승격
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔒 보안 강화 전략

### 1️⃣ 다층 방어 (Defense in Depth)

```
사용자 요청
    ↓
프론트엔드 체크 (UI 숨김)
    ↓
프론트엔드 가드 (페이지 리다이렉트)
    ↓
백엔드 JWT 검증
    ↓
백엔드 권한 검증 (is_superuser)
    ↓
데이터베이스 쿼리
```

**중요:** 프론트엔드 검증만으로는 불충분합니다. 반드시 백엔드에서도 검증해야 합니다.

---

### 2️⃣ 관리자 활동 로깅

```python
# models/admin_log.py
class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50))  # "promote_user", "delete_post" 등
    target_type = Column(String(20))  # "user", "post" 등
    target_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)

# routes/admin.py
from fastapi import Request

def log_admin_action(
    db: Session,
    admin: User,
    action: str,
    target_type: str,
    target_id: int,
    request: Request
):
    log = AdminLog(
        admin_id=admin.id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        ip_address=request.client.host,
        details=f"{admin.username}이(가) {action} 작업을 수행했습니다."
    )
    db.add(log)
    db.commit()

@router.put("/users/{user_id}/promote")
def promote_to_admin(
    user_id: int,
    request: Request,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    target_user.is_superuser = True
    db.commit()

    # 관리자 활동 로그 기록
    log_admin_action(
        db, current_user, "promote_user", "user", user_id, request
    )

    return {"message": "승격되었습니다."}
```

---

### 3️⃣ 민감한 작업 추가 인증

```python
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    password: str,  # 현재 비밀번호 재확인
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """사용자 삭제 (비밀번호 재확인 필요)"""
    # 비밀번호 재확인
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="비밀번호가 일치하지 않습니다."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    db.delete(target_user)
    db.commit()

    return {"message": "삭제되었습니다."}
```

---

### 4️⃣ Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.put("/users/{user_id}/promote")
@limiter.limit("5/minute")  # 1분에 5회 제한
def promote_to_admin(request: Request, user_id: int, ...):
    # ...
    pass
```

---

### 5️⃣ JWT에 역할 정보 포함

```python
# core/security.py
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    # is_superuser 정보 추가
    if "is_superuser" not in to_encode:
        to_encode["is_superuser"] = False

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# routes/auth.py
@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()

    # JWT 생성 시 역할 정보 포함
    access_token = create_access_token(
        data={
            "sub": user.username,
            "is_superuser": user.is_superuser
        }
    )

    return {"access_token": access_token, "token_type": "bearer"}
```

---

## 📊 권한 레벨 확장 (선택사항)

더 세밀한 권한 관리가 필요한 경우:

```python
# models/user.py
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    role = Column(Enum(UserRole), default=UserRole.USER)

    def has_permission(self, required_role: UserRole) -> bool:
        role_hierarchy = {
            UserRole.USER: 0,
            UserRole.MODERATOR: 1,
            UserRole.ADMIN: 2,
            UserRole.SUPER_ADMIN: 3
        }
        return role_hierarchy[self.role] >= role_hierarchy[required_role]

# 사용 예시
def require_role(required_role: UserRole):
    def dependency(current_user: User = Depends(get_current_user)):
        if not current_user.has_permission(required_role):
            raise HTTPException(status_code=403, detail="권한이 부족합니다.")
        return current_user
    return dependency

@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(require_role(UserRole.MODERATOR))
):
    # MODERATOR 이상만 접근 가능
    pass
```

---

## ✅ 체크리스트

관리자 시스템 구현 시 확인사항:

- [ ] 백엔드에서 `get_current_admin_user()` 의존성 구현
- [ ] 프론트엔드에서 관리자 페이지 가드 구현
- [ ] 관리자 전용 API 엔드포인트 보호
- [ ] 관리자 활동 로그 기록
- [ ] 민감한 작업에 추가 인증 적용
- [ ] Rate Limiting 설정
- [ ] 자기 자신의 권한 해제 방지
- [ ] 마지막 관리자 삭제 방지
- [ ] 에러 메시지가 정보 노출하지 않는지 확인
- [ ] HTTPS 사용 (프로덕션)

---

## 🎓 요약

1. **관리자 지정**: 데이터베이스 직접 수정, 스크립트, 관리자 페이지
2. **백엔드 보호**: `get_current_admin_user()` 의존성 사용
3. **프론트엔드 제어**: 페이지 가드 + 조건부 렌더링
4. **보안 강화**: 다층 방어, 로깅, 추가 인증, Rate Limiting
5. **확장성**: 필요시 역할 기반 권한 시스템으로 확장

**핵심 원칙:** 절대로 프론트엔드만 믿지 마세요. 백엔드에서 반드시 검증하세요! 🔐',
'admin',
28,
'python',
1,
0,
NOW()
);
