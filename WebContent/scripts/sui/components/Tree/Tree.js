/**
 * @fileOverview Tree.js 文件定义了树组件的基类。
 */

/**
 * 树的实现, 描述了树结点数据的存储结构, 及树形结构的展现。
 * @class mini.Tree
 * @constructor
 * @extends mini.Control
 */

mini.Tree = function (config) {
    //去掉对this._ajaxOption的强行同步处理，解决treeselect中tree同步加载的问题 赵美丹 2012-11-27
    /*this._ajaxOption = {
		async: false,
		type: "get"
	};*/
    /**
	 * 根结点
	 */
    this.root = { _id: -1, _pid: "", _level: -1 };
    /**
	 * 数据
	 * this.nodesField 子级节点字段
	 */
    this.data = this.root[this.nodesField] = [];

    this._idNodes = {};
    this.idNodes = {};
    this._viewNodes = null;

    mini.Tree.superclass.constructor.call(this, config);
    /**
	 * 添加beforeexpand事件
	 * @param {Object} e
	 */
    this.on("beforeexpand", function (e) {
        var node = e.node;
        var isLeaf = this.isLeaf(node);
        var cs = node[this.nodesField];

        if (!isLeaf && (!cs || cs.length == 0)) {
            if (this.loadOnExpand && node.asyncLoad !== false) {
                e.cancel = true;
                this.loadNode(node);
            }
        }
    }, this);

    this.doUpdate();
}
mini.Tree.NodeUID = 1;
var lastNodeLevel = [];
mini.extend(mini.Tree, mini.Control, {
    isTree: true,
    _displayStyle: "block",
    /**
     * 是否自动转义html字符
     * @type String
     */
    autoEscape: true,

    loadOnExpand: true,
    /**
	 * 收缩节点被删除。极大提升性能。
	 * @default true
	 */
    removeOnCollapse: true,
    /**
	 * 双击节点展开收缩
	 * @default true
	 */
    expandOnDblClick: true,

    expandOnNodeClick: false,
    /**
	 * 选中的节点值
	 */
    value: "",
    /**
	 * 选中的节点
	 * @private
	 */
    _selectedNode: null,
    /**
	 * 允许选择节点
	 * @default true
	 */
    allowSelect: true,
    /**
	 * 允许Check模式选中节点
	 * @default false
	 */
    showCheckBox: false,
    /**
	 * 当showCheckBox为true时，是否显示父节点CheckBox
	 * @default true
	 */
    showFolderCheckBox: true,
    /**
	 * 显示折叠展开图标
	 * @default true
	 */
    showExpandButtons: true,
    /**
	 * 移动节点上时高亮显示
	 * @default true
	 */
    enableHotTrack: true,
    /**
	 * 显示箭头
	 * @default false
	 */
    showArrow: false,
    /**
	 * 加载后是否展开。比如：true展开所有节点；0展开第一级节点。以此类推。
	 * @default false
	 */
    expandOnLoad: false,
    /**
	 * 分隔符
	 */
    delimiter: ",",
    /**
	 * 数据加载地址
	 */
    url: "",
    /**
	 * 根节点
	 */
    root: null,
    /**
	 * url数据是否列表
	 * @default true
	 */
    resultAsTree: true,
    /**
	 * 父节点字段
	 */
    parentField: "pid",
    /**
	 * 值字段
	 */
    idField: "id",
    /**
	 * 节点文本字段
	 */
    textField: "text",
    /**
	 * 图标字段
	 */
    iconField: "iconCls",
    /**
	 * 子级节点字段
	 */
    nodesField: "children",

    /**
	 * 显示节点图标
	 * @default false
	 */
    showTreeIcon: false,
    /**
	 * 显示树形线条
	 * @default true
	 */
    showTreeLines: true,
    /**
	 * 是否联动选择父子节点。比如选中父节点，自动全选子节点。
	 * @default false
	 */
    checkRecursive: false,
    /**
	 * 是否动画效果
	 * @default true
	 */
    allowAnim: true,

    _checkBoxCls: "mini-tree-checkbox",
    _selectedNodeCls: "mini-tree-selectedNode",
    _nodeHoverCls: "mini-tree-node-hover",
    /**
	 * 叶子结点的图标
	 */
    leafIcon: "mini-tree-leaf",
    /**
	 * 目录结点的图标
	 */
    folderIcon: "mini-tree-folder",

    _borderCls: "mini-tree-border",
    _headerCls: "mini-tree-header",
    _bodyCls: "mini-tree-body",

    _nodeCls: "mini-tree-node",
    _nodesCls: "mini-tree-nodes",

    _expandNodeCls: "mini-tree-expand",
    _collapseNodeCls: "mini-tree-collapse",
    _eciconCls: "mini-tree-node-ecicon",
    _inNodeCls: "mini-tree-nodeshow",
    /**
	 * 设置属性方法
	 * @see mini.Component
	 */
    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var value = kv.value;
        delete kv.value;
        var url = kv.url;
        delete kv.url;
        var data = kv.data;
        delete kv.data;





        mini.Tree.superclass.set.call(this, kv);

        if (!mini.isNull(data)) {
            this.setData(data);
        }
        if (!mini.isNull(url)) {
            this.setUrl(url);
        }
        if (!mini.isNull(value)) {
            this.setValue(value);
        }



        return this;
    },

    uiCls: "mini-tree",
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        mini.clearEvent(document);
        delete this._idNodes;
        delete this.idNodes;
        delete this._viewNodes;
        delete this._selectedNode;
        delete this._focusedNode;

        if (this._headerEl) {
            mini.clearEvent(this._headerEl);
            this._borderEl.removeChild(this._headerEl);
            this._headerEl = null;
        }
        if (this._bodyEl) {
            mini.clearEvent(this._bodyEl);
            this._borderEl.removeChild(this._bodyEl);
            this._bodyEl = null;
        }
        if (this._borderEl) {
            mini.clearEvent(this._borderEl);
            this.el.removeChild(this._borderEl);
            this._borderEl = null;
        }
        if (this._DragDrop) {
            mini.clearEvent(this._DragDrop);
            this._DragDrop.destroy(removeEl);
            this._DragDrop = null;
        }
        delete this._cellErrors;
        delete this._cellMapErrors;
        delete this.data;
        delete this._list;
        delete this.root;
        delete this._indexs;
        mini.Tree.superclass.destroy.call(this, removeEl);
    },
    /**
	 * 创建组件DOM树, 添加插件
	 *
	 * @private
	 */
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-tree";

        if (this.showTreeLines == true) {
            mini.addClass(this.el, 'mini-tree-treeLine');
        }
        this.el.style.display = "block";

        this._borderEl = mini.append(this.el, '<div class="' + this._borderCls + '">'
            + '<div class="' + this._headerCls + '"></div><div class="' + this._bodyCls + '"></div></div>');
        this._headerEl = this._borderEl.childNodes[0];
        this._bodyEl = this._borderEl.childNodes[1];

        this._DragDrop = new mini._TreeDragDrop(this);
    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__OnClick, this);
            mini.on(this.el, "dblclick", this.__OnDblClick, this);
            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            mini.on(this.el, 'mousemove', this.__OnMouseMove, this);
            mini.on(this.el, 'mouseout', this.__OnMouseOut, this);
        }, this);


    },
    
    /**
	 * 加载数据
	 * @param {Object} data 加载数据的URL
	 */
    load: function (data) {
        if (typeof data == "string") {
            this.url = data;
            this._doLoad({}, this.root);
        }
        else this.setData(data);
    },
    setData: function (data) {
        this.loadData(data);
        this.data = data;

        this._cellErrors = [];
        this._cellMapErrors = {};
    },
    getData: function () {
        return this.data;
    },
    toArray: function () {
        return this.getList();
    },
    /**
	 * 返回列表型结构的结点列表
	 */
    getList: function () {
        if (!this._list) {
            this._list = mini.treeToArray(this.root[this.nodesField], this.nodesField, this.idField, this.parentField, "-1");

            this._indexs = {};
            for (var i = 0, l = this._list.length; i < l; i++) {
                var node = this._list[i];
                this._indexs[node[this.idField]] = i;
            }
        }
        return this._list;
    },
    _clearTree: function () {
        this._list = null;
        this._indexs = null;
    },
    /**
	 * 加载列表数据。比如：tree.loadList(list, "id", "pid")
	 */
    loadList: function (list, idField, parentField) {
        idField = idField || this.idField;
        parentField = parentField || this.parentField;
        var tree = mini.arrayToTree(list, this.nodesField, idField, parentField);
        this.setData(tree);
    },
    /**
	 * 加载数据, 并展现
	 * @param {Object} data json数组对象, 树型结构
	 */
    loadData: function (data) {
        if (!mini.isArray(data)) data = [];
        


        this.root[this.nodesField] = data;

        this.data = data;
        //重新加载数据时清空缓存，解决url发生变化时缓存不正常问题  赵美丹 2013-02-20
        this.idNodes = {};
        this._idNodes = {};

        this._updateParentAndLevel(this.root, null);

        
        this.cascadeChild(this.root, function (node) {
           
            if (mini.isNull(node.expanded)) {

                var level = this.getLevel(node);
                if (this.expandOnLoad === true
                    || (mini.isNumber(this.expandOnLoad) && level <= this.expandOnLoad)) {
                    node.expanded = true;
                } else {
                    node.expanded = false;
                }

            }

            if (node.isLeaf === false) {
                var cs = node[this.nodesField];
                if (cs && cs.length > 0) {
                    delete node.isLeaf;
                }
            }
        }, this);

        // 清空可见的结点
        this._viewNodes = null;


        this._selectedNode = null;

        this.doUpdate();

    },
    clearData: function () {
        this.loadData([]);
    },
    setUrl: function (url) {

        // 设置URL后, 就开始加载数据
        this.url = url;
        this.load(url);

    },
    getUrl: function () {
        return this.url;
    },
    /**
	 * 懒加载节点下一级数据。
	 * @param {Object} node
	 * @param {Object} expand
	 */
    loadNode: function (node, expand) {
        node = this.getNode(node);
        if (!node) return;
        if (this.isLeaf(node)) return;

        var params = {};

        params[this.idField] = this.getItemValue(node);

        var sf = this;

        sf.addNodeCls(node, "mini-tree-loading");

        var async = this._ajaxOption.async;
        this._ajaxOption.async = true;

        var time = new Date();
        this._doLoad(params, node, function (data) {
            var t = new Date() - time;
            if (t < 60) t = 60 - t;

            setTimeout(function () {
                sf._ajaxOption.async = async;

                sf.removeNodeCls(node, "mini-tree-loading");
                sf.removeNodes(node[sf.nodesField]);
                if (data && data.length > 0) {

                    sf.addNodes(data, node);
                    if (expand !== false) {
                        sf.expandNode(node, true);
                    } else {
                        sf.collapseNode(node, true);
                    }
                    sf.fire("loadnode", { node: node });
                } else {
                    delete node.isLeaf;
                    sf._doUpdateNodeTitle(node);
                }
            }, t);
        }, function (error) {

            sf.removeNodeCls(node, "mini-tree-loading");

        }
        );
        this.ajaxAsync = false;
    },
    _ajaxOption: {
        async: false,
        type: "get"
    },
    setAjaxOption: function (option) {
        mini.copyTo(this._ajaxOption, option);
    },
    getAjaxOption: function (option) {
        return this._ajaxOption;
    },

    /**
	 * 加载数据
	 * @private
	 * @param {Object} params
	 * @param {Object} node
	 * @param {Object} success
	 * @param {Object} fail
	 */
    _doLoad: function (params, node, success, fail) {
        try {
            var url = eval(this.url);
            if (url != undefined) {
                this.url = url;
            }
        } catch (e) { }

        var isRoot = node == this.root;
        var e = {
            url: this.url,
            async: this._ajaxOption.async,
            type: this._ajaxOption.type,
            params: params,
            data: params,
            cache: false,
            cancel: false,
            node: node,
            isRoot: isRoot
        };
        this.fire("beforeload", e);
        if (e.data != e.params && e.params != params) {
            e.data = e.params;
        }
        if (e.cancel == true) return;

        if (node != this.root) {

        }

        var sf = this;

        //数据加载增加loading效果 赵美丹 2013-05-29
        var container = node;
        if (isRoot) {
            mini.addClass(this._bodyEl, "mini-tree-loading");
            this._bodyEl.innerHTML = "<div class='mini-treegrid-ec-icon'>&nbsp;</div>";
        } else {
            sf.addNodeCls(container, "mini-tree-loading");
        }
        mini.copyTo(e, {
            success: function (text, code, jqXHR) {
                //数据加载增加loading效果 赵美丹 2013-05-29
                if (isRoot) {
                    mini.removeClass(sf._bodyEl, "mini-tree-loading");
                    sf._bodyEl.innerHTML = "";
                } else {
                    sf.removeNodeCls(container, "mini-tree-loading");
                }

                var data = null;
                try {
                    data = mini.decode(text);
                } catch (ex) {
                    data = []
                    if (mini_debugger == true) {
                        alert("tree json is error.");
                    }
                }
                if (sf.dataField) {
                    data = mini._getMap(sf.dataField, data);
                }
                if (!data) data = [];

                var ex = { result: data, data: data, cancel: false, node: node }

                if (sf.resultAsTree == false) {
                    ex.data = mini.arrayToTree(ex.data, sf.nodesField, sf.idField, sf.parentField)
                }

                sf.fire("preload", ex);
                if (ex.cancel == true) return;

                if (isRoot) {
                    sf.setData(ex.data);
                }

                if (success) success(ex.data);


                sf._doCheckLoadNodes();

                sf.fire("load", ex);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //数据加载增加loading效果 赵美丹 2013-05-29
                if (isRoot) {
                    mini.removeClass(sf._bodyEl, "mini-tree-loading");
                    sf._bodyEl.innerHTML = "";
                } else {
                    sf.removeNodeCls(container, "mini-tree-loading");
                }

                var e = {
                    xmlHttp: jqXHR,
                    errorCode: textStatus
                };

                if (fail) fail(e);

                if (mini_debugger == true) {
                    alert("network error");
                }

                sf.fire("loaderror", e);
            }
        });
        this._ajaxer = mini.ajax(e);
    },
    /**
	 * 获取结点值
	 */
    getItemValue: function (item) {
        if (!item) return "";
        var t = mini._getMap(this.idField, item);
        return mini.isNull(t) ? '' : String(t);
    },
    /**
	 * 获取结点文本
	 */
    getItemText: function (item) {
        if (!item) return "";
        var t = mini._getMap(this.textField, item);
        return mini.isNull(t) ? '' : String(t);
    },
    _OnDrawNode: function (node) {
        var showCheckBox = this.showCheckBox;
        if (showCheckBox && this.hasChildren(node)) {
            showCheckBox = this.showFolderCheckBox;
        }




        var nodeHtml = this.getItemText(node);
        var e = {
            isLeaf: this.isLeaf(node),
            node: node,
            nodeHtml: nodeHtml,
            nodeCls: '',
            nodeStyle: "",
            showCheckBox: showCheckBox,
            iconCls: this.getNodeIcon(node),
            showTreeIcon: this.showTreeIcon
        };
        if (this.autoEscape == true) {
            e.nodeHtml = mini.htmlEncode(e.nodeHtml);
        }

        this.fire("drawnode", e);
        if (e.nodeHtml === null || e.nodeHtml === undefined || e.nodeHtml === "") e.nodeHtml = "&nbsp;";
        return e;
    },
    /**
	 * 创建结点内部的DOM对象, 包括缩进, 图标, checkbox和文本
	 */
    _createNodeTitle: function (node, useEdit, sb) {
        var isReturn = !sb;
        if (!sb) sb = [];
        var text = node[this.textField];
        if (text === null || text === undefined) text = "";

        var isLeaf = this.isLeaf(node);
        var level = this.getLevel(node);

        var e = this._OnDrawNode(node);

        var cls = e.nodeCls;

        if (!isLeaf) {
            cls = this.isExpandedNode(node) ? this._expandNodeCls : this._collapseNodeCls;
        }

        if (this._selectedNode == node) {
            cls += " " + this._selectedNodeCls;
        }

        if (node.enabled === false) {
            cls += " mini-disabled";
        }
        if (!isLeaf) {
            cls += " mini-tree-parentNode";
        }





        var subNodes = this.getChildNodes(node);
        var hasChilds = subNodes && subNodes.length > 0;

        sb[sb.length] = '<div class="mini-tree-nodetitle ' + cls + '" style="' + e.nodeStyle + '">';



        var parentNode = this.getParentNode(node);
        var ii = 0;

        for (var i = ii; i <= level; i++) {
            if (i == level) continue;

            if (isLeaf) {
                if (this.showExpandButtons == false && i >= level - 1) {
                    continue;
                }
            }

            var indentStyle = "";
            if (this._isInViewLastNode(node, i)) {
                indentStyle = "background:none";
            }


            sb[sb.length] = '<span class="mini-tree-indent " style="' + indentStyle + '"></span>';
        }


        var ecCls = "";
        if (this._isViewFirstNode(node)) {
            ecCls = "mini-tree-node-ecicon-first";
        } else if (this._isViewLastNode(node)) {
            ecCls = "mini-tree-node-ecicon-last";
        }

        if (this._isViewFirstNode(node) && this._isViewLastNode(node)) {

            ecCls = "mini-tree-node-ecicon-last";
            if (parentNode == this.root) {
                ecCls = "mini-tree-node-ecicon-firstLast";
            }
        }

        if (!isLeaf) {
            sb[sb.length] = '<a class="' + this._eciconCls + ' ' + ecCls + '" style="' + (this.showExpandButtons ? "" : "display:none") + '" href="javascript:void(0);" onclick="return false;" hidefocus></a>';
        } else {
            sb[sb.length] = '<span class="' + this._eciconCls + ' ' + ecCls + '" ></span>';
        }


        sb[sb.length] = '<span class="mini-tree-nodeshow">';
        if (e.showTreeIcon) {
            sb[sb.length] = '<span class="' + e.iconCls + ' mini-tree-icon"></span>';
        }

        if (e.showCheckBox) {
            var ckid = this._createCheckNodeId(node);
            var checked = this.isCheckedNode(node);

            sb[sb.length] = '<input type="checkbox" id="' + ckid + '" class="' + this._checkBoxCls + '" hidefocus ' + (checked ? "checked" : "") + ' ' + (node.enabled === false ? "disabled" : "") + '/>';
        }

        sb[sb.length] = '<span class="mini-tree-nodetext">';
        if (useEdit) {
            var editId = this.uid + "$edit$" + node._id;
            var text = node[this.textField];
            if (text === null || text === undefined) text = "";
            sb[sb.length] = '<input id="' + editId + '" type="text" class="mini-tree-editinput" value="' + text + '"/>';
        } else {
            //解决特殊字符无法正常显示的问题 赵美丹 2013-03-19
            if (this.autoEscape) {
                sb[sb.length] = mini.htmlEncode(e.nodeHtml);
            } else {
                sb[sb.length] = e.nodeHtml;
            }
        }



        sb[sb.length] = '</span>';
        sb[sb.length] = '</span>';

        sb[sb.length] = '</div>';


        if (isReturn) return sb.join('');
    },
    /**
	 * 创建一个结点, 包括整个结点的div及nodeId, 结点内部采用_createNodeTitle创建, 并根据可视子结点递归创建。
	 */
    _createNode: function (node, sb) {
        var isReturn = !sb;
        if (!sb) sb = [];
        if (!node) return "";
        var nodeId = this._createNodeId(node);
        var display = this.isVisibleNode(node) ? "" : "display:none";

        sb[sb.length] = '<div id="';
        sb[sb.length] = nodeId;
        sb[sb.length] = '" class="';
        sb[sb.length] = this._nodeCls;
        sb[sb.length] = '" style="';
        sb[sb.length] = display;
        sb[sb.length] = '">';

        this._createNodeTitle(node, false, sb);

        var nodes = this._getViewChildNodes(node);

        if (nodes) {
            if (this.removeOnCollapse && this.isExpandedNode(node)) {
                this._createNodes(nodes, node, sb);
            }
        }

        sb[sb.length] = '</div>';
        if (isReturn) return sb.join('');
    },
    /**
	 * 创建本结点下的全部子结点
	 */
    _createNodes: function (nodes, pnode, sb) {
        var isReturn = !sb;
        if (!sb) sb = [];

        if (!nodes) return "";

        var nodesId = this._createNodesId(pnode);

        var display = this.isExpandedNode(pnode) ? "" : "display:none";

        sb[sb.length] = '<div id="';
        sb[sb.length] = nodesId;
        sb[sb.length] = '" class="';
        sb[sb.length] = this._nodesCls;
        sb[sb.length] = '" style="';
        sb[sb.length] = display;
        sb[sb.length] = '">';
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            this._createNode(node, sb);
        }
        sb[sb.length] = '</div>';

        if (isReturn) return sb.join('');
    },
    /**
	 * 创建根结点下的子结点, 并输出到html页面上
	 */
    doUpdate: function () {
        if (!this._allowUpdate) return;

        // 获取可见的字结点
        var nodes = this._getViewChildNodes(this.root);
        var sb = [];
        this._createNodes(nodes, this.root, sb);
        var s = sb.join('');
        this._bodyEl.innerHTML = s;

        this._deferLayout();


    },
    _doLayoutHeader: function () {
    },

    _deferLayout: function () {
        var me = this;
        if (this._layoutTimer) return;
        this._layoutTimer = setTimeout(function () {
            me.doLayout();
            me._layoutTimer = null;
        }, 1);
    },
    /**
	 * 改变样式
	 */
    doLayout: function () {
        if (this.showCheckBox) {
            mini.addClass(this.el, "mini-tree-showCheckBox");
        } else {
            mini.removeClass(this.el, "mini-tree-showCheckBox");
        }

        if (this.enableHotTrack) {
            mini.addClass(this.el, "mini-tree-hottrack");
        } else {
            mini.removeClass(this.el, "mini-tree-hottrack");
        }

        var rootNodesEl = this.el.firstChild;
        if (rootNodesEl) {
            mini.addClass(rootNodesEl, "mini-tree-rootnodes");
        }
    },
    /**
	 * 过滤器
	 * tree.filter(function(node){
	 *     if(node.name.indexOf("abc") != -1) return true;
	 *   });
	 */
    filter: function (fn, scope) {

        scope = scope || this;
        var viewNodes = this._viewNodes = {}, nodesField = this.nodesField;
        function filter(node) {
            var nodes = node[nodesField];
            if (!nodes) return false;
            var id = node._id;
            var views = [];

            for (var i = 0, l = nodes.length; i < l; i++) {
                var r = nodes[i];
                var cadd = filter(r);
                var add = fn.call(scope, r, i, this);

                if (add === true || cadd) {
                    views.push(r);
                }
            }
            if (views.length > 0) viewNodes[id] = views;
            return views.length > 0;
        }

        filter(this.root);


        this.doUpdate();

        //增加返回值，解决该组件未提供任何filter后的显示节点接口的问题 赵美丹 2013-03-28
        return this._viewNodes;

    },
    /**
	 * 取消过滤
	 */
    clearFilter: function () {
        if (this._viewNodes) {
            this._viewNodes = null;
            this.doUpdate();
        }
    },

    setShowCheckBox: function (value) {
        if (this.showCheckBox != value) {
            this.showCheckBox = value;
            this.doUpdate();
        }
    },
    getShowCheckBox: function () {
        return this.showCheckBox;
    },
    setShowFolderCheckBox: function (value) {
        if (this.showFolderCheckBox != value) {
            this.showFolderCheckBox = value;
            this.doUpdate();
        }
    },
    getShowFolderCheckBox: function () {
        return this.showFolderCheckBox;
    },
    setAllowSelect: function (value) {
        if (this.allowSelect != value) {
            this.allowSelect = value;
            this.doUpdate();
        }
    },
    getAllowSelect: function () {
        return this.allowSelect;
    },
    setShowTreeIcon: function (value) {
        if (this.showTreeIcon != value) {
            this.showTreeIcon = value;
            this.doUpdate();
        }
    },
    getShowTreeIcon: function () {
        return this.showTreeIcon;
    },
    setShowExpandButtons: function (value) {
        if (this.showExpandButtons != value) {
            this.showExpandButtons = value;
            this.doUpdate();
        }
    },
    getShowExpandButtons: function () {
        return this.showExpandButtons;
    },
    setEnableHotTrack: function (value) {
        if (this.enableHotTrack != value) {
            this.enableHotTrack = value;
            this.doLayout();
        }
    },
    getEnableHotTrack: function () {
        return this.enableHotTrack;
    },
    setExpandOnLoad: function (value) {
        this.expandOnLoad = value;
    },
    getExpandOnLoad: function () {
        return this.expandOnLoad;
    },

    setCheckRecursive: function (value) {
        if (this.checkRecursive != value) {
            this.checkRecursive = value;
        }
    },
    getCheckRecursive: function () {
        return this.checkRecursive;
    },
    getNodeIcon: function (node) {
        var icon = mini._getMap(this.iconField, node);
        if (!icon) {
            if (this.isLeaf(node)) icon = this.leafIcon;
            else icon = this.folderIcon;
        }
        return icon;
    },

    isAncestor: function (parentNode, node) {
        if (parentNode == node) return true;
        if (!parentNode || !node) return false;
        var as = this.getAncestors(node);
        for (var i = 0, l = as.length; i < l; i++) {
            if (as[i] == parentNode) return true;
        }
        return false;
    },

    getAncestors: function (node) {
        var as = [];
        while (1) {
            var parentNode = this.getParentNode(node);
            if (!parentNode || parentNode == this.root) break;
            as[as.length] = parentNode;
            node = parentNode;
        }
        as.reverse();
        return as;
    },
    getRootNode: function () {
        return this.root;
    },
    getParentNode: function (node) {
        if (!node) return null;
        if (node._pid == this.root._id) return this.root;
        return this._idNodes[node._pid];

    },
    _isViewFirstNode: function (node) {
        if (this._viewNodes) {
            var pnode = this.getParentNode(node);
            var nodes = this._getViewChildNodes(pnode);
            return nodes[0] === node;
        } else {
            return this.isFirstNode(node);
        }
    },
    _isViewLastNode: function (node) {
        if (this._viewNodes) {
            var pnode = this.getParentNode(node);
            var nodes = this._getViewChildNodes(pnode);
            return nodes[nodes.length - 1] === node;
        } else {
            return this.isLastNode(node);
        }
    },
    _isInViewLastNode: function (node, level) {
        if (this._viewNodes) {
            var pnode = null;
            var ans = this.getAncestors(node);
            for (var i = 0, l = ans.length; i < l; i++) {
                var a = ans[i];
                if (this.getLevel(a) == level) {
                    pnode = a;
                }
            }
            if (!pnode || pnode == this.root) return false;
            return this._isViewLastNode(pnode);
        } else {
            return this.isInLastNode(node, level);
        }
    },

    _getViewChildNodes: function (node) {
        if (this._viewNodes) {
            return this._viewNodes[node._id];
        } else {
            return this.getChildNodes(node);
        }
    },
    getChildNodes: function (node) {
        node = this.getNode(node);
        if (!node) return null;
        return node[this.nodesField];
    },
    getAllChildNodes: function (node) {
        node = this.getNode(node);
        if (!node) return [];
        var nodes = [];
        this.cascadeChild(node, function (cnode) {
            nodes.push(cnode);
        }, this);
        return nodes;
    },
    indexOf: function (node) {
        node = this.getNode(node);
        if (!node) return -1;

        this.getList();
        var index = this._indexs[node[this.idField]];
        if (mini.isNull(index)) return -1;
        return index;
    },
    getAt: function (index) {
        var list = this.getList();
        return list[index];
    },
    indexOfChildren: function (node) {
        var parentNode = this.getParentNode(node);
        if (!parentNode) return -1;
        var childNodes = parentNode[this.nodesField];
        return childNodes.indexOf(node);
    },
    hasChildren: function (node) {
        var subNodes = this.getChildNodes(node);
        return !!(subNodes && subNodes.length > 0);
    },
    isLeaf: function (node) {
        if (!node || node.isLeaf === false) return false;
        var nodes = this.getChildNodes(node);
        if (nodes && nodes.length > 0) return false;
        return true;
    },
    getLevel: function (node) {
        return node._level;
    },
    isExpandedNode: function (node) {
        node = this.getNode(node);
        if (!node) return false;
        return node.expanded == true || mini.isNull(node.expanded);
    },
    isCheckedNode: function (node) {
        node = this.getNode(node);
        if (!node) return false;
        return node.checked == true;
    },
    isVisibleNode: function (node) {
        if (node.visible == false) return false;
        var pnode = this.getParentNode(node);
        if (!pnode || pnode == this.root) return true;
        if (pnode.expanded === false) return false;
        return this.isVisibleNode(pnode);
    },

    isEnabledNode: function (node) {
        return node.enabled !== false || this.enabled;
    },
    isFirstNode: function (node) {
        var pnode = this.getParentNode(node);
        var nodes = this.getChildNodes(pnode);
        return nodes[0] === node;
    },
    isLastNode: function (node) {
        var pnode = this.getParentNode(node);
        var nodes = this.getChildNodes(pnode);
        return nodes[nodes.length - 1] === node;
    },
    isInLastNode: function (node, level) {
        var pnode = null;
        var ans = this.getAncestors(node);
        for (var i = 0, l = ans.length; i < l; i++) {
            var a = ans[i];
            if (this.getLevel(a) == level) {
                pnode = a;
            }
        }
        if (!pnode || pnode == this.root) return false;
        return this.isLastNode(pnode);
    },

    /**
	 * 由当前节点开始一直上溯到根节点，调用fn，直到fn返回false为止。
	 */
    bubbleParent: function (node, fn, scope) {
        scope = scope || this;
        if (node) fn.call(this, node);
        var parentNode = this.getParentNode(node);
        if (parentNode && parentNode != this.root) {
            this.bubbleParent(parentNode, fn, scope);
        }
    },
    /**
	 * 遍历所有层次的子节点, 直到返回false
	 */
    cascadeChild: function (node, fn, scope) {
        if (!fn) return;
        if (!node) node = this.root;
        var nodes = node[this.nodesField];
        if (nodes) {
            nodes = nodes.clone();
            for (var i = 0, l = nodes.length; i < l; i++) {
                var c = nodes[i];
                if (fn.call(scope || this, c, i, node) === false) return;
                this.cascadeChild(c, fn, scope);
            }
        }
    },
    /**
	 * 遍历下一级子节点
	 */
    eachChild: function (node, fn, scope) {
        if (!fn || !node) return;
        var nodes = node[this.nodesField];
        if (nodes) {
            var list = nodes.clone();
            for (var i = 0, l = list.length; i < l; i++) {
                var o = list[i];
                if (fn.call(scope || this, o, i, node) === false) break;
            }
        }
    },
    _updateParentAndLevel: function (node, parentNode) {
        if (!node._id) {
            node._id = mini.Tree.NodeUID++;
        }
        this._idNodes[node._id] = node;
        this.idNodes[node[this.idField]] = node;
        node._pid = parentNode ? parentNode._id : "";
        node._level = parentNode ? parentNode._level + 1 : -1;
        this.cascadeChild(node, function (n, i, p) {
            if (!n._id) {
                n._id = mini.Tree.NodeUID++;
            }
            this._idNodes[n._id] = n;
            this.idNodes[n[this.idField]] = n;
            n._pid = p._id;
            n._level = p._level + 1;
        }, this);

        this._clearTree();
    },

    _updateNodeElLevel: function (node) {
        var sf = this;
        function updateECIcon(node) {







            sf._doUpdateNodeTitle(node);
        }
        if (node != this.root) {
            updateECIcon(node);
        }
        this.cascadeChild(node, function (node) {
            updateECIcon(node);

        }, this);
    },
    /**
	 * 删除多个节点
	 */
    removeNodes: function (nodes) {
        if (!mini.isArray(nodes)) return;
        nodes = nodes.clone();
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.removeNode(node);
        }
    },
    _doUpdateNodeTitle: function (node) {
        var s = this._createNodeTitle(node);
        var nodeEl = this._getNodeEl(node);
        if (nodeEl) {
            jQuery(nodeEl.firstChild).replaceWith(s);
        }
    },
    /**
	 * 设置节点文本
	 */
    setNodeText: function (node, text) {
        node = this.getNode(node);
        if (!node) return;

        node[this.textField] = text;
        this._doUpdateNodeTitle(node);
    },
    /**
	 * 设置节点图标
	 */
    setNodeIconCls: function (node, iconCls) {
        node = this.getNode(node);
        if (!node) return;

        node[this.iconField] = iconCls;
        this._doUpdateNodeTitle(node);
    },
    /**
	 * 更新节点内容。比如：tree.updateNode(node, {text: "abc"});
	 */
    updateNode: function (node, obj) {
        node = this.getNode(node);
        if (!node || !obj) return;
        var cs = node[this.nodesField];
        mini.copyTo(node, obj);
        node[this.nodesField] = cs;
        this._doUpdateNodeTitle(node);
     },
    /**
	 * 删除节点
	 */
    removeNode: function (node) {
        node = this.getNode(node);
        if (!node) return;

        if (this._selectedNode == node) {
            this._selectedNode = null;
        }

        var nodes = [node];
        this.cascadeChild(node, function (n) {
            nodes.push(n);
        }, this);



        var parentNode = this.getParentNode(node);
        parentNode[this.nodesField].remove(node);
        this._updateParentAndLevel(node, parentNode);




        var nodeEl = this._getNodeEl(node);
        if (nodeEl) {
            nodeEl.parentNode.removeChild(nodeEl);
            //解决IE8兼容模式、Ie6下删除节点时显示异常问题 赵美丹 2013-03-09
            if (this.isLeaf(parentNode)) {
                var nodesEl = this._getNodesEl(parentNode);
                nodesEl.parentNode.removeChild(nodesEl);
            }
        }
        this._updateNodeElLevel(parentNode);


        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            delete node._id;
            delete node._pid;
            delete this._idNodes[node._id];
            delete this.idNodes[node[this.idField]];
        }
    },
    //提前获取节点拖放后的父节点 潘正锋 2013-06-22
    _getDropedParentNode: function (node, action, targetNode) {
        if (!targetNode) action = "add";
        switch (action) {
            case "before":
                if (!targetNode) return null;
                var parentNode = this.getParentNode(targetNode);
                return parentNode;
                break;
            case "after":
                if (!targetNode) return null;
                parentNode = this.getParentNode(targetNode);
                return parentNode;
                break;
            case "add":
                return targetNode
                break;
            default:
                return null;
                break;
        }
    },
    /**
	 * 增加多个节点
	 */
    addNodes: function (nodes, parentNode, action) {
        if (!mini.isArray(nodes)) return;
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.addNode(node, action, parentNode);
        }
    },



    /**
	 * 加入节点
	 */
    addNode: function (node, index, parentNode) {
        node = this.getNode(node);
        if (!node) return;
        if (!parentNode) index = "add";
        var targetNode = parentNode;
        switch (index) {
            case "before":
                if (!targetNode) return;
                parentNode = this.getParentNode(targetNode);
                var childNodes = parentNode[this.nodesField];
                index = childNodes.indexOf(targetNode);
                break;
            case "after":
                if (!targetNode) return;
                parentNode = this.getParentNode(targetNode);
                var childNodes = parentNode[this.nodesField];
                index = childNodes.indexOf(targetNode) + 1;
                break;
            case "add":

                break;
            default:

                break;
        }
        parentNode = this.getNode(parentNode);
        if (!parentNode) parentNode = this.root;
        var nodes = parentNode[this.nodesField];
        if (!nodes) nodes = parentNode[this.nodesField] = [];


        index = parseInt(index);
        if (isNaN(index)) index = nodes.length;

        var targetNode = nodes[index];
        if (!targetNode) index = nodes.length;

        nodes.insert(index, node);
        this._updateParentAndLevel(node, parentNode);


        var nodesEl = this._getNodesEl(parentNode);
        if (nodesEl) {
            var s = this._createNode(node);
            var index = nodes.indexOf(node) + 1;
            var targetNode = nodes[index];
            if (targetNode) {
                var targetEl = this._getNodeEl(targetNode);
                jQuery(targetEl).before(s);
            } else {
                mini.append(nodesEl, s);
            }
        } else {
            var s = this._createNode(parentNode);
            var nodeEl = this._getNodeEl(parentNode);
            jQuery(nodeEl).replaceWith(s);
        }

        parentNode = this.getParentNode(node);
        this._updateNodeElLevel(parentNode);
    },
    /**
	 * 移动多个结点
	 */
    moveNodes: function (nodes, targetNode, action) {

        if (!nodes || nodes.length == 0 || !targetNode || !action) return;
        this.beginUpdate();
        var sf = this;
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.moveNode(node, targetNode, action);
            if (i != 0) {
                targetNode = node;
                action = "after";
            }

        }
        this.endUpdate();

    },
    moveNode: function (node, targetNode, action) {
        node = this.getNode(node);
        targetNode = this.getNode(targetNode);
        if (!node || !targetNode || !action) return false;

        if (this.isAncestor(node, targetNode)) return false;

        var index = -1;
        var parentNode = null;
        switch (action) {
            case "before":
                parentNode = this.getParentNode(targetNode);
                index = this.indexOfChildren(targetNode);
                break;
            case "after":
                parentNode = this.getParentNode(targetNode);
                index = this.indexOfChildren(targetNode) + 1;
                break;
            default:
                parentNode = targetNode;
                var childNodes = this.getChildNodes(parentNode);
                if (!childNodes) {
                    childNodes = parentNode[this.nodesField] = [];
                }
                index = childNodes.length;
                break;
        }


        var _node = {};

        var childNodes = this.getChildNodes(parentNode);
        childNodes.insert(index, _node);

        var _parentNode = this.getParentNode(node);
        var _childNodes = this.getChildNodes(_parentNode);
        _childNodes.remove(node);

        index = childNodes.indexOf(_node);
        childNodes[index] = node;

        this._updateParentAndLevel(node, parentNode);

        this.doUpdate();
        return true;
    },

    isEditingNode: function (node) {
        return this._editingNode == node;
    },
    beginEdit: function (node) {
        node = this.getNode(node);
        if (!node) return;

        var nodeEl = this._getNodeEl(node);
        var s = this._createNodeTitle(node, true);
        var nodeEl = this._getNodeEl(node);
        if (nodeEl) {
            jQuery(nodeEl.firstChild).replaceWith(s);
        }
        this._editingNode = node;

        var editId = this.uid + "$edit$" + node._id;

        this._editInput = document.getElementById(editId);

        this._editInput.focus();
        mini.selectRange(this._editInput, 1000, 1000);
        mini.on(this._editInput, "keydown", this.__OnEditInputKeyDown, this);
        mini.on(this._editInput, "blur", this.__OnEditInputBlur, this);
    },
    cancelEdit: function () {
        if (this._editingNode) {
            this._doUpdateNodeTitle(this._editingNode);

            mini.un(this._editInput, "keydown", this.__OnEditInputKeyDown, this);
            mini.un(this._editInput, "blur", this.__OnEditInputBlur, this);
        }
        this._editingNode = null;
        this._editInput = null;

    },
    __OnEditInputKeyDown: function (e) {
        if (e.keyCode == 13) {
            var text = this._editInput.value;
            this.setNodeText(this._editingNode, text);
            this.cancelEdit();
            this.fire("endedit", { node: this._editingNode, text: text });
        } else if (e.keyCode == 27) {
            this.cancelEdit();
        }
    },
    __OnEditInputBlur: function (e) {
        var text = this._editInput.value;
        this.setNodeText(this._editingNode, text);
        this.cancelEdit();
        this.fire("endedit", { node: this._editingNode, text: text });
    },


    _getNodeByEvent: function (e) {

        if (mini.hasClass(e.target, this._nodesCls)) return null;
        var t = mini.findParent(e.target, this._nodeCls);
        if (t) {
            var ids = t.id.split("$");
            var id = ids[ids.length - 1];
            var node = this._idNodes[id];
            return node;
        }
        return null;
    },
    _createNodeId: function (node) {
        return this.uid + "$" + node._id;
    },
    _createNodesId: function (node) {
        return this.uid + "$nodes$" + node._id;
    },
    _createCheckNodeId: function (node) {
        return this.uid + "$check$" + node._id;
    },
    addNodeCls: function (node, cls) {
        var nodeEl = this._getNodeEl(node);
        if (nodeEl) mini.addClass(nodeEl, cls);
    },
    removeNodeCls: function (node, cls) {
        var nodeEl = this._getNodeEl(node);
        if (nodeEl) mini.removeClass(nodeEl, cls);
    },
    getNodeBox: function (node) {
        var el = this._getNodeEl(node);


        if (el) return mini.getBox(el.firstChild);
    },
    _getNodeEl: function (node) {
        if (!node) return null;
        var id = this._createNodeId(node);
        return document.getElementById(id);
    },
    _getNodeHoverEl: function (node) {
        if (!node) return null;
        var el = this._getNodeTitleEl(node);
        if (el) {
            el = mini.byClass(this._inNodeCls, el);
            return el;
        }
        return null;
    },
    _getNodeTitleEl: function (node) {
        var el = this._getNodeEl(node);
        if (el) return el.firstChild;
    },
    _getNodesEl: function (node) {
        if (!node) return null;
        if (this.isVisibleNode(node) == false) return null;
        var id = this._createNodesId(node);
        return mini.byId(id, this.el);
    },
    _getCheckBoxEl: function (node) {
        if (!node) return null;
        if (this.isVisibleNode(node) == false) return null;
        var id = this._createCheckNodeId(node);
        return mini.byId(id, this.el);
    },
    /**
	 * 查找节点数据。如：
	 * var nodes = tree.findNodes(function(node){
	 *     if(node.name.indexOf("abc") != -1) return true;
	 *   });
	 */
    findNodes: function (fn, scope) {
        var nodes = [];
        scope = scope || this;
        this.cascadeChild(this.root, function (node) {
            if (fn && fn.call(scope, node) === true) {
                nodes.push(node);
            }
        }, this);
        return nodes;
    },
    getNode: function (node) {
        if (typeof node == "object") return node;
        return this.idNodes[node] || null;
    },
    /**
	 * 隐藏节点
	 */
    hideNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        node.visible = false;
        var el = this._getNodeEl(node);
        el.style.display = "none";
    },
    /**
	 * 显示节点
	 */
    showNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        node.visible = false;
        var el = this._getNodeEl(node);
        el.style.display = "";
    },
    /**
	 * 启用节点
	 */
    enableNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        node.enabled = true;
        var el = this._getNodeEl(node);
        mini.removeClass(el, "mini-disabled");
        var ck = this._getCheckBoxEl(node);
        if (ck) ck.disabled = false;
    },
    /**
	 * 禁用节点
	 */
    disableNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        node.enabled = false;
        var el = this._getNodeEl(node);
        mini.addClass(el, "mini-disabled");
        var ck = this._getCheckBoxEl(node);
        if (ck) ck.disabled = true;
    },
    _allowExpandLayout: true,
    /**
	 * 展开节点
	 */
    expandNode: function (node, allowAnim) {
        node = this.getNode(node);
        if (!node) return;
        var isExpand = this.isExpandedNode(node);
        if (isExpand) return;

        if (this.isLeaf(node)) return;

        node.expanded = true;

        var nodeEl = this._getNodeEl(node);
        if (this.removeOnCollapse && nodeEl) {
            var s = this._createNode(node);
            jQuery(nodeEl).before(s);
            jQuery(nodeEl).remove();
        }


        var el = this._getNodesEl(node);
        if (el) el.style.display = "";
        var el = this._getNodeEl(node);
        if (el) {
            var titleEl = el.firstChild;
            mini.removeClass(titleEl, this._collapseNodeCls);
            mini.addClass(titleEl, this._expandNodeCls);
        }
        this.fire("expand", { node: node });

        allowAnim = allowAnim && !(mini.isIE6);

        var nodes = this._getViewChildNodes(node);
        if (allowAnim && nodes && nodes.length > 0) {

            this._inAniming = true;
            var el = this._getNodesEl(node);
            if (!el) return;
            var h = mini.getHeight(el);
            el.style.height = "1px";
            if (this._doPositoin) {
                el.style.position = "relative";
            }
            var config = { height: h + "px" };

            var sf = this;
            var jq = jQuery(el);
            jq.animate(
                config,
                180,
                function () {

                    sf._inAniming = false;
                    sf._doLayoutHeader();
                    clearInterval(sf._animateTimer);


                    el.style.height = "auto";

                    if (sf._doPositoin) {
                        el.style.position = "static";
                    }

                    mini.repaint(nodeEl);
                }
            );
            clearInterval(this._animateTimer);
            this._animateTimer = setInterval(function () {
                sf._doLayoutHeader();
            }, 60);
        }
        this._doLayoutHeader();


        function doIndeterminate() {
            var nodes = this.getAllChildNodes(node);
            nodes.push(node);
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node && node._indeterminate) {
                    var checkboxEl = this._getCheckBoxEl(node);
                    if (checkboxEl && node._indeterminate) {
                        checkboxEl.indeterminate = node._indeterminate;
                    }
                }
            }
        }
        var me = this;

        doIndeterminate.call(me);


    },
    /**
	 * 收缩节点
	 */
    collapseNode: function (node, allowAnim) {

        node = this.getNode(node);
        if (!node) return;

        var isExpand = this.isExpandedNode(node);
        if (!isExpand) return;

        if (this.isLeaf(node)) return;

        node.expanded = false;
        var nodeEl = this._getNodeEl(node);

        var el = this._getNodesEl(node);
        if (el) el.style.display = "none";
        var el = this._getNodeEl(node);
        if (el) {
            var titleEl = el.firstChild;
            mini.removeClass(titleEl, this._expandNodeCls)
            mini.addClass(titleEl, this._collapseNodeCls);
        }
        this.fire("collapse", { node: node });

        allowAnim = allowAnim && !(mini.isIE6);
        var nodes = this._getViewChildNodes(node);
        if (allowAnim && nodes && nodes.length > 0) {
            this._inAniming = true;
            var el = this._getNodesEl(node);
            if (!el) return;
            el.style.display = "";
            el.style.height = "auto";
            if (this._doPositoin) {
                el.style.position = "relative";
            }

            var h = mini.getHeight(el);
            var config = { height: "1px" };

            var sf = this;
            var jq = jQuery(el);
            jq.animate(
                config,
                180,
                function () {
                    el.style.display = "none";
                    el.style.height = "auto";
                    if (sf._doPositoin) {
                        el.style.position = "static";
                    }
                    sf._inAniming = false;
                    sf._doLayoutHeader();
                    clearInterval(sf._animateTimer);


                    var nodesEl = sf._getNodesEl(node);
                    if (sf.removeOnCollapse && nodesEl) {
                        jQuery(nodesEl).remove();
                    }

                    mini.repaint(nodeEl);
                }
            );
            clearInterval(this._animateTimer);
            this._animateTimer = setInterval(function () {
                sf._doLayoutHeader();
            }, 60);
        } else {

            var nodesEl = this._getNodesEl(node);
            if (this.removeOnCollapse && nodesEl) {
                jQuery(nodesEl).remove();
            }
        }

        this._doLayoutHeader();

        if (this._allowExpandLayout) {
            mini.repaint(this.el);
        }
    },
    /**
	 * 展开/折叠结点
	 */
    toggleNode: function (node, allowAnim) {
        if (this.isExpandedNode(node)) {
            this.collapseNode(node, allowAnim);
        } else {
            this.expandNode(node, allowAnim);
        }
    },
    /**
	 * 展开层次节点
	 */
    expandLevel: function (level) {
        this.cascadeChild(this.root, function (node) {
            if (this.getLevel(node) == level) {
                if (node[this.nodesField] != null) {
                    this.expandNode(node);
                }
            }
        }, this);
    },
    /**
	 * 折叠层次节点
	 */
    collapseLevel: function (level) {
        this.cascadeChild(this.root, function (node) {
            if (this.getLevel(node) == level) {
                if (node[this.nodesField] != null) {
                    this.collapseNode(node);
                }
            }
        }, this);
    },
    /**
	 * 展开所有节点
	 */
    expandAll: function () {
        this.cascadeChild(this.root, function (node) {
            if (node[this.nodesField] != null) {
                this.expandNode(node);
            }
        }, this);
    },
    /**
	 * 收缩所有节点
	 */
    collapseAll: function () {
        this.cascadeChild(this.root, function (node) {
            if (node[this.nodesField] != null) {
                this.collapseNode(node);
            }
        }, this);
    },
    /**
	 * 展开节点路径
	 */
    expandPath: function (node) {
        node = this.getNode(node);
        if (!node) return;
        var ans = this.getAncestors(node);
        for (var i = 0, l = ans.length; i < l; i++) {
            this.expandNode(ans[i]);
        }
    },
    /**
	 * 折叠节点路径
	 */
    collapsePath: function (node) {
        node = this.getNode(node);
        if (!node) return;
        var ans = this.getAncestors(node);
        for (var i = 0, l = ans.length; i < l; i++) {
            this.collapseNode(ans[i]);
        }
    },
    /**
	 * 选中节点
	 */
    selectNode: function (node) {
        node = this.getNode(node);
        var el = this._getNodeEl(this._selectedNode);
        if (el) {
            mini.removeClass(el.firstChild, this._selectedNodeCls);
        }
        this._selectedNode = node;
        var el = this._getNodeEl(this._selectedNode);
        if (el) {
            mini.addClass(el.firstChild, this._selectedNodeCls);
        }
        // 节点选中时发生
        var ev = { node: node, isLeaf: this.isLeaf(node) };
        this.fire("nodeselect", ev);
    },
    /**
	 * 获取选中的节点
	 */
    getSelectedNode: function () {
        return this._selectedNode;
    },
    /**
	 * 获取选中的多个节点
	 */
    getSelectedNodes: function () {
        var nodes = [];
        if (this._selectedNode) nodes.push(this._selectedNode);
        return nodes;
    },

    doUpdateCheckedState: function () {

    },
    /**
	 * 是否自动选择父节点。比如选中子节点，将父节点也自动选中。
	 */
    autoCheckParent: false,
    setAutoCheckParent: function (value) {
        this.autoCheckParent = value;
    },
    getAutoCheckParent: function (value) {
        return this.autoCheckParent;
    },
    /**
	 * 是否存在选择的子结点
	 */
    hasCheckedChildNode: function (pnode) {
        var checked = false;
        var nodes = this.getAllChildNodes(pnode);
        for (var i = 0, l = nodes.length; i < l; i++) {
            var n = nodes[i];
            if (this.isCheckedNode(n)) {
                checked = true;
                break;
            }
        }
        return checked;
    },




    _doCheckLoadNodes: function () {

        var nodes = this.getList();
        var checkNodes = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.checked) {
                checkNodes.push(node);
            }
        }

        for (var i = 0, l = checkNodes.length; i < l; i++) {
            var node = checkNodes[i];
            this._doCheckNode(node, true, this.checkRecursive);
        }
    },



    _doCheckNode: function (node, checked, checkRecursive) {
        var checkNode = node;
        var ckNodes = [];

        node.checked = checked;
        node._indeterminate = false;
        ckNodes.push(node);

        if (checkRecursive) {

            this.cascadeChild(node, function (cnode) {
                cnode.checked = checked;
                cnode._indeterminate = false;
                ckNodes.push(cnode);
            }, this);


            var ans = this.getAncestors(node);
            ans.reverse();
            for (var i = 0, l = ans.length; i < l; i++) {
                var pnode = ans[i];
                var childNodes = this.getChildNodes(pnode);
                var checkAll = true, hasCheck = false;
                for (var ii = 0, ll = childNodes.length; ii < ll; ii++) {
                    var cnode = childNodes[ii];
                    if (this.isCheckedNode(cnode)) {
                        hasCheck = true;
                    } else {
                        checkAll = false;
                    }
                }
                if (checkAll) {
                    pnode.checked = true;
                    pnode._indeterminate = false;
                }
                else {
                    pnode.checked = false;
                    pnode._indeterminate = hasCheck;
                }
                ckNodes.push(pnode);
            }
        }

        for (var i = 0, l = ckNodes.length; i < l; i++) {
            var node = ckNodes[i];
            var checkEl = this._getCheckBoxEl(node);
            if (checkEl) {
                if (node.checked) {
                    checkEl.indeterminate = false;
                    checkEl.checked = true;
                } else {
                    checkEl.indeterminate = node._indeterminate;
                    checkEl.checked = false;
                }
            }
        }


        if (this.autoCheckParent) {
            var ans = this.getAncestors(checkNode);

            for (var i = 0, l = ans.length; i < l; i++) {
                var pnode = ans[i];
                var hasCheck = this.hasCheckedChildNode(pnode);
                if (hasCheck) {
                    pnode.checked = true;
                    pnode._indeterminate = false;

                    var checkEl = this._getCheckBoxEl(pnode);
                    if (checkEl) {
                        checkEl.indeterminate = false;
                        checkEl.checked = true;
                    }
                }
            }
        }
    },
    /**
	 * Check多选节点
	 */
    checkNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        this._doCheckNode(node, true, this.checkRecursive);
    },
    /**
	 * 取消Check多选节点
	 */
    uncheckNode: function (node) {
        node = this.getNode(node);
        if (!node) return;
        this._doCheckNode(node, false, this.checkRecursive);
    },
    /**
	 * Check多选多个节点
	 */
    checkNodes: function (nodes) {
        if (!mini.isArray(nodes)) nodes = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.checkNode(node);
        }
    },
    /**
	 * 取消Check多选多个节点
	 */
    uncheckNodes: function (nodes) {
        if (!mini.isArray(nodes)) nodes = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            this.uncheckNode(node);
        }
    },
    /**
	 * Check多选所有节点
	 */
    checkAllNodes: function () {
        this.cascadeChild(this.root, function (node) {

            this._doCheckNode(node, true, false);
        }, this);
    },
    /**
	 * 取消Check多选所有节点
	 */
    uncheckAllNodes: function (nodes) {
        this.cascadeChild(this.root, function (node) {

            this._doCheckNode(node, false, false);
        }, this);
    },
    /**
	 * 获取Check选中的多个节点
	 */
    getCheckedNodes: function (haveParent) {
        var nodes = [];
        var maps = {};
        this.cascadeChild(this.root, function (node) {
            if (node.checked == true) {
                nodes.push(node);
                if (haveParent) {
                    var ans = this.getAncestors(node);
                    for (var i = 0, l = ans.length; i < l; i++) {
                        var anode = ans[i];
                        if (!maps[anode._id]) {
                            maps[anode._id] = anode;
                            nodes.push(anode);
                        }
                    }
                }
            }
        }, this);
        return nodes;
    },
    setValue: function (value) {
        if (mini.isNull(value)) value = "";
        value = String(value);


        var nodes = this.getCheckedNodes();
        this.uncheckNodes(nodes);

        this.value = value;

        if (this.showCheckBox) {
            //修改逗号为this.delimiter，解决this.delimiter未起到实际作用的问题 赵美丹 2013-01-08
            var ids = String(value).split(this.delimiter);
            for (var i = 0, l = ids.length; i < l; i++) {
                this.checkNode(ids[i]);
            }
        } else {//解决单选时未选中树节点的问题 赵美丹 2013-04-01
            this.value = value;
            this.selectNode(value);
        }

    },
    getNodesByValue: function (value) {
        if (mini.isNull(value)) value = "";
        value = String(value);
        var nodes = [];
        //修改逗号为this.delimiter，解决this.delimiter未起到实际作用的问题 赵美丹 2013-01-08
        var ids = String(value).split(this.delimiter);
        for (var i = 0, l = ids.length; i < l; i++) {
            var node = this.getNode(ids[i]);
            if (node) nodes.push(node);
        }
        return nodes;
    },
    getValueAndText: function (records) {
        if (mini.isNull(records)) records = [];
        if (!mini.isArray(records)) {
            records = this.getNodesByValue(records);
        }
        var values = [];
        var texts = [];
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (record) {
                values.push(this.getItemValue(record));
                texts.push(this.getItemText(record));
            }
        }
        return [values.join(this.delimiter), texts.join(this.delimiter)];
    },
    /**
	 * 获取当前选中的结点值
	 */
    getValue: function (haveParent) {
        var nodes = this.getCheckedNodes(haveParent);
        var sb = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var id = this.getItemValue(nodes[i]);
            if (id) sb.push(id);
        }
        //修改逗号为this.delimiter，解决this.delimiter未起到实际作用的问题 赵美丹 2013-01-08
        return sb.join(this.delimiter);
    },
    setResultAsTree: function (value) {
        this.resultAsTree = value;
    },
    getResultAsTree: function () {
        return this.resultAsTree;
    },
    setParentField: function (value) {
        this.parentField = value;
    },
    getParentField: function () {
        return this.parentField;
    },
    setIdField: function (value) {
        this.idField = value;
    },
    getIdField: function () {
        return this.idField;
    },
    setTextField: function (value) {
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },
    setShowTreeLines: function (value) {
        this.showTreeLines = value;
        if (value == true) {
            mini.addClass(this.el, 'mini-tree-treeLine');
        } else {
            mini.removeClass(this.el, 'mini-tree-treeLine');
        }
    },
    getShowTreeLines: function () {
        return this.showTreeLines;
    },
    setShowArrow: function (value) {
        this.showArrow = value;
        if (value == true) {
            mini.addClass(this.el, 'mini-tree-showArrows');
        } else {
            mini.removeClass(this.el, 'mini-tree-showArrows');
        }
    },
    getShowArrow: function () {
        return this.showArrow;
    },
    
    setIconField: function (value) {
        this.iconField = value;
    },
    getIconField: function () {
        return this.iconField;
    },
    setNodesField: function (value) {
        this.nodesField = value;
    },
    getNodesField: function () {
        return this.nodesField;
    },
    setTreeColumn: function (value) {
        this.treeColumn = value;
    },
    getTreeColumn: function () {
        return this.treeColumn;
    },
    setLeafIcon: function (value) {
        this.leafIcon = value;
    },
    getLeafIcon: function () {
        return this.leafIcon;
    },
    setFolderIcon: function (value) {
        this.folderIcon = value;
    },
    getFolderIcon: function () {
        return this.folderIcon;
    },
    setExpandOnDblClick: function (value) {
        this.expandOnDblClick = value;
    },
    getExpandOnDblClick: function () {
        return this.expandOnDblClick;
    },
    setExpandOnNodeClick: function (value) {
        this.expandOnNodeClick = value;
        if (value) {
            mini.addClass(this.el, "mini-tree-nodeclick");
        } else {
            mini.removeClass(this.el, "mini-tree-nodeclick");
        }
    },
    getExpandOnNodeClick: function () {
        return this.expandOnNodeClick;
    },

    setRemoveOnCollapse: function (value) {
        this.removeOnCollapse = value;
    },
    getRemoveOnCollapse: function () {
        return this.removeOnCollapse;
    },
    setLoadOnExpand: function (value) {
        this.loadOnExpand = value;
    },
    getLoadOnExpand: function () {
        return this.loadOnExpand;
    },
    setAutoEscape: function (value) {
        this.autoEscape = value;
    },
    getAutoEscape: function () {
        return this.autoEscape;
    },


    __OnDblClick: function (e) {
        if (!this.enabled) return;
        if (mini.findParent(e.target, this._checkBoxCls)) return;

        var node = this._getNodeByEvent(e);
        if (node && node.enabled !== false) {
            if (mini.findParent(e.target, this._inNodeCls)) {
                var expanded = this.isExpandedNode(node);

                var ev = {
                    node: node,
                    expanded: expanded,
                    cancel: false
                };

                if (this.expandOnDblClick && !this._inAniming) {
                    if (expanded) {
                        this.fire("beforecollapse", ev);
                        if (ev.cancel == true) return;
                        this.collapseNode(node, this.allowAnim);
                    } else {
                        this.fire("beforeexpand", ev);
                        if (ev.cancel == true) return;
                        this.expandNode(node, this.allowAnim);

                    }
                }

                this.fire("nodedblclick", { htmlEvent: e, node: node, isLeaf: this.isLeaf(node) });
            }
        }
    },
    __OnClick: function (e) {

        if (!this.enabled) return;
        var node = this._getNodeByEvent(e);
        if (node && node.enabled !== false) {

            var allow = mini.findParent(e.target, this._inNodeCls) && this.expandOnNodeClick;
            if (mini.findParent(e.target, this._checkBoxCls)) allow = false;
            if ((mini.findParent(e.target, this._eciconCls) || allow)
                    && this.isLeaf(node) == false
                ) {

                if (this._inAniming) return;
                var expanded = this.isExpandedNode(node);
                var ev = {
                    node: node,
                    expanded: expanded,
                    cancel: false
                };

                if (!this._inAniming) {
                    if (expanded) {
                        this.fire("beforecollapse", ev);
                        if (ev.cancel == true) return;
                        this.collapseNode(node, this.allowAnim);
                    } else {
                        this.fire("beforeexpand", ev);
                        if (ev.cancel == true) return;
                        this.expandNode(node, this.allowAnim);

                    }
                }
            } else if (mini.findParent(e.target, this._checkBoxCls)) {
                var checked = this.isCheckedNode(node);
                var ev = {
                    isLeaf: this.isLeaf(node),
                    node: node,
                    checked: checked,
                    checkRecursive: this.checkRecursive,
                    htmlEvent: e,
                    cancel: false
                };

                this.fire("beforenodecheck", ev);
                if (ev.cancel == true) {
                    e.preventDefault();
                    return;
                }
                if (checked) {
                    this.uncheckNode(node);
                } else {
                    this.checkNode(node);
                }
                this.fire("nodecheck", ev);

            } else {
                this._OnNodeClick(node, e);
            }


        }

    },
    __OnMouseDown: function (e) {
        if (!this.enabled) return;
        if (this._editInput) this._editInput.blur();

        var node = this._getNodeByEvent(e);
        if (node) {
            if (mini.findParent(e.target, this._eciconCls)) {

            } else if (mini.findParent(e.target, this._checkBoxCls)) {

            } else {

                this._OnNodeMouseDown(node, e);

            }


        }
    },
    _OnNodeMouseDown: function (node, htmlEvent) {

        var show = mini.findParent(htmlEvent.target, this._inNodeCls);
        if (!show) return null;
        if (!this.isEnabledNode(node)) return;

        var ev = { node: node, cancel: false, isLeaf: this.isLeaf(node), htmlEvent: htmlEvent };

        if (this.allowSelect && node.allowSelect !== false) {
            if (this._selectedNode != node) {
                this.fire("beforenodeselect", ev);
                if (ev.cancel != true) {
                    this.selectNode(node);
                }
            }
        }

        this.fire("nodeMouseDown", ev);
    },
    _OnNodeClick: function (node, htmlEvent) {
        var show = mini.findParent(htmlEvent.target, this._inNodeCls);
        if (!show) return null;
        if (htmlEvent.target.tagName.toLowerCase() == "a") {

            htmlEvent.target.hideFocus = true;
        }
        if (!this.isEnabledNode(node)) return;

        var ev = { node: node, cancel: false, isLeaf: this.isLeaf(node), htmlEvent: htmlEvent };

        if (this._getColumnByEvent) {
            var column = this._getColumnByEvent(htmlEvent);
            if (column) {
                ev.column = column;
                ev.field = column.field;
            }
        }

        this.fire("nodeClick", ev);
    },

    __OnMouseMove: function (e) {
        var node = this._getNodeByEvent(e);
        if (node) {
            this._OnNodeMouseMove(node, e);
        }
    },
    __OnMouseOut: function (e) {
        var node = this._getNodeByEvent(e);
        if (node) {
            this._OnNodeMouseOut(node, e);
        }
    },

    _OnNodeMouseOut: function (node, e) {
        if (!this.isEnabledNode(node)) return;
        if (!mini.findParent(e.target, this._inNodeCls)) return;

        this.blurNode();

        var e = {
            node: node,
            htmlEvent: e
        };
        this.fire("nodemouseout", e);
    },
    _OnNodeMouseMove: function (node, e) {
        if (!this.isEnabledNode(node)) return;
        if (!mini.findParent(e.target, this._inNodeCls)) return;
        if (this.enableHotTrack == true) {
            this.focusNode(node);
        }
        var e = {
            node: node,
            htmlEvent: e
        };
        this.fire("nodemousemove", e);
    },
    focusNode: function (node, view) {
        node = this.getNode(node);
        if (!node) return;
        function doFocus() {
            var dom = this._getNodeHoverEl(node);
            if (view && dom) {
                this.scrollIntoView(node);
            }
            if (this._focusedNode == node) return;
            this.blurNode();
            this._focusedNode = node;

            mini.addClass(dom, this._nodeHoverCls);
        }
        var me = this;
        setTimeout(function () {
            doFocus.call(me);
        }, 1);
    },
    blurNode: function () {
        if (!this._focusedNode) return;

        var dom = this._getNodeHoverEl(this._focusedNode);
        if (dom) {
            mini.removeClass(dom, this._nodeHoverCls);
        }
        this._focusedNode = null;
    },
    /**
	 * 视图滚动至节点
	 */
    scrollIntoView: function (node) {
        node = this.getNode(node);
        if (!node) return;
        this.expandNode(node);

        var itemEl = this._getNodeEl(node);
        mini.scrollIntoView(itemEl, this.el, false);
    },

    __OnHtmlContextMenu: function (e) {
        if (mini.isAncestor(this._headerEl, e.target)) {
            return true;
        }
        return mini.Tree.superclass.__OnHtmlContextMenu.call(this, e);
    },

    onNodeClick: function (fn, scope) {
        this.on("nodeClick", fn, scope);
    },
    onBeforeNodeSelect: function (fn, scope) {
        this.on("beforenodeselect", fn, scope);
    },
    onNodeSelect: function (fn, scope) {
        this.on("nodeselect", fn, scope);
    },
    onBeforeNodeCheck: function (fn, scope) {
        this.on("beforenodecheck", fn, scope);
    },
    onCheckNode: function (fn, scope) {
        this.on("nodecheck", fn, scope);
    },
    onNodeMouseDown: function (fn, scope) {
        this.on("nodemousedown", fn, scope);
    },
    onBeforeExpand: function (fn, scope) {
        this.on("beforeexpand", fn, scope);
    },
    onExpand: function (fn, scope) {
        this.on("expand", fn, scope);
    },
    onBeforeCollapse: function (fn, scope) {
        this.on("beforecollapse", fn, scope);
    },
    onCollapse: function (fn, scope) {
        this.on("collapse", fn, scope);
    },
    onBeforeLoad: function (fn, scope) {
        this.on("beforeload", fn, scope);
    },
    onLoad: function (fn, scope) {
        this.on("load", fn, scope);
    },
    onLoadError: function (fn, scope) {
        this.on("loaderror", fn, scope);
    },
    onDataLoad: function (fn, scope) {
        this.on("dataload", fn, scope);
    },

    _getDragData: function () {
        return this.getSelectedNodes().clone();
    },
    _getDragText: function (dragNodes) {
        //显示为被拖动的那个节点的名字 tree只允许拖动一个节点 所以这里取[0]即可 潘正锋 2013-06-06
        if (this.autoEscape == true) {
            return mini.htmlEncode(this.getItemText(dragNodes[0]));
        }
        return this.getItemText(dragNodes[0]);

    },

    allowDrag: false,
    allowDrop: false,
    dragGroupName: "",
    dropGroupName: "",
    allowLeafDropIn: false,
    setAllowLeafDropIn: function (value) {
        this.allowLeafDropIn = value;
    },
    getAllowLeafDropIn: function () {
        return this.allowLeafDropIn;
    },
    setAllowDrag: function (value) {
        this.allowDrag = value;
    },
    getAllowDrag: function () {
        return this.allowDrag;
    },
    setAllowDrop: function (value) {
        this.allowDrop = value;
    },
    getAllowDrop: function () {
        return this.allowDrop;
    },
    setDragGroupName: function (value) {
        this.dragGroupName = value;
    },
    getDragGroupName: function () {
        return this.dragGroupName;
    },
    setDropGroupName: function (value) {
        this.dropGroupName = value;
    },
    getDropGroupName: function () {
        return this.dropGroupName;
    },
    isAllowDrag: function (node) {
        if (!this.allowDrag) return false;
        if (node.allowDrag === false) return false;
        return true;
    },
    _OnDragStart: function (node) {
        var e = {
            node: node,
            nodes: this._getDragData(),
            dragText: this._getDragText(this._getDragData()),
            cancel: false
        };
        this.fire("DragStart", e);
        return e;
    },
    _OnDragDrop: function (dragNodes, dropNode, dragAction) {
        dragNodes = dragNodes.clone();
        var e = {
            dragNodes: dragNodes,
            targetNode: dropNode,
            action: dragAction,
            cancel: false
        };
        var dropParentNode = this._getDropedParentNode(dragNodes, dragAction, dropNode);
        e.dragNode = e.dragNodes[0];
        e.dropNode = e.targetNode;
        e.dragAction = e.action;
        //增加dropParentNode参数 表示拖拽后节点的父节点 潘正锋 2013-06-21
        e.dropParentNode = dropParentNode;

        this.fire("beforedrop", e);
        this.fire("DragDrop", e);
        return e;
    },
    _OnGiveFeedback: function (effect, dragNodes, dropNode) {
        var e = {};
        e.effect = effect;
        e.nodes = dragNodes;
        e.targetNode = dropNode;

        e.node = e.nodes[0];


        e.dragNodes = dragNodes;
        e.dragNode = e.dragNodes[0];
        e.dropNode = e.targetNode;
        e.dragAction = e.action;

        this.fire("givefeedback", e);
        return e;
    },

    getAttrs: function (el) {
        var attrs = mini.Tree.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["value", "url", "idField", "textField", "iconField", "nodesField", "parentField", "valueField",
            "leafIcon", "folderIcon",
            "ondrawnode", "onbeforenodeselect", "onnodeselect", "onnodemousedown", "onnodeclick", "onnodedblclick",
            "onbeforeload", "onpreload", "onload", "onloaderror", "ondataload",
                "onbeforenodecheck", "onnodecheck",
                "onbeforeexpand", "onexpand",
                "onbeforecollapse", "oncollapse",
                "dragGroupName", "dropGroupName", "onendedit",
                "expandOnLoad", "ajaxOption", "ondragstart", "onbeforedrop", "ondrop", "ongivefeedback"
            ]
        );

        mini._ParseBool(el, attrs,
            ["allowSelect", "showCheckBox", "showExpandButtons", "showTreeIcon", "showTreeLines", "checkRecursive",
                "enableHotTrack", "showFolderCheckBox", "resultAsTree",
                "allowLeafDropIn", "allowDrag", "allowDrop", "showArrow", "expandOnDblClick", "removeOnCollapse",
                "autoCheckParent", "loadOnExpand", "expandOnNodeClick", "autoEscape"
            ]
        );
        if (attrs.ajaxOption) {
            attrs.ajaxOption = mini.decode(attrs.ajaxOption);
        }

        if (attrs.expandOnLoad) {

            var level = parseInt(attrs.expandOnLoad);
            if (mini.isNumber(level)) {
                attrs.expandOnLoad = level;
            } else {
                attrs.expandOnLoad = attrs.expandOnLoad == "true" ? true : false;
            }
        }

        var idField = attrs.idField || this.idField;
        var textField = attrs.textField || this.textField;
        var iconField = attrs.iconField || this.iconField;
        var nodesField = attrs.nodesField || this.nodesField;

        function parseNodes(nodes) {
            var data = [];

            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                var cnodes = mini.getChildNodes(node);
                var nodeTitle = cnodes[0];
                var nodeChild = cnodes[1];

                if (!nodeTitle || !nodeChild) nodeTitle = node;
                var jqTitle = jQuery(nodeTitle);
                var o = {};
                var id = o[idField] = nodeTitle.getAttribute("value");

                o[iconField] = jqTitle.attr("iconCls");
                o[textField] = nodeTitle.innerHTML;
                data.add(o);



                var expanded = jqTitle.attr("expanded");
                if (expanded) {
                    o.expanded = expanded == "false" ? false : true;
                }

                var allowSelect = jqTitle.attr("allowSelect");
                if (allowSelect) {
                    o.allowSelect = allowSelect == "false" ? false : true;
                }



                if (!nodeChild) continue;
                var cs = mini.getChildNodes(nodeChild);
                var cdata = parseNodes(cs);
                if (cdata.length > 0) {
                    o[nodesField] = cdata;
                }
            }
            return data;
        }

        var data = parseNodes(mini.getChildNodes(el));
        if (data.length > 0) {
            attrs.data = data;
        }

        if (!attrs.idField && attrs.valueField) {
            attrs.idField = attrs.valueField;
        }

        return attrs;
    }

});
mini.regClass(mini.Tree, "tree");

mini._TreeDragDrop = function (tree) {
    this.owner = tree;
    this.owner.on('NodeMouseDown', this.__OnTreeNodeMouseDown, this);
}
mini._TreeDragDrop.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        mini.clearEvent(document);

        if (this.drag) {
            mini.clearEvent(this.drag);
            this.drag.destroy(removeEl);
            this.drag = null;
        }
        this.owner = null;
        mini.clearEvent(this);
    },
    __OnTreeNodeMouseDown: function (e) {
        var node = e.node;
        if (e.htmlEvent.button == mini.MouseButton.Right) return;
        var tree = this.owner;
        if (tree.isReadOnly() || tree.isAllowDrag(e.node) == false) return;

        if (tree.isEditingNode(node)) return;

        this.dragData = tree._getDragData();

        if (this.dragData.indexOf(node) == -1) {
            this.dragData.push(node);
        }
        var drag = this._getDrag();
        //增加node参数给_OnDragStart方法 潘正锋2013-06-20
        drag.start(e.htmlEvent, node);
    },
    _OnDragStart: function (drag, node) { //增加node参数给_OnDragStart方法 潘正锋2013-06-20
        var tree = this.owner;
        //将dragstart出发事件移到这里，原先在__OnTreeNodeMouseDown中，导致每次选择节点时就会触发时间  潘正锋2013-06-20
        var ex = tree._OnDragStart(node);
        if (ex.cancel) return;
        this.dragText = ex.dragText;

        this.feedbackEl = mini.append(document.body, '<div class="mini-feedback"></div>');
        this.feedbackEl.innerHTML = this.dragText;
        this.lastFeedbackClass = "";

        this.enableHotTrack = tree.enableHotTrack;
        tree.setEnableHotTrack(false);
    },
    _getDropTree: function (event) {
        var dom = mini.findParent(event.target, "mini-tree", 500);
        if (dom) {
            return mini.get(dom);
        }
    },
    _OnDragMove: function (drag) {

        var tree = this.owner;
        var dropTree = this._getDropTree(drag.event);

        var x = drag.now[0], y = drag.now[1];
        mini.setXY(this.feedbackEl, x + 15, y + 18);

        this.dragAction = "no";

        if (dropTree) {
            var targetNode = dropTree._getNodeByEvent(drag.event);
            this.dropNode = targetNode;

            if (targetNode && dropTree.allowDrop == true) {


                if (!dropTree.isLeaf(targetNode)) {

                    var nodes = targetNode[dropTree.nodesField];
                    if (nodes && nodes.length > 0) {

                    } else {
                        if (tree.loadOnExpand && targetNode.asyncLoad !== false) {
                            dropTree.loadNode(targetNode);
                        } else {

                        }
                    }
                }

                this.dragAction = this.getFeedback(targetNode, y, 3, dropTree);



            } else {
                this.dragAction = "no";
            }
            if (tree && dropTree && tree != dropTree && !targetNode && dropTree.getChildNodes(dropTree.root).length == 0) {
                targetNode = dropTree.getRootNode();
                this.dragAction = "add";
                this.dropNode = targetNode;
            }
        }

        this.lastFeedbackClass = "mini-feedback-" + this.dragAction;
        this.feedbackEl.className = "mini-feedback " + this.lastFeedbackClass;

        if (this.dragAction == "no") targetNode = null;
        this.setRowFeedback(targetNode, this.dragAction, dropTree);

    },
    _OnDragStop: function (drag) {

        var tree = this.owner;
        var dropTree = this._getDropTree(drag.event);

        mini.removeNode(this.feedbackEl);

        this.feedbackEl = null;
        this.setRowFeedback(null);

        var dragNodes = [];
        for (var i = 0, l = this.dragData.length; i < l; i++) {
            var dragNode = this.dragData[i];

            var hasParent = false;
            for (var j = 0, k = this.dragData.length; j < k; j++) {
                var dr = this.dragData[j];
                if (dr != dragNode) {
                    hasParent = tree.isAncestor(dr, dragNode);
                    if (hasParent) break;
                }
            }

            if (!hasParent) {
                dragNodes.push(dragNode);
            }
        }
        this.dragData = dragNodes;

        if (this.dropNode && dropTree && this.dragAction != "no") {
            var e = tree._OnDragDrop(this.dragData, this.dropNode, this.dragAction);
            //如果e.cancel=true 下面的代码都不用执行 潘正锋 2013-06-20
            if (e.cancel) return;
            //删除if判断 潘正锋 2013-06-20
            var dragNodes = e.dragNodes, targetNode = e.targetNode, action = e.action;

            if (tree == dropTree) {
                tree.moveNodes(dragNodes, targetNode, action);
            } else {

                tree.removeNodes(dragNodes);
                dropTree.addNodes(dragNodes, targetNode, action);
            }
            //dropNode为空时不触发drop时间 潘正锋 2013-06-20
            if (!this.dragData[0]) return;
            var e = {
                dragNode: this.dragData[0],
                dropNode: this.dropNode,
                dragAction: this.dragAction,
                dropParentNode: tree.getParentNode(dragNode) //增加dropParent参数 表示拖拽后，被拖拽节点的新父节点  潘正锋 2013-06-20
            };
            
            tree.fire("drop", e);

        }

        //貌似无用代码，删除掉 潘正锋 2013-06-20
        //tree.setEnableHotTrack(this.enableHotTrack);

        this.dropNode = null;
        this.dragData = null;
    },
    setRowFeedback: function (node, feedback, tree) {




        if (this.lastAddDomNode) {
            mini.removeClass(this.lastAddDomNode, "mini-tree-feedback-add");
        }
        if (node == null || this.dragAction == "add") {
            mini.removeNode(this.feedbackLine);
            this.feedbackLine = null;
        }

        this.lastRowFeedback = node;

        if (node != null) {
            if (feedback == "before" || feedback == "after") {

                if (!this.feedbackLine) {
                    this.feedbackLine = mini.append(document.body, "<div class='mini-feedback-line'></div>");
                }
                this.feedbackLine.style.display = "block";
                var rowBox = tree.getNodeBox(node);
                var x = rowBox.x, y = rowBox.y - 1;
                if (feedback == "after") {
                    y += rowBox.height;
                }
                mini.setXY(this.feedbackLine, x, y);

                var box = tree.getBox(true);
                mini.setWidth(this.feedbackLine, box.width);
            } else {
                var el = tree._getNodeTitleEl(node);
                mini.addClass(el, "mini-tree-feedback-add");
                this.lastAddDomNode = el;


            }
        }
    },
    getFeedback: function (dropNode, y, way, tree) {




        var rowBox = tree.getNodeBox(dropNode);


        var h = rowBox.height;
        var t = y - rowBox.y;

        var effect = null;


        if (this.dragData.indexOf(dropNode) != -1) return "no";
        var IsLeaf = false;
        if (way == 3) {
            IsLeaf = tree.isLeaf(dropNode);


            for (var i = 0, l = this.dragData.length; i < l; i++) {
                var dragRecord = this.dragData[i];

                var isAncestor = tree.isAncestor(dragRecord, dropNode);
                if (isAncestor) {
                    effect = "no";
                    break;
                }
            }
        }
        if (effect == null) {

            if (IsLeaf && tree.allowLeafDropIn == false) {
                if (t > h / 2) effect = "after";
                else effect = "before";
            } else {
                if (t > (h / 3) * 2) effect = "after";
                else if (h / 3 <= t && t <= (h / 3 * 2)) effect = "add";
                else effect = "before";
            }

        }
        var e = tree._OnGiveFeedback(effect, this.dragData, dropNode);
        return e.effect;
    },
    _getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: true,//改为true，解决鼠标移动到外面后回来再次拖拽出现2个层 潘正锋
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    }
};

