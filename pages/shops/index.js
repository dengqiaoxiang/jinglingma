//获取应用实例
const app = getApp()

Page({
  data: {
    navH: app.globalData.navHeight,
    array: ['佛山市', '广州市', '肇庆市', '深圳市'],
    cityName: 0,
    inputValue: '',
    shops:[1],
    distantArr: [],
    inShops: [],
    outShops: []
  },
  onLoad: function(){
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {

        //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        const latitude = res.latitude;
        const longitude = res.longitude;
        //console.log(latitude,longitude)

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
            //console.log(that.data.shops)
            var distantArr = [];
            var inShops = [];
            var outShops = [];
            var shops = res.data.data;
            for (var i = 0; i < shops.length; i++) {
              var distants = that.getDistance(latitude, longitude, shops[i].shop_latitude, shops[i].shop_longitude);
              distantArr.push(distants);
              distants < 3 ? inShops.push(distants) : outShops.push(distants)
            }
            that.setData({
              distantArr: distantArr,
              inShops: inShops,
              outShops: outShops
            })
            //console.log(distanceArr)
          },
          fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  // 计算两地距离
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
    var lastDistance = (parseInt(distance)/1000).toFixed(2)
    return lastDistance;
  },

  bindPickerChange: function (e) {
    this.setData({
      cityName: e.detail.value
    })
  },
  //搜索框文本内容显示
  inputBind: function (event) {
    this.setData({
      inputValue: event.detail.value
    })
    
  },
  /**
    * 搜索执行按钮
    */
  query: function (event) {

    var that = this

    /**
     * 提问帖子搜索API
     * keyword string 搜索关键词 ; 这里是 this.data.inputValue
     * start int 分页起始值 ; 这里是 0
     */
      var kw = that.data.inputValue.replace(/\s+/g, '');
      if (kw == '' || kw == undefined) {
        wx.showToast({
          title: '搜索词不能为空',
        })
        return
      }

    wx.request({
      url: app.globalData.api_url + '/wx_shop/search',
      data: {
        shopKw: kw,
        page: 0,
        pageSize: 10,
        token: app.globalData.access_token,
        access_token: app.globalData.access_token
      },
      method: 'GET',
      success: function (res) {

        var searchData = res.data.data;
        console.log(searchData)
        if (!searchData || searchData == undefined) {
          that.setData({
            arr: []
          });
        } else {
          that.setData({
            shops: searchData
          });
        }
      }
    })

  },
})

