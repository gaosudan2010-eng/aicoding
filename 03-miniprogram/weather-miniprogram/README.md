# 🌤️ 天气查询小程序

一个简洁美观的微信小程序，用于查询城市天气和7天预报。

## ✨ 功能特点

- 🔍 **城市搜索** - 支持中英文城市名搜索
- 📍 **自动定位** - 获取当前位置天气
- 🌡️ **实时天气** - 显示温度、体感温度、湿度、风速
- 📅 **7天预报** - 查看未来一周天气趋势
- 🎨 **动态背景** - 根据天气状况变换背景色
- 🔄 **温度单位** - 支持摄氏度/华氏度切换
- 💾 **记住城市** - 自动保存上次查询的城市

## 📁 项目结构

```
weather-miniprogram/
├── app.js              # 小程序入口
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置
├── sitemap.json        # 站点地图
├── utils/
│   └── weather.js      # 天气API工具函数
└── pages/
    ├── index/          # 首页（天气展示）
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    └── forecast/       # 预报详情页
        ├── forecast.js
        ├── forecast.json
        ├── forecast.wxml
        └── forecast.wxss
```

## 🚀 如何运行

### 1. 下载微信开发者工具

访问 [微信开发者工具下载页面](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，下载并安装。

### 2. 导入项目

1. 打开微信开发者工具
2. 点击「+」创建项目
3. 选择「导入项目」
4. 项目目录选择 `weather-miniprogram` 文件夹
5. AppID 选择「测试号」（或填入你自己的 AppID）
6. 点击「确定」

### 3. 运行预览

- 在开发者工具中可以直接预览
- 点击「预览」可以在手机微信中扫码预览

## 🔧 技术要点

### 小程序 vs 网页对比

| 网页 | 小程序 |
|------|--------|
| HTML | WXML |
| CSS | WXSS |
| fetch API | wx.request |
| localStorage | wx.setStorageSync |
| navigator.geolocation | wx.getLocation |

### API 接口

使用 [Open-Meteo](https://open-meteo.com/) 免费天气 API：

- **地理编码**: `https://geocoding-api.open-meteo.com/v1/search`
- **天气数据**: `https://api.open-meteo.com/v1/forecast`

### 核心代码说明

**wx.request - 网络请求**
```javascript
wx.request({
  url: 'https://api.example.com/data',
  data: { key: 'value' },
  success(res) {
    console.log(res.data);
  },
  fail(err) {
    console.error(err);
  }
});
```

**wx.getLocation - 获取位置**
```javascript
wx.getLocation({
  type: 'gcj02',
  success(res) {
    console.log(res.latitude, res.longitude);
  }
});
```

**wx.setStorageSync - 本地存储**
```javascript
// 存储
wx.setStorageSync('key', value);

// 读取
const value = wx.getStorageSync('key');
```

## 📝 学习笔记

### 小程序生命周期

- `onLoad` - 页面加载时触发
- `onShow` - 页面显示时触发
- `onReady` - 页面初次渲染完成
- `onHide` - 页面隐藏时触发
- `onUnload` - 页面卸载时触发

### 数据绑定

```html
<!-- WXML -->
<view>{{message}}</view>
<view wx:for="{{list}}" wx:key="id">{{item.name}}</view>
```

```javascript
// JS
Page({
  data: {
    message: 'Hello',
    list: [{ id: 1, name: 'Item 1' }]
  }
});
```

### 事件处理

```html
<button bindtap="handleClick" data-id="123">点击</button>
```

```javascript
Page({
  handleClick(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Clicked:', id);
  }
});
```

## 🎯 后续可扩展

- [ ] 添加更多天气详情（紫外线、空气质量等）
- [ ] 收藏城市功能
- [ ] 天气预警通知
- [ ] 分享天气卡片
- [ ] 小时级预报

---

Made with ❤️ for learning WeChat Mini Program

