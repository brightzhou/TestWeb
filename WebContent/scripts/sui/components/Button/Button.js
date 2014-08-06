/**
 * 定义了按钮组件
 * @fileOverview Button.js 
 * @author 殷文旭
 */

mini = mini || {};

/**
 * Button 是mini UI中的按钮组件，构造函数中调用了Control方法
 * @class mini.Button
 * @constructor
 * @extends mini.Control
 * @requires mini.Control 
 */
mini.Button = function () {
    mini.Button.superclass.constructor.call(this);
}

mini.extend(mini.Button, mini.Control, /** @lends mini.Button.prototype */{
    
    /**
     * 按钮显示文本
     * @type String
     * @default ""
     */
    text: "",
    /**
     * 按钮图标类，目前按钮支持的所有图标名请参考图标列表。
     * @type String
     * @default ""
     */
    iconCls: "",
    /**
     * 按钮图标样式，目前这个属性不可用
     * @deprecated
     */
    iconStyle: "",
    /**
     * 背景是否透明开关
     * @type Boolean
     * @default false
     */
    plain: false,
	
	/**
	 * 点击时是否自动选中
	 * @type Boolean
	 * @default false
	 */
    checkOnClick: false,
    
    /**
     * 组件是否被选中
     * @type Boolean
     * @default false
     */
    checked: false,
    /**
     * 菜单项组名称。设置后，会单选菜单项组。也就是说一组按钮有了单选的特性。
     * @type String
     * @default ""
     */
    groupName: "",

    _plainCls: "mini-button-plain",
    /**
     * 鼠标划过时的样式
     */
    _hoverCls: "mini-button-hover",
    /**
     * 鼠标点击的样式
     */
    _pressedCls: "mini-button-pressed",
    /**
     * 按钮被选中的样式
     */
    _checkedCls: "mini-button-checked",
    /**
     * 按钮不可用样式
     */
    _disabledCls: "mini-button-disabled",
	
	/**
	 * 用户在按钮右边有一块自定义区域。比如可以在按钮右边加一个向下按钮，此属性用来为这块儿自定义区域添加样式。
	 * 此属性不支持HTML属性配置
	 * @type String
	 * @default ""
	 */
    allowCls: "",
	
	/**
	 * 是否清除边线，默认不清除
	 * @default false
	 */
    _clearBorder: false,
	/**
	 * 通用的设置属性方法，可以用于设置事件，设置属性。
	 * @param kv {Object} JSON对象
	 * @returns {Object}组件实例本身
	 */
    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        this._allowUpdate = kv.text || kv.iconStyle || kv.iconCls || kv.iconPosition;

        mini.Button.superclass.set.call(this, kv);

        if (this._allowUpdate === false) {
            this._allowUpdate = true;
            this.doUpdate();	//更新
        }

        return this;
    },
    /**
     * 组将样式类
     * @type String
     * @default "mini-button"
     */
    uiCls: "mini-button",
    
    /**
     * 创建组件最外层HTML结构，并绑定给组件实例。
     * @default
     * @private
     */
    _create: function () {
        this.el = document.createElement("a");

        this.el.className = "mini-button";
        this.el.hideFocus = true;
        this.el.href = "javascript:void(0)";

        this.doUpdate();
    },
    /**
     * 设置组件初始化完成后的需要执行的回调函数，
     * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
     * @private
     */
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mousedown", this.__OnMouseDown, this);
            mini_onOne(this.el, "click", this.__OnClick, this);
        }, this);
    },
    /**
     * 析构函数
     */
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onclick = null;
            this.el.onmousedown = null;
        }
        if (this.menu) this.menu.owner = null;
        this.menu = null;
        mini.Button.superclass.destroy.call(this, removeEl);
    },
    /**
     * 更新组件函数
     */
    doUpdate: function () {
        if (this._allowUpdate === false) return;
        
        var cls = "", text = this.text;

        if (this.iconCls && text) {
            cls = " mini-button-icon " + this.iconCls;
        } else if (this.iconCls && text === "") {
            cls = " mini-button-iconOnly " + this.iconCls;
            text = "&nbsp;";
        } else {
            if (text == "") text = "&nbsp;";
        }
        var s = '<span class="mini-button-text ' + cls + '">' + text + '</span>';
        //allowCls 属性不能从html标签属性中获取配置值。
        if (this.allowCls) {
            s = s + '<span class="mini-button-allow ' + this.allowCls + '"></span>';
        }
        this.el.innerHTML = s;
    },
    /**
     * 作为a标签形式按钮的href值，与HTML a标签的href属性同等功能。
     * @type String
     * @default ""
     */
    href: "",
    /**
     * 设置 href 属性
     * @param value {String}
     */
    setHref: function (value) {
        this.href = value;
        this.el.href = value;
        var el = this.el;
        setTimeout(function () {
            el.onclick = null;
        }, 100);
    },
    /**
     * 获取 href 属性值
     * @return {String}
     */
    getHref: function () {
        return this.href;
    },
   	/**
   	 * 也是作为a标签形式按钮相关属性，用以指定连接打开的位置，与标准a标签的额target属性同等功能。
   	 * @type String
   	 * @default ""
   	 */
    target: "",
    /**
     * 设置 target 属性
     * @param value {String}
     */
    setTarget: function (value) {
        this.target = value;
        this.el.target = value;
    },
    /**
     * 获取target 属性
     * @return {String}
     */
    getTarget: function () {
        return this.target;
    },
    /**
     * 设置按钮显示文本
     * @param value {String}
     */
    setText: function (value) {
        if (this.text != value) {
            this.text = value;
            this.doUpdate();
        }
    },
    /**
     * 获取按钮显示文本
     * @return {String}
     */
    getText: function () {
        return this.text;
    },
    /**
     * 设置图标
     * @param value {String}
     */
    setIconCls: function (value) {
        this.iconCls = value;
        this.doUpdate();
    },
    /**
     * 获得图标样式类
     * @return {String}
     */
    getIconCls: function () {
        return this.iconCls;
    },
    /**
     * 设置图标自定义样式类，无效方法。
     * @deprecated
     */
    setIconStyle: function (value) {
        this.iconStyle = value;
        this.doUpdate();
    },
    /**
     * 获取图标自定义样式类，无效方法。
     * @deprecated
     */
    getIconStyle: function () {
        return this.iconStyle;
    },
    /**
     * 设置图标在按钮中的显示位置，目前支持 "left" 和 "top"两种
     * @param value {String}
     */
    setIconPosition: function (value) {
        this.iconPosition = "left";
        this.doUpdate();
    },
    /**
     * 获取图标在按钮中的显示位置
     * @return {String}
     */
    getIconPosition: function () {
        return this.iconPosition;
    },
    /**
     * 设置组件背景是否透明
     * @param value {Boolean}
     */
    setPlain: function (value) {
        this.plain = value;
        if (value) this.addCls(this._plainCls);
        else this.removeCls(this._plainCls);
    },
    /**
     * 获取组件背景是否透明
     * @return {Boolean}
     */
    getPlain: function () {
        return this.plain;
    },
    /**
     * 设置组件组名
     * @param value {String}
     */
    setGroupName: function (value) {
        this.groupName = value;
    },
    /**
     * 获取组件组名
     * @return {String}
     */
    getGroupName: function () {
        return this.groupName;
    },
    /**
     * 设置是否点击时是否自动选中
     * @param value {Boolean}
     */
    setCheckOnClick: function (value) {
        this.checkOnClick = value;
    },
    /**
     * 获取是否点击时是否自动选中
     * @rerurn {Boolean}
     */
    getCheckOnClick: function () {
        return this.checkOnClick;
    },
    /**
     * 设置组件是否选中
     * @param value {Boolean}
     */
    setChecked: function (value) {

        var fire = this.checked != value;
        this.checked = value;
        if (value) this.addCls(this._checkedCls);
        else this.removeCls(this._checkedCls);
        if (fire) {
            this.fire("CheckedChanged");
        }
    },
    /**
     * 获取组件是否选中
     * @return {Boolean}
     */
    getChecked: function () {
        return this.checked;
    },
    /**
     * 触发组件Click事件
     */
    doClick: function () {
        this.__OnClick(null);
    },
    /**
     * 按钮组件实例的默认点击事件响应函数。
     * @param e Event
     */
    __OnClick: function (e) {
        if (this.readOnly || this.enabled == false) return;
        this.focus();
        if (this.checkOnClick) {
            if (this.groupName) {
                var groupName = this.groupName;
                var buttons = mini.findControls(function (control) {
                    if (control.type == "button" && control.groupName == groupName) return true;
                });
                if (buttons.length > 0) {
                    for (var i = 0, l = buttons.length; i < l; i++) {
                        var button = buttons[i];
                        if (button != this) button.setChecked(false);
                    }
                    this.setChecked(true);
                } else {
                    this.setChecked(!this.checked);
                }
            } else {
                this.setChecked(!this.checked);
            }
        }

        this.fire("click", {
            htmlEvent: e
        });
        return false;
    },
    /**
     * 按钮组件的默认 OnMouseDown 事件响应函数
     * @param e Event
     * @private
     */
    __OnMouseDown: function (e) {
        if (this.isReadOnly()) return;
        this.addCls(this._pressedCls);
        //按下的同事绑定抬起事件
        mini.on(document, "mouseup", this.__OnDocMouseUp, this);
    },
    /**
     * 按钮组件的默认 OnDocMouseUp 事件响应函数
     * @param e Event
     * @private
     */
    __OnDocMouseUp: function (e) {
        this.removeCls(this._pressedCls);
        mini.un(document, "mouseup", this.__OnDocMouseUp, this);
    },
    
    /**
     * 为组件添加一个点击响应函数
     */
    onClick: function (fn, scope) {
        this.on("click", fn, scope);
    },
    
    /**
     * 用于从HTML标签中提取配置参数的方法。在此方法中有对 text href iconCls iconStyle iconPosition groupName menu 
     * onclick oncheckedchanged target plain checkOnClick checked 等属性做提取。
     * @param el {Object} DOM元素
     * @returns {Object} JSON对象
     */
    getAttrs: function (el) {
        var attrs = mini.Button.superclass.getAttrs.call(this, el);
        
        attrs.text = el.innerHTML;
        /**
         * onclick 事件当按钮被点击时触发<br/>
         * 通过在html标签声明。
         * @name onclick
         * @event
         * @memberOf mini.Button.prototype
         */
        /**
         * oncheckedchanged 事件当按钮的选中状态改变时触发<br/>
         * 通过在html标签声明。
         * @name oncheckedchanged
         * @event
         * @memberOf mini.Button.prototype
         */
        mini._ParseString(el, attrs,
            ["text", "href", "iconCls", "iconStyle", "iconPosition", "groupName", "menu",
                "onclick", "oncheckedchanged", "target"
             ]
        );
        mini._ParseBool(el, attrs,
            ["plain", "checkOnClick", "checked"]
        );
        return attrs;
    }
});

//注册Button组件
mini.regClass(mini.Button, "button");
