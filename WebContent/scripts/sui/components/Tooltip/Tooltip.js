/**
 * @fileOverview Control.js 文件定义了所有组件的基类。
 */
/**
 * @namespace mini
 */
mini = mini || {};

/**
 * Tooltip 是mini UI中的提示组件
 * @class mini.Button
 * @constructor
 * @extends mini.Control
 */

mini.Tooltip = function (el) {
    this.container = el;
    this.tipId = "mini-tooltip" + mini.Tooltip.id;
    mini.Tooltip.id++;
    this.source = el;
    this.attr = 'alt';
    this.attrDelimiter = ",";
    this._init();
}
mini.Tooltip.id = 1;
mini.Tooltip.prototype = {
    /**
	 * @lends mini.Tooltip.prototype
	 */

    /**
	 * 提示组件是否在显示状态。
	 * @type Boolean
	 * @default false
	 */
    isshow: false,
    /**
     * 分隔符
     * @type String
     * @author 赵美丹
     */
    delimiter: "<br/>",

    /**
	 * 显示与隐藏的滞后时间。
	 * @type Int
	 * @default 500
	 */
    timeout: 500,
    tipMinLength: 1,

    _eleclass: 'mini-tooltip-container',

    spanId: 'computefontlength',

    /**
	 * 创建组件最外层HTML结构，并绑定给组件实例。
	 * @default
	 * @private
	 */
    _init: function () {
        this.container.className = this.container.className + " " + this._eleclass;

        this.$tip = $('#' + this.tipId);
        if (this.$tip.length == 0) {
            this.$tip = $('<div class="mini-tooltip-colortip" id="' + this.tipId + '">'
                + '<div class="mini-tooltip-content" id="' + this.tipId + '_content"></div>'
                + '<div class="mini-tooltip-pointy"><span class="mini-tooltip-pointytipshadow"></span><span class="mini-tooltip-pointytip"></span></div>'
                + '</div>');
            $('body').append(this.$tip[0]);
        }
        this.$tipContent = $('#' + this.tipId + '_content');
        //全局 计算长度时用

        if (!document.getElementById(this.spanId)) {
            var span = document.createElement("span");
            span.id = this.spanId;
            span.className = "lengthspan";
            document.body.appendChild(span);
        }

        mini_on(this.container, "mouseenter", this.show, this);
        mini_on(document, "mousemove", this.hide, this);
    },
    /**
	 * 析构函数
	 */
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        if (this.container) {
            this.container.onmouseenter = null;
            this.container.onmouseleave = null;
            mini.clearEvent(this.container);
            mini.clearEvent(document);
        }
        if (this.$tipContent.length == 1) {
            this.$tipContent.unbind();
            this.$tipContent.empty();
            this.$tipContent[0].parentNode.removeChild(this.$tipContent[0]);
            delete this.$tipContent;
        }
        if (this.$tip.length == 1) {
            this.$tip.unbind();
            this.$tip.empty();
            this.$tip[0].parentNode.removeChild(this.$tip[0]);
            delete this.$tip;
        }
    },
    /**
	 * 更新组件函数
	 */
    _doUpdate: function (text) {
        //特殊字符处理 潘正锋 2013-05-06
        text = mini.htmlEncode(text).split(mini.htmlEncode(this.attrDelimiter)).join(this.delimiter);
        this.$tipContent.html(text);
    },
    /**
    * 判断字数是否超过
    */
    isOverFlow: function (el, text) {
        if (mini.isNull(text) || text === '')
            return false;
        //如果长度非常长，取200个字符就够了
        if (text.length > 300)
            text = text.substring(0, 300);
        var style;

        if (document.defaultView) //火狐
            style = document.defaultView.getComputedStyle(el, null);
        else
            style = el.currentStyle;//IE
        var fontSize = style.fontSize;
        var fontFamily = style.fontFamily;
        var span = document.getElementById(this.spanId);
        span.innerHTML = text;
        span.style.fontSize = fontSize;
        span.style.fontFamily = fontFamily;

        if (span.offsetWidth - 2 > el.clientWidth) {
            return true;
        }
        return false;
    },
    /**
	 * 显示tip
	 */
    show: function () {
        if (this.isshow)
            return;
        var text = $(this.source).attr(this.attr);
        //解决数字刚好显示的情况下仍显示tooltip的问题 赵美丹 2013-05-28
        if (!this.isOverFlow(this.source, text))
            return;
        this._doUpdate(text);
        var box = mini.getBox(this.container);
        this.$tipContent.height("auto");
        var width = Math.max(parseInt(this.container.clientWidth) + 10, 200);

        //解决输入框较小时，tooltip偏移输入框的问题 赵美丹 2013-05-28
        var left = box.x + box.width / 2 - width / 2;
        var top = (box.y + box.height + 7);
        //超过边框处理 潘正锋
        if (left + width > $(window).width())
            left = $(window).width() - width;
        if (left < 0)
            left = 0;
        this.$tip.css({ left: left + 'px', top: top + 'px', width: width + "px" }).show();
        this.$tip.width(this.$tipContent.width());
        if (this.$tip.height() > 200) {
            this.$tipContent.height(188);
        }
        //解决输入框光标穿透tooltip的问题 赵美丹 2013-03-12
        this.$tip.focus();
        this.isshow = true;
    },
    hide: function (e) {
        if (mini.findParent(e.target, this._eleclass) || mini.findParent(e.target, "mini-tooltip-colortip")) {
            return;
        }
        this.$tip.hide();
        this.isshow = false;
    },
    setIsshow: function (value) {
        if (this.isshow != value) {
            this.isshow = value;
            this.isshow ? this.show() : this.hide();
        }
    },
    getIsshow: function () {
        return this.isshow;
    },
    setSource: function (el) {
        if (this.source != el) {
            this.source = el;
        }
    },
    getSource: function () {
        return this.source;
    },
    setAttr: function (attr) {
        if (this.attr != attr) {
            this.attr = attr;
        }
    },
    getAttr: function () {
        return this.attr;
    },
    setAttrDelimiter: function (value) {
        if (this.attrDelimiter != value) {
            this.attrDelimiter = value;
        }
    },
    setTipMinLength: function (n) {
        if (this.tipMinLength != n) {
            this.tipMinLength = n;
        }
    },
    getTipMinLength: function () {
        return this.tipMinLength;
    }
}