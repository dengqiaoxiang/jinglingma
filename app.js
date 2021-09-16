//app.js
App({
 
  onLaunch: function () {
    var that = this;
 
    //  获取商城名称
    wx.request({
      url: that.globalData.api_url + '/wx_config/get_config',
      data: {
        key: 'SITE_TITLE',
        access_token: that.globalData.access_token
      },
      success: function (res) {
        console.log(wx.getStorageSync('url'));
        if (res.data.code == 'success') {
          wx.setStorageSync('mallName', res.data.value);
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    });
    wx.getSystemInfo({
      success: res => {
        //导航高度
        this.globalData.navHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    });
    this.login();   
  },
  getUserInfo: function (cb) {
    var that = this;
    var token = wx.getStorageSync('token');
    if (that.globalData.userInfo) {
      typeof cb == "function" && cb(that.globalData.userInfo) 
    } else {
      wx.request({
        url: that.globalData.api_url + '/wx_user/detail',
        data: {
          token: token,
          access_token: that.globalData.access_token
        },
        success: function (res) {
          //console.log(res.data.userInfo)
          if (res.data.userInfo){
            that.globalData.userInfo = res.data.userInfo
            typeof cb == "function" && cb(that.globalData.userInfo)
            wx.reLaunch({
              url: '/pages/index/index',
            });
          } else {
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            var url = currentPage.route;
            // var options = currentPage.options;
            // console.log(options);
            wx.setStorageSync('url', url)
            wx.reLaunch({
              url: '/pages/authorize/index',
            });
          }
        }
      })
    } 
  },
  login: function () {
    var that = this;
    var token = wx.getStorageSync('token');
    that.globalData.token = token;
    if (token) {
      wx.request({
        url: that.globalData.api_url + '/wx_login/check_token',
        data: {
          token: token,
          access_token: that.globalData.access_token
        },
        success: function (res) {
          if (res.data.code != 'success') {
            that.globalData.token = null;
          }
        }
      })
    }
    wx.login({
      success: function (res) {
      
        wx.request({
          url: that.globalData.api_url + '/wx_login/auto_login',
          data: {
            code: res.code,
            access_token: that.globalData.access_token
          },
          success: function (res) {
            //console.log(res)
            if (res.data.code == 'success') {
              that.globalData.token = res.data.data.token;
              that.globalData.uid = res.data.data.uid;
              wx.setStorageSync('token', res.data.data.token);
              that.getUserInfo();
            }else{
              that.getUserInfo();
            }
          }
        })
      }
    })
  },
  globalData: {
    userInfo: null,
    uid: null,
    shop_id: 1,
    token: null,
    api_url: "https://jzscnet.foshanhaozhan.com/v1",
    access_token: 'l073zmwv32jw6pk28njo',
    version: "1.0",
    shareProfile: '精灵妈生鲜配送专家', // 首页转发的时候话术
    navHeight: null,
    tabHeight: null
  },

})
