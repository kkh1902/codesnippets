from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from ..services.rag_service import rag_service

router = APIRouter(prefix="/api/rag", tags=["RAG Search"])

class RAGSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    category_id: Optional[int] = None
    language: Optional[str] = None

class RAGSource(BaseModel):
    post_id: int
    title: str
    relevance_score: float
    excerpt: str

class RAGSearchResponse(BaseModel):
    answer: str
    sources: List[Dict]
    tokens_used: int
    model: str

@router.post("/search", response_model=RAGSearchResponse)
async def semantic_search(request: RAGSearchRequest):
    """RAG 기반 의미 검색 및 답변 생성"""
    try:
        result = rag_service.search_and_answer(
            query=request.query,
            top_k=request.top_k,
            category_id=request.category_id,
            language=request.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """RAG 시스템 상태 확인"""
    return {
        "status": "ok",
        "embedding_model": "jhgan/ko-sroberta-multitask",
        "llm_model": rag_service.llm_service.model_name
    }

class AIGenerateRequest(BaseModel):
    prompt: str
    language: Optional[str] = None

class AIGenerateResponse(BaseModel):
    title: str
    content: str
    language: str
    tokens_used: int

@router.post("/generate", response_model=AIGenerateResponse)
async def generate_post(request: AIGenerateRequest):
    """AI로 코드 스니펫 생성"""
    try:
        result = rag_service.generate_code_snippet(
            prompt=request.prompt,
            language=request.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
