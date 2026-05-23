const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const questions = require('./ds160_questions.json')

exports.main = async (event, context) => {
  const { session_id } = event
  const db = cloud.database()
  const answersRes = await db.collection('answers').where({ session_id }).get()
  const answersMap = {}
  for (const a of answersRes.data) answersMap[a.question_id] = a

  const sections = {}
  for (const q of questions) {
    if (!sections[q.section]) sections[q.section] = { name: q.section, questions: [] }
    const ans = answersMap[q.id]
    sections[q.section].questions.push({
      question_zh: q.question_zh,
      field_name_en: q.field_name_en,
      answer_en: ans?.answer_en || '',
      answer_zh: ans?.answer_zh || '',
      is_skipped: ans?.is_skipped || false,
    })
  }

  const total = questions.length
  const completed = Object.values(answersMap).filter(a => !a.is_skipped).length
  const pending = Object.values(answersMap).filter(a => a.is_skipped).length

  return { data: { total, completed, pending, sections: Object.values(sections) } }
}
