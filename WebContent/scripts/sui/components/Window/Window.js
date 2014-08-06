
mini.Window = function () {

    mini.Window.superclass.constructor.call(this);

    this.addCls("mini-window");

    this.setVisible(false);
    this.setAllowDrag(this.allowDrag);
    this.setAllowResize(this.allowResize);
}

mini.extend(mini.Window, mini.Panel, {
    x: 0,
    y: 0,
    state: "restore",

    _dragCls: "mini-window-drag",
    _resizeCls: "mini-window-resize",
    allowDrag: true,

    showCloseButton: true,
    showMaxButton: false,
    showMinButton: false,
    showCollapseButton: false,

    showModal: true,

    minWidth: 150,
    minHeight: 80,
    maxWidth: 2000,
    maxHeight: 2000,

    uiCls: "mini-window",

    _create: function () {
        mini.Window.superclass._create.call(this);


    },
    _initButtons: function () {
        this.buttons = [];

        var close = this.createButton({ name: "close", cls: "mini-tools-close", visible: this.showCloseButton });
        this.buttons.push(close);

        var max = this.createButton({ name: "max", cls: "mini-tools-max", visible: this.showMaxButton });
        this.buttons.push(max);

        var min = this.createButton({ name: "min", cls: "mini-tools-min", visible: this.showMinButton });
        this.buttons.push(min);

        var collapse = this.createButton({ name: "collapse", cls: "mini-tools-collapse", visible: this.showCollapseButton });
        this.buttons.push(collapse);
    },
    _initEvents: function () {
        mini.Window.superclass._initEvents.call(this);

        mini._BindEvents(function () {

            mini.on(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(window, "resize", this.__OnWindowResize, this);

            mini.on(this.el, "mousedown", this.__OnWindowMouseDown, this);
        }, this);


    },
    doLayout: function () {
        if (!this.canLayout()) return;




        if (this.state == "max") {
            var vbox = this.getParentBox();
            this.el.style.left = "0px";
            this.el.style.top = "0px";
            mini.setSize(this.el, vbox.width, vbox.height);
        }

        mini.Window.superclass.doLayout.call(this);


        if (this.allowDrag) {
            mini.addClass(this.el, this._dragCls);
        }
        if (this.state == "max") {
            this._resizeGridEl.style.display = "none";
            mini.removeClass(this.el, this._dragCls);
        }


        this._doModal();
    },
    _doModal: function () {

        var show = this.showModal && this.isDisplay() && this.visible;
        if (!this._modalEl && this.showModal == false) return;


        if (!this._modalEl) {
            this._modalEl = mini.append(document.body, '<div class="mini-modal" style="display:none"></div>');
        }



        function resizeModal() {
            mini.repaint(document.body);
            var dd = document.documentElement;
            var scrollWidth = parseInt(Math.max(document.body.scrollWidth, dd ? dd.scrollWidth : 0));
            var scrollHeight = parseInt(Math.max(document.body.scrollHeight, dd ? dd.scrollHeight : 0));

            var vbox = mini.getViewportBox();
            var height = vbox.height;
            if (height < scrollHeight) height = scrollHeight;

            var width = vbox.width;
            if (width < scrollWidth) width = scrollWidth;

            this._modalEl.style.display = show ? "block" : "none";

            this._modalEl.style.height = height + "px";
            this._modalEl.style.width = width + "px";
            this._modalEl.style.zIndex = mini.getStyle(this.el, 'zIndex') - 1;
        }
        if (show) {
            var me = this;

            setTimeout(function () {
                if (me._modalEl) {
                    me._modalEl.style.display = "none";
                    resizeModal.call(me);
                }
            }, 1);
        } else {
            this._modalEl.style.display = "none";
        }
    },
    getParentBox: function () {
        var vbox = mini.getViewportBox();
        var containerEl = this._containerEl || document.body;
        if (containerEl != document.body) {
            vbox = mini.getBox(containerEl);
        }
        return vbox;
    },

    setShowModal: function (value) {

        this.showModal = value;
    },
    getShowModal: function () {
        return this.showModal;
    },
    setMinWidth: function (value) {
        if (isNaN(value)) return;
        this.minWidth = value;
    },
    getMinWidth: function () {
        return this.minWidth;
    },
    setMinHeight: function (value) {
        if (isNaN(value)) return;
        this.minHeight = value;
    },
    getMinHeight: function () {
        return this.minHeight;
    },
    setMaxWidth: function (value) {
        if (isNaN(value)) return;
        this.maxWidth = value;
    },
    getMaxWidth: function () {
        return this.maxWidth;
    },
    setMaxHeight: function (value) {
        if (isNaN(value)) return;
        this.maxHeight = value;
    },
    getMaxHeight: function () {
        return this.maxHeight;
    },
    setAllowDrag: function (value) {
        this.allowDrag = value;
        mini.removeClass(this.el, this._dragCls);
        if (value) {
            mini.addClass(this.el, this._dragCls);
        }
    },
    getAllowDrag: function () {
        return this.allowDrag;
    },









    setShowMaxButton: function (value) {
        this.showMaxButton = value;
        var button = this.getButton("max");
        button.visible = value;
        this._doTools();
    },
    getShowMaxButton: function () {
        return this.showMaxButton;
    },
    setShowMinButton: function (value) {
        this.showMinButton = value;
        var button = this.getButton("min");
        button.visible = value;
        this._doTools();
    },
    getShowMinButton: function () {
        return this.showMinButton;
    },

    max: function () {
        this.state = "max";
        this.show();

        var button = this.getButton("max");
        if (button) {
            button.cls = "mini-tools-restore";
            this._doTools();
        }
    },
    restore: function () {
        this.state = "restore";
        this.show(this.x, this.y);

        var button = this.getButton("max");
        if (button) {
            button.cls = "mini-tools-max";
            this._doTools();
        }
    },
    containerEl: null,
    showAtPos: function (x, y, options) {
        this.show(x, y, options);
    },
    show: function (x, y, options) {
        this._allowLayout = false;

        var containerEl = this._containerEl || document.body;
        if (!this.isRender() || this.el.parentNode != containerEl) {
            this.render(containerEl);
        }

        this.el.style.zIndex = mini.getMaxZIndex();

        this._doShow(x, y);

        this._allowLayout = true;
        this.setVisible(true);

      

        try {
            this.el.focus();
        } catch (e) { }
    },
    hide: function () {
        //解决当最大化后，setWidth无效的问题 潘正锋 2013-06-21
        this.state = "restore";
        delete this._width;
        delete this._height;
        this.setVisible(false);
        this._doModal();
    },
    getWidth: function () {
        this._headerEl.style.width = "50px";
        var width = mini.getWidth(this.el);
        this._headerEl.style.width = "auto";
        return width;
    },
    getBox: function () {
        this._headerEl.style.width = "50px";
        this.el.style.display = "";
        var width = mini.getWidth(this.el);
        this._headerEl.style.width = "auto";
        var box = mini.getBox(this.el);
        box.width = width;
        box.right = box.x + width;
        return box;
    },
    _measureSize: function () {

        var box = this.getBox();


        if (box.width > this.maxWidth) {
            mini.setWidth(this.el, this.maxWidth);
            box = this.getBox()
        }
        if (box.height > this.maxHeight) {
            mini.setHeight(this.el, this.maxHeight);
            box = this.getBox()
        }
        if (box.width < this.minWidth) {
            mini.setWidth(this.el, this.minWidth);
            box = this.getBox()
        }
        if (box.height < this.minHeight) {
            mini.setHeight(this.el, this.minHeight);
            box = this.getBox()
        }
    },
    _doShow: function (x, y) {
        var vbox = this.getParentBox();

        if (this.state == "max") {
            if (!this._width) {
                var box = this.getBox()
                this._width = box.width;
                this._height = box.height;

                this.x = box.x;
                this.y = box.y;
            }
        } else {
            if (mini.isNull(x)) x = "center";
            if (mini.isNull(y)) y = "middle";

            this.el.style.position = "absolute";
            this.el.style.left = "-2000px";
            this.el.style.top = "-2000px";
            this.el.style.display = "";
            
            if (this._width) {
                this.setWidth(this._width);
                this.setHeight(this._height);
            } else {
                //解决当最大化后，setWidth,setHeight无效的问题 潘正锋 2013-06-21
                this.setWidth(this.width);
                this.setHeight(this.height);
            }
            this._measureSize();

            var box = this.getBox();

            if (x == "left") x = 0;
            if (x == 'center') x = vbox.width / 2 - box.width / 2;
            if (x == "right") x = vbox.width - box.width;

            if (y == "top") y = 0;
            if (y == "middle") y = vbox.y + vbox.height / 2 - box.height / 2;
            if (y == "bottom") y = vbox.height - box.height;

            if (x + box.width > vbox.right) x = vbox.right - box.width;
            if (y + box.height > vbox.bottom) y = vbox.bottom - box.height;
            if (x < 0) x = 0;
            if (y < 0) y = 0;

            this.el.style.display = "";

            mini.setX(this.el, x);
            mini.setY(this.el, y);

            this.el.style.left = x + "px";
            this.el.style.top = y + "px";

            //从show方法中移到这里 增加可读性 潘正锋 2013-06-25
            this.x = box.x;
            this.y = box.y;

        }
        this.doLayout();
    },







    _OnButtonClick: function (button, htmlEvent) {
        var e = mini.Window.superclass._OnButtonClick.call(this, button, htmlEvent);
        if (e.cancel == true) return e;

        if (e.name == "max") {
            if (this.state == "max") {
                this.restore();
            } else {
                this.max();
            }
        }
        return e;
    },
    __OnWindowResize: function (e) {
        if (this.state == "max") {
            this.doLayout();


        }
        if (!mini.isIE6) {
            this._doModal();
        }
    },
    __OnWindowMouseDown: function (e) {
        var sf = this;

        if (this.state != "max" && this.allowDrag && mini.isAncestor(this._headerEl, e.target) && !mini.findParent(e.target, "mini-tools")) {
            var sf = this;
            
            //解决window中miniUI组件滚动条拖动时滚动条样式无法覆盖操作系统自带样式的问题（非iframe场景IE7，该if由方法开始处移至此处） 赵美丹 2013-05-17
            if (this.el) {
	            this.el.style.zIndex = mini.getMaxZIndex();
	        }

            var box = this.getBox();
            var drag = new mini.Drag({
                //将false改为true,解决拖动时，鼠标移出外边时，鼠标和window脱离 潘正锋 2013-05-04
                capture: true,
                onStart: function () {
                    sf._maskProxy = mini.append(document.body, '<div class="mini-resizer-mask"></div>');
                    sf._dragProxy = mini.append(document.body, '<div class="mini-drag-proxy"></div>');

                    sf.el.style.display = "none";


                },
                onMove: function (drag) {


                    var x = drag.now[0] - drag.init[0], y = drag.now[1] - drag.init[1];

                    x = box.x + x;
                    y = box.y + y;

                    var vbox = sf.getParentBox();

                    var right = x + box.width;
                    var bottom = y + box.height;
                    if (right > vbox.width) x = vbox.width - box.width;


                    if (x < 0) x = 0;
                    if (y < 0) y = 0;





                    sf.x = x;
                    sf.y = y;


                    var dbox = { x: x, y: y, width: box.width, height: box.height };

                    mini.setBox(sf._dragProxy, dbox);
                    this.moved = true;
                },
                onStop: function () {

                    sf.el.style.display = "block";

                    if (this.moved) {
                        var box = mini.getBox(sf._dragProxy);


                        mini.setXY(sf.el, box.x, box.y);
                    }

                    jQuery(sf._maskProxy).remove();
                    sf._maskProxy = null;

                    jQuery(sf._dragProxy).remove();
                    sf._dragProxy = null;


                }
            });
            drag.start(e);
        }
    },
    destroy: function (removeEl) {

        mini.un(window, "resize", this.__OnWindowResize, this);
        //内存泄露问题优化 赵美丹 2013-04-17
        delete this.buttons;
        if (this._modalEl) {
            jQuery(this._modalEl).remove();
            this._modalEl = null;
        }
        if (this.shadowEl) {
            jQuery(this.shadowEl).remove();
            this.shadowEl = null;
        }
        mini.Window.superclass.destroy.call(this, removeEl);
    },
    getAttrs: function (el) {
        var attrs = mini.Window.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["modalStyle"
            ]
        );
        mini._ParseBool(el, attrs,
            ["showModal", "showShadow", "allowDrag", "allowResize",
            "showMaxButton", "showMinButton"
            ]
        );
        mini._ParseInt(el, attrs,
            ["minWidth", "minHeight", "maxWidth", "maxHeight"
            ]
        );

        return attrs;
    },

    showAtEl: function (atEl, options) {
        atEl = mini.byId(atEl);
        if (!atEl) return;
        if (!this.isRender() || this.el.parentNode != document.body) {
            this.render(document.body);
        }

        var c = {
            xAlign: this.xAlign,
            yAlign: this.yAlign,
            xOffset: 0,
            yOffset: 0,
            popupCls: this.popupCls
        };
        mini.copyTo(c, options);



        this._popupEl = atEl;

        this.el.style.position = "absolute";
        this.el.style.left = "-2000px";
        this.el.style.top = "-2000px";
        this.el.style.display = "";

        this.doLayout();
        this._measureSize();

        var vbox = mini.getViewportBox();
        var box = this.getBox()
        var pbox = mini.getBox(atEl);
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
                    var top = pbox.y - vbox.y;
                    var bottom = vbox.bottom - pbox.bottom;
                    if (top > bottom) {
                        y = pbox.y - box.height;
                    }
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
    }
});

mini.regClass(mini.Window, "window");


