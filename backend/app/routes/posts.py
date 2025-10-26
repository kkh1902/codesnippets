from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.post import Post
from app.schemas.post import PostCreate, PostUpdate, PostResponse, PostList

router = APIRouter()

@router.get("/", response_model=PostList)
def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all posts with pagination and optional search"""
    query = db.query(Post)

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
    return db_post

@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post"""
    db_post = db.query(Post).filter(Post.id == post_id).first()

    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(db_post)
    db.commit()
    return None
