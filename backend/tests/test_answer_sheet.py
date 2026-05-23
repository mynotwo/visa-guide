import pytest
from services.answer_sheet import generate_answer_sheet


def test_generate_answer_sheet_basic():
    answers = [
        {"question_id": "p1_surname", "answer_zh": "王", "answer_en": "WANG", "is_skipped": False},
        {"question_id": "p1_given_name", "answer_zh": "建国", "answer_en": "JIANGUO", "is_skipped": False},
        {"question_id": "p8_us_refused", "answer_zh": "", "answer_en": "", "is_skipped": True},
    ]
    sheet = generate_answer_sheet(answers)
    assert sheet["total"] == 3
    assert sheet["completed"] == 2
    assert sheet["pending"] == 1
    assert len(sheet["sections"]) > 0
    surname_entry = next(
        e for s in sheet["sections"] for e in s["entries"] if e["question_id"] == "p1_surname"
    )
    assert surname_entry["answer_en"] == "WANG"
    assert surname_entry["field_name_en"] == "Surnames"


def test_generate_answer_sheet_sections():
    answers = [
        {"question_id": "p1_surname", "answer_zh": "王", "answer_en": "WANG", "is_skipped": False},
        {"question_id": "p2_passport_number", "answer_zh": "E12345678", "answer_en": "E12345678", "is_skipped": False},
    ]
    sheet = generate_answer_sheet(answers)
    section_names = [s["section"] for s in sheet["sections"]]
    assert "个人信息" in section_names
    assert "护照信息" in section_names
