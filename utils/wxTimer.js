var wxTimer = function (initObj){
	initObj = initObj || {};
	this.beginTime = initObj.beginTime || "00:00:00";	//开始时间
	this.interval = initObj.interval || 0;				//间隔时间
	this.complete = initObj.complete;					//结束任务
	this.intervalFn = initObj.intervalFn;				//间隔任务
	this.name = initObj.name;							//当前计时器在计时器数组对象中的名字

	this.intervarID;									//计时ID
	this.endTime;										//结束时间
	this.endSystemTime;									//结束的系统时间
}

wxTimer.prototype = {
	//开始
	start:function(self){
		this.endTime = new Date(this.beginTime).getTime();//1970年1月1日的00：00：00的字符串日期
		this.endSystemTime = new Date(this.endTime);
	    var that = this;
	    //开始倒计时
	    var count = 0;//这个count在这里应该是表示s数，js中获得时间是ms，所以下面*1000都换成ms
	    function begin(){
        var now_time = new Date().getTime();       
        var sjc = (that.endTime - now_time - 1000)/1000;

        var day = Math.floor(sjc / 60 / 60 / 24) % 7;
        var hour = Math.floor(sjc / 60 / 60) % 24;

        if(hour<10){
          hour = "0" + hour.toString();
        }

        var min = Math.floor(sjc / 60) % 60;

        if (min < 10) {
          min = "0" + min.toString();
        }

        var s = Math.floor(sjc % 60);

        if (s < 10) {
          s = "0" + s.toString();
        }

        var r = "";

        r = day + '天' + hour + ':' + min + ':'+s;    
	     
        var tmpTimeStr = r;


			var wxTimerList = self.data.wxTimerList;

			//更新计时器数组
			wxTimerList[that.name] = {
				wxTimer:tmpTimeStr,
	     
			}

	        self.setData({
	            wxTimer:tmpTimeStr,	    
				      wxTimerList:wxTimerList
	        });
	        //时间间隔执行函数
	        if( 0 == (count-1) % that.interval && that.intervalFn){
	            that.intervalFn();
	        }
	        //结束执行函数
        if (sjc <= 0){
	            if(that.complete){
	                that.complete();
	            }
	            that.stop();
	        }
	    }
	    begin();
	    this.intervarID = setInterval(begin,1000);
	},
	//结束
	stop:function(){
		clearInterval(this.intervarID);
	},
	//校准
	calibration:function(){
		this.endTime = this.endSystemTime - Date.now();
	}
}

module.exports = wxTimer;
