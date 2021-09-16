//index.js
//获取应用实例
const app = getApp()
var template = require('../../component/footer/footer.js');

Page({
  data: {
    navH: app.globalData.navHeight, // tar高度
    tabH: null,
    topH: null,
    points: [],
    page:0,
    lists:[],
    nomore:false,
    totalPage: 0,
  },
  onReady: function(){
    template.tabbar("tabBar", 1, this)//0表示第一个tabbar
  },
  onLoad: function () {
    var that = this;
    that.setData({
      tabH: app.globalData.tabHeight
    })
    var query = wx.createSelectorQuery();
    query.select('.sbanner').boundingClientRect(function (rect) {
      console.log(rect);
      that.setData({
        topH: rect.height + 'px'
      });
    }).exec();
    that.getLists();
  },
  onShow() {
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_user/detail',
      data: {
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        //console.log(res.data.userInfo)
        that.setData({
          userInfo: res.data.userInfo
        })
      }
    })
  },
  getLists: function(){
    var that = this;
    wx.request({
      url: app.globalData.api_url + '/wx_goods/lists',
      data: {
        goods_type: 3,
        page: that.data.page,
        pageSize: 10,
        token: app.globalData.token,
        access_token: app.globalData.access_token
      },
      success: function (res) {
        console.log(res)
        var pages = res.data.pages;
        var data = res.data.data;
        that.setData({
          totalPage: pages.last_page
        })
        if (that.data.page == 0) {
          that.setData({
            lists: data
          })
          if (data.length < 10) {
            that.setData({
              nomore: true,
            });
          }
        } else {
          var newData = that.data.lists.concat(data);
          that.setData({
            lists: newData
          });
        }
       
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  
  stopLoadMoreTiem: false,// 阻止多次触发 需要的变量
  // 滚动到底部
  lower: function () {
    var that = this;
    if (that.stopLoadMoreTiem) {
      return;
    }
    //console.log(that.data.page, that.data.totalPage)
    if (that.data.page == that.data.totalPage - 1) {
      //console.log(11)
      that.setData({
        nomore: true
      });
      return;
    } else if (that.data.page < that.data.totalPage - 1) {
      this.setData({
        page: that.data.page + 1  //上拉到底时将page+1后再调取列表接口
      });
      that.getLists();
    }
  },
})
