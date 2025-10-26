# Code Snippets - 개인 코드 저장소

마크다운 형식으로 코드 스니펫을 저장하고 관리하는 개인 저장소입니다.

## 특징

- **마크다운 지원**: 코드와 문서를 마크다운으로 작성
- **신택스 하이라이팅**: 다양한 언어의 코드 블록 지원
- **카테고리/태그**: 코드 분류 및 검색
- **MySQL + Docker**: 간편한 배포 및 관리
- **페이지네이션**: 대량의 스니펫 효율적 관리

## 기술 스택

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- MySQL 8.0
- Docker

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Markdown
- Syntax Highlighter

## 빠른 시작 (Docker 사용)

### 1. Docker Compose로 실행

```bash
# 프로젝트 루트에서
docker-compose up -d
```

이 명령어로 다음이 실행됩니다:
- MySQL 데이터베이스 (포트 3306)
- FastAPI 백엔드 (포트 8000)

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

### 3. 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

## 로컬 개발 (Docker 없이)

### Backend 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행 (SQLite 사용)
uvicorn app.main:app --reload
```

### Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 데이터베이스 설정

### MySQL (Docker 사용)

`docker-compose.yml`에 설정된 환경 변수:

```yaml
MYSQL_ROOT_PASSWORD: rootpassword
MYSQL_DATABASE: codesnippets
MYSQL_USER: snippetuser
MYSQL_PASSWORD: snippetpass
```

### SQLite (로컬 개발)

환경 변수 없이 실행하면 자동으로 SQLite를 사용합니다.

## 사용법

### 1. 코드 스니펫 작성

- **제목**: 스니펫의 제목
- **작성자**: 작성자명
- **카테고리**: Python, JavaScript, SQL 등
- **태그**: 관련 태그 (쉼표로 구분)
- **언어**: 신택스 하이라이팅 언어
- **마크다운**: 체크하면 마크다운 렌더링

### 2. 마크다운 예시

````markdown
# Python 리스트 컴프리헨션

리스트 컴프리헨션은 파이썬의 강력한 기능입니다.

## 기본 문법

```python
# 1부터 10까지 제곱 리스트
squares = [x**2 for x in range(1, 11)]
print(squares)
```

## 조건부 리스트 컴프리헨션

```python
# 짝수만 필터링
evens = [x for x in range(20) if x % 2 == 0]
```

## 장점
- 간결한 코드
- 빠른 실행 속도
- 가독성 향상
````

### 3. 검색 및 필터링

- 제목/내용 검색 가능
- 카테고리별 필터링
- 태그로 관련 스니펫 찾기

## Docker 명령어

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 컨테이너 재시작
docker-compose restart

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
docker-compose down -v
docker-compose up -d
```

## 프로젝트 구조

```
codesnippets/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── database.py       # DB 연결
│   │   ├── models/
│   │   │   └── post.py           # Post 모델 (카테고리, 태그 포함)
│   │   ├── routes/
│   │   │   └── posts.py          # API 엔드포인트
│   │   ├── schemas/
│   │   │   └── post.py           # Pydantic 스키마
│   │   └── main.py               # FastAPI 앱
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── posts/                # 게시글 페이지
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── PostList.tsx          # 목록 (카테고리, 태그 표시)
│   │   ├── PostDetail.tsx        # 상세 (마크다운 렌더링)
│   │   ├── PostForm.tsx          # 작성/수정 폼
│   │   ├── MarkdownPreview.tsx   # 마크다운 프리뷰
│   │   └── Pagination.tsx
│   ├── lib/
│   │   └── api.ts                # API 클라이언트
│   └── types/
│       └── post.ts               # TypeScript 타입
├── docker-compose.yml
└── README.md
```

## API 엔드포인트

- `GET /api/posts` - 스니펫 목록 (페이지네이션, 검색)
- `GET /api/posts/{id}` - 특정 스니펫 조회
- `POST /api/posts` - 스니펫 생성
- `PUT /api/posts/{id}` - 스니펫 수정
- `DELETE /api/posts/{id}` - 스니펫 삭제

## 환경 변수

### Backend (선택사항)

```bash
# mysqlclient 사용
DATABASE_URL=mysql://snippetuser:snippetpass@localhost:3306/codesnippets
```

### Frontend

`.env.local` 파일:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 문제 해결

### MySQL 연결 오류

```bash
# MySQL 컨테이너 상태 확인
docker-compose ps

# MySQL 로그 확인
docker-compose logs mysql

# 컨테이너 재시작
docker-compose restart mysql
```

### 포트 충돌

다른 서비스가 3306, 8000, 3000 포트를 사용 중이면 `docker-compose.yml`의 포트를 변경하세요.

## 향후 개선 사항

- [ ] 사용자 인증 시스템
- [ ] 코드 실행 기능
- [ ] 다크모드 완전 지원
- [ ] 북마크 기능
- [ ] 코드 공유 링크
- [ ] 전체 텍스트 검색 (Elasticsearch)

## 라이선스

개인 사용 목적의 프로젝트입니다.
