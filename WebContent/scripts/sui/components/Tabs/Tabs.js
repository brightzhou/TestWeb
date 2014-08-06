
/**
*   声明组件mini.Tabs；调用mini.Control和mini.Component的构造函数，在父类的构造函数中执行_create和_initEvents
*   实现属性初始化
*/
mini.Tabs = function () {    
    this._initTabs();
    mini.Tabs.superclass.constructor.call(this);
}
mini.extend(mini.Tabs, mini.Control, {
    activeIndex: -1,
    tabAlign: "left",   
    tabPosition: "top", 
    showBody: true,

    nameField: "name",
    titleField: "title",
    urlField: "url",

    url: "",
    maskOnLoad: true,
    plain: true,

    
    
    
    

    bodyStyle: "",

    _tabHoverCls: "mini-tab-hover",
    _tabActiveCls: "mini-tab-active",
	
	/**
	*	设置组件的属性,在函数执行中通过调用父类(mini.Control)的set，查找contextMenu属性设置的值，得到上线文菜单。
	*/
    set: function (obj) {
        if (typeof obj == 'string') {
            return this;
        }

        var _allowLayout = this._allowLayout;
        this._allowLayout = false;

        var activeIndex = obj.activeIndex;
        delete obj.activeIndex;

        var url = obj.url;
        delete obj.url;

        mini.Tabs.superclass.set.call(this, obj);

        if (url) {
            this.setUrl(url);
        }
        if (mini.isNumber(activeIndex)) {
            this.setActiveIndex(activeIndex);
        }

        this._allowLayout = _allowLayout;
        this.doLayout();

        return this;
    },

    uiCls: "mini-tabs",
    /**
    *	为组件创建对应的DOM元素
    */
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-tabs";

        var s = '<table class="mini-tabs-table" cellspacing="0" cellpadding="0"><tr style="width:100%;">'
                    + '<td></td>'
                    + '<td style="text-align:left;vertical-align:top;width:100%;"><div class="mini-tabs-bodys"></div></td>'
                    + '<td></td>'
                + '</tr></table>';
        this.el.innerHTML = s;
        this._tableEl = this.el.firstChild;

        var tds = this.el.getElementsByTagName("td");
        this._td1El = tds[0];
        this._td2El = tds[1];
        this._td3El = tds[2];

        this._bodyEl = this._td2El.firstChild;
        this._borderEl = this._bodyEl;
        this.doUpdate();
    },
    destroy: function (removeEl) {
        this._tableEl = this._td1El = this._td2El = this._td3El = null;
        this._bodyEl = this._borderEl = this.headerEl = null;
        this.tabs = [];
        mini.Tabs.superclass.destroy.call(this, removeEl);
    },

    /**
    *	清空Tab子元素（左右两个TD) 的属性的属性
    */
    _doClearElement: function () {
        mini.removeClass(this._td1El, "mini-tabs-header");
        mini.removeClass(this._td3El, "mini-tabs-header");
        this._td1El.innerHTML = '';
        this._td3El.innerHTML = '';

        mini.removeChilds(this._td2El, this._bodyEl);
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            mini.on(this.el, "click", this.__OnClick, this);
            mini.on(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(this.el, "mouseout", this.__OnMouseOut, this);
        }, this);

    },
	/**
	*	为组件设置初始化属性
	*/
    _initTabs: function () {
        this.tabs = [];
    },
    _TabID: 1,

    createTab: function (options) {
        var tab = mini.copyTo({
            _id: this._TabID++,
            name: "",
            title: "",

            newLine: false,

            iconCls: "",
            iconStyle: "",
            headerCls: "",
            headerStyle: "",
            bodyCls: "",
            bodyStyle: "",

            visible: true,
            enabled: true,
            showCloseButton: false,
            active: false,

            url: "",
            loaded: false,
            refreshOnClick: false

        }, options);
        if (options) {
            options = mini.copyTo(options, tab);
            tab = options;
        }
        return tab;
    },
    
    _doLoad: function () {

        var tabs = mini.getData(this.url);

        if (this.dataField) {
            tabs = mini._getMap(this.dataField, tabs);
        }
        if (!tabs) tabs = [];

        this.setTabs(tabs);
        this.fire("load");
    },


    load: function (url) {
        if (typeof url == "string") {
            this.setUrl(url);
        } else {
            this.setTabs(url);
        }
    },
    setUrl: function (value) {
        this.url = value;

        this._doLoad();
    },
    getUrl: function () {
        return this.url;
    },

    setNameField: function (value) {
        this.nameField = value;
    },
    getNameField: function () {
        return this.nameField;
    },
    setTitleField: function (value) {
        this.titleField = value;
    },
    getTitleField: function () {
        return this.titleField;
    },
    setUrlField: function (value) {
        this.urlField = value;
    },
    getUrlField: function () {
        return this.urlField;
    },
    setTabControls: function (tab, value) {
        var tab = this.getTab(tab);
        if (!tab) return;
        var el = this.getTabBodyEl(tab);
        __mini_setControls(value, el, this);
    },
    setTabs: function (tabs) {
        if (!mini.isArray(tabs)) return;
        this.beginUpdate();

        this.removeAll();
        for (var i = 0, l = tabs.length; i < l; i++) {
            var tab = tabs[i];
            tab.title = mini._getMap(this.titleField, tab);
            tab.url = mini._getMap(this.urlField, tab);
            tab.name = mini._getMap(this.nameField, tab);
        }

        for (var i = 0, l = tabs.length; i < l; i++) {
            this.addTab(tabs[i]);
        }
        this.setActiveIndex(0);
        this.endUpdate();
    },
    getTabs: function () {
        return this.tabs;
    },
    removeAll: function (butTabs) {
        var activeTab = this.getActiveTab();
        if (mini.isNull(butTabs)) butTabs = [];
        if (!mini.isArray(butTabs)) {
            butTabs = [butTabs];
        }
        for (var i = butTabs.length - 1; i >= 0; i--) {
            var t = this.getTab(butTabs[i]);
            if (!t) butTabs.removeAt(i);
            else butTabs[i] = t;
        }

        var olds = this.tabs;
        for (var i = olds.length - 1; i >= 0; i--) {
            var tab = olds[i];
            if (butTabs.indexOf(tab) == -1) {
                this.removeTab(tab);
            }
        }
        var butTab = butTabs[0];
        if (activeTab != this.getActiveTab()) {
            if (butTab) this.activeTab(butTab);
        }
    },
    addTab: function (tab, index) {
        if (typeof tab == "string") {
            tab = { title: tab };
        }
        tab = this.createTab(tab);
        if (!tab.name) tab.name = "";

        if (typeof index != "number") index = this.tabs.length;
        this.tabs.insert(index, tab);

        
        var bodyId = this._createTabBodyId(tab);
        var s = '<div id="' + bodyId + '" class="mini-tabs-body ' + tab.bodyCls + '" style="' + tab.bodyStyle + ';display:none;"></div>';
        mini.append(this._bodyEl, s);

        var el = this.getTabBodyEl(tab);

        
        var cs = tab.body;
        delete tab.body;
        if (cs) {
            if (!mini.isArray(cs)) cs = [cs];
            for (var i = 0, l = cs.length; i < l; i++) {
                mini.append(el, cs[i]);
            }
        }

        
        if (tab.bodyParent) {
            var p = tab.bodyParent;
            while (p.firstChild) {
                el.appendChild(p.firstChild);
            }
        }
        delete tab.bodyParent;

        
        if (tab.controls) {
            this.setTabControls(tab, tab.controls);
            delete tab.controls;
        }

        this.doUpdate();
        return tab;
    },
    removeTab: function (tab) {
        tab = this.getTab(tab);
        if (!tab || this.tabs.indexOf(tab) == -1) return;

        var acTab = this.getActiveTab();

        var isActive = tab == acTab;

        var autoActive = this._OnTabDestroy(tab);

        this.tabs.remove(tab);

        
        this._doRemoveIFrame(tab);

        var el = this.getTabBodyEl(tab);
        if (el) this._bodyEl.removeChild(el);

        if (autoActive && isActive) {
            for (var i = this.activeIndex; i >= 0; i--) {
                var tab = this.getTab(i);
                if (tab && tab.enabled && tab.visible) {
                    this.activeIndex = i;
                    break;
                }
            }
            this.doUpdate();
            this.setActiveIndex(this.activeIndex);
            this.fire("activechanged");
        } else {
            this.activeIndex = this.tabs.indexOf(acTab);
            this.doUpdate();
        }
        return tab;
    },
    moveTab: function (tab, index) {
        tab = this.getTab(tab);
        if (!tab) return;

        var t = this.tabs[index];
        if (!t || t == tab) return;
        this.tabs.remove(tab);
        var index = this.tabs.indexOf(t);
        this.tabs.insert(index, tab);
        this.doUpdate();
    },
    updateTab: function (tab, options) {
        tab = this.getTab(tab);
        if (!tab) return;
        mini.copyTo(tab, options);
        this.doUpdate();
    },
    
    _getMaskWrapEl: function () {
        return this._bodyEl;
    },
    _doRemoveIFrame: function (tab, removeAll) {

        if (tab._iframeEl && tab._iframeEl.parentNode) {
            tab._iframeEl.src = "";
            try {
                iframe.contentWindow.document.write("");
                iframe.contentWindow.document.close();
            } catch (ex) { }
            if (tab._iframeEl._ondestroy) tab._iframeEl._ondestroy();
            try {
                tab._iframeEl.parentNode.removeChild(tab._iframeEl);
                tab._iframeEl.removeNode(true);
            } catch (ex) { }
        }
        tab._iframeEl = null;
        tab.loadedUrl = null;
        
        if (removeAll === true) {
            var bodyEl = this.getTabBodyEl(tab);
            if (bodyEl) {
                var cs = mini.getChildNodes(bodyEl, true);
                for (var i = 0, l = cs.length; i < l; i++) {
                    var d = cs[i];
                    if (d && d.parentNode) d.parentNode.removeChild(d);
                }
            }
        }
    },
    _deferLoadingTime: 180,
    _cancelLoadTabs: function (tab) {
        
        var tabs = this.tabs;
        for (var i = 0, l = tabs.length; i < l; i++) {
            var t = tabs[i];
            if (t != tab) {
                if (t._loading && t._iframeEl) {
                    t._loading = false;
                    this._doRemoveIFrame(t, true);
                }
            }
        }
        this._loading = false;
        this.unmask();
    },
    _doLoadTab: function (tab) {
        if (!tab) return;
        var bodyEl = this.getTabBodyEl(tab);
        if (!bodyEl) return;

        this._cancelLoadTabs();

        this._doRemoveIFrame(tab, true);

        this._loading = true;
        tab._loading = true;


        this.unmask();
        if (this.maskOnLoad) this.loading();
        var st = new Date();

        var sf = this;

        
        sf.isLoading = true;
        
        
        

        var iframe = mini.createIFrame(tab.url,
            function (_iframe, firstLoad) {
                
                try {
                    tab._iframeEl.contentWindow.Owner = window;
                    tab._iframeEl.contentWindow.CloseOwnerWindow = function (action) {

                        tab.removeAction = action;
                        
                        var ret = true;
                        if (tab.ondestroy) {
                            if (typeof tab.ondestroy == "string") {
                                tab.ondestroy = window[tab.ondestroy];
                            }
                            if (tab.ondestroy) {
                                ret = tab.ondestroy.call(this, e);
                            }
                        }
                        if (ret === false) {
                            return false;
                        }

                        setTimeout(function () {
                            sf.removeTab(tab);
                        }, 10);
                    }
                } catch (e) { }

                if (tab._loading != true) return;
                var t = (st - new Date()) + sf._deferLoadingTime;

                tab._loading = false;
                tab.loadedUrl = tab.url;

                if (t < 0) t = 0;
                setTimeout(function () {
                    sf.unmask();
                    sf.doLayout();
                    sf.isLoading = false;
                }, t);

                
                if (firstLoad) {
                    var e = {
                        sender: sf,
                        tab: tab,
                        index: sf.tabs.indexOf(tab),
                        name: tab.name,
                        iframe: tab._iframeEl
                    };
                    if (tab.onload) {
                        if (typeof tab.onload == "string") {
                            tab.onload = window[tab.onload];
                        }
                        if (tab.onload) {
                            tab.onload.call(sf, e);
                        }
                    }
                }

                sf.fire("tabload", e);
            }
        );
        setTimeout(function () {
            if (tab._iframeEl == iframe) {
                bodyEl.appendChild(iframe);
            }
            
        }, 1);
        tab._iframeEl = iframe;
    },
    _OnTabDestroy: function (tab) {
        var e = {
            sender: this,
            tab: tab,
            index: this.tabs.indexOf(tab),
            name: tab.name,
            iframe: tab._iframeEl,
            autoActive: true
        };
        this.fire("tabdestroy", e);
        return e.autoActive;
    },
    loadTab: function (url, tab, onload, ondestroy) {
        if (!url) return;
        tab = this.getTab(tab);
        if (!tab) tab = this.getActiveTab();
        if (!tab) return;

        var el = this.getTabBodyEl(tab);
        if (el) {
            mini.addClass(el, 'mini-tabs-hideOverflow');
        }

        tab.url = url;
        delete tab.loadedUrl;

        if (onload) tab.onload = onload;
        if (ondestroy) tab.ondestroy = ondestroy;

        var me = this;
        clearTimeout(this._loadTabTimer);
        this._loadTabTimer = null;
        this._loadTabTimer = setTimeout(function () {
            me._doLoadTab(tab);
        }, 1);
    },

    reloadTab: function (tab) {
        tab = this.getTab(tab);
        if (!tab) tab = this.getActiveTab();
        if (!tab) return;
        this.loadTab(tab.url, tab);
    },
    
    getTabRows: function () {
        var rows = [];
        var row = [];
        for (var i = 0, l = this.tabs.length; i < l; i++) {
            var tab = this.tabs[i];
            if (i != 0 && tab.newLine) {
                rows.push(row);
                row = [];
            }
            row.push(tab);
        }
        rows.push(row);
        return rows;
    },
    /**
    *	为控制对应的Dom元素根据其tabPosition属性设置相应的class属性
    */
    doUpdate: function () {

        if (this._allowUpdate === false) return;

        mini.removeClass(this.el, "mini-tabs-position-left");
        mini.removeClass(this.el, "mini-tabs-position-top");
        mini.removeClass(this.el, "mini-tabs-position-right");
        mini.removeClass(this.el, "mini-tabs-position-bottom");

        if (this.tabPosition == "bottom") {
            mini.addClass(this.el, "mini-tabs-position-bottom");
            this._doUpdateBottom();
        } else if (this.tabPosition == "right") {
            mini.addClass(this.el, "mini-tabs-position-right");
            this._doUpdateRight();
        } else if (this.tabPosition == "left") {
            mini.addClass(this.el, "mini-tabs-position-left");
            this._doUpdateLeft();
        } else {

            mini.addClass(this.el, "mini-tabs-position-top");
            this._doUpdateTop();
        }

        this.doLayout();

        this.setActiveIndex(this.activeIndex, false);
    },
    _handleIFrameOverflow: function () {

        var bodyEl = this.getTabBodyEl(this.activeIndex);
        if (bodyEl) {
            mini.removeClass(bodyEl, 'mini-tabs-hideOverflow');
            var dom = mini.getChildNodes(bodyEl)[0];

            if (dom && dom.tagName && dom.tagName.toUpperCase() == "IFRAME") {
                mini.addClass(bodyEl, 'mini-tabs-hideOverflow');
            }

        }
    },

    /**
    *	重新调整元素的布局
    */
    doLayout: function () {

        if (!this.canLayout()) return;
        this._handleIFrameOverflow();


        var autoHeight = this.isAutoHeight();

        

        h = this.getHeight(true);
        w = this.getWidth(true);
        var elHeight = h;
        var elWidth = w;
        
        if (this.showBody) {
            this._bodyEl.style.display = "";
        } else {
            this._bodyEl.style.display = "none";
        }

        if (this.plain) {
            mini.addClass(this.el, "mini-tabs-plain");
        } else {
            mini.removeClass(this.el, "mini-tabs-plain");
        }


        if (!autoHeight && this.showBody) {

            var headerHeight = jQuery(this._headerEl).outerHeight();
            var headerWidth = jQuery(this._headerEl).outerWidth();
            if (this.tabPosition == "top") {
                headerHeight = jQuery(this._headerEl.parentNode).outerHeight();
                
            }

            if (this.tabPosition == "left" || this.tabPosition == "right") {
                w = w - headerWidth;
            } else {
                h = h - headerHeight;
            }

            if (jQuery.boxModel) {
                var padding = mini.getPaddings(this._bodyEl);
                var border = mini.getBorders(this._bodyEl);

                h = h - padding.top - padding.bottom - border.top - border.bottom;
                w = w - padding.left - padding.right - border.left - border.right;
            }
            margin = mini.getMargins(this._bodyEl);

            h = h - margin.top - margin.bottom;
            w = w - margin.left - margin.right;



            if (h < 0) h = 0;
            if (w < 0) w = 0;

            this._bodyEl.style.width = w + "px";
            this._bodyEl.style.height = h + "px";

            
            if (this.tabPosition == "left" || this.tabPosition == "right") {

                
                

                var tr = this._headerEl.getElementsByTagName("tr")[0];
                var tds = tr.childNodes;
                var trs = tds[0].getElementsByTagName("tr");

                var first = last = all = 0;
                for (var i = 0, l = trs.length; i < l; i++) {
                    var tr = trs[i];
                    var trH = jQuery(tr).outerHeight();
                    all += trH;
                    if (i == 0) first = trH;
                    if (i == l - 1) last = trH;
                }

                switch (this.tabAlign) {
                    case "center":
                        var halfH = parseInt((elHeight - (all - first - last)) / 2);
                        for (var i = 0, l = tds.length; i < l; i++) {
                            tds[i].firstChild.style.height = elHeight + "px";
                            var tb = tds[i].firstChild;
                            var trs = tb.getElementsByTagName("tr");
                            var tr1 = trs[0], tr2 = trs[trs.length - 1];
                            tr1.style.height = halfH + "px";
                            tr2.style.height = halfH + "px";
                        }
                        break;
                    case "right":
                        for (var i = 0, l = tds.length; i < l; i++) {
                            var tb = tds[i].firstChild;
                            var trs = tb.getElementsByTagName("tr");
                            var tr = trs[0];

                            var size = elHeight - (all - first);
                            if (size >= 0) {
                                tr.style.height = size + "px";
                            }
                        }
                        break;
                    case "fit":
                        for (var i = 0, l = tds.length; i < l; i++) {
                            tds[i].firstChild.style.height = elHeight + "px"; ;
                        }
                        break;
                    default:
                        for (var i = 0, l = tds.length; i < l; i++) {
                            var tb = tds[i].firstChild;
                            var trs = tb.getElementsByTagName("tr");
                            var tr = trs[trs.length - 1];
                            var size = elHeight - (all - last);
                            if (size >= 0) {
                                tr.style.height = size + "px";
                            }
                        }
                        break;
                }
            }
        } else {
            this._bodyEl.style.width = "auto";
            this._bodyEl.style.height = "auto";
        }

        
        var tabBodyEl = this.getTabBodyEl(this.activeIndex);
        if (tabBodyEl) {
            if (!autoHeight && this.showBody) {
                var h = mini.getHeight(this._bodyEl, true);
                if (jQuery.boxModel) {
                    var padding = mini.getPaddings(tabBodyEl);
                    var border = mini.getBorders(tabBodyEl);
                    h = h - padding.top - padding.bottom - border.top - border.bottom;
                }
                tabBodyEl.style.height = h + "px";
            } else {
                tabBodyEl.style.height = "auto";
            }
        }

        switch (this.tabPosition) {
            case "bottom":
                var hds = this._headerEl.childNodes;
                for (var i = 0, l = hds.length; i < l; i++) {
                    var tb = hds[i];
                    mini.removeClass(tb, "mini-tabs-header2");
                    if (l > 1 && i != 0) {

                        mini.addClass(tb, "mini-tabs-header2");
                    }
                }
                break;
            case "left":

                
                
                var tds = this._headerEl.firstChild.rows[0].cells;
                for (var i = 0, l = tds.length; i < l; i++) {
                    var td = tds[i];
                    mini.removeClass(td, "mini-tabs-header2");
                    if (l > 1 && i == 0) {
                        mini.addClass(td, "mini-tabs-header2");
                    }
                }
                break;
            case "right":
                
                

                var tds = this._headerEl.firstChild.rows[0].cells;
                for (var i = 0, l = tds.length; i < l; i++) {
                    var td = tds[i];
                    mini.removeClass(td, "mini-tabs-header2");
                    if (l > 1 && i != 0) {
                        mini.addClass(td, "mini-tabs-header2");
                    }
                }
                break;
            default:
                var hds = this._headerEl.childNodes;
                for (var i = 0, l = hds.length; i < l; i++) {
                    var tb = hds[i];
                    mini.removeClass(tb, "mini-tabs-header2");
                    if (l > 1 && i == 0) {
                        mini.addClass(tb, "mini-tabs-header2");
                    }
                }
                break;
        }


        
        mini.removeClass(this.el, 'mini-tabs-scroll');
        if (this.tabPosition == "top") {
            
            mini.setWidth(this._headerEl, elWidth);
            if (this._headerEl.offsetWidth < this._headerEl.scrollWidth) {

                mini.setWidth(this._headerEl, elWidth - 60);
                mini.addClass(this.el, 'mini-tabs-scroll');
            }
            if (isIE && !jQuery.boxModel) {
                this._leftButtonEl.style.left = "-26px";
            }
        }

        this._doScrollButton();

        
        
        

        mini.layout(this._bodyEl);
        this.fire("layout");
    },

    setTabAlign: function (value) {
        this.tabAlign = value;
        this.doUpdate();
    },
    setTabPosition: function (value) {
        this.tabPosition = value;
        this.doUpdate();
    },


    getTab: function (index) {
        if (typeof index == "object") return index;
        if (typeof index == "number") {
            return this.tabs[index];
        } else {
            for (var i = 0, l = this.tabs.length; i < l; i++) {
                var tab = this.tabs[i];
                if (tab.name == index) return tab;
            }
        }
    },
    getHeaderEl: function () {
        return this._headerEl;
    },
    getBodyEl: function () {
        return this._bodyEl;
    },
    getTabEl: function (index) {
        var tab = this.getTab(index);
        if (!tab) return null;
        var id = this._createTabId(tab);
        var cs = this.el.getElementsByTagName("*");
        for (var i = 0, l = cs.length; i < l; i++) {
            var el = cs[i];
            if (el.id == id) return el;
        }
        return null;
    },
    getTabBodyEl: function (index) {
        var tab = this.getTab(index);
        if (!tab) return null;
        var id = this._createTabBodyId(tab);
        var cs = this._bodyEl.childNodes;
        for (var i = 0, l = cs.length; i < l; i++) {
            var el = cs[i];
            if (el.id == id) return el;
        }
        return null;
    },
    getTabIFrameEl: function (index) {
        var tab = this.getTab(index);
        if (!tab) return null;
        return tab._iframeEl;
    },
    _createTabId: function (tab) {
        return this.uid + "$" + tab._id;
    },
    _createTabBodyId: function (tab) {
        return this.uid + "$body$" + tab._id;
    },
    _doScrollButton: function () {
        if (this.tabPosition == "top") {
            mini.removeClass(this._leftButtonEl, "mini-disabled");
            mini.removeClass(this._rightButtonEl, "mini-disabled");
            if (this._headerEl.scrollLeft == 0) {
                mini.addClass(this._leftButtonEl, "mini-disabled");
            }
            var tabEl = this.getTabEl(this.tabs.length - 1);
            if (tabEl) {
                var tabBox = mini.getBox(tabEl);
                var scrollBox = mini.getBox(this._headerEl);
                if (tabBox.right <= scrollBox.right) {
                    mini.addClass(this._rightButtonEl, "mini-disabled");
                }
            }
        }
    },

    setActiveIndex: function (value, load) {

        var tab = this.getTab(value);
        
        var acTab = this.getTab(this.activeIndex);

        var fire = tab != acTab;

        var el = this.getTabBodyEl(this.activeIndex);
        if (el) el.style.display = "none";
        if (tab) {
            this.activeIndex = this.tabs.indexOf(tab);
        } else {
            this.activeIndex = -1;
        }
        var el = this.getTabBodyEl(this.activeIndex);
        if (el) el.style.display = "";

        var el = this.getTabEl(acTab);
        if (el) mini.removeClass(el, this._tabActiveCls);

        var el = this.getTabEl(tab);
        if (el) mini.addClass(el, this._tabActiveCls);

        if (el && fire) {
            if (this.tabPosition == "bottom") {
                var tb = mini.findParent(el, "mini-tabs-header");
                if (tb) {
                    jQuery(this._headerEl).prepend(tb);
                }
            } else if (this.tabPosition == "left") {
                var td = mini.findParent(el, "mini-tabs-header").parentNode;
                if (td) {
                    td.parentNode.appendChild(td);
                }
            } else if (this.tabPosition == "right") {
                var td = mini.findParent(el, "mini-tabs-header").parentNode;
                if (td) {
                    jQuery(td.parentNode).prepend(td);
                }
            } else {
                var tb = mini.findParent(el, "mini-tabs-header");
                if (tb) {
                    this._headerEl.appendChild(tb);
                }
            }
            var scrollLeft = this._headerEl.scrollLeft;
            this.doLayout();

            var rows = this.getTabRows();
            if (rows.length > 1) {

            } else {
                if (this.tabPosition == "top") {
                    this._headerEl.scrollLeft = scrollLeft;
                    var tabEl = this.getTabEl(this.activeIndex);
                    if (tabEl) {
                        var sf = this;
                        var tabBox = mini.getBox(tabEl);
                        var scrollBox = mini.getBox(sf._headerEl);

                        if (tabBox.x < scrollBox.x) {
                            sf._headerEl.scrollLeft -= (scrollBox.x - tabBox.x);
                        } else if (tabBox.right > scrollBox.right) {
                            sf._headerEl.scrollLeft += (tabBox.right - scrollBox.right);
                        }
                    }
                }
                this._doScrollButton();
            }

            for (var i = 0, l = this.tabs.length; i < l; i++) {
                var tabEl = this.getTabEl(this.tabs[i]);
                if (tabEl) {
                    mini.removeClass(tabEl, this._tabHoverCls);
                }
            }
        }
        var me = this;
        if (fire) {
            var e = {
                tab: tab,
                index: this.tabs.indexOf(tab),
                name: tab ? tab.name : ""
            };

            setTimeout(function () {    



                me.fire("ActiveChanged", e);

            }, 1);
        }

        
        this._cancelLoadTabs(tab);
        if (load !== false) {
            if (tab && tab.url && !tab.loadedUrl) {
                var me = this;

                
                me.loadTab(tab.url, tab);
                
            }
        }

        if (me.canLayout()) {
            try {
                mini.layoutIFrames(me.el);
            } catch (e) {
            }
        }
    },
    getActiveIndex: function () {
        return this.activeIndex;
    },
    activeTab: function (tab) {
        this.setActiveIndex(tab);
    },
    getActiveTab: function () {
        return this.getTab(this.activeIndex);
    },
    getActiveIndex: function () {
        return this.activeIndex;
    },
    _tryActiveTab: function (tab) {
        tab = this.getTab(tab);
        if (!tab) return;
        var index = this.tabs.indexOf(tab);
        if (this.activeIndex == index) return;
        var e = {
            tab: tab,
            index: index,
            name: tab.name,
            cancel: false
        };
        this.fire("BeforeActiveChanged", e);
        if (e.cancel == false) {
            this.activeTab(tab);
        }
    },
    setShowBody: function (value) {
        if (this.showBody != value) {
            this.showBody = value;
            this.doLayout();
        }
    },
    getShowBody: function () {
        return this.showBody;
    },
    setBodyStyle: function (value) {
        this.bodyStyle = value;
        mini.setStyle(this._bodyEl, value);
        this.doLayout();
    },
    getBodyStyle: function () {
        return this.bodyStyle;
    },
    setMaskOnLoad: function (value) {
        this.maskOnLoad = value;
    },
    getMaskOnLoad: function () {
        return this.maskOnLoad;
    },
    setPlain: function (value) {
        this.plain = value;
        this.doLayout();
    },
    getPlain: function () {
        return this.plain;
    },

    getTabByEvent: function (e) {
        return this._getTabByEvent(e);
    },
    _getTabByEvent: function (e) {
        var el = mini.findParent(e.target, 'mini-tab');
        if (!el) return null;
        var ids = el.id.split("$");
        if (ids[0] != this.uid) return null;
        var index = parseInt(jQuery(el).attr("index"));
        return this.getTab(index);
    },
    __OnClick: function (e) {
        
        var tab = this._getTabByEvent(e);
        if (!tab) return;
        if (tab.enabled) {
            var me = this;
            setTimeout(function () {
                if (mini.findParent(e.target, "mini-tab-close")) {
                    me._OnCloseButtonClick(tab, e);
                } else {
                    var loadedUrl = tab.loadedUrl;
                    me._tryActiveTab(tab);
                    if (tab.refreshOnClick && tab.url == loadedUrl) {
                        me.reloadTab(tab);
                    }
                }
            }, 10);
        }
    },
    hoverTab: null,
    __OnMouseOver: function (e) {
        var tab = this._getTabByEvent(e);
        if (tab && tab.enabled) {
            var tabEl = this.getTabEl(tab);
            mini.addClass(tabEl, this._tabHoverCls);
            this.hoverTab = tab;
        }
    },
    __OnMouseOut: function (e) {
        if (this.hoverTab) {
            var tabEl = this.getTabEl(this.hoverTab);
            mini.removeClass(tabEl, this._tabHoverCls);
        }
        this.hoverTab = null;
    },
    __OnMouseDown: function (e) {
        clearInterval(this._scrollTimer);
        if (this.tabPosition == "top") {
            var sf = this;
            var count = 0, num = 10;
            if (e.target == this._leftButtonEl) {
                this._scrollTimer = setInterval(function () {
                    sf._headerEl.scrollLeft -= num;
                    count++;
                    if (count > 5) num = 18;
                    if (count > 10) num = 25;
                    sf._doScrollButton();
                }, 25);
            } else if (e.target == this._rightButtonEl) {
                this._scrollTimer = setInterval(function () {
                    sf._headerEl.scrollLeft += num;
                    count++;
                    if (count > 5) num = 18;
                    if (count > 10) num = 25;
                    sf._doScrollButton();
                }, 25);
            }
            mini.on(document, "mouseup", this.__OnDocMouseUp, this);
        }
    },
    __OnDocMouseUp: function (e) {
        clearInterval(this._scrollTimer);
        this._scrollTimer = null;
        mini.un(document, "mouseup", this.__OnDocMouseUp, this);
    },

    /**
    *	为属性tabPosition为top的TAB的中间TD设置子元素，以响应事件
    */
    _doUpdateTop: function () {

        
        var isTop = this.tabPosition == "top";

        var s = '';
        if (isTop) {
            s += '<div class="mini-tabs-scrollCt">';
            s += '<a class="mini-tabs-leftButton" href="javascript:void(0)" hideFocus onclick="return false"></a><a class="mini-tabs-rightButton" href="javascript:void(0)" hideFocus onclick="return false"></a>';
        }
        s += '<div class="mini-tabs-headers">';
        var rows = this.getTabRows();
        for (var j = 0, k = rows.length; j < k; j++) {
            var tabs = rows[j];
            var cls = "";
            s += '<table class="mini-tabs-header" cellspacing="0" cellpadding="0"><tr><td class="mini-tabs-space mini-tabs-firstSpace"><div></div></td>';
            for (var i = 0, l = tabs.length; i < l; i++) {
                var tab = tabs[i];
                var id = this._createTabId(tab);
                if (!tab.visible) continue;
                var index = this.tabs.indexOf(tab);
                var cls = tab.headerCls || "";
                if (tab.enabled == false) {
                    cls += ' mini-disabled';
                }
                s += '<td id="' + id + '" index="' + index + '"  class="mini-tab ' + cls + '" style="' + tab.headerStyle + '">';
                if (tab.iconCls || tab.iconStyle) {
                    s += '<span class="mini-tab-icon ' + tab.iconCls + '" style="' + tab.iconStyle + '"></span>';
                }
                s += '<span class="mini-tab-text">' + tab.title + '</span>';
                if (tab.showCloseButton) {
                    var ms = "";
                    if (tab.enabled) {
                        ms = 'onmouseover="mini.addClass(this, \'mini-tab-close-hover\')" onmouseout="mini.removeClass(this, \'mini-tab-close-hover\')"'
                    }
                    s += '<span class="mini-tab-close" ' + ms + '></span>';
                }
                s += '</td>';
                if (i != l - 1) {
                    s += '<td class="mini-tabs-space2"><div></div></td>';
                }

            }
            s += '<td class="mini-tabs-space mini-tabs-lastSpace" ><div></div></td></tr></table>';
        }
        if (isTop) s += '</div>';
        s += '</div>';

        this._doClearElement();

        mini.prepend(this._td2El, s);

        var td = this._td2El;
        this._headerEl = td.firstChild.lastChild;
        if (isTop) {
            this._leftButtonEl = this._headerEl.parentNode.firstChild;
            this._rightButtonEl = this._headerEl.parentNode.childNodes[1];
        }

        switch (this.tabAlign) {
            case "center":
                var hds = this._headerEl.childNodes;
                for (var i = 0, l = hds.length; i < l; i++) {
                    var tb = hds[i];
                    var tds = tb.getElementsByTagName("td");
                    tds[0].style.width = "50%";
                    tds[tds.length - 1].style.width = "50%";
                }
                break;
            case "right":
                var hds = this._headerEl.childNodes;
                for (var i = 0, l = hds.length; i < l; i++) {
                    var tb = hds[i];
                    var tds = tb.getElementsByTagName("td");
                    tds[0].style.width = "100%";
                }
                break;
            case "fit":
                break;
            default:
                var hds = this._headerEl.childNodes;
                for (var i = 0, l = hds.length; i < l; i++) {
                    var tb = hds[i];
                    var tds = tb.getElementsByTagName("td");
                    tds[tds.length - 1].style.width = "100%";
                }
                break;
        }
    },
    _doUpdateBottom: function () {
        this._doUpdateTop();
        var td = this._td2El;
        
        mini.append(td, td.firstChild);
        this._headerEl = td.lastChild;
    },
    _doUpdateLeft: function () {
        var s = '<table cellspacing="0" cellpadding="0"><tr>';
        var rows = this.getTabRows();
        for (var j = 0, k = rows.length; j < k; j++) {
            var tabs = rows[j];

            var cls = "";
            if (k > 1 && j != k - 1) {
                cls = "mini-tabs-header2";
            }
            s += '<td class="' + cls + '"><table class="mini-tabs-header" cellspacing="0" cellpadding="0">';
            s += '<tr ><td class="mini-tabs-space mini-tabs-firstSpace" ><div></div></td></tr>';

            for (var i = 0, l = tabs.length; i < l; i++) {
                var tab = tabs[i];
                var id = this._createTabId(tab);
                if (!tab.visible) continue;

                var index = this.tabs.indexOf(tab);

                var cls = tab.headerCls || "";
                if (tab.enabled == false) {
                    cls += ' mini-disabled';
                }
                s += '<tr><td id="' + id + '" index="' + index + '"  class="mini-tab ' + cls + '" style="' + tab.headerStyle + '">';
                if (tab.iconCls || tab.iconStyle) {
                    s += '<span class="mini-tab-icon ' + tab.iconCls + '" style="' + tab.iconStyle + '"></span>';
                }
                s += '<span class="mini-tab-text">' + tab.title + '</span>';
                if (tab.showCloseButton) {
                    var ms = "";
                    if (tab.enabled) {
                        ms = 'onmouseover="mini.addClass(this, \'mini-tab-close-hover\')" onmouseout="mini.removeClass(this, \'mini-tab-close-hover\')"'
                    }
                    s += '<span class="mini-tab-close" ' + ms + '></span>';
                }
                s += '</td></tr>';

                if (i != l - 1) {
                    s += '<tr><td class="mini-tabs-space2"><div></div></td></tr>';
                }

            }

            s += '<tr ><td class="mini-tabs-space mini-tabs-lastSpace" ><div></div></td></tr>';
            s += '</table></td>';
        }

        s += '</tr ></table>';

        this._doClearElement();
        mini.addClass(this._td1El, "mini-tabs-header");
        mini.append(this._td1El, s);
        this._headerEl = this._td1El;

    },
    _doUpdateRight: function () {
        this._doUpdateLeft();

        mini.removeClass(this._td1El, "mini-tabs-header");
        mini.removeClass(this._td3El, "mini-tabs-header");
        mini.append(this._td3El, this._td1El.firstChild);
        this._headerEl = this._td3El;

    },
    
    _OnCloseButtonClick: function (tab, htmlEvent) {
        var e = {
            tab: tab,
            index: this.tabs.indexOf(tab),
            name: tab.name.toLowerCase(),
            htmlEvent: htmlEvent,
            cancel: false
        };

        this.fire("beforecloseclick", e);
        if (e.cancel == true) return;

        try {
            if (tab._iframeEl && tab._iframeEl.contentWindow) {
                var ret = true;
                if (tab._iframeEl.contentWindow.CloseWindow) {
                    ret = tab._iframeEl.contentWindow.CloseWindow("close");
                } else if (tab._iframeEl.contentWindow.CloseOwnerWindow) {
                    ret = tab._iframeEl.contentWindow.CloseOwnerWindow("close");
                }
                if (ret === false) {
                    e.cancel = true;
                }
            }
        } catch (ex) { }

        if (e.cancel == true) return;

        tab.removeAction = "close";
        this.removeTab(tab);
        this.fire("closeclick", e);
    },
    onBeforeCloseClick: function (fn, scope) {
        this.on("beforecloseclick", fn, scope);
    },
    onCloseClick: function (fn, scope) {
        this.on("closeclick", fn, scope);
    },
    onActiveChanged: function (fn, scope) {
        this.on("activechanged", fn, scope);
    },
    
    /**
    *	解析页面上的属性,得到Tab组件的子元素。
    */
    getAttrs: function (el) {
        var attrs = mini.Tabs.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["tabAlign", "tabPosition", "bodyStyle", "onactivechanged", "onbeforeactivechanged", "url",
                "ontabload", "ontabdestroy", "onbeforecloseclick", "oncloseclick",
                "titleField", "urlField", "nameField", "loadingMsg"
             ]
        );
        mini._ParseBool(el, attrs,
            ["allowAnim", "showBody", "maskOnLoad", "plain"
             ]
        );
        mini._ParseInt(el, attrs,
            ["activeIndex"
             ]
        );

        var tabs = [];
        var nodes = mini.getChildNodes(el);
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            var o = {};
            tabs.push(o);

            o.style = node.style.cssText;
            mini._ParseString(node, o,
                ["name", "title", "url", "cls", "iconCls", "iconStyle", "headerCls", "headerStyle", "bodyCls", "bodyStyle",
                    "onload", "ondestroy", "data-options"
                 ]
            );
            mini._ParseBool(node, o,
                ["newLine", "visible", "enabled", "showCloseButton", "refreshOnClick"
                 ]
            );

            
            
            o.bodyParent = node;
            var options = o["data-options"];
            if (options) {

                options = eval("(" + options + ")");
                if (options) {

                    mini.copyTo(o, options);
                }
            }

        }
        attrs.tabs = tabs;

        return attrs;
    }
});
mini.regClass(mini.Tabs, "tabs");