/**
 * 文件中定义了 CheckBox 组件。
 * @fileOverview CheckBox.js
 * @author 殷文旭
 */


/**
 * @class CheckBox 是mini UI中的复选框组件。
 * @constructor
 * @extends mini.Control
 * @requires mini.Control
 * @version 1.0
 */
mini.CheckBox = function () {
	mini.CheckBox.superclass.constructor.call(this);
}
mini.extend(mini.CheckBox, mini.Control, /** @lends mini.CheckBox.prototype */{
	/**
	 * 标记，代表这是一个form组件
	 * @type Boolean
	 * @default true
	 */
    formField: true,

    _clearText: false,
	/**
	 * 文本
	 * @type String
	 * @default ""
	 */
	text: "",
	/**
	 * 选中状态
	 * @type Boolean
	 * @default false
	 */
	checked: false,
	/**
	 * 默认值
	 * @type Boolean
	 * @default false
	 */
	defaultValue: false,
	/**
	 * “真”值，被选中时复选框对应的值
	 * @type Boolean
	 * @default true
	 */
	trueValue: true,
	/**
	 * “假”值，未被选中时复选框对应的值
	 * @type Boolean
	 * @default false
	 */
	falseValue: false,
	/**
	 * 组件样式类
	 * @type String
	 * @default "mini-checkbox"
	 */
	uiCls: "mini-checkbox",
	/**
	 * 创建组件HTML结构，并绑定给组件实例。
	 * @default
	 */
	_create: function () {
		var ckid = this.uid + "$check";
		this.el = document.createElement("span");
		this.el.className = "mini-checkbox";
		this.el.innerHTML = '<input id="' + ckid + '" name="' + this.id + '" type="checkbox" class="mini-checkbox-check"><label for="' + ckid + '" onclick="return false;">' + this.text + '</label>';

		this._checkEl = this.el.firstChild;
		this._labelEl = this.el.lastChild;
	},
	
	/**
	 * 析构函数
	 */
	destroy: function (removeEl) {
	    //内存泄露问题优化 赵美丹 2013-05-24
		if (this._checkEl) {
			this._checkEl.onmouseup = null;
			this._checkEl.onclick = null;
            mini.clearEvent(this._checkEl);
            this.el.removeChild(this._checkEl);
			this._checkEl = null;
		}
        if (this._labelEl) {
             mini.clearEvent(this._labelEl);
            this.el.removeChild(this._labelEl);
            this._labelEl = null;
        }
		mini.CheckBox.superclass.destroy.call(this, removeEl);
	},
	/**
	 * 设置组件初始化完成后的需要执行的回调函数。
	 * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
	 */
	_initEvents: function () {
		mini._BindEvents( function () {
			mini.on(this.el, "click", this.__onClick, this);
			/** @ignore */
			this._checkEl.onmouseup = function () {
				return false;
			}
			var sf = this;
			/** @ignore */
			this._checkEl.onclick = function () {
				if (sf.isReadOnly())
					return false
			}
		}, this);
	},
	/**
	 * 设置组件name属性
	 * @param value {String}
	 */
	setName: function (value) {
		this.name = value;
		mini.setAttr(this._checkEl, "name", this.name);
	},
	/**
	 * 设置复选框后的文本
	 * @param value {String}
	 */
	setText: function (value) {
		if (this.text !== value) {
			this.text = value;
			this._labelEl.innerHTML = value;
		}
	},
	/**
	 * 获取复选框后的文本
	 * @return {String}
	 */
	getText: function () {
		return this.text;
	},
	/**
	 * 设置复选框是否选中状态
	 * 注意：在此设置时可以使用到我们设置的truevalue 和 falsevalue 
	 * 例如：truevalue = 'A' falsevalue = 'B' 则 setChecked('A')等同于选中。
	 * @param value {String|Boolean}
	 */
	setChecked: function (value) {
		if (value === true)
			value = true;
		else if (value == this.trueValue)
			value = true;
		else if (value == "true")
			value = true;
		else if (value === 1)
			value = true;
		else if (value == "Y")
			value = true;
		else
			value = false;

		if (this.checked !== value) {
			this.checked = !!value;
			this._checkEl.checked = this.checked;

			this.value = this.getValue();
            
            //解决click以为的赋值方式无法触发事件的问题 赵美丹 2013-05-16
            this.fire("checkedchanged", {
	            checked: this.checked
	        });
	        this.fire("valuechanged", {
	            value: this.getValue()
	        });
		}
	},
	/**
	 * 获取复选框是否被选中的状态
	 * @return {Boolean}
	 */
	getChecked: function () {
		return this.checked;
	},
	/**
	 * 与setChecked使用方法与用途类似。
	 * @param value {String|Boolean}
	 */
	setValue: function (value) {
		if (this.checked != value) {
			this.setChecked(value);
			this.value = this.getValue();
		}
	},
	/**
	 * 获取复选框的值，此值是，当被选中时，返回trueValue, 当未被选中时，返回falseValue。
	 * @return {String|Boolean}
	 */
	getValue: function () {
		return String(this.checked == true ? this.trueValue : this.falseValue);
	},
	/**
	 * 与getValue使用方法与用途类似。
	 * @return {String|Boolean}
	 */
	getFormValue: function () {
		return this.getValue();
	},
	/**
	 * 设置 "真" 值
	 * @param value {String|Boolean}
	 */
	setTrueValue: function (value) {
		this._checkEl.value = value;
		this.trueValue = value;
	},
	/**
	 * 获取"真" 值
	 * @return {String|Boolean}
	 */
	getTrueValue: function () {
		return this.trueValue;
	},
	/**
	 * 设置"假" 值
	 * @param value {String|Boolean}
	 */
	setFalseValue: function (value) {
		this.falseValue = value;
	},
	/**
	 * 获取"假" 值
	 * @return {String|Boolean}
	 */
	getFalseValue: function () {
		return this.falseValue;
	},
	//点击事件默认响应函数
	__onClick: function (e) {

		if (this.isReadOnly())
			return;

		this.setChecked(!this.checked);

        //修改至setChecked中，解决click以为的赋值方式无法触发事件的问题 赵美丹 2013-05-16
		/*this.fire("checkedchanged", {
			checked: this.checked
		});
		this.fire("valuechanged", {
			value: this.getValue()
		});*/

		this.fire("click", e, this);

	},
	/**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对 text， oncheckedchanged， onclick， onvaluechanged，
	 * enabled， checked， trueValue， falseValue 等属性做提取。
	 * @param el {Object} DOM元素
	 * @returns {Object} JSON对象
	 */
	getAttrs: function (el) {
		var attrs = mini.CheckBox.superclass.getAttrs.call(this, el);
		var jq = jQuery(el);
		/**
		 * oncheckedchanged 事件当复选框的选中状态改变时触发<br/>
		 * 通过在html标签声明。
		 * @name oncheckedchanged
		 * @event
		 * @memberOf mini.CheckBox.prototype
		 */
		/**
		 * onvaluechanged 事件当复选框的值改变时触发，发生在 oncheckedchanged 事件之后<br/>
		 * 通过在html标签声明。
		 * @name onvaluechanged
		 * @event
		 * @memberOf mini.CheckBox.prototype
		 */
		/**
		 * onclick 事件当复选框的被点击时触发，发生在 onvaluechanged 事件之后<br/>
		 * 通过在html标签声明。
		 * @name onclick
		 * @event
		 * @memberOf mini.CheckBox.prototype
		 */
		
		attrs.text = el.innerHTML;
		mini._ParseString(el, attrs,
		["text", "oncheckedchanged", "onclick", "onvaluechanged"
		]
		);

		mini._ParseBool(el, attrs,
		["enabled"
		]
		);

		var checked = mini.getAttr(el, "checked");

		if (checked) {
			attrs.checked = (checked == "true" || checked == "checked") ? true : false;
		}

		var trueValue = jq.attr("trueValue");
		if (trueValue) {
			attrs.trueValue = trueValue;
			trueValue = parseInt(trueValue);
			if (!isNaN(trueValue)) {
				attrs.trueValue = trueValue;
			}
		}
		var falseValue = jq.attr("falseValue");
		if (falseValue) {
			attrs.falseValue = falseValue;
			falseValue = parseInt(falseValue);
			if (!isNaN(falseValue)) {
				attrs.falseValue = falseValue;
			}
		}

		return attrs;
	}
});

mini.regClass(mini.CheckBox, "checkbox");