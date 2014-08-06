/**
 * 定义了所有容器类组件的基类。
 * @fileOverview Container.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * Container 是mini UI中所有容器类组件的基类，构造函数中主要做了几件事情，
 * 1调用 Control 构造函数<br/>
 * 2 _contentEl = el<br/>
 * @class mini.Container
 * @constructor
 * @extends mini.Control
 * @requires mini.Control
 */
mini.Container = function () {
	mini.Container.superclass.constructor.call(this);
	this._contentEl = this.el;
}
mini.extend(mini.Container, mini.Control, /** @lends mini.Container.prototype */
{
	/**
	 * 为容器组件添加子组件
	 * 添加完成之后解析子组件定义，然后调整区域布局。
	 * @param controls {Array|Object}需要添加的子组件
	 * @param contentEl 容纳子组件的DOM对象，非必须
	 * @param scope 指定完成之后调整布局的区域， 非必须
	 * @returns scope
	 */
    setControls: __mini_setControls,
    getContentEl: function () {
        return this._contentEl;
    },
    getBodyEl: function () {
        return this._contentEl;
    }


});