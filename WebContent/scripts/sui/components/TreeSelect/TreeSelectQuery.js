mini.plugin(mini.TreeSelect, /** @lends mini.TreeSelect.prototype */ {
	
	/**
	 * 是否在弹出层显示搜索框
	 * @type Boolean
	 * @default
	 */
	showQueryToolBar : false,

	_createQueryToolBar : function() {
		if(this.showQueryToolBar && !this.queryToolbar) {
			this.queryToolbar = new mini.ToolBar();
			this.queryToolbar.render(this.popup._contentEl,"prepend");	//添加子元素

			this.queryInput = new mini.TextBox();
			this.queryInput.setEmptyText("请录入查询条件");
            this.queryInput.setWidth(50);
			this.queryInput.render(this.queryToolbar.el);
			this.queryInput.on("enter",this._queryEvent, this);

			this.queryButton = new mini.Button();
			this.queryButton.setText("查询");
			this.queryButton.setPlain(true);
            this.queryButton.setStyle("margin-left:2px;");
			this.queryButton.render(this.queryToolbar.el);
			this.queryButton.onClick(this._queryEvent,this);
            
            //解决输入框的自适应问题 赵美丹 2012-12-13
            this.on("showpopup", function(){
                var w = this.queryToolbar.getWidth();
	            this.queryInput.setWidth(w-58);
            });
		}
	},
    _destroyQueryToolBar : function(removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        if (this.queryInput) {
            mini.clearEvent(this.queryInput);
            this.queryInput.destroy(removeEl);
            this.queryInput = null;
        }
        
        if (this.queryButton) {
            mini.clearEvent(this.queryButton);
            this.queryButton.destroy(removeEl);
            this.queryButton = null;
        }
        
        if (this.queryToolbar) {
            mini.clearEvent(this.queryToolbar);
            this.queryToolbar.destroy(removeEl);
            this.queryToolbar = null;
        }
    },
	_queryEvent : function(e) {
		var value = this.queryInput.getValue();
        var scope = this;
		if(value && value.trim()) {
	        var firstLeafNode = null;
			this.tree.filter( function(node) {
                //修改正则表达式方式为字符串匹配，解决value为正则特殊字符时报错问题 赵美丹 2013-03-21
				if(node[this.textField].indexOf(value) != -1){
                    if(!firstLeafNode || node[this.parentField] == firstLeafNode[this.idField]){
                        firstLeafNode = node;
                    }
                    return true;
                }
			}
			);
            //默认展开至第一个叶子节点 赵美丹 2013-03-12
            if(firstLeafNode){
                this.tree.expandPath(firstLeafNode);
            }
		} else {
			this.tree.clearFilter();
		}
	},
	
	/**
	 * 设置 showQueryToolBar 属性值
	 * @param value {Boolean}
	 */
	setShowQueryToolBar: function(value) {
		this.showQueryToolBar = value;
	},
	
	/**
	 * 获取 showQueryToolBar 属性值
	 * @return {Boolean}
	 */
	getShowQueryToolBar: function() {
		return this.showQueryToolBar;
	},
	doUpdate: function() {
		mini.TreeSelect.superclass.doUpdate.call(this);
		this._createQueryToolBar();
	}
});