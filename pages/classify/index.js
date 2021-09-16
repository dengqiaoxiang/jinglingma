//index.js
//获取应用实例
const app = getApp()
var template = require('../../component/footer/footer.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');

var qqmapsdk;

Page({
  data: {
    navH: app.globalData.navHeight,
    tabH: null,
    locAuthorize: true,
    shopMsg: {},
    shops: [],
    shopDistant: 0,
    news: [], //新闻数组
    pubilcH: null,
    topH: null, //左侧高度
    ini: 0,
    uhide: '',
    nomore: false, // 没有更多
    loadMore: false, // 加载  
    currentSite: '', // 位置名称
    leftActiveId: '', // 左侧大类初始值,
    categoryIdx: 0, //左侧大类初始值
    rightArr: [], //右边产品
    delActiveId: '', // 右侧小类初始值
    modActiveId: 1,
    specActiveId: '', // 规格初始值
    kindActiveId: 1, // 种类初始值
    leftTabs: [], // 左侧tabs数组
    detailTabs: [], // 右侧tabs数组
    arr: [], // 右侧列表数组
    specArr: [], // 规格tabs数组
    kindArr: [{
        id: 1,
        name: "种类"
      },
      {
        id: 7,
        name: " 1000g"
      },
      {
        id: 6,
        name: " 2000g "
      }
    ], // 种类tabs数组
    specIdx: 0,
    kindIdx: 0,
    specPrice: 0,
    goodsNum: [], //产品数量
    totalSun: [], // 数量
    totalNum: 0, //总数量
    add_car_num: 0, //控制是否初次进入界面
    price: '0.00', //价钱
    modalId: '', //模态框id
    modalIdx: '', //模态框下标
    page: 0, // 产品页数,
    totalPage: null // 总页数
  },
  // 滚动到底部

  stopLoadMoreTiem: false, // 阻止多次触发 需要的变量
  // 滚动到底部
  lower: function() {
    var that = this;
    if (that.stopLoadMoreTiem) {
      return;
    }
    //console.log(that.data.page, that.data.totalPage)
    if (that.data.page == that.data.totalPage - 1) {
      //console.log(11)
      that.setData({
        nomore: true
      });
      return;
    } else if (that.data.page < that.data.totalPage - 1) {
      this.setData({
        page: that.data.page + 1 //上拉到底时将page+1后再调取列表接口
      });
      var shop_id = that.data.shopMsg.shop_id;
      var delActiveId = that.data.delActiveId;
      if (delActiveId == null) {
        delActiveId = ''
      }
      that.getGoodsList(shop_id, that.data.leftActiveId, delActiveId);
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    //获得easyModal
    that.baseModal = this.selectComponent("#baseModal");
    template.tabbar("tabBar", 2, that) //0表示第一个tabbar;
  },
  getUserLoc: function(id) {
    var that = this;
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'USWBZ-ASKKV-3PCPV-UCDWN-6DYIF-RDBRO'
    });
    var shop_id = 0;
    if(id){
      shop_id = id;
      wx.setStorageSync('shop_id', id);
    }else{
      shop_id = wx.getStorageSync('shop_id');
    }
   
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        // 1、授权成功
        that.setData({
          locAuthorize: true,
        })
        //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        const latitude = res.latitude;
        const longitude = res.longitude;

        //3、取出最近距离
        //console.log(id);

        wx.request({
          url: app.globalData.api_url + '/wx_shop/selected',
          data: {
            id: shop_id,
            token: app.globalData.token,
            access_token: app.globalData.access_token
          },
          success: function(res) {
            //console.log(res.data.data)
            var shop = res.data.data;
            var distant = that.getDistance(latitude, longitude, shop.shop_latitude, shop.shop_longitude);
            //console.log(shop)
            that.setData({
              shopDistant: distant,
              shopMsg: shop
            })
            that.getCategory(shop.shop_id);
          },
          fail: function(res) {
            console.log(res)
          }
        })

        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            that.setData({
              currentSite: address,
            })
          }
        })
      },
      fail: function(res) {
        that.setData({
          locAuthorize: false
        });
        return;
      }
    })
  },
  // 打开权限按钮
  openSet: function() {
    var that = this;
    wx.openSetting({
      success(res) {
        that.setData({
          locAuthorize: true
        });
        that.getUserLoc();
      }
    })
  },
  // 计算距离函数
  getDistance: function(lat1, lng1, lat2, lng2) {
    lat1 = lat1 || 0;
    lng1 = lng1 || 0;
    lat2 = lat2 || 0;
    lng2 = lng2 || 0;

    var rad1 = lat1 * Math.PI / 180.0;
    var rad2 = lat2 * Math.PI / 180.0;
    var a = rad1 - rad2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

    var r = 6378137;
    var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));

    /*if (distance > 1000){
      distance = Math.round(distance / 1000);
    }*/
    var lastDistance = (parseInt(distance) / 1000).toFixed(2)
    return lastDistance;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 加载的使用进行网络访问，把需要的数据设置到data数据对象 
    var that = this;
    var shopid = options.shopid;

    //1、获取当前位置坐标
    that.getUserLoc(shopid);
    that.setData({
      tabH: app.globalData.tabHeight,
      pubilcH: parseInt(app.globalData.tabHeight) + parseInt(app.globalData.tabHeight)
    })

    var query = wx.createSelectorQuery();
    query.select('.top').boundingClientRect(function(rect) {
      console.log(rect);
      that.setData({
        topH: rect.height + 'px'
      });
    }).exec();

    // 公告
    wx.request({
      url: app.globalData.api_url + '/wx_notice/lists',
      data: {
        access_token: app.globalData.access_token
      },
      success: function(res) {

        that.setData({
          news: res.data.data
        })
      },
      fail: function(res) {
        console.log(res)
      }
    })

  },

  // 获取分类
  getCategory: function(shopId) {
    var that = this;
    // 分类
    wx.request({
      url: app.globalData.api_url + '/wx_goods/category',
      data: {
        //shop_id: shopid,
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function(res) {
        //console.log(res);
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加分类',
            showCancel: false
          })
        } else {
          //console.log(res)
          var detailts = res.data.data[0].subclass
          that.setData({
            leftTabs: res.data.data,
            leftActiveId: res.data.data[0].id,
            detailTabs: res.data.data[0].subclass
          });
          var categoryId = res.data.data[0].id;
          that.getGoodsList(shopId, categoryId, '');


          //console.log(shopId)
          //请求购物车数量
          that.getCart(shopId);
        }
      }
    });
  },

  getCart: function(shopId) {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_cart/add',
      data: {
        shop_id: shopId,
        goods_id: '',
        sid: '',
        quantity: '',
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function(res) {
        console.log(res)
        that.setData({
          totalNum: res.data.quantity,
          goodsNum: res.data.goods_info,
          totalSun: res.data.totalsun
        })
        //console.log(that.data.goodsNum)
      }
    })
  },

  // 获取商品列表
  getGoodsList: function(shopId, categoryId, filterId) {
    //console.log(shopId)
    var that = this;
    that.stopLoadMoreTiem = true;

    wx.showLoading({
      title: '加载中....',
    })
    wx.request({
      url: app.globalData.api_url + '/wx_goods/lists',
      data: {
        goods_type: 1,
        category_id: categoryId,
        filter: filterId,
        page: that.data.page,
        shop_id: shopId,
        pageSize: 10,
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function(res) {
        //console.log(res)
        var data = res.data.data;
        var pages = res.data.pages;
        //console.log(that.data.page,pages.last_page)
        that.stopLoadMoreTiem = false;
        if (res.data.code == 'success') {
          that.setData({
            totalPage: pages.last_page
          })
          if (that.data.page == 0) {
            that.setData({
              arr: data,
            });
            if (data.length < 10) {
              that.setData({
                nomore: true,
              });
            }
          } else {
            var newData = that.data.arr.concat(data);
            that.setData({
              arr: newData
            });
          }
        } else {
          that.setData({
            arr: []
          });
        }
      }
    })
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var shopId = that.data.shopMsg.shop_id;
    //请求购物车数量
    that.getCart(shopId);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  // 左边大类切换
  leftTabClick: function(e) {
    var that = this;
    var curId = e.currentTarget.id; //当前id
    var categoryIdx = e.currentTarget.dataset.index;
    var detailTabsData = that.data.leftTabs[categoryIdx].subclass;
    var shopId = that.data.shopMsg.shop_id;
    // 用于接受list的值
    that.setData({
      leftActiveId: curId,
      detailTabs: detailTabsData, //二级数组标题
      delActiveId: null,
      categoryIdx: categoryIdx,
      page: 0,
      nomore: false
    });
    that.getGoodsList(shopId, curId, '');
  },
  // 右边小类切换
  delTabClick: function(e) {
    var that = this;
    var curId = that.data.leftActiveId;
    var shopId = that.data.shopMsg.shop_id;
    this.setData({
      delActiveId: e.currentTarget.id,
      page: 0,
      nomore: false
    });
    that.getGoodsList(shopId, curId, e.currentTarget.id);
  },

  //数量加函数
  numadd: function(e) {
    var that = this;
    var idx = e.target.dataset.idx;
    const cart_id = that.data.goodsNum[idx].cart_id;
    let quantity = that.data.goodsNum[idx].number;
    wx.request({
      url: app.globalData.api_url + '/wx_cart/update',
      data: {
        cart_id: cart_id,
        quantity: ++quantity,
        select: '',
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function(res) {
        //console.log(res);
        that.data.goodsNum[idx].number = quantity,
          that.setData({
            totalNum: res.data.total_quantity,
            goodsNum: that.data.goodsNum,
            totalSun: res.data.totalsun
          })

      }
    })
  },
  //数量减函数
  numminus: function(e) {
    var that = this;
    var idx = e.target.dataset.idx;
    //console.log(idx);
    const cart_id = that.data.goodsNum[idx].cart_id;
    let quantity = that.data.goodsNum[idx].number;
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
        success: function(res) {
          console.log(res);
          that.data.goodsNum[idx].number = quantity,
            that.setData({
              totalNum: res.data.quantity,
              goodsNum: that.data.goodsNum,
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
        success: function(res) {
          console.log(res)
          that.data.goodsNum[idx].number = 0,
            that.setData({
              totalNum: res.data.quantity,
              goodsNum: that.data.goodsNum,
              totalSun: res.data.totalsun
            })
        }
      })
    }
  },
  // 产品数量为零时方法
  showadd: function(e) {
    var _this = this;
    const index = e.currentTarget.dataset.index;
    var idx = e.target.dataset.idx;
    const goods_id = e.currentTarget.id;

    wx.request({
      url: app.globalData.api_url + '/wx_cart/add',
      data: {
        goods_id: goods_id,
        sid: _this.data.specActiveId,
        quantity: 1,
        select: '',
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function(res) {
        console.log(res.data);
        if (res.data.code == 'success') {
          _this.setData({
            totalNum: res.data.quantity,
            goodsNum: res.data.goods_info,
            totalSun: res.data.totalsun
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


  // 显示模态框
  onShowModal: function(e) {
    this.baseModal.showModal();
    var modalArr = e.target.dataset.arr;
    var specArr = modalArr[0].value;
    var index = e.target.dataset.index;
    //console.log(this.data.arr[index].price)
    //console.log(modalArr)
    this.setData({
      modalIdx: index,
      modalId: e.currentTarget.id,
      specPrice: this.data.arr[index].price
    });

    if (modalArr) {
      this.setData({
        specArr: specArr,
        specActiveId: specArr[0].id,
        specIdx: 0
      });

    }

  },
  onHideModal: function() {
    this.baseModal.hideModal();
    this.setData({
      specActiveId: 0,
    });
  },

  // 规格切换
  specTabClick: function(e) {
    var that = this;
    var modalIdx = that.data.modalIdx;
    var price = that.data.arr[modalIdx].price;
    var specIdx = e.target.dataset.idx;
    var specId = e.currentTarget.id;

    var unitPrice = price / parseInt(that.data.specArr[0].name);
    var curPrice = (unitPrice * parseInt(that.data.specArr[specIdx].name)).toFixed(2);
    that.setData({
      specActiveId: specId,
      specIdx: specIdx,
      specPrice: curPrice
    })
  },
  // 种类切换
  kindTabClick: function(e) {
    this.setData({
      kindActiveId: e.currentTarget.id,
      kindIdx: e.target.dataset.idx
    })
  },


  /**
   * 递减指定的商品数量
   */
  minusCount: function(e) {
    let _this = this,
      index = e.currentTarget.dataset.index,
      goods = _this.data.goods_list[index],
      order_total_price = _this.data.order_total_price,
      quantity = --goods.number;
  },


})