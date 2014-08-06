/**
 * 定义了所有列表类组件的基类。
 * @fileOverview ListControl.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * ListControl 是mini UI中所有列表类组件的基类，构造函数中主要做了几件事情，
 * 1调用 ValidatorBase 构造函数<br/>
 * 2 doUpdate<br/>
 * @class mini.ListControl
 * @constructor
 * @extends mini.ValidatorBase
 * @requires mini.ValidatorBase
 */
mini.ListControl = function () {
	this.data = [];
	this._selecteds = [];
	mini.ListControl.superclass.constructor.call(this);
	this.doUpdate();
}
mini.extend(mini.ListControl, mini.ValidatorBase, /** @lends mini.ListControl.prototype */
{
	/**
	 * 默认值
	 * @type String
	 * @default ''
	 */
	defaultValue: '',
	/**
	 * 值
	 * @type String
	 * @default ''
	 */
	value: '',
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

	delimiter: ',',

	/**
	 * 列表组件的数据集
	 * @type Array
	 * @default []
	 */
	data: null,
	/**
	 * 数据的远程加载地址
	 * @type String
	 * @default ""
	 */
	url: "",

	_itemCls: "mini-list-item",
	_itemHoverCls: "mini-list-item-hover",
	_itemSelectedCls: "mini-list-item-selected",

	set: function (kv) {
		if (typeof kv == 'string') {
			return this;
		}

		var value = kv.value;
		delete kv.value;
		var url = kv.url;
		delete kv.url;
		var data = kv.data;
		delete kv.data;

		mini.ListControl.superclass.set.call(this, kv);

		if (!mini.isNull(data)) {
			this.setData(data);
		}
		if (!mini.isNull(url)) {
			this.setUrl(url);
		}
		if (!mini.isNull(value)) {
			this.setValue(value);
		}

		return this;
	},
	/**
	 * 组件在HTML标签声明时配置的样式类名
	 * @type String
	 * @default "mini-list"
	 */
	uiCls: "mini-list",

	_create: function () {

	},
	_initEvents: function () {
		mini._BindEvents( function () {
			mini_onOne(this.el, 'click', this.__OnClick, this);
			mini_onOne(this.el, 'dblclick', this.__OnDblClick, this);

			mini_onOne(this.el, 'mousedown', this.__OnMouseDown, this);
			mini_onOne(this.el, 'mouseup', this.__OnMouseUp, this);
			mini_onOne(this.el, 'mousemove', this.__OnMouseMove, this);
			mini_onOne(this.el, 'mouseover', this.__OnMouseOver, this);
			mini_onOne(this.el, 'mouseout', this.__OnMouseOut, this);

			mini_onOne(this.el, 'keydown', this.__OnKeyDown, this);
			mini_onOne(this.el, 'keyup', this.__OnKeyUp, this);

			mini_onOne(this.el, 'contextmenu', this.__OnContextMenu, this);
		}, this);
	},
	/**
	 * 析构函数
	 * @param removeEl {Object}
	 */
	destroy: function (removeEl) {
		if (this.el) {
			this.el.onclick = null;
			this.el.ondblclick = null;
			this.el.onmousedown = null;
			this.el.onmouseup = null;
			this.el.onmousemove = null;
			this.el.onmouseover = null;
			this.el.onmouseout = null;
			this.el.onkeydown = null;
			this.el.onkeyup = null;
			this.el.oncontextmenu = null;
		}
		//内存泄露问题优化 赵美丹 2013-04-17
        if(this._valueEl){
            mini.clearEvent(this._valueEl);
            this._valueEl.parentNode.removeChild(this._valueEl);
            this._valueEl = null;
        }
        delete this._focusedItem;
        delete this.data;
        delete this._selecteds;
		mini.ListControl.superclass.destroy.call(this, removeEl);
	},
	/**
	 * 组件的name属性，与保存值的标签的name属性值一致。
	 * @type String
	 * @default ""
	 */
	name: "",
	/**
	 * 设置属性 name，同时改变保存值的隐藏域的name属性。
	 * @param value {String}新name值
	 */
	setName: function (value) {
		this.name = value;
		if (this._valueEl)
			mini.setAttr(this._valueEl, "name", this.name);
	},
	/**
	 * 根据指定的事件对象，获取事件发生的列表元素的数据对象
	 * @param event{Event}
	 * @return {Object}
	 */
	getItemByEvent: function (event) {
		var domItem = mini.findParent(event.target, this._itemCls);
		if (domItem) {

			var index = parseInt(mini.getAttr(domItem, "index"));

			return this.data[index];
		}
	},
	/**
	 * 为指定的列表项添加样式类名
	 * @param item {Object} item是列表项的json数据对象
	 * @parm cls {String}
	 */
	addItemCls: function (item, cls) {
		var itemEl = this.getItemEl(item);
		if (itemEl)
			mini.addClass(itemEl, cls);
	},
	/**
	 * 删除指定的列表项的样式类名
	 * @param item {Object} item是列表项的json数据对象
	 * @parm cls {String}
	 */
	removeItemCls: function (item, cls) {
		var itemEl = this.getItemEl(item);
		if (itemEl)
			mini.removeClass(itemEl, cls);
	},
	/**
	 * 获取指定的列表项对象
	 * @param item {Object} item是列表项的json数据对象
	 */
	getItemEl: function (item) {
		item = this.getItem(item);
		var index = this.data.indexOf(item);
		var id = this._createItemId(index);
		return document.getElementById(id);
	},
	/**
	 * 将某个列表项设置为获得焦点状态
	 * @param item{Object} 列表项数据
	 * @param view{Boolean} 是否把获得焦点项移入可视区域
	 */
	_focusItem: function (item, view) {
		item = this.getItem(item);
		if (!item)
			return;
		var dom = this.getItemEl(item);
		if (view && dom) {
			this.scrollIntoView(item);
		}
		if (this._focusedItem == item) {
			if(dom)
				mini.addClass(dom, this._itemHoverCls);
			return;
		}
		this._blurItem();
		this._focusedItem = item;

		if (dom)
			mini.addClass(dom, this._itemHoverCls);
	},
	/**
	 * 将列表项设置为失去焦点状态。
	 */
	_blurItem: function () {
	    if (!this._focusedItem) return;

	    try {
	        var dom = this.getItemEl(this._focusedItem);
	        if (dom) {
	            mini.removeClass(dom, this._itemHoverCls);
	        }
	    } catch (e) { };
	    this._focusedItem = null;

	},
	/**
	 * 获取持有焦点的列表项元素
	 * @return {Object} DOM对象
	 */
	getFocusedItem: function () {
		return this._focusedItem;
	},
	/**
	 * 获取持有焦点的列表项的顺序
	 * @return {Number} 从0开始
	 */
	getFocusedIndex: function () {
		return this.data.indexOf(this._focusedItem);
	},
	_scrollViewEl: null,
	/**
	 * 将指定的列表项移入可视区域
	 * @param item {Object}
	 */
	scrollIntoView: function (item) {
		try {
			var itemEl = this.getItemEl(item);
			var _scrollViewEl = this._scrollViewEl || this.el;
			mini.scrollIntoView(itemEl, _scrollViewEl, false);
		} catch (e) {
		}
	},
	/**
	 * 根据给定序号获取列表项数据对象，如果没有参数则默认返回第一项。
	 * @param item {Number|Object}
	 * @return {Object}
	 */
	getItem: function (item) {
		if (typeof item == "object")
			return item;
		if (typeof item == "number")
			return this.data[item];
		return this.findItems(item)[0];
	},
	/**
	 * 获取列表项总数
	 * @return {Number}
	 */
	getCount: function () {
		return this.data.length;
	},
	/**
	 * 获取指定列表项的序号
	 * @param item {Object} 列表项数据
	 * @return {Number}
	 */
	indexOf: function (item) {
		return this.data.indexOf(item);
	},
	/**
	 * 获取指定序号的列表项数据
	 * @param index {Number}
	 * @return {Object} 列表项数据
	 */
	getAt: function (index) {
		return this.data[index];
	},
	/**
	 * 更新指定列表项的数据
	 * @param item {Number|Object} 序号或者列表项数据
	 * @param options {Object}
	 */
	updateItem: function (item, options) {
		item = this.getItem(item);
		if (!item)
			return;
		mini.copyTo(item, options);
		this.doUpdate();
	},
	/**
	 * 加载数据
	 * @param data {Array|String} 数组或者是uri地址。
	 */
	load: function (data) {
		if (typeof data == "string")
			this.setUrl(data);
		else
			this.setData(data);
	},
	/**
	 * 加载数组数据
	 * @param data {Array}
	 */
	loadData: function (data) {
		this.setData(data);
	},
	/**
	 * 设置 data 属性的值，并更新组件。
	 * @param data {Array}
	 */
	setData: function (data) {
		if (typeof data == "string") {
			data = eval(data);
		}
		if (!mini.isArray(data))
			data = [];
		this.data = data;

		this.doUpdate();

		if (this.value != "") {
			this.deselectAll();
			var records = this.findItems(this.value);
			this.selects(records);
		}
	},
	/**
	 * 获取data 属性的值
	 * @return {Array}
	 */
	getData: function () {
		return this.data.clone();
	},
	/**
	 * 设置 url 属性并从url地址获取数据更新组件。
	 * @param url {String}
	 */
	setUrl: function (url) {

		this.url = url;
		this._doLoad({});

	},
	/**
	 * 获取 url 属性
	 * @return {String}
	 */
	getUrl: function () {
		return this.url;
	},
	/**
	 * 远程加载数据。
	 */
	_doLoad: function (params) {

	    try {
	        var url = eval(this.url);
	        if (url != undefined) {
	            this.url = url;
	        }
	    } catch (e) { }

	    var e = {
	        url: this.url,
	        async: false,
	        type: "get",
	        params: params,
	        data: params,
	        cache: false,
	        cancel: false
	    };
	    this.fire("beforeload", e);
	    if (e.data != e.params && e.params != params) {
	        e.data = e.params;
	    }
	    if (e.cancel == true) return;

	    var sf = this;
	    var url = e.url;
	    mini.copyTo(e, {
	        success: function (text) {
	            var data = null;
	            try {
	                data = mini.decode(text);
	            } catch (ex) {
	                data = []
	                if (mini_debugger == true) {
	                    alert(url + "\njson is error.");
	                }
	            }
	            if (sf.dataField) {
	                data = mini._getMap(sf.dataField, data);
	            }
	            if (!data) data = [];
	            var ex = { data: data, cancel: false }
	            sf.fire("preload", ex);
	            if (ex.cancel == true) return;

	            sf.setData(ex.data);

	            sf.fire("load");

	            setTimeout(function () {
	                sf.doLayout();
	            }, 100);

	        },
	        error: function (jqXHR, textStatus, errorThrown) {
	            var e = {
	                xmlHttp: jqXHR,
	                errorMsg: jqXHR.responseText,
	                errorCode: jqXHR.status
	            };
	            if (mini_debugger == true) {
	                alert(url + "\n" + e.errorCode + "\n" + e.errorMsg);
	            }

	            sf.fire("loaderror", e);
	        }
	    });

	    this._ajaxer = mini.ajax(e);
	},

	/**
	 * 设置选中值
	 * @param value {String}
	 */
	setValue: function (value) {
		if (mini.isNull(value))
			value = "";
		if (this.value !== value) {
		    this.deselectAll();

			this.value = value;
			if (this._valueEl)
				this._valueEl.value = value;

			var records = this.findItems(this.value);
			this.selects(records);
			
            //解决RadioButtonList组件setValue不触发valuechanged事件的问题 赵美丹 2013-01-17
            this._OnValueChanged();
		}
	},
	/**
	 * 获取选中值
	 * @return {String}
	 */
	getValue: function () {
		return this.value;
	},
	/**
	 * 获取FORM表单提交对应的值
	 * @return {String}
	 */
	getFormValue: function () {
		return this.value;
	},
	/**
	 * 设置对应json格式数据中的属性名
	 * @param valueField {String}
	 */
	setValueField: function (valueField) {
		this.valueField = valueField;
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
	},
	/**
	 * 获取显示文本对应 json格式数据中的属性名
	 * @return {String}
	 */
	getTextField: function () {
		return this.textField;
	},
	/**
	 * 获取指定列表项的值
	 * @param item {Object}
	 * @return {String}
	 */
	getItemValue: function (item) {
	    return String(mini._getMap(this.valueField, item));
	},
	/**
	 * 获取指定列表项的显示文本
	 * @param item {Object}
	 * @return {String}
	 */
	getItemText: function (item) {
	    var t = mini._getMap(this.textField, item);
		return mini.isNull(t) ? '' : String(t);
	},
	/**
	 * 获取指定列表项集合的值和显示文本集合
	 * @param recores {Array}
	 * @return {Array}
	 * @example
	 * var records = [{id:1,text:'1'},{id:2,text:'2'},{id:3,text:'3'}]
	 * xxx.getValueAndText(records) => [[1,2,3],['1','2','3']]
	 */
	getValueAndText: function (records) {
		if (mini.isNull(records))
			records = [];
		if (!mini.isArray(records)) {
			records = this.findItems(records);
		}
		var values = [];
		var texts = [];
		for (var i = 0, l = records.length; i < l; i++) {
			var record = records[i];
			if (record) {
				values.push(this.getItemValue(record));
				texts.push(this.getItemText(record));
			}
		}
		return [values.join(this.delimiter), texts.join(this.delimiter)];
	},
	/**
	 * 获取指定值集合对应的列表项集合
	 * @param value {String}
	 * @return {Array}
	 * @example
	 * var str = "1,2,3";
	 * xx.findItems(str) => [{id:1,text:'1'},{id:2,text:'2'},{id:3,text:'3'}]
	 */
	findItems: function (value) {
		//解决当item中包含value为空的选项时无法获取该选项 赵美丹 2013-3-2
		if (mini.isNull(value))
			value = "";
		var values = String(value).split(this.delimiter);

		var data = this.data;
		var valueRecords = {};
		for (var j = 0, k = data.length; j < k; j++) {
			var record = data[j];
			var v = record[this.valueField];
			valueRecords[v] = record;
		}

		var records = [];
		for (var i = 0, l = values.length; i < l; i++) {
			var v = values[i];
			var record = valueRecords[v];
			if (record) {
				records.push(record);
			}
		}
		return records;
	},
	removeAll: function () {
	    var items = this.getData();
	    this.removeItems(items);
	},
	addItems: function (items, index) {
	    if (!mini.isArray(items)) return;
	    if (mini.isNull(index)) index = this.data.length;
	    this.data.insertRange(index, items);
	    this.doUpdate();
	},
	addItem: function (item, index) {
	    if (!item) return;
	    if (this.data.indexOf(item) != -1) return;
	    if (mini.isNull(index)) index = this.data.length;
	    this.data.insert(index, item);
	    this.doUpdate();
	},
	removeItems: function (items) {
	    if (!mini.isArray(items)) return;
	    this.data.removeRange(items);

	    this._checkSelecteds();
	    this.doUpdate();
	},
	removeItem: function (item) {
	    var index = this.data.indexOf(item);
	    if (index != -1) {
	        this.data.removeAt(index);
	        this._checkSelecteds();
	        this.doUpdate();
	    }
	},
	moveItem: function (item, index) {
	    if (!item || !mini.isNumber(index)) return;


	    if (index < 0) index = 0;
	    if (index > this.data.length) index = this.data.length;
	    this.data.remove(item);

	    this.data.insert(index, item);
	    this.doUpdate();
	},

	_selected: null,
	_selecteds: [],

	/**
	 * 是否支持多选
	 * @type Boolean
	 * @default false
	 */
	multiSelect: false,

	_checkSelecteds: function () {
		for (var i = this._selecteds.length - 1; i >= 0; i--) {
			var record = this._selecteds[i];
			if (this.data.indexOf(record) == -1) {
				this._selecteds.removeAt(i);
			}
		}
		var vts = this.getValueAndText(this._selecteds);
		this.value = vts[0];
		if (this._valueEl)
			this._valueEl.value = this.value;
	},
	/**
	 * 设置是否支持多选
	 * @param value {Boolean}
	 */
	setMultiSelect: function (value) {
		this.multiSelect = value;
	},
	/**
	 * 获取是否支持多选
	 * @return {Boolean}
	 */
	getMultiSelect: function () {
		return this.multiSelect;
	},
	/**
	 * 判断指定列表项是否被选中
	 * @param record {Object}
	 * @default {Boolean}
	 */
	isSelected: function (record) {
		if (!record)
			return false;
		return this._selecteds.indexOf(record) != -1;
	},
	/**
	 * 获取被选中的列表项集合
	 * @return {Array}
	 */
	getSelecteds: function () {
		var arr = this._selecteds.clone();
		var me = this;
		mini.sort(arr, function (a, b) {
			var index1 = me.indexOf(a);
			var index2 = me.indexOf(b);
			if (index1 > index2)
				return 1;
			if (index1 < index2)
				return -1;
			return 0;
		});
		return arr;
	},
	/**
	 * 设置列表项被选中(单选)
	 * @param record {Object}
	 */
	setSelected: function (record) {
		if (record) {
			this._selected = record;
			this.select(record);
		}
	},
	/**
	 * 获取被选中列表项（单选）
	 * @return {Object}
	 */
	getSelected: function () {
		return this._selected;
	},
	/**
	 * 选中指定列表项
	 * @param record {Object}
	 */
	select: function (record) {
		record = this.getItem(record);
		if (!record)
			return;
		if (this.isSelected(record))
			return;
		this.selects([record]);
	},
	/**
	 * 取消选中指定列表项
	 * @param record {Object}
	 */
	deselect: function (record) {
		record = this.getItem(record);
		if (!record)
			return;
		if (!this.isSelected(record))
			return;
		this.deselects([record]);
	},
	/**
	 * 全部选中
	 */
	selectAll: function () {
		var data = this.data.clone();
		this.selects(data);
	},
	/**
	 * 全部取消选中。
	 */
	deselectAll: function () {
		this.deselects(this._selecteds);
	},
	/**
	 * 全部取消选中
	 */
	clearSelect: function () {
		this.deselectAll();
	},
	/**
	 * 选中指定列表项集合。
	 * @param records {Array}
	 */
	selects: function (records) {
		if (!records || records.length == 0)
			return;
		records = records.clone();
		for (var i = 0, l = records.length; i < l; i++) {
			var record = records[i];
			if (!this.isSelected(record)) {
				this._selecteds.push(record);
			}
		}
		var me = this;
		setTimeout( function () {
			me._doSelects();
		}, 1);
	},
	/**
	 * 取消选中指定列表项集合
	 * @param records {Array}
	 */
	deselects: function (records) {
		if (!records || records.length == 0)
			return;
		records = records.clone();
		for (var i = records.length - 1; i >= 0; i--) {
			var record = records[i];
			if (this.isSelected(record)) {
				this._selecteds.remove(record);
			}
		}

		var me = this;
		setTimeout( function () {
			me._doSelects();
		}, 1);
	},
	_doSelects: function () {
		var vts = this.getValueAndText(this._selecteds);
		this.value = vts[0];
		if (this._valueEl)
			this._valueEl.value = this.value;

		for (var i = 0, l = this.data.length; i < l; i++) {
			var record = this.data[i];
			var select = this.isSelected(record);
			if (select) {
				this.addItemCls(record, this._itemSelectedCls);
			} else {
				this.removeItemCls(record, this._itemSelectedCls);
			}
			var index = this.data.indexOf(record);
			var id = this._createCheckId(index);
			var checkbox = document.getElementById(id);
			if (checkbox){
                checkbox.checked = !!select;
                //解决当checkbox存在于window中，默认初始为选中状态（如radiolist、checkboxlist的默认值），在IE7、IE6无法显示选中效果 赵美丹 2013-03-08
                checkbox.defaultChecked = !!select;
            }
				
		}
	},
	_OnSelectionChanged: function (records, select) {
		var vts = this.getValueAndText(this._selecteds);
		this.value = vts[0];
		if (this._valueEl)
			this._valueEl.value = this.value;

		var e = {
			selecteds: this.getSelecteds(),
			selected: this.getSelected(),
			value: this.getValue()
		};
		this.fire("SelectionChanged", e);
	},
	_createCheckId: function (index) {
		return this.uid + "$ck$" + index;
	},
	_createItemId: function (index) {
		return this.uid + "$" + index;
	},
	/**
	 * 默认点击事件响应函数
	 */
	__OnClick: function (e) {
		this._fireEvent(e, 'Click');
	},
	/**
	 * 默认鼠标双击点击事件响应函数
	 */
	__OnDblClick: function (e) {
		this._fireEvent(e, 'Dblclick');
	},
	/**
	 * 默认鼠标按下事件响应函数
	 */
	__OnMouseDown: function (e) {
		this._fireEvent(e, 'MouseDown');
	},
	/**
	 * 默认鼠标抬起事件响应函数
	 */
	__OnMouseUp: function (e) {
		this._fireEvent(e, 'MouseUp');
	},
	/**
	 * 默认鼠标移动事件响应函数
	 */
	__OnMouseMove: function (e) {
		this._fireEvent(e, 'MouseMove');
	},
	/**
	 * 默认鼠标经过事件响应函数
	 */
	__OnMouseOver: function (e) {
		this._fireEvent(e, 'MouseOver');
	},
	/**
	 * 默认鼠标移出事件响应函数
	 */
	__OnMouseOut: function (e) {
		this._fireEvent(e, 'MouseOut');
	},
	/**
	 * 默认按键按下事件响应函数
	 */
	__OnKeyDown: function (e) {
		this._fireEvent(e, 'KeyDown');
	},
	/**
	 * 默认按键抬起事件响应函数
	 */
	__OnKeyUp: function (e) {
		this._fireEvent(e, 'KeyUp');
	},
	/**
	 * 默认鼠标右键事件响应函数
	 */
	__OnContextMenu: function (e) {
		this._fireEvent(e, 'ContextMenu');
	},
	/**
	 * 释放方法
	 * @param e {Event}
	 * @param name {String} 事件名
	 */
	_fireEvent: function (e, name) {
		if (!this.enabled)
			return;

		var item = this.getItemByEvent(e);
		if (!item)
			return;
		var fn = this['_OnItem' + name];
		if (fn) {
			fn.call(this, item, e);
		} else {
			var eve = {
				item: item,
				htmlEvent: e
			};
			this.fire("item" + name, eve);
		}
	},
	/**
	 * 列表项点击事件默认响应函数。
	 * @param item {Object}
	 * @param e {Event}
	 */
	_OnItemClick: function (item, e) {
		if (this.isReadOnly() || this.enabled == false || item.enabled === false) {
			e.preventDefault();
			return;
		}

		var value = this.getValue();

		if (this.multiSelect) {
			if (this.isSelected(item)) {
				this.deselect(item);
				if (this._selected == item) {
					this._selected = null;
				}
			} else {
				this.select(item);
				this._selected = item;
			}
			this._OnSelectionChanged();
		} else {
			if (!this.isSelected(item)) {
				this.deselectAll();
				this.select(item);
				this._selected = item;
				this._OnSelectionChanged();
			}
		}

		if (value != this.getValue()) {
			this._OnValueChanged();
		}

		var e = {
			item: item,
			htmlEvent: e
		};
		this.fire("itemclick", e);
	},
	/**
	 * 移除时失去焦点
	 * @type Boolean
	 * @default true
	 */
	_blurOnOut: true,
	/**
	 * 列表项鼠标移出事件默认响应函数。
	 * @param item {Object}
	 * @param e {Event}
	 */
	_OnItemMouseOut: function (item, e) {
	    mini.repaint(this.el);

		if (!this.enabled)
			return;
		if (this._blurOnOut) {
			this._blurItem();
		}
		var e = {
			item: item,
			htmlEvent: e
		};
		this.fire("itemmouseout", e);
	},
	/**
	 * 列表项鼠标移动事件默认响应函数。
	 * @param item {Object}
	 * @param e {Event}
	 */
	_OnItemMouseMove: function (item, e) {
	    mini.repaint(this.el);

		if (!this.enabled || item.enabled === false)
			return;

		this._focusItem(item);
		var e = {
			item: item,
			htmlEvent: e
		};
		this.fire("itemmousemove", e);
	},
	/**
	 * 为列表项添加 itemclick 事件响应函数
	 * @param fn {Function}
	 * @param scope {Object} 应用上下文对象
	 */
	onItemClick: function (fn, scope) {
		this.on("itemclick", fn, scope);
	},
	/**
	 * 为列表项添加 itemmousedown 事件响应函数
	 * @param fn {Function}
	 * @param scope {Object} 应用上下文对象
	 */
	onItemMouseDown: function (fn, scope) {
		this.on("itemmousedown", fn, scope);
	},
	/**
	 * 为列表项添加 beforeload 事件响应函数
	 * @param fn {Function}
	 * @param scope {Object} 应用上下文对象
	 */
	onBeforeLoad: function (fn, scope) {
		this.on("beforeload", fn, scope);
	},
	/**
	 * 为列表项添加 load 事件响应函数
	 * @param fn {Function}
	 * @param scope {Object} 应用上下文对象
	 */
	onLoad: function (fn, scope) {
		this.on("load", fn, scope);
	},
	/**
	 * 为列表项添加 loaderror 事件响应函数
	 * @param fn {Function}
	 * @param scope {Object} 应用上下文对象
	 */
	onLoadError: function (fn, scope) {
		this.on("loaderror", fn, scope);
	},
	/**
	 * 为列表项添加 preload 事件响应函数
	 * @param fn {Function}
	 * @param scope {Object} 应用上下文对象
	 */
	onPreLoad: function (fn, scope) {
		this.on("preload", fn, scope);
	},
	/**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对 url, data, value, textField, valueField, onitemclick, onitemmousemove,
	 * onselectionchanged, onitemdblclick, onbeforeload, onload, onloaderror, ondataload multiSelect等属性。
	 * @param el {Object} DOM元素
	 * @returns {Object} JSON对象
	 */
	getAttrs: function (el) {
		var attrs = mini.ListControl.superclass.getAttrs.call(this, el);
		/**
		 * onitemclick 事件当列表项被单击时触发<br/>
		 * 支持标签配置。
		 * @name onitemclick
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * onitemmousemove 事件当鼠标在列表项上移动时触发<br/>
		 * 支持标签配置。
		 * @name onitemmousemove
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * onselectionchanged 事件当选中列表项改变时触发<br/>
		 * 支持标签配置。
		 * @name onselectionchanged
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * onitemdblclick 事件当列表项被双击时触发<br/>
		 * 支持标签配置。
		 * @name onitemdblclick
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * onbeforeload 事件当组件加载远程数据前触发<br/>
		 * 支持标签配置。
		 * @name onbeforeload
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * onload 事件当组件加载远程数据成功时触发<br/>
		 * 支持标签配置。
		 * @name onload
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * onloaderror 事件当组件加载远程数据失败时触发<br/>
		 * 支持标签配置。
		 * @name onloaderror
		 * @event
		 * @memberOf mini.ListControl.prototype
		 */

		/**
		 * ondataload 不明用途<br/>
		 * 支持标签配置。
		 * @name ondataload
		 * @event
		 * @memberOf mini.ListControl.prototype
		 * @deprecated
		 * @private
		 */
		mini._ParseString(el, attrs,
		["url", "data", "value", "textField", "valueField",
		"onitemclick", "onitemmousemove", "onselectionchanged", "onitemdblclick",
		"onbeforeload", "onload", "onloaderror", "ondataload"
		]
		);
		mini._ParseBool(el, attrs,
		["multiSelect"
		]
		);

		var valueField = attrs.valueField || this.valueField;
		var textField = attrs.textField || this.textField;
		if (el.nodeName.toLowerCase() == "select") {
			var data = [];
			for (var i = 0, l = el.length; i < l; i++) {
				var op = el.options[i];
				var o = {};
				o[textField] = op.text;
				o[valueField] = op.value;

				data.push(o);
			}
			if (data.length > 0) {
				attrs.data = data;
			}
		}

		return attrs;
	}
});