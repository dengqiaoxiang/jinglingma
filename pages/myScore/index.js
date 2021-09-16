//获取应用实例
const app = getApp()
Page({
  data:{
    navH: app.globalData.navHeight,
    topH: null,
    points: [],
    page: 0,
  },
  onLoad:function(option){
    var score = option.points;
    this.setData({
      score: score
    })
  },
  onShow() {
    this.getMyPoints();
  },

  getMyPoints: function () {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_points/my_points',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 'success') {
            that.setData({
              points: res.data.data
            });
        }
      }
    })

  },
  toScore: function(){
    wx.reLaunch({
      url: '/pages/score/index',
    })
  }
})