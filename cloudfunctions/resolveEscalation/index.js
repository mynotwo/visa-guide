const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { escalation_id, child_reply } = event
  const db = cloud.database()
  await db.collection('escalations').doc(escalation_id).update({
    data: { child_reply, status: 'resolved', resolved_at: new Date() }
  })
  return { data: { success: true } }
}
