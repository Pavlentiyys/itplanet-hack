from sqlmodel import SQLModel, Field


class FavoritePost(SQLModel, table=True):
    __tablename__ = "favorite_posts"

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    post_id: int = Field(foreign_key="posts.id", primary_key=True)
