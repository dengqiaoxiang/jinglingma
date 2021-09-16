
var app = getApp()
Page({
  data: {
    navH: app.globalData.navHeight,
    statusType: [{ "name": "我开的团", "id": 1 }, { "name": "我参的团", "id": 2 }],
    currentType: 1,
    tabClass: ["", ""]
  },
  statusTap: function (e) {
    var curType = e.currentTarget.dataset.index;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/orderDel/index?id=" + orderId
    })
  },
  pintuanInfo: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/joinGroup/index?order_id=" + orderId
    })
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },

  refund: function (e) {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      token: app.globalData.token,
      access_token: app.globalData.access_token
    };

    postData.id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.api_url + '/wx_pintuan/refund',
      data: postData,
      success: (res) => {
        wx.hideLoading();

        wx.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false
        });

      }
    })

  },
  onShow: function () {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      token: app.globalData.token,
      access_token: app.globalData.access_token
    };

    postData.status = that.data.currentType;

    wx.request({
      url: app.globalData.api_url + '/wx_pintuan/order_list',
      data: postData,
      success: (res) => {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == 'success') {
          that.setData({
            orderList: res.data.orderList,
            goodsMap: res.data.goodsMap
          });
        } else {
          this.setData({
            orderList: null,
          });
        }
      }
    })

  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  }
})
