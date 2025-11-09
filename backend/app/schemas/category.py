from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int] = None
    order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    order: Optional[int] = None

class CategoryInDB(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoryTree(CategoryInDB):
    children: List['CategoryTree'] = []

    class Config:
        from_attributes = True

# Update forward refs for recursive model
CategoryTree.model_rebuild()
