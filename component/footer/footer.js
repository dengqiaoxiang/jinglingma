
//初始化数据
function tabbarinit() {
 return [
      { 
        "current":0,
        "pagePath": "/pages/index/index",
        "iconPath": "/images/nav/home.png",
        "selectedIconPath": "/images/nav/homeActive.png",
        "text": "首页"
      },
      {
        "current": 0,
        "pagePath": "/pages/score/index",
        "iconPath": "/images/nav/star.png",
        "selectedIconPath": "/images/nav/starActive.png",
        "text": "积分"
      },
      {
        "current": 0,
        "pagePath": "/pages/classify/index",
        "iconPath": "/images/nav/logo.png",
        "selectedIconPath": "/images/nav/logo.png",
        "text": "蔬果到家"
      },
      {
        "current": 0,
        "pagePath": "/pages/group/index",
        "iconPath": "/images/nav/group.png",
        "selectedIconPath": "/images/nav/groupActive.png",
        "text": "拼团"
      },
      {
        "current": 0,
        "pagePath": "/pages/user/index",
        "iconPath": "/images/nav/mine.png",
        "selectedIconPath": "/images/nav/mineActive.png",
        "text": "我的"
      }
    ]
}

/**
 * tabbar主入口
 * @param  {String} bindName 
 * @param  {[type]} id       [表示第几个tabbar，以0开始]
 * @param  {[type]} target   [当前对象]
 */
function tabbarmain(bindName = "tabdata", id, target) {
  var that = target;
  var bindData = {};
  var otabbar = tabbarinit();
  otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath']//换当前的icon
  otabbar[id]['current'] = 1;
  bindData[bindName] = otabbar
  that.setData({ bindData });
  // 获取底部tab高度  
}


module.exports = {
  tabbar: tabbarmain
}