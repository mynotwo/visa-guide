const app = getApp()

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
    if (!app.globalData.sessionId) {
      const stored = wx.getStorageSync('sessionId')
      if (stored) {
        app.globalData.sessionId = stored
      } else {
        try {
          const res = await wx.cloud.callFunction({ name: 'createSession', data: {} })
          app.globalData.sessionId = res.result.data.id
          wx.setStorageSync('sessionId', res.result.data.id)
        } catch (e) {
          wx.showToast({ title: '创建会话失败，请重试', icon: 'none' })
          return
        }
      }
    }
    try {
      const res = await wx.cloud.callFunction({ name: 'getQuestions', data: {} })
      const questions = res.result.data
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
      const res = await wx.cloud.callFunction({
        name: 'getAiSuggestion',
        data: { question_id: currentQuestion.id, answer_zh: answerZh },
      })
      const answerEn = res.result.data?.answer_en
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

  async onConfirmAnswer() {
    const { currentQuestion, answerZh, suggestedEn } = this.data
    if (!suggestedEn) {
      wx.showToast({ title: '请先获取英文建议', icon: 'none' })
      return
    }
    try {
      await wx.cloud.callFunction({
        name: 'saveAnswer',
        data: {
          session_id: app.globalData.sessionId,
          question_id: currentQuestion.id,
          answer_zh: answerZh,
          answer_en: suggestedEn,
        },
      })
      this.setData({
        currentIndex: this.data.currentIndex + 1,
        completedCount: this.data.completedCount + 1,
      })
      this.loadCurrentQuestion()
    } catch (e) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  },

  onSkip() {
    const { currentQuestion } = this.data
    wx.showModal({
      title: '跳过此题',
      content: '跳过后可发给孩子确认。继续吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'skipAnswer',
              data: { session_id: app.globalData.sessionId, question_id: currentQuestion.id },
            })
            this.setData({ currentIndex: this.data.currentIndex + 1 })
            this.loadCurrentQuestion()
          } catch (e) {
            wx.showToast({ title: '操作失败，请重试', icon: 'none' })
          }
        }
      }
    })
  },

  async onCallChild() {
    const { currentQuestion, answerZh } = this.data
    try {
      await wx.cloud.callFunction({
        name: 'createEscalation',
        data: {
          session_id: app.globalData.sessionId,
          question_id: currentQuestion.id,
          parent_note: answerZh,
        },
      })
      wx.showToast({ title: '已通知孩子', icon: 'success' })
      this.setData({ currentIndex: this.data.currentIndex + 1 })
      this.loadCurrentQuestion()
    } catch (e) {
      wx.showToast({ title: '通知失败，请重试', icon: 'none' })
    }
  },
})
