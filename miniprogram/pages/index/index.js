const app = getApp()

Page({
  data: {
    hasSession: false,
  },

  onLoad() {
    const sessionId = wx.getStorageSync('sessionId')
    this.setData({ hasSession: !!sessionId })
  },

  onStart() {
    wx.navigateTo({ url: '/pages/wizard/wizard' })
  },

  onContinue() {
    wx.navigateTo({ url: '/pages/wizard/wizard' })
  },

  onReset() {
    wx.showModal({
      title: '重新开始',
      content: '清除之前的进度，重新填写？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('sessionId')
          app.globalData.sessionId = null
          this.setData({ hasSession: false })
          wx.navigateTo({ url: '/pages/wizard/wizard' })
        }
      }
    })
  },
})
