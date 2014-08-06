/**
 * 定义了form隐藏组件
 * @fileOverview Hidden.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * Hidden 是mini UI中的隐藏域组件属于form类组件，构造函数中调用了 Control父类的构造方法
 * @class mini.Hidden
 * @constructor
 * @extends mini.Control
 */
mini.Hidden = function () {
	mini.Hidden.superclass.constructor.call(this);
}
mini.extend(mini.Hidden, mini.Control, /**@lends mini.Hidden.prototype*/
{
	_clearBorder: false,

	/**
	 * 标志此组件属于form元素组件
	 * @type Boolean
	 * @default true
	 * @const
	 */
	formField: true,

	/**
	 * 隐藏域的实际值
	 * @type String
	 * @default ""
	 */
	value: "",
	/**
	 * Hidden组件对应的样式类名。
	 * @type String
	 * @default "mini-hidden"
	 * @const
	 */
	uiCls: "mini-hidden",

	_create: function () {
		this.el = document.createElement("input");
		this.el.type = "hidden";
		this.el.className = "mini-hidden";
	},
	/**
	 * 改变Hidden组件name属性的值，同时改变对应标签的name属性值
	 * @param value {String} name值
	 */
	setName: function (value) {
		this.name = value;
		this.el.name = value;
	},
	/**
	 * 改变Hidden组件 对应标签的 value 属性值，当值为null 或 undefined时，将value置空。
	 * @param value {String} value值
	 */
	setValue: function (value) {
		if (value === null || value === undefined)
			value = "";
		this.value = value;
		if (mini.isDate(value)) {
			var y = value.getFullYear();
			var m = value.getMonth() + 1;
			var d = value.getDate();
			m = m < 10 ? "0" + m : m;
			d = d < 10 ? "0" + d : d;
			this.el.value = y + "-" + m + "-" + d;
		} else {
			this.el.value = value;
		}
	},
	/**
	 * 获取Hidden组件的value属性值。
	 * @return {String}
	 */
	getValue: function () {
		return this.value;
	},
	/**
	 * 获取Hidden组建相对于form提交的值，Hidden组件的FormValue 和Value并无二致
	 * @return {String}
	 */
	getFormValue: function () {
		return this.el.value;
	}
});

mini.regClass(mini.Hidden, "hidden");