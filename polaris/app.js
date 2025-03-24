// 小程序的入口文件
// 初始化小程序并设置一些全局配置和方法
const config = require('/utils/config.js')// 引入配置信息模块
const util = require('/utils/util.js') // 引入实用函数模块
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';// 默认头像的URL

App({ // 创建一个微信小程序的实例
  towxml: require('/towxml/index'),//引入 towxml 模块,用来展示html内容

  globalData: {    // 定义全局数据
    openid: "",  // 用户的唯一标识
    lastLoginDate: "" , // 最后登录时间
    isLoggedIn: false,  //判断是否登录
    nickName:"匿名用户",  //昵称
    studentId:'', // 学号
    password:'', //密码
    avatarUrl: defaultAvatarUrl,  //头像
  },

  // 同步获取openId
  getOpenId: null,
  onLaunch: function () {
    // 获取系统信息，设置状态栏高度和自定义导航栏高度
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;//状态栏高度
        let capsule = wx.getMenuButtonBoundingClientRect();//胶囊按钮的位置信息
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;//默认自定义导航栏高度
        }
      }
    })
    // 检查是否支持云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({//初始化云开发环境，传入配置中的环境变量config.env并设置追踪用户
        traceUser: true,
        env: config.env
      })
      // 定义一个异步方法来获取用户的openId等信息
      this.getOpenId = (function (that) {
        return new Promise((resolve, reject) => {
          // 通过调用云函数miniBlog，传入参数type: 'initInfo'来获取用户信息，包括openId、userId、avatarUrl、nickName和admin状态。将获取到的信息存储在globalData中，并通过 Promise 进行同步处理
          wx.cloud.callFunction({
            name: 'miniBlog',
            data: {
              type: 'initInfo'
            },
            success: res => {
              // 将获取到的用户信息存储到 globalData 中
              that.globalData.openid = res.result.openId//_id
              that.globalData.userId = res.result.userId//_opneid
              that.globalData.avatarUrl = res.result.avatarUrl
              that.globalData.nickName = res.result.nickName
              that.globalData.admin = res.result.admin //检查用户是否为管理员，是一个尝试性的功能
              that.globalData.studentId = res.result.studentId
              if(res.result.nickName != '匿名用户')//如果用户不是匿名用户，可以不用登录
              {
                that.globalData.isLoggedIn = true
              }
              // console.log('[云函数] [login] 调用成功:', res.result.openId, res.result.userId, res.result.avatarUrl, res.result.nickName, that.globalData.admin)
              resolve({ //将异步操作的结果传递给调用者:用户的 openId、avatarUrl 和 nickName
                openId: res.result.openId,
                avatarUrl: res.result.avatarUrl,
                nickName: res.result.nickName
              })
            },
            fail: err => {
              console.error('[云函数] [login] 调用失败', err)
            }
          })
        })
      })(this)
    }
    this.updateManager();//主动更新的方法
  },

  /**
   * 初始化最后登录时间
   */
  // 初始化最后登录时间。从本地存储中获取上次登录时间，如果没有或者当前时间与上次登录时间不同，则在底部标签栏的特定位置显示红点。将当前时间作为最后登录时间存储在globalData和本地存储中。
  bindLastLoginDate: function () {
    var lastLoginDate = wx.getStorageSync('lastLoginDate');
    if (!lastLoginDate || util.formatTime(new Date()) != lastLoginDate) {
      wx.showTabBarRedDot({
        index: 1,
      })
    }
    this.globalData.lastLoginDate = util.formatTime(new Date())
    wx.setStorageSync('lastLoginDate', this.globalData.lastLoginDate);
  },

  /**
   * 小程序主动更新
   */
  updateManager() {
    if (!wx.canIUse('getUpdateManager')) {
      return false;//当前环境不支持更新
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {});
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '有新版本',
        content: '新版本已经准备好，即将重启',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    });
  },
})