/**
 * @fileOverview load.js文件定义了mini UI框架中关于文件加载的方法。
 */

mini = mini || {};

/**
 * 根据给定地址加载JS文件。
 * @param src js文件url地址
 * @param callback js文件加载成功后的回调函数
 */
mini.loadJS = function (src, callback) {
    if (!src) return;
    if (typeof callback == "function") {
        return loadJS._async(src, callback);
    } else {
        return loadJS._sync(src);
    }
}

/**
 * @private
 */
mini.loadJS._js = {};

/**
 * 针对需要执行回调的方法的同步文件加载方法
 * @param src js文件url地址
 * @param callback js文件加载成功后的回调函数
 * @private
 */
mini.loadJS._async = function (src, callback) {
    var state = mini.loadJS._js[src];
    if (!state) {
        state = mini.loadJS._js[src] = { create: false, loaded: false, callbacks: [] };
    }
    if (state.loaded) {
        setTimeout(function () {
            callback();
        }, 1);
        return;
    } else {
        state.callbacks.push(callback);
        if (state.create) return;
    }

    state.create = true;

    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.src = src;
    js.type = 'text/javascript';
	/**
	 * @ignore
	 */
    function doCallback() {
        for (var i = 0; i < state.callbacks.length; i++) {
            var fn = state.callbacks[i];
            if (fn) fn();
        }
        state.callbacks.length = 0;
    }

    setTimeout(function () {
        if (document.all) {
        	/**
        	 * @ignore
        	 */
            js.onreadystatechange = function () {
                if (js.readyState == 'loaded' || js.readyState == 'complete') {
                    doCallback();
                    state.loaded = true;
                }
            }
        } else {
        	/**
        	 * @ignore
        	 */
            js.onload = function () {
                doCallback();
                state.loaded = true;
            }
        }
        head.appendChild(js);
    }, 1);
    return js;
}

/**
 * 针对需要执行回调的方法的异步文件加载方法
 * @param src js文件url地址
 * @private
 */
mini.loadJS._sync = function (src) {
    if (loadJS._js[src]) return;
    loadJS._js[src] = { create: true, loaded: true, callbacks: [] };

    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.text = loadText(src);
    head.appendChild(js);
    return js;
}

/**
 * 获取给定远程地址的文本
 * @param url 地址
 * @returns 文本字符串
 */
mini.loadText = function (url) {
    var text = "";
    var isLocal = document.all && location.protocol == "file:";


    var xmlhttp = null;
    if (isLocal) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        if (window.XMLHttpRequest) {        
            xmlhttp = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {    
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }


    xmlhttp.onreadystatechange = state_Change;

    var d = '_t=' + new Date().getTime();
    if (url.indexOf("?") == -1) d = "?" + d;
    else d = "&" + d;
    url += d;

    xmlhttp.open("GET", url, false);
    xmlhttp.send(null);

    function state_Change() {
        if (xmlhttp.readyState == 4) {
            var statusCode = isLocal ? 0 : 200;
            if (xmlhttp.status == statusCode) {
                text = xmlhttp.responseText;
            }
            else {
                
            }
        }
    }
    return text;
}

/**
 * 获取指定远程地址的JSON数据
 * @param url 地址
 * @returns JSON对象
 */
mini.loadJSON = function (url) {
    var text = loadText(url);
    var o = eval("(" + text + ")");
    return o;
}

/**
 * 异步加载css文件方法
 * @param url 地址
 * @param id 为link元素设置Id属性值
 * @returns link元素DOM对象
 */
mini.loadCSS = function (src, id) {
    if (!src) return;
    if (loadCSS._css[src]) return;
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    if (id) link.id = id;
    link.href = src;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
    return link;
}
mini.loadCSS._css = {};

/**
 * innerHTML解决普通innerHTML的bug.
 * @param el 元素ID或DOM对象
 * @param html 待添加内容
 */
mini.innerHTML = function (el, html) {
    if (typeof el == 'string') el = document.getElementById(el);
    if (!el) return;
    //在前面拼一个div为了解决BUG
    html = '<div style="display:none">&nbsp;</div>' + html;
    el.innerHTML = html;
    mini.__executeScripts(el);
    var d = el.firstChild;	//不理解的最后一句。
}

/**
 * 解析script
 * @private
 */
mini.__executeScripts = function (d) {
    var scripts = d.getElementsByTagName("script")
    for (var i = 0, l = scripts.length; i < l; i++) {
        var sc = scripts[i];
        var src = sc.src;
        if (src) {
            mini.loadJS(src);
        } else {
            var ns = document.createElement('script');
            ns.type = "text/javascript";
            ns.text = sc.text;
            d.appendChild(ns);
        }
    }
    for (var i = scripts.length - 1; i >= 0; i--) {
        var sc = scripts[i];
        sc.parentNode.removeChild(sc);
    }
}