import pytest
from unittest.mock import patch, MagicMock
from services.ai_service import suggest_english_answer


def test_suggest_english_answer_basic():
    question = {
        "id": "p1_surname",
        "field_name_en": "Surnames",
        "explanation_zh": "填护照上的英文姓",
        "ai_prompt_hint": "Convert Chinese surname to pinyin uppercase matching passport."
    }
    with patch("services.ai_service.anthropic_client") as mock_client:
        mock_response = MagicMock()
        mock_response.content[0].text = "WANG"
        mock_client.messages.create.return_value = mock_response
        result = suggest_english_answer(question=question, answer_zh="王建国")
    assert result == "WANG"


def test_suggest_english_answer_calls_claude():
    question = {
        "id": "p6_employer",
        "field_name_en": "Present Employer",
        "explanation_zh": "填工作单位英文名",
        "ai_prompt_hint": "Translate Chinese company name to standard English, uppercase."
    }
    with patch("services.ai_service.anthropic_client") as mock_client:
        mock_response = MagicMock()
        mock_response.content[0].text = "CHINA POST GROUP CO."
        mock_client.messages.create.return_value = mock_response
        result = suggest_english_answer(question=question, answer_zh="中国邮政集团有限公司")
    call_args = mock_client.messages.create.call_args
    assert "claude-sonnet-4-6" in str(call_args)
    assert result == "CHINA POST GROUP CO."
