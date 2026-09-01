from fastapi import APIRouter
from pydantic import BaseModel
from app.services.education_engine import get_all_courses, verify_course_quiz

router = APIRouter(prefix="/education", tags=["Financial Education Hub"])

class QuizSubmitPayload(BaseModel):
    course_id: str
    selected_option_index: int

@router.get("/courses")
def get_courses():
    return get_all_courses()

@router.post("/verify-quiz")
def verify_quiz(payload: QuizSubmitPayload):
    return verify_course_quiz(payload.course_id, payload.selected_option_index)
