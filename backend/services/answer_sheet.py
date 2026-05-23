import json
import os
from typing import List, Dict

_questions_path = os.path.join(os.path.dirname(__file__), "../data/ds160_questions.json")
try:
    with open(_questions_path) as f:
        QUESTIONS = {q["id"]: q for q in json.load(f)}
except FileNotFoundError:
    raise RuntimeError(f"DS-160 question library not found at {_questions_path}.")


def generate_answer_sheet(answers: List[Dict]) -> Dict:
    answered_map = {a["question_id"]: a for a in answers}
    sections: Dict[str, list] = {}
    completed = 0
    pending = 0

    for q in sorted(QUESTIONS.values(), key=lambda x: x["order"]):
        qid = q["id"]
        answer = answered_map.get(qid)
        if not answer:
            continue
        section = q["section"]
        if section not in sections:
            sections[section] = []
        entry = {
            "question_id": qid,
            "field_name_en": q["field_name_en"],
            "question_zh": q["question_zh"],
            "answer_zh": answer["answer_zh"],
            "answer_en": answer["answer_en"],
            "is_skipped": answer["is_skipped"],
            "is_sensitive": q["is_sensitive"],
        }
        sections[section].append(entry)
        if answer["is_skipped"]:
            pending += 1
        else:
            completed += 1

    return {
        "total": completed + pending,
        "completed": completed,
        "pending": pending,
        "sections": [{"section": name, "entries": entries} for name, entries in sections.items()],
    }
