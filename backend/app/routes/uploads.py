from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

# 업로드 디렉토리 설정
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 허용되는 이미지 확장자
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


@router.post("")
async def upload_image(file: UploadFile = File(...)):
    """이미지 파일을 업로드하고 URL을 반환합니다."""

    # 파일 확장자 확인
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"허용되지 않는 파일 형식입니다. 허용: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 파일 크기 확인 (5MB 제한)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 5MB를 초과할 수 없습니다.")

    # 고유한 파일명 생성
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # 파일 저장
    with open(file_path, "wb") as f:
        f.write(contents)

    # URL 반환
    return {
        "url": f"/api/uploads/{unique_filename}",
        "filename": unique_filename
    }


@router.get("/{filename}")
async def get_image(filename: str):
    """업로드된 이미지를 반환합니다."""
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    return FileResponse(file_path)
