from pydantic import BaseModel

from users.schemas import BasicUserSchema


class ReviewSchema(BaseModel):
    id: int
    title: str
    description: str
    rating: float
    author: BasicUserSchema
    post_id: int


class CreateReview(BaseModel):
    title: str
    description: str
    rating: float
    post_id: int


class EditReview(BaseModel):
    id: int
    title: str
    description: str
    rating: str


class Reviews(BaseModel):
    reviews: list[ReviewSchema]
