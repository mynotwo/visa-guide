import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """你是美国 B1/B2 签证申请助手。用户会告诉你 DS-160 表格的某个字段信息和用户的中文回答。
你的任务是将用户的回答转换为适合填入 DS-160 表格的英文内容。

规则：
- 只返回英文答案本身，不要解释，不要句子
- 全部大写
- 符合 DS-160 字段的格式要求
- 如果用户的回答是「不知道」或「没有」，返回 DOES NOT APPLY 或 NONE（根据字段语义判断）"""


def suggest_english_answer(question: dict, answer_zh: str) -> str:
    user_message = f"""字段：{question['field_name_en']}
字段说明：{question['explanation_zh']}
格式提示：{question['ai_prompt_hint']}
用户回答（中文）：{answer_zh}

请返回适合填入 DS-160 的英文答案："""

    response = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=100,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )
    return response.content[0].text.strip()
