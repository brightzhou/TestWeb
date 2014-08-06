/**
 * @fileOverview Event.js文件定义了mini UI框架中所有为事件处理定义的函数和属性。
 * @requires mini.js
 */

mini = mini || {};

/**
 * 为指定元素添加一个事件处理函数，这个事件处理函数阻断事件冒泡传递。
 * @exports mini_onOne as mini.onOne
 * @param el 目标对象，可以使ID或DOM或jQuery对象
 * @param type 事件类型
 * @param fn 事件处理函数
 * @param scope 函数上下文
 * @function
 */
mini_onOne = function (el, type, fn, scope) {
    
    var name = "on" + type.toLowerCase();
    
    el[name] = function (e) {
        e = e || window.event;
        e.target = e.target || e.srcElement;
        if (!e.preventDefault) {
        	/**
        	 * @ignore
        	 */
            e.preventDefault = function () {
                if (window.event) {
                    window.event.returnValue = false;
                }
            }
        }
        if (!e.stopPropogation) {
        	 /**
        	 * @ignore
        	 */
            e.stopPropogation = function () {
                if (window.event) {
                    window.event.cancelBubble = true;
                }
            }
        }
        var ret = fn.call(scope, e);
        // 内存优化 删除对象属性 ,增加try catch,ie9不然以上会报错潘正锋 2013-06-05
        if (window.event) {
            try {
                e.stopPropogation = null;
                e.preventDefault = null;
            } catch (e) { }
        }
        if (ret === false) return false;
    }
}


/**
 * 为给定元素绑定事件处理函数
 * @exports mini_on as mini.on
 * @param el 目标对象，可以使ID或DOM或jQuery对象
 * @param type 事件类型
 * @param fn 事件处理函数
 * @param scope 函数上下文
 * @requires jQuery
 * @function
 */
mini_on = function (el, type, fn, scope) {
        el = mini.byId(el);
        scope = scope || el;
        if (!el || !type || !fn || !scope) return false
        var listener = mini.findListener(el, type, fn, scope);
        if (listener) return false;
        var method = mini.createDelegate(fn, scope);
        mini.listeners.push([el, type, fn, scope, method]);	//将所有绑定的时间放入listeners数组中
        if (isFirefox && type == 'mousewheel') type = 'DOMMouseScroll';
        jQuery(el).bind(type, method);
    };

/**
 * 为给定元素取消绑定事件处理函数
 * @exports mini_un as mini.un
 * @param el 目标对象，可以使ID或DOM或jQuery对象
 * @param type 事件类型
 * @param fn 事件处理函数
 * @param scope 函数上下文
 * @requires jQuery ， mini.findListener
 * @function
 */    
mini_un = function (el, type, fn, scope) {
        el = mini.byId(el);
        scope = scope || el;
        if (!el || !type || !fn || !scope) return false
        var listener = mini.findListener(el, type, fn, scope);
        if (!listener) return false;
        mini.listeners.remove(listener);
        if (isFirefox && type == 'mousewheel') type = 'DOMMouseScroll';
        jQuery(el).unbind(type, listener[4]);

    };
    
mini.copyTo(mini, {
    listeners: [], 
    on: mini_on,
    un: mini_un,
    /**
     * 根据给定的元素，给定事件类型，给定相应函数，给定上下文对象获取一个listener
 	 * @param el 目标对象，可以使ID或DOM或jQuery对象
     * @param type 事件类型
     * @param fn 事件处理函数
     * @param scope 函数上下文
     * @returns listerner 数组
     * @memberOf mini
     */
    findListener: function (el, type, fn, scope) {
        el = mini.byId(el);
        scope = scope || el;
        if (!el || !type || !fn || !scope) return false
        var listeners = mini.listeners;
        for (var i = 0, l = listeners.length; i < l; i++) {
            var listener = listeners[i];
            if (listener[0] == el
                && listener[1] == type
                && listener[2] == fn
                && listener[3] == scope
            ) {
                return listener;
            }
        }
    },
    
    /**
     * 根据给定的元素，给定事件类型删除所有相应事件
 	 * @param el 目标对象，可以使ID或DOM或jQuery对象
     * @param type 事件类型
     * @memberOf mini
     */
    clearEvent: function (el, type) {
        el = mini.byId(el);
        if (!el) return false;
        var listeners = mini.listeners;
        for (var i = listeners.length - 1; i >= 0; i--) {
            var listener = listeners[i];
            if (listener[0] == el) {
                if (!type || type == listener[1]) {
                    mini.un(el, listener[1], listener[2], listener[3]);
                }
            }
        }
        el.onmouseover = el.onmousedown = null;

    }
});
//----------------------------------------事件处理帮助  end--------------------------------------------

/**
 * 保存所有窗口改变大小的相应函数
 * @private
 */
mini.__windowResizes = [];
/**
 * 为窗口添加resize事件相应函数。
 * @param fn 相应函数
 * @param scope 相应函数的上下文
 */
mini.onWindowResize = function (fn, scope) {
    mini.__windowResizes.push([fn, scope]);
}

/**
 * 组件初始化回到函数缓冲区。
 * @private
 */
mini._BindCallbacks = [];

/**
 * 注册组件初始化回到函数
 * @private
 */
mini._BindEvents = function (fn, scope) {
    mini._BindCallbacks.push([fn, scope]);
    if (!mini._EventTimer) {
        //解决datagrid行编辑editor变化时报错问题（延时导致editor的事件绑定可能在其销毁之后执行） 赵美丹 2013-05-16
       // mini._EventTimer = setTimeout(function () {
            mini._FireBindEvents();
        //}, 50);
    }
}

/**
 * 釋放初始化后綁定的所有回掉函數。
 * @private
 */
mini._FireBindEvents = function () {
    for (var i = 0, l = mini._BindCallbacks.length; i < l; i++) {
        var e = mini._BindCallbacks[i];
        e[0].call(e[1]);
    }
    mini._BindCallbacks = [];
    mini._EventTimer = null;
}