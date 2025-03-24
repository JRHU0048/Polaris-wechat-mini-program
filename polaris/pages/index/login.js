// login.js
Page({
  data: {
    remind: '加载中',
    help_status: false,
    reset_status: false,
    idcard_focus: false,
    idcard: '',
    angle: 0,
    percent: 0,
    costSeconds: 0,
    // 存储微信用户信息
    wxUserInfo: null
  },
  onLoad: function () {
  },
  onReady: function () {
    try {
      const wxUserInfo = wx.getStorageSync('wxUserInfo') || {};
      if (wxUserInfo.nickName && wxUserInfo.avatarUrl) {
        this.setData({ wxUserInfo });
        wx.switchTab({ url: './home' });
        // 切换到 tabBar 页面中的 “home” 页面
      }
    } catch (error) {
    }

    var _this = this;
    setTimeout(function () {
      _this.setData({ remind: '' });
    }, 100);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (_this.data.angle!== angle) {
        _this.setData({ angle: angle });
      }
    });
  },
  // 微信登录方法
  getUserInfoFromWX: function () {
    wx.login({
      success: function (loginRes) {
        if (loginRes.code) {
          // 这里无需使用 code，直接获取用户信息
          wx.getUserInfo({
            success: function (userRes) {
              const userInfo = userRes.userInfo;
              // 存储用户信息到本地存储和页面数据中
              wx.setStorage({ data: userInfo, key: 'wxUserInfo' });
              this.setData({ wxUserInfo: userInfo });
              wx.switchTab({ url: './index' });
            },
            fail: function (error) {
              console.log('获取用户信息失败：', error);
            }
          });
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },
  idcardInput: function (e) {
    this.setData({
      idcard: e.detail.value
    });
  },
  inputFocus: function (e) {
    if (e.target.id === 'idcard') {
      this.setData({
        'idcard_focus': true
      });
    }
  },
  inputBlur: function (e) {
    if (e.target.id === 'idcard') {
      this.setData({
        'idcard_focus': false
      });
    }
  },
  tapHelp: function (e) {
    if (e.target.id === 'help') {
      this.hideHelp();
    }
  },
  showHelp: function (e) {
    this.setData({
      'help_status': true
    });
  },
  hideHelp: function (e) {
    this.setData({
      'help_status': false
    });
  },
});