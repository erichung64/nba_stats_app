from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .views import router

app = FastAPI()

# Set up CORS
origins = [
    "http://localhost:3000",  # React app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
