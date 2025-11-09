"""기존 게시글들을 벡터 DB에 추가하는 스크립트"""
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
# Import all models to ensure relationships are properly configured
from app.models import Post, Category
from app.models.tag import Tag
from app.models.user import User
from app.models.post_tag import post_tags
from app.services.embedding_service import get_embedding_service

def initialize_embeddings():
    """모든 기존 게시글을 벡터 DB에 임베딩"""
    db = SessionLocal()

    try:
        print("=" * 60)
        print("기존 게시글 임베딩 초기화 시작")
        print("=" * 60)

        # 임베딩 서비스 초기화 (모델 로딩)
        print("\n[1/3] 임베딩 모델 로딩 중...")
        embedding_service = get_embedding_service()
        print("✓ 임베딩 모델 로딩 완료")

        # 게시글 가져오기
        print("\n[2/3] 데이터베이스에서 게시글 가져오는 중...")
        posts = db.query(Post).all()
        total_posts = len(posts)
        print(f"✓ 총 {total_posts}개의 게시글을 찾았습니다")

        if total_posts == 0:
            print("\n처리할 게시글이 없습니다.")
            return

        # 임베딩 생성
        print(f"\n[3/3] 임베딩 생성 중...")
        print("-" * 60)

        for i, post in enumerate(posts, 1):
            try:
                print(f"[{i}/{total_posts}] Processing: ID={post.id}, Title='{post.title[:50]}...'")

                embedding_service.add_post(
                    post_id=post.id,
                    title=post.title,
                    content=post.content,
                    category_id=post.category_id,
                    language=post.language,
                    tags=post.tags
                )

                # 진행률 표시
                progress = (i / total_posts) * 100
                print(f"  ✓ 완료 ({progress:.1f}%)")

            except Exception as e:
                print(f"  ✗ 오류 발생: {e}")
                continue

        print("-" * 60)
        print(f"\n✅ 모든 게시글 임베딩 완료! ({total_posts}개)")
        print(f"ChromaDB 문서 수: {embedding_service.collection.count()}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ 치명적 오류 발생: {e}")
        import traceback
        traceback.print_exc()

    finally:
        db.close()

if __name__ == "__main__":
    print("\n")
    print("██████╗  █████╗  ██████╗     ███████╗███╗   ███╗██████╗ ███████╗██████╗ ██████╗ ██╗███╗   ██╗ ██████╗ ")
    print("██╔══██╗██╔══██╗██╔════╝     ██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝ ")
    print("██████╔╝███████║██║  ███╗    █████╗  ██╔████╔██║██████╔╝█████╗  ██║  ██║██║  ██║██║██╔██╗ ██║██║  ███╗")
    print("██╔══██╗██╔══██║██║   ██║    ██╔══╝  ██║╚██╔╝██║██╔══██╗██╔══╝  ██║  ██║██║  ██║██║██║╚██╗██║██║   ██║")
    print("██║  ██║██║  ██║╚██████╔╝    ███████╗██║ ╚═╝ ██║██████╔╝███████╗██████╔╝██████╔╝██║██║ ╚████║╚██████╔╝")
    print("╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝     ╚══════╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚═════╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ ")
    print("\n")

    initialize_embeddings()
