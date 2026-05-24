const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const questions = require('./ds160_questions.json')

exports.main = async (event, context) => {
  const { session_id } = event
  const db = cloud.database()
  const answersRes = await db.collection('answers').where({ session_id }).get()
  const answersMap = {}
  for (const a of answersRes.data) answersMap[a.question_id] = a

  // group questions by official_page
  const pageMap = {}
  for (const q of questions) {
    const page = q.official_page || 99
    if (!pageMap[page]) pageMap[page] = { page, fields: [] }
    const ans = answersMap[q.id]
    pageMap[page].fields.push({
      question_id: q.id,
      field_name_en: q.field_name_en,
      official_field_label: q.official_field_label || q.field_name_en,
      section: q.section,
      question_zh: q.question_zh,
      answer_en: ans?.answer_en || '',
      answer_zh: ans?.answer_zh || '',
      is_skipped: ans?.is_skipped || false,
      is_sensitive: q.is_sensitive || false,
    })
  }

  const pages = Object.values(pageMap).sort((a, b) => a.page - b.page)
  const total = questions.length
  const answered = Object.values(answersMap).filter(a => !a.is_skipped).length
  const skipped = Object.values(answersMap).filter(a => a.is_skipped).length

  return { data: { total, answered, skipped, pages } }
}
