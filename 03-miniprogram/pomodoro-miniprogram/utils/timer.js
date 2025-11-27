// utils/timer.js - 计时器工具函数

/**
 * 格式化时间显示
 * @param {number} seconds 秒数
 * @returns {string} 格式化的时间字符串 "MM:SS"
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 计算进度百分比
 * @param {number} timeLeft 剩余时间
 * @param {number} totalTime 总时间
 * @returns {number} 进度百分比 0-100
 */
function calculateProgress(timeLeft, totalTime) {
  if (totalTime <= 0) return 0;
  return Math.round(((totalTime - timeLeft) / totalTime) * 100);
}

/**
 * 获取今天的日期字符串
 * @returns {string} 日期字符串 "YYYY-MM-DD"
 */
function getTodayString() {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
}

/**
 * 保存数据到本地存储
 * @param {string} key 键名
 * @param {any} data 数据
 */
function saveData(key, data) {
  try {
    wx.setStorageSync(key, data);
  } catch (e) {
    console.error('保存数据失败:', e);
  }
}

/**
 * 从本地存储读取数据
 * @param {string} key 键名
 * @param {any} defaultValue 默认值
 * @returns {any} 存储的数据或默认值
 */
function loadData(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(key);
    return data !== '' ? data : defaultValue;
  } catch (e) {
    console.error('读取数据失败:', e);
    return defaultValue;
  }
}

/**
 * 播放提示音
 */
function playSound() {
  const innerAudioContext = wx.createInnerAudioContext();
  // 使用系统提示音或自定义音频
  // 这里使用振动代替（更可靠）
  wx.vibrateShort({
    type: 'heavy'
  });
  
  // 延迟再振动一次
  setTimeout(() => {
    wx.vibrateShort({
      type: 'medium'
    });
  }, 200);
}

/**
 * 显示提示消息
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 */
function showToast(title, icon = 'none') {
  wx.showToast({
    title: title,
    icon: icon,
    duration: 2000
  });
}

/**
 * 显示模态对话框
 * @param {string} title 标题
 * @param {string} content 内容
 * @returns {Promise<boolean>} 用户是否确认
 */
function showConfirm(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

module.exports = {
  formatTime,
  calculateProgress,
  getTodayString,
  saveData,
  loadData,
  playSound,
  showToast,
  showConfirm
};

