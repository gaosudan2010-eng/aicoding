// pages/index/index.js
const weatherUtil = require('../../utils/weather.js');

Page({
  data: {
    // 搜索相关
    searchText: '',
    searchResults: [],
    
    // 天气数据
    weatherData: null,
    currentCity: null,
    weatherInfo: null,
    currentTemp: 0,
    feelsLike: 0,
    humidity: 0,
    windSpeed: 0,
    forecast: [],
    
    // 状态
    loading: false,
    tempUnit: 'celsius',
    bgClass: 'cloudy',
    updateTime: ''
  },

  onLoad() {
    // 尝试从缓存读取上次的城市
    const lastCity = wx.getStorageSync('lastCity');
    if (lastCity) {
      this.loadWeatherData(lastCity);
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchText: e.detail.value });
  },

  // 执行搜索
  async onSearch() {
    const { searchText } = this.data;
    if (!searchText.trim()) {
      wx.showToast({ title: '请输入城市名', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '搜索中...' });
    
    try {
      const results = await weatherUtil.searchCity(searchText);
      this.setData({ searchResults: results });
      
      if (results.length === 0) {
        wx.showToast({ title: '未找到该城市', icon: 'none' });
      }
    } catch (error) {
      console.error('搜索失败:', error);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 选择城市
  onSelectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ 
      searchResults: [],
      searchText: ''
    });
    
    const cityData = {
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country
    };
    
    // 保存到缓存
    wx.setStorageSync('lastCity', cityData);
    
    this.loadWeatherData(cityData);
  },

  // 获取当前位置
  async onGetLocation() {
    wx.showLoading({ title: '定位中...' });
    
    try {
      const location = await weatherUtil.getCurrentLocation();
      const cityData = {
        name: '当前位置',
        latitude: location.latitude,
        longitude: location.longitude
      };
      
      this.loadWeatherData(cityData);
    } catch (error) {
      console.error('定位失败:', error);
      wx.showToast({ title: '定位失败，请检查权限', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载天气数据
  async loadWeatherData(city) {
    this.setData({ 
      loading: true,
      currentCity: city
    });

    try {
      const data = await weatherUtil.getWeatherByLocation(city.latitude, city.longitude);
      
      // 处理当前天气
      const current = data.current;
      const weatherInfo = weatherUtil.getWeatherInfo(current.weather_code);
      const tempUnit = this.data.tempUnit;
      
      // 处理7天预报
      const daily = data.daily;
      const forecast = [];
      for (let i = 0; i < daily.time.length; i++) {
        forecast.push({
          date: daily.time[i],
          dateStr: weatherUtil.formatDate(daily.time[i]),
          weatherCode: daily.weather_code[i],
          icon: weatherUtil.getWeatherInfo(daily.weather_code[i]).icon,
          maxTemp: weatherUtil.convertTemp(daily.temperature_2m_max[i], tempUnit),
          minTemp: weatherUtil.convertTemp(daily.temperature_2m_min[i], tempUnit),
          rainChance: daily.precipitation_probability_max[i] || 0
        });
      }

      this.setData({
        weatherData: data,
        weatherInfo: weatherInfo,
        currentTemp: weatherUtil.convertTemp(current.temperature_2m, tempUnit),
        feelsLike: weatherUtil.convertTemp(current.apparent_temperature, tempUnit),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        forecast: forecast,
        bgClass: weatherInfo.bg,
        updateTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        loading: false
      });

    } catch (error) {
      console.error('获取天气失败:', error);
      wx.showToast({ title: '获取天气失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 切换温度单位
  onToggleUnit(e) {
    const unit = e.currentTarget.dataset.unit;
    if (unit === this.data.tempUnit) return;
    
    this.setData({ tempUnit: unit });
    
    // 重新计算温度
    if (this.data.weatherData) {
      const data = this.data.weatherData;
      const current = data.current;
      const daily = data.daily;
      
      const forecast = this.data.forecast.map((item, i) => ({
        ...item,
        maxTemp: weatherUtil.convertTemp(daily.temperature_2m_max[i], unit),
        minTemp: weatherUtil.convertTemp(daily.temperature_2m_min[i], unit)
      }));

      this.setData({
        currentTemp: weatherUtil.convertTemp(current.temperature_2m, unit),
        feelsLike: weatherUtil.convertTemp(current.apparent_temperature, unit),
        forecast: forecast
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.currentCity) {
      this.loadWeatherData(this.data.currentCity).then(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  }
});

