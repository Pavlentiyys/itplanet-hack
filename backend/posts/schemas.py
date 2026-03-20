from enum import StrEnum
from pydantic import BaseModel, Field

from users.schemas import BasicUserSchema


class HistoricalTag(StrEnum):
    CASTLE = "castle"
    MONUMENT = "monument"
    PALACE = "palace"
    FORTRESS = "fortress"


class NatureTag(StrEnum):
    MOUNTAINS = "mountains"
    LAKE = "lake"
    FOREST = "forest"
    VOLCANO = "volcano"
    GEYSER = "geyser"
    PARK = "park"
    RESERVE = "reserve"


class EntertainmentTag(StrEnum):
    RESTAURANT = "restaurant"
    CAFE = "cafe"
    THEATER = "theater"


class CulturalTag(StrEnum):
    SIGHT = "sight"
    MUSEUM = "museum"
    ART = "art"
    ARCHITECTURE = "architecture"


class RecreationalTag(StrEnum):
    PENSION = "pension"
    RESORT = "resort"
    TOURISM = "tourism"
    SPA = "spa"


class Tags(BaseModel):
    historical: list[HistoricalTag] = Field(default_factory=list)
    nature: list[NatureTag] = Field(default_factory=list)
    entertainment: list[EntertainmentTag] = Field(default_factory=list)
    cultural: list[CulturalTag] = Field(default_factory=list)
    recreational: list[RecreationalTag] = Field(default_factory=list)


class PostSchema(BaseModel):
    id: int
    title: str
    description: str
    author: BasicUserSchema
    tags: Tags
    latitude: float | None = None
    longitude: float | None = None
    image_url: str | None = None


class CreatePost(BaseModel):
    title: str
    description: str
    tags: Tags
    latitude: float | None = None
    longitude: float | None = None
    image_url: str | None = None


class EditPost(BaseModel):
    id: int
    title: str
    description: str
    tags: Tags


class Posts(BaseModel):
    posts: list[PostSchema]


class FavoritePostResponse(BaseModel):
    is_favorited: bool
