const app = getApp();

Page({
  data: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    studentId: '',
  },

  onLoad: function(options) {
    this.setData({
      studentId: app.globalData.studentId
    });
    // console.log('Loaded studentId:', this.data.studentId); // 到这里没问题了
  },

  onCurrentPasswordChange: function(e) {
    this.setData({
      currentPassword: e.detail.value
    });
  },

  onNewPasswordChange: function(e) {
    this.setData({
      newPassword: e.detail.value
    });
  },

  onConfirmPasswordChange: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  submitPasswordChange: async function() {
    const { currentPassword, newPassword, confirmPassword, studentId } = this.data;

    if (newPassword !== confirmPassword) {
      wx.showModal({
        title: '提示',
        content: '新密码和确认密码不一致',
        showCancel: false,
        confirmText: '确定'
      });
      return;
    }
    // console.log('Submitting password change:', { currentPassword, newPassword, studentId }); // 调试信息

    // 调用云函数修改密码
    try {
      const result = await wx.cloud.callFunction({
        name: 'changePassword',
        data: {
          currentPassword,
          newPassword,
          studentId
        }
      });
      // console.log('Cloud function result:', result); // 调试信息

      if (result.result.success) {
        wx.showToast({
          title: '密码修改成功',
          duration: 2000
        });
        wx.navigateBack();
      } else {
        wx.showModal({
          title: '提示',
          content: result.result.message,
          showCancel: false,
          confirmText: '确定'
        });
      }
    } catch (error) {
      // console.error('Error calling cloud function:', error); // 调试信息
      wx.showModal({
        title: '提示',
        content: '密码修改失败，请稍后再试',
        showCancel: false,
        confirmText: '确定'
      });
    }
  }
});