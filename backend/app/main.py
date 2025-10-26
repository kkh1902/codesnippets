from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routes import posts

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Board API",
    description="Simple board API with FastAPI",
    version="1.0.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Board API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
