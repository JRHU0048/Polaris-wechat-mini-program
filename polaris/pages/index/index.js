const api = require('../../utils/api.js'); //引入自定义的 API 模块，用于与后端进行数据交互
const app = getApp(); //获取小程序的全局应用实例,用于访问全局数据或方法

Page({ // 定义一个页面，包含页面的初始数据、生命周期函数和各种自定义方法
  data: {
    posts: [],//文章列表
    page: 1, //当前页码
    filter: "",//搜索过滤条件
    nodata: false,
    nomore: false,
    defaultSearchValue: "",  //默认搜索值
    navItems: [{  //导航栏选项
      name: '最 新',
      index: 1
    }, {
      name: '热 门',
      index: 2
    }, {
      name: '分 类',
      index: 3
    }],
    swiperList: [],//轮播图数据
    tabCur: 1,
    scrollLeft: 0,
    showHot: false,
    showLabels: false,
    hotItems: ["浏览最多", "评论最多", "点赞最多", "收藏最多"],
    hotCur: 0,
    labelList: [],
    labelCur: "全部",
    whereItem: ['', '_createTime', ''], //下拉查询条件
    loading: true,
    cancel: false,
    iconList: [
  ],
    finishLoadFlag: false,
    errorFlag: false,
    imgPath: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) { //页面加载时执行的函数
    let that = this
    wx.setBackgroundTextStyle({
      textStyle: 'dark'
    })
    // 获取顶部SwiperList
    await this.getSwiperList()//调用getSwiperList获取顶部轮播图数据
    // 获取文章内容
    await that.getPostsList('', '_createTime')
  },

  //imgPath 为远程图片地址
  //changeFlag 函数是切换远程图片地址要更改当前图片加载状态
  changeFlag(e) {
    let finishLoadFlag = e.detail.finishLoadFlag;
    let errorFlag = e.detail.errorFlag;
    this.setData({
      finishLoadFlag,
      errorFlag
    })
  },


  /**
   * 跳转至专题详情
   * @param {} e 
   */
  openTopicGithub: async function (e) {
    wx.navigateTo({
      url: '../topic/topiclist/topiclist?classify=交流平台'
    })
  },

  /**
   * 跳转至专题详情
   * @param {} e 
   */
  openTopicInterview: async function (e) {
    wx.navigateTo({
      url: '../topic/topiclist/topiclist?classify=技能学习'
    })
  },
  /**
   * 跳转至专题详情
   * @param {} e 
   */
  openTopicMini: async function (e) {
    wx.navigateTo({
      url: '../topic/topiclist/topiclist?classify=作品上传'
    })
  },
    /**
   * 跳转至专题详情
   * @param {} e 
   */
  openTopicGrame: async function (e) {
    wx.navigateTo({
      url: '../topic/topiclist/topiclist?classify=报销管理'
    })
  },

  /**
   * 获取SwiperList
   * @param {*} e 
   */
  getSwiperList: async function () {
    let that = this
    let swiperList = await api.getSwiperList(app.globalData.openid)
    that.setData({
      swiperList: swiperList.data
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {//用户下拉刷新时执行的函数。重置页面各种状态，然后重新调用getPostsList获取数据，并停止下拉刷新动作
    let that = this;
    that.setData({
      page: 1,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      defaultSearchValue: "",
      tabCur: 1,
      showLabels: false,
      showHot: false,
      cancel: false,
      labelCur: "全部",
      hotCur: 0
    })
    await this.getPostsList('', '_createTime')
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {//页面上拉触底时执行的函数。调用getPostsList进行加载更多数据操作
    let whereItem = this.data.whereItem
    // let filter = this.data.filter
    await this.getPostsList(whereItem[0], whereItem[1], whereItem[2])
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '有内容的小程序',
      imageUrl: 'https://6669-final-6gypsolb231307a9-1304273986.tcb.qcloud.la/others/share.jpg',
      path: '/pages/index/index'
    }
  },

  /**
   * 点击文章明细
   */
  bindPostDetail: function (e) {
    let blogId = e.currentTarget.id;
    let dbName = e.currentTarget.dataset.db;
    wx.navigateTo({
      url: '../detail/detail?id=' + blogId + '&dbName=' + dbName
    })
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
      posts: [],
      filter: e.detail.value,
      nomore: false,
      nodata: false,
      whereItem: [e.detail.value, '_createTime', ''],
      cancel: true
    })
    await this.getPostsList(e.detail.value, '_createTime')
  },

  /**
   * tab切换
   * @param {} e 
   */
  tabSelect: async function (e) {
    let that = this;
    let tabCur = e.currentTarget.dataset.id
    switch (tabCur) {
      case 1: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          nomore: false,
          nodata: false,
          showHot: false,
          showLabels: false,
          defaultSearchValue: "",
          posts: [],
          page: 1,
          whereItem: ['', '_createTime', ''],
          cancel: false
        })

        await that.getPostsList("", '_createTime')
        break
      }
      case 2: {
        that.setData({
          posts: [],
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: true,
          showLabels: false,
          defaultSearchValue: "",
          page: 1,
          nomore: false,
          nodata: false,
          whereItem: ['', 'totalVisits', ''],
          cancel: false
        })
        await that.getPostsList("", "totalVisits")
        break
      }
      case 3: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          showHot: false,
          showLabels: true,
          nomore: false,
          nodata: false,
          posts: [],
          page: 1,
          cancel: false
        })

        await that.getPostsList("", '_createTime')
        let labelList = await api.getLabelList(app.globalData.openid, 0)
        that.setData({
          labelList: labelList.result.data
        })
        break
      }
    }
  },

  /**
   * 热门按钮切换
   * @param {*} e 
   */
  hotSelect: async function (e) {
    let that = this
    let hotCur = e.currentTarget.dataset.id
    let orderBy = "_createTime"
    switch (hotCur) {
      //浏览最多
      case 0: {
        orderBy = "totalVisits"
        break
      }
      //评论最多
      case 1: {
        orderBy = "totalComments"
        break
      }
      //点赞最多
      case 2: {
        orderBy = "totalZans"
        break
      }
      //收藏最多
      case 3: {
        orderBy = "totalCollection"
        break
      }
    }
    that.setData({
      posts: [],
      hotCur: hotCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem: ['', orderBy, '']
    })
    await that.getPostsList("", orderBy)
  },

  /**
   * 标签按钮切换
   * @param {*} e 
   */
  labelSelect: async function (e) {
    let that = this
    let labelCur = e.currentTarget.dataset.id
    that.setData({
      posts: [],
      labelCur: labelCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem: ['', '_createTime', labelCur == "全部" ? "" : labelCur]
    })

    await that.getPostsList("", "_createTime", labelCur == "全部" ? "" : labelCur)
  },

  /**
   * 获取文章列表
   */
  getPostsList: async function (filter, orderBy, label) {
    let that = this
    that.setData({//设置 loading 为 true，表明正在加载数据
      loading: true
    })

    let page = that.data.page
    if (that.data.nomore) {//nomore 为 true，表明没有更多数据，设置 loading 为 false 并返回
      that.setData({
        loading: false
      })
      return
    }

    let result = await api.getPostsList(page, filter, 1, orderBy, label,'竞赛通知')//api.getPostsList 获取数据
    //如果结果为空，则设置 nomore 为 true 并关闭加载状态
    if (result.data.length === 0) { 
      that.setData({
        nomore: true,
        loading: false
      })
      //如果是第一页且无数据，则设置 nodata 为 true
      if (page === 1) {
        that.setData({
          nodata: true,
          loading: false
        })
      }
    } else {//更新页码，合并新数据到 posts 数组，并关闭加载状态
      that.setData({
        page: page + 1,
        posts: that.data.posts.concat(result.data),
        loading: false
      })
    }
  }

})