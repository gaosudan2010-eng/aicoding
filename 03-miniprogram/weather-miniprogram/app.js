// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('天气小程序启动');
  },
  
  globalData: {
    // 全局数据
    currentCity: null,
    weatherData: null,
    // 温度单位：celsius 或 fahrenheit
    tempUnit: 'celsius'
  }
})

