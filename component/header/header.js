// component/header.js
const App = getApp();
Component({  
  options: {
    addGlobalClass: true,
  },
  /**   * 组件的属性列表   */  
  properties: { 
    title: { 
      type: "String", 
      value: ''
    },

    back: { 
      type: "String", 
      value: "", 
      observer: function observer(newval, oldval) { 
        if (newval == "") { 
          this.setData({ back: "", }) 
        } else { 
          console.log(newval)          
          console.log("newval")         
          this.setData({ back: newval, }) 
        } 
      } 
    }, 
    backbtn: {
      type: "Boolean",
      value: false 
    },
    boxsh: { 
      type: "Boolean", 
      value: false 
    } 
  },
  lifetimes: {
    attached: function () {
      this.setData({
        navH: App.globalData.navHeight
      })
    }
  },
  methods: { 
    goback: function () { 
      wx.navigateBack() 
    }, 
  }
})
