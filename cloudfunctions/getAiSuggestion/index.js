const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const questions = require('./ds160_questions.json')

exports.main = async (event, context) => {
  const { question_id, answer_zh } = event
  const question = questions.find(q => q.id === question_id)
  if (!question) return { error: 'Question not found' }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const prompt = `你是美国B1/B2签证申请助手。将以下中文回答翻译并改写为适合DS-160表格的英文答案。字段：${question.field_name_en}。提示：${question.ai_prompt_hint}。中文回答：${answer_zh}。只输出英文答案，不要解释。`

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await resp.json()
  const answer_en = data.content[0].text.trim()
  return { data: { answer_en } }
}
