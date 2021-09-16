//获取应用实例
const app = getApp()
Page({
  data:{
    navH: app.globalData.navHeight,
    userInfo:{}
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    });
    
  },
  onLoad: function(){
    var that = this;
    var token = wx.getStorageSync('token');
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        token: token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        that.setData({
          userInfo: res.data.userInfo
        })
      }
    })
    
  },
  formSubmit: function (e) {
    console.log(e)
    var value = e.detail.value
    var birthday =  
    wx.showLoading({
      title: '保存中..',
    })
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        nickname: value.uname,
        birthday: value.birthday,
        sex: value.sex,
        home_address: value.address,
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        //console.log(res);
       wx.navigateBack({});
      }
    })
    wx.hideLoading();
  }

})