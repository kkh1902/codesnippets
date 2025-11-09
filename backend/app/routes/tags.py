from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate, TagResponse, TagTree

router = APIRouter(prefix="/api/tags", tags=["tags"])

def build_tag_tree(tags: List[Tag], parent_id: int = None) -> List[TagTree]:
    """Build hierarchical tree structure from flat list of tags"""
    tree = []
    for tag in tags:
        if tag.parent_id == parent_id:
            tag_dict = TagTree.model_validate(tag)
            tag_dict.children = build_tag_tree(tags, tag.id)
            tree.append(tag_dict)
    return tree

@router.get("/tree", response_model=List[TagTree])
def get_tag_tree(db: Session = Depends(get_db)):
    """Get all tags in hierarchical tree structure"""
    tags = db.query(Tag).all()
    return build_tag_tree(tags)

@router.get("/", response_model=List[TagResponse])
def get_all_tags(db: Session = Depends(get_db)):
    """Get all tags (flat list)"""
    return db.query(Tag).all()

@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """Get a single tag by ID"""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.post("/", response_model=TagResponse, status_code=201)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """Create a new tag"""
    # Check if slug already exists
    existing = db.query(Tag).filter(Tag.slug == tag.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this slug already exists")

    # Check if name already exists
    existing_name = db.query(Tag).filter(Tag.name == tag.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")

    # Validate parent_id if provided
    if tag.parent_id:
        parent = db.query(Tag).filter(Tag.id == tag.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent tag not found")

    db_tag = Tag(**tag.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, tag: TagUpdate, db: Session = Depends(get_db)):
    """Update an existing tag"""
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    update_data = tag.model_dump(exclude_unset=True)

    # Check for slug conflicts
    if "slug" in update_data:
        existing = db.query(Tag).filter(Tag.slug == update_data["slug"], Tag.id != tag_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tag with this slug already exists")

    # Check for name conflicts
    if "name" in update_data:
        existing_name = db.query(Tag).filter(Tag.name == update_data["name"], Tag.id != tag_id).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Tag with this name already exists")

    # Validate parent_id if provided
    if "parent_id" in update_data and update_data["parent_id"]:
        if update_data["parent_id"] == tag_id:
            raise HTTPException(status_code=400, detail="Tag cannot be its own parent")
        parent = db.query(Tag).filter(Tag.id == update_data["parent_id"]).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent tag not found")

    for field, value in update_data.items():
        setattr(db_tag, field, value)

    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.delete("/{tag_id}", status_code=204)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """Delete a tag"""
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check if tag has children
    children = db.query(Tag).filter(Tag.parent_id == tag_id).first()
    if children:
        raise HTTPException(status_code=400, detail="Cannot delete tag with children")

    db.delete(db_tag)
    db.commit()
    return None
