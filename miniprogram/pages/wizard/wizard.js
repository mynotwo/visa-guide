const app = getApp()

function wxRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: resolve,
      fail: reject,
    })
  })
}

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    answerZh: '',
    suggestedEn: '',
    isLoadingSuggestion: false,
    totalCount: 0,
    completedCount: 0,
  },

  onLoad() {
    this.loadQuestions()
  },

  async loadQuestions() {
    // Ensure session exists
    if (!app.globalData.sessionId) {
      const wx_info = wx.getStorageSync('sessionId')
      if (wx_info) {
        app.globalData.sessionId = wx_info
      } else {
        try {
          const res = await wxRequest({
            url: `${app.globalData.apiBase}/sessions`,
            method: 'POST',
            data: { parent_openid: 'temp_openid' },  // replaced by real openid after WeChat login
          })
          app.globalData.sessionId = res.data.id
          wx.setStorageSync('sessionId', res.data.id)
        } catch (e) {
          wx.showToast({ title: '创建会话失败，请重试', icon: 'none' })
          return
        }
      }
    }
    try {
      const res = await wxRequest({
        url: `${app.globalData.apiBase}/questions`,
        method: 'GET',
      })
      const questions = res.data
      this.setData({ questions, totalCount: questions.length })
      this.loadCurrentQuestion()
    } catch (e) {
      wx.showToast({ title: '加载题目失败，请重试', icon: 'none' })
    }
  },

  loadCurrentQuestion() {
    const { questions, currentIndex } = this.data
    if (currentIndex >= questions.length) {
      wx.navigateTo({ url: '/pages/answer-sheet/answer-sheet' })
      return
    }
    this.setData({
      currentQuestion: questions[currentIndex],
      answerZh: '',
      suggestedEn: '',
    })
  },

  onAnswerInput(e) {
    this.setData({ answerZh: e.detail.value })
  },

  async onGetSuggestion() {
    const { currentQuestion, answerZh } = this.data
    if (!answerZh.trim()) {
      wx.showToast({ title: '请先填写回答', icon: 'none' })
      return
    }
    this.setData({ isLoadingSuggestion: true })
    try {
      const res = await wxRequest({
        url: `${app.globalData.apiBase}/ai/suggest`,
        method: 'POST',
        data: { question_id: currentQuestion.id, answer_zh: answerZh },
      })
      const answerEn = res.data?.answer_en
      if (!answerEn) {
        wx.showToast({ title: 'AI 建议失败，请重试', icon: 'none' })
        return
      }
      this.setData({ suggestedEn: answerEn })
    } catch (e) {
      wx.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      this.setData({ isLoadingSuggestion: false })
    }
  },

  onConfirmAnswer() {
    const { currentQuestion, answerZh, suggestedEn } = this.data
    if (!suggestedEn) {
      wx.showToast({ title: '请先获取英文建议', icon: 'none' })
      return
    }
    wx.request({
      url: `${app.globalData.apiBase}/sessions/${app.globalData.sessionId}/answers/${currentQuestion.id}`,
      method: 'POST',
      data: { answer_zh: answerZh, answer_en: suggestedEn },
      success: () => {
        this.setData({
          currentIndex: this.data.currentIndex + 1,
          completedCount: this.data.completedCount + 1,
        })
        this.loadCurrentQuestion()
      },
      fail: () => {
        wx.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    })
  },

  onSkip() {
    const { currentQuestion } = this.data
    wx.showModal({
      title: '跳过此题',
      content: '跳过后可发给孩子确认。继续吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.apiBase}/sessions/${app.globalData.sessionId}/answers/${currentQuestion.id}/skip`,
            method: 'POST',
            success: () => {
              this.setData({ currentIndex: this.data.currentIndex + 1 })
              this.loadCurrentQuestion()
            }
          })
        }
      }
    })
  },

  onCallChild() {
    const { currentQuestion, answerZh } = this.data
    wx.navigateTo({
      url: `/pages/escalate/escalate?question_id=${currentQuestion.id}&note=${encodeURIComponent(answerZh)}`
    })
  },
})
