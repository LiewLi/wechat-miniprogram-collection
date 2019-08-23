// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'epicshit'
})

const db = cloud.database()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  let res = await db.collection('moody').where({
    _openid: wxContext.OPENID,
    year: event.year,
    month: event.month,
    day: event.day
  }).get()

  console.log(res)
  let data = res.data
  if (data.length <= 0) {
    await db.collection('moody').add({
      data:{
      _openid: wxContext.OPENID,
      year: event.year,
      month: event.month,
      day: event.day,
      mood: event.mood
      }
    })
  } else {
    let tasks = []
    for (let idx = 0; idx < data.length; idx++) {
      console.log(`update record: ${data[idx]._id}`)
      const t = db.collection('moody').doc(data[idx]._id).update({
        data:{
        mood: event.mood
      }})
      tasks.push(t)
    }

    await Promise.all(tasks)
  }


  return {
    data: []
  }
}