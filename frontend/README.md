# 게시판 Frontend - Next.js

FastAPI 백엔드와 연동되는 게시판 프론트엔드입니다.

## 기능

- 게시글 목록 조회 (페이지네이션)
- 게시글 상세 보기
- 게시글 작성
- 게시글 수정
- 게시글 삭제
- 게시글 검색

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Axios

## 설치 및 실행

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

백엔드 API 주소가 다른 경우 수정하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어주세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
frontend/
├── app/
│   ├── posts/
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx      # 게시글 수정 페이지
│   │   │   └── page.tsx          # 게시글 상세 페이지
│   │   └── new/
│   │       └── page.tsx          # 게시글 작성 페이지
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지 (게시글 목록)
├── components/
│   ├── PostList.tsx              # 게시글 목록 컴포넌트
│   ├── PostDetail.tsx            # 게시글 상세 컴포넌트
│   ├── PostForm.tsx              # 게시글 작성/수정 폼
│   └── Pagination.tsx            # 페이지네이션 컴포넌트
├── lib/
│   └── api.ts                    # API 클라이언트
├── types/
│   └── post.ts                   # TypeScript 타입 정의
├── .env.local                    # 환경 변수
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 페이지 구성

### 메인 페이지 (`/`)
- 게시글 목록 표시
- 페이지네이션
- 검색 기능
- 글쓰기 버튼

### 게시글 상세 (`/posts/[id]`)
- 게시글 내용 표시
- 조회수 자동 증가
- 수정/삭제 버튼

### 게시글 작성 (`/posts/new`)
- 제목, 작성자, 내용 입력
- 유효성 검사

### 게시글 수정 (`/posts/[id]/edit`)
- 기존 내용 불러오기
- 제목, 내용 수정 가능
- 작성자는 수정 불가

## 사용 방법

### 백엔드 서버 먼저 실행

프론트엔드를 실행하기 전에 반드시 백엔드 서버가 실행 중이어야 합니다:

```bash
# backend 디렉토리에서
cd backend
uvicorn app.main:app --reload
```

백엔드 서버: http://localhost:8000
프론트엔드 서버: http://localhost:3000

## API 연동

API 통신은 [lib/api.ts](lib/api.ts)에서 관리됩니다:

- `getPosts()` - 게시글 목록 조회
- `getPost(id)` - 게시글 상세 조회
- `createPost(data)` - 게시글 작성
- `updatePost(id, data)` - 게시글 수정
- `deletePost(id)` - 게시글 삭제

## 스타일링

Tailwind CSS를 사용하여 반응형 디자인을 구현했습니다.

- 모바일 친화적 UI
- 다크모드 지원 (CSS 변수)
- 깔끔한 테이블 레이아웃
