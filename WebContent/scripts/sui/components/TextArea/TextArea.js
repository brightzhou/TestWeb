/**
 * 定义了 form 多行录入框组件
 * @fileOverview TextArea.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * TextArea 是mini UI中的多行录入框组件，构造函数中调用了 TextBox 类的构造方法
 * @class mini.TextArea
 * @constructor
 * @extends mini.TextBox
 * @requires mini.TextBox
 */
mini.TextArea = function () {
    mini.TextArea.superclass.constructor.call(this);
}

mini.extend(mini.TextArea, mini.TextBox, /** @lends mini.TextArea.prototype */{
	/**
	 * 最多可录入字符数
	 * @type Number
	 * @default 10000000
	 */    
    maxLength: 10000000,
    /**
     * 录入框宽度
     * @type Number
     * @default 180
     */
    width: 180,
    /**
     * 录入框高度
     * @type Number
     * @default 50
     */
    height: 50,
    /**
     * 录入框最小高度
     * @type Number
     * @default 50
     */
    minHeight: 50,
    /**
     * 组件类型
     * @type String
     * @default "textarea"
     */
    _InputType: "textarea",
    /**
     * 录入框组件样式类名
     * @type String
     * @default "mini-textarea"
     */
    uiCls: "mini-textarea",
    /**
     * 调整布局方法
     */
    doLayout: function () {
        if (!this.canLayout()) return;
        mini.TextArea.superclass.doLayout.call(this);
        var h = mini.getHeight(this.el);
        mini.setHeight(this._borderEl, h);
        h -= 2;
        if (h < 0) h = 0;
        this._textEl.style.height = h + "px";        
    }
});
mini.regClass(mini.TextArea, 'textarea');