const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    studentId: '',
    nickName: '',
    avatarUrl: '',
    password: '', // 密码字段
    isLoggedIn: false,
  },

  bindStudentIdInput: function (e) {
    app.globalData.studentId = e.detail.value
  },

  bindNameInput: function (e) {
    app.globalData.nickName = e.detail.value
  },

  bindPasswordInput: function (e) {
    app.globalData.password = e.detail.value; // 绑定密码输入
  },

  chooseImage: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        app.globalData.avatarUrl = tempFilePaths[0] //全局赋值
        that.setData({ //当前页面赋值
          avatarUrl: tempFilePaths[0]
        });
      }
    });
  },

  submit: async function () {
    if(!app.globalData.avatarUrl || !app.globalData.nickName || !app.globalData.studentId|| !app.globalData.password){
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'crypto',
        data: {
          studentId: app.globalData.studentId,
          nickName: app.globalData.nickName,
          avatarUrl: app.globalData.avatarUrl,
          password: app.globalData.password,
        }
      });

      if (result.result.success) {
        // 将当前页面的数据赋值给全局变量
        app.globalData.isLoggedIn = true;

        wx.showToast({
          title: result.result.message,
          icon: 'success'
        });
       // 返回上一页
        wx.navigateBack();
        } else {
          wx.showToast({
            title: result.result.message,
            icon: 'none'
          });
        }
      } catch (error) {
        console.error(error); // 添加这一行来查看错误详情
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
      });
    }
  }
});

