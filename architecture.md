# Code Snippets Platform - Architecture Documentation

## 목차
1. [시스템 개요](#시스템-개요)
2. [기술 스택](#기술-스택)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [RAG (Retrieval-Augmented Generation) 시스템](#rag-retrieval-augmented-generation-시스템)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [API 설계](#api-설계)
7. [프론트엔드 구조](#프론트엔드-구조)
8. [백엔드 구조](#백엔드-구조)
9. [배포 및 운영](#배포-및-운영)

---

## 시스템 개요

**Code Snippets Platform**은 개발자들이 코드 스니펫을 저장, 관리, 검색할 수 있는 플랫폼입니다. AI 기반 시맨틱 검색을 통해 자연어 질문으로 관련 코드를 찾고, LLM이 생성한 답변을 받을 수 있습니다.

### 핵심 기능
- 📝 코드 스니펫 CRUD (생성, 조회, 수정, 삭제)
- 🏷️ 계층형 카테고리 및 태그 관리
- 🔍 일반 검색 (키워드 기반)
- 🤖 AI 시맨틱 검색 (자연어 질문 → 답변 생성)
- 👤 사용자 인증 및 권한 관리
- 📊 마크다운 지원 및 코드 하이라이팅
- 📁 파일 업로드 (이미지 등)

---

## 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Python** | 3.11+ | 백엔드 언어 |
| **FastAPI** | Latest | RESTful API 프레임워크 |
| **SQLAlchemy** | Latest | ORM (Object-Relational Mapping) |
| **SQLite** | - | 관계형 데이터베이스 |
| **Pydantic** | Latest | 데이터 검증 및 직렬화 |
| **ChromaDB** | 0.4.22 | 벡터 데이터베이스 |
| **Sentence-Transformers** | 2.3.1 | 텍스트 임베딩 모델 |
| **Ollama** | 0.1.6 | 로컬 LLM 실행 플랫폼 |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15.x | React 프레임워크 |
| **TypeScript** | Latest | 타입 안전 JavaScript |
| **React** | 19.x | UI 라이브러리 |
| **Tailwind CSS** | Latest | CSS 프레임워크 |
| **Axios** | Latest | HTTP 클라이언트 |
| **React Markdown** | Latest | 마크다운 렌더링 |
| **Lucide React** | Latest | 아이콘 라이브러리 |

### AI/ML 모델
| 모델 | 용도 | 특징 |
|------|------|------|
| **jhgan/ko-sroberta-multitask** | 텍스트 임베딩 | 한국어 특화 임베딩 모델 |
| **Qwen2.5-Coder 7B** | LLM 답변 생성 | 코드 특화 오픈소스 LLM (Ollama) |

### Infrastructure
- **Docker** (선택 사항): MySQL 컨테이너 실행
- **Git**: 버전 관리

---

## 시스템 아키텍처

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│                     (http://localhost:3000)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (SSR)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  일반 검색    │  │  AI 검색     │  │  게시글 관리  │      │
│  │  (PostList)  │  │(SemanticSearch)│ │ (PostForm)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                         │ API Calls (Axios)                  │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    API Routes                           │ │
│  │  /api/posts  /api/categories  /api/tags  /api/rag/*   │ │
│  └────────┬────────────────┬───────────────┬──────────────┘ │
│           │                │               │                 │
│  ┌────────▼─────┐  ┌──────▼──────┐  ┌────▼──────────────┐  │
│  │ Posts CRUD   │  │ Categories  │  │  RAG Service      │  │
│  │              │  │  & Tags     │  │  ┌─────────────┐  │  │
│  │ - Webhooks   │  │             │  │  │ Embedding   │  │  │
│  │   to Vector  │  │             │  │  │  Service    │  │  │
│  │   DB         │  │             │  │  └──────┬──────┘  │  │
│  └────────┬─────┘  └─────────────┘  │  ┌──────▼──────┐  │  │
│           │                          │  │ LLM Service │  │  │
│           │                          │  └──────┬──────┘  │  │
│           │                          └─────────┼─────────┘  │
└───────────┼──────────────────────────────────┼─────────────┘
            │                                   │
            ▼                                   ▼
┌─────────────────────┐          ┌──────────────────────────┐
│   SQLite Database   │          │    ChromaDB (Vector DB)  │
│                     │          │                          │
│ - posts             │          │ - Embeddings (768-dim)   │
│ - categories        │          │ - Metadata               │
│ - tags              │          │ - Cosine Similarity      │
│ - users             │          │                          │
│ - post_tags         │          │ Collection:              │
│                     │          │ "code_snippets"          │
└─────────────────────┘          └──────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │   Ollama (Local LLM)   │
                                 │                        │
                                 │ qwen2.5-coder:7b       │
                                 │ (Running on GPU)       │
                                 └────────────────────────┘
```

### 데이터 흐름

#### 1. 일반 게시글 작성 흐름
```
User → Frontend → POST /api/posts → Backend
                                      │
                                      ├─> SQLite에 저장
                                      │
                                      └─> Webhook: Embedding Service
                                           │
                                           └─> ChromaDB에 벡터 저장
```

#### 2. AI 검색 흐름
```
User 질문 → Frontend → POST /api/rag/search → RAG Service
                                                    │
                                    ┌───────────────┴────────────────┐
                                    ▼                                ▼
                          Embedding Service                   LLM Service
                                    │                                │
                          1. 질문 임베딩 생성                 3. Context + 질문
                          2. ChromaDB 유사도 검색                    │
                                    │                                ▼
                                    │                         Ollama (Qwen2.5)
                                    ▼                                │
                          관련 문서 5개 반환              4. AI 답변 생성
                                    │                                │
                                    └────────────┬───────────────────┘
                                                 ▼
                                    User에게 답변 + 출처 반환
```

---

## RAG (Retrieval-Augmented Generation) 시스템

### RAG 파이프라인 상세 설명

RAG 시스템은 **검색(Retrieval)**과 **생성(Generation)** 두 단계로 구성됩니다.

#### 1단계: 임베딩 생성 및 저장

**게시글 생성/수정 시:**
```python
# 1. 텍스트 결합
combined_text = f"{title}\n\n{content}\n\nTags: {tags}\nLanguage: {language}"

# 2. 임베딩 생성 (768차원 벡터)
embedding = sentence_transformer.encode(combined_text)
# → [0.123, -0.456, 0.789, ... ] (768개 값)

# 3. ChromaDB에 저장
collection.add(
    embeddings=[embedding],
    documents=[combined_text],
    metadatas=[{"post_id": id, "title": title, ...}],
    ids=[str(post_id)]
)
```

#### 2단계: 시맨틱 검색 (Retrieval)

**사용자 질문 처리:**
```python
# 1. 사용자 질문 임베딩
query = "파이썬으로 리스트 컴프리헨션 사용하는 방법 알려줘"
query_embedding = sentence_transformer.encode(query)

# 2. 코사인 유사도 검색
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=5  # 상위 5개 문서
)

# 3. 관련 문서 반환 (유사도 순)
# Example: [
#   {"post_id": 2, "title": "Python List Comprehension", "similarity": 0.89},
#   {"post_id": 8, "title": "Python Decorators", "similarity": 0.72},
#   ...
# ]
```

#### 3단계: 답변 생성 (Generation)

**LLM 프롬프트 구성:**
```python
prompt = f"""당신은 코드 스니펫을 설명하는 전문가입니다.

다음 문서들을 참고하여 사용자의 질문에 답변하세요:

[문서 1] {doc1_title}
{doc1_content}

[문서 2] {doc2_title}
{doc2_content}

...

사용자 질문: {query}

답변 작성 시:
- 한국어로 답변하세요
- 코드 예제가 있으면 포함하세요
- 문서에 없는 내용은 추측하지 마세요
"""

# Ollama LLM 호출
response = ollama.generate(
    model="qwen2.5-coder:7b",
    prompt=prompt,
    options={"temperature": 0.7, "num_predict": 1000}
)

answer = response['response']
```

### RAG 시스템 구성 요소

#### Embedding Service ([backend/app/services/embedding_service.py](backend/app/services/embedding_service.py))
```python
class EmbeddingService:
    def __init__(self):
        # 한국어 특화 임베딩 모델
        self.model = SentenceTransformer('jhgan/ko-sroberta-multitask')

        # ChromaDB 클라이언트
        self.chroma_client = chromadb.PersistentClient(path="./chroma_data")

        # 컬렉션 (코사인 유사도 사용)
        self.collection = self.chroma_client.get_or_create_collection(
            name="code_snippets",
            metadata={"hnsw:space": "cosine"}
        )

    def add_post(self, post_id, title, content, language, tags):
        """게시글을 벡터 DB에 추가"""
        pass

    def search(self, query: str, top_k: int = 5):
        """유사한 게시글 검색"""
        pass

    def update_post(self, post_id, ...):
        """게시글 업데이트"""
        pass

    def delete_post(self, post_id):
        """게시글 삭제"""
        pass
```

#### LLM Service ([backend/app/services/llm_service.py](backend/app/services/llm_service.py))
```python
class LLMService:
    def __init__(self, model_name: str = "qwen2.5-coder:7b"):
        self.model_name = model_name

    def generate_answer(self, query: str, context_docs: List[Dict]):
        """LLM을 사용해 답변 생성"""
        prompt = self._build_prompt(query, context_docs)

        response = ollama.generate(
            model=self.model_name,
            prompt=prompt,
            options={
                "temperature": 0.7,
                "num_predict": 1000
            }
        )

        return {
            "answer": response['response'],
            "tokens": response.get('eval_count', 0)
        }
```

#### RAG Service ([backend/app/services/rag_service.py](backend/app/services/rag_service.py))
```python
class RAGService:
    def __init__(self):
        self.embedding_service = get_embedding_service()
        self.llm_service = LLMService()

    def search_and_answer(self, query: str, top_k: int = 5):
        """RAG 파이프라인 실행"""
        # 1. 시맨틱 검색
        search_results = self.embedding_service.search(query, top_k)

        # 2. LLM 답변 생성
        llm_response = self.llm_service.generate_answer(
            query=query,
            context_docs=search_results
        )

        # 3. 결과 반환
        return {
            "answer": llm_response['answer'],
            "sources": search_results,
            "tokens_used": llm_response['tokens'],
            "model": self.llm_service.model_name
        }
```

### 벡터 DB 웹훅 시스템

게시글 생성/수정/삭제 시 자동으로 벡터 DB를 업데이트합니다.

**예시: 게시글 생성 시**
```python
@router.post("/", response_model=PostResponse, status_code=201)
async def create_post(post: PostCreate, db: Session = Depends(get_db)):
    # 1. SQLite에 저장
    db_post = Post(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # 2. Webhook: Vector DB에 추가
    try:
        embedding_service = get_embedding_service()
        embedding_service.add_post(
            post_id=db_post.id,
            title=db_post.title,
            content=db_post.content,
            language=db_post.language,
            tags=db_post.tags
        )
    except Exception as e:
        print(f"Embedding 추가 실패: {e}")

    return db_post
```

---

## 데이터베이스 스키마

### SQLite 스키마

#### posts 테이블
```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50),           -- 카테고리 문자열
    tags VARCHAR(200),               -- 쉼표로 구분된 태그
    language VARCHAR(20),            -- 프로그래밍 언어
    is_markdown BOOLEAN DEFAULT TRUE,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

#### categories 테이블 (계층 구조)
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    parent_id INTEGER,               -- 부모 카테고리 (NULL이면 최상위)
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

**계층 구조 예시:**
```
Python (parent_id=NULL)
├── Web Frameworks (parent_id=1)
│   ├── FastAPI (parent_id=2)
│   └── Django (parent_id=2)
├── Data Science (parent_id=1)
└── Testing (parent_id=1)
```

#### tags 테이블 (계층 구조)
```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),                -- HEX 컬러 (#FF5733)
    parent_id INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES tags(id)
);
```

#### users 테이블
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

#### post_tags 테이블 (다대다 관계)
```sql
CREATE TABLE post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### ChromaDB 스키마

#### Collection: "code_snippets"
```json
{
  "name": "code_snippets",
  "metadata": {
    "hnsw:space": "cosine"  // 코사인 유사도 사용
  },
  "documents": [
    {
      "id": "1",  // post_id
      "embedding": [0.123, -0.456, ...],  // 768차원 벡터
      "document": "제목\n\n내용...",       // 전체 텍스트
      "metadata": {
        "post_id": 1,
        "title": "Python List Comprehension",
        "language": "python",
        "tags": "python,list-comprehension,basics",
        "created_at": "2025-11-08T12:00:00"
      }
    }
  ]
}
```

---

## API 설계

### 게시글 API

#### GET /api/posts
게시글 목록 조회 (페이지네이션, 검색)

**Query Parameters:**
```typescript
{
  page?: number          // 기본값: 1
  page_size?: number     // 기본값: 10
  search?: string        // 제목/내용 검색
  language?: string      // 언어 필터
}
```

**Response:**
```typescript
{
  total: number
  page: number
  page_size: number
  posts: Array<{
    id: number
    title: string
    content: string
    author: string
    category: string
    tags: string
    language: string
    is_markdown: boolean
    views: number
    created_at: string
    updated_at: string | null
  }>
}
```

#### POST /api/posts
게시글 생성 (+ Vector DB 저장)

**Request Body:**
```typescript
{
  title: string         // 필수
  content: string       // 필수
  author: string        // 필수
  category?: string
  tags?: string
  language?: string
  is_markdown?: boolean // 기본값: true
}
```

#### PUT /api/posts/{post_id}
게시글 수정 (+ Vector DB 업데이트)

#### DELETE /api/posts/{post_id}
게시글 삭제 (+ Vector DB 삭제)

#### GET /api/posts/{post_id}
특정 게시글 조회 (조회수 증가)

### RAG API

#### POST /api/rag/search
AI 시맨틱 검색 및 답변 생성

**Request:**
```typescript
{
  query: string         // 사용자 질문
  top_k?: number        // 검색할 문서 수 (기본값: 5)
}
```

**Response:**
```typescript
{
  answer: string        // LLM이 생성한 답변
  sources: Array<{
    post_id: number
    title: string
    content_preview: string
    language: string
    relevance_score: number  // 0~1 유사도 점수
  }>
  tokens_used: number   // 사용된 토큰 수
  model: string         // 사용된 LLM 모델명
}
```

#### GET /api/rag/health
RAG 시스템 헬스 체크

**Response:**
```typescript
{
  status: "ok"
  embedding_model: "jhgan/ko-sroberta-multitask"
  llm_model: "qwen2.5-coder:7b"
  vector_db_count: number  // 저장된 문서 수
}
```

### 카테고리 API

#### GET /api/categories/tree
계층 구조로 카테고리 반환

**Response:**
```typescript
Array<{
  id: number
  name: string
  slug: string
  icon: string
  children: Array<Category>  // 재귀적 구조
}>
```

### 태그 API

#### GET /api/tags/tree
계층 구조로 태그 반환

### 인증 API

#### POST /api/auth/login
로그인 (JWT 토큰 발급)

#### POST /api/auth/register
회원가입

---

## 프론트엔드 구조

### 디렉토리 구조
```
frontend/
├── app/
│   ├── layout.tsx              # 전역 레이아웃
│   ├── page.tsx                # 메인 페이지 (검색 + AI 검색)
│   ├── posts/
│   │   ├── [id]/
│   │   │   └── page.tsx        # 게시글 상세
│   │   └── new/
│   │       └── page.tsx        # 게시글 작성
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx        # 카테고리별 게시글
│   ├── tags/
│   │   └── [slug]/
│   │       └── page.tsx        # 태그별 게시글
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx        # 로그인
│   │   └── register/
│   │       └── page.tsx        # 회원가입
│   └── mypage/
│       └── page.tsx            # 마이페이지
│
├── components/
│   ├── Header.tsx              # 헤더 (로고, 네비게이션)
│   ├── Sidebar.tsx             # 카테고리 사이드바
│   ├── TagSidebar.tsx          # 태그 사이드바
│   ├── PostList.tsx            # 게시글 목록
│   ├── PostDetail.tsx          # 게시글 상세
│   ├── PostForm.tsx            # 게시글 작성/수정 폼
│   ├── SemanticSearch.tsx      # AI 검색 컴포넌트
│   ├── MarkdownPreview.tsx     # 마크다운 미리보기
│   └── LayoutClient.tsx        # 클라이언트 레이아웃
│
├── lib/
│   └── api.ts                  # API 클라이언트 (Axios)
│
├── types/
│   ├── post.ts                 # 게시글 타입
│   ├── category.ts             # 카테고리 타입
│   ├── tag.ts                  # 태그 타입
│   └── rag.ts                  # RAG 타입
│
└── public/
    └── uploads/                # 업로드된 파일
```

### 주요 컴포넌트

#### SemanticSearch.tsx
AI 검색 UI 컴포넌트

**기능:**
- 자연어 질문 입력
- AI 답변 표시 (마크다운 렌더링)
- 참조 문서 목록 (출처)
- 로딩 상태 표시

**상태 관리:**
```typescript
const [query, setQuery] = useState('')
const [result, setResult] = useState<RAGSearchResponse | null>(null)
const [loading, setLoading] = useState(false)

const handleSearch = async () => {
  setLoading(true)
  const response = await ragApi.search({ query, top_k: 5 })
  setResult(response)
  setLoading(false)
}
```

#### PostList.tsx
게시글 목록 컴포넌트

**기능:**
- 페이지네이션
- 키워드 검색
- 카테고리/언어 필터링
- 게시글 카드 표시

#### MarkdownPreview.tsx
마크다운 미리보기 컴포넌트

**사용 라이브러리:**
- `react-markdown`: 마크다운 파싱
- `rehype-highlight`: 코드 하이라이팅
- `remark-gfm`: GitHub Flavored Markdown

---

## 백엔드 구조

### 디렉토리 구조
```
backend/
├── app/
│   ├── core/
│   │   ├── database.py         # DB 설정, SessionLocal
│   │   └── security.py         # JWT, 비밀번호 해싱
│   │
│   ├── models/
│   │   ├── __init__.py         # 모델 import
│   │   ├── post.py             # Post 모델
│   │   ├── category.py         # Category 모델
│   │   ├── tag.py              # Tag 모델
│   │   ├── user.py             # User 모델
│   │   └── post_tag.py         # PostTag 중간 테이블
│   │
│   ├── schemas/
│   │   ├── post.py             # PostCreate, PostResponse
│   │   ├── category.py         # CategoryCreate, CategoryResponse
│   │   ├── tag.py              # TagCreate, TagResponse
│   │   └── user.py             # UserCreate, UserResponse
│   │
│   ├── routes/
│   │   ├── posts.py            # 게시글 CRUD + 웹훅
│   │   ├── categories.py       # 카테고리 API
│   │   ├── tags.py             # 태그 API
│   │   ├── auth.py             # 인증 API
│   │   ├── uploads.py          # 파일 업로드 API
│   │   └── rag_search.py       # RAG 검색 API
│   │
│   ├── services/
│   │   ├── embedding_service.py   # 임베딩 생성 및 ChromaDB
│   │   ├── llm_service.py         # Ollama LLM 호출
│   │   └── rag_service.py         # RAG 파이프라인
│   │
│   └── main.py                 # FastAPI 앱 생성, 라우터 등록
│
├── scripts/
│   └── simple_init_embeddings.py  # 기존 게시글 임베딩 초기화
│
├── chroma_data/                # ChromaDB 데이터 저장소
├── uploads/                    # 업로드된 파일
├── codesnippets.db             # SQLite 데이터베이스
├── seed_categories.py          # 카테고리 시드 데이터
├── seed_snippets.py            # 게시글 시드 데이터
├── requirements.txt            # Python 의존성
└── README.md
```

### 레이어 아키텍처

```
┌─────────────────────────────────────┐
│         API Routes Layer            │
│  (posts.py, rag_search.py, ...)    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Business Logic Layer          │
│  (RAGService, EmbeddingService)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│        Data Access Layer            │
│  (SQLAlchemy ORM, ChromaDB Client)  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│         Database Layer              │
│  (SQLite, ChromaDB, Ollama)         │
└─────────────────────────────────────┘
```

---

## 배포 및 운영

### 로컬 개발 환경 설정

#### 1. Prerequisites
```bash
# Python 3.11+ 설치 확인
python --version

# Node.js 18+ 설치 확인
node --version

# Ollama 설치 (Windows)
# https://ollama.com/download
```

#### 2. Backend 실행
```bash
cd backend

# 가상환경 생성
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 의존성 설치
pip install -r requirements.txt

# Ollama 모델 다운로드
ollama pull qwen2.5-coder:7b

# 시드 데이터 생성 (선택 사항)
python seed_categories.py
python seed_snippets.py

# 임베딩 초기화 (시드 데이터 생성 후)
python scripts/simple_init_embeddings.py

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend 실행
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

#### 4. 접속
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 프로덕션 배포 고려사항

#### Backend
1. **데이터베이스 마이그레이션**
   - SQLite → PostgreSQL/MySQL 전환
   - Alembic 마이그레이션 도구 사용

2. **환경 변수 관리**
   ```bash
   # .env 파일
   DATABASE_URL=postgresql://user:pass@localhost/dbname
   SECRET_KEY=your-secret-key
   OLLAMA_HOST=http://localhost:11434
   ```

3. **CORS 설정**
   ```python
   # main.py
   origins = [
       "https://yourdomain.com",
   ]
   ```

4. **성능 최적화**
   - Gunicorn + Uvicorn workers
   - Redis 캐싱
   - CDN for static files

#### Frontend
1. **빌드 및 배포**
   ```bash
   npm run build
   npm start  # 프로덕션 모드
   ```

2. **환경 변수**
   ```bash
   # .env.production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

#### AI/ML 인프라
1. **GPU 서버**
   - Ollama를 GPU 서버에서 실행
   - API 엔드포인트로 노출

2. **벡터 DB 스케일링**
   - ChromaDB → Qdrant/Weaviate
   - 클러스터링 고려

3. **모델 최적화**
   - 양자화 (4-bit, 8-bit)
   - 모델 경량화

---

## 성능 및 확장성

### 성능 메트릭

#### 임베딩 성능
- **단일 문서 임베딩**: ~50ms
- **배치 임베딩 (10개)**: ~200ms
- **벡터 차원**: 768

#### 검색 성능
- **시맨틱 검색 (top-5)**: ~100ms
- **LLM 답변 생성**: 2-10초 (GPU 사용)

### 확장 전략

#### 수평적 확장
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │     │ Frontend │     │ Frontend │
│ Instance │     │ Instance │     │ Instance │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     └────────────────┴────────────────┘
                      │
              ┌───────▼────────┐
              │  Load Balancer │
              └───────┬────────┘
                      │
     ┌────────────────┴────────────────┐
     │                                  │
┌────▼─────┐                    ┌──────▼────┐
│ Backend  │                    │  Backend  │
│ Instance │                    │  Instance │
└────┬─────┘                    └──────┬────┘
     │                                  │
     └────────────┬─────────────────────┘
                  │
          ┌───────▼────────┐
          │  PostgreSQL    │
          │  (Primary)     │
          └────────────────┘
```

#### 캐싱 전략
```python
# Redis 캐싱 예시
@cache(ttl=300)  # 5분 캐싱
def get_popular_posts():
    return db.query(Post).order_by(Post.views.desc()).limit(10).all()
```

---

## 보안 고려사항

### 인증 및 권한
- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- HTTPS 전송

### API 보안
- Rate Limiting (속도 제한)
- CORS 설정
- SQL Injection 방지 (SQLAlchemy ORM)
- XSS 방지 (마크다운 sanitization)

### 데이터 보안
- 민감 정보 암호화
- 환경 변수로 비밀키 관리
- 정기 백업

---

## 모니터링 및 로깅

### 로깅 전략
```python
# 구조화된 로깅
import logging

logger = logging.getLogger(__name__)

@router.post("/api/rag/search")
async def search(request: RAGSearchRequest):
    logger.info(f"RAG search request: {request.query}")
    try:
        result = rag_service.search_and_answer(request.query)
        logger.info(f"Search successful, sources: {len(result['sources'])}")
        return result
    except Exception as e:
        logger.error(f"Search failed: {e}", exc_info=True)
        raise
```

### 메트릭 수집
- API 응답 시간
- RAG 검색 정확도
- LLM 토큰 사용량
- 에러 발생 빈도

---

## 향후 개선 사항

### 기능 확장
- [ ] 게시글 버전 관리
- [ ] 댓글 시스템
- [ ] 북마크 기능
- [ ] 공유 기능
- [ ] 다크 모드
- [ ] 다국어 지원

### RAG 개선
- [ ] Hybrid Search (키워드 + 시맨틱)
- [ ] Re-ranking 모델 적용
- [ ] Few-shot Learning
- [ ] Fine-tuning on domain data
- [ ] 실시간 피드백 학습

### 인프라 개선
- [ ] Kubernetes 배포
- [ ] CI/CD 파이프라인
- [ ] 자동화된 테스트
- [ ] 성능 모니터링 대시보드

---

## 참고 자료

### 문서
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [ChromaDB 문서](https://docs.trychroma.com/)
- [Ollama 문서](https://ollama.com/docs)

### 라이브러리
- [Sentence-Transformers](https://www.sbert.net/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [React Markdown](https://github.com/remarkjs/react-markdown)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-08
**작성자**: AI Assistant (Claude)
