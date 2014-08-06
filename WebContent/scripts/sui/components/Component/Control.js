/**
 * 定义了所有组件的基类。
 * @fileOverview Control.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * Control 是mini UI中所有组件的基类，构造函数中主要做了几件事情，
 * 1调用Components构造函数<br/>
 * 2 创建组件HTML结构<br/>
 * 3 为组件绑定默认事件<br/>
 * 4 调整组件样式<br/>
 * @class mini.Control
 * @constructor
 * @extends mini.Component
 * @requires mini.Component
 * @property borderStyle {String} 边框样式 此属性只可以用于HTML标签属性声明，在组件内没有对应的属性。
 */
mini.Control = function () {
	mini.Control.superclass.constructor.call(this);	//执行父类构造函数

	this._create();			//创建组件HTML结构。
	this.el.uid = this.uid; //为组件HTML结构设置uid属性。

	this._initEvents();		//为组件预绑定事件，这里只是做了一个声明，实际的绑定动作发生在所有组件都初始化之后。

	if (this._clearBorder) {	//去除组件最外层边框。
	    this.el.style.borderWidth = "0";
	    this.el.style.padding = "0px";

	}
	this.addCls(this.uiCls);	//为新生成的HTML结构设置样式表类名。
	this.setWidth(this.width);	//社会自最外层HTML结构的宽度
	this.setHeight(this.height);

	this.el.style.display = this.visible ? this._displayStyle : "none";
}
mini.extend(mini.Control, mini.Component, /** @lends mini.Control.prototype*/
{

	/**
	 * 将组件实例添加到window作用于内时的属性名。
	 * 绑定的动作需要调用 setJsName实现。
	 * @type String
	 * @default null
	 */
	jsName: null,

	/**
	 * 组件宽度
	 * @type String
	 * @default ""
	 */
	width: "",
	/**
	 * 组件高度
	 * @type String
	 * @default ""
	 */
	height: "",
	/**
	 * 组件是否可见，默认可见
	 * @type Boolean
	 * @default true
	 */
	visible: true,
	/**
	 * 组件是否为只读状态，默认为非只读
	 * @type Boolean
	 * @default false
	 */
	readOnly: false,
	/**
	 * 组件是否可用，默认为可用
	 * @type Boolean
	 * @default true
	 */
	enabled: true,
	/**
	 * 组件容器的title属性
	 * @type String
	 * @default ""
	 */
	tooltip: "",

	_readOnlyCls: "mini-readonly",	//只读样式
	_disabledCls: "mini-disabled",	//不可用样式

	/**
	 * 创建组件HTML结构
	 */
	_create: function () {
		/**
		 * 所有组件的HTML容器，是一个DOM对象
		 * @type {Object}
		 * @default div
		 */
		this.el = document.createElement("div");
	},
	/**
	 * 为组件实例绑定默认事件
	 */
	_initEvents: function () {
	},
	/**
	 * 判断指定元素是否包含在组件容器之内
	 * @param e {Object} HTML元素
	 * @return {Boolean} 是否包含true/false
	 */
	within: function (e) {
		if (mini.isAncestor(this.el, e.target))
			return true;
		return false;
	},
	/**
	 * 组件的name属性，与标签的name属性值一致。
	 * @type String
	 * @default ""
	 */
	name: "",

	/**
	 * 设置属性 name
	 * @param value 新name值
	 */
	setName: function (value) {
		this.name = value;

	},
	/**
	 * 获取属性 name
	 * @returns name值
	 */
	getName: function () {
		return this.name;
	},
	/**
	 * 判断组件高度是否设置为auto，注意，空等同于auto
	 * @return {Boolean}是否
	 */
	isAutoHeight: function () {
		var v = this.el.style.height;
		return v == "auto" || v == "";
	},
	/**
	 * 判断组件宽度是否设置为auto，注意，空等同于auto
	 * @returns {Boolean}是否
	 */
	isAutoWidth: function () {
		var v = this.el.style.width;
		return v == "auto" || v == "";
	},
	/**
	 * 判断width和height值是否是带有px后缀
	 * @returns {Boolean}是否
	 */
	isFixedSize: function () {
		var width = this.width;
		var height = this.height;
		if (parseInt(width) + "px" == width && parseInt(height) + "px" == height)
			return true;
		return false;
	},
	/**
	 * 判断组件是否已经渲染，判断方法是通过寻找组件容器是否拥有父节点判断。
	 * @param parentNode {Object} 参数在方法内没有被用到，是一个无效参数。
	 * @returns {Boolean}是否
	 */
	isRender: function (parentNode) {
		return !!(this.el && this.el.parentNode && this.el.parentNode.tagName);
	},
	/**
	 * 渲染组件，将组件添加到给听父元素的指定位置。同时触发render事件。
	 * @param parent 父元素
	 * @param position {String} 位置 ，可接受位置选项有  append before prepend after
	 */
	render: function (parent, position) {
		if (typeof parent === 'string') {
			if (parent == "#body")
				parent = document.body;
			else
				parent = mini.byId(parent);
		}
		if (!parent)
			return;
		if (!position)
			position = "append";
		position = position.toLowerCase();

		if (position == "before") {
			jQuery(parent).before(this.el);
		} else if (position == "prepend") {
			jQuery(parent).prepend(this.el);
		} else if (position == "after") {
			jQuery(parent).after(this.el);
		} else {
			parent.appendChild(this.el);
		}

		this.el.id = this.id;
		this.doLayout();
		this.fire("render");
	},
	/**
	 * 取得组件实例的容器对象
	 * @return {Object} DOM元素
	 */
	getEl: function () {
		return this.el;
	},
	/**
	 * 将组件实例作为一个 window 的属性
	 * @param jsName {String} window的属性名
	 */
	setJsName: function (value) {
		this.jsName = value;
		window[value] = this;
	},
	/**
	 * 获取 JsName
	 * @returns {String} window的属性名
	 */
	getJsName: function () {
		return this.jsName;
	},
	/**
	 * 设置 tooltip 的值(组件容器的title的值)
	 * @param value {String} 提示字符串
	 */
	setTooltip: function (value) {
		this.tooltip = value;
		this.el.title = value;
	},
	/**
	 * 获取 tooltip 的值(组件容器的title的值)
	 * @returns tooltip {String} 提示字符串
	 */
	getTooltip: function () {
		return this.tooltip;
	},
	/**
	 * 调整组件布局
	 */
	_sizeChaned: function () {
		this.doLayout();
	},
	/**
	 * 设置组件宽度，并调整组件布局
	 * @param {Number|String} 宽度值
	 */
	setWidth: function (value) {
		if (parseInt(value) == value)
			value += "px";
		this.width = value;
		this.el.style.width = value;
		this._sizeChaned();
	},
	/**
	 * 获取组件宽度。
	 * @param content {Boolean} 获取的宽度是否包括padding和border
	 * @returns {Number} 宽度值
	 */
	getWidth: function (content) {
		var w = content ? jQuery(this.el).width() : jQuery(this.el).outerWidth();
		if (content && this._borderEl) {
			var b2 = mini.getBorders(this._borderEl);
			w = w - b2.left - b2.right;
		}
		return w;
	},
	/**
	 * 设置组件高度，并调整组件布局
	 * @param value {Number|String} 高度值
	 */
	setHeight: function (value) {
		if (parseInt(value) == value)
			value += "px";
		this.height = value;
		this.el.style.height = value;
		this._sizeChaned();
	},
	/**
	 * 获取组件高度
	 * @param content {Boolean} 获取的高度是否包括padding和border
	 * @return {Number} 高度值
	 */
	getHeight: function (content) {
		var h = content ? jQuery(this.el).height() : jQuery(this.el).outerHeight();
		if (content && this._borderEl) {
			var b2 = mini.getBorders(this._borderEl);
			h = h - b2.top - b2.bottom;
		}
		return h;
	},
	/**
	 * 获取组件位置left/top和宽高width/height数值
	 * @returns {Object} 包括x,y,width,height,left,top,right,bottom 等8个属性
	 * @example
	 * var a = new Control();
	 * a.getBox() => {x: 20, y: 20, left :20, top : 20, width: 30, height: 30, right:50,bottom:50}
	 * 结果如此结构,其中 x == left && y == top
	 */
	getBox: function () {
		return mini.getBox(this.el);
	},
	/**
	 * 设置边框样式并调整布局
	 * @param value {String}边框样式字符串
	 */
	setBorderStyle: function (value) {

		var el = this._borderEl || this.el;
		mini.setStyle(el, value);
		this.doLayout();
	},
	/**
	 * 获取边框样式
	 * @returns {String} 边框样式字符串
	 */
	getBorderStyle: function () {
		return this.borderStyle;
	},
	/**
	 * 开关属性，用于设置组件实例边框宽度是否为0
	 * @default true
	 */
	_clearBorder: true,

	/**
	 * 设置组件样式，并调整布局
	 * @param value {String} 样式字符串
	 */
	setStyle: function (value) {
		this.style = value;
		mini.setStyle(this.el, value);
		if (this._clearBorder) {
			this.el.style.borderWidth = "0";
		}

		this.width = this.el.style.width;
		this.height = this.el.style.height;
		this._sizeChaned();
	},
	/**
	 * 获取组件样式
	 * @returns {String} style
	 */
	getStyle: function () {
		return this.style;
	},
	/**
	 * 设置组件样式类名
	 * @param cls {String}组件样式类名
	 * @example
	 * css 部分
	 * .className{样式定义}
	 * xx.setCls("className");
	 */
	setCls: function (cls) {
	    this.addCls(cls);

	},
	/**
	 * 获取组件样式类名
	 * @returns cls {String}组件样式类名
	 */
	getCls: function () {
		return this.cls;
	},
	/**
	 * 为组件容器添加样式表类名
	 * @param cls {String}样式类名
	 */
	addCls: function (cls) {
		mini.addClass(this.el, cls);
	},
	/**
	 * 为组件容器删除样式表类名
	 * @param cls {String}样式类名
	 */
	removeCls: function (cls) {
		mini.removeClass(this.el, cls);
	},
	/**
	 * 切换组件的只读和可操作状态
	 */
	_doReadOnly: function () {
		if (this.readOnly) {
			this.addCls(this._readOnlyCls);
		} else {
			this.removeCls(this._readOnlyCls);
		}
	},
	/**
	 * 设置组件的只读状态
	 * @param value {Boolean} 只读/可操作
	 */
	setReadOnly: function (value) {
		this.readOnly = value;
		this._doReadOnly();
	},
	/**
	 * 获取组件是否为只读
	 * @returns {Boolean} 只读/可操作
	 */
	getReadOnly: function () {
		return this.readOnly;
	},
	/**
	 * 获取相对本组件的祖先组件，且这个祖先组件的uiCls 属性值与指定的参数值一致。
	 * @param uiCls {String} 组件样式类名
	 * @returns {Control|null}父组件实例
	 */
	getParent: function (uiCls) {
		var doc = document;
		var p = this.el.parentNode;
		while (p != doc && p != null) {
			var pcontrol = mini.get(p);
			if (pcontrol) {
				if (!mini.isControl(pcontrol))
					return null;
				if (!uiCls || pcontrol.uiCls == uiCls)
					return pcontrol;
			}
			p = p.parentNode;
		}
		return null;
	},
	/**
	 * 判断组件实例是否只读
	 * @returns {Boolean}是/否
	 */
	isReadOnly: function () {
		if (this.readOnly || !this.enabled)
			return true;
		var p = this.getParent();
		if (p)
			return p.isReadOnly();
		return false;
	},
	/**
	 * 设置组件实例是否可用
	 * @param value {Boolean}是/否
	 */
	setEnabled: function (value) {
		this.enabled = value;
		if (this.enabled) {
			this.removeCls(this._disabledCls);
		} else {
			this.addCls(this._disabledCls);
		}
		this._doReadOnly();
	},
	/**
	 * 获取组件实例是否可用
	 * @returns value {Boolean}是/否
	 */
	getEnabled: function () {
		return this.enabled;
	},
	/**
	 * 设置组件实例为可用
	 */
	enable: function () {
		this.setEnabled(true);
	},
	/**
	 * 设置组件实例为不可用
	 */
	disable: function () {
		this.setEnabled(false);
	},
	_displayStyle: "",

	/**
	 * 设置组件是否显示
	 * @param value {Boolean}是/否
	 */
	setVisible: function (value) {
		this.visible = value;
		if (this.el) {
			this.el.style.display = value ? this._displayStyle : "none";
			this.doLayout();
		}
	},
	/**
	 * 获取组件是否显示
	 * @returns {Boolean}是/否
	 */
	getVisible: function () {
		return this.visible;
	},
	/**
	 * 设置组件显示
	 */
	show: function () {
		this.setVisible(true);
	},
	/**
	 * 设置组件隐藏
	 */
	hide: function () {
		this.setVisible(false);
	},
	/**
	 * 判断组件是否显示
	 * @return {Boolean}
	 */
	isDisplay: function () {

		if (mini.isWindowDisplay() == false)
			return false;

		/*var doc = document.body;
		var p = this.el;
		while (1) {
			if (p == null || !p.style)
				return false;
			if (p && p.style && p.style.display == "none")
				return false;
			if (p == doc)
				return true;

			p = p.parentNode;

		}*/
        //解决判断不准确的问题（如iframe切换时） 赵美丹 2013-04-17    
		return $(this.el).is(":visible");
	},
	/**
	 * 允许将组件HTML细节添加到组件容器中。
	 * @default ture
	 * @private
	 */
	_allowUpdate: true,
	/**
	 * 开始更新组件容器内部
	 */
	beginUpdate: function () {
		this._allowUpdate = false;
	},
	/**
	 * 组件容器内部元素更新结束
	 */
	endUpdate: function () {
		this._allowUpdate = true;
		this.doUpdate();
	},
	/**
	 * 实际的组件容器内部元素更新操作，通常需要自组件复写
	 */
	doUpdate: function () {

	},
	/**
	 * 当前是否可以调整布局
	 * @returns {Boolean}是/否
	 */
	canLayout: function () {
		if (this._allowLayout == false)
			return false;
		return this.isDisplay();
	},
	/**
	 * 组件实际的调整布局操作，通常需要自组件复写
	 */
	doLayout: function () {

	},
	/**
	 * 如果可以调整布局则执行调整布局操作
	 */
	layoutChanged: function () {
		if (this.canLayout() == false)
			return;
		this.doLayout();
	},
	/**
	 * 组件默认析构函数
	 */
	_destroyChildren: function (removeEl) {
	    if (this.el) {
	        var cs = mini.getChildControls(this);
	        for (var i = 0, l = cs.length; i < l; i++) {
	            var control = cs[i];
	            if (control.destroyed !== true) {
	                control.destroy(removeEl);
	            }
	        }
	    }
	},
	destroy: function (removeEl) {

	    if (this.destroyed !== true) {
	        this._destroyChildren(removeEl);
	    }

	    if (this.el) {
	        mini.clearEvent(this.el);


	        if (removeEl !== false) {
	            var p = this.el.parentNode;
	            if (p) p.removeChild(this.el);
	        }
	    }
	    this._borderEl = null;
	    this.el = null;
	    //内存泄露问题优化 赵美丹 2013-04-17
	    mini.clearEvent(this);
	    mini["unreg"](this);
	    this.destroyed = true;
	    this.fire("destroy");
	},

	/**
	 * 组件容器获取焦点
	 */
	focus: function () {
		try {
			var me = this;
			me.el.focus();
		} catch (e) {
		};
	},
	/**
	 * 组件容器失去焦点
	 */
	blur: function () {
		try {
			var me = this;
			me.el.blur();
		} catch (e) {
		};
	},
	/**
	 * 目前尚不清楚用途
	 */
	allowAnim: true,
	/**
	 * 目前尚不清楚用途
	 */
	setAllowAnim: function (value) {
		this.allowAnim = value;
	},
	/**
	 * 目前尚不清楚用途
	 */
	getAllowAnim: function () {
		return this.allowAnim;
	},
	/**
	 * 获取组建需要遮罩效果时需要遮罩的元素
	 */
	_getMaskWrapEl: function () {
		return this.el;
	},
	/**
	 * 为组件添加遮罩效果
	 */
	mask: function (options) {

		if (typeof options == "string")
			options = {
				html: options
			};
		options = options || {};
		options.el = this._getMaskWrapEl();
		if (!options.cls)
			options.cls = this._maskCls;

		mini.mask(options);
	},
	/**
	 * 为组件删除遮罩效果
	 */
	unmask: function () {
		mini.unmask(this._getMaskWrapEl());
	},
	/**
	 * 遮罩样式
	 * @private
	 * @default "mini-mask-loading"
	 */
	_maskCls: "mini-mask-loading",
	/**
	 * 遮罩默认显示信息
	 * @default "Loading..."
	 */
	loadingMsg: "Loading...",

	/**
	 * 自定义遮罩显示信息
	 * @param msg 信息
	 */
	loading: function (msg) {
		this.mask(msg || this.loadingMsg);
	},
	/**
	 * 设置loadingMsg的值
	 * @param value
	 */
	setLoadingMsg: function (value) {
		this.loadingMsg = value;
	},
	/**
	 * 获取loadingMsg的值
	 * @param loadingMsg
	 */
	getLoadingMsg: function () {
		return this.loadingMsg;
	},
	/**
	 * 创建一个菜单组件实例，与菜单组件有动态依赖关系。
	 */
	_getContextMenu: function (value) {
		var ui = value;
		if (typeof value == "string") {
			ui = mini.get(value);
			if (!ui) {
				mini.parse(value);
				ui = mini.get(value);
			}
		} else if (mini.isArray(value)) {
			ui = {
				type: "menu",
				items: value
			};
		} else if (!mini.isControl(value)) {
			ui = mini.create(value);
		}
		return ui;
	},
	__OnHtmlContextMenu: function (e) {
		var ev = {
			popupEl: this.el,
			htmlEvent: e,
			cancel: false
		};
		this.contextMenu.fire("BeforeOpen", ev);
		if (ev.cancel == true)
			return;
		this.contextMenu.fire("opening", ev);
		if (ev.cancel == true)
			return;
		this.contextMenu.showAtPos(e.pageX, e.pageY);
		this.contextMenu.fire("Open", ev);
		return false;
	},
	/**
	 * 菜单组件实例
	 * @type mini.Menu
	 * @default null
	 */
	contextMenu: null,

	/**
	 * 为组件增加菜单功能。
	 * @param value {String| Arary | Object} 参数可以是组件ID，菜单项数组，或者是其他。
	 */
	setContextMenu: function (value) {
		var ui = this._getContextMenu(value);
		if (!ui)
			return;
		if (this.contextMenu !== ui) {
			this.contextMenu = ui;
			this.contextMenu.owner = this;
			mini.on(this.el, "contextmenu", this.__OnHtmlContextMenu, this);
		}
	},
	/**
	 * 获取组件上绑定的菜单组件。
	 * @return {Object} 菜单组件实例
	 */
	getContextMenu: function () {
		return this.contextMenu;
	},
	/**
	 * 设置组件默认值
	 * @param value {String}
	 */
	setDefaultValue: function (value) {
		this.defaultValue = value;
	},
	/**
	 * 获取组件默认值
	 * @returns {String} defaultValue
	 */
	getDefaultValue: function () {
		return this.defaultValue;
	},
	/**
	 * 设置组件值
	 * @param value {String}
	 */
	setValue: function (value) {
		this.value = value;
	},
	/**
	 * 获取组件值
	 * @returns {String}
	 */
	getValue: function () {
		return this.value;
	},
	/**
	 * 组件链接完成后需要执行的方法。此方法可以被子类复写。
	 */
	_afterApply: function (el) {
	},
	dataField: "",
	setDataField: function (value) {
	    this.dataField = value;
	},
	getDataField: function () {
	    return this.dataField;
	},

	/**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对 id, name, width, height, borderStyle, value, defaultValue,
	 * contextMenu, tooltip, ondestroy, visible, enabled, readOnly等属性做解析。
	 */
	getAttrs: function (el) {

		var attrs = {};
		var cls = el.className;
		if (cls)
			attrs.cls = cls;

		if (el.value)
			attrs.value = el.value;
		/**
		 * ondestroy事件当组件销毁时触发（触发几率大约为80%不稳定，不建议是用作严格的事情。）<br/>
		 * 通过在html标签声明。
		 * @name ondestroy
		 * @event
		 * @memberOf mini.Control.prototype
		 */
		mini._ParseString(el, attrs,
		["id", "name", "width", "height", "borderStyle", "value", "defaultValue",
		"contextMenu", "tooltip", "ondestroy", "data-options", "dataField"
		]
		);

		mini._ParseBool(el, attrs,
		["visible", "enabled", "readOnly"
		]
		);

		if (el.readOnly && el.readOnly != "false")
			attrs.readOnly = true;

		var style = el.style.cssText;
		if (style) {
			attrs.style = style;
		}
		if (isIE9) {
			var bg = el.style.background;
			if (bg) {
				if (!attrs.style)
					attrs.style = "";
				attrs.style += ";background:" + bg;
			}
		}
		if (this.style) {
			if (attrs.style)
				attrs.style = this.style + ";" + attrs.style;
			else
				attrs.style = this.style;
		}
		if (this.borderStyle) {
			if (attrs.borderStyle)
				attrs.borderStyle = this.borderStyle + ";" + attrs.borderStyle;
			else
				attrs.borderStyle = this.borderStyle;
		}
		var ts = mini._attrs;
		if (ts) {
			for (var i = 0, l = ts.length; i < l; i++) {
				var t = ts[i];
				var name = t[0];
				var type = t[1];
				if (!type)
					type = "string";
				if (type == "string")
					mini._ParseString(el, attrs, [name]);
				else if (type == "bool")
					mini._ParseBool(el, attrs, [name]);
				else if (type == "int")
					mini._ParseInt(el, attrs, [name]);
			}
		}

		var options = attrs["data-options"];
		if (options) {
			options = eval("(" + options + ")");
			if (options) {

				mini.copyTo(attrs, options);
			}
		}
		return attrs;
	}
});

/**
 * 配合mini.regHtmlAttr方法是用的属性。现在已经没有实际价值。
 * @deprecated
 */
mini._attrs = null;

/**
 * 过时的方法，没有价值
 * @deprecated
 */
mini.regHtmlAttr = function (attr, type) {
	if (!attr)
		return;
	if (!type)
		type = "string";
	if (!mini._attrs)
		mini._attrs = [];
	mini._attrs.push([attr, type]);
}