from typing import TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from functions import utc_now
from .schemas import ReviewSchema
from users.schemas import BasicUserSchema

if TYPE_CHECKING:
    from users.models import User
    from posts.models import Post


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: int = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id", index=True)
    post_id: int = Field(foreign_key="posts.id", index=True)
    title: str
    description: str
    rating: float

    author: "User" = Relationship(back_populates="reviews", sa_relationship_kwargs={"lazy": "selectin"})
    post: "Post" = Relationship(back_populates="reviews", sa_relationship_kwargs={"lazy": "selectin"})

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now, sa_column_kwargs={"onupdate": utc_now})

    def get_schema(self) -> ReviewSchema:
        return ReviewSchema.model_validate({
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "rating": self.rating,
            "author": BasicUserSchema(id=self.author_id, first_name=self.author.first_name, last_name=self.author.last_name, role=self.author.role, avatar_url=self.author.avatar_url),
            "post_id": self.post_id
        })
