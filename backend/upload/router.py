import os
import uuid
from typing import Annotated
from fastapi import APIRouter, UploadFile, File, Depends

from common import get_current_user
from users.models import User

router = APIRouter(prefix="/upload", tags=["upload"])

STATIC_DIR = "static"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


@router.post("/image")
async def upload_image(
    file: Annotated[UploadFile, File()],
    current_user: Annotated[User, Depends(get_current_user)],
):
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = "jpg"

    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(STATIC_DIR, filename)

    contents = await file.read()
    with open(path, "wb") as f:
        f.write(contents)

    return {"url": f"/static/{filename}"}
