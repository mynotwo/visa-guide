import httpx
import os
from dotenv import load_dotenv

load_dotenv()

WECHAT_APP_ID = os.getenv("WECHAT_APP_ID")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET")


def _get_access_token() -> str:
    resp = httpx.get(
        "https://api.weixin.qq.com/cgi-bin/token",
        params={
            "grant_type": "client_credential",
            "appid": WECHAT_APP_ID,
            "secret": WECHAT_APP_SECRET,
        },
        timeout=5.0
    )
    return resp.json()["access_token"]


def send_wechat_notification(to_openid: str, question_zh: str, session_id: str) -> bool:
    """发送微信订阅消息通知孩子。需提前配置 WECHAT_TEMPLATE_ID 并孩子完成订阅。"""
    template_id = os.getenv("WECHAT_TEMPLATE_ID", "")
    if not template_id or not to_openid:
        return False
    try:
        token = _get_access_token()
        resp = httpx.post(
            f"https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token={token}",
            json={
                "touser": to_openid,
                "template_id": template_id,
                "page": f"pages/escalate/escalate?session_id={session_id}",
                "data": {
                    "thing1": {"value": "爸妈填签证遇到问题，需要你确认"},
                    "thing2": {"value": question_zh[:20]},
                },
            },
            timeout=5.0
        )
        return resp.json().get("errcode") == 0
    except Exception:
        return False
