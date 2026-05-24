const app = getApp()

const STORAGE_KEY_PREFIX = 'guide_done_'

Page({
  data: {
    isLoading: true,
    isAllDone: false,
    pages: [],
    currentStep: 1,
    totalSteps: 0,
    currentPageTitle: '',
    currentFields: [],
    pageFieldsCount: 0,
    doneCount: 0,
    progressPercent: 0,
  },

  onLoad() {
    this.loadData()
  },

  async loadData() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getGuideData',
        data: { session_id: app.globalData.sessionId },
      })
      const { pages } = res.result.data
      if (!pages || pages.length === 0) {
        this.setData({ isLoading: false })
        return
      }

      // merge local done state
      const doneMap = this.getDoneMap()
      for (const p of pages) {
        for (const f of p.fields) {
          f._done = !!doneMap[f.question_id]
        }
      }

      this.setData({
        pages,
        totalSteps: pages.length,
        isLoading: false,
      })
      this.renderStep(1)
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  getDoneMap() {
    try {
      const key = STORAGE_KEY_PREFIX + (app.globalData.sessionId || '')
      return wx.getStorageSync(key) || {}
    } catch (_) {
      return {}
    }
  },

  saveDoneMap(map) {
    try {
      const key = STORAGE_KEY_PREFIX + (app.globalData.sessionId || '')
      wx.setStorageSync(key, map || {})
    } catch (_) {}
  },

  renderStep(step) {
    const { pages } = this.data
    if (step < 1 || step > pages.length) return

    const page = pages[step - 1]
    const fields = page.fields || []
    const doneCount = fields.filter(f => f._done).length

    this.setData({
      currentStep: step,
      currentPageTitle: 'Page ' + page.page,
      currentFields: fields,
      pageFieldsCount: fields.length,
      doneCount,
      progressPercent: fields.length > 0 ? (doneCount / fields.length * 100) : 0,
    })
  },

  onToggleField(e) {
    const qid = e.currentTarget.dataset.qid
    if (!qid) return

    const { pages, currentStep } = this.data
    const page = pages[currentStep - 1]
    const field = page.fields.find(f => f.question_id === qid)
    if (!field) return

    field._done = !field._done

    // persist
    const doneMap = this.getDoneMap()
    doneMap[qid] = field._done
    this.saveDoneMap(doneMap)

    // re-render current page
    this.renderStep(currentStep)
  },

  onNext() {
    const { currentStep, totalSteps } = this.data
    if (currentStep < totalSteps) {
      this.renderStep(currentStep + 1)
    } else {
      this.setData({ isAllDone: true })
    }
  },

  onPrev() {
    const { currentStep } = this.data
    if (currentStep > 1) {
      this.renderStep(currentStep - 1)
    }
  },

  onGoHome() {
    wx.navigateBack({ delta: 999 })
  },
})
