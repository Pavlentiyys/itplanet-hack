from pydantic import BaseModel


class ObjectId(BaseModel):
    id: int
