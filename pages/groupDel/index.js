//index.js
//获取应用实例
var app = getApp();
//timer = app.timer;
var WxParse = require('../../wxParse/wxParse.js');
var timer = require('../../utils/wxTimer.js');

Page({
  data: {
    navH: app.globalData.navHeight,
    botH: null,

    goodsDetail: {},
    pt_list: [],
    wxTimerList: {},

    keyword: [],
    attribute: [],

    selectSize: "选择：",

    ptPrice: 0,
    yjPrice: 0,
    ptNum: 0,

    selectImage: "",
    menuTapCurrent: 1,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,
    buyLimit: 0,

    shipping: true,
    sid: "",
    spec_name: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "kt",//购物类型，开团或原价购买，默认为开团
  },
  onReady: function () {
    var that = this;
    //获得easyModal
    that.baseModal = this.selectComponent("#baseModal");
  },
  onLoad: function (e) {

    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.del-bot').boundingClientRect(function (rect) {
      that.setData({
        botH: rect.height + 'px'
      });
    }).exec();

    /* */
    wx.request({
      url: app.globalData.api_url + '/wx_goods/detail',
      data: {
        id: e.id,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        if (res.data.code == 'success') {
          that.setData({
            gallery: res.data.gallery,
            goods: res.data.goods,
            description: res.data.description,
            images_description: res.data.images_description,
            ptPrice: res.data.goods.pt_price,
            yjPrice: res.data.goods.price,
            ptNum: res.data.goods.pt_tuan_num,
            buyLimit: res.data.goods.pt_limit_num,
            keyword: keyword,
            attribute: res.data.attribute,
            skumap: res.data.skumap,
            spec: res.data.spec,
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
          if (res.data.spec){
            var spec = res.data.spec;
            var value = spec[0].value
            for (var i in value){
              value[i].active = false
            }
            that.setData({
              ['spec[0].value']: value
            });
            //console.log(res.data.skumap);
          }
          WxParse.wxParse('article', 'html', res.data.description, that, 5);
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    });


    

    wx.request({
      url: app.globalData.api_url + '/wx_pintuan/leader_list',
      data: {
        id: e.id,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res);
        let goods = [];
        let time_list = [];
        if (res.data.code == 'success' && res.data.data.length > 0) {

          for (var i = 0; i < res.data.data.length; i++) {
            goods.push(res.data.data[i]);

            var time = new timer({
              beginTime: res.data.data[i].end_time,
              name: i,
              complete: function () {
                console.log("完成了")
              }
            })
            time.start(that);
          }



          console.log(time_list);
          that.setData({
            pt_list: goods,
          });

        } else {

          that.setData({
            pt_list: ''
          });
          return;
        }
      }
    })

    this.reputation(e.id);

   
  },

  // 拼团规则
  onShowModal: function (e) {
    this.baseModal.showModal();
  },
  onShow: function(){
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
  toKt: function () {
    this.setData({
      shopType: "kt",
      price: this.data.ptPrice 
    })
    this.bindGuiGeTap();
  },
  toYj: function () {
    this.setData({
      shopType: "yj",
      price: this.data.yjPrice
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
    if (this.data.buyNumber >= this.data.buyLimit && this.data.shopType == 'kt') {
      wx.showModal({
        title: '提示',
        content: '该商品限购' + this.data.buyLimit + '件',
        showCancel: false
      })
      return;
    }
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
    * 原价购买
    */
  buy: function () {

    var goods = this.currentProduct();
    console.log(goods);

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
    if (this.data.buyNumber > this.data.goods.pt_limit_num) {
      wx.showModal({
        title: '提示',
        content: '该商品限购' + this.data.goods.pt_limit_num + '件',
        showCancel: false
      })
      return;
    }
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();

    //开团购买
    if (this.data.shopType == 'kt') {
      wx.navigateTo({
        url: "/pages/groupBuy/index?orderType=kt"
      })
    }
    //原价购买
    if (this.data.shopType == 'yj') {
      wx.navigateTo({
        url: "/pages/groupBuy/index?orderType=buyNow"
      })
    }
  },

  join_pt: function (e) {

    wx.navigateTo({
      url: "/pages/pintuan/join/index?order_id=" + e.currentTarget.dataset.id
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
    var buyNowInfo = {};

    shopCarMap.goodsId = this.data.goods.id;
    shopCarMap.image = this.data.selectImage;
    shopCarMap.name = this.data.goods.name;
    shopCarMap.type = this.data.goods.type;
    shopCarMap.shipping = this.data.goods.shipping;
    shopCarMap.sid = sid;
    shopCarMap.spec_name = this.data.spec_name;

    //console.log(this.data.shopType);

    if (this.data.shopType == 'kt') {//开团
      shopCarMap.price = this.data.ptPrice;
      shopCarMap.weight = 0;

      buyNowInfo.buyType = 3;
      buyNowInfo.goodsType = this.data.goods.type;
    }
    if (this.data.shopType == 'yj') {//原价购买
      shopCarMap.price = this.data.yjPrice;
      shopCarMap.weight = this.data.goods.weight;

      buyNowInfo.buyType = 2;
      buyNowInfo.goodsType = this.data.goods.type;
    }



    shopCarMap.number = this.data.buyNumber;



    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }


    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
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
  onShareAppMessage: function () {
    return {
      title: this.data.goods.name,
      path: '/pages/pintuan/goods/index?id=' + this.data.goods.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})
