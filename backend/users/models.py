from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from functions import utc_now
from .schemas import UserSchema, UserRole
from link_models import FavoritePost

if TYPE_CHECKING:
    from posts.models import Post
    from reviews.models import Review


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    first_name: str | None = Field(default=None)
    last_name: str | None = Field(default=None)
    password: str
    role: UserRole = Field(default=UserRole.USER)
    is_active: bool = Field(default=True)
    avatar_url: str | None = Field(default=None)

    posts: "Post" = Relationship(back_populates="author")
    favorite_posts: list["Post"] = Relationship(back_populates="favorited_by", link_model=FavoritePost)
    reviews: list["Review"] = Relationship(back_populates="author")

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now, sa_column_kwargs={"onupdate": utc_now})

    def get_schema(self) -> UserSchema:
        return UserSchema(
            email=self.email,
            first_name=self.first_name,
            last_name=self.last_name,
            role=self.role,
            avatar_url=self.avatar_url,
        )
