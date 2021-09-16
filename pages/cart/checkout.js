var wxpay = require('../../utils/pay.js')
//获取应用实例
var app = getApp()

Page({
  data: {
    navH: app.globalData.navHeight,
    goodsList:[],
    allPrice:0,//商品价格+运费
    order_common_no_id:''
  },
  onShow : function () {
    var that = this;
   
     wx.request({
        url: app.globalData.api_url +'/wx_cart/checkout',
        data: {       
          token: app.globalData.token,
          access_token: app.globalData.access_token,
        },
        success: function(res) {
          console.log(res);
          if (res.data.code == 'success') {
            that.setData({
               goodsList: res.data.goods_list,   
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
    
    that.initShippingAddress();
  },

  onLoad: function (e) {
    
  },

  createOrder:function (e) {
    wx.showLoading();
    var that = this;
 	  var redirectUrl="/pages/order-list/index";
 	
 	
 	if(that.data.order_common_no_id!=''){ 	
     		redirectUrl="/pages/order-list/index"; 		
	      wx.hideLoading();
	      wxpay.wxpay(app, that.data.order_common_no_id, redirectUrl,'pay');
    }else{    

        var postData = {
          token: app.globalData.token,
          access_token: app.globalData.access_token,       
          remark: e.detail.value
        };
       
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
        
       // console.log(postData);

        wx.request({
          url: app.globalData.api_url +'/wx_cart/create',
          method:'POST',         
          data: postData, // 设置请求的 参数
          success: (r) =>{
            wx.hideLoading();
                if (r.data.code != 'success') {
                    wx.showLoading({title: r.data.msg})
                    return;
                } else {
                  wx.setStorage({
                    key: "cartNum",
                    data: 0
                  })
                    that.data.order_common_no_id = r.data.order_common_no_id;
                    //购物车或者立即购买            
                    redirectUrl="/pages/order-list/index";                     
                    wxpay.wxpay(app, r.data.order_common_no_id,redirectUrl,'pay');
                }
            }
        })
		  
    }
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url +'/wx_user/default_address',
      data: {
        token:app.globalData.token,
        access_token:app.globalData.access_token
      },
      success: (res) =>{
        if (res.data.code == 'success') {
          that.setData({
            curAddressData:res.data.data
          });
        }else{
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
    
      }
    })
  },
 
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/select-address/index"
    })
  },
  
 
})
