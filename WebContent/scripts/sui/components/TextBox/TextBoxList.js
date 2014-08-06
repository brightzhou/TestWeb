/**
 * 文件中定义了TextBoxList组件。
 * @fileOverview TextBoxList.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * TextBoxList 是mini UI中的选择输入框组件，构造函数中调用了 ValidatorBase 构造函数。和doUpdate函数
 * @class mini.TextBox
 * @constructor
 * @extends mini.ValidatorBase
 * @requires mini.ValidatorBase
 * @requires mini.ListBox
 * @version 1.0
 */
mini.TextBoxList = function () {
	mini.TextBoxList.superclass.constructor.call(this);
	this.data = [];
	this.doUpdate();
}
mini.extend(mini.TextBoxList, mini.ValidatorBase, /** @lends mini.TextBoxList.prototype */
{
	/**
	 * 标记，代表这是一个form组件
	 * @type Boolean
	 * @default true
	 */
	formField: true,
	/**
	 * 值，注，此组件是 KEY-VALUE 形式组件，也就是说组件有两个值，一个用于展现，一个用于后台处理。
	 * 这里的值是是实际传递到后台的值。
	 * @type String
	 * @default ""
	 */
	value: "",
	/**
	 * 文本
	 * @type String
	 * @default ""
	 */
	text: "",
	/**
	 * 值对应json格式数据中的属性名
	 * @type String
	 * @default id
	 */
	valueField: "id",
	/**
	 * 显示文本对应 json格式数据中的属性名
	 * @type String
	 * @default text
	 */
	textField: "text",
	/**
	 * 数据的远程加载地址
	 * @type String
	 * @default ""
	 */
	url: "",
	/**
	 * 获取url地址指向的远程数据前显示loading...的等待时长。
	 * @type Number
	 * @default 250
	 */
	delay: 150,
	/**
	 * 是否可录入标志
	 * @type Boolean
	 * @default true
	 */
	allowInput: true,
	/**
	 * 已选项数
	 * @type Number
	 * @default 0
	 */
	editIndex: 0,

	_focusCls: "mini-textboxlist-focus",
	_itemHoverClass: "mini-textboxlist-item-hover",
	_itemSelectedClass: "mini-textboxlist-item-selected",
	_closeHoverClass: "mini-textboxlist-close-hover",

	/**
	 * 文本录入框元素的name 属性，在源代码中此属性没有被使用到。
	 * @type String
	 * @default ""
	 * @deprecated
	 * @private
	 */
	textName: "",
	/**
	 * 设置文本录入框元素的name 属性，在源代码中此属性没有被使用到。
	 * @param {String}
	 * @deprecated
	 * @private
	 */
	setTextName: function (value) {
		this.textName = value;

	},
	/**
	 * 获取文本录入框元素的name 属性，在源代码中此属性没有被使用到。
	 * @return {String}
	 * @deprecated
	 * @private
	 */
	getTextName: function () {
		return this.textName;
	},
	/**
	 * 组将样式类
	 * @type String
	 * @default "mini-textboxlist"
	 */
	uiCls: "mini-textboxlist",
	/**
	 * 这个组件的HTML结构堪称脑残。
	 */
	_create: function () {

		var html = '<table class="mini-textboxlist" cellpadding="0" cellspacing="0"><tr ><td class="mini-textboxlist-border"><ul></ul><a href="#"></a><input type="hidden"/></td></tr></table>';
		var d = document.createElement("div");
		d.innerHTML = html;
		//创建组件容器
		this.el = d.firstChild;

		var td = this.el.getElementsByTagName("td")[0];
		// ulEl 是被选中项容器
		this.ulEl = td.firstChild;
		// 保存值的元素
		this._valueEl = td.lastChild;
		// 焦点操作元素
		this.focusEl = td.childNodes[1];
	},
	/**
	 * 析构函数
	 */
	destroy: function (removeEl) {
		if (this.isShowPopup) {
			this.hidePopup();
		}
		mini.un(document, "mousedown", this.__OnDocMouseDown, this);
		mini.TextBoxList.superclass.destroy.call(this, removeEl);
	},
	/**
	 * 设置组件初始化完成后的需要执行的回调函数。
	 * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
	 */
	_initEvents: function () {
		mini.TextBoxList.superclass._initEvents.call(this);

		mini.on(this.el, "mousemove", this.__OnMouseMove, this);
		mini.on(this.el, "mouseout", this.__OnMouseOut, this);
		mini.on(this.el, "mousedown", this.__OnMouseDown, this);
		mini.on(this.el, "click", this.__OnClick, this);
		mini.on(this.el, "keydown", this.__OnKeyDown, this);

		mini.on(document, "mousedown", this.__OnDocMouseDown, this);
	},
	//为文档绑定的默认mousedown响应函数，主要作用就是隐藏弹出层，调整样式。
	__OnDocMouseDown: function (e) {
		if (this.isReadOnly())
			return;
		if (this.isShowPopup) {
			if (!mini.isAncestor(this.popup.el, e.target)) {
				this.hidePopup();
			}
		}
		if (this._focused) {
			if (this.within(e) == false) {
				this.select(null, false);
				this.showInput(false);

				this.removeCls(this._focusCls);
				this._focused = false;
			}
		}
	},
	/**
	 * 无用参数，实际应该是_errorIconEl，代码中写错了
	 * @deprecated
	 * @private
	 */
	errorIconEl: null,
	/**
	 * 获取错误图标元素，如果当前没有则创建一个错误图标元素
	 * @return {Object}
	 */
	getErrorIconEl: function () {
		if (!this._errorIconEl) {
			var tr = this.el.rows[0];
			var td = tr.insertCell(1);
			td.style.cssText = 'width:18px;vertical-align:top;';
			td.innerHTML = '<div class="mini-errorIcon"></div>';
			this._errorIconEl = td.firstChild;
		}
		return this._errorIconEl;
	},
	/**
	 * 删除图标元素
	 */
	_RemoveErrorIcon: function () {
		if (this._errorIconEl) {
			jQuery(this._errorIconEl.parentNode).remove();
		}
		this._errorIconEl = null;
	},
	/**
	 * 调整组件布局，同能主要通过调用父类方法实现。
	 */
	doLayout: function () {
		if (this.canLayout() == false)
			return;
		mini.TextBoxList.superclass.doLayout.call(this);

		if (this.isReadOnly() || this.allowInput == false) {
			this._inputEl.readOnly = true;
		} else {
			this._inputEl.readOnly = false;
		}
	},
	/**
	 * 生成组件容器内的部分，包括录入框和已选中项
	 */
	doUpdate: function () {
		if (this._ValueChangeTimer)
			clearInterval(this._ValueChangeTimer);
		if (this._inputEl)
			mini.un(this._inputEl, "keydown", this.__OnInputKeyDown, this);

		var sb = [];
		var id = this.uid;
		//设置已经被选中的项
		for (var i = 0, l = this.data.length; i < l; i++) {
			var o = this.data[i];
			var li_id = id + "$text$" + i;
			var text = mini._getMap(this.textField, o);
			if (mini.isNull(text))
				text = "";
			sb[sb.length] = '<li id="' + li_id + '" class="mini-textboxlist-item">';
			sb[sb.length] = text;
			sb[sb.length] = '<span class="mini-textboxlist-close"></span></li>';
		}
		var inputid = id + "$input";
		//录入框
		sb[sb.length] = '<li id="' + inputid + '" class="mini-textboxlist-inputLi"><input class="mini-textboxlist-input" type="text" autocomplete="off"></li>';

		this.ulEl.innerHTML = sb.join("");

		this.editIndex = this.data.length;
		if (this.editIndex < 0)
			this.editIndex = 0;

		this.inputLi = this.ulEl.lastChild;
		//录入框
		this._inputEl = this.inputLi.firstChild;
		//为录入框绑定按键按下响应函数，响应函数中做的是弹出的动作。
		mini.on(this._inputEl, "keydown", this.__OnInputKeyDown, this);

		var sf = this;
		/** @ignore*/
		this._inputEl.onkeyup = function () {
			sf._syncInputSize();	//调整录入框长度
		}
		sf._ValueChangeTimer = null;
		sf._LastInputText = sf._inputEl.value; //更新前的录入框文本
		/** @ignore*/
		this._inputEl.onfocus = function () {
			sf._ValueChangeTimer = setInterval( function () {
				if (sf._LastInputText != sf._inputEl.value) {
					sf._startQuery(); //加载数据
					sf._LastInputText = sf._inputEl.value;
				}
			}, 10);
			sf.addCls(sf._focusCls);
			sf._focused = true;
			sf.fire("focus");
		}
		/** @ignore*/
		this._inputEl.onblur = function () {
			clearInterval(sf._ValueChangeTimer);
			sf.fire("blur");
		}
	},
	/**
	 * 获取指定的已选项数据，虽然是暴露在外的方法，但是不建议使用，因为参数是Event对象，
	 * 只能在事件方法中使用
	 * @param event {Event}
	 * @return {Object}
	 */
	getItemByEvent: function (event) {
		var domItem = mini.findParent(event.target, "mini-textboxlist-item");
		if (domItem) {
			var ids = domItem.id.split("$");
			var id = ids[ids.length - 1];
			return this.data[id];
		}
	},
	/**
	 * 根据指定顺序号获取已选项数据
	 * @param id {Number|Object} Object参数直接返回
	 * @return {Object}
	 */
	getItem: function (id) {
		if (typeof id == "number")
			return this.data[id];
		if (typeof id == "object")
			return id;
	},
	/**
	 * 根据指定的已选项数据获取已选项元素
	 * @param o {Object}
	 * @return {Object}
	 */
	getItemEl: function (o) {
		var index = this.data.indexOf(o);
		var li_id = this.uid + "$text$" + index;
		return document.getElementById(li_id);
	},
	/**
	 * 调整鼠标悬停时的样式处理，不建议外部使用。
	 * @param item {Object}
	 * @param e {Event}
	 */
	hoverItem: function (item, e) {
	    if (this.isReadOnly() || this.enabled == false) return;

		this.blurItem();
		var li = this.getItemEl(item);
		mini.addClass(li, this._itemHoverClass);

		if (e && mini.hasClass(e.target, "mini-textboxlist-close")) {
			mini.addClass(e.target, this._closeHoverClass);
		}
	},
	/**
	 * 已选项失去焦点处理
	 */
	blurItem: function () {
		var len = this.data.length;
		for (var i = 0, l = len; i < l; i++) {
			var o = this.data[i];

			var li = this.getItemEl(o);
			if (li) {
				mini.removeClass(li, this._itemHoverClass);

				mini.removeClass(li.lastChild, this._closeHoverClass);
			}
		}
	},
	/**
	 * 将录入框显示在指定顺序号的已选项后。不建议外部调用。
	 * @param index {Number}
	 * @return {Object} 录入框容器元素。
	 */
	showInput: function (index) {
		this.select(null);

		if (mini.isNumber(index)) {
			this.editIndex = index;
		} else {
			this.editIndex = this.data.length;
		}
		if (this.editIndex < 0)
			this.editIndex = 0;
		if (this.editIndex > this.data.length)
			this.editIndex = this.data.length;

		var inputLi = this.inputLi;
		inputLi.style.display = "block";

		if (mini.isNumber(index) && index < this.data.length) {
			var item = this.data[index];
			var itemEl = this.getItemEl(item);
			jQuery(itemEl).before(inputLi);
		} else {
			this.ulEl.appendChild(inputLi);
		}
		if (index !== false) {
			setTimeout( function () {
				try {
					inputLi.firstChild.focus();
					mini.selectRange(inputLi.firstChild, 100);
				} catch (e) {
				}
			}, 10);
		} else {
			this.lastInputText = "";
			this._inputEl.value = "";
		}
		return inputLi;
	},
	/**
	 * 选中指定顺序号的列表项
	 * @param item {Number|Object}
	 */
	select: function (item) {
		item = this.getItem(item);
		//首先取消原本的选中效果
		if (this._selected) {
			var itemEl = this.getItemEl(this._selected);
			mini.removeClass(itemEl, this._itemSelectedClass);
		}
		//选中新的列表项
		this._selected = item;
		if (this._selected) {
			var itemEl = this.getItemEl(this._selected);
			mini.addClass(itemEl, this._itemSelectedClass);
		}
		//处理获取焦点。
		var sf = this;
		if (this._selected) {
			this.focusEl.focus();
			var me = this;
			setTimeout( function () {
				try {
					me.focusEl.focus();
				} catch (ex) {
				}
			}, 50);
		}
		if (this._selected) {
			sf.addCls(sf._focusCls);
			sf._focused = true;
		}
	},
	/**
	 * 将可选项插入到已选项中。此方法由_lsitbox调用。
	 */
	_doInsertSelectValue: function () {
		var item = this._listbox.getSelected();
		var index = this.editIndex;
		if (item) {
			item = mini.clone(item);
			this.insertItem(index, item);
		}
	},
	/**
	 * 将可选项插入到已选项集合的指定位置。
	 * @param index {Number} 顺序号
	 * @param item {Object} 插入数据
	 */
	insertItem: function (index, item) {
		this.data.insert(index, item);
		var text = this.getText();
		var value = this.getValue();
		this.setValue(value, false);
		this.setText(text, false);
		this._createData();
		this.doUpdate();
		this.showInput(index + 1); //显示到出第几个
		this._OnValueChanged(); //触发onValueChanged默认函数。
	},
	/**
	 *
	 * 从已选项列表中删除指定已选项
	 * @param item {Object}
	 * @example
	 * 可以配合 getItem 方法使用
	 * var textboxlist = mini.get('id');
	 * textboxlist.removeItem(textboxlist.getItem(2));
	 */
	removeItem: function (item) {
		if (!item)
			return;
		var itemEl = this.getItemEl(item);
		mini.removeNode(itemEl);
		this.data.remove(item);

		var text = this.getText();
		var value = this.getValue();

		this.setValue(value, false);
		this.setText(text, false);
		this._OnValueChanged();
	},
	/**
	 * 对 value 和 text 做Null 转 空字符串的处理
	 */
	_createData: function () {
		var texts = (this.text ? this.text : "").split(",");
		var values = (this.value ? this.value : "").split(",");

		if (values[0] == "")
			values = [];
		var len = values.length;
		//？为什么要重新设置长度？正常情况下应该是相等的吧。而且擅自改变数组长度，这不科学
		this.data.length = len;

		for (var i = 0, l = len; i < l; i++) {
			var o = this.data[i];
			if (!o) {
				o = {};
				this.data[i] = o;
			}
			var text = !mini.isNull(texts[i]) ? texts[i] : "";
			var value = !mini.isNull(values[i]) ? values[i] : "";

			mini._setMap(this.textField, text, o);
			mini._setMap(this.valueField, value, o);

		}

		this.value = this.getValue();
		this.text = this.getText();
	},
	/**
	 * 获取录入框中的文本
	 * @return {String}
	 */
	getInputText: function () {
		return this._inputEl ? this._inputEl.value : "";
	},
	/**
	 * 获取已选项文本，多个已选项的情况文本之间用“,”间隔
	 * @return {String}
	 */
	getText: function () {
		var sb = [];
		for (var i = 0, l = this.data.length; i < l; i++) {
			var o = this.data[i];
			var name = mini._getMap(this.textField, o);
			if (mini.isNull(name))
				name = "";
			name = name.replace(",", "，");
			sb.push(name);
		}
		return sb.join(",");
	},
	/**
	 * 获取已选项的值，多个已选项的情况值之间用“,”间隔
	 * @return {String}
	 */
	getValue: function () {
		var sb = [];
		for (var i = 0, l = this.data.length; i < l; i++) {
			var o = this.data[i];
			var v = mini._getMap(this.valueField, o);
			sb.push(v);

		}
		return sb.join(",")
	},
	/**
	 * 设置保存选项值的隐藏域元素的 name 属性
	 * @param value {String}
	 */
	setName: function (value) {
		if (this.name != value) {
			this.name = value;
			this._valueEl.name = value;
		}
	},
	/**
	 * 设置已选中值，并重绘组件容器内部分
	 * @param value {String}
	 */
	setValue: function (value) {
		if (mini.isNull(value))
			value = "";
		if (this.value != value) {
			this.value = value;
			this._valueEl.value = value;
			this._createData();
			this.doUpdate();
		}
	},
	/**
	 * 设置已选中文本，并重绘组件容器内部分
	 */
	setText: function (value) {
		if (mini.isNull(value))
			value = "";
		if (this.text !== value) {
			this.text = value;
			this._createData();
			this.doUpdate();
		}
	},
	/**
	 * 设置对应json格式数据中的属性名
	 * @param value {String}
	 */
	setValueField: function (value) {
	    this.valueField = value;
	    this._createData();

	},
	/**
	 * 获取对应json格式数据中的属性名
	 * @return {String}
	 */
	getValueField: function () {
		return this.valueField;
	},
	/**
	 * 设置显示文本对应 json格式数据中的属性名
	 * @param value {String}
	 */
	setTextField: function (value) {
	    this.textField = value;
	    this._createData();

	},
	/**
	 * 获取显示文本对应 json格式数据中的属性名
	 * @return {String}
	 */
	getTextField: function () {
		return this.textField;
	},
	/**
	 * 设置是否可录入开关属性
	 * @param value {Boolean}
	 */
	setAllowInput: function (value) {
		this.allowInput = value;
		this.doLayout();
	},
	/**
	 * 获取是否可录入开关属性值
	 * @returns value {Boolean}
	 */
	getAllowInput: function () {
		return this.allowInput;
	},
	/**
	 * 设置 url 属性
	 * @param value {String}
	 */
	setUrl: function (value) {
		this.url = value;
	},
	/**
	 * 获取 url 属性
	 * @return {String}
	 */
	getUrl: function () {
		return this.url;
	},
	/**
	 * 设置弹出层高度
	 * @param value {Number}
	 */
	setPopupHeight: function (value) {
		this.popupHeight = value;
	},
	/**
	 * 获取弹出层高度
	 * @return {Number}
	 */
	getPopupHeight: function () {
		return this.popupHeight;
	},
	/**
	 * 设置弹出层最小高度
	 * @param value {Number}
	 */
	setPopupMinHeight: function (value) {
		this.popupMinHeight = value;
	},
	/**
	 * 获取弹出层最小高度
	 * @return {Number}
	 */
	getPopupMinHeight: function () {
		return this.popupMinHeight;
	},
	/**
	 * 设置弹出层最大高度
	 * @param value {Number}
	 */
	setPopupMaxHeight: function (value) {
		this.popupMaxHeight = value;
	},
	getPopupMaxHeight: function () {
		return this.popupMaxHeight;
	},
	doQuery: function () {
		this._startQuery(true);
	},
	//自动调整录入框长度
	_syncInputSize: function () {
		if (this.isDisplay() == false)
			return;
		var text = this.getInputText();
		var size = mini.measureText(this._inputEl, text);
		var width = size.width > 20 ? size.width + 4 : 20;
		var elWidth = mini.getWidth(this.el, true);
		if (width > elWidth - 15)
			width = elWidth - 15;
		this._inputEl.style.width = width + "px";
	},
	/**
	 * 开始加载数据，参数毫无价值
	 */
	_startQuery: function (oldText) {
		var sf = this;

		setTimeout( function () {
			sf._syncInputSize();
		}, 1);
		this.showPopup("loading");
		this._stopQuery();
		this._loading = true;
		this.delayTimer = setTimeout( function () {
			var text = sf._inputEl.value;
			sf._doQuery();
		}, this.delay);
	},
	/**
	 * 加载远程数据，并复制给_listbox
	 */
	_doQuery: function () {
	    if (this.isDisplay() == false) return;
	    var text = this.getInputText();

	    var sf = this;
	    var dataSource = this._listbox.getData();
	    var params = {

	        value: this.getValue(),
	        text: this.getText()
	    };
	    params[this.searchField] = text;

	    var url = this.url;
	    var fn = typeof url == "function" ? url : window[url];
	    if (typeof fn == "function") {
	        url = fn(this);
	    }
	    if (!url) return;

	    var ajaxMethod = "post";
	    if (url) {
	        if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
	            ajaxMethod = "get";
	        }
	    }

	    var e = {
	        url: url,
	        async: true,
	        params: params,
	        data: params,
	        type: ajaxMethod,
	        cache: false,
	        cancel: false
	    };
	    this.fire("beforeload", e);
	    if (e.data != e.params && e.params != params) {
	        e.data = e.params;
	    }
	    if (e.cancel) return;

	    mini.copyTo(e, {
	        success: function (text) {
	            var data = mini.decode(text);

	            if (sf.dataField) {
	                data = mini._getMap(sf.dataField, data);
	            }
	            if (!data) data = [];

	            sf._listbox.setData(data);
	            sf.showPopup();
	            sf._listbox._focusItem(0, true);
	            sf.fire("load");
	            sf._loading = false;

	            if (sf._selectOnLoad) {
	                sf.__doSelectValue();
	                sf._selectOnLoad = null;
	            }
	        },
	        error: function (jqXHR, textStatus, errorThrown) {
	            sf.showPopup("error");
	        }
	    });

	    sf._ajaxer = mini.ajax(e);
	},

	/**
	 * 停止等待提示
	 */
	_stopQuery: function () {
		if (this.delayTimer) {
			clearTimeout(this.delayTimer);
			this.delayTimer = null;
		}
		if (this._ajaxer) {
			this._ajaxer.abort();
		}
		this._loading = false;
	},
	/**
	 * 判断指定元素是否是el的子孙节点，或者是不是_listbox的子孙节点
	 * @param e {Object}
	 * @return {Boolean}
	 */
	within: function (e) {
		if (mini.isAncestor(this.el, e.target))
			return true;
		if (this.showPopup && this.popup && this.popup.within(e))
			return true;
		return false;
	},
	/**
	 * 弹出层请求数据时的等待信息HTML结构
	 * @type String
	 * @default "<span class='mini-textboxlist-popup-loading'>Loading...</span>"
	 */
	popupLoadingText: "<span class='mini-textboxlist-popup-loading'>Loading...</span>",
	/**
	 * 弹出层请求数据时的出错信息HTML结构
	 * @type String
	 * @default "<span class='mini-textboxlist-popup-error'>Error</span>"
	 */
	popupErrorText: "<span class='mini-textboxlist-popup-error'>Error</span>",
	/**
	 * 弹出层没数据时的显示信息HTML结构。
	 * @type String
	 * @default "<span class='mini-textboxlist-popup-noresult'>No Result</span>"
	 */
	popupEmptyText: "<span class='mini-textboxlist-popup-noresult'>No Result</span>",

	/**
	 * 标识弹出层是否处于显示状态
	 * @type Boolean
	 * @default false
	 */
	isShowPopup: false,
	/**
	 * 弹出层高度
	 * @name popupHeight
	 * @type Number
	 */
	popupHeight: "",
	/**
	 * 弹出层最小高度
	 * @name popupMinHeight
	 * @type Number
	 * @default 30
	 */
	popupMinHeight: 30,
	/**
	 * 弹出层最大高度
	 * @name popupMaxHeight
	 * @type Number
	 * @default 150
	 */
	popupMaxHeight: 150,
	/**
	 * 创建弹出层。依赖于ListBox
	 */
	_createPopup: function () {
		if (!this.popup) {
			this.popup = new mini.ListBox();
			this.popup.addCls("mini-textboxlist-popup");
			this.popup.setStyle("position:absolute;left:0;top:0;");
			this.popup.showEmpty = true;
			this.popup.setValueField(this.valueField);
			this.popup.setTextField(this.textField);
			this.popup.render(document.body);
			this.popup.on("itemclick", function (e) {
				this.hidePopup();
				this._doInsertSelectValue();
			}, this);
		}
		this._listbox = this.popup;
		return this.popup;
	},
	/**
	 * 显示弹出层
	 * @param [action] {String} 参数可选，'loading' 或者 'error'
	 */
	showPopup: function (action) {
	    if (this.isDisplay() == false) return;

		this.isShowPopup = true;

		var popup = this._createPopup();

		popup.el.style.zIndex = mini.getMaxZIndex();
		var control = this._listbox;
		control.emptyText = this.popupEmptyText;

		if (action == "loading") {
			control.emptyText = this.popupLoadingText;
			this._listbox.setData([]);
		} else if (action == "error") {
			control.emptyText = this.popupLoadingText;
			this._listbox.setData([]);
		}
		//这里我有些好奇，数据不是ListBox加载的
		this._listbox.doUpdate();

		var box = this.getBox();
		var x = box.x, y = box.y + box.height;

		this.popup.el.style.display = "block";
		mini.setXY(popup.el, -1000, -1000);
		this.popup.setWidth(box.width);

		this.popup.setHeight(this.popupHeight);

		if (this.popup.getHeight() < this.popupMinHeight) {
			this.popup.setHeight(this.popupMinHeight);
		}
		if (this.popup.getHeight() > this.popupMaxHeight) {
			this.popup.setHeight(this.popupMaxHeight);
		}
		mini.setXY(popup.el, x, y);
	},
	/**
	 * 隐藏弹出层
	 */
	hidePopup: function () {
		this.isShowPopup = false;
		if (this.popup)
			this.popup.el.style.display = "none";
	},
	__OnMouseMove: function (e) {
		if (this.enabled == false)
			return;
		var item = this.getItemByEvent(e);
		if (!item) {
			this.blurItem();
			return;
		}
		this.hoverItem(item, e);
	},
	__OnMouseOut: function (e) {
		this.blurItem();
	},
	__OnClick: function (e) {
	    if (this.isReadOnly() || this.enabled == false) return;

		if (this.enabled == false)
			return;

		var item = this.getItemByEvent(e);
		if (!item) {
			if (mini.findParent(e.target, "mini-textboxlist-input")) {

			} else {
				this.showInput();
			}
			return;
		}
		this.focusEl.focus();
		this.select(item);

		if (e && mini.hasClass(e.target, "mini-textboxlist-close")) {
			this.removeItem(item);
		}
	},
	__OnKeyDown: function (e) {

		if (this.isReadOnly() || this.allowInput == false)
			return false;

		var index = this.data.indexOf(this._selected);

		var sf = this;
		/** @ignore */
		function remove() {
			var item = sf.data[index];
			sf.removeItem(item);

			item = sf.data[index];
			if (!item)
				item = sf.data[index - 1];
			sf.select(item);
			if (!item) {
				sf.showInput();
			}
		}

		switch (e.keyCode) {
			case 8:
				//退格键

				e.preventDefault();
				remove();
				break;
			case 37:
			//左键
			case 38:
				//上键
				this.select(null);
				this.showInput(index);

				break;
			case 39:
			//右键
			case 40:
				//下键
				index += 1;
				this.select(null);
				this.showInput(index);

				break;
			case 46:
				//Delete
				remove();
				break;
		}
	},
	__doSelectValue: function () {
		var item = this._listbox.getFocusedItem();
		if (item) {
			this._listbox.setSelected(item);
		}

		this.lastInputText = this.text;
		this.hidePopup();

		this._doInsertSelectValue();
	},
	/**
	 * 默认按键按下事件响应函数
	 */
	__OnInputKeyDown: function (e) {

		this._selectOnLoad = null;

		if (this.isReadOnly() || this.allowInput == false)
			return false;

		e.stopPropagation();

		if (this.isReadOnly() || this.allowInput == false)
			return;

		var range = mini.getSelectRange(this._inputEl);
		var start = range[0], end = range[1], textLen = this._inputEl.value.length;
		var isFirst = start == end && start == 0;
		var isLast = start == end && end == textLen;

		if (this.isReadOnly() || this.allowInput == false) {
			e.preventDefault();
		}
		// tab键 隐藏
		if (e.keyCode == 9) {
			this.hidePopup();
			return;
		}
		// shift , ctrl , alt 直接返回
		if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18)
			return;

		switch (e.keyCode) {
			case 13:
				// 回车，显示下拉
				if (this.isShowPopup) {
					e.preventDefault();
					if (this._loading) {
						this._selectOnLoad = true;
						return;
					}
					this.__doSelectValue();
				}
				break;
			case 27:
				// esc
				e.preventDefault();
				this.hidePopup();
				break;
			case 8:
				//BackSpace 退格，当没有字符时，什么都不错。
				if (isFirst) {
					e.preventDefault();
				}
			case 37:
				//Left 选中第一个
				if (isFirst) {
					if (this.isShowPopup) {
						this.hidePopup();
					} else {
						if (this.editIndex > 0) {
							var index = this.editIndex - 1;
							if (index < 0)
								index = 0;
							if (index >= this.data.length)
								index = this.data.length - 1;
							this.showInput(false);
							this.select(index);
						}
					}
				}
				break;
			case 39:
				//Right 选中最后一个。
				if (isLast) {
					if (this.isShowPopup) {
						this.hidePopup();
					} else {
						if (this.editIndex <= this.data.length - 1) {
							var index = this.editIndex;
							this.showInput(false);
							this.select(index);
						}
					}
				}
				break;
			case 38:
				// up 选中上一个
				e.preventDefault();
				if (this.isShowPopup) {
					var index = -1;
					var item = this._listbox.getFocusedItem();
					if (item)
						index = this._listbox.indexOf(item);
					index--;
					if (index < 0)
						index = 0;
					this._listbox._focusItem(index, true);
				}
				break;
			case 40:
				//选中下一个
				e.preventDefault();
				if (this.isShowPopup) {
					var index = -1;
					var item = this._listbox.getFocusedItem();
					if (item)
						index = this._listbox.indexOf(item);
					index++
					if (index < 0)
						index = 0;
					if (index >= this._listbox.getCount())
						index = this._listbox.getCount() - 1;
					this._listbox._focusItem(index, true);
				} else {
					this._startQuery(true);
				}
				break;
			default:
				break;
		}
	},
	/**
	 * 文本录入框获取焦点
	 */
	focus: function () {
		try {
			this._inputEl.focus();
		} catch (e) {
		}
	},
	/**
	 * 文本录入框失去焦点
	 */
	blur: function () {
		try {
			this._inputEl.blur();
		} catch (e) {
		}
	},
	searchField: "key",
	setSearchField: function (value) {
	    this.searchField = value;
	},
	getSearchField: function () {
	    return this.searchField;
	},

	/**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对 value， text， valueField， textField，
	 * url， popupHeight， textName， allowInput， popupMinHeight， popupMaxHeight 等属性做提取。
	 * @param el {Object} DOM元素
	 * @returns {Object} JSON对象
	 */
	getAttrs: function (el) {
	    var attrs = mini.TextBox.superclass.getAttrs.call(this, el);
	    var jq = jQuery(el);

	    mini._ParseString(el, attrs,
            ["value", "text", "valueField", "textField", "url", "popupHeight",
            "textName", "onfocus", "onbeforeload", "onload", "searchField"
            ]
        );
	    mini._ParseBool(el, attrs,
            ["allowInput"
            ]
        );

	    mini._ParseInt(el, attrs,
            ["popupMinHeight", "popupMaxHeight"
            ]
        );
	    return attrs;
	}

});

mini.regClass(mini.TextBoxList, "textboxlist");