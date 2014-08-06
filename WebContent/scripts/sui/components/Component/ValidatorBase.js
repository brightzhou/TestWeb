/**
 * 定义了需要验证功能组件的基类
 * @fileOverview ValidatorBase.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * ValidatorBase 是mini UI中的部分支持验证功能组件的基类，构造函数中调用了Control方法
 * @class mini.ValidatorBase
 * @constructor
 * @extends mini.Control
 * @requires mini.Control
 */
mini.ValidatorBase = function () {
    mini.ValidatorBase.superclass.constructor.call(this);    
}
mini.extend(mini.ValidatorBase, mini.Control, /** @lends mini.ValidatorBase.prototype */{
    
    /**
     * 非空校验开关
     * @type Boolean
     * @default false
     */
    required: false,
    /**
     * 非空验证错误提示信息，支持标签配置
     * @type String
     * @default "This field is required."
     */
    requiredErrorText: "This field is required.",
    /**
     * 必录样式
     * @type String
     * @default "mini-required"
     */
    _requiredCls: "mini-required",
	/**
	 * 自定义错误提示信息
	 * @type String
	 * @default ""
	 */
    errorText: "",
    /**
     * 错误样式
     * @default "mini-error"
     */
    _errorCls: "mini-error",
    /**
     * border错误模式下的错误提示样式
     * @default "mini-invalid"
     */
    _invalidCls: "mini-invalid", 
	/**
	 * 错误提示模式 ，目前支持三种  “icon”，“border”，“none”。支持标签配置
	 * @type String
	 * @default "icon"
	 */
    errorMode: "icon",
    /**
     * 当值改变后是否重新验证，支持标签配置
     * @type Boolean
     * @default true
     */      
    validateOnChanged: true,
    validateOnLeave: true,

    /**
     * 是否验证通过标志
     * @default true
     */
    _IsValid: true,
    _tryValidate: function () {
        if (this._tryValidateTimer) clearTimeout(this._tryValidateTimer);
        var me = this;
        this._tryValidateTimer = setTimeout(function () {
            me.validate();
        }, 30);
    },

	/**
	 * 校验方法
	 * @return {Boolean} 验证结果
	 */
    validate: function () {
        //解决组件隐藏后仍被校验的问题 赵美丹 2013-05-15
        if (this.enabled == false || !this.isDisplay()) {
            this.setIsValid(true);
            return true;
        }

        var e = {
            value: this.getValue(),
            errorText: "",
            isValid: true
        };
		
		//首先做非空验证
        if (this.required) {            
            if (mini.isNull(e.value) || String(e.value).trim() === "") {
                e.isValid = false;
                e.errorText = this.requiredErrorText;
            }
        }
		//触发验证事件。
        this.fire("validation", e);

        this.errorText = e.errorText;
        //更新是否通过验证开关
        this.setIsValid(e.isValid);
        //返回验证是否通过
        return this.isValid();
    },
    /**
     * 判断是否验证通过
     * @returns {Boolean} true/false
     */
    isValid: function () {
        return this._IsValid;
    },
    /**
     * 设置是否验证通过
     * @param value {Boolean} true/false
     */
    setIsValid: function (value) {
        
        this._IsValid = value;
        this.doUpdateValid();
        
    },
    /**
     * 获取是否验证通过标志
     * @returns {Boolean} true/false
     */
    getIsValid: function () {
        return this._IsValid;
    },
    /**
     * 设置是否在值改变时重新验证
     * @param value {Boolean}true/false
     */
    setValidateOnChanged: function (value) {
        this.validateOnChanged = value;
    },
    /**
     * 获取是否在值改变时重新验证
     * @returns {Boolean}true/false
     */
    getValidateOnChanged: function (value) {
        return this.validateOnChanged;
    },
    setValidateOnLeave: function (value) {
        this.validateOnLeave = value;
    },
    getValidateOnLeave: function (value) {
        return this.validateOnLeave;
    },

    /**
     * 设置错误提示模式
     * @param value {String} 目前包括三种可选设置“icon”，“border”，“none”
     */
    setErrorMode: function (value) {
        if (!value) value = "none";
        this.errorMode = value.toLowerCase();
        if (this._IsValid == false) this.doUpdateValid();
    },
    /**
     * 获取错误提示模式
     * @returns {String}  
     */
    getErrorMode: function () {
        return this.errorMode;
    },
    /**
     * 设置自定义错误提示信息
     * @param value {String}错误提示信息
     */
    setErrorText: function (value) {
        this.errorText = value;
        if (this._IsValid == false) this.doUpdateValid();
    },
    /**
     * 获取自定义错误提示信息
     * @retirns errorText {String}错误提示信息
     */
    getErrorText: function () {
        return this.errorText;
    },
    /**
     * 设置是否必录
     * @param value {Boolean} true/false
     */
    setRequired: function (value) {
        this.required = value;
        if (this.required) {
            this.addCls(this._requiredCls);
        } else {
            this.removeCls(this._requiredCls);
        }
    },
    /**
     * 获取是否必录
     * @returns required {Boolean} true/false
     */
    getRequired: function () {
        return this.required;
    },
    /**
     * 设置必录验证错误提示信息
     * @param value {String}错误提示信息
     */
    setRequiredErrorText: function (value) {
        this.requiredErrorText = value;
    },
    /**
     * 获取必录验证错误提示信息
     * @retirns errorText {String}错误提示信息
     */
    getRequiredErrorText: function () {
        return this.requiredErrorText;
    },
	
	/**
	 * 无用属性，实际应该是_errorIconEl
	 * @type Object
	 * @default null
	 */
    errorIconEl: null,
    /**
     *获取错误图标元素
     * @returns {Object} 图标元素
     */
    getErrorIconEl: function () {
        return this._errorIconEl;
    },
    /**
     * 删除错误图标元素,空方法
     */
    _RemoveErrorIcon: function () {

    },
    /**
     * 更新验证完成后的展现效果。即，显示或者移除错误提示。
     */
    doUpdateValid: function () {
        var me = this;
        this._doUpdateValidTimer = setTimeout(function () {
            me.__doUpdateValid();
        }, 1);
    },
    /**
     * doUpdateValid的幕后支持者
     * @private
     */
    __doUpdateValid: function () {
        if (!this.el) return;
        this.removeCls(this._errorCls);
        this.removeCls(this._invalidCls);
        this.el.title = "";
        if (this._IsValid == false) {
            switch (this.errorMode) {
                case "icon":
                    this.addCls(this._errorCls);
                    var icon = this.getErrorIconEl();
                    if (icon) icon.title = this.errorText;
                    break;
                case "border":
                    this.addCls(this._invalidCls);
                    this.el.title = this.errorText;
                default:
                    this._RemoveErrorIcon();
                    break;
            }
        } else {
            this._RemoveErrorIcon();
        }
        this.doLayout();
    },
    /**
     * 默认事件，供子类使用。用于判断，当值改变时是否重新验证。
     */
    _OnValueChanged: function () {
        if (this.validateOnChanged) {
            this._tryValidate();
        }
        this.fire("valuechanged", { value: this.getValue() });
    },
    /**
     * 为组件添加 valuechanged 事件。
     * @param fn 事件响应函数
     * @param scope 上下文对象
     */
    onValueChanged: function (fn, scope) {
        this.on("valuechanged", fn, scope);
    },
    /**
     * 为组件添加 validation 事件。
     * @param fn 事件响应函数
     * @param scope 上下文对象
     */
    onValidation: function (fn, scope) {
        this.on("validation", fn, scope);
    },
    /**
     * 用于从HTML标签中提取配置参数的方法。在此方法中有对
     *  onvaluechanged, onvalidation, requiredErrorText, errorMode, validateOnChanged等
     * @param el {Object} DOM元素
     * @returns {Object} JSON对象
     */
    getAttrs: function (el) {
        var attrs = mini.ValidatorBase.superclass.getAttrs.call(this, el);
        
        /**
         * onvaluechanged 事件当组件值改变时触发，可用于做自定义验证规则<br/>
         * 支持标签配置。
         * @name onvaluechanged
         * @event
         * @memberOf mini.ValidatorBase.prototype
         */
        /**
         * onvalidation 事件当组件做验证动作时触发<br/>
         * 支持标签配置。
         * @name onvalidation
         * @event
         * @memberOf mini.ValidatorBase.prototype
         */
        mini._ParseString(el, attrs,
            ["onvaluechanged", "onvalidation",
            "requiredErrorText", "errorMode"
             ]
        );
        mini._ParseBool(el, attrs,
            ["validateOnChanged", "validateOnLeave"
             ]
        );

        var required = el.getAttribute("required");
        if (!required) required = el.required;
        if (required) {
            attrs.required = required != "false" ? true : false;
        }
        return attrs;
    }
});