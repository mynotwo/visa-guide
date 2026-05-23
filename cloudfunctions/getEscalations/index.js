const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { session_id } = event
  const db = cloud.database()
  const res = await db.collection('escalations')
    .where({ session_id })
    .orderBy('created_at', 'asc')
    .get()
  return { data: res.data }
}
