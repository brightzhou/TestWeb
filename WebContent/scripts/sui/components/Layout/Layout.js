
/**
*   构造函数，调用mini.Control和mini.Component的构造函数，在父类的构造函数中执行_create和_initEvents
*   实现属性初始化
*   @author  王洪涛
*/
mini.Layout = function () {
    this.regions = [];
    this.regionMap = {};
    mini.Layout.superclass.constructor.call(this);
}
/**
*   采用属性复制的方式事项方法的继承，同时实现方法的重载。
*   @author  王洪涛
*/
mini.extend(mini.Layout, mini.Control, {
    regions: [],
    splitSize: 5,
    collapseWidth: 28,
    collapseHeight: 25,
    regionWidth: 150,
    regionHeight: 80,
    regionMinWidth: 50,
    regionMinHeight: 25,
    regionMaxWidth: 2000,
    regionMaxHeight: 2000,

	//本类声明时页面上class 属性所定义的值
    uiCls: "mini-layout",
    destroy: function (removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        mini.clearEvent(document);
        if(this._borderEl){
            mini.clearEvent(this._borderEl);
            this._borderEl.parentNode.removeChild(this._borderEl);
            this._borderEl = null;
        }
        if(this.drag){
            mini.clearEvent(this.drag);
            this.drag.destroy(removeEl);
            this.drag = null;
        }
        var scope = this;
        $.each(this.regions, function(){
            scope._destroyRegionEl(this);
        });
        delete this.regions;
        delete this.regionMap;
        mini.Layout.superclass.destroy.call(this, removeEl);
    },
    //创建一个组件
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-layout";
        this.el.innerHTML = '<div class="mini-layout-border"></div>';

        this._borderEl = this.el.firstChild;

        this.doUpdate();
    },
    //实现事件的初始化
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__OnClick, this);
            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            mini.on(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(this.el, "mouseout", this.__OnMouseOut, this);

            mini.on(document, "mousedown", this.__OnDocMouseDown, this);
        }, this);
    },	
	/**
	*   返回Layout组件的一个子区域
	*   @param  region 在页面定义子区域时所使用的region属性
	*/
    getRegionEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._el;
    },
    
    /**
	*   返回Layout组件的一个子区域;如果region定义返回指定的区域否则返回头部
	*   @param  region 在页面定义子区域时所使用的region属性
	*/
    getRegionHeaderEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._header;
    },
    /**
	*   返回Layout组件的一个子区域;如果region定义返回指定的区域否则返回区域本体
	*   @param  region 在页面定义子区域时所使用的region属性
	*/
    getRegionBodyEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._body;
    },
    getRegionSplitEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._split
    },
    getRegionProxyEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return null;
        return region._proxy;
    },
    getRegionBox: function (region) {
        var el = this.getRegionEl(region);
        if (el) return mini.getBox(el);
        return null;
    },
    getRegion: function (region) {
        if (typeof region == "string") return this.regionMap[region];
        return region;
    },
    
    /**
	*   返回Layout组件的一个子区域中的控件，例如折叠控件或者隐藏控件
	*   @param  region 在页面定义子区域时所使用的region属性
	*   @param  name 子区域中控件的名字
	*/
	
    _getButton: function (region, name) {
        var buttons = region.buttons;
        for (var i = 0, l = buttons.length; i < l; i++) {
            var button = buttons[i];
            if (button.name == name) return button;
        }
    },
    /**
    *    创建一个region对象，即region的构造函数。
    */
    _createRegion: function (options) {

        var region = mini.copyTo({
            region: "", 
            title: "", 
            iconCls: "", 
            iconStyle: "",
            showCloseButton: false, showCollapseButton: true,
            buttons: [
                { name: "close", cls: "mini-tools-close", html: "", visible: false },
                { name: "collapse", cls: "mini-tools-collapse", html: "", visible: true }
            ],
            showSplitIcon: false, 
            showSplit: true,    
            showHeader: true,
            splitSize: this.splitSize, 
            collapseSize: this.collapseWidth,
            width: this.regionWidth, 
            height: this.regionHeight,
            minWidth: this.regionMinWidth, 
            minHeight: this.regionMinHeight,
            maxWidth: this.regionMaxWidth, 
            maxHeight: this.regionMaxHeight,
            allowResize: true,
            cls: "", 
            style: "",
            headerCls: "", 
            headerStyle: "",
            bodyCls: "", 
            bodyStyle: "",
            visible: true,
            expanded: true
        }, options);
        return region;
    },
    /**
    *  创建一个Region 对应的Dom元素,即为这个Region设置_el属性
    */
    _CreateRegionEl: function (region) {
        var region = this.getRegion(region);
        if (!region) return;
        //增加对namebodyCls配置的支持 赵美丹 2012-11-16
        mini.append(this._borderEl, '<div id="' + region.region + '" class="mini-layout-region"><div class="mini-layout-region-header" style="' + region.headerStyle + '"></div><div class="mini-layout-region-body '+region.bodyCls+'" style="' + region.bodyStyle + '"></div></div>');
        region._el = this._borderEl.lastChild;
        region._header = region._el.firstChild;
        region._body = region._el.lastChild;
        
        //解决layout内部滚动时，下拉框弹出层脱离输入框的问题（修改为隐藏） 赵美丹 2013-04-09
        mini.on(region._body, "scroll", function(){
            $("body").trigger("mousedown");
        }, this);

        if (region.cls) mini.addClass(region._el, region.cls);
        if (region.style) mini.setStyle(region._el, region.style);

        mini.addClass(region._el, 'mini-layout-region-' + region.region);

        
        if (region.region != "center") {
            mini.append(this._borderEl, '<div uid="' + this.uid + '" id="' + region.region + '" class="mini-layout-split"><div class="mini-layout-spliticon"></div></div>');
            region._split = this._borderEl.lastChild;
            mini.addClass(region._split, 'mini-layout-split-' + region.region);
        }

        
        if (region.region != "center") {
            mini.append(this._borderEl, '<div id="' + region.region + '" class="mini-layout-proxy"></div>');
            region._proxy = this._borderEl.lastChild;
            mini.addClass(region._proxy, 'mini-layout-proxy-' + region.region);
        }

    },
    _destroyRegionEl : function(region){
    	//内存泄露问题优化 赵美丹 2013-04-17
        if (!region) return;
        if(region._header){
            mini.clearEvent(region._header);
            region._header.parentNode.removeChild(region._header);
            region._header = null;
        }
        if(region._body){
            mini.clearEvent(region._body);
            region._body.parentNode.removeChild(region._body);
            region._body = null;
        }
        if(region._el){
            mini.clearEvent(region._el);
            region._el.parentNode.removeChild(region._el);
            region._el = null;
        }
        if(region._split){
            mini.clearEvent(region._split);
            region._split.parentNode.removeChild(region._split);
            region._split = null;
        }
        if(region._proxy){
            mini.clearEvent(region._proxy);
            region._proxy.parentNode.removeChild(region._proxy);
            region._proxy = null;
        }
        mini.clearEvent(region);
        region = null;
    },
    setRegionControls: function (region, value) {
        var region = this.getRegion(region);
        if (!region) return;
        var el = this.getRegionBodyEl(region);
        __mini_setControls(value, el, this);
    },    
    
    /**
    *   Layout对象内的各region对象赋值，通常页面parse()函数中调用
    */
    setRegions: function (regions) {
        if (!mini.isArray(regions)) return;
        for (var i = 0, l = regions.length; i < l; i++) {
            this.addRegion(regions[i]);
        }

    },
    /**
    *   确定将一个region增加到Layout的容器中，增加到Layout的regions和regionMap属性内
    *
    */
    addRegion: function (region, index) {
        var r1 = region;
        region = this._createRegion(region);

        if (!region.region) region.region = "center";
        region.region = region.region.toLowerCase();
        if (region.region == "center" && r1 && !r1.showHeader) {
            region.showHeader = false;
        }
        if (region.region == "north" || region.region == "south") {
            if (!r1.collapseSize) {
                region.collapseSize = this.collapseHeight;
            }
        }

        this._measureRegion(region);

        if (typeof index != "number") index = this.regions.length;
        var r = this.regionMap[region.region];
        if (r) {
            
            return;
        }
        this.regions.insert(index, region);
        this.regionMap[region.region] = region;

        this._CreateRegionEl(region);

        var el = this.getRegionBodyEl(region);

        
        var cs = region.body;
        delete region.body;
        if (cs) {
            if (!mini.isArray(cs)) cs = [cs];
            for (var i = 0, l = cs.length; i < l; i++) {
                mini.append(el, cs[i]);
            }
        }

        
        if (region.bodyParent) {
            var p = region.bodyParent;
            while (p.firstChild) {
                el.appendChild(p.firstChild);
            }
        }
        delete region.bodyParent;

        
        if (region.controls) {        
            this.setRegionControls(region, region.controls);
            delete region.controls;
        }

        this.doUpdate();
    },
    /**
    *   删除一个region
    */
    removeRegion: function (region) {
        var region = this.getRegion(region);
        if (!region) return;
        this.regions.remove(region);
        delete this.regionMap[region.region];

        jQuery(region._el).remove();
        jQuery(region._split).remove();
        jQuery(region._proxy).remove();

        this.doUpdate();
    },
    
    moveRegion: function (region, index) {
        var region = this.getRegion(region);
        if (!region) return;
        var t = this.regions[index];
        if (!t || t == region) return;
        this.regions.remove(region);
        var index = this.region.indexOf(t);
        this.regions.insert(index, region);
        this.doUpdate();
    },
    _measureRegion: function (region) {
        var button = this._getButton(region, "close");
        button.visible = region.showCloseButton;
        var button = this._getButton(region, "collapse");
        button.visible = region.showCollapseButton;

        if (region.width < region.minWidth) region.width = mini.minWidth;
        if (region.width > region.maxWidth) region.width = mini.maxWidth;
        if (region.height < region.minHeight) region.height = mini.minHeight;
        if (region.height > region.maxHeight) region.height = mini.maxHeight;
    },
    /**
    *   更新region的属性
    */
    updateRegion: function (region, options) {
        region = this.getRegion(region);
        if (!region) return;
        if (options) delete options.region;
        mini.copyTo(region, options);

        this._measureRegion(region);

        this.doUpdate();
    },
    /**
    *   展开一个region
    */
    expandRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.expanded = true;
        this.doUpdate();
    },
    /**
    *   隐藏一个region
    */
    collapseRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.expanded = false;
        this.doUpdate();
    },
    toggleRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        if (region.expanded) {
            this.collapseRegion(region);
        } else {
            this.expandRegion(region);
        }
    },
    /**
    *    显示一个区域
    */
    showRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.visible = true;
        this.doUpdate();
    },
    /**
    *    隐藏一个区域
    */
    hideRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return;
        region.visible = false;
        this.doUpdate();
    },
    /**
    *   判断一个区域的是否展看
    */
    isExpandRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return null;
        return this.region.expanded;
    },
    /**
    *   判断是一个区域是否显示
    */
    isVisibleRegion: function (region) {
        region = this.getRegion(region);
        if (!region) return null;
        return this.region.visible;
    },
    _tryToggleRegion: function (region) {
        region = this.getRegion(region);

        var e = {
            region: region,
            cancel: false
        };
        if (region.expanded) {
            this.fire("BeforeCollapse", e);
            if (e.cancel == false) {
                this.collapseRegion(region);
            }
        } else {
            this.fire("BeforeExpand", e);
            if (e.cancel == false) {
                this.expandRegion(region);
            }
        }
    },
    
    _getProxyElByEvent: function (e) {
        var el = mini.findParent(e.target, 'mini-layout-proxy');
        return el;
    },
    _getRegionElByEvent: function (e) {
        var el = mini.findParent(e.target, 'mini-layout-region');
        return el;
    },
    __OnClick: function (e) {
        if (this._inAniming) return;
        var proxyEl = this._getProxyElByEvent(e);
        if (proxyEl) {
            var region = proxyEl.id;
            var collapseEl = mini.findParent(e.target, 'mini-tools-collapse');
            if (collapseEl) {
                this._tryToggleRegion(region);
            } else {
                this._VirtualToggle(region);
            }
        }

        var regionEl = this._getRegionElByEvent(e);
        if (regionEl && mini.findParent(e.target, 'mini-layout-region-header')) {
            var region = regionEl.id;
            var collapseEl = mini.findParent(e.target, 'mini-tools-collapse');
            if (collapseEl) {
                this._tryToggleRegion(region);
            }
            var closeEl = mini.findParent(e.target, 'mini-tools-close');
            if (closeEl) {
                this.updateRegion(region, { visible: false });
            }
        }
        if (mini.hasClass(e.target, 'mini-layout-spliticon')) {
            var region = e.target.parentNode.id;
            this._tryToggleRegion(region);
        }

    },
    _OnButtonClick: function (region, button, htmlEvent) {
        this.fire("buttonclick", {
            htmlEvent: htmlEvent,
            region: region,
            button: button,
            index: this.buttons.indexOf(button),
            name: button.name
        });
    },
    _OnButtonMouseDown: function (region, button, htmlEvent) {
        this.fire("buttonmousedown", {
            htmlEvent: htmlEvent,
            region: region,
            button: button,
            index: this.buttons.indexOf(button),
            name: button.name
        });
    },
    hoverProxyEl: null,
    __OnMouseOver: function (e) {
        var proxyEl = this._getProxyElByEvent(e);
        if (proxyEl) {
            mini.addClass(proxyEl, 'mini-layout-proxy-hover');
            this.hoverProxyEl = proxyEl;
        }
    },
    __OnMouseOut: function (e) {
        if (this.hoverProxyEl) {
            mini.removeClass(this.hoverProxyEl, 'mini-layout-proxy-hover');
        }
        this.hoverProxyEl = null;
    },

    onButtonClick: function (fn, scope) {
        this.on("buttonclick", fn, scope);
    },
    onButtonMouseDown: function (fn, scope) {
        this.on("buttonmousedown", fn, scope);
    }

});

mini.copyTo(mini.Layout.prototype, {
    _createHeader: function (region, proxy) {
        var s = '<div class="mini-tools">';
        if (proxy) {
            s += '<span class="mini-tools-collapse"></span>';
        } else {
            for (var i = region.buttons.length - 1; i >= 0; i--) {
                var button = region.buttons[i];
                s += '<span class="' + button.cls + '" style="'
                s += button.style + ';' + (button.visible ? "" : "display:none;") + '">' + button.html + '</span>';
            }
        }
        s += '</div>';

        s += '<div class="mini-layout-region-icon ' + region.iconCls + '" style="' + region.iconStyle + ';' + ((region.iconStyle || region.iconCls) ? "" : "display:none;") + '"></div>';
        s += '<div class="mini-layout-region-title">' + region.title + '</div>';
        return s;
    },
    doUpdate: function () {
        for (var i = 0, l = this.regions.length; i < l; i++) {
            var region = this.regions[i];
            var type = region.region;
            var el = region._el, split = region._split, proxy = region._proxy;

            if (region.cls) mini.addClass(el, region.cls);

            region._header.style.display = region.showHeader ? "" : "none";
            region._header.innerHTML = this._createHeader(region);
            if (region._proxy) region._proxy.innerHTML = this._createHeader(region, true);

            if (split) {
                mini.removeClass(split, 'mini-layout-split-nodrag');
                if (region.expanded == false || !region.allowResize) {
                    mini.addClass(split, 'mini-layout-split-nodrag')
                }
            }

        }

        this.doLayout();
    },
    doLayout: function () {

        if (!this.canLayout()) {

            return;
        }

        if (this._inAniming) {
            
            return;
        }
        
        var h = mini.getHeight(this.el, true); 
        var w = mini.getWidth(this.el, true); 
        var box = { x: 0, y: 0, width: w, height: h };

        var regions = this.regions.clone();
        var center = this.getRegion("center");
        regions.remove(center);
        if (center) {
            regions.push(center);
        }

        for (var i = 0, l = regions.length; i < l; i++) {
            var region = regions[i];
            region._Expanded = false;
            mini.removeClass(region._el, "mini-layout-popup");

            var type = region.region;
            var el = region._el, split = region._split, proxy = region._proxy;
            if (region.visible == false) {
                el.style.display = "none";
                if (type != "center") split.style.display = proxy.style.display = "none";
                continue;
            }
            el.style.display = "";
            if (type != "center") split.style.display = proxy.style.display = "";

            var x = box.x, y = box.y, w = box.width, h = box.height;
            var cw = region.width, ch = region.height;
            
            if (!region.expanded) {
                if (type == "west" || type == "east") {
                    cw = region.collapseSize;
                    mini.setWidth(el, region.width);
                } else if (type == "north" || type == "south") {
                    ch = region.collapseSize;
                    mini.setHeight(el, region.height);
                }
            }

            switch (type) {
                case "north":
                    h = ch;
                    box.y += ch;
                    box.height -= ch;
                    break;
                case "south":
                    h = ch;
                    y = box.y + box.height - ch;
                    box.height -= ch;
                    break;
                case "west":
                    w = cw;
                    box.x += cw;
                    box.width -= cw;
                    break;
                case "east":
                    w = cw;
                    x = box.x + box.width - cw;
                    box.width -= cw;
                    break;
                case "center":
                    break;
                default:
                    continue;
            }
            if (w < 0) w = 0;
            if (h < 0) h = 0;

            
            if (type == "west" || type == "east") {
                mini.setHeight(el, h);
            }
            if (type == "north" || type == "south") {
                mini.setWidth(el, w);
            }

            var style = "left:" + x + "px;top:" + y + "px;";
            var d = el;
            if (!region.expanded) {
                d = proxy;
                el.style.top = "-100px";
                el.style.left = "-1500px";
            } else {
                if (proxy) {
                    proxy.style.left = "-1500px";
                    proxy.style.top = "-100px";
                }
            }
            d.style.left = x + "px";
            d.style.top = y + "px";
            mini.setWidth(d, w);
            mini.setHeight(d, h);
            
            //解决IE6下内容区宽度超出时region._body随之变宽导致滚动条显示不正常的问题 赵美丹 2012-12-12
            if(isIE6){
            	mini.setWidth(region._body, w);
            }
            
            var regionH = jQuery(region._el).height()
            var headerH = region.showHeader ? jQuery(region._header).outerHeight() : 0;
            mini.setHeight(region._body, regionH - headerH);

            
            if (type == "center") continue;

            cw = ch = region.splitSize;
            var x = box.x, y = box.y, w = box.width, h = box.height;
            switch (type) {
                case "north":
                    h = ch;
                    box.y += ch;
                    box.height -= ch;
                    break;
                case "south":
                    h = ch;
                    y = box.y + box.height - ch;
                    box.height -= ch;
                    break;
                case "west":
                    w = cw;
                    box.x += cw;
                    box.width -= cw;
                    break;
                case "east":
                    w = cw;
                    x = box.x + box.width - cw;
                    box.width -= cw;
                    break;
                case "center":
                    break;
            }
            if (w < 0) w = 0;
            if (h < 0) h = 0;

            
            split.style.left = x + "px";
            split.style.top = y + "px";
            mini.setWidth(split, w);
            mini.setHeight(split, h);

            if (region.showSplit && region.expanded && region.allowResize == true) {
                mini.removeClass(split, 'mini-layout-split-nodrag');
            } else {
                mini.addClass(split, 'mini-layout-split-nodrag');
            }
            

            
            split.firstChild.style.display = region.showSplitIcon ? "block" : "none";
            if (region.expanded) {
                mini.removeClass(split.firstChild, 'mini-layout-spliticon-collapse');
            } else {
                mini.addClass(split.firstChild, 'mini-layout-spliticon-collapse');
            }
        }
        mini.layout(this._borderEl);
        this.fire("layout");
    },
    
    
    __OnMouseDown: function (e) {
        if (this._inAniming) return;
        if (mini.findParent(e.target, "mini-layout-split")) {
            var uid = jQuery(e.target).attr("uid");
            if (uid != this.uid) return;
            var region = this.getRegion(e.target.id);
            if (region.expanded == false || !region.allowResize || !region.showSplit) return;
            this.dragRegion = region;
            var drag = this._getDrag();
            drag.start(e);
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
        this._dragProxy.style.cursor = "n-resize";
        if (this.dragRegion.region == "west" || this.dragRegion.region == "east") {
            this._dragProxy.style.cursor = "w-resize";
        }

        this.splitBox = mini.getBox(this.dragRegion._split);
        mini.setBox(this._dragProxy, this.splitBox);

        this.elBox = mini.getBox(this.el, true);
    },
    _OnDragMove: function (drag) {
        var xOffset = drag.now[0] - drag.init[0];
        var x = this.splitBox.x + xOffset;
        var yOffset = drag.now[1] - drag.init[1];
        var y = this.splitBox.y + yOffset;
        var right = x + this.splitBox.width;
        var bottom = y + this.splitBox.height;

        var west = this.getRegion("west"),
            east = this.getRegion("east"),
            north = this.getRegion("north"),
            south = this.getRegion("south"),
            center = this.getRegion("center");
        var westWidth = west && west.visible ? west.width : 0;
        var eastWidth = east && east.visible ? east.width : 0;
        var northHeight = north && north.visible ? north.height : 0;
        var southHeight = south && south.visible ? south.height : 0;
        var westSplitWidth = west && west.showSplit ? mini.getWidth(west._split) : 0;
        var eastSplitWidth = east && east.showSplit ? mini.getWidth(east._split) : 0;
        var northSplitHeight = north && north.showSplit ? mini.getHeight(north._split) : 0;
        var southSplitHeight = south && south.showSplit ? mini.getHeight(south._split) : 0;

        var region = this.dragRegion, type = region.region;
        if (type == "west") {
            var maxWidth = this.elBox.width - eastWidth - eastSplitWidth - westSplitWidth - center.minWidth;
            if (x - this.elBox.x > maxWidth) x = maxWidth + this.elBox.x;

            if (x - this.elBox.x < region.minWidth) x = region.minWidth + this.elBox.x;
            if (x - this.elBox.x > region.maxWidth) x = region.maxWidth + this.elBox.x;

            mini.setX(this._dragProxy, x);
        } else if (type == "east") {
            var maxWidth = this.elBox.width - westWidth - westSplitWidth - eastSplitWidth - center.minWidth;
            if (this.elBox.right - (x + this.splitBox.width) > maxWidth) {
                x = this.elBox.right - maxWidth - this.splitBox.width;
            }

            if (this.elBox.right - (x + this.splitBox.width) < region.minWidth) {
                x = this.elBox.right - region.minWidth - this.splitBox.width;
            }
            if (this.elBox.right - (x + this.splitBox.width) > region.maxWidth) {
                x = this.elBox.right - region.maxWidth - this.splitBox.width;
            }

            mini.setX(this._dragProxy, x);
        } else if (type == "north") {
            var maxHeight = this.elBox.height - southHeight - southSplitHeight - northSplitHeight - center.minHeight;
            if (y - this.elBox.y > maxHeight) y = maxHeight + this.elBox.y;

            if (y - this.elBox.y < region.minHeight) y = region.minHeight + this.elBox.y;
            if (y - this.elBox.y > region.maxHeight) y = region.maxHeight + this.elBox.y;

            mini.setY(this._dragProxy, y);
        } else if (type == "south") {
            var maxHeight = this.elBox.height - northHeight - northSplitHeight - southSplitHeight - center.minHeight;
            if (this.elBox.bottom - (y + this.splitBox.height) > maxHeight) {
                y = this.elBox.bottom - maxHeight - this.splitBox.height;
            }

            if (this.elBox.bottom - (y + this.splitBox.height) < region.minHeight) {
                y = this.elBox.bottom - region.minHeight - this.splitBox.height;
            }
            if (this.elBox.bottom - (y + this.splitBox.height) > region.maxHeight) {
                y = this.elBox.bottom - region.maxHeight - this.splitBox.height;
            }

            mini.setY(this._dragProxy, y);
        }
    },
    _OnDragStop: function (drag) {
        var box = mini.getBox(this._dragProxy);

        var region = this.dragRegion, type = region.region;
        if (type == "west") {
            var width = box.x - this.elBox.x;
            this.updateRegion(region, { width: width });
        } else if (type == "east") {
            var width = this.elBox.right - box.right;
            this.updateRegion(region, { width: width });
        } else if (type == "north") {
            var height = box.y - this.elBox.y;
            this.updateRegion(region, { height: height });
        } else if (type == "south") {
            var height = this.elBox.bottom - box.bottom;
            this.updateRegion(region, { height: height });
        }

        jQuery(this._dragProxy).remove();
        this._dragProxy = null;
        this.elBox = this.handlerBox = null;

        jQuery(this._maskProxy).remove();
        this._maskProxy = null;
    },
    
    
    _VirtualToggle: function (region) {
        region = this.getRegion(region);

        if (region._Expanded === true) {
            this._VirtualCollapse(region);
        } else {
            this._VirtualExpand(region);
        }
    },
    _VirtualExpand: function (region) {
        if (this._inAniming) return;

        this.doLayout();

        var type = region.region, el = region._el;
        region._Expanded = true;
        mini.addClass(el, "mini-layout-popup");
        var proxyBox = mini.getBox(region._proxy);
        var box = mini.getBox(region._el);

        var config = {};
        if (type == "east") {
            var x = proxyBox.x;
            var y = proxyBox.y;
            var h = proxyBox.height;

            mini.setHeight(el, h);
            mini.setX(el, x);
            el.style.top = region._proxy.style.top;

            var left = parseInt(el.style.left);
            config = { left: left - box.width };
        } else if (type == "west") {
            var x = proxyBox.right - box.width;
            var y = proxyBox.y;
            var h = proxyBox.height;

            mini.setHeight(el, h);
            mini.setX(el, x);
            el.style.top = region._proxy.style.top;
            
            
            var left = parseInt(el.style.left);
            config = { left: left + box.width };
        } else if (type == "north") {
            var x = proxyBox.x;
            var y = proxyBox.bottom - box.height;
            var w = proxyBox.width;

            mini.setWidth(el, w);
            mini.setXY(el, x, y);

            var top = parseInt(el.style.top);
            config = { top: top + box.height };
        } else if (type == "south") {
            var x = proxyBox.x;
            var y = proxyBox.y;
            var w = proxyBox.width;

            mini.setWidth(el, w);
            mini.setXY(el, x, y);

            var top = parseInt(el.style.top);
            config = { top: top - box.height };
        }

        mini.addClass(region._proxy, "mini-layout-maxZIndex");
        this._inAniming = true;
        var sf = this;
        var jq = jQuery(el);
        jq.animate(
            config,
            250,
            function () {
                mini.removeClass(region._proxy, "mini-layout-maxZIndex");
                sf._inAniming = false;
            }
        );
    },
    _VirtualCollapse: function (region) {
        if (this._inAniming) return;
        region._Expanded = false;
        var type = region.region, el = region._el;

        var box = mini.getBox(el);

        var config = {};
        if (type == "east") {
            var left = parseInt(el.style.left);
            config = { left: left + box.width };
        } else if (type == "west") {
            var left = parseInt(el.style.left);
            config = { left: left - box.width };
        } else if (type == "north") {
            var top = parseInt(el.style.top);
            config = { top: top - box.height };
        } else if (type == "south") {
            var top = parseInt(el.style.top);
            config = { top: top + box.height };
        }

        mini.addClass(region._proxy, "mini-layout-maxZIndex");
        this._inAniming = true;
        var sf = this;
        var jq = jQuery(el);
        jq.animate(
            config,
            250,
            function () {
                mini.removeClass(region._proxy, "mini-layout-maxZIndex");
                sf._inAniming = false;
                sf.doLayout();
            }
        );
    },
    __OnDocMouseDown: function (e) {
        if (this._inAniming) return;
        for (var i = 0, l = this.regions.length; i < l; i++) {
            var region = this.regions[i];
            if (!region._Expanded) continue;
            if (mini.isAncestor(region._el, e.target)
              || mini.isAncestor(region._proxy, e.target)
              ) {

            } else {
                this._VirtualCollapse(region);
            }
        }
    },
    
    /**
    *	得到一个Dom元素的页面中设置的属性，并将页面中定义的region加入到加入到组件中
    */
    getAttrs: function (el) {
        var attrs = mini.Layout.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        var splitSize = parseInt(jq.attr("splitSize"));
        if (!isNaN(splitSize)) {
            attrs.splitSize = splitSize;
        }

        var regions = [];
        var nodes = mini.getChildNodes(el);
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            var o = {};
            regions.push(o);

            o.cls = node.className;

            o.style = node.style.cssText;
            mini._ParseString(node, o,
                ["region", "title", "iconCls", "iconStyle", "cls", "headerCls", "headerStyle",
                    "bodyCls", "bodyStyle"
                 ]
            );
            mini._ParseBool(node, o,
                ["allowResize", "visible", "showCloseButton", "showCollapseButton", "showSplit", "showHeader", "expanded",
                "showSplitIcon"
                 ]
            );
            mini._ParseInt(node, o,
                ["splitSize", "collapseSize", "width", "height", "minWidth", "minHeight"
                , "maxWidth", "maxHeight"
                 ]
            );

            
            
            o.bodyParent = node;
        }
        attrs.regions = regions;

        return attrs;
    }
});
mini.regClass(mini.Layout, "layout");