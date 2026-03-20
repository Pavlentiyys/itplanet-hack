from typing import TYPE_CHECKING
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from .schemas import CreateReview, EditReview
from .models import Review

if TYPE_CHECKING:
    from users.schemas import UserRole
    from users.models import User


async def create_review(db: AsyncSession, author_id: int, review_schema: CreateReview) -> Review:
    title = review_schema.title
    description = review_schema.description
    rating = review_schema.rating
    post_id = review_schema.post_id

    review = Review(title=title, description=description, rating=rating, author_id=author_id, post_id=post_id)
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return review


async def edit_review(db: AsyncSession, review_schema: EditReview, user_id: int) -> Review:
    review_id = review_schema.id
    review = await db.scalar(select(Review).where(Review.id == review_id))

    if not review:
        raise HTTPException(status_code=400, detail="Review is not exists")
    if review.author_id != user_id:
        raise HTTPException(status_code=400, detail="User has not permissions")
    
    review.title = review_schema.title
    review.description = review_schema.description
    review.rating = review_schema.rating
    
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return review


async def delete_review_by_id(db: AsyncSession, review_id: int, user: User) -> None:
    review = await db.scalar(select(Review).where(Review.id == review_id))

    if not review:
        raise HTTPException(status_code=400, detail="Review is not exists")
    if review.author_id != user.id and user.role < UserRole.MODERATOR:
        raise HTTPException(status_code=400, detail="User has not permissions")
    
    await db.delete(review)
    await db.commit()
