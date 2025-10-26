# Board API - FastAPI Backend

간단한 게시판 API 서버입니다.

## 기능

- 게시글 CRUD (생성, 조회, 수정, 삭제)
- 페이지네이션
- 검색 기능
- 조회수 카운팅

## 기술 스택

- FastAPI
- SQLAlchemy (ORM)
- SQLite (데이터베이스)
- Pydantic (데이터 검증)

## 설치 및 실행

### 1. 가상환경 생성 및 활성화

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
# backend 디렉토리에서 실행
cd backend
uvicorn app.main:app --reload
```

서버는 `http://localhost:8000`에서 실행됩니다.

## API 문서

서버 실행 후 다음 URL에서 자동 생성된 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 엔드포인트

### 게시글

- `GET /api/posts` - 게시글 목록 조회 (페이지네이션, 검색 지원)
- `GET /api/posts/{post_id}` - 특정 게시글 조회
- `POST /api/posts` - 게시글 생성
- `PUT /api/posts/{post_id}` - 게시글 수정
- `DELETE /api/posts/{post_id}` - 게시글 삭제

### 헬스 체크

- `GET /` - API 메시지
- `GET /health` - 헬스 체크

## 프로젝트 구조

```
backend/
├── app/
│   ├── core/
│   │   ├── __init__.py
│   │   └── database.py        # 데이터베이스 설정
│   ├── models/
│   │   ├── __init__.py
│   │   └── post.py            # Post 모델
│   ├── routes/
│   │   ├── __init__.py
│   │   └── posts.py           # 게시글 라우트
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── post.py            # Pydantic 스키마
│   ├── __init__.py
│   └── main.py                # FastAPI 애플리케이션
├── requirements.txt
└── README.md
```

## 사용 예시

### 게시글 생성

```bash
curl -X POST "http://localhost:8000/api/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 번째 게시글",
    "content": "게시글 내용입니다.",
    "author": "홍길동"
  }'
```

### 게시글 목록 조회

```bash
curl "http://localhost:8000/api/posts?page=1&page_size=10"
```

### 게시글 검색

```bash
curl "http://localhost:8000/api/posts?search=검색어"
```
