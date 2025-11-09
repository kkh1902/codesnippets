"""간단한 임베딩 초기화 스크립트 (구버전 DB용)"""
import sys
import os
import sqlite3

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.embedding_service import get_embedding_service

def initialize_embeddings():
    """DB에서 직접 게시글 가져와서 임베딩"""

    print("\n" + "="*60)
    print("기존 게시글 임베딩 초기화 시작 (간단 버전)")
    print("="*60 + "\n")

    try:
        # 1. 임베딩 서비스 로딩
        print("[1/3] 임베딩 모델 로딩 중...")
        embedding_service = get_embedding_service()
        print("✓ 임베딩 모델 로딩 완료\n")

        # 2. SQLite에서 직접 데이터 가져오기
        print("[2/3] 데이터베이스에서 게시글 가져오는 중...")
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'codesnippets.db')

        if not os.path.exists(db_path):
            print(f"❌ 데이터베이스 파일을 찾을 수 없습니다: {db_path}")
            return

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT id, title, content, category, tags, language FROM posts")
        posts = cursor.fetchall()
        total_posts = len(posts)
        print(f"✓ 총 {total_posts}개의 게시글을 찾았습니다\n")

        if total_posts == 0:
            print("처리할 게시글이 없습니다.")
            conn.close()
            return

        # 3. 임베딩 생성
        print(f"[3/3] 임베딩 생성 중...")
        print("-" * 60)

        for i, post in enumerate(posts, 1):
            post_id, title, content, category, tags, language = post

            try:
                print(f"[{i}/{total_posts}] Processing: ID={post_id}, Title='{title[:50]}...'")

                embedding_service.add_post(
                    post_id=post_id,
                    title=title,
                    content=content,
                    category_id=None,  # 구버전 DB에는 없음
                    language=language,
                    tags=tags
                )

                progress = (i / total_posts) * 100
                print(f"  ✓ 완료 ({progress:.1f}%)")

            except Exception as e:
                print(f"  ✗ 오류 발생: {e}")
                continue

        conn.close()

        print("-" * 60)
        print(f"\n✅ 모든 게시글 임베딩 완료! ({total_posts}개)")
        print(f"ChromaDB 문서 수: {embedding_service.collection.count()}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ 치명적 오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n🚀 RAG 임베딩 초기화\n")
    initialize_embeddings()
