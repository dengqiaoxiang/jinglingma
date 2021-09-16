var wxpay = require('../../utils/pay.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    navH: app.globalData.navHeight,
    botH: null,
    goodsType: 1,
    buyType: 1,
    cartsdata: [],
    siteId: 0,
    curSite: {},
    siteArr: [],
    coupon: 0,
    order_common_no_id: '',
    storeid: 0,
    allPrice: 0,
  },
  onLoad: function (options) {
    var that = this;

    var query = wx.createSelectorQuery();
    query.select('.toBuy').boundingClientRect(function (rect) {
      that.setData({
        botH: rect.height + 'px'
      });
    }).exec();

    

      wx.request({
        url: app.globalData.api_url + '/wx_cart/checkout',
        data: {
          shop_id: options.storeid,
          token: app.globalData.token,
          access_token: app.globalData.access_token
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 'success') {
            that.setData({
              storeid: options.storeid,
              cartsdata: res.data.goods_list,
              coupon: res.data.coupon_num,
              allPrice: res.data.order_total_price
            });
          } else {
            wx.showModal({
              title: '错误',
              content: res.data.msg,
              showCancel: false
            })
          }
        }
      })


  },
  onShow: function () {
    var that = this;

    that.initShippingAddress();
    // 创建订单
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        var address_id = res.data.userInfo.address_id
        that.setData({
          siteId: address_id
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  // 默认地址
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_user/default_address',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: (res) => {
        //console.log(res);
        if (res.data.code == 'success') {
          that.setData({
            curSite: res.data.data
          });
        } else {
          wx.showLoading({
            title: '请先登录',
          })

          wx.navigateTo({
            url: "/pages/authorize/index"
          })
          setTimeout(function () {
            wx.hideLoading()
          }, 1000)
        }

      }
    })
  },



  createOrder: function (e) {
    var that = this;
    wx.showLoading();
    
    var redirectUrl = "/pages/order/index";


    if (that.data.order_common_no_id != '') {
      redirectUrl = "/pages/order/index";
      console.log(111)
      wx.hideLoading();
      wxpay.wxpay(app, that.data.order_common_no_id, redirectUrl, 'pay');
    } else {


      if (!that.data.curSite) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      var curSite = that.data.curSite;
      if (!curSite.districtId) {
        return;
      }
      var storeid = that.data.storeid;
      wx.request({
        url: app.globalData.api_url + '/wx_cart/create',
        data: {
          shop_id: storeid,
          provinceId: curSite.provinceId,
          cityId: curSite.cityId,
          districtId: curSite.districtId,
          address: curSite.address,
          name: curSite.name,
          telephone: curSite.telephone,
          ['remark[' + storeid + ']']: e.detail.value.remark,
          token: app.globalData.token,
          access_token: app.globalData.access_token
        }, // 设置请求的 参数
        success: (r) => {
          wx.hideLoading();
          console.log(r);
          if (r.data.code != 'success') {
            wx.showLoading({ title: r.data.msg });
            return;
          } else {
            wx.setStorage({
              key: "cartNum",
              data: 0
            })
            that.data.order_common_no_id = r.data.order_common_no_id;
            //购物车或者立即购买            
            redirectUrl = "/pages/order/index";
            wxpay.wxpay(app, r.data.order_common_no_id, redirectUrl, 'pay');
          }
        }
      })

    }
  },
})