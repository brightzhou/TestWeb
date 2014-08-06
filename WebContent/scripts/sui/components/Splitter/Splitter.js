
/**
 * @fileOverview Splitter.js文件定义了。
 * @requires jQuery
 */

/**
 * @class Splitter 是mini UI中的分割器组件
 * @constructor
 * @extends mini.Control
 * @requires mini.Control
 * @version 1.0
 */
mini.Splitter = function () {
    this._initPanes();
    mini.Splitter.superclass.constructor.call(this);
}
mini.extend(mini.Splitter, mini.Control, /** @lends mini.Splitter.prototype */ {
	/**
	 * 宽度 
	 * @type int
	 * @default {} 300
	 */
    width: 300,
	/**
	 * 宽度 
	 * @type int
	 * @default {} 180
	 */
    height: 180,
    /**
	 * 是否竖向 
	 * @type int
	 * @default {} 250
	 */
    vertical: false,
	/**
	 * 是否允许拖拽调整 
	 * @type int
	 * @default {} 250
	 */
    allowResize: true,
    /**
	 * 左边或上边的pane1
	 * @type Panel
	 * @default {} null
	 */
    pane1: null,
	/**
	 * 右边或下边的pane1 
	 * @type Panel
	 * @default {} null
	 */
    pane2: null,
    /**
	 * 不知道干嘛的 
	 * @type boolean
	 * @default {} true
	 */
    showHandleButton: true,
	/**
	 * 不知道干嘛的  
	 * @type string
	 * @default {} ""
	 */
    handlerStyle: "",
	/**
	 * 不知道干嘛的  
	 * @type string
	 * @default {} ""
	 */
    handlerCls: "",
    /**
	 * 不知道干嘛的  
	 * @type int
	 * @default {} 5
	 */
    handlerSize: 5,
    /**
	 * 此组件的class 
	 * @type string
	 * @default {} mini-splitter
	 */
    uiCls: "mini-splitter",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-splitter";
        this.el.innerHTML = '<div class="mini-splitter-border"><div id="1" class="mini-splitter-pane mini-splitter-pane1"></div><div id="2" class="mini-splitter-pane mini-splitter-pane2"></div><div class="mini-splitter-handler"></div></div>';

        this._borderEl = this.el.firstChild;
        this._pane1El = this._borderEl.firstChild;
        this._pane2El = this._borderEl.childNodes[1];
        this._handlerEl = this._borderEl.lastChild;

    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__OnClick, this);
            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
        }, this);

    },
    _initPanes: function () {
        this.pane1 = {
            id: "",
            index: 1, minSize: 30, maxSize: 3000, size: '', showCollapseButton: false, cls: "", style: "", visible: true, expanded: true
        };
        this.pane2 = mini.copyTo({}, this.pane1);
        this.pane2.index = 2;
    },
    doUpdate: function () {
        this.doLayout();
    },
    doLayout: function () {
        if (!this.canLayout()) return;

        this._handlerEl.style.cursor = this.allowResize ? "" : "default";

        mini.removeClass(this.el, 'mini-splitter-vertical');
        if (this.vertical) {
            mini.addClass(this.el, 'mini-splitter-vertical');
        }

        mini.removeClass(this._pane1El, 'mini-splitter-pane1-vertical');
        mini.removeClass(this._pane2El, 'mini-splitter-pane2-vertical');
        if (this.vertical) {
            mini.addClass(this._pane1El, 'mini-splitter-pane1-vertical');
            mini.addClass(this._pane2El, 'mini-splitter-pane2-vertical');
        }

        mini.removeClass(this._handlerEl, 'mini-splitter-handler-vertical');
        if (this.vertical) {
            mini.addClass(this._handlerEl, 'mini-splitter-handler-vertical');
        }

        var h = this.getHeight(true);
        var w = this.getWidth(true);

        if (!jQuery.boxModel) {
            var b2 = mini.getBorders(this._borderEl);
            h = h + b2.top + b2.bottom;
            w = w + b2.left + b2.right;
        }
        this._borderEl.style.width = w + "px";
        this._borderEl.style.height = h + "px";

        var p1 = this._pane1El, p2 = this._pane2El;
        var jqP1 = jQuery(p1), jqP2 = jQuery(p2);

        p1.style.display = p2.style.display = this._handlerEl.style.display = "";

        var hSize = this.handlerSize;

        this.pane1.size = String(this.pane1.size);
        this.pane2.size = String(this.pane2.size);

        var p1SIZE = parseFloat(this.pane1.size), p2SIZE = parseFloat(this.pane2.size);

        var p1Null = isNaN(p1SIZE), p2Null = isNaN(p2SIZE);
        var p1Percent = !isNaN(p1SIZE) && this.pane1.size.indexOf("%") != -1;
        var p2Percent = !isNaN(p2SIZE) && this.pane2.size.indexOf("%") != -1;
        var p1Number = !p1Null && !p1Percent;
        var p2Number = !p2Null && !p2Percent;

        var size = this.vertical ? h - this.handlerSize : w - this.handlerSize;
        var p1Size = p2Size = 0;

        if (p1Null || p2Null) {
            if (p1Null && p2Null) {
                p1Size = parseInt(size / 2);
                p2Size = size - p1Size;
            } else if (p1Number) {
                p1Size = p1SIZE;
                p2Size = size - p1Size;
            } else if (p1Percent) {
                p1Size = parseInt(size * p1SIZE / 100);
                p2Size = size - p1Size;
            } else if (p2Number) {
                p2Size = p2SIZE;
                p1Size = size - p2Size;
            } else if (p2Percent) {
                p2Size = parseInt(size * p2SIZE / 100);
                p1Size = size - p2Size;
            }
        } else if (p1Percent && p2Number) {
            p2Size = p2SIZE;
            p1Size = size - p2Size;
        } else if (p1Number && p2Percent) {
            p1Size = p1SIZE;
            p2Size = size - p1Size;
        } else {
            var all = p1SIZE + p2SIZE;
            p1Size = parseInt(size * p1SIZE / all);
            p2Size = size - p1Size;
        }

        if (p1Size > this.pane1.maxSize) {
            p1Size = this.pane1.maxSize;
            p2Size = size - p1Size;
        }
        if (p2Size > this.pane2.maxSize) {
            p2Size = this.pane2.maxSize;
            p1Size = size - p2Size;
        }

        if (p1Size < this.pane1.minSize) {
            p1Size = this.pane1.minSize;
            p2Size = size - p1Size;
        }
        if (p2Size < this.pane2.minSize) {
            p2Size = this.pane2.minSize;
            p1Size = size - p2Size;
        }

        if (this.pane1.expanded == false) {
            p2Size = size;
            p1Size = 0;
            p1.style.display = "none";
        } else if (this.pane2.expanded == false) {
            p1Size = size;
            p2Size = 0;
            p2.style.display = "none";
        }

        if (this.pane1.visible == false) {
            p2Size = size + hSize;
            p1Size = hSize = 0;
            p1.style.display = "none";
            this._handlerEl.style.display = "none";
        } else if (this.pane2.visible == false) {
            p1Size = size + hSize;
            p2Size = hSize = 0;
            p2.style.display = "none";
            this._handlerEl.style.display = "none";
        }

        if (this.vertical) {
            mini.setWidth(p1, w);
            mini.setWidth(p2, w);

            mini.setHeight(p1, p1Size);
            mini.setHeight(p2, p2Size);

            p2.style.top = (p1Size + hSize) + "px";

            this._handlerEl.style.left = "0px";
            this._handlerEl.style.top = p1Size + "px";
            mini.setWidth(this._handlerEl, w);
            mini.setHeight(this._handlerEl, this.handlerSize);

            p1.style.left = "0px";
            p2.style.left = "0px";
        } else {
            mini.setWidth(p1, p1Size);
            mini.setWidth(p2, p2Size);

            mini.setHeight(p1, h);
            mini.setHeight(p2, h);
            p2.style.left = (p1Size + hSize) + "px";

            this._handlerEl.style.top = "0px";
            this._handlerEl.style.left = p1Size + "px";
            mini.setWidth(this._handlerEl, this.handlerSize);
            mini.setHeight(this._handlerEl, h);

            p1.style.top = "0px";
            p2.style.top = "0px";
        }

        var s = '<div class="mini-splitter-handler-buttons">';

        if (!this.pane1.expanded || !this.pane2.expanded) {
            if (!this.pane1.expanded) {
                if (this.pane1.showCollapseButton) {
                    s += '<a id="1" class="mini-splitter-pane2-button"></a>';
                }
            } else {
                if (this.pane2.showCollapseButton) {
                    s += '<a id="2" class="mini-splitter-pane1-button"></a>';
                }
            }
        } else {
            if (this.pane1.showCollapseButton) {
                s += '<a id="1" class="mini-splitter-pane1-button"></a>';
            }
            if (this.allowResize) {
                if ((!this.pane1.showCollapseButton && !this.pane2.showCollapseButton)
            ) {
                    s += '<span class="mini-splitter-resize-button"></span>';
                }
            }
            if (this.pane2.showCollapseButton) {
                s += '<a id="2" class="mini-splitter-pane2-button"></a>';
            }
        }
        s += '</div>';
        this._handlerEl.innerHTML = s;
        var buttons = this._handlerEl.firstChild;
        buttons.style.display = this.showHandleButton ? "" : "none";
        var box = mini.getBox(buttons);
        if (this.vertical) {
            buttons.style.marginLeft = -box.width / 2 + "px";
        } else {
            buttons.style.marginTop = -box.height / 2 + "px";
        }

        if (!this.pane1.visible || !this.pane2.visible || !this.pane1.expanded || !this.pane2.expanded) {
            mini.addClass(this._handlerEl, 'mini-splitter-nodrag');
        } else {
            mini.removeClass(this._handlerEl, 'mini-splitter-nodrag');
        }

        mini.layout(this._borderEl);
         this.fire("layout");
    },

    getPaneBox: function (index) {
        var el = this.getPaneEl(index);
        if (!el) return null;
        return mini.getBox(el);
    },
    getPane: function (index) {
        if (index == 1) return this.pane1;
        else if (index == 2) return this.pane2;
        return index;
    },
    setPanes: function (panes) {
        if (!mini.isArray(panes)) return;
        for (var i = 0; i < 2; i++) {
            var p = panes[i];
            this.updatePane(i + 1, p);
        }
    },
    setPaneControls: function (index, value) {
        var pane = this.getPane(index);
        if (!pane) return;
        var el = this.getPaneEl(index);
        __mini_setControls(value, el, this);
    },
    getPaneEl: function (index) {
        if (index == 1) return this._pane1El;
        return this._pane2El;
    },
    updatePane: function (index, options) {
        var pane = this.getPane(index);
        if (!pane) return;
        mini.copyTo(pane, options);
        var el = this.getPaneEl(index);
        var cs = pane.body;
        delete pane.body;
        if (cs) {
            if (!mini.isArray(cs)) cs = [cs];
            for (var i = 0, l = cs.length; i < l; i++) {
                mini.append(el, cs[i]);
            }
        }
        
        if (pane.bodyParent) {
            var p = pane.bodyParent;
            while (p.firstChild) {
                el.appendChild(p.firstChild);
            }
        }
        delete pane.bodyParent;

        el.id = pane.id;

        mini.setStyle(el, pane.style);
        mini.addClass(el, pane['class']);

        if (pane.controls) {
            var index = pane == this.pane1 ? 1 : 2;
            this.setPaneControls(index, pane.controls);
            delete pane.controls;
        }

        this.doUpdate();
    },
    setShowHandleButton: function (value) {
        this.showHandleButton = value;
        this.doUpdate();
    },
    getShowHandleButton: function (value) {
        return this.showHandleButton;
    },
    setVertical: function (value) {
        this.vertical = value;
        this.doUpdate();
    },
    getVertical: function () {
        return this.vertical;
    },
    expandPane: function (index) {
        var pane = this.getPane(index);
        if (!pane) return;
        pane.expanded = true;
        this.doUpdate();
        var e = { pane: pane, paneIndex: this.pane1 == pane ? 1 : 2 };
        this.fire("expand", e);
    },
    collapsePane: function (index) {

        var pane = this.getPane(index);
        if (!pane) return;
        pane.expanded = false;
        var pane2 = pane == this.pane1 ? this.pane2 : this.pane1;
        if (pane2.expanded == false) {
            pane2.expanded = true;
            pane2.visible = true;
        }
        this.doUpdate();

        var e = { pane: pane, paneIndex: this.pane1 == pane ? 1 : 2 };
        this.fire("collapse", e);
    },
    togglePane: function (index) {
        var pane = this.getPane(index);
        if (!pane) return;
        if (pane.expanded) {
            this.collapsePane(pane);
        } else {
            this.expandPane(pane);
        }
    },
    showPane: function (index) {
        var pane = this.getPane(index);
        if (!pane) return;
        pane.visible = true;
        this.doUpdate();
    },
    hidePane: function (index) {
        var pane = this.getPane(index);
        if (!pane) return;
        pane.visible = false;
        var pane2 = pane == this.pane1 ? this.pane2 : this.pane1;
        if (pane2.visible == false) {
            pane2.expanded = true;
            pane2.visible = true;
        }
        this.doUpdate();
    },
    setAllowResize: function (value) {
        if (this.allowResize != value) {
            this.allowResize = value;
            this.doLayout();
        }
    },
    getAllowResize: function () {
        return this.allowResize;
    },
    setHandlerSize: function (value) {
        if (this.handlerSize != value) {
            this.handlerSize = value;
            this.doLayout();
        }
    },
    getHandlerSize: function () {
        return this.handlerSize;
    },
    __OnClick: function (e) {
        var t = e.target;
        if (!mini.isAncestor(this._handlerEl, t)) return;
        var index = parseInt(t.id);
        var pane = this.getPane(index);

        var e = { pane: pane, paneIndex: index, cancel: false };
        if (pane.expanded) {
            this.fire("beforecollapse", e);
        } else {
            this.fire("beforeexpand", e);
        }
        if (e.cancel == true) return;

        if (t.className == "mini-splitter-pane1-button") {
            this.togglePane(index);
        } else if (t.className == "mini-splitter-pane2-button") {
            this.togglePane(index);
        }
    },
    _OnButtonClick: function (pane, htmlEvent) {
        this.fire("buttonclick", {
            pane: pane,
            index: this.pane1 == pane ? 1 : 2,
            htmlEvent: htmlEvent
        });
    },
    onButtonClick: function (fn, scope) {
        this.on("buttonclick", fn, scope);
    },
    
    __OnMouseDown: function (e) {
        var t = e.target;
        if (!this.allowResize) return;
        if (!this.pane1.visible || !this.pane2.visible || !this.pane1.expanded || !this.pane2.expanded) {
            return;
        }
        if (mini.isAncestor(this._handlerEl, t)) {

            if (t.className == "mini-splitter-pane1-button" || t.className == "mini-splitter-pane2-button") {

            } else {
                var drag = this._getDrag();
                drag.start(e);
            }
        }
    },
    _getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    },
    _OnDragStart: function (drag) {
        this._maskProxy = mini.append(document.body, '<div class="mini-resizer-mask"></div>');

        this._dragProxy = mini.append(document.body, '<div class="mini-proxy"></div>');
        this._dragProxy.style.cursor = this.vertical ? "n-resize" : "w-resize";

        this.handlerBox = mini.getBox(this._handlerEl);


        this.elBox = mini.getBox(this._borderEl, true);
        mini.setBox(this._dragProxy, this.handlerBox);
        
    },
    _OnDragMove: function (drag) {
        if (!this.handlerBox) return;
        if (!this.elBox) this.elBox = mini.getBox(this._borderEl, true);
        var w = this.elBox.width, h = this.elBox.height;
        var hSize = this.handlerSize;
        var size = this.vertical ? h - this.handlerSize : w - this.handlerSize;
        var p1Min = this.pane1.minSize, p1Max = this.pane1.maxSize;
        var p2Min = this.pane2.minSize, p2Max = this.pane2.maxSize;

        if (this.vertical == true) {
            var yOffset = drag.now[1] - drag.init[1];
            var y = this.handlerBox.y + yOffset;
            
            if (y - this.elBox.y > p1Max) y = this.elBox.y + p1Max;
            if (y + this.handlerBox.height < this.elBox.bottom - p2Max) {
                y = this.elBox.bottom - p2Max - this.handlerBox.height;
            }
            
            if (y - this.elBox.y < p1Min) y = this.elBox.y + p1Min;
            if (y + this.handlerBox.height > this.elBox.bottom - p2Min) {
                y = this.elBox.bottom - p2Min - this.handlerBox.height;
            }
            mini.setY(this._dragProxy, y);
        } else {
            var xOffset = drag.now[0] - drag.init[0];
            var x = this.handlerBox.x + xOffset;
            
            if (x - this.elBox.x > p1Max) x = this.elBox.x + p1Max;
            if (x + this.handlerBox.width < this.elBox.right - p2Max) {
                x = this.elBox.right - p2Max - this.handlerBox.width;
            }
            
            if (x - this.elBox.x < p1Min) x = this.elBox.x + p1Min;
            if (x + this.handlerBox.width > this.elBox.right - p2Min) {
                x = this.elBox.right - p2Min - this.handlerBox.width;
            }

            mini.setX(this._dragProxy, x);
        }
    },
    _OnDragStop: function (drag) {
        var w = this.elBox.width, h = this.elBox.height;
        var hSize = this.handlerSize;

        var p1SIZE = parseFloat(this.pane1.size), p2SIZE = parseFloat(this.pane2.size);

        var p1Null = isNaN(p1SIZE), p2Null = isNaN(p2SIZE);
        var p1Percent = !isNaN(p1SIZE) && this.pane1.size.indexOf("%") != -1;
        var p2Percent = !isNaN(p2SIZE) && this.pane2.size.indexOf("%") != -1;
        var p1Number = !p1Null && !p1Percent;
        var p2Number = !p2Null && !p2Percent;

        var size = this.vertical ? h - this.handlerSize : w - this.handlerSize;

        
        var box = mini.getBox(this._dragProxy);
        var p1Size = box.x - this.elBox.x, p2Size = size - p1Size;
        if (this.vertical) {
            p1Size = box.y - this.elBox.y;
            p2Size = size - p1Size;
        }

        if (p1Null || p2Null) {
            if (p1Null && p2Null) {
                p1SIZE = parseFloat(p1Size / size * 100).toFixed(1);
                this.pane1.size = p1SIZE + "%";
            } else if (p1Number) {
                p1SIZE = p1Size;
                this.pane1.size = p1SIZE;
            } else if (p1Percent) {
                p1SIZE = parseFloat(p1Size / size * 100).toFixed(1);
                this.pane1.size = p1SIZE + "%";
            } else if (p2Number) {
                p2SIZE = p2Size;
                this.pane2.size = p2SIZE;
            } else if (p2Percent) {
                p2SIZE = parseFloat(p2Size / size * 100).toFixed(1);
                this.pane2.size = p2SIZE + "%";
            }
        } else if (p1Percent && p2Number) {
            this.pane2.size = p2Size;
        } else if (p1Number && p2Percent) {
            this.pane1.size = p1Size;
        } else {
            this.pane1.size = parseFloat(p1Size / size * 100).toFixed(1);
            this.pane2.size = 100 - this.pane1.size;
        }

        jQuery(this._dragProxy).remove();
        jQuery(this._maskProxy).remove();

        this._maskProxy = null;
        this._dragProxy = null;
        this.elBox = this.handlerBox = null;

        this.doLayout();
         this.fire("resize");
    },
    
    getAttrs: function (el) {
        var attrs = mini.Splitter.superclass.getAttrs.call(this, el);

        mini._ParseBool(el, attrs,
            ["allowResize", "vertical", "showHandleButton", "onresize"
             ]
        );
        mini._ParseInt(el, attrs,
            ["handlerSize"
             ]
        );

        var panes = [];

        var nodes = mini.getChildNodes(el);
        for (var i = 0, l = 2; i < l; i++) {
            var node = nodes[i];
            var g = jQuery(node);

            var o = {};
            panes.push(o);
            if (!node) continue;
            o.style = node.style.cssText;
            mini._ParseString(node, o,
                ["cls", "size", "id", "class"
                 ]
            );
            mini._ParseBool(node, o,
                ["visible", "expanded", "showCollapseButton"
                 ]
            );
            mini._ParseInt(node, o,
                ["minSize", "maxSize", "handlerSize"
                 ]
            );

            o.bodyParent = node;
        }
        attrs.panes = panes;

        return attrs;
    }
});
mini.regClass(mini.Splitter, "splitter");