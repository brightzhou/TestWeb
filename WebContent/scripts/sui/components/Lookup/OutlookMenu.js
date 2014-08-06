

/** 
 * @class mini.OutlookMenu 是mini UI中的手风琴组件，构造函数中调用了mini.OutlookBar方法
 * @constructor
 * @extends mini.OutlookBar
 */
mini.OutlookMenu = function () {
	mini.OutlookMenu.superclass.constructor.call(this);
	//构造OutlookMenu的数据源
	this.data = [];
}
mini.extend(mini.OutlookMenu, mini.OutlookBar, /** @lends mini.OutlookMenu.prototype */
{

	/**
	 * 数据地址
	 * @default 长度为零的字符串
	 */
	url: "",

	/**
	 * 节点文本字段
	 * @default text
	 */
	textField: "text",

	/**
	 * 图标字段
	 * @default iconCls
	 */
	iconField: "iconCls",

	/**
	 * 数据地址字段
	 * @default url
	 */
	urlField: "url",

	/**
	 * url数据是否列表
	 * @default false
	 */
	resultAsTree: false,

	/**
	 * 叶子节点字段
	 * @default children
	 */
	itemsField: "children",

	/**
	 * 值字段,节点的唯一标识
	 * @default id
	 */
	idField: "id",

	/**
	 * 父节点字段
	 * @default pid
	 */
	parentField: "pid",

	style: "width:100%;height:100%;",

	/**
	 * 通用的设置属性方法，可以用于设置事件，设置属性。
	 * @param kv JSON对象
	 * @returns 组件实例本身
	 */
	set: function (kv) {
		if (typeof kv == 'string') {
			return this;
		}

		var url = kv.url;
		delete kv.url;
		var activeIndex = kv.activeIndex;
		delete kv.activeIndex;

		mini.OutlookMenu.superclass.set.call(this, kv);

		if (url) {
			this.setUrl(url);
		}
		if (mini.isNumber(activeIndex)) {
			this.setActiveIndex(activeIndex);
		}
		return this;
	},
	/**
	 * 组件样式类名
	 * @default "mini-outlookmenu"
	 */
	uiCls: "mini-outlookmenu",

	/** 析构函数 */
	destroy: function (removeEl) {
		if (this._menus) {
			var cs = this._menus.clone();
			for (var i = 0, l = cs.length; i < l; i++) {
				var p = cs[i];
				p.destroy();
			}
			this._menus.length = 0;
		}

		mini.OutlookMenu.superclass.destroy.call(this, removeEl);
	},
	_doParseFields: function (list) {
	    for (var i = 0, l = list.length; i < l; i++) {
	        var o = list[i];
	        o.text = o[this.textField];
	        o.url = o[this.urlField];
	        o.iconCls = o[this.iconField];
	    }
	},

	/**
	 * 获取数据并创建导航菜单，包加载树形和列表数据
	 */
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
			items = mini.arrayToTree(items, this.itemsField, this.idField, this.parentField)
		}

		var list = mini.treeToArray(items, this.itemsField, this.idField, this.parentField)
		this._doParseFields(list);


		this.createNavBarMenu(items);
		this.fire("load");
	},
	/**
	 * 只加载树形数据
	 */
	loadList: function (list, idField, parentField) {
		idField = idField || this.idField;
		parentField = parentField || this.parentField;
		this._doParseFields(list);

		var tree = mini.arrayToTree(list, this.nodesField, idField, parentField);
		this.load(tree);
	},
	load: function (value) {
	    if (typeof value == "string") {
	        this.setUrl(value);
	    } else {
            //修改不同数据类型下的兼容问题 潘正锋 2013-05-05
	        if (this.resultAsTree == false) {
	            value = mini.arrayToTree(value, this.itemsField, this.idField, this.parentField)
	        }	        var list = mini.treeToArray(value, this.itemsField, this.idField, this.parentField)	        this._doParseFields(list);	        this.createNavBarMenu(value);
	    }
	},
	setData: function (value) {
	    this.load(value);
	},

	/** 设置url */
	setUrl: function (value) {
		this.url = value;
		this._doLoad();
	},
	/** 获取url */
	getUrl: function () {
		return this.url;
	},
	/** 设置textField */
	setTextField: function (value) {
		this.textField = value;
	},
	/** 获取textField */
	getTextField: function () {
		return this.textField;
	},
	/** 设置iconField */
	setIconField: function (value) {
		this.iconField = value;
	},
	/** 获取iconField */
	getIconField: function () {
		return this.iconField;
	},
	/** 设置urlField */
	setUrlField: function (value) {
		this.urlField = value;
	},
	/** 获取urlField */
	getUrlField: function () {
		return this.urlField;
	},
	/** 设置resultAsTree */
	setResultAsTree: function (value) {
		this.resultAsTree = value;
	},
	/** 获取resultAsTree */
	getResultAsTree: function () {
		return this.resultAsTree;
	},
	/** 设置nodesField */
	setNodesField: function (value) {
		this.nodesField = value;
	},
	/** 获取nodesField */
	getNodesField: function () {
		return this.nodesField;
	},
	/** 设置idField */
	setIdField: function (value) {
		this.idField = value;
	},
	/** 获取idField */
	getIdField: function () {
		return this.idField;
	},
	/** 设置parentField */
	setParentField: function (value) {
		this.parentField = value;
	},
	/** 获取parentField */
	getParentField: function () {
		return this.parentField;
	},
	/** 当前被选中的条目 */
	_selected: null,

	/** 获取_selected */
	getSelected: function () {
		return this._selected;
	},
	selectNode: function (node) {

	    node = this.getNode(node);
	    if (!node) return;

	    var menu = this._getOwnerMenu(node);
	    if (!menu) return;
	    this.expandGroup(menu._ownerGroup);

	    setTimeout(function () {
	        try {
	            menu.setSelectedItem(node);
	        } catch (ex) { }
	    }, 100);

	},
	findNodes: function (fn, scope) {
	    var nodes = [];
	    scope = scope || this;
	    for (var i = 0, l = this._menus.length; i < l; i++) {
	        var items = this._menus[i].getItems();
	        var nds = [];
	        for (var j = 0, k = items.length; j < k; j++) {
	            var item = items[j];
	            if (fn && fn.call(scope, item) === true) {
	                nds.push(item);
	            }
	        }
	        nodes.addRange(nds);
	    }
	    return nodes;
	},
	getNode: function (node) {
	    for (var i = 0, l = this._menus.length; i < l; i++) {
	        var menu = this._menus[i];
	        var n = menu.getItem(node);
	        if (n) return n;
	    }
	    return null;
	},
	getList: function () {
	    var list = [];
	    for (var i = 0, l = this._menus.length; i < l; i++) {
	        var menu = this._menus[i];
	        var items = menu.getItems();
	        list.addRange(items);
	    }
	    return list;
	},
	_getOwnerMenu: function (node) {
	    if (!node) return;
	    for (var i = 0, l = this._menus.length; i < l; i++) {
	        var menu = this._menus[i];
	        var n = menu.getItem(node);
	        if (n) return menu;
	    }
	},



	/**
	 * 取得指定元素的属性JSON集合
	 * @param el DOM元素
	 * @returns JSON对象
	 */
	getAttrs: function (el) {
		var attrs = mini.OutlookMenu.superclass.getAttrs.call(this, el);

		attrs.text = el.innerHTML;
		/**
		 * onitemclick 事件当菜单项被点击时触发<br/>
		 * 支持标签配置。
		 * @name onitemclick
		 * @event
		 * @memberOf mini.OutlookMenu.prototype
		 */
		/**
		 * onitemselect 事件当菜单项被选中时触发<br/>
		 * 支持标签配置。
		 * @name onitemselect
		 * @event
		 * @memberOf mini.OutlookMenu.prototype
		 */
		mini._ParseString(el, attrs,
		["url", "textField", "urlField", "idField", "parentField", "itemsField", "iconField",
		"onitemclick", "onitemselect"]
		);
		mini._ParseBool(el, attrs,
		["resultAsTree"]
		);

		return attrs;
	},
	/**
	 * 渲染菜单时是否折叠
	 * @default true
	 */
	autoCollapse: true,

	/**
	 * 当前被选中的条目的id
	 * @default 0
	 */
	activeIndex: 0,

	/**
	 * 创建导航菜单
	 * @param tree 菜单数据
	 */
	createNavBarMenu: function (tree) {
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

			group._children = o[this.itemsField];
		}

		this.setGroups(groups);
		this.setActiveIndex(this.activeIndex);

		this._menus = [];
		for (var i = 0, l = this.groups.length; i < l; i++) {
		    var group = this.groups[i];
		    var groupBodyEl = this.getGroupBodyEl(group);

		    var menu = new mini.Menu();
		    menu._ownerGroup = group;
		    menu.set({
		        showNavArrow: false,
		        style: "width:100%;height:100%;border:0;background:none",
		        borderStyle: "border:0",
		        allowSelectItem: true,
		        items: group._children
		    });
		    menu.render(groupBodyEl);
		    menu.on("itemclick", this.__OnItemClick, this);
		    menu.on("itemselect", this.__OnItemSelect, this);

		    this._menus.push(menu);
		    delete group._children


		}

	},
	/**
	 * 折叠菜单组件实例的默认项点击事件响应函数。
	 * @param e Event
	 */
	__OnItemClick: function (e) {
		var eve = {
			item: e.item,
			htmlEvent: e.htmlEvent
		};
		this.fire("itemclick", eve);
	},
	/**
	 * 折叠菜单组件实例的默认项选中事件响应函数。
	 * @param e Event
	 */
	__OnItemSelect: function (e) {
		if (!e.item)
			return;
		for (var i = 0, l = this._menus.length; i < l; i++) {
			var menu = this._menus[i];
			if (menu != e.sender) {
				menu.setSelectedItem(null);
			}
		}
		var eve = {
			item: e.item,
			htmlEvent: e.htmlEvent
		};
		this._selected = e.item;
		this.fire("itemselect", eve);
	}
});

//注册Button组件
mini.regClass(mini.OutlookMenu, "outlookmenu");