//index.js
//获取应用实例
const app = getApp()

Page({
  data:{
    navH: app.globalData.navHeight,
    userInfo:null,
    url:null,
  },
  bindGetuserInfo: function (e) {
    if (!e.detail.userInfo) {
      return;
    }
    var userInfo = e.detail.userInfo
    wx.login({
      success: res => {
        let code = res.code;
        if (code) {
          wx.request({
            url: app.globalData.api_url + '/wx_login/openid',
            data: {
              code: code,
              access_token: app.globalData.access_token
            },
            success: function (info) {
              //console.log(info);
              var openid = info.data;
              wx.request({
                url: app.globalData.api_url + '/wx_login/reg',
                data: {
                  open_id: openid,
                  sex: userInfo.gender,
                  nickName: userInfo.nickName,
                  avatarUrl: userInfo.avatarUrl,
                  access_token: app.globalData.access_token
                },
                success: function (res) {
                  if (res.data.code == 'success') {
                    app.globalData.token = res.data.token;
                    app.globalData.userInfo = userInfo;
                    wx.setStorageSync('token', res.data.token);
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success',
                      duration: 1000,
                      success: function () {
                        wx.reLaunch({
                          url: '/'+wx.getStorageSync('url'),
                        });
                      }
                    });
                    wx.setStorageSync('userInfo', userInfo);
                  } else {
                    wx.showToast({
                      title: res.data.msg,
                      icon: 'loading',
                      duration: 1000
                    })
                  }
                }
              })
            },
            fail: function (res) {
              console.log(res + '不成功');
            }
          })//request结束
        }
      }
    })
  }
})
