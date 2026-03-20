from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from common import get_current_user
from common_schemas import ObjectId
from .schemas import ReviewSchema, CreateReview, EditReview
from .service import create_review, edit_review, delete_review_by_id

from users.models import User


router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)


@router.post("", response_model=ReviewSchema)
async def new_review(review_schema: CreateReview, db: Annotated[AsyncSession, Depends(get_session)],
                     current_user: Annotated[User, Depends(get_current_user)]):
    review = await create_review(db, current_user.id, review_schema)
    return review.get_schema()


@router.put("", response_model=ReviewSchema)
async def put_review(review_schema: EditReview, db: Annotated[AsyncSession, Depends(get_session)],
                     current_user: Annotated[User, Depends(get_current_user)]):
    await edit_review(db, review_schema, current_user.id)


@router.delete("")
async def delete_post(review_schema: ObjectId, db: Annotated[AsyncSession, Depends(get_session)],
                      current_user: Annotated[User, Depends(get_current_user)]):
    await delete_review_by_id(db, review_schema.id, current_user)
