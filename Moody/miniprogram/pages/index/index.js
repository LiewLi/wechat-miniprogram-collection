//index.js
const app = getApp()

Page({
  data: {
    title: "今天感觉如何?",
    moods: [],
  },
  onLoad: function() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    this.refreshCalendar({
      year,
      month
    })
    this.syncToday()
  },
  refreshCalendar({
    year,
    month
  }) {
    this.setData({
      year,
      month
    })
    this.sync(this.data)
  },
  rate: function(m) {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let mood = {
      year,
      month,
      day,
      mood: m
    }

    let moods = this.data.moods
    let idx = moods.findIndex((ele) => {
      return ele.year === mood.year && ele.month === mood.month && ele.day == mood.day
    })
    if (idx !== -1) {
      moods[idx] = mood
    } else {
      moods.push(mood)
    }
    this.setData({
      moods: moods,
      today: m
    })

    wx.cloud.callFunction({
      name: 'rate',
      data: mood
    }).then(res => {
      this.refreshCalendar(this.data)
      this.syncToday()
    })
  },

  sync: function({
    year,
    month
  }) {
    wx.cloud.callFunction({
      name: "mood",
      data: {
        year,
        month
      }
    }).then(res => {
      console.log(res)


      let positive = res.result.data.filter((ele) => {
        return ele.mood > 0
      }).length || 0



      let neutral = res.result.data.filter((ele) => {
        return ele.mood === 0
      }).length || 0



      let negative = res.result.data.filter((ele) => {
        return ele.mood < 0
      }).length || 0


      this.setData({
        moods: res.result.data,
        positive,
        neutral,
        negative
      })

    }).catch(err => {
      console.error(err)
    })
  },

  syncToday: function() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    wx.cloud.callFunction({
      name: "today",
      data: {
        year,
        month,
        day
      }
    }).then(res => {
      console.log('today')
      console.log(res)
      if (res.result.data.length > 0) {
        this.setData({
          today: res.result.data[0].mood
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },

  onTapPositive: function(e) {
    this.rate(1)
  },
  onTapNeutral: function(e) {
    this.rate(0)
  },
  onTapNegative: function(e) {
    this.rate(-1)
  },
  onNext: function(e) {
    this.refreshCalendar(e.detail)
  },
  onPrev: function(e) {
    this.refreshCalendar(e.detail)
  }
})