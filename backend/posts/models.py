from typing import Any, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.types import JSON

from functions import utc_now
from link_models import FavoritePost
from .schemas import PostSchema
from users.schemas import BasicUserSchema

if TYPE_CHECKING:
    from users.models import User
    from reviews.models import Review


class Post(SQLModel, table=True):
    __tablename__ = "posts"

    id: int = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id", index=True)
    title: str
    description: str
    tags: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    latitude: float | None = Field(default=None)
    longitude: float | None = Field(default=None)
    image_url: str | None = Field(default=None)

    author: "User" = Relationship(back_populates="posts", sa_relationship_kwargs={"lazy": "selectin"})
    reviews: list["Review"] = Relationship(back_populates="post")
    favorited_by: list["User"] = Relationship(back_populates="favorite_posts", link_model=FavoritePost)

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now, sa_column_kwargs={"onupdate": utc_now})

    def get_schema(self) -> PostSchema:
        return PostSchema.model_validate({
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "author": BasicUserSchema(id=self.author_id, first_name=self.author.first_name, last_name=self.author.last_name, role=self.author.role, avatar_url=self.author.avatar_url),
            "tags": self.tags,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "image_url": self.image_url,
        })
