var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data: {
    navH: app.globalData.navHeight,
    statusType: [
      { "name": "全部", "id": 0 }, 
      { "name": "待配送/待自提", "id": 1 }, 
      { "name": "待支付", "id": 3 }, 
      { "name": "待收货", "id": 4 }, 
      { "name": "待评价", "id": 6 }
    ],
    currentType: 0,
    tabClass: ["", "", "", "", ""],
    itemTotal: [],
  },
  statusTap: function (e) {
    var curType = e.currentTarget.dataset.id;
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
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.globalData.api_url + '/wx_order/cancel_order',
            data: {
              token: app.globalData.token,
              access_token: app.globalData.access_token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 'success') {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wxpay.wxpay(app, orderId, "", 're_pay');

  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载

  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderStatistics: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_order/statistics',
      data: { token: app.globalData.token, access_token: app.globalData.access_token },
      success: (res) => {
        //console.log(res);
        wx.hideLoading();
        if (res.data.code == 'success') {
          var tabClass = that.data.tabClass;

          if (res.data.data.all > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.no_pay > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.no_transfer > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.no_confirm > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.no_reputation > 0) {
            tabClass[4] = "red-dot"
          } else {
            tabClass[5] = ""
          }


          that.setData({
            tabClass: tabClass,
          });
        }
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
    this.getOrderStatistics();
    wx.request({
      url: app.globalData.api_url + '/wx_order/lists',
      data: postData,
      success: (res) => {
       
        wx.hideLoading();
        if (res.data.code == 'success') {
          //console.log(res.data);
          var list = res.data.orderList;
          var itemTotal = [];
          for (var i in list){
            itemTotal.push(1)
            for (var j in list[i]) {
              if (list[i][j].quantity>0){
                var sum = 0;
                sum += list[i][j].quantity;
                itemTotal[i] = sum;
              }
            }
          }

          that.setData({
            orderList: res.data.orderList,
            itemTotal: itemTotal
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
