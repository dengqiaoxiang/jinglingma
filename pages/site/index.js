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
  onReady: function(){
    var that = this;
    that.getSite();
  },
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
  onShow: function(){
    var that =  this;
    that.getAddress();
  },

  // 获取地址
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
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
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

  // 定位
  getSite: function(){
    var that = this;
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'USWBZ-ASKKV-3PCPV-UCDWN-6DYIF-RDBRO'
    });
    //1、获取当前位置坐标
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        const latitude = res.latitude
        const longitude = res.longitude
        //console.log(latitude, longitude)
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            var nearKw = addressRes.result.address_component.street;
            that.setData({
              currentSite: address,
              nearKw: nearKw
            })
            qqmapsdk.search({
              keyword: nearKw,
              success: function (res) {
                that.setData({
                  nearSite: res.data
                })
              },
              fail: function (res) {
                console.log(res);
              },
              complete: function (res) {
                //console.log(res);
              }
            });
          }
        })
      }
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      cityName: e.detail.value
    })
  },
  //搜索框文本内容显示
  inputBind: function (event) {
    var that = this;
    that.setData({
      inputValue: event.detail.value
    });
    qqmapsdk = new QQMapWX({
      key: 'USWBZ-ASKKV-3PCPV-UCDWN-6DYIF-RDBRO'
    });
    qqmapsdk.search({
      keyword: event.detail.value,
      success: function (res) {
        that.setData({
          searchArr: res.data
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        that.setData({
          searchArr: res.data
        })
        console.log(res);
      }
    });
  },
  // 清理关键字
  clearKw: function () {
    this.setData({
      inputValue: ''
    })
  },
  // 重新定位
  resetSite: function(){
    this.getSite();
  },
  // 选择地址
  checked: function(e){
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
 


})

