
// pages/pintuan/join/index.js
var app = getApp();
//timer = app.timer;
var WxParse = require('../../wxParse/wxParse.js');
var timer = require('../../utils/wxTimer.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navH: app.globalData.navHeight,
    goods: {},

    wxTimerList: {},
    menuTapCurrent: 1,
    hideShopPopup: true,
    buyNumber: 1,
    buyNumMin: 1,
    buyNumMax: 0,
    sid: "",
    spec_name: "",
    goodinfo: [],
    keyword: [],
    hideShopPopup: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    /* */
    wx.request({
      url: app.globalData.api_url + '/wx_pintuan/pt_detail',
      data: {
        id: e.order_id,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 'success') {

          if (res.data.pintuan_status == 'pt_ing') {
            var wxTimer = new timer({
              beginTime: res.data.left_time,
              complete: function () {
                console.log("完成了")
              }
            })
            wxTimer.start(that);
          }
         // console.log(res.data);
          that.setData({
            
            goods: res.data.goods,
            description: res.data.description,
            images_description: res.data.images_description,
            selectImage: res.data.goods.image,
            pt_list: res.data.member,
            pt_status: res.data.pintuan_status,
            pintuan: res.data.pintuan,
            price: res.data.goods.pt_price,
            spec: res.data.spec,
            skumap: res.data.skumap,
            buyNumMax: res.data.goods.pt_limit_num,
            buyNumMin: res.data.goods.minimum,

          });
          if (res.data.spec) {
            var spec = res.data.spec;
            var value = spec[0].value
            for (var i in value) {
              value[i].active = false
            }
            that.setData({
              ['spec[0].value']: value
            });
            console.log(that.data.spec);
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
    })
    wx.request({
      url: app.globalData.api_url + '/wx_goods/detail',
      data: {
        id: e.order_id,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 'success') {
          if (res.data.keyword != '') {
            var keyword = res.data.keyword.split(',');
            that.setData({
              keyword: keyword
            });
          }
          that.setData({
            goodinfo: res.data.goods
          });
        } else{
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  ctBuy: function () {

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

      // console.log(sku_key);

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

    if (!goods) {
      wx.showModal({
        title: '提示',
        content: '请选择商品规格',
        showCancel: false
      })

      this.bindGuiGeTap();
      return;
    }
    //console.log(this.data.pintuan.leader_uid);
    // console.log(app.globalData.uid);

    if (this.data.pintuan.leader_uid == app.globalData.uid) {
      wx.showModal({
        title: '提示',
        content: '您不能参加自己开的团',
        showCancel: false
      })
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
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();


    wx.navigateTo({
      url: "/pages/groupBuy/index?orderType=ct"
    })


  },
  zBuy: function () {

    wx.navigateTo({
      url: "/pages/pintuan/goods/index?id=" + this.data.goods.id
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

    shopCarMap.price = this.data.goods.pt_price;
    shopCarMap.weight = 0;

    buyNowInfo.buyType = 4;
    buyNowInfo.pt_id = this.data.pintuan.id;
    buyNowInfo.goodsType = this.data.goods.type;

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
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: this.data.goods.name,
      path: '/pages/joinGroup/index?order_id=' + this.data.pintuan.order_id,
      success: function (res) {
        console.log(res);
        // 转发成功
      },
      fail: function (res) {
        console.log(res);
        // 转发失败
      }
    }
  }

})