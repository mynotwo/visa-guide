const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const questions = require('./ds160_questions.json')

exports.main = async (event, context) => {
  return { data: questions }
}
