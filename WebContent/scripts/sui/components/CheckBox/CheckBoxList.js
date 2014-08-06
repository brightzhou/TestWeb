/**
 * 文件中定义了 CheckBoxList 组件。
 * @fileOverview CheckBoxList.js
 * @author 殷文旭
 */

/**
 * @class CheckBoxList 是mini UI中的复选框组组件
 * @constructor
 * @extends mini.ListControl
 * @requires mini.ListControl
 * @version 1.0
 */
mini.CheckBoxList = function () {
	mini.CheckBoxList.superclass.constructor.call(this);
}
mini.extend(mini.CheckBoxList, mini.ListControl, /** @lends mini.CheckBoxList.prototype */
{
	/**
	 * 标记，代表这是一个form组件
	 * @type Boolean
	 * @default true
	 */
	formField: true,

	/**
	 * 是否支持多选开关
	 * @type Boolean
	 * @default true
	 */
	multiSelect: true,

	/**
	 * 平铺显示项，也就是每行显示的复选框数
	 * @type Number
	 * @default 0
	 */
	repeatItems: 0,

	/**
	 * 布局方式 'none' 默认布局,'flow' 紧凑型布局,'table' 严格对其式的布局 目前支持三种。
	 * @type String
	 * @default "none"
	 */
	repeatLayout: "none",

	/**
	 * 平铺方向 'vertical' 纵向, 'horizontal' 横向 目前支持两种。
	 * @type String
	 * @default 'horizontal'
	 */
	repeatDirection: "horizontal",

	_itemCls: "mini-checkboxlist-item",
	_itemHoverCls: "mini-checkboxlist-item-hover",
	_itemSelectedCls: "mini-checkboxlist-item-selected",

	_tableCls: "mini-checkboxlist-table",
	_tdCls: "mini-checkboxlist-td",
	_checkType: "checkbox",

	/**
	 * 组件样式类
	 * @type String
	 * @default "mini-checkboxlist"
	 */
	uiCls: "mini-checkboxlist",
	/**
	 * 创建组件HTML结构，并绑定给组件实例。
	 * @default
	 */
	_create: function () {
		var el = this.el = document.createElement("div");
		this.el.className = this.uiCls;

		this.el.innerHTML = '<div class="mini-list-inner"></div><div class="mini-errorIcon"></div><input type="hidden" />';
		this._innerEl = this.el.firstChild;
		this._valueEl = this.el.lastChild;
		this._errorIconEl = this.el.childNodes[1];
	},
	/**
	 * 整理数据，根据设置的平铺规则组织数据。
	 */
	_getRepeatTable: function () {
		var table = [];
		if (this.repeatItems > 0) {
			if (this.repeatDirection == "horizontal") {
				var row = [];
				for (var i = 0, l = this.data.length; i < l; i++) {
					var item = this.data[i];
					if (row.length == this.repeatItems) {
						table.push(row);
						row = [];
					}
					row.push(item);
				}
				table.push(row);
			} else {
				var len = this.repeatItems > this.data.length ? this.data.length : this.repeatItems;
				for (var i = 0, l = len; i < l; i++) {
					table.push([]);
				}
				for (var i = 0, l = this.data.length; i < l; i++) {
					var item = this.data[i];
					var index = i % this.repeatItems;
					table[index].push(item);
				}
			}
		} else {
			table = [this.data.clone()];
		}
		return table;
	},
	/**
	 * 更新组件容器内HTML结构，生成复选框列表
	 */
	doUpdate: function () {
		var data = this.data;
		var s = "";

		for (var i = 0, l = data.length; i < l; i++) {
			var item = data[i];
			item._i = i;
		}

		if (this.repeatLayout == "flow") {

			var table = this._getRepeatTable();
			for (var i = 0, l = table.length; i < l; i++) {
				var row = table[i];
				for (var j = 0, k = row.length; j < k; j++) {
					var item = row[j];
					s += this._createItemHtml(item, item._i);
				}
				if (i != l - 1) {
					s += '<br/>';
				}
			}

		} else if (this.repeatLayout == "table") {
			var table = this._getRepeatTable();
			s += '<table class="' + this._tableCls + '" cellpadding="0" cellspacing="1">';
			for (var i = 0, l = table.length; i < l; i++) {
				var row = table[i];
				s += '<tr>';
				for (var j = 0, k = row.length; j < k; j++) {
					var item = row[j];
					s += '<td class="' + this._tdCls + '">';
					s += this._createItemHtml(item, item._i);
					s += '</td>';
				}
				s += '</tr>';
			}
			s += '</table>';
		} else {
			for (var i = 0, l = data.length; i < l; i++) {
				var item = data[i];
				s += this._createItemHtml(item, i);
			}
		}
		this._innerEl.innerHTML = s;

		for (var i = 0, l = data.length; i < l; i++) {
			var item = data[i];
			delete item._i;
		}
	},
	destroy: function (removeEl) {
	    if (this._valueEl) {
	       this._valueEl = null;
	    }
	    if (this._errorIconEl) {
	       this._errorIconEl = null;
	    }
	    if (this._innerEl) {
	       this._innerEl = null;
	    }
	    mini.CheckBoxList.superclass.destroy.call(this, removeEl);
	},
	/**
	 * 生成单个复选框。奇怪，什么不使用checkbox
	 */
	_createItemHtml: function (item, index) {
		var e = this._OnDrawItem(item, index);
		var id = this._createItemId(index);
		var ckId = this._createCheckId(index);
		var ckValue = this.getItemValue(item);

		var disable = '';

		var s = '<div id="' + id + '" index="' + index + '" class="' + this._itemCls + ' ';
		if (item.enabled === false) {
			s += ' mini-disabled ';
			disable = 'disabled';
		}

		s += e.itemCls + '" style="' + e.itemStyle + '"><input ' + disable + ' value="' + ckValue + '" id="' + ckId + '" type="' + this._checkType + '" onclick="return false;"/><label for="' + ckId + '" onclick="return false;">';
		s += e.itemHtml + '</label></div>';
		return s;
	},
	
	_OnDrawItem: function (item, index) {
		var value = this.getItemText(item);
		var e = {
			index: index,
			item: item,
			itemHtml: value,
			itemCls: "",
			itemStyle: ""
		};
		this.fire("drawitem", e);

		if (e.itemHtml === null || e.itemHtml === undefined)
			e.itemHtml = "";

		return e;
	},
	/**
	 * 设置平铺显示项数目
	 * @param value {Number}
	 */
	setRepeatItems: function (value) {
		value = parseInt(value);
		if (isNaN(value))
			value = 0;
		if (this.repeatItems != value) {
			this.repeatItems = value;
			this.doUpdate();
		}
	},
	/**
	 * 获取平铺显示项数目
	 * @return {Number}
	 */
	getRepeatItems: function () {
		return this.repeatItems;
	},
	/**
	 * 设置布局方式
	 * @param value {String}
	 */
	setRepeatLayout: function (value) {
		if (value != "flow" && value != "table")
			value = "none";
		if (this.repeatLayout != value) {
			this.repeatLayout = value;
			this.doUpdate();
		}
	},
	/**
	 * 获取布局方式
	 * @return {String}
	 */
	getRepeatLayout: function () {
		return this.repeatLayout;
	},
	/**
	 * 设置平铺方向
	 * @param value {String}
	 */
	setRepeatDirection: function (value) {
		if (value != "vertical")
			value = "horizontal";
		if (this.repeatDirection != value) {
			this.repeatDirection = value;
			this.doUpdate();
		}
	},
	/**
	 * 获取平铺方向
	 * @return {String}
	 */
	getRepeatDirection: function () {
		return this.repeatDirection;
	},
	/**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对  repeatItems， repeatLayout， repeatDirection，
	 * 等属性做提取。
	 * @param el {Object} DOM元素
	 * @returns {Object} JSON对象
	 */
	getAttrs: function (el) {
		var attrs = mini.CheckBoxList.superclass.getAttrs.call(this, el);
		var jq = jQuery(el);

		var repeatItems = parseInt(jq.attr("repeatItems"));
		if (!isNaN(repeatItems)) {
			attrs.repeatItems = repeatItems;
		}
		var repeatLayout = jq.attr("repeatLayout");
		if (repeatLayout) {
			attrs.repeatLayout = repeatLayout;
		}
		var repeatDirection = jq.attr("repeatDirection");
		if (repeatDirection) {
			attrs.repeatDirection = repeatDirection;
		}
		return attrs;
	}
});
mini.regClass(mini.CheckBoxList, "checkboxlist");