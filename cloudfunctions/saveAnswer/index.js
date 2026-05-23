const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { session_id, question_id, answer_zh, answer_en } = event
  const db = cloud.database()
  const now = new Date()
  const existing = await db.collection('answers')
    .where({ session_id, question_id })
    .get()
  if (existing.data.length > 0) {
    await db.collection('answers').doc(existing.data[0]._id).update({
      data: { answer_zh, answer_en, is_skipped: false, updated_at: now }
    })
  } else {
    await db.collection('answers').add({
      data: { session_id, question_id, answer_zh, answer_en, is_skipped: false, created_at: now, updated_at: now }
    })
  }
  return { data: { success: true } }
}
