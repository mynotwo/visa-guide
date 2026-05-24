const app = getApp()

Page({
  data: {
    sheet: null,
    isLoading: true,
  },

  async onLoad() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getAnswerSheet',
        data: { session_id: app.globalData.sessionId },
      })
      this.setData({ sheet: res.result.data })
    } catch (e) {
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  onSaveScreenshot() {
    wx.showToast({ title: '长按页面截图保存', icon: 'none' })
  },

  onGoGuide() {
    wx.navigateTo({ url: '/pages/guide/guide' })
  },
})
