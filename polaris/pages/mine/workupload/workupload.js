// pages/mine/workupload/workupload.js
Page({
  data: {
    isUploading: false,
    progress: 0,
    isUploaded: false,
    uploadResult: ''
  },

  onLoad: function (options) {
    // 初始化页面
  },

  chooseFile: function () {
    let that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: function (res) {
        const tempFilePaths = res.tempFiles;
        that.uploadFile(tempFilePaths[0]);
      },
      fail: function (err) {
        console.log('chooseMessageFile fail', err);
      }
    })
  },

  uploadFile: function (file) {
    const that = this;
    that.setData({
      isUploading: true,
      progress: 0
    });

    wx.cloud.uploadFile({
      cloudPath: file.name,// 上传到云存储的路径
      filePath: file.path,// 临时文件路径
      onProgressUpdate: function (res) {
        console.log('上传进度', res.progress);
        that.setData({ progress: res.progress });
      },
      success: async function (res) {
        console.log('上传成功', res.fileID);
        that.setData({
          isUploading: false,
          isUploaded: true,
          uploadResult: '文件上传成功'
        });
      },
      fail: function (err) {
        console.log('上传失败', err);
        that.setData({
          isUploading: false,
          isUploaded: true,
          uploadResult: '上传失败，请重试'
        });
      }
    })
  }
});