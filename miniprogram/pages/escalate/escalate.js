const app = getApp()

Page({
  data: {
    escalations: [],
    isLoading: true,
  },

  async onLoad() {
    await this.loadEscalations()
  },

  async onShow() {
    await this.loadEscalations()
  },

  async loadEscalations() {
    this.setData({ isLoading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getEscalations',
        data: { session_id: app.globalData.sessionId },
      })
      this.setData({ escalations: res.result.data || [] })
    } catch (e) {
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  onBackToWizard() {
    wx.navigateBack()
  },
})
