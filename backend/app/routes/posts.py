from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostResponse, PostList
from app.services.embedding_service import get_embedding_service

router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.get("/", response_model=PostList)
def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all posts with pagination, optional search, category and tag filter"""
    query = db.query(Post)

    # Tag filter
    if tag:
        query = query.filter(Post.tags.contains(tag))

    # Search functionality
    if search:
        query = query.filter(
            (Post.title.contains(search)) | (Post.content.contains(search))
        )

    # Get total count
    total = query.count()

    # Pagination
    posts = query.order_by(Post.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "posts": posts
    }

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID and increment view count"""
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.views += 1
    db.commit()
    db.refresh(post)

    return post

@router.post("/", response_model=PostResponse, status_code=201)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    """Create a new post"""
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Add to vector DB
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

@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db)):
    """Update an existing post"""
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Update only provided fields
    update_data = post.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_post, field, value)

    db.commit()
    db.refresh(db_post)
    
    # Update vector DB
    try:
        embedding_service = get_embedding_service()
        embedding_service.update_post(
            post_id=db_post.id,
            title=db_post.title,
            content=db_post.content,
            
            language=db_post.language,
            tags=db_post.tags
        )
    except Exception as e:
        print(f"Embedding 업데이트 실패: {e}")
    
    return db_post

@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a post (only by author or admin)"""
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if user is the author or admin
    if db_post.author != current_user.username and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="게시글 작성자만 삭제할 수 있습니다."
        )

    # Delete from vector DB
    try:
        embedding_service = get_embedding_service()
        embedding_service.delete_post(db_post.id)
    except Exception as e:
        print(f"Embedding 삭제 실패: {e}")
    
    db.delete(db_post)
    db.commit()
    return None

@router.get("/tags/all")
def get_all_tags(db: Session = Depends(get_db)):
    """Get all unique tags from posts"""
    posts = db.query(Post).filter(Post.tags.isnot(None)).all()
    tags_set = set()

    for post in posts:
        if post.tags:
            tags = [tag.strip() for tag in post.tags.split(',')]
            tags_set.update(tags)

    # Sort tags alphabetically and count usage
    tags_with_count = []
    for tag in sorted(tags_set):
        count = sum(1 for post in posts if post.tags and tag in post.tags.split(','))
        tags_with_count.append({"tag": tag, "count": count})

    return tags_with_count
