/**
 * 🍅 番茄钟小程序
 * 入口文件
 */

App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getWindowInfo();
    this.globalData.systemInfo = systemInfo;
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20;
    
    // 检查更新
    this.checkUpdate();
  },

  onShow() {
    // 小程序显示时
  },

  onHide() {
    // 小程序隐藏时
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.log('新版本下载失败');
      });
    }
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 20
  }
});
