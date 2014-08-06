/**
 * 文件中定义了 ListBox 组件。
 * @fileOverview ListBox.js
 * @author 殷文旭
 */

/**
 * @class ListBox 是mini UI中的列表组件。
 * @constructor
 * @extends mini.ListControl
 * @requires mini.ListControl
 * @version 1.0
 */
mini.ListBox = function () {
	mini.ListBox.superclass.constructor.call(this);
}
mini.extend(mini.ListBox, mini.ListControl, /** @lends mini.ListBox.prototype */
{
	/**
	 * 标记，代表这是一个form组件
	 * @type Boolean
	 * @default true
	 */
	formField: true,
	/**
	 * 默认列表宽度
	 * @type Number
	 * @default 200
	 */
	width: 200,
	/**
	 * 列表项集合
	 * @type Array
	 * @default null
	 */
	columns: null,
	/**
	 * 默认列宽度
	 * @type Number
	 * @default 80
	 */
	columnWidth: 80,
	/**
	 * 是否显示空列表项
	 * @type Boolean
	 * @default false
	 */
	showNullItem: false,
	/**
	 * 空列表项显示的文本
	 * @type String
	 * @default ""
	 */
	nullItemText: "",
	/**
	 * 是否显示空信息
	 * @type Boolean
	 * @default false
	 */
	showEmpty: false,
	/**
	 * 空信息
	 * @type String
	 * @default ""
	 */
	emptyText: "",

	/**
	 * 是否显示选中复选框
	 * @type Boolean
	 * @default false
	 */
	showCheckBox: false,
	/**
	 * 是否显示全选复选框
	 * @type Boolean
	 * @default true
	 */
	showAllCheckBox: true,
	/**
	 * 是否支持多选开关
	 * @type Boolean
	 * @default false
	 */
	multiSelect: false,

	_itemCls: "mini-listbox-item",
	_itemHoverCls: "mini-listbox-item-hover",
	_itemSelectedCls: "mini-listbox-item-selected",
	/**
	 * 组件样式类
	 * @type String
	 * @default "mini-listbox"
	 */
	uiCls: "mini-listbox",
	/**
	 * 创建组件HTML结构，并绑定给组件实例。
	 * @default
	 */
	_create: function () {
		var el = this.el = document.createElement("div");
		this.el.className = "mini-listbox";

		this.el.innerHTML = '<div class="mini-listbox-border"><div class="mini-listbox-header"></div><div class="mini-listbox-view"></div><input type="hidden"/></div><div class="mini-errorIcon"></div>';

		this._borderEl = this.el.firstChild;
		this._headerEl = this._borderEl.firstChild;
		this._viewEl = this._borderEl.childNodes[1];
		this._valueEl = this._borderEl.childNodes[2];

		this._errorIconEl = this.el.lastChild;

		this._scrollViewEl = this._viewEl;
	    //listbox在ie6下窗口大小改变后出现滚动条的问题。潘正锋 2013-06-19
		this._viewEl.innerHTML = '<div class="mini-listbox-content"></div>';

	},
	/**
	 * 析构函数
	 */
	destroy: function (removeEl) {
	    //内存泄露问题优化 赵美丹 2013-04-17
	    if (this._viewEl) {
            this._viewEl.onscroll = null;
	        mini.clearEvent(this._viewEl);
	        this._borderEl.removeChild(this._viewEl);
	        this._scrollViewEl = null;
	        this._viewEl = null;
	    }
	    if (this._headerEl) {
	        mini.clearEvent(this._headerEl);
	        this._borderEl.removeChild(this._headerEl);
	        this._headerEl = null;
	    }
	    if (this._valueEl) {
	        mini.clearEvent(this._valueEl);
	        this._borderEl.removeChild(this._valueEl);
	        this._valueEl = null;
	    }
	    if (this._borderEl) {
	        mini.clearEvent(this._borderEl);
	        this.el.removeChild(this._borderEl);
	        this._borderEl = null;
	    }
	    if (this._errorIconEl) {
	        mini.clearEvent(this._errorIconEl);
	        this.el.removeChild(this._errorIconEl);
	        this._errorIconEl = null;
	    }
	    delete this.data;
	    delete this.columns;
	    mini.ListBox.superclass.destroy.call(this, removeEl);
	},
	/**
	 * 设置组件初始化完成后的需要执行的回调函数。
	 * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
	 */
	_initEvents: function () {
		mini.ListBox.superclass._initEvents.call(this);
		mini._BindEvents( function () {
			//绑定默认的滚动条事件。
			mini_onOne(this._viewEl, "scroll", this.__OnScroll, this);
		}, this);
	},
	/**
	 * 设置列表项的头信息，可以使用HTML子标签添加 ，或者通过此方法添加 。<br/>
	 * 列表头支持如下一些可配置属性：<br/>
	 * header	String	表头列文本 <br/>
	   field	String	单元格值字段<br/>
        name	String	列标识名称<br/>
       width	Number	列宽度<br/>
       headerAlign	String	表头列文本位置。left/center/right。<br/>
       align	String	单元格文本位置。left/center/right。<br/>
       headerCls	String	表头列样式类。<br/>
       cellCls	String	单元格样式类<br/>
       headerStyle	String	表头列样式<br/>
        cellStyle	String	单元格样式<br/>
       renderer	Function	单元格绘制处理函数，同drawcell事件。<br/>

	 * @param value {Array}
	 * @example
	 * 通过方法添加
	 * mini.get('listbox2').setColumns([{header:'艾萨拉',field:'id',width:'80px'},
	 * 									{header:'泰兰德',field:'text',width:'80px'}]);
	 * 通过HTML子标签添加
	 * 		&lt;div id="listbox2" class="mini-listbox" style="width:400px;height:120px;"
		      showCheckBox="true"&gt;
				&lt;div property="columns"&gt;
					&lt;div header="ID" field="id"&gt;&lt;/div&gt;
					&lt;div header="国家" field="text"&gt;&lt;/div&gt;
			&lt;/div&gt;
		&lt;/div&gt;
	 */
	setColumns: function (value) {

		if (!mini.isArray(value))
			value = [];
		this.columns = value;

		for (var i = 0, l = this.columns.length; i < l; i++) {
			var column = this.columns[i];
			//这里的处理还不明白用意。
			if (column.type) {
				if (!mini.isNull(column.header) && typeof column.header !== "function") {
					if (column.header.trim() == "") {
						delete column.header;
					}
				}
				var col = mini._getColumn(column.type);
				if (col) {
					var _column = mini.copyTo({}, column);
					mini.copyTo(column, col);
					mini.copyTo(column, _column);
				}
			}

			var width = parseInt(column.width);
			if (mini.isNumber(width) && String(width) == column.width)
				column.width = width + "px";
			if (mini.isNull(column.width))
				column.width = this.columnWidth + "px";
		}

		this.doUpdate();
	},
	/**
	 * 获取列表项集合
	 * @return {Array|null}
	 */
	getColumns: function () {
		return this.columns;
	},
    /**
     * 文字过长出现省略号时增加title提示
     * @author 赵美丹
     * @param {} e
     */
    __OnMouseMove: function (e) {
        mini.ListBox.superclass.__OnMouseMove.call(this, e);
        var el = e.target;
        if(e.target.parentNode.tagName == 'TD'){
            el = e.target.parentNode;
        }
        if(el.tagName != 'TD'){
            return;
        }
        if (el.scrollWidth > el.clientWidth) {
            var s = el.innerText || el.textContent || "";
            el.title = s.trim();
        } else {
            el.title = "";
        }
            
    },
    /**
     * 解决title长时间停留后消失，此时移出再移入不显示title的问题
     * @author 赵美丹
     * @date 2013-03-25
     */
    __OnMouseOut: function(e) {
        mini.ListBox.superclass.__OnMouseOut.call(this, e);
        var el = e.target;
        if(e.target.parentNode.tagName == 'TD'){
            el = e.target.parentNode;
        }
        el.title = "";
    },
	/**
	 * 更新组件容器内元素。不建议组件使用者调用
	 */
	doUpdate: function () {
		if (this._allowUpdate === false)
			return;
		var hasColumns = this.columns && this.columns.length > 0;
		if (hasColumns) {
			mini.addClass(this.el, "mini-listbox-showColumns");
		} else {
			mini.removeClass(this.el, "mini-listbox-showColumns");
		}
		this._headerEl.style.display = hasColumns ? "" : "none";
		//组织头信息
		var sb = [];
		if (hasColumns && this.showColumns) {
			sb[sb.length] = '<table class="mini-listbox-headerInner" cellspacing="0" cellpadding="0"><tr>';
			var ckAllId = this.uid + "$ck$all";
			sb[sb.length] = '<td class="mini-listbox-checkbox"><input type="checkbox" id="' + ckAllId + '"></td>';
			for (var j = 0, k = this.columns.length; j < k; j++) {

				var column = this.columns[j];
				var header = column.header;
				if (mini.isNull(header))
					header = '&nbsp;';

				var w = column.width;
				if (mini.isNumber(w))
					w = w + "px";

				sb[sb.length] = '<td class="';
				if (column.headerCls)
					sb[sb.length] = column.headerCls;
				sb[sb.length] = '" style="';
				if (column.headerStyle)
					sb[sb.length] = column.headerStyle + ";";
				if (w) {
					sb[sb.length] = 'width:' + w + ';';
				}
				if (column.headerAlign) {
					sb[sb.length] = 'text-align:' + column.headerAlign + ';';
				}
				sb[sb.length] = '">';
				sb[sb.length] = header;
				sb[sb.length] = '</td>';
			}
			sb[sb.length] = '</tr></table>';
		}
		this._headerEl.innerHTML = sb.join('');

		//组织显示的数据
		var sb = [];
		var data = this.data;

		sb[sb.length] = '<table class="mini-listbox-items" cellspacing="0" cellpadding="0">';

		if (this.showEmpty && data.length == 0) {

			sb[sb.length] = '<tr><td colspan="20">' + this.emptyText + '</td></tr>';
		} else {
			this._doNullItem();

			for (var i = 0, l = data.length; i < l; i++) {
				var item = data[i];

				var rowClsIndex = -1;
				var rowCls = " ";
				var rowStyleIndex = -1;
				var rowStyle = " ";

				sb[sb.length] = '<tr id="';
				sb[sb.length] = this._createItemId(i);
				sb[sb.length] = '" index="';
				sb[sb.length] = i;
				sb[sb.length] = '" class="mini-listbox-item ';

				if (item.enabled === false) {
					sb[sb.length] = ' mini-disabled ';
				}

				rowClsIndex = sb.length;
				sb[sb.length] = rowCls;
				sb[sb.length] = '" style="';
				rowStyleIndex = sb.length;
				sb[sb.length] = rowStyle;
				sb[sb.length] = '">';

				var ckid = this._createCheckId(i);
				var ckName = this.name;
				var ckValue = this.getItemValue(item);

				var disable = '';
				if (item.enabled === false) {
					disable = 'disabled';
				}
				sb[sb.length] = '<td class="mini-listbox-checkbox"><input ' + disable + ' id="' + ckid + '" type="checkbox" ></td>';

				if (hasColumns) {
					for (var j = 0, k = this.columns.length; j < k; j++) {
						var column = this.columns[j];

						var e = this._OnDrawCell(item, i, column);

						var w = column.width;
						if (typeof w == "number")
							w = w + "px";

						sb[sb.length] = '<td class="';
						if (e.cellCls)
							sb[sb.length] = e.cellCls;
						sb[sb.length] = '" style="';
						if (e.cellStyle)
							sb[sb.length] = e.cellStyle + ";";
						if (w) {
							sb[sb.length] = 'width:' + w + ';';
						}
						if (column.align) {
							sb[sb.length] = 'text-align:' + column.align + ';';
						}
						sb[sb.length] = '">';
						sb[sb.length] = e.cellHtml;
						sb[sb.length] = '</td>';

						if (e.rowCls)
							rowCls = e.rowCls;
						if (e.rowStyle)
							rowStyle = e.rowStyle;
					}
				} else {
					var e = this._OnDrawCell(item, i, null);
					sb[sb.length] = '<td class="';
					if (e.cellCls)
						sb[sb.length] = e.cellCls;
					sb[sb.length] = '" style="';
					if (e.cellStyle)
						sb[sb.length] = e.cellStyle;
					sb[sb.length] = '">';
					sb[sb.length] = e.cellHtml;
					sb[sb.length] = '</td>';

					if (e.rowCls)
						rowCls = e.rowCls;
					if (e.rowStyle)
						rowStyle = e.rowStyle;
				}

				sb[rowClsIndex] = rowCls;
				sb[rowStyleIndex] = rowStyle;

				sb[sb.length] = '</tr>';
			}
		}
		sb[sb.length] = '</table>';

		var innerHTML = sb.join("");
	    //listbox在ie6下窗口大小改变后出现滚动条的问题。潘正锋 2013-06-19
		this._viewEl.firstChild.innerHTML = innerHTML;


		this._doSelects();

		this.doLayout();
	},
	/**
	 * 调整组件布局，不建议组件使用者调用。
	 */
	doLayout: function () {
		if (!this.canLayout())
			return;

		if (this.columns && this.columns.length > 0) {
			mini.addClass(this.el, "mini-listbox-showcolumns");
		} else {
			mini.removeClass(this.el, "mini-listbox-showcolumns");
		}
		if (this.showCheckBox) {
			mini.removeClass(this.el, "mini-listbox-hideCheckBox");
		} else {
			mini.addClass(this.el, "mini-listbox-hideCheckBox");
		}

		var ckAllId = this.uid + "$ck$all";
		var ck = document.getElementById(ckAllId);
		if (ck)
			ck.style.display = this.showAllCheckBox ? "" : "none";

		var autoHeight = this.isAutoHeight();

		h = this.getHeight(true);
		w = this.getWidth(true);
		var elWidth = w;

		var viewEl = this._viewEl;

		viewEl.style.width = w + "px";

		if (!autoHeight) {
			var h2 = mini.getHeight(this._headerEl);
			h = h - h2;
			viewEl.style.height = h + "px";
		} else {
			viewEl.style.height = "auto";
		}

		if (isIE) {
		    //listbox在ie6下窗口大小改变后出现滚动条的问题。潘正锋 2013-06-19
		    var table1 = this._headerEl.firstChild, table2 = this._viewEl.firstChild.firstChild;
			if (this._viewEl.offsetHeight >= this._viewEl.scrollHeight) {
				table2.style.width = "100%";
				if (table1)
					table1.style.width = "100%";
			} else {
				var w = parseInt(table2.parentNode.offsetWidth - 17) + 'px'
			    //listbox在ie6下窗口大小改变后出现滚动条的问题。潘正锋 2013-06-19
				//table2.style.width = w;
				if (table1)
					table1.style.width = w;
			}
		}
		if (this._viewEl.offsetHeight < this._viewEl.scrollHeight) {
			this._headerEl.style.width = (elWidth - 17) + "px";
		} else {
			this._headerEl.style.width = "100%";
		}

	},
	/**
	 * 设置是否显示复选框
	 * @param value {Boolean}
	 */
	setShowCheckBox: function (value) {
		this.showCheckBox = value;
		this.doLayout();
	},
	/**
	 * 获取是否显示复选框标记值
	 * @return {Boolean}
	 */
	getShowCheckBox: function () {
		return this.showCheckBox;
	},
	/**
	 * 设置是否显示全选复选框
	 * @param value {Boolean}
	 */
	setShowAllCheckBox: function (value) {
		this.showAllCheckBox = value;
		this.doLayout();
	},
	/**
	 * 获取是否显示全选复选框标记值
	 * @return {Boolean}
	 */
	getShowAllCheckBox: function () {
		return this.showAllCheckBox;
	},
	setShowColumns: function (value) {

	    this.showColumns = value;

	    this.doUpdate();

	},
	getShowColumns: function () {
	    return this.showColumns;
	},

	/**
	 * 设置是否显示空选项（也就是说，选项列表的第一项是空项）
	 * @param value {Boolean}
	 */
	setShowNullItem: function (value) {
		if (this.showNullItem != value) {
			this.showNullItem = value;
			this._doNullItem();
			this.doUpdate();
		}
	},
	/**
	 * 获取是否显示空选项标记值
	 * @return {Boolean}
	 */
	getShowNullItem: function () {
		return this.showNullItem;
	},
	/**
	 * 设置空选项显示的文本
	 * @param value {String}
	 */
	setNullItemText: function (value) {

		if (this.nullItemText != value) {
			this.nullItemText = value;
			this._doNullItem();
			this.doUpdate();
		}
	},
	/**
	 * 获取空选项显示的文本
	 * @return {String}
	 */
	getNullItemText: function () {
		return this.nullItemText;
	},
	/**
	 * 添加一个空选项
	 */
	_doNullItem: function () {
		for (var i = 0, l = this.data.length; i < l; i++) {
			var item = this.data[i];
			if (item.__NullItem) {
				this.data.removeAt(i);
				break;
			}
		}
		if (this.showNullItem) {
			var item = {
				__NullItem: true
			};
			item[this.textField] = this.nullItemText;
			item[this.valueField] = "";
			this.data.insert(0, item);
		}
	},
	
	_OnDrawCell: function (record, index, column) {
		var value = column ? record[column.field] : this.getItemText(record);
		var e = {
			sender: this,
			index: index,
			rowIndex: index,
			record: record,
			item: record,
			column: column,
			field: column ? column.field : null,
			value: value,
			cellHtml: value,
			rowCls: null,
			cellCls: column ? (column.cellCls || '') : "",
			rowStyle: null,
			cellStyle: column ? (column.cellStyle || '') : ""
		};

		var hasColumns = this.columns && this.columns.length > 0;
		if (!hasColumns) {
			if (index == 0 && this.showNullItem) {
				e.cellHtml = this.nullItemText;
			}
		}
	    //注释掉 autoEscape根本没有这个属性 潘正锋 2013-05-06
		//if (e.autoEscape == true) {
		    e.cellHtml = mini.htmlEncode(e.cellHtml);
		//}

		if (column) {
			if (column.dateFormat) {
				if (mini.isDate(e.value))
					e.cellHtml = mini.formatDate(value, column.dateFormat);
				else
					e.cellHtml = value;
			}
			var renderer = column.renderer;
			if (renderer) {
				fn = typeof renderer == "function" ? renderer : window[renderer];
				if (fn) {
					e.cellHtml = fn.call(column, e);
				}
			}
		}

		this.fire("drawcell", e);

		if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "")
			e.cellHtml = "&nbsp;";

		return e;
	},
	__OnScroll: function (e) {
		this._headerEl.scrollLeft = this._viewEl.scrollLeft;
	},
	//处理全选/全取消
	__OnClick: function (e) {
		var ckAllId = this.uid + "$ck$all";
		//点击全选按钮。
		if (e.target.id == ckAllId) {
			var ck = document.getElementById(ckAllId);
			if (ck) {
				var checked = ck.checked;

				var value = this.getValue(); ;

				if (checked) {
					this.selectAll();
				} else {
					this.deselectAll();
				}
				this._OnSelectionChanged();

				if (value != this.getValue()) {
					this._OnValueChanged();

					this.fire("itemclick", {
						htmlEvent: e
					});
				}
			}
			return;
		}
		this._fireEvent(e, 'Click');
	},
	/**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对 nullItemText, ondrawcell, showCheckBox, showAllCheckBox, showNullItem等属性。
	 * @param el {Object} DOM元素
	 * @returns {Object} JSON对象
	 */
	getAttrs: function (el) {
		var attrs = mini.ListBox.superclass.getAttrs.call(this, el);
		/**
		 * ondrawcell 事件当列表项被重绘时触发<br/>
		 * 支持标签配置。
		 * @name ondrawcell
		 * @event
		 * @memberOf mini.ListBox.prototype
		 */
		mini._ParseString(el, attrs,
		["nullItemText", "ondrawcell"
		]
		);
		mini._ParseBool(el, attrs,
		["showCheckBox", "showAllCheckBox", "showNullItem", "showColumns"
		]
		);

		//处理子节点，主要用于处理头信息。
		if (el.nodeName.toLowerCase() != "select") {
			var cs = mini.getChildNodes(el);
			for (var i = 0, l = cs.length; i < l; i++) {
				var node = cs[i];
				var property = jQuery(node).attr("property");
				if (!property)
					continue;
				property = property.toLowerCase();
				if (property == "columns") {
					attrs.columns = mini._ParseColumns(node);
				} else if (property == "data") {
					attrs.data = node.innerHTML;
				}
			}
		}

		return attrs;
	}
});
mini.regClass(mini.ListBox, "listbox");