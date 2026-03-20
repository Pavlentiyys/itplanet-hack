from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from common import get_current_user, get_session
from .schemas import UserSchema
from .models import User
from .service import get_favorite_posts, get_reviews, get_user_posts, update_user
from .schemas import UpdateUserRequest

from posts.schemas import Posts
from reviews.schemas import Reviews


router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.get("/me", response_model=UserSchema)
async def get_information_about_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user.get_schema()


@router.patch("/me", response_model=UserSchema)
async def update_my_profile(
    body: UpdateUserRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    user = await update_user(db, current_user, body.first_name, body.last_name, body.avatar_url)
    return user.get_schema()


@router.get("/me/reviews", response_model=Reviews)
async def get_my_reviews(db: Annotated[AsyncSession, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    reviews = await get_reviews(db, current_user)
    return {
        "reviews": [review.get_schema() for review in reviews]
    }


@router.get("/me/posts", response_model=Posts)
async def get_my_posts(db: Annotated[AsyncSession, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    posts = await get_user_posts(db, current_user)
    return {
        "posts": [post.get_schema() for post in posts]
    }


@router.get("/me/posts/favorite", response_model=Posts)
async def get_my_favorite_posts(db: Annotated[AsyncSession, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    favorite_posts = await get_favorite_posts(db, current_user)
    return {
        "posts": [favorite_post.get_schema() for favorite_post in favorite_posts]
    }
