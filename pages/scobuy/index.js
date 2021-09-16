//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    pageNum: 1,
    pageSize: 30,
    hasMoreData: true,
    contentlist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getContentInfo: function (message) {
    wx.showLoading({
      title: message,
    })
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_banner/lists',
      method: "POST",
      data: {
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        var contentlistTem = that.data.contentlist;
        console.log(res);
        if (res.data.status == 200) {
          if (that.data.pageNum == 1) {
            contentlistTem = []
          }
          var contentlist = res.data.data.pageData;
          if (that.data.pageNum >= res.data.data.pageInfo.pageCount) {
            that.setData({
              contentlist: contentlistTem.concat(contentlist),
              hasMoreData: false
            })
          } else {
            that.setData({
              contentlist: contentlistTem.concat(contentlist),
              hasMoreData: true,
              pageNum: that.data.pageNum + 1
            })
          }

        } else {
          wx.showToast({
            title: res.data.msg,
            success: function () {
              wx.redirectTo({
                url: '../login/login',
              })
            }
          })
        }


      },
      fail: function () {
        wx.showToast({
          title: '加载数据失败',
          icon: none
        })
      },
      complete: function () {
        wx.hideLoading();
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    })
  },
  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    console.log('下拉');
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.data.pageNum = 1
    this.getContentInfo('正在刷新数据')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getContentInfo('加载更多数据')
    } else {
      wx.showToast({
        title: '没有更多数据',
      })
    }
  },
  suo: function (e) {
    wx.navigateTo({
      url: '../search/search',
    })
  },
})