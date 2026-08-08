from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analytics_routes

from app.database import Base, engine
from app.routers import auth_routes, user_routes, analysis_routes, branding_routes,  interview_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireMate AI Backend",
    description="AI-powered hiring readiness platform backend",
    version="3.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend deployment ke time specific URL daalenge
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "HireMate AI Backend is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(analysis_routes.router)
app.include_router(branding_routes.router)
app.include_router(interview_routes.router)
app.include_router(analytics_routes.router)