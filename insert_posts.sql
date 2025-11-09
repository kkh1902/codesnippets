-- 게시물 1: 총정리
INSERT INTO posts (title, content, author, language, is_markdown, created_at) VALUES
('🔐 로그인 세션 관리 방법 총정리',
'# 🔐 로그인 세션 관리 방법 총정리

웹 애플리케이션에서 사용자 로그인 상태를 관리하는 다양한 방법들을 비교 분석합니다.

## 📋 주요 방법 4가지

### 1️⃣ JWT + LocalStorage
- **난이도**: ⭐ (매우 쉬움)
- **보안**: ⭐⭐ (낮음)
- **추천**: 개발/테스트 환경

### 2️⃣ JWT + HttpOnly Cookie
- **난이도**: ⭐⭐ (쉬움)
- **보안**: ⭐⭐⭐⭐ (높음)
- **추천**: 일반 프로덕션 환경 ✅

### 3️⃣ 세션 기반 (Redis)
- **난이도**: ⭐⭐⭐ (보통)
- **보안**: ⭐⭐⭐⭐ (높음)
- **추천**: 대규모 서비스

### 4️⃣ Refresh Token 패턴
- **난이도**: ⭐⭐⭐⭐ (어려움)
- **보안**: ⭐⭐⭐⭐⭐ (최고)
- **추천**: 엔터프라이즈급 프로덕션 🏆

---

## 📊 비교표

| 방법 | XSS 방어 | CSRF 방어 | 서버 부하 | 확장성 | 구현 복잡도 |
|------|---------|----------|---------|--------|-----------|
| JWT + LocalStorage | ❌ | ✅ | 낮음 | 높음 | 낮음 |
| JWT + HttpOnly Cookie | ✅ | ⚠️ | 낮음 | 높음 | 낮음 |
| 세션 기반 | ✅ | ⚠️ | 높음 | 보통 | 보통 |
| Refresh Token | ✅ | ✅ | 낮음 | 높음 | 높음 |

---

## 🎯 선택 가이드

### 프로토타입/개발 중
→ **JWT + LocalStorage**

### 소규모 프로덕션
→ **JWT + HttpOnly Cookie**

### 대규모 서비스
→ **세션 기반**

### 보안이 최우선
→ **Refresh Token**

---

## 🔍 다음 게시물 미리보기

2. **JWT + LocalStorage**: 가장 간단한 구현
3. **JWT + HttpOnly Cookie**: 보안 강화 버전
4. **세션 기반**: 서버 중심 관리
5. **Refresh Token**: 완벽한 보안 구현

각 방법의 **전체 코드**와 **단계별 설명**을 제공합니다!',
'admin', 'markdown', 1, NOW());

-- 게시물 2: JWT + LocalStorage
INSERT INTO posts (title, content, author, language, is_markdown, created_at) VALUES
('1️⃣ JWT + LocalStorage 방식',
'# 1️⃣ JWT + LocalStorage 방식

가장 간단하고 빠르게 구현할 수 있는 방법입니다. 현재 프로젝트에서 사용 중인 방식입니다.

## 🎯 동작 원리

```
1. 사용자 로그인
2. 서버가 JWT 토큰 생성
3. 클라이언트가 localStorage에 저장
4. API 요청 시 토큰을 헤더에 포함
5. 서버가 토큰 검증
```

---

## 💻 백엔드 코드 (FastAPI)

### 1. 토큰 생성 함수
```python
# backend/app/core/security.py
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### 2. 로그인 API
```python
# backend/app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import timedelta

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # 사용자 인증
    user = db.query(User).filter(User.username == login_data.username).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="인증 실패")

    # JWT 토큰 생성 (30분 유효)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
```

---

## 🌐 프론트엔드 코드 (React/Next.js)

### 1. 로그인 처리
```typescript
// app/auth/login/page.tsx
const handleLogin = async (username: string, password: string) => {
  try {
    const response = await axios.post(\'/api/auth/login\', {
      username,
      password
    });

    const { access_token } = response.data;

    // localStorage에 저장
    localStorage.setItem(\'token\', access_token);
    localStorage.setItem(\'username\', username);

    alert(\'로그인 성공!\');
    router.push(\'/\');
  } catch (error) {
    alert(\'로그인 실패\');
  }
};
```

### 2. API 요청 시 토큰 포함
```typescript
// lib/api.ts
import axios from \'axios\';

const api = axios.create({
  baseURL: \'http://localhost:8000\'
});

// 요청 인터셉터: 모든 요청에 토큰 자동 포함
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(\'token\');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

---

## ✅ 장점

1. **구현이 매우 간단함**
2. **서버가 상태를 저장할 필요 없음** (Stateless)
3. **확장성이 좋음** (서버 여러 대도 OK)
4. **빠른 프로토타이핑에 적합**

## ❌ 단점

1. **XSS 공격에 취약**
   - JavaScript로 localStorage 접근 가능
   - 악성 스크립트가 토큰 탈취 가능

2. **토큰 만료 전까지 강제 로그아웃 불가**
   - 서버에서 토큰 무효화 불가능

3. **민감한 정보 저장 부적합**
   - 개발자 도구에서 쉽게 확인 가능

---

## 🎓 결론

**언제 사용?**
- ✅ 개발/테스트 환경
- ✅ 빠른 프로토타이핑
- ✅ 보안이 덜 중요한 내부 툴

**프로덕션에서는?**
- ⚠️ HttpOnly Cookie로 전환 권장
- ⚠️ Refresh Token 패턴 고려',
'admin', 'markdown', 1, NOW());

-- 게시물 3: JWT + HttpOnly Cookie
INSERT INTO posts (title, content, author, language, is_markdown, created_at) VALUES
('2️⃣ JWT + HttpOnly Cookie 방식',
'# 2️⃣ JWT + HttpOnly Cookie 방식

LocalStorage의 보안 문제를 해결한 개선 버전입니다. **프로덕션 환경에서 가장 권장되는 방식**입니다.

## 🎯 동작 원리

```
1. 사용자 로그인
2. 서버가 JWT 토큰 생성
3. 서버가 HttpOnly Cookie로 토큰 전송
4. 브라우저가 자동으로 쿠키 포함하여 요청
5. 서버가 쿠키에서 토큰 추출 및 검증
```

---

## 💻 백엔드 코드 (FastAPI)

### 1. 로그인 API (쿠키 설정)
```python
from fastapi import APIRouter, Response

@router.post("/login")
def login(
    login_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    # 사용자 인증
    user = db.query(User).filter(User.username == login_data.username).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="인증 실패")

    # JWT 토큰 생성
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=30)
    )

    # HttpOnly Cookie로 설정
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,          # JavaScript 접근 불가 ✅
        secure=True,            # HTTPS only (프로덕션)
        samesite="lax",         # CSRF 방지
        max_age=1800,           # 30분 (초 단위)
        path="/"                # 모든 경로에서 사용
    )

    return {
        "message": "로그인 성공",
        "username": user.username
    }
```

### 2. CORS 설정 (중요!)
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # 쿠키 전송 허용 ✅
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🌐 프론트엔드 코드

### 1. Axios 설정 (쿠키 자동 포함)
```typescript
// lib/api.ts
import axios from \'axios\';

const api = axios.create({
  baseURL: \'http://localhost:8000\',
  withCredentials: true  // 쿠키 자동 포함 ✅
});

export default api;
```

### 2. 로그인 처리
```typescript
import api from \'@/lib/api\';

const handleLogin = async (username: string, password: string) => {
  try {
    const response = await api.post(\'/api/auth/login\', {
      username,
      password
    });

    // 쿠키는 자동으로 저장됨!
    localStorage.setItem(\'username\', response.data.username);

    alert(\'로그인 성공!\');
    router.push(\'/\');
  } catch (error) {
    alert(\'로그인 실패\');
  }
};
```

---

## ✅ 장점

1. **XSS 공격 방어**
   - JavaScript로 쿠키 접근 불가
   - 토큰 탈취 어려움

2. **자동 전송**
   - 브라우저가 자동으로 쿠키 포함
   - 코드 간소화

3. **구현이 비교적 간단**
   - LocalStorage 방식에서 쉽게 전환 가능

## ❌ 단점

1. **CSRF 공격 가능성**
   - SameSite 설정으로 완화 가능

2. **모바일 앱에서 사용 어려움**
   - Native 앱은 쿠키 관리 복잡

---

## 🎓 결론

**언제 사용?**
- ✅ 대부분의 프로덕션 웹 앱
- ✅ 보안이 중요한 서비스
- ✅ B2C 서비스

👉 **가장 균형 잡힌 선택!**',
'admin', 'markdown', 1, NOW());

-- 게시물 4: 세션 기반
INSERT INTO posts (title, content, author, language, is_markdown, created_at) VALUES
('3️⃣ 세션 기반 (Redis) 방식',
'# 3️⃣ 세션 기반 (Redis) 방식

서버에서 세션 상태를 관리하는 전통적인 방식입니다. **실시간 제어가 필요한 대규모 서비스**에 적합합니다.

## 🎯 동작 원리

```
1. 사용자 로그인
2. 서버가 세션 ID 생성 → Redis 저장
3. 클라이언트에 세션 ID 쿠키 전송
4. API 요청 시 세션 ID로 Redis 조회
5. 세션 데이터로 사용자 식별
```

---

## 💻 백엔드 코드 (FastAPI + Redis)

### 1. Redis 설정
```python
# backend/app/core/redis_client.py
import redis
import uuid
import json

redis_client = redis.Redis(
    host=\'localhost\',
    port=6379,
    db=0,
    decode_responses=True
)

class SessionManager:
    def __init__(self):
        self.redis = redis_client
        self.prefix = "session:"
        self.ttl = 3600  # 1시간

    def create_session(self, username: str) -> str:
        session_id = str(uuid.uuid4())

        session_data = {
            "username": username,
            "created_at": datetime.utcnow().isoformat()
        }

        # Redis에 저장 (1시간 TTL)
        key = f"{self.prefix}{session_id}"
        self.redis.setex(
            key,
            self.ttl,
            json.dumps(session_data)
        )

        return session_id

    def get_session(self, session_id: str):
        key = f"{self.prefix}{session_id}"
        data = self.redis.get(key)

        if data:
            return json.loads(data)
        return None
```

### 2. 로그인 API
```python
@router.post("/login")
def login(
    login_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    # 사용자 인증
    user = db.query(User).filter(User.username == login_data.username).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="인증 실패")

    # 세션 생성
    session_id = session_manager.create_session(user.username)

    # 세션 ID를 HttpOnly 쿠키로 전송
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600  # 1시간
    )

    return {
        "message": "로그인 성공",
        "username": user.username
    }
```

---

## 🐳 Docker Compose 설정

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
```

---

## ✅ 장점

1. **실시간 제어 가능**
   - 즉시 세션 무효화 (강제 로그아웃)
   - 동시 로그인 제한

2. **다중 기기 관리**
   - 각 기기별 세션 추적
   - 특정 기기만 로그아웃

3. **보안성 우수**
   - 서버에서 모든 것을 제어

## ❌ 단점

1. **서버 부하 증가**
   - 모든 요청마다 Redis 조회
   - 메모리 사용량 증가

2. **확장성 제약**
   - Redis 클러스터 구성 필요

3. **비용 증가**
   - Redis 서버 운영 비용

---

## 🎓 결론

**언제 사용?**
- ✅ 대규모 서비스 (수만 명 이상)
- ✅ 실시간 세션 제어 필요
- ✅ 동시 로그인 제한
- ✅ 기기별 세션 관리

👉 **엔터프라이즈급 서비스의 선택!**',
'admin', 'markdown', 1, NOW());

-- 게시물 5: Refresh Token
INSERT INTO posts (title, content, author, language, is_markdown, created_at) VALUES
('4️⃣ Refresh Token 패턴',
'# 4️⃣ Refresh Token 패턴

**보안**과 **사용자 경험**을 모두 만족시키는 최고급 인증 방식입니다. 대부분의 **프로덕션 서비스**에서 사용합니다.

## 🎯 동작 원리

```
1. 로그인 성공
2. Access Token (15분) + Refresh Token (7일) 발급
3. Access Token으로 API 호출
4. Access Token 만료 시
5. Refresh Token으로 새 Access Token 발급
6. 계속 사용...
```

---

## 🔑 Two Token 전략

### Access Token (단기)
- **용도**: API 인증
- **저장**: localStorage or 메모리
- **만료**: 15분
- **노출 OK**: 짧은 시간만 유효

### Refresh Token (장기)
- **용도**: Access Token 갱신
- **저장**: HttpOnly Cookie
- **만료**: 7일 ~ 30일
- **노출 NG**: 절대 보호

---

## 💻 백엔드 코드 (FastAPI)

### 1. 토큰 생성 함수
```python
SECRET_KEY = "your-secret-key"
REFRESH_SECRET_KEY = "your-refresh-secret-key"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
```

### 2. 로그인 API (두 토큰 발급)
```python
@router.post("/login")
def login(
    login_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    # 사용자 인증
    user = db.query(User).filter(User.username == login_data.username).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="인증 실패")

    # Access Token (15분)
    access_token = create_access_token(data={"sub": user.username})

    # Refresh Token (7일)
    refresh_token = create_refresh_token(data={"sub": user.username})

    # Refresh Token은 HttpOnly Cookie로
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,      # JavaScript 접근 불가
        secure=True,        # HTTPS only
        samesite="strict",  # CSRF 방지
        max_age=7*24*60*60  # 7일
    )

    # Access Token은 응답으로
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }
```

### 3. 토큰 갱신 API
```python
@router.post("/refresh")
def refresh_token(
    refresh_token: str = Cookie(None),
    response: Response = None
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token 없음")

    # Refresh Token 검증
    payload = verify_refresh_token(refresh_token)
    username = payload.get("sub")

    # 새 Access Token 발급
    new_access_token = create_access_token(data={"sub": username})

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
```

---

## 🌐 프론트엔드 코드 (React/Next.js)

### API 인터셉터 (자동 갱신)
```typescript
// 응답 인터셉터: 401 시 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도 안했으면
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 받기
        const response = await axios.post(
          \'http://localhost:8000/api/auth/refresh\',
          {},
          { withCredentials: true }
        );

        const { access_token } = response.data;
        localStorage.setItem(\'access_token\', access_token);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh Token도 만료됨 → 로그인 페이지
        localStorage.removeItem(\'access_token\');
        window.location.href = \'/auth/login\';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## ✅ 장점

1. **보안 + 사용자 경험**
   - Access Token 짧아서 안전
   - 자동 갱신으로 끊김 없음

2. **XSS 방어**
   - Refresh Token은 HttpOnly
   - Access Token 탈취해도 15분만 유효

3. **강제 로그아웃 가능**
   - Refresh Token 블랙리스트
   - 즉시 세션 무효화

4. **다중 기기 지원**
   - 각 기기별 Refresh Token

## ❌ 단점

1. **구현 복잡도 높음**
   - 토큰 갱신 로직 복잡
   - 에러 처리 까다로움

2. **서버 부하 증가**
   - Redis 블랙리스트 관리
   - 토큰 갱신 요청 증가

---

## 🎓 결론

**언제 사용?**
- ✅ 모든 프로덕션 웹 앱
- ✅ 모바일 앱
- ✅ 보안이 최우선
- ✅ 사용자 경험 중요

👉 **업계 표준! 완벽한 인증 시스템!**

---

## 📚 참고

- OAuth 2.0도 동일한 패턴 사용
- Google, Facebook 모두 이 방식
- JWT Best Practices 준수',
'admin', 'markdown', 1, NOW());
