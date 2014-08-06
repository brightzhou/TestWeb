

/**
 * @class mini.Menu 是Mini UI中的菜单组件，构造函数中调用了Control方法
 * @constructor 
 * @extends mini.Control 
 */
mini.Menu = function () {
    this.items = [];
    mini.Menu.superclass.constructor.call(this);

    
}
mini.extend(mini.Menu, mini.Control);
mini.copyTo(mini.Menu.prototype, mini.Popup_prototype);
var mini_Popup_prototype_hide = mini.Popup_prototype.hide;

mini.copyTo(mini.Menu.prototype, /** @lends mini.Menu.prototype */{
    height: "auto",
    width: "auto",
    minWidth: 140,
    /**
     * 是否竖向
     * @default true
     */
    vertical: true,
    /**
     * 是否允许选择菜单项
     * @default false
     */
    allowSelectItem: false,
    _selectedItem: null,
    _itemSelectedCls: "mini-menuitem-selected",
    /**
     * 文本字段名
     * @default text
     */
    textField: "text",
    /**
     * 是否树形结构
     * @default false
     */
    resultAsTree: false,
    /**
     * id字段名
     * @default id
     */
    idField: "id",
    /**
     * 父字段名
     * @default pid
     */
    parentField: "pid",
    /**
     * 菜单项字段名
     * @default children
     */
    itemsField: "children",
    showNavArrow: true,

    _clearBorder: false,

    showAction: "none", 
    hideAction: "outerclick", 

    /**
     * 按名称获取菜单项
     * @param name 菜单项的名称
     */
    getbyName: function (name) {

        for (var i = 0, l = this.items.length; i < l; i++) {
            var item = this.items[i];
            if (item.name == name) {
                return item;
            }
            if (item.menu) {
                var control = item.menu.getbyName(name);
                if (control) return control;
            }
        }
        return null;
    },
    /**
     * 批量设置属性和事件
     * @param obj 参数配置对象
     */
    set: function (obj) {
        if (typeof obj == 'string') {
            return this;
        }

        var url = obj.url;
        delete obj.url;

        mini.Menu.superclass.set.call(this, obj);

        if (url) {
            this.setUrl(url);
        }

        return this;
    },
    /**
     * 菜单组件class名
     */
    uiCls: "mini-menu",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-menu";
        this.el.innerHTML = '<div class="mini-menu-border"><a class="mini-menu-topArrow" href="#" onclick="return false"></a><div class="mini-menu-inner"></div><a class="mini-menu-bottomArrow" href="#" onclick="return false"></a></div>';
        this._borderEl = this.el.firstChild;

        this._topArrowEl = this._borderEl.childNodes[0];
        this._bottomArrowEl = this._borderEl.childNodes[2];

        this._innerEl = this._borderEl.childNodes[1];
        this._innerEl.innerHTML = '<div class="mini-menu-float"></div><div class="mini-menu-toolbar"></div><div style="clear:both;"></div>';
        this._contentEl = this._innerEl.firstChild;
        this._toolbarEl = this._innerEl.childNodes[1];




        if (this.isVertical() == false) mini.addClass(this.el, 'mini-menu-horizontal');

    },
    destroy: function (removeEl) {
        if (this._topArrowEl) {
            this._topArrowEl.onmousedown = this._bottomArrowEl.onmousedown = null;
        }

        this._popupEl = this.popupEl = this._borderEl = this._innerEl = this._contentEl = null;
        this._topArrowEl = this._bottomArrowEl = null;
        this.owner = null;
        mini.un(document, "mousedown", this.__OnBodyMouseDown, this);
        mini.un(window, "resize", this.__OnWindowResize, this);
        //内存优化 潘正锋 2013-05-30
        this.el.onmouseover = null;
        this.el.oncontextmenu = null;
        mini.Menu.superclass.destroy.call(this, removeEl);

    },
    _disableContextMenu: false,
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(document, "mousedown", this.__OnBodyMouseDown, this);
            mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);
            mini.on(window, "resize", this.__OnWindowResize, this);
            if (this._disableContextMenu) {
                mini_onOne(this.el, "contextmenu", function (e) {
                    e.preventDefault();

                }, this);
            }

            mini_onOne(this._topArrowEl, "mousedown", this.__OnTopMouseDown, this);
            mini_onOne(this._bottomArrowEl, "mousedown", this.__OnBottomMouseDown, this);

        }, this);

    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        for (var i = 0, l = this.items.length; i < l; i++) {
            var item = this.items[i];
            if (item.within(e)) return true;
        }
        return false;
    },
   
    /**
     * 设置竖向显示方式
     * @param value true 或 false
     */
    setVertical: function (value) {
        this.vertical = value;
        if (!value) {
            mini.addClass(this.el, 'mini-menu-horizontal');
        } else {
            mini.removeClass(this.el, 'mini-menu-horizontal');
        }
       
    },
    /**
     * 获取控件是否竖向显示
     */
    getVertical: function () {
        return this.vertical;
    },
    /**
     * 获取控件是否竖向显示
     */
    isVertical: function () {
        return this.vertical;
    },
    /**
     * 显示控件
     */
    show: function () {
        this.setVisible(true);
    },
    /**
     * 隐藏控件
     */
    hide: function () {
        this.hideItems();
        mini_Popup_prototype_hide.call(this);
    },
    /**
     * 隐藏菜单项
     */
    hideItems: function () {
        for (var i = 0, l = this.items.length; i < l; i++) {
            var menuitem = this.items[i];
            menuitem.hideMenu();
        }
    },
    /**
     * 显示菜单项
     */
    showItemMenu: function (item) {
        for (var i = 0, l = this.items.length; i < l; i++) {
            var menuitem = this.items[i];
            if (menuitem == item) {
                menuitem.showMenu();
            } else {
                menuitem.hideMenu();
            }
        }
    },
    hasShowItemMenu: function () {
        for (var i = 0, l = this.items.length; i < l; i++) {
            var menuitem = this.items[i];
            if (menuitem && menuitem.menu && menuitem.menu.isPopup) {
                return true;
            }
        }
        return false;
    },
    /**
     * 设置菜单项数据
     */
    setData: function (value) {
        if (!mini.isArray(value)) value = [];
        this.setItems(value);
    },
    /**
     * 获取获取菜单项数据
     */
    getData: function () {
        return this.getItems();
    },
    /**
     * 设置菜单项数据
     */
    setItems: function (items) {
        if (!mini.isArray(items)) items = [];

        this.removeAll();
        var sss = new Date();

        for (var i = 0, l = items.length; i < l; i++) {
            this.addItem(items[i]);
        }
        
    },
    /**
     * 获取获取菜单项数据
     */
    getItems: function () {
        return this.items;
    },
    /**
     * 添加菜单项
     */
    addItem: function (item) {
        if (item == "-" || item == "|" || item.type == "separator") {
            mini.append(this._contentEl, '<span class="mini-separator"></span>');
            return;
        }

        if (!mini.isControl(item) && !mini.getClass(item.type)) {
            item.type = "menuitem";
        }
        item = mini.getAndCreate(item);

        this.items.push(item);
        
        this._contentEl.appendChild(item.el);
        
        item.ownerMenu = this;

      

        this.fire("itemschanged");
    },
    /**
     * 移除菜单项
     * @param item 菜单项
     */
    removeItem: function (item) {
        item = mini.get(item);
        if (!item) return;
        this.items.remove(item);
        
        this._contentEl.removeChild(item.el);
        
        this.fire("itemschanged");
    },
    /**
     * 移除指定索引位置菜单项
     * @param index 菜单项索引位置
     */
    removeItemAt: function (index) {
        var item = this.items[index];
        this.removeItem(item);
    },
    /**
     * 移除所有菜单项
     */
    removeAll: function () {
        var items = this.items.clone();
        for (var i = items.length - 1; i >= 0; i--) {
            this.removeItem(items[i]);
        }
        this._contentEl.innerHTML = "";
    },
    /**
     * 获取菜单项组
     * @param name groupName
     */
    getGroupItems: function (name) {
        if (!name) return [];
        var items = [];
        for (var i = 0, l = this.items.length; i < l; i++) {
            var item = this.items[i];
            if (item.groupName == name) items.push(item);
        }
        return items;
    },
    /**
     * 获取指定索引位置的菜单项
     * @param item 菜单项索引位置
     */
    getItem: function (item) {
        if (typeof item == "number") return this.items[item];
        if (typeof item == "string") {
            for (var i = 0, l = this.items.length; i < l; i++) {
                var it = this.items[i];
                if (it.id == item) return it;
            }
            return null;
        }
        if (item && this.items.indexOf(item) != -1) return item;
        return null;
    },

    /**
     * 设置菜单项是否可选择
     */
    setAllowSelectItem: function (value) {
        this.allowSelectItem = value;
    },
    /**
     * 获取菜单项是否可选择
     */
    getAllowSelectItem: function () {
        return this.allowSelectItem;
    },
    /**
     * 设置菜单项的选中状态
     */
    setSelectedItem: function (item) {
        item = this.getItem(item);
        this._OnItemSelect(item);
    },
    /**
     * 获取已选中的菜单项
     */
    getSelectedItem: function (item) {
        return this._selectedItem;
    },
    setShowNavArrow: function (value) {
        this.showNavArrow = value;
    },
    getShowNavArrow: function () {
        return this.showNavArrow;
    },

    setTextField: function (value) {
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },
    setResultAsTree: function (value) {
        this.resultAsTree = value;
    },
    getResultAsTree: function () {
        return this.resultAsTree;
    },
    setIdField: function (value) {
        this.idField = value;
    },
    getIdField: function () {
        return this.idField;
    },
    setParentField: function (value) {
        this.parentField = value;
    },
    getParentField: function () {
        return this.parentField;
    },
    doLayout: function () {

        if (!this.canLayout()) return;

        if (!this.isAutoHeight()) {

            var height = mini.getHeight(this.el, true);

            mini.setHeight(this._borderEl, height);
            this._topArrowEl.style.display = this._bottomArrowEl.style.display = "none";
            this._contentEl.style.height = "auto";

            if (this.showNavArrow && this._borderEl.scrollHeight > this._borderEl.clientHeight) {
                this._topArrowEl.style.display = this._bottomArrowEl.style.display = "block";
                height = mini.getHeight(this._borderEl, true);
                var th = mini.getHeight(this._topArrowEl);
                var bh = mini.getHeight(this._bottomArrowEl);
                var h = height - th - bh;
                if (h < 0) h = 0;
                mini.setHeight(this._contentEl, h);
            } else {
                this._contentEl.style.height = "auto";
            }
        } else {
            this._borderEl.style.height = "auto";
            this._contentEl.style.height = "auto";
        }
    },
    _measureSize: function () {
        if (this.height == "auto") {
            this.el.style.height = "auto";
            this._borderEl.style.height = "auto";
            this._contentEl.style.height = "auto";
            this._topArrowEl.style.display = this._bottomArrowEl.style.display = "none";

            var vbox = mini.getViewportBox();
            var box = mini.getBox(this.el);
            this.maxHeight = vbox.height - 25;
            if (this.ownerItem) {
                var box = mini.getBox(this.ownerItem.el);
                var topH = box.top;
                var bottomH = vbox.height - box.bottom;
                var maxHeight = topH > bottomH ? topH : bottomH;
                maxHeight -= 10;
                this.maxHeight = maxHeight;
            }
        }

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
     * 菜单数据地址
     */
    url: "",
    _doLoad: function () {

        var items = mini.getData(this.url);
        if (this.dataField) {
            items = mini._getMap(this.dataField, items);
        }

        if (!items) items = [];

        if (this.resultAsTree == false) {
            items = mini.arrayToTree(items, this.itemsField, this.idField, this.parentField)
        }

        var list = mini.treeToArray(items, this.itemsField, this.idField, this.parentField)
        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            o.text = mini._getMap(this.textField, o);
            if (mini.isNull(o.text)) o.text = "";
        }
        var sss = new Date();
        this.setItems(items);
        
        this.fire("load");
    },
    loadList: function (list, idField, parentField) {
        if (!list) return;

        idField = idField || this.idField;
        parentField = parentField || this.parentField;

        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            o.text = mini._getMap(this.textField, o);
            if (mini.isNull(o.text)) o.text = "";
        }

        var tree = mini.arrayToTree(list, this.itemsField, idField, parentField);

        this.load(tree);
    },

    /**
     * 加载菜单数据
     * @param url 菜单数据URL地址
     */
    load: function (url) {
        if (typeof url == "string") {
            this.setUrl(url);
        } else {
            this.setItems(url);
        }
    },
    setUrl: function (value) {
        this.url = value;

        this._doLoad();
    },
    getUrl: function () {
        return this.url;
    },
    hideOnClick: true,
    setHideOnClick: function (value) {
        this.hideOnClick = value;
    },
    getHideOnClick: function () {
        return this.hideOnClick;
    },

    _OnItemClick: function (item, htmlEvent) {
        var e = {
            item: item,
            isLeaf: !item.menu,
            htmlEvent: htmlEvent
        };
        if (this.hideOnClick) {
            if (this.isPopup) {
                this.hide();
            } else {
                this.hideItems();
            }
        }

        if (this.allowSelectItem && this._selectedItem != item) {
            this.setSelectedItem(item);
        }

        this.fire("itemclick", e);
        if (this.ownerItem) {

        }
    },
    _OnItemSelect: function (item) {
        if (this._selectedItem) {
            this._selectedItem.removeCls(this._itemSelectedCls);
        }
        this._selectedItem = item;

        if (this._selectedItem) {
            this._selectedItem.addCls(this._itemSelectedCls);
        }
        var e = {
            item: this._selectedItem
        };
        this.fire("itemselect", e);
    },
    /**
     * 菜单项点击事件
     */
    onItemClick: function (fn, scope) {
        this.on("itemclick", fn, scope);
    },
    /**
     * 菜单项选中事件
     */
    onItemSelect: function (fn, scope) {
        this.on("itemselect", fn, scope);
    },
    __OnTopMouseDown: function (e) {
        this._startScrollMove(-20);
    },
    __OnBottomMouseDown: function (e) {

        this._startScrollMove(20);
    },
    _startScrollMove: function (value) {
        clearInterval(this._scrollTimer);
        var fn = function () {
            clearInterval(me._scrollTimer);
            mini.un(document, "mouseup", fn);
        };
        mini.on(document, "mouseup", fn);

        var me = this;

        this._scrollTimer = setInterval(function () {
            me._contentEl.scrollTop += value;


        }, 50);
    },
    setToolbar: function (value) {
        __mini_setControls(value, this._toolbarEl, this);
    },

    parseItems: function (nodes) {

        var data = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            if (node.className == "separator") {
                data.add("-");
                continue;
            }

            var cnodes = mini.getChildNodes(node);

            var nodeItem = cnodes[0];
            var nodeChild = cnodes[1];

            var o = new mini.MenuItem();

            if (!nodeChild) {
                
                mini.applyTo.call(o, node);
                data.add(o);
                continue;
            }
            
            mini.applyTo.call(o, nodeItem);
            o.render(document.body);


            var menu = new mini.Menu();
            
            mini.applyTo.call(menu, nodeChild);

            o.setMenu(menu);

            menu.render(document.body);
            

            data.add(o);
        }
        return data.clone();
    },
    getAttrs: function (el) {

        var attrs = mini.Menu.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        mini._ParseString(el, attrs,
            ["popupEl", "popupCls", "showAction", "hideAction", "xAlign", "yAlign", "modalStyle",
            "onbeforeopen", "open", "onbeforeclose", "onclose", "url", "onitemclick", "onitemselect",
            "textField", "idField", "parentField"
            ]
        );
        mini._ParseBool(el, attrs,
            ["resultAsTree", "hideOnClick", "showNavArrow"
            ]
        );


        var nodes = mini.getChildNodes(el);

        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];
            var property = jQuery(node).attr("property");
            if (!property) continue;
            property = property.toLowerCase();
            if (property == "toolbar") {
                attrs.toolbar = node;
                node.parentNode.removeChild(node);
            }
        }


        var nodes = mini.getChildNodes(el);
        var items = this.parseItems(nodes);
        if (items.length > 0) {
            attrs.items = items;
        }

        var vertical = jq.attr("vertical");
        if (vertical) {

            attrs.vertical = vertical == "true" ? true : false;
        }
        var allowSelectItem = jq.attr("allowSelectItem");
        if (allowSelectItem) {
            attrs.allowSelectItem = allowSelectItem == "true" ? true : false;
        }

        return attrs;
    }

});
mini.regClass(mini.Menu, 'menu');