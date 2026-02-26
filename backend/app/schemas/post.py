from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class CategorySimple(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    author: str = Field(..., min_length=1, max_length=100)
    category_id: Optional[int] = None
    tags: Optional[str] = Field(None, max_length=200)
    language: Optional[str] = Field(None, max_length=20)
    is_markdown: bool = True


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    category_id: Optional[int] = None
    tags: Optional[str] = Field(None, max_length=200)
    language: Optional[str] = Field(None, max_length=20)
    is_markdown: Optional[bool] = None


class PostResponse(PostBase):
    id: int
    views: int
    category: Optional[CategorySimple] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PostList(BaseModel):
    total: int
    page: int
    page_size: int
    posts: List[PostResponse]
