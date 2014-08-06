/**
 * 定义了form 密码录入框组件
 * @fileOverview Password.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * Password 是mini UI中的密码录入框组件属于form类组件，构造函数中调用了 TextBox 父类的构造方法
 * @class mini.Password
 * @constructor
 * @extends mini.TextBox
 * @requires mini.TextBox
 */
mini.Password = function () {
	mini.Password.superclass.constructor.call(this);
}
mini.extend(mini.Password, mini.TextBox, /** @lends mini.Password.prototype */
{
	/**
	 * 密码录入框组件样式类名
	 * @type String
	 * @default "mini-textarea"
	 */
	uiCls: "mini-password",
	_InputType: "password",
	/**
	 * 设置当值为空时的显示文本。用于框内提示用途
	 * @param value {String}
	 */
	setEmptyText: function (value) {
		this.emptyText = "";
	}
});
mini.regClass(mini.Password, 'password');