mini.Popup = function () {
    mini.Popup.superclass.constructor.call(this);
    this.setVisible(false);	//初始隐藏
    this.setAllowDrag(this.allowDrag);	//是否可拖拽
    this.setAllowResize(this.allowResize);	//是否可改变大小
}
mini.extend(mini.Popup, mini.Container, {

    _clearBorder: false,

    uiCls: "mini-popup",
    
    _create: function () {
        var el = this.el = document.createElement("div");
        this.el.className = "mini-popup";
        this._contentEl = this.el;
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);

        }, this);
    },
    /**
	 * 调整弹出面板布局。
	 */
    doLayout: function () {
        if (!this.canLayout())
            return;
        mini.Popup.superclass.doLayout.call(this);
        this._doShadow();
        //分别调用内部组件调整布局。
        var cs = this.el.childNodes;
        if (cs) {
            for (var i = 0, l = cs.length; i < l; i++) {
                var cel = cs[i];
                mini.layout(cel);
            }
        }
    },
    /**
	 * 析构函数
	 */
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onmouseover = null;
        }
        this._contentEl = null;
        mini.un(document, "mousedown", this.__OnBodyMouseDown, this);
        mini.un(window, "resize", this.__OnWindowResize, this);
        if (this._modalEl) {
            this._modalEl.parentNode.removeChild(this._modalEl);
            this._modalEl = null;
        }
        if (this.shadowEl) {
            this.shadowEl.parentNode.removeChild(this.shadowEl);
            this.shadowEl = null;
        }
        if(this.popupEl){
            this._unbindPopupEl();
            this.popupEl = null;
        }
        mini.Popup.superclass.destroy.call(this, removeEl);
    },
    setWidth: function (value) {
        if (parseInt(value) == value)
            value += "px";
        this.width = value;
        if (value.indexOf("px") != -1) {
            //ie下css在元素未插入document前无效，导致计算错误，使得第一次弹出的宽度偏大 潘正锋 2013-06-06
            if (isIE) {
                var b = mini.getBorders(this.el);
                if (!b.left)
                  value = value.substring(0, value.indexOf("px")) - 2 + "px";
            }
            mini.setWidth(this.el, value);
        } else {
            //ie下css在元素未插入document前无效，导致计算错误，使得第一次弹出的宽度偏大 潘正锋 2013-06-06
            if (isIE && value) {
                if (!b.left)
                  value = value - 2;
            }
            this.el.style.width = value;
        }
        this._sizeChaned();
    },
    setHeight: function (value) {
        if (parseInt(value) == value)
            value += "px";
        this.height = value;
        if (value.indexOf("px") != -1) {
            mini.setHeight(this.el, value);
        } else {
            this.el.style.height = value;
        }
        this._sizeChaned();
    },
    /**
	 * 给窗口添加窗体内容元素
	 * @param value {DOMObject|String|Array} 如 setBody(el), setBody("<input.../>"), setBody([el,"input"])
	 */
    setBody: function (value) {
        if (!value)
            return;
        if (!mini.isArray(value))
            value = [value];
        for (var i = 0, l = value.length; i < l; i++) {
            mini.append(this._contentEl, value[i]);
        }
    },
    getAttrs: function (el) {
        var attrs = mini.Popup.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["popupEl", "popupCls", "showAction", "hideAction", "xAlign", "yAlign", "modalStyle",
            "onbeforeopen", "open", "onbeforeclose", "onclose"
            ]
        );
        mini._ParseBool(el, attrs,
            ["showModal", "showShadow", "allowDrag", "allowResize"
            ]
        );
        mini._ParseInt(el, attrs,
            ["showDelay", "hideDelay", "xOffset", "yOffset",
            "minWidth", "minHeight", "maxWidth", "maxHeight"
            ]
        );
        var cs = mini.getChildNodes(el, true);
        attrs.body = cs;
        return attrs;
    }

});
mini.regClass(mini.Popup, "popup");

mini.Popup_prototype = {

    isPopup: false,

    popupEl: null,
    popupCls: "",

    showAction: "mouseover",
    hideAction: "outerclick",
    showDelay: 300,
    hideDelay: 500,

    xAlign: "left",
    yAlign: "below",
    xOffset: 0,
    yOffset: 0,

    minWidth: 50,
    minHeight: 25,
    maxWidth: 2000,
    maxHeight: 2000,
    /**
	 * 是否显示遮罩
	 */
    showModal: false,
    /**
	 * 是否显示阴影开关
	 * @default true
	 */
    showShadow: true,

    modalStyle: "opacity:0.2",	//透明度0.2

    _dragCls: "mini-popup-drag",
    _resizeCls: "mini-popup-resize",
    allowDrag: false,
    allowResize: false,

    /**
	 * 取消弹出源对象的默认绑定事件
	 */
    _unbindPopupEl: function () {
        if (!this.popupEl)
            return;
        mini.un(this.popupEl, "click", this.__OnLeftClick, this);
        mini.un(this.popupEl, "contextmenu", this.__OnRightClick, this);
        mini.un(this.popupEl, "mouseover", this.__OnMouseOver, this);

    },
    _bindPopupEl: function () {
        if (!this.popupEl)
            return;
        mini.on(this.popupEl, "click", this.__OnLeftClick, this);
        mini.on(this.popupEl, "contextmenu", this.__OnRightClick, this);
        mini.on(this.popupEl, "mouseover", this.__OnMouseOver, this);
    },
    /**
	 * 展现弹出层，并触发相应事件。
	 */
    doShow: function (e) {
        var ev = {
            popupEl: this.popupEl,
            htmlEvent: e,
            cancel: false
        };

        this.fire("BeforeOpen", ev);
        if (ev.cancel == true)
            return;

        this.fire("opening", ev);
        if (ev.cancel == true)
            return;

        if (!this.popupEl) {	//如果popupEl 不存在
            this.show();
        } else {
            //如果存在popuEl则弹出在popuEl的左下角。
            var options = {};
            if (e)
                options.xy = [e.pageX, e.pageY];
            this.showAtEl(this.popupEl, options);
        }
    },
    /**
	 * 处理弹出层隐藏和事件触发功能。
	 */
    doHide: function (e) {
        var ev = {
            popupEl: this.popupEl,
            htmlEvent: e,
            cancel: false
        };
        this.fire("BeforeClose", ev);
        if (ev.cancel == true)
            return;
        this.close();
    },
    /**
	 * showAtPos方法的别名。两个方法没有区别。
	 */
    show: function (left, top) {
        this.showAtPos(left, top);
    },
    /**
	 * 负责实现弹出层实际展现功能。
	 */
    showAtPos: function (x, y) {

        this.render(document.body);

        if (!x)
            x = "center";
        if (!y)
            y = "middle";

        this.el.style.position = "absolute";
        this.el.style.left = "-2000px";
        this.el.style.top = "-2000px";
        this.el.style.display = "";

        this._measureSize();	//调整弹出层的宽高。

        var vbox = mini.getViewportBox();
        var box = mini.getBox(this.el);

        if (x == "left")
            x = 0;
        if (x == 'center')
            x = vbox.width / 2 - box.width / 2;
        if (x == "right")
            x = vbox.width - box.width;

        if (y == "top")
            y = 0;
        if (y == "middle")
            y = vbox.y + vbox.height / 2 - box.height / 2;
        if (y == "bottom")
            y = vbox.height - box.height;

        if (x + box.width > vbox.right)
            x = vbox.right - box.width;
        if (y + box.height > vbox.bottom)
            y = vbox.bottom - box.height - 20;
        //此方法中也只计算出了弹出层的坐标值。其他的操作在_Show方法中实现。
        this._Show(x, y);
    },
    /**
	 * 绘制遮罩层
	 */
    _doModal: function () {
        jQuery(this._modalEl).remove();
        if (!this.showModal)
            return;
        if (this.visible == false)
            return;

        var dd = document.documentElement;
        var scrollWidth = parseInt(Math.max(document.body.scrollWidth, dd ? dd.scrollWidth : 0));
        var scrollHeight = parseInt(Math.max(document.body.scrollHeight, dd ? dd.scrollHeight : 0));

        var vbox = mini.getViewportBox();
        var height = vbox.height;
        if (height < scrollHeight)
            height = scrollHeight;

        var width = vbox.width;
        if (width < scrollWidth)
            width = scrollWidth;

        this._modalEl = mini.append(document.body, '<div class="mini-modal"></div>');
        this._modalEl.style.height = height + "px";
        this._modalEl.style.width = width + "px";
        this._modalEl.style.zIndex = mini.getStyle(this.el, 'zIndex') - 1;
        mini.setStyle(this._modalEl, this.modalStyle);
    },
    /**
	 * 添加阴影。
	 */
    _doShadow: function () {
        //shadowEl 引用阴影y元素
        if (!this.shadowEl) {
            this.shadowEl = mini.append(document.body, '<div class="mini-shadow"></div>');
        }
        this.shadowEl.style.display = this.showShadow ? "" : "none";
        if (this.showShadow) {
            function doShadow() {
                this.shadowEl.style.display = "";

                var box = mini.getBox(this.el);
                var s = this.shadowEl.style;
                s.width = box.width + "px";
                s.height = box.height + "px";
                s.left = box.x + "px";
                s.top = box.y + "px";

                var zindex = mini.getStyle(this.el, 'zIndex');
                if (!isNaN(zindex)) {
                    this.shadowEl.style.zIndex = zindex - 2;
                }
            }
            this.shadowEl.style.display = "none";
            if (this._doShadowTimer) {
                clearTimeout(this._doShadowTimer);
                this._doShadowTimer = null;
            }
            var me = this;

            this._doShadowTimer = setTimeout(function () {
                me._doShadowTimer = null;
                doShadow.call(me);
            }, 20);

        }
    },
    /**
	 * 对el 重新设置最大、最小宽度和最大、最小高度。
	 */
    _measureSize: function () {
        this.el.style.display = "";
        var box = mini.getBox(this.el);

        if (box.width > this.maxWidth) {
            mini.setWidth(this.el, this.maxWidth);
            box = mini.getBox(this.el);
        }
        if (box.height > this.maxHeight) {
            mini.setHeight(this.el, this.maxHeight);
            box = mini.getBox(this.el);
        }
        if (box.width < this.minWidth) {
            mini.setWidth(this.el, this.minWidth);
            box = mini.getBox(this.el);
        }
        if (box.height < this.minHeight) {
            mini.setHeight(this.el, this.minHeight);
            box = mini.getBox(this.el);
        }
    },
    /**
	 * 展现绑定源对象的弹出层
	 */
    showAtEl: function (el, options) {
        el = mini.byId(el);
        if (!el)
            return;
        if (!this.isRender() || this.el.parentNode != document.body) {
            this.render(document.body);
            
        }

        var c = {
            xAlign: this.xAlign,
            yAlign: this.yAlign,
            xOffset: this.xOffset,
            yOffset: this.yOffset,
            popupCls: this.popupCls

        };
        mini.copyTo(c, options);

        mini.addClass(el, c.popupCls);
        el.popupCls = c.popupCls;
        this._popupEl = el;

        this.el.style.position = "absolute";
        this.el.style.left = "-2000px";
        this.el.style.top = "-2000px";
        this.el.style.display = "";

        this.doLayout();
        this._measureSize();	//调整宽高。

        var vbox = mini.getViewportBox();
        var box = mini.getBox(this.el);
        var pbox = mini.getBox(el);
        var xy = c.xy;
        var h = c.xAlign, v = c.yAlign;

        var x = vbox.width / 2 - box.width / 2, y = 0;
        if (xy) {
            x = xy[0];
            y = xy[1];
        }

        switch (c.xAlign) {
            case "outleft":
                x = pbox.x - box.width;
                break;
            case "left":
                x = pbox.x;
                break;
            case "center":
                x = pbox.x + pbox.width / 2 - box.width / 2;
                break;
            case "right":
                x = pbox.right - box.width;
                break;
            case "outright":
                x = pbox.right;
                break;
            default:
                break;
        }

        switch (c.yAlign) {
            case "above":
                y = pbox.y - box.height;
                break;
            case "top":
                y = pbox.y;
                break;
            case "middle":
                y = pbox.y + pbox.height / 2 - box.height / 2;
                break;
            case "bottom":
                y = pbox.bottom - box.height;
                break;
            case "below":
                y = pbox.bottom;
                break;
            default:
                break;
        }
        x = parseInt(x);
        y = parseInt(y);

        if (c.outYAlign || c.outXAlign) {
            if (c.outYAlign == "above") {
                if (y + box.height > vbox.bottom) {
                    //解决popup显示不全的问题 赵美丹 2013-04-22
                    //两种情况：1.下面无法显示全时部分情况不能向上显示；2.向上向下都显示不全时修改为以最小高度显示
                    //var top = pbox.y - vbox.y;
                    //var bottom = vbox.bottom - pbox.bottom;
                    //if (top > bottom) {
                    y = pbox.y - box.height;
                    if (y < 0) {
                        y = pbox.y - this.minHeight;
                        this.setHeight(this.minHeight);
                    }
                    //}
                }
            }
            if (c.outXAlign == "outleft") {
                if (x + box.width > vbox.right) {
                    var left = pbox.x - vbox.x;
                    var right = vbox.right - pbox.right;
                    if (left > right) {
                        x = pbox.x - box.width;
                    }
                }
            }
            if (c.outXAlign == "right") {
                if (x + box.width > vbox.right) {
                    x = pbox.right - box.width;
                }
            }
            this._Show(x, y);
        } else {
            this.showAtPos(x + c.xOffset, y + c.yOffset);
        }
    },
    /**
	 * 弹出层功能。
	 */
    _Show: function (x, y) {
        this.el.style.display = "";
        this.el.style.zIndex = mini.getMaxZIndex();
        mini.setX(this.el, x);
        mini.setY(this.el, y);

        this.setVisible(true);

        if (this.hideAction == "mouseout") {
            mini.on(document, "mousemove", this.__OnBodyMouseMove, this);
        }
        var sf = this;
        this._doShadow();	//显然遮罩

        this._doModal();
        //调整弹出层内部的iframe窗体
        mini.layoutIFrames(this.el);

        this.isPopup = true;

        mini.on(document, "mousedown", this.__OnBodyMouseDown, this);	//案件任意按下。
        mini.on(window, "resize", this.__OnWindowResize, this);

        this.fire("Open");
    },
    /**
	 * 打开弹出层，不触发事件。
	 */
    open: function () {
        this.show();
    },
    /**
	 * hide函数的别名
	 */
    close: function () {
        this.hide();
    },
    /**
	 * 隐藏弹出层，隐藏阴影，删除遮罩等。
	 */
    hide: function () {

        if (!this.el)
            return;
        if (this.popupEl)
            mini.removeClass(this.popupEl, this.popupEl.popupCls);
        if (this._popupEl)
            mini.removeClass(this._popupEl, this._popupEl.popupCls);
        this._popupEl = null;
        jQuery(this._modalEl).remove();

        if (this.shadowEl)
            this.shadowEl.style.display = "none";
        mini.un(document, "mousemove", this.__OnBodyMouseMove, this);
        mini.un(document, "mousedown", this.__OnBodyMouseDown, this);
        mini.un(window, "resize", this.__OnWindowResize, this);

        this.setVisible(false);

        this.isPopup = false;

        this.fire("Close");
    },
    /**
	 * 设置弹出层源元素
	 * @param el {String|DOMObject} ID或者是DOM对象
	 */
    setPopupEl: function (el) {
        el = mini.byId(el);
        if (!el)
            return;
        this._unbindPopupEl();	//取消事件绑定
        this.popupEl = el;	//可弹出元素
        this._bindPopupEl();	//重新绑定事件
    },
    /**
	 * 弹出层源元素样式类
	 * @param value {String} 样式类名
	 */
    setPopupCls: function (value) {
        this.popupCls = value;
    },
    /**
	 *
	 */
    setShowAction: function (value) {
        this.showAction = value;
    },
    setHideAction: function (value) {
        this.hideAction = value;
    },
    setShowDelay: function (value) {
        this.showDelay = value;
    },
    setHideDelay: function (value) {
        this.hideDelay = value;
    },
    setXAlign: function (value) {
        this.xAlign = value;
    },
    setYAlign: function (value) {
        this.yAlign = value;
    },
    setxOffset: function (value) {
        value = parseInt(value);
        if (isNaN(value)) value = 0;
        this.xOffset = value;
    },
    setyOffset: function (value) {
        value = parseInt(value);
        if (isNaN(value)) value = 0;
        this.yOffset = value;
    },
    setShowModal: function (value) {
        this.showModal = value;
    },
    setShowShadow: function (value) {
        this.showShadow = value;
    },
    setMinWidth: function (value) {
        if (isNaN(value))
            return;
        this.minWidth = value;
    },
    setMinHeight: function (value) {
        if (isNaN(value))
            return;
        this.minHeight = value;
    },
    setMaxWidth: function (value) {
        if (isNaN(value))
            return;
        this.maxWidth = value;
    },
    setMaxHeight: function (value) {
        if (isNaN(value))
            return;
        this.maxHeight = value;
    },
    /**
	 * 设置是否可以被拖拽
	 */
    setAllowDrag: function (value) {
        this.allowDrag = value;
        mini.removeClass(this.el, this._dragCls);
        if (value) {
            mini.addClass(this.el, this._dragCls);
        }
    },
    /**
	 * 是否可以改变大小
	 */
    setAllowResize: function (value) {
        this.allowResize = value;
        mini.removeClass(this.el, this._resizeCls);
        if (value) {
            mini.addClass(this.el, this._resizeCls);
        }
    },
    __OnLeftClick: function (e) {
        if (this._inAniming)
            return;
        if (this.showAction != "leftclick")
            return;
        //allowPopup是可以在弹出层源元素标签上声明的一个属性，可以用于组织弹出层弹出。
        var allowPopup = jQuery(this.popupEl).attr("allowPopup");
        if (String(allowPopup) == "false")
            return;
        this.doShow(e);
    },
    __OnRightClick: function (e) {
        if (this._inAniming)
            return;
        if (this.showAction != "rightclick")
            return;
        var allowPopup = jQuery(this.popupEl).attr("allowPopup");
        if (String(allowPopup) == "false")
            return;

        e.preventDefault();
        this.doShow(e);

    },
    /**
	 * 默认鼠标悬停事件响应函数。
	 */
    __OnMouseOver: function (e) {
        if (this._inAniming)
            return;
        if (this.showAction != "mouseover")
            return;
        var allowPopup = jQuery(this.popupEl).attr("allowPopup");
        if (String(allowPopup) == "false")
            return;

        clearTimeout(this._hideTimer);
        this._hideTimer = null;

        if (this.isPopup)
            return;

        var sf = this;
        this._showTimer = setTimeout(function () {
            sf.doShow(e);
        }, this.showDelay);
    },
    __OnBodyMouseMove: function (e) {
        if (this.hideAction != "mouseout")
            return;
        this._tryHide(e);
    },
    __OnBodyMouseDown: function (e) {
        if (this.hideAction != "outerclick")
            return;
        if (!this.isPopup)
            return;
        //鼠标点击在弹出层之外时不做任何事情。
        if (this.within(e) || (this.popupEl && mini.isAncestor(this.popupEl, e.target))) {
        } else {
            this.doHide(e);
        }
    },
    _tryHide: function (e) {
        if (mini.isAncestor(this.el, e.target)
		|| (this.popupEl && mini.isAncestor(this.popupEl, e.target))
		) {
        } else {
            clearTimeout(this._showTimer);
            this._showTimer = null;
            if (this._hideTimer)
                return;

            var sf = this;
            this._hideTimer = setTimeout(function () {
                sf.doHide(e);
            }, this.hideDelay);
        }
    },
    /**
	 * 同事调整遮罩层
	 */
    __OnWindowResize: function (e) {
        if (this.isDisplay() && !mini.isIE6) {
            this._doModal();
        }
    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target))
            return true;
        var controls = mini.getChildControls(this);

        for (var i = 0, l = controls.length; i < l; i++) {
            var c = controls[i];

            if (c.within(e))
                return true;
        }
        return false;
    }
};

mini.copyTo(mini.Popup.prototype, mini.Popup_prototype);