//index.js
//获取应用实例
const app = getApp()
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    navH: app.globalData.navHeight,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    swiperCurrent: 0,
    botH: 0,

    specArr: [],
    keyword: [],
    spec_name: '',
    attribute: [],
    specActiveId: 1,
    specIdx: 0,
    price: 0,
    totalNum: 0,
    shopid: 0,
    goodid: 0,
    goodsNum: [], // 同商品下的列表
    goodinfo: {}, // 同商品同规格
    goodsDetail: {},
    totalSun: [],
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function (options) {

    var that = this;
    // 获取购物车数据
    that.setData({
      shopid: options.shopid,
      goodid: options.goodid
    })
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
        id: options.goodid,
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.code == 'success') {
        
          that.setData({
            gallery: res.data.gallery,
            goods: res.data.goods,
            subtitle: res.data.meta_description,
            goodsType: res.data.goods.type,
            description: res.data.description,
            attribute: res.data.attribute,
            images_des: res.data.images_description,
            selectSizePrice: res.data.goods.price,
            price: res.data.goods.price,
          });
          var specArr = res.data.spec;
          if (res.data.keyword != '') {
            var keyword = res.data.keyword.split(',');
            that.setData({
              keyword: keyword
            })
          }
          if (specArr != ''){
            that.setData({
              specArr: specArr[0].value,
              spec_name: specArr[0].name,
              specActiveId: specArr[0].value[0].id,
            })
          }
          WxParse.wxParse('article', 'html', res.data.description, that, 5);

          // 对的单个产品的购物车
          


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
  onShow: function(){
    var  that  = this;
    that.baseModal = this.selectComponent("#baseModal");
    that.getCart(that.data.shopid, that.data.goodid);
  },
  // 获取购物车数量
  getCart: function (shopid, goodid) {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_cart/add',
      data: {
        shop_id: shopid,
        goods_id: goodid,
        sid: '',
        quantity: '',
        detail: true,
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
        console.log(res.data)
        var goodsinfo = res.data.goods_info;
        var goodinfo = {};

        // 有规格
        if (goodsinfo[0]){
          if (goodsinfo[0].sid>0){
            for (var i in goodsinfo) {
              if (goodsinfo[i].sid === that.data.specActiveId) {
                goodinfo = goodsinfo[i];
              }
            }
          }else {
            goodinfo = goodsinfo[0];
          }
        }
        that.setData({ 
          goodsNum: goodsinfo,
          totalNum: goodsinfo.numsun,
          goodinfo: goodinfo,
          totalSun: res.data.totalsun || 0
        })
      }
    });
  },

  // 显示模态框
  onShowModal: function (e) {
    this.baseModal.showModal();
  },

  specTab: function(e){
    var that = this;
    var specId = e.currentTarget.dataset.id;
    var goodsNum = that.data.goodsNum;
    var specIdx = e.currentTarget.dataset.idx;
    var price = that.data.price;
    var specArr = that.data.specArr;
    var goodinfo = {}
    
    for (var i in goodsNum){
      if (goodsNum[i].sid == specId){
        goodinfo = goodsNum[i];
      }
    }
  
    var unitPrice = price / parseInt(specArr[0].name);
    var curPrice = (unitPrice * parseInt(specArr[specIdx].name)).toFixed(2);
    that.setData({
      specActiveId: specId,
      specIdx: specIdx,
      selectSizePrice: curPrice,
      goodinfo: goodinfo
    })
  },
  // 产品数量为零时方法
  showadd: function (e) {
    var that = this;
    const goods_id = that.data.goodid;
    let goodinfo = that.data.goodinfo;
    var index = e.currentTarget.dataset.index;
    wx.request({
      url: app.globalData.api_url + '/wx_cart/add',
      data: {
        goods_id: goods_id,
        sid: that.data.specActiveId,
        quantity: 1,
        select: '',
        detail: true,
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
        //console.log(res.data);
        if (res.data.code == 'success') {
          console.log(res.data);
          var goodsinfo = res.data.goods_info;
          var goodinfo = {};
          if (goodsinfo.sid > 0) {
            for (var i in goodsinfo) {
              if (goodsinfo[i].sid == that.data.specActiveId) {
                goodinfo = goodsinfo[i];
              }
            }
          } else {
            goodinfo = goodsinfo[0];
          }
          that.setData({
            totalNum: goodsinfo.total_quantity,
            goodinfo: goodinfo,
            totalSun: res.data.totalsun || 0
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

  //数量加函数
  numadd: function (e) {
    var that = this;

    const cart_id = that.data.goodinfo.cart_id;
    let quantity = that.data.goodinfo.number;
    //console.log(cart_id)
    wx.request({
      url: app.globalData.api_url + '/wx_cart/update',
      data: {
        cart_id: cart_id,
        quantity: ++quantity,
        select: '',
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
        console.log(res);
        that.setData({
          totalNum: res.data.quantity,
          ['goodinfo.number']: quantity,
          totalSun: res.data.totalsun
        })
      }
    })
  },
  //数量减函数
  numminus: function (e) {
    var that = this;
    //console.log(idx);
    const cart_id = that.data.goodinfo.cart_id;
    let quantity = that.data.goodinfo.number;
    if (quantity > 1) {
      wx.request({
        url: app.globalData.api_url + '/wx_cart/update',
        data: {
          cart_id: cart_id,
          quantity: --quantity,
          select: '',
          token: app.globalData.token,
          access_token: app.globalData.access_token,
        },
        success: function (res) {
          console.log(res);
          that.setData({
            totalNum: res.data.quantity,
            ['goodinfo.number']: quantity,
            totalSun: res.data.totalsun
          })
        }
      })
    } else {
      wx.request({
        url: app.globalData.api_url + '/wx_cart/remove',
        data: {
          cart_id: cart_id,
          token: app.globalData.token,
          access_token: app.globalData.access_token,
        },
        success: function (res) {
          console.log(res)
          that.setData({
            totalNum: res.data.quantity,
            ['goodinfo.number']: 0,
            totalSun: res.data.totalsun
          })
        }
      })
    }
  },
})
