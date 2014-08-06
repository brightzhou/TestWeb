/**
 * 文件中定义了 RadioButtonList 组件。
 * @fileOverview RadioButtonList.js
 * @author 殷文旭
 */

/**
 * @class RadioButtonList 是mini UI中的单选按钮组组件
 * @constructor
 * @extends mini.CheckBoxList
 * @requires mini.CheckBoxList
 * @version 1.0
 */
mini.RadioButtonList = function () {
	mini.RadioButtonList.superclass.constructor.call(this);
}
mini.extend(mini.RadioButtonList, mini.CheckBoxList, {
	/**
	 * 是否支持多选开关
	 * @type Boolean
	 * @default false
	 */
	multiSelect: false,

	_itemCls: "mini-radiobuttonlist-item",
	_itemHoverCls: "mini-radiobuttonlist-item-hover",
	_itemSelectedCls: "mini-radiobuttonlist-item-selected",

	_tableCls: "mini-radiobuttonlist-table",
	_tdCls: "mini-radiobuttonlist-td",
	_checkType: "radio",
	/**
	 * 组件样式类
	 * @type String
	 * @default "mini-radiobuttonlist"
	 */
	uiCls: "mini-radiobuttonlist"
});
mini.regClass(mini.RadioButtonList, "radiobuttonlist");