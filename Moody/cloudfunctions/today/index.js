// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'epicshit'
})

const db = cloud.database()
const MAX_LIMIT = 100


// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext()
  let record = await db.collection('moody').where({
      _openid: wxContext.OPENID,
      year: event.year,
      month: event.month,
      day: event.day
  }).limit(1).get()

  return {
    data: record.data
  }
}