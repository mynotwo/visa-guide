const API_BASE = 'https://your-backend.com'  // 替换为实际后端地址

App({
  globalData: {
    sessionId: null,
    apiBase: API_BASE,
  },
  onLaunch() {
    const sessionId = wx.getStorageSync('sessionId')
    if (sessionId) {
      this.globalData.sessionId = sessionId
    }
  }
})
