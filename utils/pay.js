function wxpay(app, order_common_no_id, redirectUrl, payType, buyType,) {
  let remark = "在线充值";
  let nextAction = {};
  if (order_common_no_id != 0) {
    remark = "支付订单 ：" + order_common_no_id;
    nextAction = { type: 0, id: order_common_no_id };
  }

  var postData = {
      token:app.globalData.token,    
      access_token: app.globalData.access_token,
      order_common_no_id: order_common_no_id
  };

  if(payType=='re_pay'){
     postData.re_pay = 1;
     postData.order_id=order_common_no_id;
  }


  wx.request({
    url:  app.globalData.api_url + '/wx_pay/get_pay_data',
    data: postData,
    method:'POST',
    success: function(res){
      if(res.data.code =='success'){
        var order_no = res.data.data.order_no;
        // 发起支付
        wx.requestPayment({
          timeStamp:res.data.data.timestamp,
          nonceStr:res.data.data.nonceStr,
          package:'prepay_id=' + res.data.data.prepay_id,
          signType:'MD5',
          paySign:res.data.data.paySign,
          fail:function (aaa) {
            wx.showModal({
              title: '提示',
              content:'支付失败',
              showCancel: false
		        });
            if (buyType != 3 || buyType != 4) {
              wx.redirectTo({
                url: redirectUrl
              });
            }
          },
          success:function () {
            console.log(redirectUrl);
          	//支付成功          	 
            wx.redirectTo({
              url: redirectUrl
            });
          
              wx.request({
                url: app.globalData.api_url + '/wx_pay/prepare_temple_msg',
                data: {
                  token: app.globalData.token,
                  access_token: app.globalData.access_token,
                  order_no: order_no,
                  order_common_no_id: order_common_no_id,
                  prepay_id: res.data.data.prepay_id,
                  payType: payType
                },
                success: function (res) {
                  console.log(res);
                }
              });
          }
        })
        if (buyType != 3 || buyType !=4){
          wx.request({
            url: app.globalData.api_url + '/wx_pay/prepare_temple_msg',
            data: {
              token: app.globalData.token,
              access_token: app.globalData.access_token,
              order_common_no_id: order_common_no_id,
              prepay_id: res.data.data.prepay_id,
              payType: payType
            },
            success: function (res) {
              console.log(res);
            }
          });
          
        }

      } else {
        wx.showToast({ title:res.data.msg})
      }
    }
  })
}

module.exports = {
  wxpay: wxpay
}
