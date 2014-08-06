/**
 * 文件定义了下拉框组件。
 * @fileOverview ComboBox.js
 * @author 陈师东
 */

/**
 * ComboBox 是mini UI中的下拉框组件，构造函数中调用了 PopupEdit的构造方法，并为组件的数据源和列头声明了数组。
 * @class mini.ComboBox
 * @constructor
 * @extends mini.PopupEdit
 * @requires mini.Listbox
 */
mini.ComboBox = function () {
	//数据源（待选项）数组
	this.data = [];
	//列头
	this.columns = [];
	//调用父类构造
	mini.ComboBox.superclass.constructor.call(this);
	var me = this;
	if (isFirefox) {
		/** @ignore */
		this._textEl.oninput = function () {
			me._tryQuery();
		}
	}
}
mini.extend(mini.ComboBox, mini.PopupEdit, /** @lends mini.ComboBox.prototype */
{
	/**
	 * 选项文本
	 * @type String
	 * @default ''
	 */
	text: '',
	/**
	 * 选项值
	 * @type String
	 * @default ''
	 */
	value: '',
	/**
	 * 取选项值时对应的属性名
	 * @type String
	 * @default 'id'
	 */
	valueField: "id",
	/**
	 * 取选项文本时对应的属性名
	 * @type String
	 * @default 'text'
	 */
	textField: "text",
	/**
	 * 多选时，选中项之间的分隔符，但好像没实现
	 * @type String
	 * @deprecated
	 * @private
	 */
	delimiter: ',',

	/**
	 * 是否多选
	 * @type boolean
	 * @default false
	 */
	multiSelect: false,
	/**
	 * 数据源数组
	 * @type Array
	 * @default []
	 */
	data: [],
	/**
	 * 动态加载数据url
	 * @type String
	 * @default ''
	 */
	url: "",

	/**
	 * 列头数组
	 * @type Array
	 * @default []
	 */
	columns: [],

	/**
	 * 是否允许输入
	 * @type boolean
	 * @default false
	 */
	allowInput: false,

	/**
	 * 单选时，值是否只来自选择
	 * @type Boolean
	 * @default true
	 */
	valueFromSelect: false,

	/**
	 * 下拉框的最大高度，包括padding与border，
	 * 一般情况下为popupMaxHeight-2，css文件中mini-listbox-border样式设置border为1
	 * @type Number
	 * @default ''
	 */
	popupMaxHeight: 200,

	/**
	 * 将声明组建时设置的属性应用到组件对象上，包括待选项数据，属性与事件。
	 * @param kv {Object} JSON对象
	 * @returns {Object} 组件实例本身
	 */
	set: function (kv) {
		if (typeof kv == 'string') {
			return this;
		}
		//默认选项值
		var value = kv.value;
		delete kv.value;
		//异步加载待选项的url
		var url = kv.url;
		delete kv.url;
		//非异步加载待选项的对象
		var data = kv.data;
		delete kv.data;
		//调用父类set方法设置公用属性
		mini.ComboBox.superclass.set.call(this, kv);

		if (!mini.isNull(data)) {
			this.setData(data);

			kv.data = data;
		}
		//若url和data都不为空，两者都进行了处理(查看了setUrl方法，里面的ajax回调也调用了setData方法)，
		//这里感觉不是那么好（降低了效率）
		if (!mini.isNull(url)) {
			this.setUrl(url);

			kv.url = url;
		}
		if (!mini.isNull(value)) {
			this.setValue(value);

			kv.value = value;
		}

		return this;
	},
	/**
	 * 组件样式名
	 * @type String
	 * @default 'mini-combobox'
	 */
	uiCls: "mini-combobox",
    destroy: function (removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        if(this._listbox){
            mini.clearEvent(this._listbox);
            this._listbox.destroy(removeEl);
            this._listbox = null;
        }
        delete this.data;
        delete this.columns;
        mini.ComboBox.superclass.destroy.call(this, removeEl);
    },
	/**
	 * ComboBox继承PopupEdit，依赖于ListBox，
	 * 此方法对这两个组件进行创建并设置部分样式与事件
	 */
	_createPopup: function () {
		mini.ComboBox.superclass._createPopup.call(this);

		this._listbox = new mini.ListBox();

		this._listbox.setBorderStyle("border:0;");
		this._listbox.setStyle("width:100%;height:auto;");
		this._listbox.render(this.popup._contentEl);

		this._listbox.on("itemclick", this.__OnItemClick, this);
		this._listbox.on("drawcell", this.__OnItemDrawCell, this);
		var me = this;
		this._listbox.on("beforeload", function (e) {
		    me.fire("beforeload", e);
		}, this);
		this._listbox.on("load", function (e) {
		    me.fire("load", e);
		}, this);
		this._listbox.on("loaderror", function (e) {
		    me.fire("loaderror", e);
		}, this);

	},
	/**
	 * 显示弹出层并设值
	 */
	showPopup: function () {
		var ex = {
			cancel: false
		};
		this.fire("beforeshowpopup", ex);
		if (ex.cancel == true)
			return;
		this._listbox.setHeight("auto");
		mini.ComboBox.superclass.showPopup.call(this);
		var h = this.popup.el.style.height;
		if (h == "" || h == "auto") {
			this._listbox.setHeight("auto");
		} else {
			this._listbox.setHeight("100%");
		}
		this._listbox.setValue(this.value);

	},
	/**
	 * 选项选择事件
	 * !!从代码上来看，此方法与父类无联系
	 * !!经测试，此方法属未曾被调用过，即无任何作用
	 * @param item项目对象
	 * @deprecated
	 */
	select: function (item) {
		this._listbox.deselectAll();
		item = this.getItem(item);
		if (item) {
			this._listbox.select(item);
			this.__OnItemClick();
		}
	},
	/**
	 * 获取项目对象
	 * @param item 项目对象或选项id
	 */
	getItem: function (item) {
		return typeof item == "object" ? item : this.data[item];
	},
	/**
	 * 从数据源数组中找出该项目对象
	 * @type 项目对象
	 * @return 该项目对象在数组中下标
	 */
	indexOf: function (item) {
		return this.data.indexOf(item);
	},
	/**
	 * 根据下标从数据源数组中获取项目对象
	 * @type int
	 */
	getAt: function (index) {
		return this.data[index];
	},
	/**
	 * 为组件加载数据，根据参数类型调用不同加载方式
	 * @type String或{}
	 */
	load: function (data) {
		if (typeof data == "string") {
			this.setUrl(data);
		} else {
			this.setData(data);
		}
	},
	/**
	 * 非ajax方式为组件加载数据
	 * @type String或{}
	 * @default ''
	 */
	setData: function (data) {

		if (typeof data == "string") {

			data = eval('(' + data + ')');

		}
		if (!mini.isArray(data))
			data = [];
        //解决多个数据相同选择框同时存在时，下拉树的选中状态互相影响的问题 赵美丹 2013-3-2
        this._listbox.setData(mini.clone(data));
		this.data = this._listbox.data;

		var vts = this._listbox.getValueAndText(this.value);
		this.text = this._textEl.value = vts[1];

    },
	/**
	 * 获取数据源数组
	 */
	getData: function () {
		return this.data;
	},
	/**
	 * ajax方式为组件加载数据
	 * @type String
	 */
	setUrl: function (url) {
		this.getPopup();

		this._listbox.setUrl(url);
		this.url = this._listbox.url;
		this.data = this._listbox.data;

		var vts = this._listbox.getValueAndText(this.value);
		this.text = this._textEl.value = vts[1];

	},
	/**
	 * 获取url
	 */
	getUrl: function () {
		return this.url;
	},
	/**
	 * 设置从data中取值时的字面量
	 * @type String
	 */
	setValueField: function (valueField) {
		this.valueField = valueField;
		if (this._listbox) {
			this._listbox.setValueField(valueField);
		}
	},
	/**
	 * 获取从data中取值时的字面量
	 */
	getValueField: function () {
		return this.valueField;
	},
	/**
	 * 设置从data中取文本时的字面量
	 * @type String
	 * @default ''
	 */
	setTextField: function (value) {
		if (this._listbox)
			this._listbox.setTextField(value);
		this.textField = value;
	},
	/**
	 * 获取从data中取文本时的字面量
	 * @type String
	 * @default ''
	 */
	getTextField: function () {
		return this.textField;
	},
	/**
	 * 设置从data中取文本时的字面量（此为多余方法）
	 * @type String
	 */
	setDisplayField: function (value) {
		this.setTextField(value);
	},
	setDataField: function (value) {
	    if (this._listbox) this._listbox.setDataField(value);
	    this.dataField = value;
	},

	/**
	 * 为组件设置值，针对单选
	 * @type String
	 * @default ''
	 */
	setValue: function (value) {
        //解决数字类型时，字符串和数字类型混合使用多次触发valuechanged事件问题，如pagesize 赵美丹 2013-02-19
	    var oldvalue = this.value;
        var vts = this._listbox.getValueAndText(value);
            //解决valueFromSelect=true时，当setValue的值不存在时，清空value值 潘正锋 2013-05-14
        if (this.valueFromSelect) {
            this.value = vts[0];
        }
         else
            this.value = value;
	     this._valueEl.value = this.value;
			//解决combobox的emptyText（灰色显示）和nullItemText显示效果不一致问题 赵美丹 2013-05-28
			//this.text = this._textEl.value = vts[1];
			//this._doEmpty();
         this.setText(vts[1]);

			//解决setValue不触发valuechanged事件问题 赵美丹 2012-12-05
         //将if判断移至这里，让每次调用此方法都执行上面的代码 潘正锋 2013-06-06  
		 if (!mini.isEquals(oldvalue, this.value))
             this._OnValueChanged();
	},
    setText : function(text){
        //解决combobox的emptyText（灰色显示）和nullItemText显示效果不一致问题 赵美丹 2013-05-28
        if(mini.isEquals(this.emptyText, text)){
            mini.ComboBox.superclass.setText.call(this, "");
        }else{
            mini.ComboBox.superclass.setText.call(this, text);
        }
    },
	/**
	 * 设置/取消多选，相应各选项前的checkbox也会同步变化
	 * @type boolean
	 */
	setMultiSelect: function (value) {
		if (this.multiSelect != value) {
			this.multiSelect = value;
			if (this._listbox) {
				this._listbox.setMultiSelect(value);
				this._listbox.setShowCheckBox(value);
			}
		}
	},
	/**
	 * 返回是否多选
	 */
	getMultiSelect: function () {
		return this.multiSelect;
	},
	/**
	 * 设置列
	 * @type object 类似于[{header:"val",field:"id"},{header:"country",field:"text"}]
	 */
	setColumns: function (value) {
		if (!mini.isArray(value))
			value = [];
		this.columns = value;
		this._listbox.setColumns(value);
	},
	/**
	 * 获取列对象
	 */
	getColumns: function () {
		return this.columns;
	},
	/**
	 * 是否显示空选项
	 * @type String
	 * @default ''
	 */
	showNullItem: false,
	/**
	 * 设置是否显示空选项
	 * @type boolean
	 */
	setShowNullItem: function (value) {
		if (this.showNullItem != value) {
			this.showNullItem = value;
			this._listbox.setShowNullItem(value);
		}
	},
	/**
	 * 获取空选项对象
	 */
	getShowNullItem: function () {
		return this.showNullItem;
	},
	/**
	 * 设置空选项的文本（对应的value默认为''）
	 * @type String
	 */
	setNullItemText: function (value) {
		if (this.nullItemText != value) {
			this.nullItemText = value;
			//解决combobox的emptyText（灰色显示）和nullItemText显示效果不一致问题 赵美丹 2013-05-28
            this.emptyText = value;
			this._listbox.setNullItemText(value);
		}
	},
	/**
	 * 获取空选项的文本
	 */
	getNullItemText: function () {
		return this.nullItemText;
	},
	/**
	 * 设置【单选时，值是否只来自选择】
	 * @type boolean
	 */
	setValueFromSelect: function (value) {
		this.valueFromSelect = value;
	},
	/**
	 * 获取【单选时，值是否只来自选择】
	 */
	getValueFromSelect: function () {
		return this.valueFromSelect;
	},
	/**
	 * change事件
	 */
	_OnValueChanged: function () {
		if (this.validateOnChanged) {
			this.validate();
		}
		var value = this.getValue();
		var selecteds = this.getSelecteds();
		var selected = selecteds[0];
		var sf = this;

		sf.fire("valuechanged", {
			value: value,
			selecteds: selecteds,
			selected: selected
		});

	},
	/**
	 * （复选时）获取已选择的项目
	 */
	getSelecteds: function () {
		return this._listbox.findItems(this.value);
	},
	/**
	 * （单选时）获取已选择的项目
	 * @type String
	 * @default ''
	 */
	getSelected: function () {
		return this.getSelecteds()[0];
	},
	/**
	 * （自定义事件）项目绘制单元格时的事件
	 * @param [event] {Event}可以是一个JSON对象
	 */
	__OnItemDrawCell: function (e) {

		this.fire("drawcell", e);
	},
	/**
	 * 项目单击事件
	 * @param [event] {Event}可以是一个JSON对象
	 */
	__OnItemClick: function (e) {

		var items = this._listbox.getSelecteds();
		var vts = this._listbox.getValueAndText(items);

		var value = this.getValue();
		this.setValue(vts[0]);
		this.setText(vts[1]);
		if (e) {
		    //改为setValue时调用该代码，解决setValue不触发valuechanged事件问题 赵美丹 2012-12-05
		    /*
		    if (value != this.getValue()) {
		        var sf = this;
		        setTimeout(function () {
		            sf._OnValueChanged();
		        }, 1);
		    }
            */
		    if (!this.multiSelect) {
		        this.hidePopup();
		    }

		    this.focus();


		    this.fire("itemclick", { item: e.item });
		}

	},
	/**
	 * 文本框keydown事件
	 */
	__OnInputKeyDown: function (e, userOldText) {
		this.fire("keydown", {
			htmlEvent: e
		});
		//BackSpace
		if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
			return false;
		}
		//Tab
		if (e.keyCode == 9) {
			this.hidePopup();
			return;
		}
		if (this.isReadOnly()) return;

		switch (e.keyCode) {
			case 27:
				//Escape
				e.preventDefault();
				if (this.isShowPopup()) {
					e.stopPropagation();
				}

				this.hidePopup();
				break;
			case 13:
				//Enter
				if (this.isShowPopup()) {
					e.preventDefault();
					e.stopPropagation();

					var index = this._listbox.getFocusedIndex();
					if (index != -1) {
						var item = this._listbox.getAt(index);
						if (this.multiSelect) {

						} else {
							this._listbox.deselectAll();
							this._listbox.select(item);
						}
						var items = this._listbox.getSelecteds();
						var vts = this._listbox.getValueAndText(items);
						this.setValue(vts[0]);
						this.setText(vts[1]);
						//改为setValue时调用该代码，解决setValue不触发valuechanged事件问题 赵美丹 2012-12-05
						//this._OnValueChanged();

					}
					this.hidePopup();
				} else {
					this.fire("enter");
				}
				break;
			case 37:
				//Left未定义
				break;
			case 38:
			    //Up
			    e.preventDefault();

				var index = this._listbox.getFocusedIndex();
				if (index == -1) {
					index = 0;
					if (!this.multiSelect) {
						var item = this._listbox.findItems(this.value)[0];
						if (item) {
							index = this._listbox.indexOf(item);
						}
					}
				}
				if (this.isShowPopup()) {
					if (!this.multiSelect) {
						index -= 1;
						if (index < 0)
							index = 0;
						this._listbox._focusItem(index, true);
					}
				}
				break;
			case 39:
				//Right未定义
				break;
			case 40:
			    //Down
			    e.preventDefault();

				var index = this._listbox.getFocusedIndex();
				if (index == -1) {
					index = 0;
					if (!this.multiSelect) {
						var item = this._listbox.findItems(this.value)[0];
						if (item) {
							index = this._listbox.indexOf(item);
						}
					}
				}
				if (this.isShowPopup()) {
					if (!this.multiSelect) {
						index += 1;
						if (index > this._listbox.getCount() - 1)
							index = this._listbox.getCount() - 1;
						this._listbox._focusItem(index, true);
					}
				} else {
					this.showPopup();
					if (!this.multiSelect) {
						this._listbox._focusItem(index, true);
					}
				}
				break;
			default:
				this._tryQuery(this._textEl.value);
				break;
		}
	},
	/**
	 * 文本框keyup事件
	 */
	__OnInputKeyUp: function (e) {
		this.fire("keyup", {
			htmlEvent: e
		});
	},
	/**
	 * 文本框keypress事件
	 */
	__OnInputKeyPress: function (e) {
		this.fire("keypress", {
			htmlEvent: e
		});
	},
	/**
	 * 若前后文本不一致则进行选项搜索
	 * @type String
	 */
	_tryQuery: function (oldText) {

		var sf = this;
		setTimeout( function () {
			var text = sf._textEl.value;
			if (text != oldText) {
				sf._doQuery(text);

			}
		}, 10);
	},
	/**
	 * 根据文本框内容搜索选项
	 * @type String
	 */
	_doQuery: function (key) {
		if (this.multiSelect == true)
			return;
		var view = [];
		for (var i = 0, l = this.data.length; i < l; i++) {
			var o = this.data[i];
			var text = mini._getMap(this.textField, o);

			if (typeof text == "string") {
				text = text.toUpperCase();
				key = key.toUpperCase();
				if (text.indexOf(key) != -1) {
					view.push(o);
				}
			}
		}
		this._listbox.setData(view);
		this._filtered = true;
		if (key !== "" || this.isShowPopup()) {
			this.showPopup();

			var index = 0;
			if (this._listbox.getShowNullItem())
				index = 1;
			var me = this;
			me._listbox._focusItem(index, true);
		}
	},
	/**
	 * 弹出层隐藏事件
	 * @type String
	 * @default ''
	 */
	__OnPopupHide: function (e) {
		//如果已经搜索过
		if (this._filtered) {
			this._filtered = false;
			if (this._listbox.el) {
				this._listbox.setData(this.data);
			}
		}
		this.fire("hidepopup");
	},
	/**
	 * 根据给定的值查找所有选项，value即为combobox对应的value，可能含分隔符
	 * @type String
	 */
	findItems: function (value) {
		return this._listbox.findItems(value);
	},
	/**
	 * 文本框内容改变事件（单选时）
	 * @type String
	 * @default ''
	 */
	__OnInputTextChanged: function (e) {
		if (this.multiSelect == false) {

			var text = this._textEl.value;

			var data = this.getData();
			var selected = null;
			for (var i = 0, l = data.length; i < l; i++) {
				var item = data[i];
				var itemText = item[this.textField];
				if (itemText == text) {
					selected = item;
					break;
				}
			}
			if (selected) {
				this._listbox.setValue(selected ? selected[this.valueField] : "");

				var v = this._listbox.getValue();
				var vts = this._listbox.getValueAndText(v);

				var value = this.getValue();
				this.setValue(v);
				this.setText(vts[1]);
			} else {
				if (this.valueFromSelect) {
					this.setValue("");
					this.setText("");
				} else {
					this.setValue(text);
					this.setText(text);
				}
			}
			//改为setValue时调用该代码，解决setValue不触发valuechanged事件问题 赵美丹 2012-12-05
			/*if (value != this.getValue()) {
				var sf = this;

				sf._OnValueChanged();

			}*/

		}

	},
	/**
	 * 根据页面声明的元素获取属性值
	 * @type String
	 * @default ''
	 */
	getAttrs: function (el) {

		var attrs = mini.ComboBox.superclass.getAttrs.call(this, el);

		/**
		 * ondrawcell 渲染元素时触发<br/>
		 * 通过在html标签声明。
		 * @name ondrawcell
		 * @event
		 * @memberOf mini.ComboBox.prototype
		 */
		mini._ParseString(el, attrs,
		["url", "data", "textField", "valueField", "displayField", "nullItemText",
		 "ondrawcell", "onbeforeload", "onload", "onloaderror", "onitemclick"
		]
		);
		mini._ParseBool(el, attrs,
		["multiSelect", "showNullItem", "valueFromSelect"
		]
		);

		if (attrs.displayField)
			attrs.textField = attrs.displayField;

		var valueField = attrs.valueField || this.valueField;
		var textField = attrs.textField || this.textField;
		//标签内部声明选项数据源的两种方式，第二种还可以声明列头
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
		} else {
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

/**
 * 注册ComboBox组件
 * @type String
 */
mini.regClass(mini.ComboBox, 'combobox');