
/**
 * @class mini.OutlookTree 是mini UI中的树形菜单组件，构造函数中调用了mini.OutlookBar
 * @constructor
 * @extends mini.OutlookBar
 */
mini.OutlookTree = function () {
	mini.OutlookTree.superclass.constructor.call(this);

	this.data = [];
}
mini.extend(mini.OutlookTree, mini.OutlookBar, /** @lends mini.OutlookTree.prototype */
{
	/**
	 * 数据地址
	 */
	url: "",
	/**
	 * 文本字段名
	 */
	textField: "text",
	/**
	 * 图标字段名
	 */
	iconField: "iconCls",
	/**
	 *  url字段名
	 */
	urlField: "url",
	/**
	 * url数据是否列表
	 */
	resultAsTree: false,
	/**
	 * 子节点字段名
	 */
	nodesField: "children",
	/**
	 * 节点字段名
	 */
	idField: "id",
	/**
	 * 父节点字段名
	 */
	parentField: "pid",
	/**
	 * 默认样式
	 */
	style: "width:100%;height:100%;",

	/**
	 * 设置配置屬性
	 */
	set: function (kv) {
		if (typeof kv == 'string') {
			return this;
		}

		var url = kv.url;
		delete kv.url;
		var activeIndex = kv.activeIndex;
		delete kv.activeIndex;

		mini.OutlookTree.superclass.set.call(this, kv);

		if (url) {
			this.setUrl(url);
		}
		if (mini.isNumber(activeIndex)) {
			this.setActiveIndex(activeIndex);
		}
		return this;
	},
	/**
	 * 控件标签class名称
	 */
	uiCls: "mini-outlooktree",
	destroy: function (removeEl) {
		if (this._trees) {
			var cs = this._trees.clone();
			for (var i = 0, l = cs.length; i < l; i++) {
				var p = cs[i];
				p.destroy();
			}
			this._trees.length = 0;
		}

		mini.OutlookTree.superclass.destroy.call(this, removeEl);
	},
	_doParseFields: function (list) {
	    for (var i = 0, l = list.length; i < l; i++) {
	        var o = list[i];
	        o.text = o[this.textField];
	        o.url = o[this.urlField];
	        o.iconCls = o[this.iconField];
	    }
	},

	_doLoad: function () {
		var items = [];
		try {
			items = mini.getData(this.url);
		} catch (ex) {

			if (mini_debugger == true) {
				alert("outlooktree json is error.");
			}
		}
		if (this.dataField) {
		    items = mini._getMap(this.dataField, items);
		}

		if (!items)
			items = [];

		if (this.resultAsTree == false) {
			items = mini.arrayToTree(items, this.nodesField, this.idField, this.parentField)
		}

		var list = mini.treeToArray(items, this.nodesField, this.idField, this.parentField)
		this._doParseFields(list);


		this.createNavBarTree(items);
		this.fire("load");
	},
	loadList: function (list, idField, parentField) {
		idField = idField || this.idField;
		parentField = parentField || this.parentField;
		this._doParseFields(list);

		var tree = mini.arrayToTree(list, this.nodesField, idField, parentField);
		this.load(tree);
	},
    /**	 * 加载树形数据	 */	load: function (value) {
	    if (typeof value == "string") {
	        this.setUrl(value);
	    } else {
	        //修改不同数据类型下的兼容问题 潘正锋 2013-05-05
	        var items;	        if (this.resultAsTree == false) {
	            items = mini.arrayToTree(value, this.nodesField, this.idField, this.parentField)
	        }	        var list = mini.treeToArray(items, this.nodesField, this.idField, this.parentField)	        this._doParseFields(list);	        this.createNavBarTree(items);
	    }
	},
	setData: function (value) {
	    this.load(value);
	},

	/**
	 * 设置数据地址
	 */
	setUrl: function (value) {
		this.url = value;
		this._doLoad();
	},
	/**
	 * 获取数据地址
	 */
	getUrl: function () {
		return this.url;
	},
	/**
	 * 设置文本字段名
	 */
	setTextField: function (value) {
		this.textField = value;
	},
	/**
	 * 获取文本字段名
	 */
	getTextField: function () {
		return this.textField;
	},
	/**
	 * 设置图标字段名
	 */
	setIconField: function (value) {
		this.iconField = value;
	},
	/**
	 * 获取图标字段名
	 */
	getIconField: function () {
		return this.iconField;
	},
	/**
	 * 设置url字段名
	 */
	setUrlField: function (value) {
		this.urlField = value;
	},
	/**
	 * 获取url字段名
	 */
	getUrlField: function () {
		return this.urlField;
	},
	/**
	 * 设置是否树形数据
	 */
	setResultAsTree: function (value) {
		this.resultAsTree = value;
	},
	/**
	 * 获取是否树形数据
	 */
	getResultAsTree: function () {
		return this.resultAsTree;
	},
	/**
	 * 设置节点字段名
	 */
	setNodesField: function (value) {
		this.nodesField = value;
	},
	/**
	 * 获取子节点字段名
	 */
	getNodesField: function () {
		return this.nodesField;
	},
	/**
	 * 设置节点字段名
	 */
	setIdField: function (value) {
		this.idField = value;
	},
	/**
	 * 获取节点字段名
	 */
	getIdField: function () {
		return this.idField;
	},
	/**
	 * 设置父节点字段名
	 */
	setParentField: function (value) {
		this.parentField = value;
	},
	/**
	 * 获取父节点字段名
	 */
	getParentField: function () {
		return this.parentField;
	},
	_selected: null,
	/**
	 * 获取选中状态
	 */
	getSelected: function () {
		return this._selected;
	},
	/**
	 * 选中节点
	 * @param node 节点对象
	 */
	selectNode: function (node) {
		node = this.getNode(node);
		if (!node)
			return;
		var tree = this._getOwnerTree(node);
		tree.selectNode(node);
	},
	/**
	 * 展开节点
	 * @param node 节点对象
	 */
	expandPath: function (node) {
		node = this.getNode(node);
		if (!node)
			return;
		var tree = this._getOwnerTree(node);
		tree.expandPath(node);
		this.expandGroup(tree._ownerGroup);
	},
	findNodes: function (fn, scope) {
	    var nodes = [];
	    scope = scope || this;
	    for (var i = 0, l = this._trees.length; i < l; i++) {
	        var tree = this._trees[i];
	        var nds = tree.findNodes(fn, scope);
	        nodes.addRange(nds);
	    }
	    return nodes;
	},

	/**
	 * 获取节点对象
	 */
	getNode: function (node) {
		for (var i = 0, l = this._trees.length; i < l; i++) {
			var tree = this._trees[i];
			var n = tree.getNode(node);
			if (n)
				return n;
		}
		return null;
	},
	getList: function () {
	    var list = [];
	    for (var i = 0, l = this._trees.length; i < l; i++) {
	        var tree = this._trees[i];
	        var nodes = tree.getList();
	        list.addRange(nodes);
	    }
	    return list;
	},

	_getOwnerTree: function (node) {
		if (!node)
			return;
		for (var i = 0, l = this._trees.length; i < l; i++) {
			var tree = this._trees[i];
			if (tree._idNodes[node._id])
				return tree;
		}
	},
	/**
	 * 加载时展开节点
	 * @default false
	 */
	expandOnLoad: false,
	/**
	 * 设置是否加载时展开节点
	 */
	setExpandOnLoad: function (value) {
		this.expandOnLoad = value;
	},
	/**
	 * 获取是否加载时展开
	 */
	getExpandOnLoad: function () {
		return this.expandOnLoad;
	},
	getAttrs: function (el) {
		var attrs = mini.OutlookTree.superclass.getAttrs.call(this, el);

		attrs.text = el.innerHTML;
		/**
		 * onnodeclick 事件当树节点被点击时触发<br/>
		 * 支持标签配置。
		 * @name onnodeclick
		 * @event
		 * @memberOf mini.OutlookTree.prototype
		 */
		/**
		 * onnodeselect 事件当树节点被选中时触发<br/>
		 * 支持标签配置。
		 * @name onnodeselect
		 * @event
		 * @memberOf mini.OutlookTree.prototype
		 */
		/**
		 * onnodemousedown 事件当树节点mousedown时触发<br/>
		 * 支持标签配置。
		 * @name onnodemousedown
		 * @event
		 * @memberOf mini.OutlookTree.prototype
		 */
		mini._ParseString(el, attrs,
		["url", "textField", "urlField", "idField", "parentField", "nodesField", "iconField",
		"onnodeclick", "onnodeselect", "onnodemousedown",
		"expandOnLoad"
		]
		);
		mini._ParseBool(el, attrs,
		["resultAsTree"]
		);

		if (attrs.expandOnLoad) {
			var level = parseInt(attrs.expandOnLoad);
			if (mini.isNumber(level)) {
				attrs.expandOnLoad = level;
			} else {
				attrs.expandOnLoad = attrs.expandOnLoad == "true" ? true : false;
			}
		}

		return attrs;
	},
	autoCollapse: true,
	activeIndex: 0,
	createNavBarTree: function (tree) {
		if (!mini.isArray(tree))
			tree = [];
		this.data = tree;

		var groups = [];
		for (var i = 0, l = this.data.length; i < l; i++) {
			var o = this.data[i];
			var group = {};
			group.title = o.text;
			group.iconCls = o.iconCls;
			groups.push(group);

			group._children = o[this.nodesField];
		}

		this.setGroups(groups);
		this.setActiveIndex(this.activeIndex);

		this._trees = [];
		for (var i = 0, l = this.groups.length; i < l; i++) {
			var group = this.groups[i];
			var groupBodyEl = this.getGroupBodyEl(group);

			var tree = new mini.Tree();
			tree.set({
				expandOnLoad: this.expandOnLoad,
				showTreeIcon: true,
				style: "width:100%;height:100%;border:0;background:none",
				data: group._children
			});
			tree.render(groupBodyEl);
			tree.on("nodeclick", this.__OnNodeClick, this);
			tree.on("nodeselect", this.__OnNodeSelect, this);
			tree.on("nodemousedown", this.__OnNodeMouseDown, this);

			this._trees.push(tree);
			delete group._children

			tree._ownerGroup = group;

		}
		this.doLayout();
	},
	__OnNodeMouseDown: function (e) {
		var eve = {
			node: e.node,
			isLeaf: e.sender.isLeaf(e.node),
			htmlEvent: e.htmlEvent
		};
		this.fire("nodemousedown", eve);
	},
	__OnNodeClick: function (e) {
		var eve = {
			node: e.node,
			isLeaf: e.sender.isLeaf(e.node),
			htmlEvent: e.htmlEvent
		};
		this.fire("nodeclick", eve);
	},
	__OnNodeSelect: function (e) {
		if (!e.node)
			return;
		for (var i = 0, l = this._trees.length; i < l; i++) {
			var tree = this._trees[i];
			if (tree != e.sender) {
				tree.selectNode(null);
			}
		}

		var eve = {
			node: e.node,
			isLeaf: e.sender.isLeaf(e.node),
			htmlEvent: e.htmlEvent
		};
		this._selected = e.node;
		this.fire("nodeselect", eve);
	}
});
mini.regClass(mini.OutlookTree, "outlooktree");