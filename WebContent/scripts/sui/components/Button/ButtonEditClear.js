mini.plugin(mini.ButtonEdit, /** @lends mini.ButtonEdit.prototype */{
	/**
	 * 为ButtonEdit添加Tooltip 提示功能
	 */
	_addTooltip : function(el) {
        //解决鼠标浮动在按钮上时影响浮动信息的显示 赵美丹 2013-03-29
		this.tooltip = new mini.Tooltip(this._textEl);
		this.tooltip.setSource(this._textEl);
		this.tooltip.setAttr('value');
        this.tooltip.setAttrDelimiter(this.delimiter);
	},
	//内存泄露问题优化 赵美丹 2013-04-17
    destroyTooltip : function(removeEl){
        if (this.tooltip) {
            mini.clearEvent(this.tooltip);
            this.tooltip.destroy(removeEl);
            this.tooltip = null;
        }
    },
	
    __onBtnMouseOver : function(e){
        e.stopPropagation();
        return false;
    },
    __onBtnMouseOut : function(e){
        e.stopPropagation();
        return false;
    },
	/**
	 * 更新组件容器内部。
	 */
	doUpdate: function() {
		mini.ButtonEdit.superclass.doUpdate.call(this);
	}
	
});