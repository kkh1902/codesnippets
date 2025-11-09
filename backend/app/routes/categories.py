from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryInDB, CategoryTree

router = APIRouter(prefix="/api/categories", tags=["categories"])

def build_category_tree(categories: List[Category], parent_id: int = None) -> List[CategoryTree]:
    """Recursively build category tree"""
    tree = []
    for category in categories:
        if category.parent_id == parent_id:
            # Convert to dict and add children
            category_data = {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "parent_id": category.parent_id,
                "order": category.order,
                "created_at": category.created_at,
                "updated_at": category.updated_at,
                "children": build_category_tree(categories, category.id)
            }
            tree.append(CategoryTree(**category_data))
    return sorted(tree, key=lambda x: x.order)

@router.get("/tree", response_model=List[CategoryTree])
def get_category_tree(db: Session = Depends(get_db)):
    """Get all categories as a tree structure"""
    categories = db.query(Category).all()
    return build_category_tree(categories)

@router.get("/", response_model=List[CategoryInDB])
def get_all_categories(db: Session = Depends(get_db)):
    """Get all categories (flat list)"""
    categories = db.query(Category).order_by(Category.order).all()
    return categories

@router.get("/{category_id}", response_model=CategoryInDB)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=CategoryInDB, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    # Check if slug already exists
    existing = db.query(Category).filter(Category.slug == category.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")

    # Check if parent exists (if provided)
    if category.parent_id:
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")

    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategoryInDB)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """Update a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check slug uniqueness if being updated
    if category.slug and category.slug != db_category.slug:
        existing = db.query(Category).filter(Category.slug == category.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category slug already exists")

    # Check if parent exists (if provided)
    if category.parent_id:
        # Prevent self-referencing
        if category.parent_id == category_id:
            raise HTTPException(status_code=400, detail="Category cannot be its own parent")
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")

    update_data = category.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if category has children
    children = db.query(Category).filter(Category.parent_id == category_id).first()
    if children:
        raise HTTPException(status_code=400, detail="Cannot delete category with children")

    # Check if category has posts
    if db_category.posts:
        raise HTTPException(status_code=400, detail="Cannot delete category with posts")

    db.delete(db_category)
    db.commit()
    return None
