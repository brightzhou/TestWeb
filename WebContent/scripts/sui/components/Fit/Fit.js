/**
 * 定义了Fit组件
 * @fileOverview Fit.js
 * @author 殷文旭
 */

/**
 * @class mini.Fit Fit 是mini UI中的自动撑满组件<br/>
 * 高度撑满布局控件。它的高度为：父元素高度 - 其他同级元素高度。
 * @constructor
 * @extends mini.Container
 * @requires mini.Container
 * @example
 * &lt;div class="mini-fit"&gt;&lt;/div&gt;
 */
mini.Fit = function () {
	mini.Fit.superclass.constructor.call(this);
}
mini.extend(mini.Fit, mini.Container, /** @lends mini.Fit.prototype */
{
	/**
	 * 没有用到的属性
	 * @private
	 */
	style: "",
	_clearBorder: false,
    /**
     * 组将样式类
     * @type String
     * @default "mini-fit"
     */
	uiCls: "mini-fit",
	
	_create: function () {
		this.el = document.createElement("div");
		this.el.className = "mini-fit";
		this._bodyEl = this.el;
	},
	_initEvents: function () {

	},
	/**
	 * 无用方法
	 * @private
	 */
	isFixedSize: function () {
		return false;
	},
	/**
	 * 调整布局方法，通常由框架自动调用，无需使用者自己调用。
	 */
	doLayout: function () {
		if (!this.canLayout())
			return;

		var parentNode = this.el.parentNode;
		var childNodes = mini.getChildNodes(parentNode);
		if (parentNode == document.body) {
			this.el.style.height = "0px";
		}

		var height = mini.getHeight(parentNode, true);

		for (var i = 0, l = childNodes.length; i < l; i++) {
			var node = childNodes[i];
			var tagName = node.tagName ? node.tagName.toLowerCase() : "";
			if (node == this.el || (tagName == "style" || tagName == "script"))
				continue;

			var pos = mini.getStyle(node, "position");
			if(pos == "absolute" || pos == "fixed")
				continue;

			var h = mini.getHeight(node);

			var margin = mini.getMargins(node);
			height = height - h - margin.top - margin.bottom;
		}

		var border = mini.getBorders(this.el);
		var padding = mini.getPaddings(this.el);
		var margin = mini.getMargins(this.el);

		height = height - margin.top - margin.bottom;
		if (jQuery.boxModel) {
			height = height - padding.top - padding.bottom - border.top - border.bottom;
		}
		if (height < 0)
			height = 0;

		this.el.style.height = height + "px";

		try {
			childNodes = mini.getChildNodes(this.el);
			for (var i = 0, l = childNodes.length; i < l; i++) {
				var node = childNodes[i];
				mini.layout(node);
			}
		} catch (e) {
		}

	},
	/**
	 * 将其他元素的子元素填充到自动撑满组件内
	 * @param value {Object} DOM元素
	 */
	set_bodyParent: function (value) {

		if (!value)
			return;

		var el = this._bodyEl;

		var p = value;
		while (p.firstChild) {
			try {
				el.appendChild(p.firstChild);
			} catch (e) {
			}
		}
		this.doLayout();
	},
    /**
     * 用于从HTML标签中提取配置参数的方法。方法实现中直接调用了父类的实现。
     * @param el {Object} DOM元素
     * @returns {Object} JSON对象
     */
	getAttrs: function (el) {
		var attrs = mini.Fit.superclass.getAttrs.call(this, el);
		attrs._bodyParent = el;
		return attrs;
	}
});
mini.regClass(mini.Fit, "fit");