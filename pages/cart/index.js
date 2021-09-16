//获取应用实例
const app = getApp()

Page({
  data: {
    navH: app.globalData.navHeight,
    tabH: null,
    botH: null,
    allselected: true,
    allnum: 0,
    allprices: 0,
    cartsdata: [1], 
    shopStatus:[], //店铺状态
    shopnum: [], // 门店总价
    siteArr: [], //地址列表
    siteId: 0
  },
  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
    var that = this;
    //获得easyModal
    that.baseModal = this.selectComponent("#baseModal");
  },
  /**   * 生命周期函数--监听页面加载   */
  onLoad: function (options) {
    
    //获取购物车信息  },  
    /**   * 生命周期函数--监听页面初次渲染完成   */
    var that = this;

   
  },
  /**   * 生命周期函数--监听页面显示   */
  onShow: function () {
    var that = this;
    // 地址列表
    that.getAddress();

    wx.request({
      url: app.globalData.api_url + '/wx_cart/my_cart',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res)
        var list = res.data.goods_list;
        // 门店状态
        var shopStatus = [];
        for (var i = 0; i < list.length; i++) {
          shopStatus.push(true);
          for (var j = 2; j < list[i].length; j++) {
            if (list[i][j].select == false) {
              shopStatus.splice(i, 1, false);
            }
          }
        }
        // 总价
        var shopnum = [];
        for (var i = 0; i < list.length; i++) {
          shopnum.push(0)
          var allprices = 0
          let allnum = 0;
          var goodsinfo = list[i];
          for (var a = 2; a < goodsinfo.length; a++) {
            if (goodsinfo[a].select) {
              //当前商品价格*数量 +          
              let price = Number(goodsinfo[a].price);
              let num = parseInt(goodsinfo[a].number); //防止num为字符 *1或parseInt Number          
              allprices += price * num
              allnum += num
            }
          }
          shopnum[i] = allprices.toFixed(2);
        }
        that.setData({
          cartsdata: list,
          shopStatus: shopStatus,
          shopnum: shopnum
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  /**   * 生命周期函数--监听页面隐藏   */
  onHide: function () {  },
  /**   * 生命周期函数--监听页面卸载   */
  onUnload: function () {  },
  /**   * 页面相关事件处理函数--监听用户下拉动作   */
  onPullDownRefresh: function () {  },
  /**   * 页面上拉触底事件的处理函数   */
  onReachBottom: function () {  },
  /**   * 用户点击右上角分享   */
  onShareAppMessage: function () {  },
  //计算总价格  所有选中商品的 （价格*数量）相加  
  getallprices: function (idx) {
    var that = this;
    var cartsdata = this.data.cartsdata //购物车数据    
    var allprices = 0
    let allnum = 0
    var shopnum = that.data.shopnum
      // console.log()      
    var goodsinfo = cartsdata[idx]
    for (var a = 2; a < goodsinfo.length; a++) {
      if (goodsinfo[a].select) {
          //当前商品价格*数量 +          
        let price = Number(goodsinfo[a].price);
        let num = parseInt(goodsinfo[a].number); //防止num为字符 *1或parseInt Number          
        allprices += price * num;
        allnum += num;
      }
     
    }
    if (allprices != undefined){
      shopnum[idx] = allprices.toFixed(2);
    }
    that.setData({
      shopnum: shopnum
    })
  },
 
  // 删除商店
  deletestore: function(e){
    var that = this;
    var cartsdata = that.data.cartsdata //购物车数据
    var storeid = e.currentTarget.dataset.storeid;
    let idx = e.currentTarget.dataset.index //当前商品所在店铺中的下标 
    wx.showModal({
      title: '提示',
      content: '是否移除该商店',
      success(res) {
        if (res.confirm) {
          //发送请求
          wx.request({
            url: app.globalData.api_url + '/wx_cart/del_stores',
            data: {
              stores_id: storeid,
              token: app.globalData.token,
              access_token: app.globalData.access_token,
            },
            success: function (res) {
              var newCart = cartsdata.splice(idx,1);
              that.setData({
                cartsdata: cartsdata
              });
            }
          })
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    });
    return;
  },
  // 店铺的选中  
  storeselected: function (e) {
    var that = this;
    var cartsdata = that.data.cartsdata //购物车数据  
    var shopStatus = that.data.shopStatus; //店铺状态
    var storeid = e.currentTarget.dataset.storeid;   
    let index = e.currentTarget.dataset.index //当前店铺下标    
    var thisstoredata = shopStatus[index] //当前店铺商品数据 
   
    //改变当前店铺状态    
    if (shopStatus[index]) {
      shopStatus[index] = 0;
      //改变当前店铺所有商品状态      
      for (var i = 2; i < cartsdata[index].length; i++) {
        cartsdata[index][i].select = false;
      }
    } else {
      shopStatus[index] = 1;    //改变当前店铺所有商品状态      
      for (var i = 2; i < cartsdata[index].length; i++) {
        cartsdata[index][i].select = true
      }
    }


    // 门店状态传数据库
    that.shopstaus(storeid,shopStatus[index]);
    // 
    that.setData({
      cartsdata: cartsdata, //店铺下商品的数量
      shopStatus: shopStatus
    })
    that.getallprices(index);
    //this.allallprices(index);
  },

  // 
  shopstaus: function (storeid,status){
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_cart/allcart',
      data: {
        shop_id: storeid,
        select: status,
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
        console.log(res)
      }
    })
  },

 
  // 商品的选中  
  goodsselected: function (e) {
    var that = this;
    var cartsdata = that.data.cartsdata //购物车数据
    var shopStatus = that.data.shopStatus; //店铺状态
    let cartid = e.currentTarget.dataset.cartid; // 购物车id   
    let index = e.currentTarget.dataset.index //当前商品所在店铺中的下标    
    let idx = e.currentTarget.dataset.selectIndex //当前店铺下标    
    let cai = cartsdata[idx][index]; //当前商品的店铺某项      
    if (cai.select) {
      cai.select = 0; //点击后当前店铺下当前商品的状态      
      shopStatus[idx] = false;
      that.updateGood(cartid, cai.number, cai.select, idx, index);
    } else {
      cai.select = 1 //点击后当前店铺下当前商品的状态     
      that.updateGood(cartid, cai.number, cai.select, idx, index); 
      //当店铺选中商品数量与店铺总数量相等时 改变店铺状态      
      var storegoodsleg = cartsdata[idx].length - 2;
      var goodsinfo = cartsdata[idx];
      var selectedleg = 0;
      for (var i = 2;i < goodsinfo.length; i++) {
        if (goodsinfo[i].select == true) {
          selectedleg++
        }
      }
      //console.log(storegoodsleg, selectedleg)
      if (storegoodsleg == selectedleg) {
        shopStatus[idx] = true
      }
      
    }
    // 更新    
    that.setData({
      cartsdata: cartsdata, //店铺下商品的数量
      shopStatus: shopStatus, 
    })
    that.getallprices(idx);
    //this.allallprices(idx);
  },
  // 点击+号，num加1，点击-号，如果num > 1，则减1  
  addCount: function (e) {
    var that = this;
    var cartsdata = that.data.cartsdata //购物车数据    
    let index = e.currentTarget.dataset.index //当前商品所在店铺中的下标    
    let idx = e.currentTarget.dataset.selectIndex //当前店铺下标
    let cartid = e.currentTarget.dataset.cartid; // 购物车id
    let cai = cartsdata[idx]; //当前商品的店铺data.goodsinfo    
    let curt = cai[index]; //当前商品数组    
    var num = curt.number; //当前商品的数量    
    num++;
    //cartsdata[idx][index].number = num //点击后当前店铺下当前商品的数量 
    // 购物车更新

    that.updateGood(cartid, num, curt.select, idx, index);
  },
  minusCount: function (e) {
    //console.log(e)
    var that = this;
    var cartsdata = that.data.cartsdata //购物车数据    
    let index = e.currentTarget.dataset.index //当前商品所在店铺中的下标    
    let idx = e.currentTarget.dataset.selectIndex //当前店铺下标
    let cartid = e.currentTarget.dataset.cartid; // 购物车id
    let cai = cartsdata[idx]; //当前商品的店铺data.goodsinfo    
    let curt = cai[index]; //当前商品数组 
    var num = curt.number; //当前商品的数量
    num--;
    //cartsdata[idx][index].number = num //点击后当前店铺下当前商品的数量 
    if (num >= 1) {
      // 购物车更新
      that.updateGood(cartid, num, curt.select, idx, index);
    } else {
      wx.showModal({
        title: '提示',
        content: '是否移除该商品',
        success(res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.api_url + '/wx_cart/remove',
              data: {
                cart_id: cartid,
                token: app.globalData.token,
                access_token: app.globalData.access_token,
              },
              success: function (res) {
                console.log(res)
                var newCart = cartsdata[idx].splice(index,1);
                //console.log(newCart.splice(index,0))
                that.setData({
                  ['cartsdata[' + idx + ']']: cartsdata[idx]
                });
                that.getallprices(idx);
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      });
    }
      
  },

  // 更新购物车
  updateGood: function (cartid, num, select, idx, index){
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_cart/update',
      data: {
        cart_id: cartid,
        quantity: num,
        select: select,
        token: app.globalData.token,
        access_token: app.globalData.access_token,
      },
      success: function (res) {
        that.setData({
          ['cartsdata[' + idx + '][' + index + '].number']: num, //店铺下商品的数量
        })
        that.getallprices(idx);
      }
    })
   
  },

  onShowModal:function(e){
    this.baseModal.showModal();
  },
  // 获取地址
  getAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_user/address_list',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        //console.log(res.data.data)
        that.setData({
          siteArr: res.data.data
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        //console.log(res);
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
  tip: function(e){
    var that = this;
    var allprices = e.currentTarget.dataset.price;
    var siteArr = that.data.siteArr;
    if (allprices<=0){
      wx.showModal({
        title: '提示',
        content: '请选择购买的产品',
      })
    }
    if (!siteArr){
      wx.showModal({
        title: '提示',
        content: '去添加收货地址',
        success: function(res){
          if(res.confirm){
            wx.navigateTo({
              url: '/pages/addAddress/index',
            })
          }else{

          }
        }
      })
    }
  },
  checked: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    wx.request({
      url: app.globalData.api_url + '/wx_user/update_address',
      data: {
        id: id,
        isDefault: true,
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res)
        that.setData({
          siteId: id,
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  toPay: function(e){
    var storeid = e.currentTarget.dataset.storeid;
    wx.showLoading({
      title: '结算中..',
    })
    wx.navigateTo({
      url: '/pages/buy/index?storeid=' + storeid,
    })
    wx.hideLoading()
  }

})

