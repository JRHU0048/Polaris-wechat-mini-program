// pages/topic/topiclist/QAcommunity/QAcommunity.js
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    questions: [], // 存储问题列表
    page: 1, // 当前页码
    hasMore: true, // 是否还有更多数据
    loading: true, // 加载状态
    modalVisible: false,
    modalTitle: '',
    modalContent: '',
    replyVisible: false,
    replyContent: '',
    selectedQuestionId: null,
    openid: '', // 用户的OpenID
    username: '用户名称' // 用户的昵称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.fetchQuestions();
    this.getUserInfo();
  },

  /**
   * 获取问题列表
   */
  fetchQuestions: async function() {
    if (!this.data.hasMore) return;

    this.setData({
      loading: true
    });

    try {
      const questions = await db.collection('questions')
        .skip((this.data.page - 1) * 10) // 每页显示10条记录
        .limit(10)
        .orderBy('_createTime', 'desc')
        .get();

      if (questions.data.length === 0) {
        this.setData({
          hasMore: false,
          loading: false
        });
      } else {
        const updatedQuestions = this.data.questions.concat(questions.data);
        // console.log(updatedQuestions);
        this.setData({
          questions: updatedQuestions,
          page: this.data.page + 1,
          loading: false
        });
      }
    } catch (error) {
      console.error('获取问题列表失败：', error);
      this.setData({
        loading: false
      });
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    wx.login({
      success: res => {
        if (res.code) {
          wx.cloud.callFunction({
            name: 'login',
            data: { code: res.code },
            success: res => {
              const openid = res.result.openid;
              this.setData({ openid: openid });
              this.getUserProfile();
            },
            fail: err => {
              console.error('登录失败', err);
            }
          });
        } else {
          console.error('登录失败', res.errMsg);
        }
      }
    });
  },

  /**
   * 获取用户资料
   */
  getUserProfile: function() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: res => {
        const userInfo = res.userInfo;
        this.setData({ username: userInfo.nickName });
      },
      fail: err => {
        console.error('获取用户信息失败', err);
      }
    });
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
   * 输入问题标题
   */
  onTitleChange: function(e) {
    this.setData({ modalTitle: e.detail.value });
  },

  /**
   * 输入问题内容
   */
  onContentChange: function(e) {
    this.setData({ modalContent: e.detail.value });
  },

  /**
   * 提交问题
   */
  submitQuestion: function() {
    if (!this.data.modalTitle || !this.data.modalContent) {
      wx.showToast({
        title: '请输入完整信息！',
        icon: 'none'
      });
      return;
    }
    const questionData = {
      author: this.data.username, // 使用用户的昵称
      authorId: this.data.openid, // 使用用户的OpenID
      title: this.data.modalTitle,
      content: this.data.modalContent,
      _createTime: new Date().getTime()
    };
    wx.cloud.callFunction({
      name: 'addQuestion',
      data: { question: questionData },
      success: res => {
        this.setData({ modalVisible: false, modalTitle: '', modalContent: '' });
        this.fetchQuestions(); // 刷新问题列表
        wx.showToast({
          title: '问题发布成功！',
          duration: 2000
        });
      },
      fail: err => {
        console.error('Failed to add question:', err);
      }
    });
  },

  /**
  * 提交回复
  */
  saveReplyToDatabase: function(questionId, replyContent) {
    const replyData = {
      questionId: questionId,
      content: replyContent,
      author: this.data.username, // 使用用户的昵称
      authorId: this.data.openid, // 使用用户的OpenID
      createTime: new Date().getTime()
    };

    wx.cloud.callFunction({
      name: 'saveReply',
      data: replyData,
      success: res => {
        wx.showToast({
          title: '回复成功！',
          duration: 2000
        });
        this.setData({replyVisible: false,replyContent: ''});
      },
      fail: err => {
        console.error('回复失败', err);
        wx.showToast({
          title: '回复失败，请稍后再试！',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 回复问题
   */
  replyToQuestion: function(e) {
    const questionId = e.currentTarget.dataset._id;
    // console.log('选择的问题ID:', questionId);
    this.setData({
      replyVisible: true,
      selectedQuestionId: questionId
    });
  },

  /**
   * 隐藏回复模态框
   */
  hideReplyModal: function() {
    this.setData({
      replyVisible: false,
      selectedQuestionId: null
    });
  },

  /**
   * 输入回复内容
   */
  onReplyChange: function(e) {
    this.setData({
      replyContent: e.detail.value
    });
  },

  /**
   * 提交回复
   */
  submitReply: function() {
    if (!this.data.replyContent) {
      wx.showToast({
        title: '请输入回复内容！',
        icon: 'none'
      });
      return;
    }

    const questionId = this.data.selectedQuestionId;
    const replyContent = this.data.replyContent;

    this.saveReplyToDatabase(questionId, replyContent);
    this.hideReplyModal();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      questions: [],
      page: 1,
      hasMore: true
    });
    this.fetchQuestions();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.fetchQuestions();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '加入我们的答疑社区',
      path: '/pages/topic/topiclist/QAcommunity/QAcommunity',
    };
  }
});