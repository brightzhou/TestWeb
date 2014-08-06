/**
 * @fileOverview mask.js文件定义了mini UI框架中关于遮罩的方法。
 */

mini = mini || {};

/**
 * @private
 */
mini._MaskID = 1;
/**
 * @private
 */
mini._MaskObjects = {};
/**
 * 创建一个遮罩层
 * @param options JSON格式遮罩层配置信息
 */
mini.mask = function (options) {
    
    var el = mini.byId(options);
    if (mini.isElement(el)) options = { el: el };
    else if (typeof options == "string") options = { html: options };

    options = mini.copyTo({
        html: "",
        cls: "",
        style: "",
        
        backStyle: "background:#ccc"
    }, options);
    options.el = mini.byId(options.el);
    if (!options.el) options.el = document.body;
    var el = options.el;

    mini["unmask"](options.el);
    el._maskid = mini._MaskID++;
    mini._MaskObjects[el._maskid] = options;

    var maskEl = mini.append(el, '<div class="mini-mask">' +
        '<div class="mini-mask-background" style="' + options.backStyle + '"></div>' +
                        '<div class="mini-mask-msg ' + options.cls + '" style="' + options.style + '">' + options.html + '</div>'
        + '</div>');

    options.maskEl = maskEl;
    if (!mini.isNull(options.opacity)) {
        mini.setOpacity(maskEl.firstChild, options.opacity);
    }

    function center() {
        msgEl.style.display = "block";
        var size = mini.getSize(msgEl);
        msgEl.style.marginLeft = -size.width / 2 + "px";
        msgEl.style.marginTop = -size.height / 2 + "px";
    }
    var msgEl = maskEl.lastChild;
    msgEl.style.display = "none";
    
    setTimeout(function () {
        center();
    }, 0);
}

/**
 * 取消遮罩层
 * @param el 要取消那个元素上的遮罩层。
 */
mini["unmask"] = function (el) {
    el = mini.byId(el);
    if (!el) el = document.body;
    var options = mini._MaskObjects[el._maskid];
    if (!options) return;
    delete mini._MaskObjects[el._maskid];    
    var maskEl = options.maskEl;
    options.maskEl = null;
    if (maskEl && maskEl.parentNode) {
        maskEl.parentNode.removeChild(maskEl);
    }
}