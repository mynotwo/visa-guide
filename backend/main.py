from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="美签向导 API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

from routers import questions as questions_router
from routers import sessions as sessions_router, answers as answers_router

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(questions_router.router)
app.include_router(sessions_router.router)
app.include_router(answers_router.router)
