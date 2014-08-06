
/**
 * @class mini.MenuItem 是Mini UI中的菜单项组件，构造函数中调用了Control方法
 * @constructor 
 * @extends mini.Control 
 */
mini.MenuItem = function () {    
    mini.MenuItem.superclass.constructor.call(this);
}
mini.extend(mini.MenuItem, mini.Control, /** @lends mini.MenuItem.prototype */ {
	/**
	 * 菜单项文本
	 */
    text: "",
    /**
	 * 菜单项图标类
	 */
    iconCls: "",
    /**
	 * 菜单项图标CSS样式
	 */
    iconStyle: "",
    /**
	 * 菜单项图标位置
	 * @default left
	 */
    iconPosition: "left", 
    
    /**
	 * 是否显示图标
	 */
    showIcon: true,
    showAllow: true,

    /**
     * 菜单项选中状态
     */
    checked: false,
    /**
	 * 点击选中
	 */
    checkOnClick: false,
    /**
	 * 菜单项分组名称
	 */
    groupName: "",

    _hoverCls: "mini-menuitem-hover",
    _pressedCls: "mini-menuitem-pressed",
    _checkedCls: "mini-menuitem-checked",

    _clearBorder: false,

    menu: null,

    /**
	 * 菜单项控件标签class名称
	 */
    uiCls: "mini-menuitem",
    _create: function () {
        var el = this.el = document.createElement("div");
        this.el.className = "mini-menuitem";

        this.el.innerHTML = '<div class="mini-menuitem-inner"><div class="mini-menuitem-icon"></div><div class="mini-menuitem-text"></div><div class="mini-menuitem-allow"></div></div>';
        this._innerEl = this.el.firstChild;
        this._iconEl = this._innerEl.firstChild;
        this._textEl = this._innerEl.childNodes[1];
        this.allowEl = this._innerEl.lastChild;
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);
        }, this);

    },
    _inputEventsInited: false,
    _initInputEvents: function () {
        if (this._inputEventsInited) return;
        this._inputEventsInited = true;

        mini_onOne(this.el, "click", this.__OnClick, this);
        mini_onOne(this.el, "mouseup", this.__OnMouseUp, this);

        mini_onOne(this.el, "mouseout", this.__OnMouseOut, this);


    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onmouseover = null
        }
        this.menu = this._innerEl = this._iconEl = this._textEl = this.allowEl = null;
        mini.MenuItem.superclass.destroy.call(this, removeEl);
    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this.menu && this.menu.within(e)) return true;
        return false;
    },
    _doUpdateIcon: function () {
        var hasIcon = this.iconStyle || this.iconCls || this.checkOnClick;
        if (this._iconEl) {
            mini.setStyle(this._iconEl, this.iconStyle);
            mini.addClass(this._iconEl, this.iconCls);
            this._iconEl.style.display = hasIcon ? "block" : "none";
        }
        if (this.iconPosition == "top") {
            mini.addClass(this.el, "mini-menuitem-icontop");
        } else {
            mini.removeClass(this.el, "mini-menuitem-icontop");
        }
    },
    doUpdate: function () {
        if (this._textEl) this._textEl.innerHTML = this.text;
        this._doUpdateIcon();


        if (this.checked) {
            mini.addClass(this.el, this._checkedCls);
        } else {
            mini.removeClass(this.el, this._checkedCls);
        }
        if (this.allowEl) {
            if (this.menu && this.menu.items.length > 0) {
                this.allowEl.style.display = "block";
            } else {
                this.allowEl.style.display = "none";
            }
        }
    },
    /**
	 * 设置菜单项显示文本
	 */
    setText: function (value) {
        this.text = value;
        
        if (this._textEl) this._textEl.innerHTML = this.text;
    },
    /**
	 * 获取菜单项文本
	 */
    getText: function () {
        return this.text;
    },
    /**
	 * 设置菜单项图标样式
	 */
    setIconCls: function (value) {
        mini.removeClass(this._iconEl, this.iconCls);
        this.iconCls = value;
        
        this._doUpdateIcon();
    },
    /**
	 * 获取菜单项图标样式
	 */
    getIconCls: function () {
        return this.iconCls;
    },
    /**
	 * 设置菜单项图标的CSS样式
	 */
    setIconStyle: function (value) {
        this.iconStyle = value;
        
        this._doUpdateIcon();
    },
    /**
	 * 获取菜单项图标的CSS样式
	 */
    getIconStyle: function () {
        return this.iconStyle;
    },
    /**
	 * 设置图标显示位置
	 */
    setIconPosition: function (value) {
        this.iconPosition = value;
        
        this._doUpdateIcon();
    },
    /**
	 * 获取图标显示位置
	 */
    getIconPosition: function () {
        return this.iconPosition;
    },
    /**
	 * 设置是否点击时选中
	 */
    setCheckOnClick: function (value) {
        this.checkOnClick = value;
        if (value) {
            mini.addClass(this.el, "mini-menuitem-showcheck");
        } else {
            mini.removeClass(this.el, "mini-menuitem-showcheck");
        }
        this.doUpdate();
    },
    /**
	 * 获取是否点击时选中
	 */
    getCheckOnClick: function () {
        return this.checkOnClick;
    },
    /**
	 * 设置菜单项选中状态
	 */
    setChecked: function (value) {
        if (this.checked != value) {
            this.checked = value;
            this.doUpdate();
            this.fire("checkedchanged");
        }
    },
    /**
	 * 获取菜单项的选中状态
	 */
    getChecked: function () {
        return this.checked;
    },
    /**
	 * 设置菜单项分组名称
	 */
    setGroupName: function (value) {
        if (this.groupName != value) {
            this.groupName = value;
        }
    },
    /**
	 * 获取菜单项分组名称
	 */
    getGroupName: function () {
        return this.groupName;
    },
    /**
	 * 设置菜单项的下级菜单
	 */
    setChildren: function (value) {
        this.setMenu(value);
    },
    /**
	 * 设置菜单项下级菜单
	 */
    setMenu: function (value) {

        if (mini.isArray(value)) {
            value = {
                type: "menu",
                items: value
            };
        }
        if (this.menu !== value) {
            this.menu = mini.getAndCreate(value);
            this.menu.hide();
            this.menu.ownerItem = this;
            this.doUpdate();
            this.menu.on("itemschanged", this.__OnItemsChanged, this);

        }
    },
    /**
	 * 获取菜单项下级菜单
	 */
    getMenu: function () {
        return this.menu;
    },
    /**
	 * 显示菜单项下级菜单
	 */
    showMenu: function () {
        if (this.menu && this.menu.isDisplay() == false) {
            this.menu.setHideAction("outerclick");

            var options = {
                xAlign: "outright",
                yAlign: "top",
                outXAlign: "outleft",

                popupCls: "mini-menu-popup"
            };

            if (this.ownerMenu && this.ownerMenu.vertical == false) {

                options.xAlign = "left";
                options.yAlign = "below";
                options.outXAlign = null;
            }



            this.menu.showAtEl(this.el, options);

        }
    },
    /**
	 * 隐藏菜单项下级菜单
	 */
    hideMenu: function () {
        if (this.menu) this.menu.hide();
    },
    /**
	 * 隐藏菜单项
	 */
    hide: function () {
        this.hideMenu();
        this.setVisible(false);
    },

    __OnItemsChanged: function (e) {
        this.doUpdate();
    },
    /**
	 * 获取菜单项上级菜单
	 */
    getTopMenu: function () {
        if (this.ownerMenu) {
            if (this.ownerMenu.ownerItem) return this.ownerMenu.ownerItem.getTopMenu();
            else return this.ownerMenu;
        }
        return null;
    },
    
    __OnClick: function (e) {

        if (this.isReadOnly()) return;

        if (this.checkOnClick) {
            if (this.ownerMenu && this.groupName) {
                var groups = this.ownerMenu.getGroupItems(this.groupName);
                if (groups.length > 0) {
                    if (this.checked == false) {
                        for (var i = 0, l = groups.length; i < l; i++) {
                            var item = groups[i];
                            if (item != this) {

                                item.setChecked(false);
                            }
                        }
                        this.setChecked(true);
                    }
                } else {
                    this.setChecked(!this.checked);
                }
            } else {
                this.setChecked(!this.checked);
            }
        }

        this.fire("click");

        var topMenu = this.getTopMenu();
        if (topMenu) {
            topMenu._OnItemClick(this, e);
        }
    },
    __OnMouseUp: function (e) {
        if (this.isReadOnly()) return;

        if (this.ownerMenu) {
            var me = this;
            setTimeout(function () {
                if (me.isDisplay()) {
                    me.ownerMenu.showItemMenu(me);

                }
            }, 1);
        }
    },
    __OnMouseOver: function (e) {

        if (this.isReadOnly()) return;
        this._initInputEvents();
        mini.addClass(this.el, this._hoverCls);

        this.el.title = this.text;

        if (this._textEl.scrollWidth > this._textEl.clientWidth) {
            this.el.title = this.text;
        } else {
            this.el.title = "";
        }

        if (this.ownerMenu) {
            if (this.ownerMenu.isVertical() == true) {
                this.ownerMenu.showItemMenu(this);
            } else if (this.ownerMenu.hasShowItemMenu()) {
                this.ownerMenu.showItemMenu(this);
            }
        }
    },

    __OnMouseOut: function (e) {
        mini.removeClass(this.el, this._hoverCls);
    },
    onClick: function (fn, scope) {
        this.on("click", fn, scope);
    },
    /**
	 * 选中状态变更事件
	 */
    onCheckedChanged: function (fn, scope) {
        this.on("checkedchanged", fn, scope);
    },
    
    getAttrs: function (el) {
        var attrs = mini.MenuItem.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        attrs.text = el.innerHTML;
        mini._ParseString(el, attrs,
            ["text", "iconCls", "iconStyle", "iconPosition", "groupName", "onclick", "oncheckedchanged"
             ]
        );
        mini._ParseBool(el, attrs,
            ["checkOnClick", "checked"
             ]
        );

        return attrs;
    }
});
mini.regClass(mini.MenuItem, 'menuitem');