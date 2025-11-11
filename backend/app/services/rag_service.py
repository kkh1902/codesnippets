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

    def generate_code_snippet(self, prompt: str, language: str = None) -> Dict:
        """AI로 코드 스니펫 생성"""
        import ollama

        generation_prompt = f"""당신은 코드 스니펫을 작성하는 전문가입니다.

사용자 요청: {prompt}
{f'언어: {language}' if language else ''}

다음 형식으로 코드 스니펫을 작성해주세요:

1. 제목: 간결하고 명확한 제목 (한 줄)
2. 내용: 마크다운 형식으로 작성
   - 간단한 설명
   - 코드 예제 (마크다운 코드 블록 사용)
   - 사용법 설명

제목과 내용은 반드시 구분해서 작성하세요.
코드는 반드시 마크다운 코드 블록(```)으로 감싸세요.

형식:
TITLE: 여기에 제목
CONTENT:
여기에 마크다운 형식의 내용
"""

        try:
            response = ollama.generate(
                model=self.llm_service.model_name,
                prompt=generation_prompt,
                options={
                    "temperature": 0.7,
                    "num_predict": 1500
                }
            )

            generated_text = response['response']

            # 제목과 내용 파싱
            title = "AI 생성 코드 스니펫"
            content = generated_text

            if "TITLE:" in generated_text and "CONTENT:" in generated_text:
                parts = generated_text.split("CONTENT:")
                title_part = parts[0].replace("TITLE:", "").strip()
                content = parts[1].strip()
                title = title_part[:200]  # 제목 길이 제한

            # 언어 추출
            detected_language = language or "python"
            if "```python" in content:
                detected_language = "python"
            elif "```javascript" in content or "```js" in content:
                detected_language = "javascript"
            elif "```typescript" in content or "```ts" in content:
                detected_language = "typescript"
            elif "```java" in content:
                detected_language = "java"
            elif "```go" in content:
                detected_language = "go"

            return {
                "title": title,
                "content": content,
                "language": detected_language,
                "tokens_used": response.get('eval_count', 0)
            }

        except Exception as e:
            raise Exception(f"AI 생성 실패: {str(e)}")

# 싱글톤 인스턴스
rag_service = RAGService()
