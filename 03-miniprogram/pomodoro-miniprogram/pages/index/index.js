/**
 * 🍅 番茄钟小程序 - 首页逻辑
 * iOS 设计规范 - 优化版
 */

// 进度环参数
const RING_RADIUS = 140; // 半径 (rpx 转换后)
const RING_CENTER = 140; // 中心点

Page({
  data: {
    // 计时器状态
    isRunning: false,
    isWorkPhase: true,
    timeLeft: 25 * 60,
    timerDisplay: '25:00',
    timerLabel: '工作时间',
    btnText: '开始专注',
    
    // 统计数据
    completedPomodoros: 0,
    totalMinutes: 0,
    currentStreak: 0,
    
    // 番茄图标
    tomatoIcons: [],
    
    // 设置
    settings: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      vibrate: true,
      sound: true
    },
    
    // 设置面板
    showSettings: false,
    
    // 进度环
    progressOffset: 0,
    dotPosition: { x: 50, y: 3 } // 初始位置在顶部
  },

  // 定时器
  timerInterval: null,
  canvas: null,
  ctx: null,

  onLoad() {
    this.loadFromStorage();
    this.updateDisplay();
    this.updateTomatoIcons();
    this.initCanvas();
  },

  onShow() {
    // 页面显示时检查是否需要恢复计时
    this.checkHiddenTime();
  },

  onHide() {
    // 页面隐藏时记录时间
    if (this.data.isRunning) {
      wx.setStorageSync('pomodoroHiddenTime', Date.now());
    }
  },

  onUnload() {
    this.clearTimer();
  },

  // ==================== Canvas 初始化 ====================
  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#progressCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          // 设置 canvas 尺寸
          const dpr = wx.getWindowInfo().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          
          this.canvas = canvas;
          this.ctx = ctx;
          this.drawProgress(0);
        }
      });
  },

  // 绘制进度环
  drawProgress(progress) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const width = this.canvas.width / wx.getWindowInfo().pixelRatio;
    const height = this.canvas.height / wx.getWindowInfo().pixelRatio;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 6;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制进度弧
    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(
        centerX, 
        centerY, 
        radius, 
        -Math.PI / 2, 
        -Math.PI / 2 + progress * 2 * Math.PI,
        false
      );
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 添加发光效果
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = this.data.isRunning ? 8 : 4;
      
      ctx.stroke();
    }
  },

  // 更新光点位置
  updateDotPosition(progress) {
    const angle = progress * 2 * Math.PI - Math.PI / 2;
    const radius = 50; // 相对于容器的百分比
    const centerX = 50;
    const centerY = 50;
    
    const x = centerX + radius * Math.cos(angle) * 0.94;
    const y = centerY + radius * Math.sin(angle) * 0.94;
    
    this.setData({
      dotPosition: { x, y }
    });
  },

  // ==================== 计时器控制 ====================
  toggleTimer() {
    if (this.data.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    this.setData({
      isRunning: true,
      btnText: '暂停'
    });
    
    this.timerInterval = setInterval(() => {
      let timeLeft = this.data.timeLeft - 1;
      
      if (timeLeft <= 0) {
        this.completePhase();
        return;
      }
      
      this.setData({ timeLeft });
      this.updateDisplay();
    }, 1000);
  },

  pauseTimer() {
    this.clearTimer();
    this.setData({
      isRunning: false,
      btnText: this.data.isWorkPhase ? '继续专注' : '继续休息'
    });
  },

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  resetTimer() {
    this.pauseTimer();
    
    const duration = this.data.isWorkPhase 
      ? this.data.settings.workDuration 
      : this.getBreakDuration();
    
    this.setData({
      timeLeft: duration * 60,
      btnText: this.data.isWorkPhase ? '开始专注' : '开始休息'
    });
    
    this.updateDisplay();
    wx.showToast({ title: '已重置', icon: 'none' });
  },

  skipPhase() {
    this.pauseTimer();
    this.completePhase();
  },

  completePhase() {
    this.clearTimer();
    
    const { isWorkPhase, completedPomodoros, currentStreak, settings } = this.data;
    
    if (isWorkPhase) {
      // 完成一个番茄
      const newCompleted = completedPomodoros + 1;
      const newStreak = currentStreak + 1;
      const newMinutes = this.data.totalMinutes + settings.workDuration;
      
      this.setData({
        completedPomodoros: newCompleted,
        currentStreak: newStreak,
        totalMinutes: newMinutes,
        isWorkPhase: false,
        timeLeft: this.getBreakDuration() * 60,
        timerLabel: newStreak % settings.longBreakInterval === 0 ? '长休息' : '短休息',
        btnText: '开始休息',
        isRunning: false
      });
      
      this.playNotification('🎉 太棒了！完成一个番茄！');
      this.updateTomatoIcons();
      this.saveToStorage();
    } else {
      // 休息结束
      this.setData({
        isWorkPhase: true,
        timeLeft: settings.workDuration * 60,
        timerLabel: '工作时间',
        btnText: '开始专注',
        isRunning: false
      });
      
      this.playNotification('☕ 休息结束，继续加油！');
    }
    
    this.updateDisplay();
  },

  getBreakDuration() {
    const { currentStreak, settings } = this.data;
    if (currentStreak > 0 && currentStreak % settings.longBreakInterval === 0) {
      return settings.longBreakDuration;
    }
    return settings.shortBreakDuration;
  },

  // ==================== 显示更新 ====================
  updateDisplay() {
    const { timeLeft, isWorkPhase, settings } = this.data;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 计算进度
    const totalTime = isWorkPhase 
      ? settings.workDuration * 60 
      : this.getBreakDuration() * 60;
    const progress = (totalTime - timeLeft) / totalTime;
    
    this.setData({ timerDisplay });
    
    // 更新进度环
    this.drawProgress(progress);
    this.updateDotPosition(progress);
  },

  updateTomatoIcons() {
    const { settings, currentStreak } = this.data;
    const total = settings.longBreakInterval;
    const completed = currentStreak % total;
    
    const icons = [];
    for (let i = 0; i < total; i++) {
      icons.push({
        completed: i < (completed === 0 && currentStreak > 0 ? total : completed)
      });
    }
    
    this.setData({ tomatoIcons: icons });
  },

  // ==================== 设置面板 ====================
  openSettings() {
    this.setData({ showSettings: true });
  },

  closeSettings() {
    this.setData({ showSettings: false });
  },

  closeSettingsOverlay(e) {
    if (e.target.dataset.close !== false) {
      this.closeSettings();
    }
  },

  preventClose() {
    // 阻止事件冒泡
  },

  onWorkDurationChange(e) {
    const value = parseInt(e.detail.value) || 25;
    this.setData({ 'settings.workDuration': Math.min(60, Math.max(1, value)) });
  },

  onShortBreakChange(e) {
    const value = parseInt(e.detail.value) || 5;
    this.setData({ 'settings.shortBreakDuration': Math.min(30, Math.max(1, value)) });
  },

  onLongBreakChange(e) {
    const value = parseInt(e.detail.value) || 15;
    this.setData({ 'settings.longBreakDuration': Math.min(60, Math.max(5, value)) });
  },

  onIntervalChange(e) {
    const value = parseInt(e.detail.value) || 4;
    this.setData({ 'settings.longBreakInterval': Math.min(10, Math.max(2, value)) });
  },

  onVibrateChange(e) {
    this.setData({ 'settings.vibrate': e.detail.value });
  },

  onSoundChange(e) {
    this.setData({ 'settings.sound': e.detail.value });
  },

  saveSettings() {
    const { settings, isRunning, isWorkPhase } = this.data;
    
    if (!isRunning) {
      const duration = isWorkPhase ? settings.workDuration : this.getBreakDuration();
      this.setData({ timeLeft: duration * 60 });
      this.updateDisplay();
    }
    
    this.updateTomatoIcons();
    this.saveToStorage();
    this.closeSettings();
    wx.showToast({ title: '设置已保存', icon: 'success' });
  },

  resetStats() {
    wx.showModal({
      title: '确认',
      content: '确定要清空所有统计数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            completedPomodoros: 0,
            totalMinutes: 0,
            currentStreak: 0
          });
          this.updateTomatoIcons();
          this.saveToStorage();
          this.closeSettings();
          wx.showToast({ title: '统计已清空', icon: 'none' });
        }
      }
    });
  },

  // ==================== 通知 ====================
  playNotification(message) {
    const { settings } = this.data;
    
    // 震动
    if (settings.vibrate) {
      wx.vibrateShort({ type: 'heavy' });
      setTimeout(() => wx.vibrateShort({ type: 'medium' }), 150);
      setTimeout(() => wx.vibrateShort({ type: 'light' }), 300);
    }
    
    // 声音 - 使用系统提示音
    if (settings.sound) {
      try {
        const innerAudioContext = wx.createInnerAudioContext();
        innerAudioContext.src = '/audio/complete.mp3';
        innerAudioContext.play();
      } catch (e) {
        // 如果没有音频文件，使用震动代替
        wx.vibrateShort({ type: 'heavy' });
      }
    }
    
    // 显示提示
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // ==================== 本地存储 ====================
  saveToStorage() {
    const { settings, completedPomodoros, totalMinutes, currentStreak } = this.data;
    const data = {
      settings,
      completedPomodoros,
      totalMinutes,
      currentStreak,
      date: new Date().toDateString()
    };
    wx.setStorageSync('pomodoroData', data);
  },

  loadFromStorage() {
    try {
      const saved = wx.getStorageSync('pomodoroData');
      if (saved) {
        // 检查是否是今天的数据
        if (saved.date === new Date().toDateString()) {
          this.setData({
            completedPomodoros: saved.completedPomodoros || 0,
            totalMinutes: saved.totalMinutes || 0,
            currentStreak: saved.currentStreak || 0
          });
        }
        
        // 加载设置
        if (saved.settings) {
          this.setData({
            settings: { ...this.data.settings, ...saved.settings }
          });
        }
      }
      
      // 初始化时间
      this.setData({
        timeLeft: this.data.settings.workDuration * 60
      });
    } catch (e) {
      console.log('加载存储失败', e);
    }
  },

  checkHiddenTime() {
    if (!this.data.isRunning) return;
    
    try {
      const hiddenTime = wx.getStorageSync('pomodoroHiddenTime');
      if (hiddenTime) {
        const elapsed = Math.floor((Date.now() - hiddenTime) / 1000);
        let newTimeLeft = Math.max(0, this.data.timeLeft - elapsed);
        
        wx.removeStorageSync('pomodoroHiddenTime');
        
        if (newTimeLeft <= 0) {
          this.completePhase();
        } else {
          this.setData({ timeLeft: newTimeLeft });
          this.updateDisplay();
        }
      }
    } catch (e) {
      console.log('检查隐藏时间失败', e);
    }
  },

  // ==================== 分享 ====================
  onShareAppMessage() {
    return {
      title: '🍅 番茄钟 - 专注工作，高效休息',
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return {
      title: '🍅 番茄钟 - 专注工作，高效休息'
    };
  }
});
