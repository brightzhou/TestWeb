/**
 * 文件中定义了文本录入框组件。
 * @fileOverview TextBox.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * TextBox 是mini UI中的文本录入框框组件，构造函数中调用了 ValidatorBase 方法
 * @class mini.TextBox
 * @constructor
 * @extends mini.ValidatorBase
 * @requires mini.ValidatorBase
 * @property allowInput {Boolean} 是否可录入标志
 */
mini.TextBox = function () {
    mini.TextBox.superclass.constructor.call(this);
}
mini.extend(mini.TextBox, mini.ValidatorBase,/** @lends mini.TextBox.prototype */
{

    /**
	 * 组件的name属性，与保存值的标签的name属性值一致
	 * @type String
	 * @default ""
	 */
    name: "",
    /**
	 * 标记，代表这是一个form组件
	 * @type Boolean
	 * @default true
	 */
    formField: true,
    /**
	 * 开关，获取焦点时是否自动选中文本
	 * @type Boolean
	 * @default false
	 */
    selectOnFocus: false,
    minWidth: 10,

    /**
	 * 文本框最小高度
	 * @type Number
	 * @default 15
	 */
    minHeight: 15,
    /**
	 * 文本最大可录入长度
	 * @type Number
	 * @default 1000
	 */
    maxLength: 5000,
    /**
	 * 空值时显示的文本，用于文本框内提示
	 * @type String
	 * @default ""
	 */
    emptyText: "",
    /**
	 * 文本
	 * @type String
	 * @default ""
	 */
    text: "",
    /**
	 * 值，注，此组件是 KEY-VALUE 形式组件，也就是说组件有两个值，一个用于展现，一个用于后台处理。
	 * 这里的值是是实际传递到后台的值。
	 * @type String
	 * @default ""
	 */
    value: "",
    /**
	 * 默认值
	 * @type String
	 * @default ""
	 */
    defaultValue: "",
    /**
	 * 组件宽度
	 * @type Number
	 * @default 125
	 */
    width: 125,
    /**
	 * 组件高度
	 * @type Number
	 * @default 21
	 */
    height: 21,
    /**
	 * 空值时的样式
	 */
    _emptyCls: "mini-textbox-empty",
    /**
	 * 获取焦点时的样式
	 */
    _focusCls: "mini-textbox-focus",
    /**
	 * 不可用样式
	 */
    _disabledCls: "mini-textbox-disabled",
    /**
	 * 组将样式类
	 * @type String
	 * @default "mini-textbox"
	 */
    uiCls: "mini-textbox",
    /**
	 * 输入框类型，包括两种选择"text","textarea"
	 * @default "text"
	 */
    _InputType: "text",

    /**
	 * 创建组件HTML结构，并绑定给组件实例。
	 * @default
	 */
    _create: function () {

        var html = '<input type="' + this._InputType + '" class="mini-textbox-input" autocomplete="off"/>';
        if (this._InputType == "textarea") {
            html = '<textarea class="mini-textbox-input" autocomplete="off"/></textarea>';
        }
        html = '<span class="mini-textbox-border">' + html + '</span>';
        html += '<input type="hidden"/>';

        this.el = document.createElement("span");
        this.el.className = "mini-textbox";
        this.el.innerHTML = html;

        this._borderEl = this.el.firstChild;
        this._textEl = this._borderEl.firstChild;
        this._valueEl = this.el.lastChild;

        this._doEmpty();

    },
    /**
	 * 设置组件初始化完成后的需要执行的回调函数。
	 * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
	 */
    _initEvents: function () {
        mini._BindEvents(function () {
            //我不清楚这是什么事件
            mini_onOne(this._textEl, "drop", this.__OnDropText, this);
            mini_onOne(this._textEl, "change", this.__OnInputTextChanged, this);
            mini_onOne(this._textEl, "focus", this.__OnFocus, this);
            mini_onOne(this.el, "mousedown", this.__OnMouseDown, this);

            var v = this.value;
            //原先是this.value=null,导致setValue方法中的if语句为真，改为“”，潘正锋 2013-05-06
            this.value = "";
            this.setValue(v);


        }, this);
        this.on("validation", this.__OnValidation, this);

    },
    /**
	 * 文本录入框的事件是否已经绑定。
	 */
    _inputEventsInited: false,
    /**
	 * 为录入框元素绑定默认事件
	 */
    _initInputEvents: function () {
        if (this._inputEventsInited)
            return;
        this._inputEventsInited = true;

        mini.on(this._textEl, "blur", this.__OnBlur, this);
        mini.on(this._textEl, "keydown", this.__OnInputKeyDown, this);
        mini.on(this._textEl, "keyup", this.__OnInputKeyUp, this);
        mini.on(this._textEl, "keypress", this.__OnInputKeyPress, this);
    },
    /**
	 * 析构函数
	 */
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onmousedown = null;
        }
        if (this._textEl) {
            this._textEl.ondrop = null;
            this._textEl.onchange = null;
            this._textEl.onfocus = null;
            
            this._textEl.placeholder = null;
            this._textEl.onpropertychange = null;
            if(this._textEl._placeholder_label){
                this._textEl._placeholder_label.onmousedown = null;
                this._textEl._placeholder_label.parentNode.removeChild(this._textEl._placeholder_label);
                this._textEl._placeholder_label = null;
            }

            mini.clearEvent(this._textEl);
            //内存泄露问题优化 赵美丹 2013-04-17
            this._textEl.parentNode.removeChild(this._textEl);

            this._textEl = null;
           
        }
        if (this._borderEl) {
            mini.clearEvent(this._borderEl);
            //内存泄露问题优化 赵美丹 2013-04-17
            this._borderEl.parentNode.removeChild(this._borderEl);
            this._borderEl = null;
        }
        if (this._valueEl) {
            mini.clearEvent(this._valueEl);
            //内存泄露问题优化 赵美丹 2013-04-17
            this._valueEl.parentNode.removeChild(this._valueEl);
            this._valueEl = null;
        }
        if (this._errorIconEl) {
            mini.clearEvent(this._errorIconEl);
            //内存泄露问题优化 赵美丹 2013-04-17
            this._errorIconEl.parentNode.removeChild(this._errorIconEl);
            this._errorIconEl = null;
        }
        
        mini.TextBox.superclass.destroy.call(this, removeEl);
    },
    /**
	 * 调整组件布局。
	 */
    doLayout: function () {


    },
    /**
	 * 设置Height，为textarea模式时有效
	 * @param value {Number}
	 */
    setHeight: function (value) {
        if (parseInt(value) == value)
            value += "px";
        this.height = value;
        if (this._InputType == "textarea") {
            this.el.style.height = value;
            this.doLayout();
        }
    },
    /**
	 * 设置组件name属性
	 * @param value {String}
	 */
    setName: function (value) {
        if (this.name != value) {
            this.name = value;
            if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);

        }
    },
    /**
	 * 设置值
	 * @param value {String}
	 */
    setValue: function (value) {
        if (value === null || value === undefined)
            value = "";
        value = String(value);
        if (value.length > this.maxLength) {
            value = value.substring(0, this.maxLength);
        }
        if (this.value !== value) {
            this.value = value;
            this._valueEl.value = this._textEl.value = value;
            this._doEmpty();

            //解决setValue不触发valuechanged事件的问题 赵美丹 2012-01-17
            this._OnValueChanged();
        }
    },
    /**
	 * 获取值
	 * @returns value {String}
	 */
    getValue: function () {

        return this.value;
    },
    /**
	 * 获取表单值
	 * @returns value {String}
	 */
    getFormValue: function () {
        value = this.value;
        if (value === null || value === undefined)
            value = "";
        return String(value);
    },
    /**
	 * 设置是否可录入开关属性
	 * @param value {Boolean}
	 */
    setAllowInput: function (value) {
        if (this.allowInput != value) {
            this.allowInput = value;
            this.doUpdate();
        }
    },
    /**
	 * 获取是否可录入开关属性值
	 * @returns value {Boolean}
	 */
    getAllowInput: function () {
        return this.allowInput;
    },
    _placeholdered: false,
    /**
	 * 设置录入框为空时的样式
	 */
    _doEmpty: function () {
        this._textEl.placeholder = this.emptyText;
        if (this.emptyText) {
            mini._placeholder(this._textEl);
        }

    },
    /**
	 * 设置值为空时的文本。
	 * @param value {String}
	 */
    setEmptyText: function (value) {
        if (this.emptyText != value) {
            this.emptyText = value;
            this._doEmpty();
        }
    },
    /**
	 * 获取值为空时的文本
	 * @returns emptyText {String}
	 */
    getEmptyText: function () {
        return this.emptyText;
    },
    /**
	 * 设置最大可录入长度
	 * @param value {Number}
	 */
    setMaxLength: function (value) {
        this.maxLength = value;

        mini.setAttr(this._textEl, "maxLength", value);
        //textarea模式时不支持maxLength ，需要借助事件来完整。
        if (this._InputType == "textarea" && mini.isIE) {
            mini.on(this._textEl, "keypress", this.__OnMaxLengthKeyUp, this);
        }
    },
    /**
	 * 用于限定用户录入文本数目的时间相应函数。
	 */
    __OnMaxLengthKeyUp: function (e) {
        if (this._textEl.value.length >= this.maxLength) {
            e.preventDefault();
        }
    },
    /**
	 * 获取最大可录入长度
	 * @returns value {Number}
	 */
    getMaxLength: function () {
        return this.maxLength;
    },
    /**
	 * 设置是否只读
	 * @param value {Boolean}
	 */
    setReadOnly: function (value) {
        if (this.readOnly != value) {
            this.readOnly = value;
            this.doUpdate();
        }
    },
    /**
	 * 设置是否可用
	 * @param value {Boolean}
	 */
    setEnabled: function (value) {
        if (this.enabled != value) {
            this.enabled = value;
            this.doUpdate();
            this._tryValidate();
        }
    },
    /**
	 * 更新组件是否可用，是否必录，是否只读等样式
	 */
    doUpdate: function () {
        if (this.enabled) {
            this.removeCls(this._disabledCls);
        } else {
            this.addCls(this._disabledCls);
        }
        if (this.isReadOnly() || this.allowInput == false) {
            this._textEl.readOnly = true;
            mini.addClass(this.el, "mini-textbox-readOnly");
        } else {

            this._textEl.readOnly = false;
            mini.removeClass(this.el, "mini-textbox-readOnly");
        }
        if (this.required) {
            this.addCls(this._requiredCls);
        } else {
            this.removeCls(this._requiredCls);
        }

        if (this.enabled) {
            this._textEl.disabled = false;
        } else {
            this._textEl.disabled = true;
        }
    },
    /**
	 * 使组件获取焦点
	 */
    focus: function () {
        try {
            this._textEl.focus();
        } catch (e) {
        }
    },
    /**
	 * 使组件失去焦点
	 */
    blur: function () {
        try {
            this._textEl.blur();
        } catch (e) {
        }
    },
    /**
	 * 选中文本
	 */
    selectText: function () {
        var me = this;
        function doSelect() {
            try {
                me._textEl.select();
            } catch (ex) { }
        }
        doSelect();
        setTimeout(function () {
            doSelect();
        }, 30);
    },
    /**
	 * 获取录入框元素
	 * @returns {Object}
	 */
    getTextEl: function () {
        return this._textEl;
    },
    getInputText: function () {
        return this._textEl.value;
    },
    /**
	 * 置获取焦点时是否自动选中文本
	 * @param value {Boolean} true/false
	 */
    setSelectOnFocus: function (value) {
        this.selectOnFocus = value;
    },
    /**
	 * 获取，获取焦点时是否自动选中文本
	 * @returns {Boolean} true/false
	 */
    getSelectOnFocus: function (value) {
        return this.selectOnFocus;
    },
    _errorIconEl: null,

    /**
	 * 获取错误图标元素
	 * @returns DOMObject
	 */
    getErrorIconEl: function () {
        if (!this._errorIconEl) {
            this._errorIconEl = mini.append(this.el, '<span class="mini-errorIcon"></span>');
        }
        return this._errorIconEl;
    },
    /**
	 * 删除错误图标元素
	 */
    _RemoveErrorIcon: function () {
        if (this._errorIconEl) {
            var el = this._errorIconEl;
            jQuery(el).remove();
        }
        this._errorIconEl = null;
    },
    /**
	 * 默认鼠标左键按下事件的响应函数
	 */
    __OnMouseDown: function (e) {

        var sf = this;
        if (!mini.isAncestor(this._textEl, e.target)) {
            setTimeout(function () {
                sf.focus();
                mini.selectRange(sf._textEl, 1000, 1000);
            }, 1);
        } else {
            setTimeout(function () {
                try {
                    sf._textEl.focus();
                } catch (ex) {
                }
            }, 1);
        }
    },
    /**
	 * change事件的默认响应函数。
	 */
    __OnInputTextChanged: function (e, valid) {

        var value = this.value;
        this.setValue(this._textEl.value);

        if (value !== this.getValue() || valid === true) {
            //触发用户自定义的change响应函数
            //解决setValue不触发valuechanged事件的问题(该方法修改至setValue中) 赵美丹 2012-01-17
            //this._OnValueChanged();
        }
    },
    __OnDropText: function (e) {
        var me = this;
        setTimeout(function () {
            me.__OnInputTextChanged(e);
        }, 0);
    },
    __OnInputKeyDown: function (e) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);

        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }
        if (e.keyCode == 13 || e.keyCode == 9) {

            if (this._InputType == "textarea" && e.keyCode == 13) {
            }
            else {
                this.__OnInputTextChanged(null, true);
                if (e.keyCode == 13) {
                    var me = this;

                    me.fire("enter", ex);

                }
            }

        }
        if (e.keyCode == 27) {
            e.preventDefault();
        }
    },
    __OnInputKeyUp: function (e) {
        this.fire("keyup", {
            htmlEvent: e
        });
    },
    __OnInputKeyPress: function (e) {
        this.fire("keypress", {
            htmlEvent: e
        });
    },
    /**
	 * 默认获取焦点事件响应函数
	 */
    __OnFocus: function (e) {

        this.doUpdate();

        if (this.isReadOnly()) {
            return;
        }
        this._focused = true;
        this.addCls(this._focusCls);
        //获取焦点时为输入框绑定事件。
        this._initInputEvents();
         
        if (this.selectOnFocus) {
            this.selectText();
        }
        this.fire("focus", {
            htmlEvent: e
        });
    },
    /**
	 * 默认失去焦点事件响应函数
	 */
    __OnBlur: function (e) {

        this._focused = false;
        var sf = this;
        setTimeout(function () {
            if (sf._focused == false) {
                sf.removeCls(sf._focusCls);
            }
        }, 2);
       
        this.fire("blur", {
            htmlEvent: e
        });
        if (this.validateOnLeave) {
            this._tryValidate();
        }
    },
    inputStyle: "",
    setInputStyle: function (value) {
        this.inputStyle = value;
        mini.setStyle(this._textEl, value);
    },
    /**
	 * 用于从HTML标签中提取配置参数的方法。在此方法中有对 value， text， emptyText， onenter，
	 * onkeydown， onkeyup， onkeypress， maxLengthErrorText， minLengthErrorText，
	 *  vtype， emailErrorText， urlErrorText，floatErrorText，intErrorText，
	 * dateErrorText，minErrorText，maxErrorText，rangeLengthErrorText，rangeErrorText，
	 * rangeCharErrorText，allowInput，selectOnFocus，maxLength，minLength，minHeight 等属性做提取。
	 * @param el {Object} DOM元素
	 * @returns {Object} JSON对象
	 */
    getAttrs: function (el) {
        var attrs = mini.TextBox.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);
        /**
		 * onenter 事件当回车键按下时触发<br/>
		 * 通过在html标签声明。
		 * @name onenter
		 * @event
		 * @memberOf mini.TextBox.prototype
		 */

        /**
		 * onkeydown 事件当用户放开按键时触发<br/>
		 * 通过在html标签声明。
		 * @name onkeydown
		 * @event
		 * @memberOf mini.TextBox.prototype
		 */

        /**
		 * onkeyup 事件当键盘按键抬起时触发<br/>
		 * 通过在html标签声明。
		 * @name onkeyup
		 * @event
		 * @memberOf mini.TextBox.prototype
		 */

        /**
		 * onkeypress 事件当按下并放开任何字母数字键时触发<br/>
		 * 通过在html标签声明。
		 * @name onkeypress
		 * @event
		 * @memberOf mini.TextBox.prototype
		 */
        mini._ParseString(el, attrs,
            ["value", "text", "emptyText", "inputStyle",
            "onenter", "onkeydown", "onkeyup", "onkeypress",
            "maxLengthErrorText", "minLengthErrorText", "onfocus", "onblur",

            "vtype",
            "emailErrorText", "urlErrorText", "floatErrorText", "intErrorText", "dateErrorText",
            "minErrorText", "maxErrorText", "rangeLengthErrorText", "rangeErrorText", "rangeCharErrorText"
            ]
        );


        mini._ParseBool(el, attrs,
		     ["allowInput", "selectOnFocus"
		]
		);
        mini._ParseInt(el, attrs,
		     ["maxLength", "minLength", "minHeight", "minWidth"
		]
		);

        return attrs;
    },
    /**
	 * 验证规则，目前mini UI支持的默认验证规则请参见 mini.VTypes 对象
	 * @type String
	 * @default ""
	 */
    vtype: "",
    /**
	 * 设置属性vtype的值
	 * @param value {String}
	 */
    setVtype: function (value) {
        this.vtype = value;
    },
    /**
	 * 获取属性vtype的值
	 * @return {String}
	 */
    getVtype: function () {
        return this.vtype;
    },
    /**
	 * 默认的 validation 事件响应函数
	 */
    __OnValidation: function (e) {

        if (e.isValid == false)
            return;
        mini._ValidateVType(this.vtype, e.value, e, this);
    },
    /**
	 * 设置 Email 格式验证错误提示信息
	 * @param value {String}
	 */
    setEmailErrorText: function (value) {
        /**
		 * 自定义Email 格式验证错误提示信息
		 * @name emailErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.emailErrorText = value;
    },
    /**
	 * 获取 Email 格式验证错误提示信息
	 * @return {String}
	 */
    getEmailErrorText: function () {
        return this.emailErrorText;
    },
    /**
	 * 设置 url 格式验证错误提示信息
	 * @param value {String}
	 */
    setUrlErrorText: function (value) {
        /**
		 * 自定义 url 格式验证错误提示信息
		 * @name urlErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.urlErrorText = value;
    },
    /**
	 * 获取 url 格式验证错误提示信息
	 * @return {String}
	 */
    getUrlErrorText: function () {
        return this.urlErrorText;
    },
    /**
	 * 设置 浮点数 验证错误提示信息
	 * @param value {String}
	 */
    setFloatErrorText: function (value) {
        /**
		 * 自定义 浮点数 格式验证错误提示信息
		 * @name floatErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.floatErrorText = value;
    },
    /**
	 * 获取 浮点数 验证错误提示信息
	 * @return {String}
	 */
    getFloatErrorText: function () {
        return this.floatErrorText;
    },
    /**
	 * 设置 整数 验证错误提示信息
	 * @param value {String}
	 */
    setIntErrorText: function (value) {
        /**
		 * 自定义 整数 格式验证错误提示信息
		 * @name intErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.intErrorText = value;
    },
    /**
	 * 获取 整数 验证错误提示信息
	 * @return {String}
	 */
    getIntErrorText: function () {
        return this.intErrorText;
    },
    /**
	 * 设置 日期 验证错误提示信息
	 * @param value {String}
	 */
    setDateErrorText: function (value) {
        /**
		 * 自定义 日期 格式验证错误提示信息
		 * @name dateErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.dateErrorText = value;
    },
    /**
	 * 获取 日期 格式验证错误提示信息
	 * @return {String}
	 */
    getDateErrorText: function () {
        return this.dateErrorText;
    },
    /**
	 * 设置 最大长度 验证错误提示信息
	 * @param value {String}
	 */
    setMaxLengthErrorText: function (value) {
        /**
		 * 自定义 最大长度 验证错误提示信息
		 * @name maxLengthErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.maxLengthErrorText = value;
    },
    /**
	 * 获取 最大长度验证错误提示信息
	 * @return {String}
	 */
    getMaxLengthErrorText: function () {
        return this.maxLengthErrorText;
    },
    /**
	 * 设置最小长度 验证错误提示信息
	 * @param value {String}
	 */
    setMinLengthErrorText: function (value) {
        /**
		 * 自定义 最小长度 验证错误提示信息
		 * @name minLengthErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.minLengthErrorText = value;
    },
    /**
	 * 获取 最小长度验证错误提示信息
	 * @return {String}
	 */
    getMinLengthErrorText: function () {
        return this.minLengthErrorText;
    },
    /**
	 * 设置最大值 验证错误提示信息
	 * @param value {String}
	 */
    setMaxErrorText: function (value) {
        /**
		 * 自定义 最大值 验证错误提示信息
		 * @name maxErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.maxErrorText = value;
    },
    /**
	 * 获取最大值验证错误提示信息
	 * @return {String}
	 */
    getMaxErrorText: function () {
        return this.maxErrorText;
    },
    /**
	 * 设置最小值 验证错误提示信息
	 * @param value {String}
	 */
    setMinErrorText: function (value) {
        /**
		 * 自定义 最小值 验证错误提示信息
		 * @name minErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.minErrorText = value;
    },
    /**
	 * 获取 最小值验证错误提示信息
	 * @return {String}
	 */
    getMinErrorText: function () {
        return this.minErrorText;
    },
    /**
	 * 设置录入字符串长度区间 验证错误提示信息
	 * @param value {String}
	 */
    setRangeLengthErrorText: function (value) {
        /**
		 * 自定义 录入字符串长度区间 验证错误提示信息
		 * @name rangeLengthErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.rangeLengthErrorText = value;
    },
    /**
	 * 获取 录入字符串长度区间验证错误提示信息
	 * @return {String}
	 */
    getRangeLengthErrorText: function () {
        return this.rangeLengthErrorText;
    },
    /**
	 * 设置录入内容字符个数区间 验证错误提示信息
	 * @param value {String}
	 */
    setRangeCharErrorText: function (value) {
        /**
		 * 自定义 录入内容字符个数区间 验证错误提示信息
		 * @name rangeCharErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.rangeCharErrorText = value;
    },
    /**
	 * 获取 内容字符个数区间验证错误提示信息
	 * @return {String}
	 */
    getRangeCharErrorText: function () {
        return this.rangeCharErrorText;
    },
    /**
	 * 设置值区间验证错误提示信息
	 * @param value {String}
	 */
    setRangeErrorText: function (value) {
        /**
		 * 自定义 值区间 验证错误提示信息
		 * @name rangeErrorText
		 * @type String
		 * @memberOf mini.TextBox.prototype
		 */
        this.rangeErrorText = value;
    },
    /**
	 * 获取 值区间验证错误提示信息
	 * @return {String}
	 */
    getRangeErrorText: function () {
        return this.rangeErrorText;
    }
});

mini.regClass(mini.TextBox, 'textbox');