const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV, traceUser: true })
const questions = require('./ds160_questions.json')

exports.main = async (event, context) => {
  const { session_id, question_id, parent_note } = event
  const db = cloud.database()
  const question = questions.find(q => q.id === question_id)

  // AI pre-analysis
  let ai_suggestion = ''
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    const prompt = `DS-160表格字段"${question?.field_name_en}"，父母备注："${parent_note}"。请给出简短的填写建议（中文，50字以内）。`
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 100, messages: [{ role: 'user', content: prompt }] })
    })
    const data = await resp.json()
    ai_suggestion = data.content[0].text.trim()
  } catch (e) { /* non-fatal */ }

  const now = new Date()
  const res = await db.collection('escalations').add({
    data: { session_id, question_id, parent_note, ai_suggestion, child_reply: null, status: 'pending', created_at: now, resolved_at: null }
  })

  // Notify child if session has child_openid
  try {
    const sessionRes = await db.collection('sessions').doc(session_id).get()
    const child_openid = sessionRes.data.child_openid
    const template_id = process.env.WECHAT_TEMPLATE_ID
    if (child_openid && template_id) {
      await cloud.openapi.subscribeMessage.send({
        touser: child_openid,
        template_id,
        page: `pages/wizard/wizard`,
        data: {
          thing1: { value: question?.question_zh?.slice(0, 20) || question_id },
          thing2: { value: parent_note?.slice(0, 20) || '无' },
        }
      })
    }
  } catch (e) { /* non-fatal */ }

  return { data: { id: res._id, session_id, question_id, parent_note, ai_suggestion, status: 'pending' } }
}
