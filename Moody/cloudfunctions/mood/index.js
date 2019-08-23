// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'epicshit'
})

const db = cloud.database()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const countResult = await db.collection('moody')
    .where({
      _openid: wxContext.openid,
      year: event.year || 0,
      month: event.month || 0
    }).count()

  console.log(`resultset count: ${countResult.total}`)

  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)

  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('moody').where({
      _openid: wxContext.OPENID,
      year: event.year || 0,
      month: event.month || 0
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  try {
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
        errCode: 0
      }
    })
  } catch (err) {
    return {
      data: [],
      errMsg: "Internal Error",
      errCode: -1001
    }
  }

}