//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    navH: app.globalData.navHeight,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    swiperCurrent: 0,

    goodsDetail: {},
    keyword: [],
    attribute: [],

    selectSize: "选择：",
    selectSizePrice: 0,
    selectImage: "",
    menuTapCurrent: 1,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    description: "",

    shipping: true,
    sid: "",
    spec_name: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (e) {

    var that = this;
    // 获取购物车数据
    var query = wx.createSelectorQuery();
    query.select('.del-bot').boundingClientRect(function (rect) {
      that.setData({
        botH: rect.height + 'px'
      });
    }).exec();

    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    /* */
    wx.request({
      url: app.globalData.api_url + '/wx_goods/detail',
      data: {
        id: e.id,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        if (res.data.code == 'success') {
          console.log(res.data)
         
          that.setData({
            gallery: res.data.gallery,
            goods: res.data.goods,
            description: res.data.description,
            images_description: res.data.images_description,
            selectSizePrice: res.data.goods.pay_points,
            spec: res.data.spec,
            keyword: keyword,
            attribute: res.data.attribute,
            skumap: res.data.skumap,
            selectImage: res.data.goods.image,
            buyNumMax: res.data.goods.quantity,
            buyNumber: (res.data.goods.minimum > 0) ? 1 : 0,
            shipping: res.data.goods.shipping,
          });
          if (res.data.keyword != '') {
            var keyword = res.data.keyword.split(',');
            that.setData({
              keyword: keyword
            })
          }
          // console.log(res.data.description);
          WxParse.wxParse('article', 'html', res.data.description, that, 5);
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
    this.reputation(e.id);
  },
  onShow: function () {
    var that = this;
    // 购物车数量
    wx.request({
      url: app.globalData.api_url + '/wx_cart/add',
      data: {
        goods_id: '',
        sid: '',
        quantity: '',
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
        that.setData({
          totalNum: res.data.quantity
        })
      }
    });
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/cart/index"
    });
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();

  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },


  /**
   * 取得当前商品
   * @param {Object} e
   */
  currentProduct: function () {

    var skumap = this.data.skumap;

    if (skumap == '') {
      return true;
    }

    var sku = new Array();

    var sku_name = new Array();

    for (var v in this.data.spec) {
      for (var c in this.data.spec[v].value) {
        if (this.data.spec[v].value[c].active != undefined && this.data.spec[v].value[c].active == true) {
          sku.push(this.data.spec[v].spec_id + ':' + this.data.spec[v].value[c].id);
          sku_name.push(this.data.spec[v].value[c].name);
        }
      }
    }

    if (sku) {

      var sku_key = ";" + sku.join(";") + ";";

      var s_name = sku_name.join("，");

      this.setData({
        spec_name: s_name
      })

      if (skumap[sku_key] != undefined) {
        var cur_spec = skumap[sku_key];

        if (cur_spec.quantity > 0) {
          return skumap[sku_key];
        } else {
          return 'no_have_stored';
        }
      } else return null;

    } else {
      return null;
    }

  },

  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function (e) {
    var that = this;
    var specid = e.currentTarget.dataset.specid;
    var specvalueidx = e.currentTarget.dataset.specvalueidx

    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.spec[specid].value;

    for (var v in childs) {
      that.data.spec[specid].value[v].active = false;
    }

    // 设置当前选中状态
    that.data.spec[specid].value[specvalueidx].active = true;
    var image = e.currentTarget.dataset.specimage;

    if (image != undefined) {
      image = e.currentTarget.dataset.specimage;
    } else {
      image = that.data.selectImage;
    }

    var cur = this.currentProduct();

    if (cur == 'no_have_stored') {
      that.data.spec[specid].value[specvalueidx].active = false;
      wx.showModal({
        title: '提示',
        content: '该规格库存不足',
        showCancel: false
      })
      return;
    }

    this.setData({
      spec: that.data.spec,
      selectImage: image,
    })
  },

	/**
	  * 立即购买
	  */
  buyNow: function () {

    var goods = this.currentProduct();

    if (!goods) {
      wx.showModal({
        title: '提示',
        content: '请选择商品规格',
        showCancel: false
      })

      this.bindGuiGeTap();
      return;
    }

    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return;
    }

    wx.request({
      url: app.globalData.api_url + '/wx_points/check_points',
      method: 'POST',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token,
        points: this.data.selectSizePrice
      }, // 设置请求的 参数
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 'success') {
          //组建立即购买信息
          var buyNowInfo = this.buliduBuyNowInfo();
          // 写入本地存储
          wx.setStorage({
            key: "buyNowInfo",
            data: buyNowInfo
          })
          this.closePopupTap();

          wx.navigateTo({
            url: "/pages/scoreBuy/index?orderType=buyNow"
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
          return;
        }

      }
    })


  },
	/**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function () {

    var goods = this.currentProduct();

    if (goods["id"]) {
      var sid = goods["id"];
    } else {
      var sid = 0;
    }

    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goods.id;
    shopCarMap.image = this.data.selectImage;
    shopCarMap.name = this.data.goods.name;

    shopCarMap.type = this.data.goods.type;
    shopCarMap.weight = this.data.goods.weight;
    shopCarMap.shipping = this.data.goods.shipping;

    shopCarMap.sid = sid;
    shopCarMap.spec_name = this.data.spec_name;
    shopCarMap.price = this.data.selectSizePrice;

    shopCarMap.number = this.data.buyNumber;


    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }


    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + app.globalData.uid,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  reputation: function (goodsId) {
    var that = this;

    wx.request({
      url: app.globalData.api_url + '/wx_goods/comment',
      data: {
        goodsId: goodsId,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        if (res.data.code == 'success') {
          //console.log(res.data.data);
          that.setData({
            reputation: res.data
          });
        }
      }
    })

  },
  menuTap: function (e) {
    var current = e.currentTarget.dataset.current;//获取到绑定的数据
    //改变menuTapCurrent的值为当前选中的menu所绑定的数据
    this.setData({
      menuTapCurrent: current
    });
  },

})
