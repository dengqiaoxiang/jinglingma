var app = getApp();
Page({
  data: {
    navH: app.globalData.navHeight,
    orderId: 0,
    goodsList: [],
    yunPrice: "0.00"
  },
  onLoad: function (e) {
    var orderId = e.orderid;
    this.data.orderId = orderId;
    this.setData({
      orderId: orderId
    });
  },
  onShow: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_order/detail',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token,
        id: that.data.orderId
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code != 'success') {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }
        console.log(res.data)
        that.setData({
          orderDetail: res.data.data
        });
      }
    })
    var yunPrice = parseFloat(this.data.yunPrice);
    var allprice = 0;
    var goodsList = this.data.goodsList;
    for (var i = 0; i < goodsList.length; i++) {
      allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
    }
    this.setData({
      allGoodsPrice: allprice,
      yunPrice: yunPrice
    });
  },
  wuliuDetailsTap: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/wuliu/index?id=" + orderId
    })
  },
  confirmBtnTap: function (e) {
    let that = this;
    let orderId = this.data.orderId;
    let formId = e.detail.formId;
    wx.showModal({
      title: '确认您已收到商品？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.globalData.api_url + '/wx_order/confirm',
            data: {
              token: app.globalData.token,
              access_token: app.globalData.access_token,
              orderId: orderId
            },
            success: (res) => {

              if (res.data.code == 'success') {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  submitReputation: function (e) {
    let that = this;
    let formId = e.detail.formId;

    let reputations = [];
    let i = 0;

    while (e.detail.value["orderGoodsId" + i]) {
      let orderGoodsId = e.detail.value["orderGoodsId" + i];
      let goodReputation = e.detail.value["goodReputation" + i];
      let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

      let reputations_json = {};
      reputations_json.id = orderGoodsId;
      reputations_json.reputation = goodReputation;
      reputations_json.remark = goodReputationRemark;

      reputations.push(reputations_json);
      i++;
    }

    wx.showLoading();
    wx.request({
      url: app.globalData.api_url + '/wx_order/comment',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token,
        orderId: this.data.orderId,
        reputations: reputations
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 'success') {
          that.onShow();

        }
      }
    })
  }
})