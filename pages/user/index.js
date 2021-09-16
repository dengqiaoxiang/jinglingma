//获取应用实例
const app = getApp()
var template = require('../../component/footer/footer.js');

Page({
  data: {
    navH: app.globalData.navHeight,
    tabH: null,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    inputVal: '',
  },
  onReady:function(){
    this.baseModal = this.selectComponent("#baseModal");
    this.easyModal = this.selectComponent("#easyModal");
    template.tabbar("tabBar", 4, this)//0表示第一个tabbar
  },
  onLoad: function () { 
    var that = this;
    that.setData({
      tabH: app.globalData.tabHeight
    })
  
 
  },
  onShow: function(){
    this.getUserMsg();
  },
  getUserMsg: function(){
    var that = this;
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
  
  
  getPhoneNumber(e) {
    //console.log(e.detail.errMsg)
    //console.log(e.detail.iv)
   // console.log(e.detail.encryptedData)
    var that = this;
    wx.login({
      success: res => {
        let code = res.code;
        if (code) {
              wx.request({
                url: app.globalData.api_url + '/wx_notify/entelephone',
                method: 'POST',
                data: {
                  'code': code,
                  'encryptedData': e.detail.encryptedData,
                  'iv': e.detail.iv,
                  token: app.globalData.token,
                  access_token: app.globalData.access_token
                },
                //method: 'GET',
                header: {
                  'content-type': 'application/json'
                }, // 设置请求的 header
                success: function (res) {
                  console.log(res);
                  if (res.data.phoneNumber) {//我后台设置的返回值为1是正确
                    //存入缓存即可
                    that.baseModal.hideModal();
                    wx.request({
                      url: app.globalData.api_url + '/wx_user/detail',
                      data: {
                        update: true,
                        telephone: res.data.phoneNumber,
                        token: app.globalData.token,
                        access_token: app.globalData.access_token
                      },
                      success: function (res){
                        that.getUserMsg();
                      }
                    })
                  }
                },
                fail: function (err) {
                  console.log(err);
                }
              })

          //   },
          //   fail: function (res) {
          //     console.log(res + '不成功');
          //   }
          // })//request结束
        }
      }
    })
 
      
  },
  onShowModal: function(e){
    let type = e.currentTarget.dataset.type;
    // console.log(type);
    if (type == 'getTel') {
      this.baseModal.showModal();
    }
    if (type == 'recharge') {
      this.easyModal.showModal();
    }
  },
  money: function (event){
    this.setData({
      inputVal: event.detail.value
    })
  },
  recharge:function(){
    var that = this;
    var inputVal = that.data.inputVal;
    var predeposit = that.data.userInfo.predeposit;
    if (inputVal == ''){
      wx.showToast({
        title: '请输入金额',
        image: '/images/err.png',
        duration: 1000
      })
      return;
    }
    if (inputVal <= 0) {
      wx.showToast({
        title: '最少充值0.01元',
        image: '/images/err.png',
        duration: 1000
      })
      return;
    }
    var MoneyReg = /^\d+(\.\d{1,2})?$/;
    if (!MoneyReg.test(inputVal)){
      wx.showToast({
        title: '请正确输入金额',
        image: '/images/err.png',
        duration: 1000
      })
      return;
    }

    wx.request({
      url: app.globalData.api_url + '/wx_notify/pay_order',
      data: {
        pay_fee: inputVal,
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        that.easyModal.hideModal();
        //console.log(res);
        wx.requestPayment({
          timeStamp: res.data.data.timestamp,
          nonceStr: res.data.data.nonceStr,
          package: 'prepay_id=' + res.data.data.prepay_id,
          signType: 'MD5',
          paySign: res.data.data.paySign,
          fail: function (res) {
            //console.log(res.errMsg);
            wx.showToast({
              title: '支付失败',
              image: '/images/err.png',
              duration: 1000
            })
          },
          success: function (res) {
            console.log(res)
            if (res.errMsg == "requestPayment:ok") {  
              // 调用支付成功
              wx.showToast({
                title: '支付成功',
              })
              wx.request({
                url: app.globalData.api_url + '/wx_pay/prepare_temple_msg',
                data: {
                  predeposit: inputVal,
                  payType: '',
                  prepay_id: 0,
                  order_common_no_id: 0,
                  token: app.globalData.token,
                  access_token: app.globalData.access_token
                },
                success: function (res) {
                  if (res.data.code == 'success'){
                    that.getUserMsg();
                  }else{
                    wx.showToast({
                      title: res.data.msg,
                      image: '/images/err.png',
                      duration: 1000
                    })
                  }
                },
              })
            }
          }
        })
      },
      fail: function(){

      }
    })
    
   
  }
  
})

