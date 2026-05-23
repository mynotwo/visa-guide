const app = getApp()

Page({
  data: {
    sheet: null,
    isLoading: true,
  },

  async onLoad() {
    try {
      const res = await wx.request({
        url: `${app.globalData.apiBase}/sessions/${app.globalData.sessionId}/answer-sheet`,
      })
      this.setData({ sheet: res.data })
    } catch (e) {
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  onSaveScreenshot() {
    wx.showToast({ title: '长按页面截图保存', icon: 'none' })
  },
})
