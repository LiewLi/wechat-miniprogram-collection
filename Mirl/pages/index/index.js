//index.js
//获取应用实例
const app = getApp()
const systemInfo = wx.getSystemInfoSync()
const mirl = require('./mirl.js')
Page({
  data: {
    width: systemInfo.screenWidth,
    height: Math.floor((systemInfo.screenHeight - 160) / 2),
    op: -1,
    showtips: true,
  },
  renderSize({ width, height }) {
    if (width / height > this.data.width / this.data.height) {
      this.rSize = {
        width: this.data.width,
        height: Math.floor(this.data.width / width * height)
      }
    } else {
      this.rSize = {
        width: Math.floor(this.data.height / height * width),
        height: this.data.height
      }
    }

    return this.rSize
  },
  drawLogo: function (ctx) {
    ctx.fillStyle = "rgba(50, 50, 50, 0)"
    const width = this.data.width
    const height = this.data.height

    ctx.fillRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2

    ctx.beginPath()
    ctx.arc(centerX, centerY, height / 2, Math.PI / 2, -Math.PI / 2, true)
    ctx.fillStyle = "rgb(255,198,227)"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, height / 2, Math.PI / 2, -Math.PI / 2)
    ctx.fillStyle = "rgb(255, 199, 1)"
    ctx.fill()

    const r = 2 * Math.floor(height / 6)
    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.fillRect(centerX, centerY - r, r / 2 + 1, r)

    ctx.beginPath()
    ctx.arc(centerX + r / 2, centerY - r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true)
    ctx.fill()


    ctx.beginPath()
    ctx.fillRect(centerX - r / 2 - 1, centerY, r / 2 + 1, r)

    ctx.beginPath()
    ctx.arc(centerX - r / 2, centerY + r / 2, r / 2, Math.PI / 2, -Math.PI / 2)
    ctx.fill()

    ctx.draw()
  }
  ,
  onLoad: function () {
    const ctx = wx.createCanvasContext('src', this)
    this.srcCtx = ctx
    const dst_ctx = wx.createCanvasContext('dst', this)
    this.dstCtx = dst_ctx
    this.drawLogo(this.srcCtx)

  },
  render(cb) {
    const that = this
    const rect = {
      x: Math.max(0, Math.floor(this.data.width - this.rSize.width) / 2.0),
      y: Math.max(0, Math.floor(this.data.height - this.rSize.height) / 2.0),
      width: that.rSize.width,
      height: that.rSize.height,
    }
    this.dstCtx.clearRect(0, 0, this.data.width, this.data.height)
    this.dstCtx.draw(false, () => {
      wx.canvasGetImageData({
        canvasId: 'src',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        success(res) {
          const image = cb(res)
          wx.canvasPutImageData({
            canvasId: 'dst',
            data: image.data,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            success: res => {
              console.log(res)
            },
            fail: err => {
              console.log(err)
            }
          }, that)

        }
      })
    }, this)
  },

  switchFilter(op, cb) {
    if (this.data.op === op) {
      return false
    }
    this.setData({ op: op })
    cb()
    return true
  },
  onPosterize() {
    this.switchFilter(1, () => {
      this.render(res => {
        const image = new mirl.Image(res.width, res.height, res.data)
        return image.posterize(4)
      })
    })
  },
  onFlip() {
    this.switchFilter(2, () => {
      this.render(res => {
        const image = new mirl.Image(res.width, res.height, res.data)
        return image.flip()
      })
    })
  },
  onPixelate() {
    this.switchFilter(3, () => {
      this.render(res => {
        const image = new mirl.Image(res.width, res.height, res.data)
        return image.pixelate(5)
      })
    })
  },
  onSepia() {
    this.switchFilter(4, () => {
      this.render(res => {
        const image = new mirl.Image(res.width, res.height, res.data)
        return image.sepia()
      })
    })
  },
  onGrayScale() {
    this.switchFilter(5, () => {
      this.render(res => {
        const image = new mirl.Image(res.width, res.height, res.data)
        return image.grayScale()
      })
    })
  },

  onBW() {
    this.switchFilter(6, () => {
      this.render(res => {
        const image = new mirl.Image(res.width, res.height, res.data)
        return image.bw()
      })
    })
  },

  onSrc() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ showtips: false })
        const ctx = this.srcCtx
        const that = this
        const path = res.tempFilePaths[0]
        wx.getImageInfo({
          src: path,
          success: res => {
            const size = that.renderSize(res)
            ctx.drawImage(path, Math.max(0, Math.floor(this.data.width - size.width) / 2.0), Math.max(0, Math.floor(this.data.height - size.height) / 2.0), size.width, size.height)
            ctx.draw(false, () => {
              that.onPosterize()
            })
          }
        })
      },
    })
  },
  onDst() {
    if (this.data.showtips) {
      return
    }
    wx.showActionSheet({
      itemList: ['保存照片到相册'],
      success: res => {
        if (res.tapIndex == 0) {
          this.saveImage()
        }
      }
    })


  },
  saveImage() {
    const dst_ctx = wx.createCanvasContext('dst', this)
    wx.canvasToTempFilePath({
      canvasId: 'dst',
      x: 0,
      y: 0,
      width: this.data.width,
      height: this.data.height,
      destWidth: this.data.width * 2,
      destHeight: this.data.height * 2,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: res => {
            wx.showToast({
              title: '已保存照片到相册',
            })
          }
        })
      }
    }, this)
  },
  onShareAppMessage: function () {
    return {
      title: "Mirl",
      path: "pages/index/index"
    }
  }
})
