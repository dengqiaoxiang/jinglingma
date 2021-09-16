//获取应用实例
const app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({
  data: {
    navH: app.globalData.navHeight,
    botH: null,
    array: ['佛山市', '广州市', '肇庆市', '深圳市'],
    cityName: 0,
    inputValue: '',
    currentSite: '',
    nearKw: '',
    siteId: null,
    siteArr:[1],
    nearSite: [],
    searchArr: []
  },
  onReady: function(){},
  onLoad: function(){
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.add-site').boundingClientRect(function (rect) {
      that.setData({
        botH: rect.height + 'px'
      });
    }).exec();

    that.getAddress();
  
  },
  onShow() { 
    //返回显示页面状态函数
    var that = this;
    this.getAddress();
  },
  getAddress: function(){
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
  },

  del: function(e){
    var that = this;
    var id = e.currentTarget.id;
    var index = e.currentTarget.dataset.index;
    console.log(index);
    wx.showModal({
      title: '提示',
      content: '确定删除该地址',
      success:function(res){
        if (res.confirm){
          wx.request({
            url: app.globalData.api_url + '/wx_user/delete_address',
            data: {
              id: id,
              token: app.globalData.token,
              access_token: app.globalData.access_token
            },
            success: function (res) {
              //console.log(res);
              var newsiteArr = that.data.siteArr.splice(index,1);
              //console.log(newsiteArr);
              that.setData({
                siteArr: that.data.siteArr
              })
            },
            fail: function (res) {
              console.log(res)
            }
          })
        }
      }
    })
    
  },
  edit: function(e){
    var that = this;
    var id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/addAddress/index?id='+id,
    })
  }


})

