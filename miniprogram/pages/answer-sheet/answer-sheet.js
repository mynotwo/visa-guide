const app = getApp()

Page({
  data: {
    sheet: null,
    isLoading: true,
  },

  async onLoad() {
    const res = await wx.request({
      url: `${app.globalData.apiBase}/sessions/${app.globalData.sessionId}/answer-sheet`,
    })
    this.setData({ sheet: res.data, isLoading: false })
  },

  onSaveScreenshot() {
    wx.showToast({ title: '长按页面截图保存', icon: 'none' })
  },
})
