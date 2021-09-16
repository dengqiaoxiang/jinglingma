//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    navH: app.globalData.navHeight,
    page: 0,
    inputValue: '',
    modActiveId: 1,
    specActiveId: 1,  // 规格初始值
    kindActiveId: 1,  // 种类初始值
    arr: [],
    showList: false, // 显示产品列表
    kw: null, //关键字
    nomore: false, // 没有更多
    searchKw: wx.getStorageSync('kwArr') || [], // 存储关键字
    kwArr: [],// 缓存数据
    // 右侧列表数组
    specArr: [], // 规格tabs数组
    // kindArr: [
    //   { id: 1, name: "种类" },
    //   { id: 7, name: " 1000g" },
    //   { id: 6, name: " 2000g " }
    // ], // 种类tabs数组
    specIdx: 1,
    kindIdx: 0,
    goodsNum: [], //产品数量
    totalNum: 0, //总数量
    add_car_num: 0,//控制是否初次进入界面
    price: '0.00', //价钱
    modalId: '', //模态框id
    modalIdx: '' //模态框下标
  },

  onReady: function () {
    //获得easyModal
    this.baseModal = this.selectComponent("#baseModal");
    this.storageModal = this.selectComponent("#clearKw");
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function () {
    // 加载的使用进行网络访问，把需要的数据设置到data数据对象 
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;    //比例
        var calc = clientHeight * rpxR - 450;
        that.setData({
          helfH: calc
        });
      }
    });

    // 关键词
    that.setData({
      kwArr: wx.getStorageSync('kwArr')
    })
    
    var shop_id = wx.getStorageSync('shop_id')

    //请求购物车数量
    wx.request({
      url: app.globalData.api_url + '/wx_cart/add',
      data: {
        shop_id: shop_id,
        goods_id: '',
        sid: '',
        quantity: '',
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
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


  //搜索框文本内容显示
  inputBind: function (event) {

    this.setData({
      inputValue: event.detail.value
    })
    if (event.detail.value == '') {
      this.setData({
        showList: false,
        arr: []
      })
    }
    //console.log('bindInput' + this.data.inputValue)
  },

  //清除搜索框文本内容
  clearKw: function () {
    this.setData({
      inputValue: '',
      showList: false,
      arr: []
    })
  },

  // 缓存关键字
  historyKw: function (e) {
    var that = this;
    var curKw = e.target.dataset.text;
    //console.log(curKw)
    that.getList(curKw, false);
    that.setData({
      inputValue: curKw
    })
  },

  /**
    * 搜索执行按钮
    */
  query: function (event) {
    var that = this
    /**
     * 提问帖子搜索API
     * keyword string 搜索关键词 ; 这里是 this.data.inputValue
     * start int 分页起始值 ; 这里是 0
     */

    var kw = that.data.inputValue.replace(/\s+/g, '');
    if (kw == '' || kw == undefined) {
      wx.showToast({
        title: '搜索词不能为空',
      })
      return
    }
    that.getList(kw, true);

  },
  // 请求关键词
  getList: function (kw, pushKw) {
    var that = this;
    //console.log(kw);
    that.setData({
      showList: true
    })
    wx.request({
      url: app.globalData.api_url + '/wx_goods/search',
      data: {
        shop_id: wx.getStorageSync('shop_id'),
        nameLike: kw,
        page: that.data.page,
        pageSize: 10,
        token: app.globalData.access_token,
        access_token: app.globalData.access_token
      },
      method: 'GET',
      success: function (res) {
        var searchData = res.data.data;
        console.log(res)

        if (!searchData || searchData == undefined) {
          that.setData({
            arr: []
          });
        } else {
          if (that.data.page == 0) {
            that.setData({
              arr: searchData,
              kw: kw
            });
            if (searchData.length < 10) {
              that.setData({
                nomore: true,
              });
            }
          } else {
            that.setData({
              arr: that.data.arr.concat(searchData),
              kw: kw
            });
          }

        }

        // 通过缓存关键词进来
        if (!pushKw) { return }

        // 缓存关键字

        var searchKw = that.data.searchKw;

        searchKw.push(kw)

        for (var i = 0; i < searchKw.length; i++) {
          if (searchKw.indexOf(searchKw[i]) != i) {
            searchKw.splice(i, 1);//删除数组元素后数组长度减1后面的元素前移
            i--;//数组下标回退
          }
        }
        wx.setStorageSync('kwArr', searchKw);

        that.setData({
          kwArr: searchKw
        })
        //console.log(wx.getStorageSync('kwArr'))
      }
    })
  },

  clearStorageKw: function () {
    wx.removeStorage({
      key: 'kwArr',
      success: function (res) { console.log(res) },
    })
    this.setData({
      kwArr: []
    })
  },

  //数量加函数
  numadd: function (e) {
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
      success: function (res) {
        console.log(res);
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
  numminus: function (e) {
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
        success: function (res) {
          console.log(res);
          that.data.goodsNum[idx].number = quantity,
          that.setData({
            totalNum: res.data.total_quantity,
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
        success: function (res) {
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
  showadd: function (e) {
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
      success: function (res) {
        console.log(res);
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
  onShowModal: function (e) {
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
  onHideModal: function () {
    this.baseModal.hideModal();
    this.setData({
      specActiveId: 0,
    });
  },

  // 规格切换
  specTabClick: function (e) {
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
  kindTabClick: function (e) {
    this.setData({
      kindActiveId: e.currentTarget.id,
      kindIdx: e.target.dataset.idx
    })
  },

  /**
   * 递减指定的商品数量
   */
  minusCount: function (e) {
    let _this = this,
      index = e.currentTarget.dataset.index,
      goods = _this.data.goods_list[index],
      order_total_price = _this.data.order_total_price,
      quantity = --goods.number;
  },


  /**
   * 页面上拉触底事件的处理函数
  */
  stopLoadMoreTiem: false,// 阻止多次触发 需要的变量
  // 滚动到底部
  lower: function () {
    var that = this;
    if (that.stopLoadMoreTiem) {
      return;
    }
    if (that.data.page == that.data.totalPage - 1) {
      //console.log(11)
      that.setData({
        nomore: true
      });
      return;
    } else if (that.data.page < that.data.totalPage - 1) {
      this.setData({
        page: that.data.page + 1  //上拉到底时将page+1后再调取列表接口
      });
      //console.log(that.data.kw);
      that.getList(that.data.kw, false);
    }

  },
})
