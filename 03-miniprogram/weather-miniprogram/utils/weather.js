// utils/weather.js - 天气API工具函数

/**
 * 天气代码对应的描述和图标
 */
const weatherCodeMap = {
  0: { desc: '晴朗', icon: '☀️', bg: 'sunny' },
  1: { desc: '大部晴朗', icon: '🌤️', bg: 'sunny' },
  2: { desc: '局部多云', icon: '⛅', bg: 'cloudy' },
  3: { desc: '多云', icon: '☁️', bg: 'cloudy' },
  45: { desc: '雾', icon: '🌫️', bg: 'foggy' },
  48: { desc: '雾凇', icon: '🌫️', bg: 'foggy' },
  51: { desc: '小毛毛雨', icon: '🌧️', bg: 'rainy' },
  53: { desc: '中毛毛雨', icon: '🌧️', bg: 'rainy' },
  55: { desc: '大毛毛雨', icon: '🌧️', bg: 'rainy' },
  61: { desc: '小雨', icon: '🌧️', bg: 'rainy' },
  63: { desc: '中雨', icon: '🌧️', bg: 'rainy' },
  65: { desc: '大雨', icon: '🌧️', bg: 'rainy' },
  66: { desc: '冻雨', icon: '🌨️', bg: 'rainy' },
  67: { desc: '大冻雨', icon: '🌨️', bg: 'rainy' },
  71: { desc: '小雪', icon: '❄️', bg: 'snowy' },
  73: { desc: '中雪', icon: '❄️', bg: 'snowy' },
  75: { desc: '大雪', icon: '❄️', bg: 'snowy' },
  77: { desc: '雪粒', icon: '🌨️', bg: 'snowy' },
  80: { desc: '小阵雨', icon: '🌦️', bg: 'rainy' },
  81: { desc: '中阵雨', icon: '🌦️', bg: 'rainy' },
  82: { desc: '大阵雨', icon: '⛈️', bg: 'stormy' },
  85: { desc: '小阵雪', icon: '🌨️', bg: 'snowy' },
  86: { desc: '大阵雪', icon: '🌨️', bg: 'snowy' },
  95: { desc: '雷暴', icon: '⛈️', bg: 'stormy' },
  96: { desc: '雷暴+小冰雹', icon: '⛈️', bg: 'stormy' },
  99: { desc: '雷暴+大冰雹', icon: '⛈️', bg: 'stormy' }
};

/**
 * 获取天气信息
 */
function getWeatherInfo(code) {
  return weatherCodeMap[code] || { desc: '未知', icon: '❓', bg: 'cloudy' };
}

/**
 * 根据城市名搜索地理位置
 */
function searchCity(cityName) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://geocoding-api.open-meteo.com/v1/search',
      data: {
        name: cityName,
        count: 5,
        language: 'zh',
        format: 'json'
      },
      success(res) {
        if (res.data && res.data.results) {
          resolve(res.data.results);
        } else {
          resolve([]);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 根据经纬度获取天气数据
 */
function getWeatherByLocation(latitude, longitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.open-meteo.com/v1/forecast',
      data: {
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: 7
      },
      success(res) {
        if (res.data) {
          resolve(res.data);
        } else {
          reject(new Error('获取天气数据失败'));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 获取当前位置
 */
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 根据经纬度反查城市名（使用腾讯地图API需要申请key，这里简化处理）
 */
function reverseGeocode(latitude, longitude) {
  return new Promise((resolve, reject) => {
    // 简化处理：直接返回"当前位置"
    // 实际项目中可以接入腾讯地图API
    resolve({
      name: '当前位置',
      latitude: latitude,
      longitude: longitude
    });
  });
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  
  // 判断是否是今天
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  }
  
  // 判断是否是明天
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return '明天';
  }
  
  return `${month}/${day} ${weekday}`;
}

/**
 * 温度转换
 */
function convertTemp(celsius, unit) {
  if (unit === 'fahrenheit') {
    return Math.round(celsius * 9 / 5 + 32);
  }
  return Math.round(celsius);
}

module.exports = {
  getWeatherInfo,
  searchCity,
  getWeatherByLocation,
  getCurrentLocation,
  reverseGeocode,
  formatDate,
  convertTemp
};

