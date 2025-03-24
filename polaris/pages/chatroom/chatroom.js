// pages/chatroom/chatroom.js
import { getInvitationsList } from '../../utils/api';
const api = require('../../utils/api.js'); //引入自定义的 API 模块，用于与后端进行数据交互
const app = getApp(); //获取小程序的全局应用实例,用于访问全局数据或方法
const db = wx.cloud.database();

Page({ // 定义一个页面，包含页面的初始数据、生命周期函数和各种自定义方法
  data: {
    invitations: [], // 存储帖子列表
    page: 1,  //当前页码
    filter: "", //搜索过滤条件
    nodata: false, // 是否没有数据
    nomore: false,// 是否没有更多数据
    loading: false, // 加载状态
    cancel: false, //是否是取消状态
    orderBy:"createTime", // 排序字段
    defaultSearchValue: "", // 将输入框的值绑定到 defaultSearchValue 属性
    modalVisible: false,
    modalTitle: '',
    modalContent: '',
  },

  // 查询组队信息数据
  getInvitationsList: async function (orderBy) {
    let that = this;
    that.setData({
      loading: true
    });
  
    let page = that.data.page;
    if (that.data.nomore) {
      that.setData({
        loading: false
      });
      return;
    }
    let filter = that.data.filter; // 使用页面的数据属性
    let result = await api.getInvitationsList(page, filter, 1, orderBy);

    if (result.data.length === 0) {
      that.setData({
        nomore: true,
        loading: false
      });
  
      if (page === 1) {
        that.setData({
          nodata: true,
          loading: false
        });
      }
    } else {
      that.setData({
        page: page + 1,
        invitations: that.data.invitations.concat(result.data),
        loading: false
      });
    }
  },

  /**
   * 显示发布问题模态框
   */
  showModal: function() {
    this.setData({ modalVisible: true });
  },

  /**
   * 隐藏发布问题模态框
   */
  hideModal: function() {
    this.setData({ modalVisible: false, modalTitle: '', modalContent: '' });
  },

    /**
   * 输入贴则的标题
   */
  onTitleChange: function(e) {
    this.setData({ modalTitle: e.detail.value });
  },

  /**
   * 输入帖子的内容
   */
  onContentChange: function(e) {
    this.setData({ modalContent: e.detail.value });
  },

   /**
   * 提交组队帖子
   */
  submitQuestion: async function() {
    if (!this.data.modalTitle || !this.data.modalContent) {
      wx.showToast({
        title: '请输入完整信息！',
        icon: 'none'
      });
      return;
    }
    const questionData = {
      author: app.globalData.nickName,
      // authorId: this.data.openid, // 使用用户的OpenID
      title: this.data.modalTitle,
      description: this.data.modalContent,
      createTime: new Date().getTime(),
      isShow:1,
    };

    try{
      // 插入问题到数据库
      await db.collection('invitation').add({
        data: questionData
      });
      this.setData({ modalVisible: false, modalTitle: '', modalContent: '' });
      this.getInvitationsList('', '_createTime'); // 刷新帖子列表
      wx.showToast({
        title: '帖子发布成功！',
        duration: 2000
      });
    }catch (error) {
      console.error('Failed to add post:', error);
      wx.showToast({
        title: '帖子发布失败，请稍后再试！',
        icon: 'none'
      });
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this;
    wx.setBackgroundTextStyle({
      textStyle: 'dark'
    })

    // 获取内容
    await that.getInvitationsList('', '_createTime')//只按时间排序
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    let that = this;
    that.setData({
      page: 1,
      invitations: [],
      filter: "",
      nomore: false,
      nodata: false,
      cancel: false,
      defaultSearchValue: "",
    })
    await this.getInvitationsList('', '_createTime')
    wx.stopPullDownRefresh();
  },

    /**
   * 搜索功能
   * @param {} e 
   */
  bindconfirm: async function (e) {
    let that = this;
    let page = 1
    that.setData({
      page: page,
      invitations: [],
      filter: e.detail.value,
      nomore: false,
      nodata: false,
      cancel: true
    })
    await this.getInvitationsList(e.detail.value, '_createTime')
  },



  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})