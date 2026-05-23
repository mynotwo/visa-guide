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
    const res = await wx.request({
      url: `${app.globalData.apiBase}/questions`,
      method: 'GET',
    })
    const questions = res.data
    this.setData({ questions, totalCount: questions.length })
    this.loadCurrentQuestion()
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
    const res = await wx.request({
      url: `${app.globalData.apiBase}/ai/suggest`,
      method: 'POST',
      data: { question_id: currentQuestion.id, answer_zh: answerZh },
    })
    this.setData({ suggestedEn: res.data.answer_en, isLoadingSuggestion: false })
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
