//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    navH: app.globalData.navHeight,
    botH: null,
    goodsList: [],
    shipping: 0, // 是否需要物流信息
    allGoodsPrice: 0,//商品价格
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
  },
  onShow: function () {
    var that = this;
    var shopList = [];

    var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
    if (buyNowInfoMem && buyNowInfoMem.shopList) {
      shopList = buyNowInfoMem.shopList;
    }

    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  onLoad: function (e) {
    var that = this;
    //显示收货地址标识

    var query = wx.createSelectorQuery();
    query.select('.toBuy').boundingClientRect(function (rect) {
      that.setData({
        botH: rect.height + 'px'
      });
    }).exec();
    if (e.orderType) {
      var orderType = e.orderType;
    } else {
      var orderType = "";
    }

    that.setData({
      orderType: orderType
    });
  },

  createOrder: function (e) {
    wx.showLoading();
    var that = this;
    var loginToken = app.globalData.token // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      token: loginToken,
      access_token: app.globalData.access_token,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.shipping > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.provinceId = that.data.curAddressData.provinceId;
      postData.cityId = that.data.curAddressData.cityId;
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId;
      }
      postData.address = that.data.curAddressData.address;
      postData.name = that.data.curAddressData.name;
      postData.telephone = that.data.curAddressData.telephone;

    }
    wx.request({
      url: app.globalData.api_url + '/wx_points/create',
      method: 'POST',

      data: postData, // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
        if (res.data.code != 'success') {
          wx.showLoading({
            title: res.data.msg,
          })
          return;
        }

        if (e && "buyNow" != that.data.orderType) {
          // 清空购物车数据
          wx.removeStorageSync('shopCarInfo');
        }

        // 下单成功，跳转到订单管理界面
        wx.redirectTo({
          url: "/pages/order/index"
        });
      }
    })
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_user/default_address',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: (res) => {
        if (res.data.code == 'success') {
          that.setData({
            curAddressData: res.data.data
          });
        } else {
          wx.showLoading({
            title: '请先登录',
          })

          wx.navigateTo({
            url: "/pages/login/index"
          })
          setTimeout(function () {
            wx.hideLoading()
          }, 1000)
        }
        that.processFee();
      }
    })
  },
  processFee: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var shipping = 0;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {

      let carShopBean = goodsList[i];

      if (carShopBean.shipping) {
        shipping = 1;
      }

      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';

      if (i > 0) {
        goodsJsonStrTmp = ",";
      }

      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"sid":"' + carShopBean.sid + '","type":' + carShopBean.type + '}';
      goodsJsonStr += goodsJsonStrTmp;

    }

    goodsJsonStr += "]";

    // 需要物流配送的
    if (shipping) {

      if (!that.data.curAddressData) {
        wx.showModal({
          title: '提示错误',
          content: '请添加收货地址',
          showCancel: false
        })
        that.setData({
          shipping: shipping
        });
        return;
      }
    }
    that.setData({
      shipping: shipping,
      goodsJsonStr: goodsJsonStr,
      allGoodsPrice: allGoodsPrice
    });
  },
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },

})
