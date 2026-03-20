import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db import init_db

from users.router import router as users_router
from auth.router import router as auth_router
from posts.router import router as posts_router
from reviews.router import router as reviews_router
from upload.router import router as upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("static", exist_ok=True)
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(reviews_router)
app.include_router(upload_router)
