from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    author: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[str] = Field(None, max_length=200)
    language: Optional[str] = Field(None, max_length=20)
    is_markdown: bool = True

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[str] = Field(None, max_length=200)
    language: Optional[str] = Field(None, max_length=20)
    is_markdown: Optional[bool] = None

class PostResponse(PostBase):
    id: int
    views: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PostList(BaseModel):
    total: int
    page: int
    page_size: int
    posts: list[PostResponse]
