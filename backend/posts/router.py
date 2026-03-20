from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from common import get_current_user
from common_schemas import ObjectId
from .schemas import Posts, PostSchema, CreatePost, EditPost, FavoritePostResponse
from .service import get_all_posts, get_post_by_id, get_reviews, create_post, edit_post, delete_post_by_id, toggle_favorite_post

from users.schemas import UserRole
from users.models import User
from reviews.schemas import Reviews


router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)


@router.get("", response_model=Posts)
async def all_posts(db: Annotated[AsyncSession, Depends(get_session)]):
    posts = await get_all_posts(db)
    return {
        "posts": [post.get_schema() for post in posts]
    }


@router.get("/{post_id}", response_model=PostSchema)
async def get_post(post_id: int, db: Annotated[AsyncSession, Depends(get_session)]):
    post = await get_post_by_id(db, post_id)
    return post.get_schema()


@router.get("/{post_id}/reviews", response_model=Reviews)
async def get_post_reviews(post_id: int, db: Annotated[AsyncSession, Depends(get_session)]):
    reviews = await get_reviews(db, post_id)
    return {
        "reviews": [review.get_schema() for review in reviews]
    }


@router.post("", response_model=PostSchema)
async def new_post(post_schema: CreatePost, db: Annotated[AsyncSession, Depends(get_session)],
                   current_user: Annotated[User, Depends(get_current_user)]):
    post = await create_post(db, current_user.id, post_schema)
    return post.get_schema()


@router.put("", response_model=PostSchema)
async def put_post(post_schema: EditPost, db: Annotated[AsyncSession, Depends(get_session)],
                   current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.role < UserRole.MODERATOR:
        raise HTTPException(status_code=400, detail="User is not moderator")
    
    post = await edit_post(db, post_schema)
    return post.get_schema()


@router.delete("")
async def delete_post(post_schema: ObjectId, db: Annotated[AsyncSession, Depends(get_session)],
                      current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.role < UserRole.MODERATOR:
        raise HTTPException(status_code=400, detail="User is not moderator")
    
    await delete_post_by_id(db, post_schema.id)


@router.post("/favorite", response_model=FavoritePostResponse)
async def toggle_favorite_post_status(post_id: ObjectId, db: Annotated[AsyncSession, Depends(get_session)],
                                      current_user: Annotated[User, Depends(get_current_user)]):
    is_favorited_now = await toggle_favorite_post(db, current_user, post_id.id)
    return FavoritePostResponse(is_favorited=is_favorited_now)
