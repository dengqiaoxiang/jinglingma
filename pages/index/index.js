//index.js
//获取应用实例
const app = getApp();
var template = require('../../component/footer/footer.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

Page({
  data: {
    navH: app.globalData.navHeight,
    tabH: null,
    banners: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    swiperCurrent: 0,
    mallname:wx.getStorageSync('mallName'),
    userInfo: {},
  },
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toClassifyPage: function () {
    wx.navigateTo({
      url: '../classify/index',
      success: function (res) {
        // success 
      },
      fail: function () {
        // fail 
      },
      complete: function () {
        // complete 
      }
    })
  }, 
  onReady: function () {
    template.tabbar("tabBar", 0, this);//0表示第一个tabbar
  },
  onLoad:function(){
    var that = this;
    if (app.globalData.userInfo){
      var query = wx.createSelectorQuery();
      //选择id

      query.select('.tabBar').boundingClientRect(function (rect) {
        that.setData({
          tabH: rect.height + 'px'
        });
        app.globalData.tabHeight = rect.height + 'px';
      }).exec();

      // 轮播广告
      wx.request({
        url: app.globalData.api_url + '/wx_banner/lists',
        data: {
          access_token: app.globalData.access_token
        },
        success: function (res) {
          if (res.data.code == 404) {
            wx.showModal({
              title: '提示',
              content: '请在后台添加 banner 轮播图片',
              showCancel: false
            })
          } else {
            that.setData({
              banners: res.data.data
            });
            that.user();
          }
        }
      });
      wx.removeStorage({
        key: 'shop_id',
        success: function (res) { console.log(res) },
      })
    }
    qqmapsdk = new QQMapWX({
      key: 'USWBZ-ASKKV-3PCPV-UCDWN-6DYIF-RDBRO'
    });
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        // 1、授权成功
        that.setData({
          locAuthorize: true,
        })
        //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        const latitude = res.latitude;
        const longitude = res.longitude;

        //3、取出最近距离
        //console.log(id);


          wx.request({
            url: app.globalData.api_url + '/wx_shop/lists',
            data: {
              token: app.globalData.token,
              access_token: app.globalData.access_token
            },
            success: function (res) {
              //console.log(res.data)
              that.setData({
                shops: res.data.data
              })
              var distantArr = [];
              var shops = res.data.data;
              for (var i = 0; i < shops.length; i++) {
                var distants = that.getDistance(latitude, longitude, shops[i].shop_latitude, shops[i].shop_longitude);
                distantArr.push(distants);
              }
              var idx = 0;
              var min = Math.min.apply(Math, distantArr);
              console.log(min);
              for (var i = 1; i < distantArr.length; i++) {
                //console.log(distantArr[i])
                if (min == distantArr[i]) {
                  idx = i;
                }
              }
              that.setData({
                shopDistant: min,
                shopMsg: shops[idx]
              })
              wx.setStorage({
                key: 'shop_id',
                data: shops[idx].shop_id,
              })
            },
            fail: function (res) {
              console.log(res)
            }
          })
        
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            that.setData({
              currentSite: address,
            })
          }
        })
      },
      fail: function (res) {
        that.setData({
          locAuthorize: false
        });
        return;
      }
    })
  },
  // 计算距离函数
  getDistance: function (lat1, lng1, lat2, lng2) {
    lat1 = lat1 || 0;
    lng1 = lng1 || 0;
    lat2 = lat2 || 0;
    lng2 = lng2 || 0;

    var rad1 = lat1 * Math.PI / 180.0;
    var rad2 = lat2 * Math.PI / 180.0;
    var a = rad1 - rad2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

    var r = 6378137;
    var distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));

    /*if (distance > 1000){
      distance = Math.round(distance / 1000);
    }*/
    var lastDistance = (parseInt(distance) / 1000).toFixed(2)
    return lastDistance;
  },
  user: function(){
    if (app.globalData.userInfo != null) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  }
})