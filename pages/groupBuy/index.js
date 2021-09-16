var wxpay = require('../../utils/pay.js')
//获取应用实例
var app = getApp()

Page({
  data: {
    navH: app.globalData.navHeight,
    botH: null,
    goodsList: [],
    shipping: 0, // 是否需要物流信息
    allGoodsPrice: 0,//商品价格
    yunPrice: 0,
    allGoodsAndYunPrice: 0,//商品价格+运费
    goodsJsonStr: "",

    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    goodsType: 1,
    buyType: 1,

    weight: 0,


    shop_id: 0,
    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    order_id: '',
    userInfo: {}
  },
  onShow: function () {
    var that = this;
    var shopList = [];
    var type = 1;
    var gtype = 1;
    var pt_id = 0;
    var shop_id = 0;
    var kj_id = 0;
    // console.log(that.data.orderType);

    //立即购买下单
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList;
        type = buyNowInfoMem.buyType;
        gtype = buyNowInfoMem.goodsType;
        shop_id = buyNowInfoMem.shop_id;
      }
    }
    //开团购买
    if ("kt" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList;
        type = 3;
        gtype = buyNowInfoMem.goodsType;
      }
    }
    if ("ct" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList;
        type = 4;
        gtype = buyNowInfoMem.goodsType;
        pt_id = buyNowInfoMem.pt_id;
      }
    }

    if ("kj" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList;
        type = 2;
        gtype = buyNowInfoMem.goodsType;
        kj_id = buyNowInfoMem.kj_id;
      }
    }


    that.setData({
      goodsList: shopList,
      buyType: type,
      goodsType: gtype,
      shop_id: shop_id,
      pt_id: pt_id,
      kj_id: kj_id
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
    }

    that.setData({
      orderType: orderType
    });
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        //console.log(res.data)
        that.setData({
          userInfo: res.data.userInfo
        })
      }
    })
  },

  createOrder: function (e) {
    wx.showLoading();
    var that = this;
    var redirectUrl = "/pages/order/index";


    if (that.data.order_id != '') {
      //购物车或者立即购买
      if (that.data.buyType == 1 || that.data.buyType == 2) {
        redirectUrl = "/pages/order/index";
      }
      //开团或者参团
      if (that.data.buyType == 3 || that.data.buyType == 4) {
        redirectUrl = "/pages/joinGroup/index?order_id=" + that.data.order_id;
      }


      wx.hideLoading();
      wxpay.wxpay(app, that.data.order_id, redirectUrl, 're_pay');
    } else {

      var remark = ""; // 备注信息
      if (e) {
        remark = e.detail.value.remark; // 备注信息
      }

      var postData = {
        token: app.globalData.token,
        access_token: app.globalData.access_token,
        buyType: that.data.buyType,
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
      if (that.data.curCoupon) {
        postData.bonus_card_id = that.data.curCoupon.id;
      }

      if (that.data.buyType == 4 || that.data.goodsType == 4) {
        postData.pt_id = that.data.pt_id;
      }
      if (that.data.buyType == 2 || that.data.goodsType == 5) {
        postData.kj_id = that.data.kj_id;
      }

      wx.request({
        url: app.globalData.api_url + '/wx_order/create',
        method: 'POST',

        data: postData, // 设置请求的 参数
        success: (r) => {
          //console.log(r);
          wx.hideLoading();
          if (r.data.code != 'success') {
            wx.showLoading({
              title: r.data.msg,
            })
            return;
          } else {
            that.data.order_id = r.data.order_id;

            //购物车或者立即购买
            if (that.data.buyType == 1 || that.data.buyType == 2) {
              redirectUrl = "/pages/order-list/index";
            }
            //开团或者参团
            if (that.data.buyType == 3 || that.data.buyType == 4) {
              redirectUrl = "/pages/joinGroup/index?order_id=" + r.data.order_id;
            }

            if (e && "buyNow" != that.data.orderType) {
              // 清空购物车数据
              wx.removeStorageSync('shopCarInfo');
            }
            wxpay.wxpay(app, r.data.order_id, redirectUrl, 're_pay', that.data.buyType);
          }
        }
      })
    }
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
    var weight = 0;
    var allGoodsPrice = 0;
    var yun_fee = 0;
    var allGoodsAndYunPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {

      let carShopBean = goodsList[i];

      if (carShopBean.shipping) {
        shipping = 1;
        weight += carShopBean.weight * carShopBean.number;
      }

      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';

      if (i > 0) {
        goodsJsonStrTmp = ",";
      }

      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"sid":"' + carShopBean.sid + '"' + '}';
      goodsJsonStr += goodsJsonStrTmp;

    }
    //console.log(allGoodsPrice);
    goodsJsonStr += "]";

    that.setData({
      allGoodsPrice: allGoodsPrice
    });

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

      var postData = {
        token: app.globalData.token,
        access_token: app.globalData.access_token,
        city_id: that.data.curAddressData.cityId,
        weight: weight,
        shop_id: that.data.shop_id,
        goods_type: that.data.goodsType,
        all_goods_price: allGoodsPrice
      };

      wx.request({
        url: app.globalData.api_url + '/wx_order/transport_fee',
        data: postData,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.code == "success") {

            yun_fee = res.data.yun_fee;

            that.setData({
              yunPrice: res.data.yun_fee,
              shipping: shipping,
              weight: weight,
              goodsJsonStr: goodsJsonStr,
              allGoodsAndYunPrice: parseFloat(allGoodsPrice) + parseFloat(res.data.yun_fee)
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
    } else {
      that.setData({
        yunPrice: 0,
        shipping: shipping,
        weight: weight,
        goodsJsonStr: goodsJsonStr,
        allGoodsAndYunPrice: allGoodsPrice
      });
    }

    if (that.data.goodsType == 1) {
      that.getMyCoupons();
    }


  },

  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  getMyCoupons: function () {
    var that = this;

    wx.request({
      url: app.globalData.api_url + '/wx_bonus_card/get_bonus_card',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token,
        shop_id: that.data.shop_id
      },
      success: function (res) {
        if (res.data.code == 'success') {
          // console.log(that.data.allGoodsPrice);	
          // console.log(res.data.data);		
          if (res.data.data) {
            var coupons = res.data.data.filter(entity => {
              return entity.full_num <= that.data.allGoodsPrice;
            });
            if (coupons.length > 0) {
              that.setData({
                hasNoCoupons: false,
                coupons: coupons
              });
            }
          }
        }
      }
    })
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].deduct_num,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})
