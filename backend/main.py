from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sessions as sessions_router
from routers import answers as answers_router
from routers import ai as ai_router
from routers import questions as questions_router

app = FastAPI(title="美签向导 API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(sessions_router.router)
app.include_router(answers_router.router)
app.include_router(ai_router.router)
app.include_router(questions_router.router)
