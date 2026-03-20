from typing import TYPE_CHECKING
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from pydantic import EmailStr

from .models import User
from link_models import FavoritePost

if TYPE_CHECKING:
    from posts.models import Post
    from reviews.models import Review


async def create_user(db: AsyncSession, email: EmailStr, password_hash: str, first_name: str | None = None, last_name: str | None = None, avatar_url: str | None = None) -> User:
    existing_user = await db.scalar(select(User).where(User.email == email))
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(email=email, password=password_hash, first_name=first_name, last_name=last_name, avatar_url=avatar_url)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


async def update_user(db: AsyncSession, user: User, first_name: str | None, last_name: str | None, avatar_url: str | None) -> User:
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if avatar_url is not None:
        user.avatar_url = avatar_url
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: EmailStr) -> User | None:
    user = await db.scalar(select(User).where(User.email == email))
    return user


async def get_favorite_posts(db: AsyncSession, user: User) -> list['Post']:
    from posts.models import Post as PostModel
    posts = (await db.scalars(
        select(PostModel)
        .join(FavoritePost, FavoritePost.post_id == PostModel.id)
        .where(FavoritePost.user_id == user.id)
    )).all()
    return list(posts)


async def get_user_posts(db: AsyncSession, user: User) -> list['Post']:
    from posts.models import Post as PostModel
    posts = (await db.scalars(
        select(PostModel).where(PostModel.author_id == user.id)
    )).all()
    return list(posts)


async def get_reviews(db: AsyncSession, user: User) -> list['Review']:
    await db.refresh(user, ["reviews"])
    return user.reviews
