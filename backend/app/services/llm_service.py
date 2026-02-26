try:
    import ollama
    HAS_OLLAMA = True
except ImportError:
    HAS_OLLAMA = False
from typing import List, Dict

class LLMService:
    def __init__(self, model_name: str = "qwen2.5-coder:7b"):
        self.model_name = model_name
        print(f"LLM Service initialized with model: {model_name}")

    def generate_answer(self, query: str, context_docs: List[Dict]) -> Dict:
        """RAG 기반 답변 생성"""

        # 컨텍스트 구성
        context = "\n\n---\n\n".join([
            f"[문서 {i+1}] {doc['title']}\n{doc['content'][:500]}"
            for i, doc in enumerate(context_docs)
        ])

        # 프롬프트 구성
        prompt = f"""당신은 코드 스니펫 전문가입니다. 아래의 관련 문서들을 참고하여 사용자의 질문에 답변해주세요.

관련 문서:
{context}

사용자 질문: {query}

답변 시 주의사항:
1. 제공된 문서의 내용을 기반으로 답변하세요
2. 코드 예시가 있다면 포함해주세요
3. 한국어로 명확하게 설명해주세요
4. 문서에 없는 내용은 추측하지 마세요

답변:"""

        # Ollama 호출
        try:
            print(f"Calling Ollama with model: {self.model_name}")
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.7,
                    "num_predict": 1000,  # 최대 토큰 수
                }
            )

            return {
                "answer": response['response'],
                "model": self.model_name,
                "tokens": response.get('eval_count', 0)
            }
        except Exception as e:
            print(f"Ollama error: {str(e)}")
            return {
                "answer": f"LLM 호출 오류: {str(e)}\n\nOllama가 실행 중인지 확인해주세요. (명령: ollama serve)",
                "model": self.model_name,
                "tokens": 0
            }

# 싱글톤 인스턴스
llm_service = LLMService()
