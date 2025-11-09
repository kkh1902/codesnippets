from sentence_transformers import SentenceTransformer
import chromadb
from typing import List, Dict
import os

class EmbeddingService:
    def __init__(self):
        # 한국어 + 코드에 강한 임베딩 모델
        print("Loading embedding model...")
        self.model = SentenceTransformer('jhgan/ko-sroberta-multitask')

        # ChromaDB 클라이언트 (로컬 파일 저장)
        chroma_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_data")
        print(f"ChromaDB path: {chroma_path}")

        self.chroma_client = chromadb.PersistentClient(
            path=chroma_path
        )

        # 컬렉션 생성/로드
        self.collection = self.chroma_client.get_or_create_collection(
            name="code_snippets",
            metadata={"hnsw:space": "cosine"}  # 코사인 유사도
        )
        print(f"ChromaDB collection loaded. Total documents: {self.collection.count()}")

    def embed_text(self, text: str) -> List[float]:
        """텍스트를 벡터로 변환"""
        return self.model.encode(text).tolist()

    def add_post(self, post_id: int, title: str, content: str,
                 category_id: int = None, language: str = None,
                 tags: str = None):
        """게시글을 벡터 DB에 추가"""
        # title + content 결합
        combined_text = f"{title}\n\n{content}"

        # 임베딩 생성
        embedding = self.embed_text(combined_text)

        # ChromaDB에 저장
        self.collection.add(
            ids=[str(post_id)],
            embeddings=[embedding],
            documents=[combined_text],
            metadatas=[{
                "post_id": post_id,
                "title": title,
                "category_id": category_id or 0,
                "language": language or "",
                "tags": tags or ""
            }]
        )
        print(f"Added post {post_id} to vector DB")

    def update_post(self, post_id: int, title: str, content: str,
                   category_id: int = None, language: str = None,
                   tags: str = None):
        """게시글 업데이트"""
        # 기존 삭제 후 재추가
        self.delete_post(post_id)
        self.add_post(post_id, title, content, category_id, language, tags)
        print(f"Updated post {post_id} in vector DB")

    def delete_post(self, post_id: int):
        """게시글 삭제"""
        try:
            self.collection.delete(ids=[str(post_id)])
            print(f"Deleted post {post_id} from vector DB")
        except:
            pass  # 없으면 무시

    def search(self, query: str, top_k: int = 5,
               category_id: int = None, language: str = None) -> List[Dict]:
        """의미 기반 검색"""
        query_embedding = self.embed_text(query)

        # 필터 구성
        where_filter = {}
        if category_id:
            where_filter["category_id"] = category_id
        if language:
            where_filter["language"] = language

        # 검색 실행
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter if where_filter else None
        )

        # 결과 포맷팅
        search_results = []
        if results['ids'][0]:
            for i, post_id in enumerate(results['ids'][0]):
                search_results.append({
                    "post_id": int(post_id),
                    "title": results['metadatas'][0][i]['title'],
                    "distance": results['distances'][0][i],
                    "relevance_score": 1 - results['distances'][0][i],  # 0~1 점수
                    "content": results['documents'][0][i]
                })

        return search_results

# 싱글톤 인스턴스
embedding_service = None

def get_embedding_service():
    global embedding_service
    if embedding_service is None:
        embedding_service = EmbeddingService()
    return embedding_service
