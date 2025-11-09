from .embedding_service import get_embedding_service
from .llm_service import llm_service
from typing import Dict, List

class RAGService:
    def __init__(self):
        self.llm_service = llm_service

    def search_and_answer(
        self,
        query: str,
        top_k: int = 5,
        category_id: int = None,
        language: str = None
    ) -> Dict:
        """RAG 파이프라인: 검색 + 답변 생성"""

        # 임베딩 서비스 가져오기 (lazy loading)
        embedding_service = get_embedding_service()

        # 1. 의미 기반 검색
        search_results = embedding_service.search(
            query=query,
            top_k=top_k,
            category_id=category_id,
            language=language
        )

        if not search_results:
            return {
                "answer": "관련된 코드 스니펫을 찾을 수 없습니다.",
                "sources": [],
                "tokens_used": 0,
                "model": self.llm_service.model_name
            }

        # 2. LLM으로 답변 생성
        llm_response = self.llm_service.generate_answer(
            query=query,
            context_docs=search_results
        )

        # 3. 결과 포맷팅
        return {
            "answer": llm_response['answer'],
            "sources": [
                {
                    "post_id": doc['post_id'],
                    "title": doc['title'],
                    "relevance_score": round(doc['relevance_score'], 3),
                    "excerpt": doc['content'][:200] + "..."
                }
                for doc in search_results
            ],
            "tokens_used": llm_response['tokens'],
            "model": llm_response['model']
        }

# 싱글톤 인스턴스
rag_service = RAGService()
