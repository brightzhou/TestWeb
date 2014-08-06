/**
 * @fileOverview miniDefaultEvent.js文件中包含所有mini UI 框架给resize / onload / unload绑定的默认响应函数定义和绑定工作。
 * @requires Event.js
 */

mini = mini || {};

//为window添加 resize事件响应。
mini.on(window, "resize", function (e) {
    var events = mini.__windowResizes;
    for (var i = 0, l = events.length; i < l; i++) {
        var event = events[i];
        event[0].call(event[1], e);
    }
});

/**
 * resize内延时执行函数的延时Id
 * @default null
 */
mini.doWindowResizeTimer = null;
/**
 * mini UI默认视图调整函数。
 * @private
 */
mini_onresize = function (e) {
    if (mini.doWindowResizeTimer) {
        clearTimeout(mini.doWindowResizeTimer);
    }
    mini.WindowVisible = mini.isWindowDisplay();

    if (mini.WindowVisible == false || mini.allowLayout == false) return;
	
	
	 //为了兼容Ext
    if (typeof Ext != "undefined") {
        mini.doWindowResizeTimer = setTimeout(function () {
            var __LastWindowWidth = document.documentElement.clientWidth;
            var __LastWindowHeight = document.documentElement.clientHeight;
            if (mini.__LastWindowWidth == __LastWindowWidth && mini.__LastWindowHeight == __LastWindowHeight) {
            } else {
                mini.__LastWindowWidth = __LastWindowWidth;
                mini.__LastWindowHeight = __LastWindowHeight;
                mini.layout(null, false);
            }
            mini.doWindowResizeTimer = null;
        }, 300);
    } else {
        var deferTime = 100;
        try {
            if (parent && parent != window && parent.mini) {
                deferTime = 0;
            }
        } catch (ex) {
        }
        mini.doWindowResizeTimer = setTimeout(function () {
            var __LastWindowWidth = document.documentElement.clientWidth;
            var __LastWindowHeight = document.documentElement.clientHeight;
            
            if (mini.__LastWindowWidth == __LastWindowWidth && mini.__LastWindowHeight == __LastWindowHeight) {
            } else {
                mini.__LastWindowWidth = __LastWindowWidth;
                mini.__LastWindowHeight = __LastWindowHeight;
                mini.layout(null, false);
            }
            mini.doWindowResizeTimer = null;
        }, deferTime);
    }
}

/**
 * 默认onload事件。这里有一个疑问，resize的添加方式有些跟之前的策略相驳。
 * @private
 */
mini_onload = function (e) {
    mini.layout(null, false);
    mini.on(window, "resize", mini_onresize);
    
}

//为window添加默认的load事件响应
mini.on(window, "load", mini_onload);

/**
 * mini UI默認的析构处理
 * @private
 */
mini_unload = function (e) {
    try {
        var win = mini._getTopWindow();
        win[mini._WindowID] = '';
        delete win[mini._WindowID];
    } catch (ex) {

    }

    var iframes = document.body.getElementsByTagName("iframe");
    if (iframes.length > 0) {
        var IFrames = [];
        for (var i = 0, l = iframes.length; i < l; i++) {
            IFrames.push(iframes[i]);
        }
        for (var i = 0, l = IFrames.length; i < l; i++) {
            try {
                var iframe = IFrames[i];
                iframe._ondestroy = null;
                iframe.src = "";
                try {
                    iframe.contentWindow.document.write("");
                    iframe.contentWindow.document.close();
                } catch (ex) { }
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            } catch (e) { }
        }

    }

    var cs = mini.getComponents();
    for (var i = 0, l = cs.length; i < l; i++) {
        var control = cs[i];
        if (control.destroyed !== true) {
            control.destroy(false);
        }
    }


    cs.length = 0;
    cs = null;
   
    mini.un(window, "unload", mini_unload);
    mini.un(window, "load", mini_onload);
    mini.un(window, "resize", mini_onresize);
    mini.clearEvent(window);
    mini.clearEvent(document);

    mini.components = {};
    mini.classes = {};
    mini.uiClasses = {};
    mini.uids = {};

    mini._topWindow = null;
    //解决IE部分版本下框架iframe（非miniUI内部）需手动释放内存，导致不需手动释放的浏览器会报错的问题 赵美丹 2013-05-16
    //window.mini = null;
    window.Owner = null;
    window.CloseOwnerWindow = null;
    
    delete String.prototype.trim;
    delete String.prototype.escapeDateTimeTokens;
    delete String.format;
    
    delete Array.prototype.add;
    delete Array.prototype.enqueue;
    delete Array.prototype.getRange;
    delete Array.prototype.addRange;
    delete Array.prototype.clear;
    delete Array.prototype.clone;
    delete Array.prototype.contains;
    delete Array.prototype.indexOf;
    delete Array.prototype.dequeue;
    delete Array.prototype.insert;
    delete Array.prototype.insertRange;
    delete Array.prototype.remove;
    delete Array.prototype.removeAt;
    delete Array.prototype.removeRange;
    
    delete Date.prototype.getHalfYear;
    delete Date.prototype.getQuarter;
    
    try {
        CollectGarbage();
    } catch (e) { }
}

//绑定事件处理
mini.on(window, "unload", mini_unload);

/**
 * @private
 */
function __OnIFrameMouseDown() {
    jQuery(document).trigger("mousedown");  
}

/**
 * 为所有的iframe绑定一个统一的onmousedown事件相应函数。
 * @private
 */
function __BindIFrames() {
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0, l = iframes.length; i < l; i++) {
        var iframe = iframes[i];        
        
        try {
            if (iframe.contentWindow ) {
                iframe.contentWindow.document.onmousedown = __OnIFrameMouseDown;
            }
        } catch (e) { }
        
    }
}


// 又是一个无限循环。为iframe 的document.onmousedown绑定相应函数。
setInterval(function () {
    __BindIFrames();
}, 1500);