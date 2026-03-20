from typing import TYPE_CHECKING
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from link_models import FavoritePost
from .schemas import Posts, CreatePost, EditPost
from .models import Post
from reviews.models import Review

if TYPE_CHECKING:
    from users.models import User


async def get_all_posts(db: AsyncSession) -> list[Post]:
    posts = (await db.scalars(select(Post))).all()
    return posts


async def get_post_by_id(db: AsyncSession, post_id: int) -> Post:
    post = await db.scalar(select(Post).where(Post.id == post_id))
    return post


async def create_post(db: AsyncSession, author_id: int, post_schema: CreatePost) -> Post:
    title = post_schema.title
    description = post_schema.description
    tags = post_schema.tags

    post = Post(
        author_id=author_id,
        title=title,
        description=description,
        tags=post_schema.tags.model_dump(),
        latitude=post_schema.latitude,
        longitude=post_schema.longitude,
        image_url=post_schema.image_url,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return post


async def edit_post(db: AsyncSession, post_schema: EditPost) -> Post:
    post_id = post_schema.id
    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=400, detail="Post is not exists")
    
    post.title = post_schema.title
    post.description = post_schema.description
    post.tags = post_schema.tags.model_dump()
    
    db.add(post)
    await db.commit()
    await db.refresh(post)

    return post


async def delete_post_by_id(db: AsyncSession, post_id: int) -> None:
    await db.execute(delete(Post).where(Post.id == post_id))
    await db.commit()


async def toggle_favorite_post(db: AsyncSession, user: User, post_id: int) -> bool:
    post = await db.scalar(select(Post).where(Post.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    favorite = await db.scalar(select(FavoritePost).where(FavoritePost.user_id == user.id, FavoritePost.post_id == post_id))
    if favorite is None:
        db.add(FavoritePost(user_id=user.id, post_id=post.id))
        await db.commit()
        return True
    
    await db.delete(favorite)
    await db.commit()
    return False


async def get_reviews(db: AsyncSession, post_id: int) -> list[Review]:
    reviews = (await db.scalars(select(Review).where(Review.post_id == post_id))).all()
    return reviews
