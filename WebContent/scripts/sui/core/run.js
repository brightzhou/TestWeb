/**
 * @fileOverview 本文件是mini UI框架的执行入口。当DOM准备完整之后自动开始执行mini UI 的解析工作。
 * @requires jQuery , mini.js, ua.js , Event.js, parse.js
 */
jQuery(function () {
	
    var sss = new Date();
    mini.isReady = true;	//这里的ready指mini的资源已经准备完成。
    mini.parse();			//执行解析HTML，创建组件，将组件与HTML标签绑定。
    mini._FireBindEvents();	//各个组件注册的初始化回调函数。
    
    if ((mini.getStyle(document.body, "overflow") == "hidden" || mini.getStyle(document.documentElement, "overflow") == "hidden")
        && (isIE6 || isIE7)) {
        
        jQuery(document.body).css("overflow", "visible");
        jQuery(document.documentElement).css("overflow", "visible");
    } 
    //获取文档的宽和高   
    mini.__LastWindowWidth = document.documentElement.clientWidth;
    mini.__LastWindowHeight = document.documentElement.clientHeight;

});

//针对IE的特殊内存优化
// http://www.cnblogs.com/jenry/archive/2011/02/11/1951240.html
if (isIE) {
    setInterval(function () {
        CollectGarbage();	
    }, 1000);
}