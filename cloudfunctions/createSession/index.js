const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()
  const now = new Date()
  const res = await db.collection('sessions').add({
    data: {
      parent_openid: OPENID,
      child_openid: null,
      child_phone: null,
      current_question_order: 1,
      is_complete: false,
      created_at: now,
      updated_at: now,
    }
  })
  return { data: { id: res._id, parent_openid: OPENID, current_question_order: 1, is_complete: false } }
}
