App({
  globalData: {
    sessionId: null,
  },
  onLaunch() {
    wx.cloud.init({ env: 'your-env-id', traceUser: true })
    const sessionId = wx.getStorageSync('sessionId')
    if (sessionId) {
      this.globalData.sessionId = sessionId
    }
  }
})
