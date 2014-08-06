/**
 * 文件定义了右侧带按钮的输入框组件。
 * @fileOverview ButtonEdit.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * ButtonEdit 是mini UI中的带按钮的输入框组件，构造函数中调用了 ValidatorBase 方法，并对组件初始状态做了设置。
 * @class mini.ButtonEdit
 * @constructor
 * @extends mini.ValidatorBase
 * @requires mini.Tooltip
 * @requires mini.ValidatorBase
 */
mini.ButtonEdit = function () {

    mini.ButtonEdit.superclass.constructor.call(this);


    var isReadOnly = this.isReadOnly();
    if (isReadOnly || this.allowInput == false) {
        this._textEl.readOnly = true;
    }
    if (this.enabled == false) {
        this.addCls(this._disabledCls);
    }
    if (isReadOnly) {
        this.addCls(this._readOnlyCls);
    }
    if (this.required) {
        this.addCls(this._requiredCls);
    }
}
mini.extend(mini.ButtonEdit, mini.ValidatorBase, {
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
    /**
	 * 是否显示清空按钮
	 * @type String
	 * @default ""
	 */
    showClose: false,

    emptyText: "",
    /**
	 * 默认值
	 * @type String
	 * @default ""
	 */
    defaultValue: "",
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

    maxLength: 1000,
    minLength: 0,

    width: 125,
    height: 21,
    //增加分割符号 潘正锋 2013
    delimiter: ',',

    inputAsValue: false,

    allowInput: true,
    _noInputCls: "mini-buttonedit-noInput",
    _readOnlyCls: "mini-buttonedit-readOnly",
    _disabledCls: "mini-buttonedit-disabled",

    _emptyCls: "mini-buttonedit-empty",
    _focusCls: "mini-buttonedit-focus",


    _buttonCls: "mini-buttonedit-button",
    _buttonHoverCls: "mini-buttonedit-button-hover",
    _buttonPressedCls: "mini-buttonedit-button-pressed",

    _closeCls: "mini-buttonedit-close",
    //增加配置项，日历控件中有timeSpinner，会显示 潘正锋 2013-06-05
    showToolTip : true,

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var value = kv.value;
        delete kv.value;
        var text = kv.text;
        delete kv.text;

        this._allowUpdate = !(kv.enabled == false || kv.allowInput == false || kv.readOnly);

        mini.ButtonEdit.superclass.set.call(this, kv);

        if (this._allowUpdate === false) {
            this._allowUpdate = true;
            this.doUpdate();
        }

        if (!mini.isNull(text)) {
            this.setText(text);
        }
        if (!mini.isNull(value)) {
            this.setValue(value);
        }
        //修正showClose在没有配置的时候不调用 潘正锋 2013-05-06
        if (!kv.showClose) {
            this.setShowClose(this.showClose);
        }
        //增加showToolTip配置
        if (!kv.showToolTip)
            this.setShowToolTip(this.showToolTip);
        return this;
    },
    uiCls: "mini-buttonedit",
    /**
	 * 组织组件HTML结构字符串
	 * @returns 组件HTML结构字符串
	 */
    _getButtonsHTML: function () {
        var s = '<span class="mini-buttonedit-close"></span>' + this._getButtonHtml();
        return '<span class="mini-buttonedit-buttons">' + s + '</span>';
    },
    _getButtonHtml: function () {
        var hover = 'onmouseover="mini.addClass(this, \'' + this._buttonHoverCls + '\');" '
                        + 'onmouseout="mini.removeClass(this, \'' + this._buttonHoverCls + '\');"';
        return '<span class="mini-buttonedit-button" ' + hover + '><span class="mini-buttonedit-icon"></span></span>';
    },
    /**
	 * 创建组件HTML结构，并绑定给组件实例。
	 * @default
	 */
    _create: function () {
        this.el = document.createElement("span");
        this.el.className = "mini-buttonedit";

        var s = this._getButtonsHTML();
        this.el.innerHTML = '<span class="mini-buttonedit-border"><input type="input" class="mini-buttonedit-input" autocomplete="off"/>'
                            + s + '</span><input name="' + this.name + '" type="hidden"/>'

        this._borderEl = this.el.firstChild;
        this._textEl = this._borderEl.firstChild;
        this._valueEl = this.el.lastChild;

        this._buttonsEl = this._borderEl.lastChild;
        this._buttonEl = this._buttonsEl.lastChild;
        this._closeEl = this._buttonEl.previousSibling;

        this._doEmpty();
       
        
    },
    _addTooltip: function (el) {
        //解决鼠标浮动在按钮上时影响浮动信息的显示 赵美丹 2013-03-29
        this.tooltip = new mini.Tooltip(this._textEl);
        this.tooltip.setSource(this._textEl);
        this.tooltip.setAttr('value');
        this.tooltip.setAttrDelimiter(this.delimiter);
    },
    //内存泄露问题优化 赵美丹 2013-04-17
    _destroyTooltip: function (removeEl) {
        if (this.tooltip) {
            mini.clearEvent(this.tooltip);
            this.tooltip.destroy(removeEl);
            this.tooltip = null;
        }
    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onmousedown = null;
            this.el.onmousewheel = null;
            this.el.onmouseover = null;
            this.el.onmouseout = null;
        }
        //内存泄露问题优化 赵美丹 2013-04-17
        this._destroyTooltip(removeEl);
        if (this._textEl) {
            this._textEl.readOnly = null;
            
            this._textEl.onchange = null;
            this._textEl.onfocus = null;
            //tooltip 潘正锋 2013-05-06
            this._textEl.onmouseover = null;
            this._textEl.onmouseout = null;
            
            this._textEl.placeholder = null;
            this._textEl.onpropertychange = null;
            if(this._textEl._placeholder_label){
                this._textEl._placeholder_label.onmousedown = null;
                this._textEl._placeholder_label.parentNode.removeChild(this._textEl._placeholder_label);
                this._textEl._placeholder_label = null;
            }
            
            mini.clearEvent(this._textEl);
            this._textEl.parentNode.removeChild(this._textEl);
            this._textEl = null;
        }

        if (this._buttonEl) {
            this._buttonEl.onmouseover = null;
            this._buttonEl.onmouseout = null;
            mini.clearEvent(this._buttonEl);

            this._buttonEl.parentNode.removeChild(this._buttonEl);
            this._buttonEl = null;
        }
        if (this._closeEl) {
            this._closeEl.onclick = null;
            mini.clearEvent(this._closeEl);

            this._closeEl.parentNode.removeChild(this._closeEl);
            this._closeEl = null;
        }
        if (this._buttonsEl) {
            mini.clearEvent(this._buttonsEl);

            this._buttonsEl.parentNode.removeChild(this._buttonsEl);
            this._buttonsEl = null;
        }
        if (this._borderEl) {
            mini.clearEvent(this._borderEl);

            this._borderEl.parentNode.removeChild(this._borderEl);
            this._borderEl = null;
        }
        if (this._valueEl) {
            mini.clearEvent(this._valueEl);
            this._valueEl.parentNode.removeChild(this._valueEl);
            this._valueEl = null;
        }
        mini.ButtonEdit.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, "mousedown", this.__OnMouseDown, this);
            mini_onOne(this._textEl, "focus", this.__OnFocus, this);
            mini_onOne(this._textEl, "change", this.__OnInputTextChanged, this);
            mini_onOne(this._closeEl, "click", this._onClearClick, this);

          

            var v = this.text;
            this.text = null;
            this.setText(v);

        }, this);

    },
  
    //潘正锋 时间 2013-03-08
    _onClearClick: function () {
        //解决组件disabled后仍可点击清空按钮的问题 赵美丹 2013-05-16
        if(!this.enabled)
            return;
        this.setValue("");
        //清空 潘正锋 2013-5-3
        this.setText("");
    },
    
    _inputEventsInited: false,
    /**
	 * 输入框元素事件初始化方法。
	 */
    _initInputEvents: function () {
        if (this._inputEventsInited) return;
        this._inputEventsInited = true;

        mini.on(this.el, "click", this.__OnClick, this);
        mini.on(this._textEl, "blur", this.__OnBlur, this);
        mini.on(this._textEl, "keydown", this.__OnInputKeyDown, this);
        mini.on(this._textEl, "keyup", this.__OnInputKeyUp, this);
        mini.on(this._textEl, "keypress", this.__OnInputKeyPress, this);
    },
    _buttonWidth: 20,
    _closeWidth: 20,

    /**
	 * 调整组件布局
	 */
    _doInputLayout: function () {
       
        this.doLayout();
    },
    doLayout: function () {
        //当值为空时，不显示清空按钮 潘正锋 2013-05-09
        if (this.showClose) {
            if (this.value)
                this._closeEl.style.display = 'inline-block';
            else
                this._closeEl.style.display = 'none';
        }
        var w = this._buttonsEl.offsetWidth + 2;

        this._borderEl.style["paddingRight"] = w + "px";
    },
    setHeight: function (value) {
        if (parseInt(value) == value) value += "px";
        this.height = value;

    },
    focus: function () {
        //解决组件disable时无法focus报错问题（try..catch对setTimout内部代码不起作用） 赵美丹 2013-05-16
        if(this.enabled == false)
            return;
        try {
            this._textEl.focus();
            var sf = this;
            setTimeout(function () {
                if (sf._focused) {
                    sf._textEl.focus();
                }

            }, 10);
        } catch (e) {
        }
    },
    blur: function () {
        try {
            this._textEl.blur();

        } catch (e) {
        }
    },
    selectText: function () {
        this._textEl.select();
    },

    getTextEl: function () {
        return this._textEl;
    },
    setName: function (value) {
        this.name = value;

        if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);
    },
    setText: function (value) {

        if (value === null || value === undefined) value = "";
        var fire = this.text !== value;
        this.text = value;
        this._textEl.value = value;

        this._doEmpty();
    },
    getText: function () {
        var text = this._textEl.value;
        return text;

    },

    setValue: function (value) {
        var v = this.getValue();
        if (value === null || value === undefined) value = "";
        var fire = this.value !== value;
        this.value = value;
        this._valueEl.value = this.getFormValue();
       
        //valuechanged事件改到setValue中触发，解决setValue不触发valuechanged事件的问题 赵美丹 2013-03-19
        if (!mini.isEquals(this.value, v)) {
            this._OnValueChanged();
        }
    },
    setShowToolTip: function(value){
        this.showToolTip = value;
        //TODO 这里为ButtonEidt增加文本提示功能，当文本框中内容超长时提升用户体验。殷文旭 时间 2012-11-08
        if (this.showToolTip)
            this._addTooltip(this.el);
    },
    _OnValueChanged: function () {
        //当值变化后，调整清空按钮的显示状态 潘正锋 
        mini.ButtonEdit.superclass._OnValueChanged.call(this);
        this._doInputLayout();
    },
    getValue: function () {
        return this.value;
    },
    getFormValue: function () {
        value = this.value;
        if (value === null || value === undefined) value = "";
        return String(value);
    },

    _doEmpty: function () {
        this._textEl.placeholder = this.emptyText;
        if (this.emptyText) {
            mini._placeholder(this._textEl);
        }

    },
    setEmptyText: function (value) {
        if (this.emptyText != value) {
            this.emptyText = value;
            this._doEmpty();
        }
    },
    getEmptyText: function () {
        return this.emptyText;
    },

    setMaxLength: function (value) {
        value = parseInt(value);
        if (isNaN(value)) return;
        this.maxLength = value;
        this._textEl.maxLength = value;
    },
    getMaxLength: function () {
        return this.maxLength;
    },
    setMinLength: function (value) {
        value = parseInt(value);
        if (isNaN(value)) return;
        this.minLength = value;
    },
    getMinLength: function () {
        return this.minLength;
    },
    setEnabled: function (value) {
        mini.ButtonEdit.superclass.setEnabled.call(this, value);

        this._tryValidate();
    },
    _doReadOnly: function () {
        var readOnly = this.isReadOnly();
        if (readOnly || this.allowInput == false) {
            this._textEl.readOnly = true;
        } else {
            this._textEl.readOnly = false;
        }
        if (readOnly) {
            this.addCls(this._readOnlyCls);
        } else {
            this.removeCls(this._readOnlyCls);
        }
        if (this.allowInput) {
            this.removeCls(this._noInputCls);
        } else {
            this.addCls(this._noInputCls);
        }

        if (this.enabled) {
            this._textEl.disabled = false;
        } else {
            this._textEl.disabled = true;
        }
    },
    setAllowInput: function (value) {
        this.allowInput = value;
        this._doReadOnly();
    },
    getAllowInput: function () {
        return this.allowInput;
    },
    setInputAsValue: function (value) {
        this.inputAsValue = value;
    },
    getInputAsValue: function () {
        return this.inputAsValue;
    },




    _errorIconEl: null,
    getErrorIconEl: function () {
        if (!this._errorIconEl) {
            this._errorIconEl = mini.append(this.el, '<span class="mini-errorIcon"></span>');
        }
        return this._errorIconEl;
    },
    _RemoveErrorIcon: function () {
        if (this._errorIconEl) {
            var el = this._errorIconEl;
            jQuery(el).remove();
        }
        this._errorIconEl = null;
    },

    __OnClick: function (e) {
        if (this.isReadOnly() || this.enabled == false) return;

        if (!mini.isAncestor(this._borderEl, e.target)) return;

        var t = new Date();

        if (mini.isAncestor(this._buttonEl, e.target)) {
            this._OnButtonClick(e);
        }
        if (mini.findParent(e.target, this._closeCls)) {
            this.fire("closeclick", { htmlEvent: e });
        }

    },
    __OnMouseDown: function (e) {

        if (this.isReadOnly() || this.enabled == false) return;

        if (!mini.isAncestor(this._borderEl, e.target)) return;

        if (!mini.isAncestor(this._textEl, e.target)) {
            this._clickTarget = e.target;
            var sf = this;
            setTimeout(function () {
                sf.focus();
                mini.selectRange(sf._textEl, 1000, 1000);
            }, 1);
            if (mini.isAncestor(this._buttonEl, e.target)) {
                var up = mini.findParent(e.target, "mini-buttonedit-up");
                var down = mini.findParent(e.target, "mini-buttonedit-down");
                if (up) {
                    mini.addClass(up, this._buttonPressedCls);
                    this._OnButtonMouseDown(e, "up");
                }
                else if (down) {
                    mini.addClass(down, this._buttonPressedCls);
                    this._OnButtonMouseDown(e, "down");
                } else {
                    mini.addClass(this._buttonEl, this._buttonPressedCls);
                    this._OnButtonMouseDown(e);
                }
                mini.on(document, "mouseup", this.__OnDocMouseUp, this);
            }
        }
    },
    __OnDocMouseUp: function (e) {
        this._clickTarget = null;

        var me = this;
        setTimeout(function () {
            var doms = me._buttonEl.getElementsByTagName("*");
            for (var i = 0, l = doms.length; i < l; i++) {
                mini.removeClass(doms[i], me._buttonPressedCls);
            }
            mini.removeClass(me._buttonEl, me._buttonPressedCls);
            mini.removeClass(me.el, me._pressedCls);
        }, 80);
        mini.un(document, "mouseup", this.__OnDocMouseUp, this);
    },
    __OnFocus: function (e) {

        this.doUpdate();
        this._initInputEvents();
        if (this.isReadOnly()) return;

        this._focused = true;
        this.addCls(this._focusCls);



        if (this.selectOnFocus) {
            this.selectText();
        }
        this.fire("focus", { htmlEvent: e });
    },
    __doFocusCls: function () {
        if (this._focused == false) {
            this.removeCls(this._focusCls);
        }
    },

    __fireBlur: function (e) {


        this._focused = false;
        var sf = this;

        function f() {
            sf.__doFocusCls();


        }
        setTimeout(function () {
            f.call(sf);
        }, 2);

        this.fire("blur", { htmlEvent: e });
    },
    __OnBlur: function (e) {
        this._focused = false;

        var me = this;
        setTimeout(function () {
            me.__fireBlur(e);
        }, 10);
    },
    __OnInputKeyDown: function (e) {
        var ex = { htmlEvent: e };
        this.fire("keydown", ex);
        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }
        if (e.keyCode == 13 || e.keyCode == 9) {
            var sf = this;
            sf.__OnInputTextChanged(null);
            if (e.keyCode == 13) {
                var me = this;

                me.fire("enter", ex);

            }
        }
        if (e.keyCode == 27) {
            e.preventDefault();
        }
    },
    __OnInputTextChanged: function () {

        var v = this._textEl.value;
        var value = this.getValue();

        this.setValue(v);
        //valuechanged事件改到setValue中触发，解决setValue不触发valuechanged事件的问题 赵美丹 2013-03-19
        /*if (value !== this.getFormValue()) {
            this._OnValueChanged();
        }*/

    },
    __OnInputKeyUp: function (e) {
        this.fire("keyup", { htmlEvent: e });
    },
    __OnInputKeyPress: function (e) {
        this.fire("keypress", { htmlEvent: e });
    },

    _OnButtonClick: function (htmlEvent) {
        var e = {
            htmlEvent: htmlEvent,
            cancel: false
        };
        this.fire("beforebuttonclick", e);
        if (e.cancel == true) return;

        this.fire("buttonclick", e);
    },
    _OnButtonMouseDown: function (htmlEvent, spinType) {
        this.focus();
        this.addCls(this._focusCls);

        this.fire("buttonmousedown", {
            htmlEvent: htmlEvent,
            spinType: spinType
        });
    },

    onButtonClick: function (fn, scope) {
        this.on("buttonclick", fn, scope);
    },
    onButtonMouseDown: function (fn, scope) {
        this.on("buttonmousedown", fn, scope);
    },
    onTextChanged: function (fn, scope) {
        this.on("textchanged", fn, scope);
    },

    textName: "",
    setTextName: function (value) {
        this.textName = value;
        if (this._textEl) mini.setAttr(this._textEl, "name", this.textName);
    },
    getTextName: function () {
        return this.textName;
    },

    setSelectOnFocus: function (value) {
        this.selectOnFocus = value;
    },
    getSelectOnFocus: function (value) {
        return this.selectOnFocus;
    },
    setShowClose: function (value) {
        this.showClose = value;
    },
    getShowClose: function (value) {
        return this.showClose;
    },
    inputStyle: "",
    setInputStyle: function (value) {
        this.inputStyle = value;
        mini.setStyle(this._textEl, value);
    },

    getAttrs: function (el) {
        var attrs = mini.ButtonEdit.superclass.getAttrs.call(this, el);
        var jq = jQuery(el);

        mini._ParseString(el, attrs,
            ["value", "text", "textName", "emptyText", "inputStyle",
            "onenter", "onkeydown", "onkeyup", "onkeypress",
            "onbuttonclick", "onbuttonmousedown", "ontextchanged", "onfocus", "onblur",
            "oncloseclick"
            ]
        );
        mini._ParseBool(el, attrs,
            ["allowInput", "inputAsValue", "selectOnFocus", "showClose", "showToolTip"
            ]
        );
        mini._ParseInt(el, attrs,
            ["maxLength", "minLength"
            ]
        );

        return attrs;
    }
});
mini.regClass(mini.ButtonEdit, 'buttonedit');
