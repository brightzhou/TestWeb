/**
 * @fileOverview ToolBar.js 文件定义了所有组件的基类。
 */

/**
 * ToolBar 是mini UI中的导航组件，构造函数中调用了Control方法
 * @class mini.ToolBar
 * @constructor
 * @extends mini.Container 
 */
mini.ToolBar = function () {
    mini.ToolBar.superclass.constructor.call(this);
}
mini.extend(mini.ToolBar, mini.Container, {
	/**
     * @lends mini.ToolBar.prototype
     */
	 
	 /**
	 * 是否清除边线，默认不清除
	 * @default false
	 */
    _clearBorder: false,
	/**
	 * 样式，默认为空
	 */
    style: "",
	/**
     * 组将样式类
     * @default "mini-toolbar"
     */
    uiCls: "mini-toolbar",
	/**
     * 创建组件最外层HTML结构，并绑定给组件实例。
     * @default
     * @private
     */
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-toolbar";
    },
	/**
     * 设置组件初始化完成后的需要执行的回调函数，
     * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
     * @private
     */
    _initEvents: function () {

    },
	/**
     * 重新调整组件布局
     */
    doLayout: function () {
        if (!this.canLayout()) return;
        var nodes = mini.getChildNodes(this.el, true);
        for (var i = 0, l = nodes.length; i < l; i++) {
            mini.layout(nodes[i]);
        }
    },
    /**
     * 重新调整指定对象的组件布局
     * @param value DOM元素
     */
    set_bodyParent: function (value) {
        if (!value) return;
        this.el = value;
        this.doLayout();
    },
    /**
     * 取得指定元素的属性JSON集合，获取id ，borderStyle 两个属性
     * @param el DOM元素
     * @returns JSON对象
     */
    getAttrs: function (el) {
        var attrs = {}; 
        mini._ParseString(el, attrs,
            ["id","borderStyle"]
        );

        this.el = el;
        this.el.uid = this.uid;
        this.addCls(this.uiCls);

        return attrs;
    }
});
//注册ToolBar组件
mini.regClass(mini.ToolBar, "toolbar");