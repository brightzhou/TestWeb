/**
 * @fileOverview 表格组件，主要实现分页加载、自定义列、单元格渲染、行编辑器、锁定列、过滤行、汇总行等功能。
 */

/**
 * 用法请参见<a href="#constructor">DEMO</a>
 * @class 表格组件，主要实现分页加载、自定义列、单元格渲染、行编辑器、锁定列、过滤行、汇总行等功能。
 * @constructor
 * @extends mini.Control 
 * @example 
 * <p>&lt;div&nbsp;<strong>class</strong>=&quot;<strong>mini-datagrid</strong>&quot; <strong>url</strong>=&quot;../data/AjaxService.aspx?method=SearchEmployees&quot; &gt;<br />
 * &nbsp;&nbsp;&nbsp; &lt;div property=&quot;<strong>columns</strong>&quot;&gt;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div <strong>type</strong>=&quot;indexcolumn&quot;&gt;&lt;/div&gt;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div <strong>field</strong>=&quot;loginname&quot; <strong>width</strong>=&quot;120&quot; <strong>headerAlign</strong>=&quot;center&quot;&gt;员工帐号&lt;/div&gt;&nbsp;&nbsp;&nbsp;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div <strong>field</strong>=&quot;name&quot; width=&quot;120&quot; <strong>allowSort</strong>=&quot;true&quot;&gt;姓名&lt;/div&gt;&nbsp;&nbsp;&nbsp;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div <strong>header</strong>=&quot;工作信息&quot;&gt;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div property=&quot;columns&quot;&gt;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div field=&quot;dept_name&quot; width=&quot;120&quot;&gt;所属部门&lt;/div&gt;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;div field=&quot;position_name&quot; width=&quot;100&quot;&gt;职位&lt;/div&gt;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/div&gt;<br />
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/div&gt;<br />
 * &nbsp;&nbsp;&nbsp; &lt;/div&gt;<br />
 * &lt;/div&gt;</p>
 */
mini.DataGrid = function () {
    this.data = [];
    this._idRows = {};
    this._removes = [];
    this._originals = {};

    this.columns = [];
    this._bottomColumns = [];
    this._idColumns = {};
    this._nameColumns = {};

    this._selecteds = [];
    this._idSelecteds = {};

    this._cellErrors = [];
    this._cellMapErrors = {};

    mini.DataGrid.superclass.constructor.call(this);

    this.doUpdate();

    var sf = this;
    setTimeout( function () {
        if (sf.autoLoad) {

            sf.reload();
        }
    }, 1);
}
/**
 * @private 用于自增长设置数据行的uid属性
 * @type Number
 */
mini.DataGrid.RowID = 0;
/**
 * @private 用于自增长设置列的_id属性
 * @type Number
 */
mini.DataGrid.ColumnID = 0;
mini.extend(mini.DataGrid, mini.Control, {
   /**
    * @lends mini.DataGrid.prototype
    */

   /**
	* @private 控件显示方式，取值范围同css中display样式，不建议修改该值
	* @default block
	*/
    _displayStyle: "block",
	/**
	 * 表格宽度
	 * @default 300
	 * @type Number或String
	 */
    width: 300,
   /**
    * 表格高度
    * @default auto
    * @type String
    */
    height: "auto",
   /**
    * 当编辑单元格时，是否自动验证，当allowCellEdit为true时该配置有效
    * @default false
    * @type Boolean
    */
    allowCellValid: false,
   /**
    * 触发单元格的编辑事件，取值范围：cellclick、celldblclick
    * @default cellclick
    * @type String
    */
    cellEditAction: "cellclick",
   /**
    * 数据为空时是否显示提示文本（emptyText属性值）
    * @default false
    * @type Boolean
    */
    showEmptyText: false,
   /**
    * 数据为空时的提示文本，当showEmptyText为true时显示
    * @default 没有返回的数据
    * @type String
    */
    emptyText: "No data returned.",
   /**
    * 是否显示修改标识，非编辑模式建议设置为false
    * @default true
    * @type Boolean
    */
    showModified: true,
   /**
    * 表格最小宽度，allowResize为true时有效
    * @default 300
    * @type Number
    */
    minWidth: 300,
   /**
    * 表格最小高度，allowResize为true时有效
    * @default 150
    * @type Number
    */
    minHeight: 150,
   /**
    * 表格最大宽度，allowResize为true时有效
    * @default 5000
    * @type Number
    */
    maxWidth: 5000,
   /**
    * 表格最大高度，allowResize为true时有效
    * @default 3000
    * @type Number
    */
    maxHeight: 3000,
   /**
    * 虚拟滚动的布局信息
    * @private
    */
    _viewRegion: null,
   /**
    * 虚拟滚动行数
    * @default 50
    * @type Number
    */
    _virtualRows: 50,
   /**
    * 是否虚拟滚动。当显示的数据超过500以上时， ，能极大提升性能。当表格组件div的高度样式不为auto且不为空，且无分组时可实现虚拟滚动。
    * @default false
    * @type Boolean
    */
    virtualScroll: false,
   /**
    * 允许单元格换行
    * @default false
    * @type Boolean
    */
    allowCellWrap: false,
   /**
    * 允许表头文本换行
    * @default false
    * @type Boolean
    */
    allowHeaderWrap: false,
   /**
    * 是否显示列头菜单，为true时鼠标移动到列头上时显示菜单，默认菜单为【Sort Asc,Sort Desc,Columns】，菜单通过columnsMenu定义，目前不可用。
    * @default false
    * @type Boolean
    */
    showColumnsMenu: false,
   /**
    * 内容区样式类。
    * @type String
    */
    bodyCls: "",
   /**
    * 内容区样式。如"padding:0px;"。
    * @type String
    */
    bodyStyle: "",
   /**
    * 底部样式类。
    * @type String
    */
    footerCls: "",
   /**
    * 底部样式。如"padding:0px;"
    * @type String
    */
    footerStyle: "",
   /**
    * 分页工具条样式类。
    * @type String
    */
    pagerCls: "",
   /**
    * 分页工具条样式。如"padding:0px;"
    * @type String
    */
    pagerStyle: "",
   /**
    * 行对象唯一标识字段。
    * @default id
    * @type String
    */ 
    idField: "id",
   /**
    * 表格数据。
    * @type Array
    */
    data: [],
   /**
    * 列集合对象
    * @type Array
    */
    columns: null,
   /**
    * 是否允许拖拽调节表格尺寸。
    * @default false
    * @type Boolean
    */
    allowResize: false,
   /**
    * 数据加载完时，当表格中无选中记录时，自动选中第一条数据
    * @default false
    * @type Boolean
    */
    selectOnLoad: false,
   /**
    * 行id字段
    * @private
    * @type String
    */
    _rowIdField: "_uid",
   /**
    * 列宽
    * @default 120
    * @type Number
    */
    columnWidth: 120,
   /**
    * 列最小宽度，调整列宽时有效。
    * @default 20
    * @type Number
    */
    columnMinWidth: 20,
   /**
    * 列最大宽度，调整列宽时有效。
    * @default 2000
    * @type Number
    */
    columnMaxWidth: 2000,
   /**
    * 是否固定列宽，为false时自动调整列宽充满整个表格
    * @default true
    * @type Boolean
    */
    fitColumns: true,
   /**
    * 展开详细行时，是否自动隐藏其他详细行
    * @default true
    * @type Boolean
    */
    autoHideRowDetail: true,
   /**
    * 是否显示列头
    * @default true
    * @type Boolean
    */
    showHeader: true,
   /**
    * 是否显示底部分页工具条。
    * @default true
    * @type Boolean
    */
    showFooter: true,
   /**
    * @deprecated 目前作用不详，未发现使用情况
    * @default false
    * @type Boolean
    */
    showTop: false,
   /**
    * 是否显示横向表格线条
    * @default true
    * @type Boolean
    */
    showHGridLines: true,
   /**
    * 是否显示纵向表格线条
    * @default true
    * @type Boolean
    */
    showVGridLines: true,
   /**
    * 是否显示过滤行。作为过滤条件的列需要配置property="filter"的表单元素。
    * @default false
    * @type Boolean
    */
    showFilterRow: false,
   /**
    * 是否显示汇总行，汇总行信息需onload时手动赋值
    * @default false
    * @type Boolean
    */
    showSummaryRow: false,
   /**
    * 排序模式，取值范围server、client
    * @default server
    * @type String
    */
    sortMode: "server",
   /**
    * 是否允许列排序，用于总体控制所有列的排序许可，具体列排序需配合column的allowSort="true"方可实现真正的可排序
    * @default true
    * @type Boolean
    */
    allowSortColumn: true,
   /**
    * 是否允许移动列
    * @default true
    * @type Boolean
    */
    allowMoveColumn: true,
   /**
    * 是否允许拖拽调节列宽度
    * @default true
    * @type Boolean
    */
    allowResizeColumn: true,
   /**
    * 是否移动到行时高亮显示
    * @default true
    * @type Boolean
    */
    enableHotTrack: true,
   /**
    * 是否允许选择行
    * @default true
    * @type Boolean
    */
    allowRowSelect: true,
   /**
    * 是否允许多选
    * @default false
    * @type Boolean
    */
    multiSelect: false,
   /**
    * 是否显示显示斑马纹
    * @default false
    * @type Boolean
    */
    allowAlternating: false,
   /**
    * 斑马线样式类
    * @private
    * @default mini-grid-row-alt
    * @type String
    */
    _alternatingCls: "mini-grid-row-alt",
   /**
    * 允许反选。设置true后，点击任意单元格都会选中行，以及取消选中行。
    * @default false
    * @type Boolean
    */
    allowUnselect: false,
   /**
    * 锁定样式类
    * @private
    * @default mini-grid-frozen
    * @type String
    */
    _frozenCls: "mini-grid-frozen",
   /**
    * 锁定单元格样式类
    * @private
    * @default mini-grid-frozenCell
    * @type String
    */
    _frozenCellCls: "mini-grid-frozenCell",
   /**
    * 锁定开始列，当值大于0时，columnIndex小于该值的列将隐藏
    * @default -1
    * @type 
    */
    frozenStartColumn: -1,
   /**
    * 锁定截止列
    * @default -1
    * @type 
    */
    frozenEndColumn: -1,
   /**
    * 是否有效冻结列配置，可用于判断是否有冻结列
    * @returns {Boolean} 
    */
    isFrozen: function () {
        return this.frozenStartColumn >= 0 && this.frozenEndColumn >= this.frozenStartColumn;
    },
   /**
    * 行样式类
    * @default mini-grid-row
    * @type String
    */
    _rowCls: "mini-grid-row",
   /**
    * 鼠标浮动时行样式类
    * @default mini-grid-row-hover
    * @type String
    */
    _rowHoverCls: "mini-grid-row-hover",
   /**
    * 行选中样式类
    * @default mini-grid-row-selected
    * @type String
    */
    _rowSelectedCls: "mini-grid-row-selected",
   /**
    * 列头单元格样式类
    * @default mini-grid-headerCell
    * @type String
    */
    _headerCellCls: "mini-grid-headerCell",
   /**
    * 数据单元格样式类
    * @default mini-grid-cell
    * @type String
    */
    _cellCls: "mini-grid-cell",
    /**
     * 设置属性
     * @param {Object} kv
     * @return {DataGrid}
     */
    set: function (kv) {
        var columns = kv.columns;
        delete kv.columns;
        
        //解决设置pageSize后页面加载两遍的问题（pager和pageSize设置先后问题） 赵美丹 2013-04-17
        var pageSize = kv.pageSize;
        delete kv.pageSize;
        
        var pager = kv.pager;
        delete kv.pager;
        
        mini.DataGrid.superclass.set.call(this, kv);

        if(pageSize){
            this.setPageSize(pageSize);
        }
        if(pager){
            this.setPager(pager);
        }
        if (columns)
            this.setColumns(columns);

        return this;
    },
   /**
    * 表格ui样式类
    * @default mini-datagrid
    * @type String
    */
    uiCls: "mini-datagrid",
   /**
    * 创建表格组件DOM元素
    * @private
    */
    _create: function () {

        var el = this.el = document.createElement("div");
        this.el.className = "mini-grid";
        this.el.style.display = "block";

        this.el.tabIndex = 1;
        var s = '<div class="mini-grid-border">'
        + '<div class="mini-grid-header"><div class="mini-grid-headerInner"></div></div>'
        + '<div class="mini-grid-filterRow"></div>'
        + '<div class="mini-grid-body"><div class="mini-grid-bodyInner"></div><div class="mini-grid-body-scrollHeight"></div></div>'
        + '<div class="mini-grid-scroller"><div></div></div>'
        + '<div class="mini-grid-summaryRow"></div>'
        + '<div class="mini-grid-footer"></div>'
        + '<div class="mini-grid-resizeGrid" style=""></div>'
        + '<a href="#" class="mini-grid-focus" style="position:absolute;left:-10px;top:-10px;width:0px;height:0px;outline:none;" hideFocus onclick="return false" ></a>'
        + '</div>';
        this.el.innerHTML = s;

        this._borderEl = this.el.firstChild;
        this._headerEl = this._borderEl.childNodes[0];
        this._filterEl = this._borderEl.childNodes[1];
        this._bodyEl = this._borderEl.childNodes[2];
        this._bodyInnerEl = this._bodyEl.childNodes[0];
        this._bodyScrollEl = this._bodyEl.childNodes[1];

        this._headerInnerEl = this._headerEl.firstChild;

        this._scrollEl = this._borderEl.childNodes[3];
        this._summaryEl = this._borderEl.childNodes[4];
        this._footerEl = this._borderEl.childNodes[5];
        this._resizeEl = this._borderEl.childNodes[6];
        this._focusEl = this._borderEl.childNodes[7];

        this._doUpdateFilterRow();
        this._doUpdateSummaryRow();

        mini.setStyle(this._bodyEl, this.bodyStyle);
        mini.addClass(this._bodyEl, this.bodyCls);

        this._createPager();

        this._doShowRows();
    },
   /**
    * 表格组件销毁
    * @param Boolean removeEl 是否删除mini-grid的上级节点，当不为false时删除
    */
    destroy: function (removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        this._Resizer.destroy(removeEl);
        this._Splitter.destroy(removeEl);
        this._ColumnMove.destroy(removeEl);
        this._Select.destroy(removeEl);
        this._CellTip.destroy(removeEl);
        this._Sort.destroy(removeEl);
        this._ColumnsMenu.destroy(removeEl);
        if (this._scrollEl) {
            mini.clearEvent(this._scrollEl);
            this._borderEl.removeChild(this._scrollEl);
            this._scrollEl = null;
        }
        
        if (this._summaryEl) {
            mini.clearEvent(this._summaryEl);
            this._borderEl.removeChild(this._summaryEl);
            this._summaryEl = null;
        }
        
        if (this.pager) {
            mini.clearEvent(this.pager);
            this.pager.destroy(removeEl);
            this.pager = null;
        }
        
        if (this._footerEl) {
            mini.clearEvent(this._footerEl);
            this._borderEl.removeChild(this._footerEl);
            this._footerEl = null;
        }
        
        if (this._resizeEl) {
            mini.clearEvent(this._resizeEl);
            this._borderEl.removeChild(this._resizeEl);
            this._resizeEl = null;
        }
        
        if (this._focusEl) {
            mini.clearEvent(this._focusEl);
            this._borderEl.removeChild(this._focusEl);
            this._focusEl = null;
        }
        
        if (this._bodyInnerEl) {
            mini.clearEvent(this._bodyInnerEl);
            this._bodyEl.removeChild(this._bodyInnerEl);
            this._bodyInnerEl = null;
        }
        
        if (this._bodyScrollEl) {
            mini.clearEvent(this._bodyScrollEl);
            this._bodyEl.removeChild(this._bodyScrollEl);
            this._bodyScrollEl = null;
        }
        
        if (this._bodyEl) {
            mini.clearEvent(this._bodyEl);
            this._borderEl.removeChild(this._bodyEl);
            this._bodyEl = null;
        }
        
        if (this._filterEl) {
            mini.clearEvent(this._filterEl);
            this._borderEl.removeChild(this._filterEl);
            this._filterEl = null;
        }
        
        if (this._headerInnerEl) {
            mini.clearEvent(this._headerInnerEl);
            this._headerEl.removeChild(this._headerInnerEl);
            this._headerInnerEl = null;
        }
        
        if (this._headerEl) {
            mini.clearEvent(this._headerEl);
            this._borderEl.removeChild(this._headerEl);
            this._headerEl = null;
        }
        
        if (this._borderEl) {
            mini.clearEvent(this._borderEl);
            this.el.removeChild(this._borderEl);
            this._borderEl = null;
        }
        
        delete this.data;
	    delete this._idRows;
	    delete this._removes;
	    delete this._originals;
	
	    delete this.columns;
	    delete this._bottomColumns;
	    delete this._idColumns;
	    delete this._nameColumns;
	
	    delete this._selecteds;
	    delete this._idSelecteds;
	
	    delete this._cellErrors;
	    delete this._cellMapErrors;
        
        mini.DataGrid.superclass.destroy.call(this, removeEl);
    },
   /**
    * 事件绑定
    * @private
    */
    _initEvents: function () {
        mini._BindEvents( function () {
            mini.on(this.el, 'click', this.__OnClick, this);
            mini.on(this.el, 'dblclick', this.__OnDblClick, this);

            mini.on(this.el, 'mousedown', this.__OnMouseDown, this);
            mini.on(this.el, 'mouseup', this.__OnMouseUp, this);
            mini.on(this.el, 'mousemove', this.__OnMouseMove, this);
            mini.on(this.el, 'mouseover', this.__OnMouseOver, this);
            mini.on(this.el, 'mouseout', this.__OnMouseOut, this);

            mini.on(this.el, 'keydown', this.__OnKeyDown, this);
            mini.on(this.el, 'keyup', this.__OnKeyUp, this);

            mini.on(this.el, 'contextmenu', this.__OnContextMenu, this);

            mini.on(this._bodyEl, "scroll", this.__OnBodyScroll, this);
            mini.on(this._scrollEl, "scroll", this.__OnHScroll, this);

            mini.on(this.el, "mousewheel", this.__OnMousewheel, this);

        }, this);
        this._Resizer = new mini._GridResizer(this);
        this._Splitter = new mini._ColumnSplitter(this);
        this._ColumnMove = new mini._ColumnMove(this);
        this._Select = new mini._GridSelect(this);
        this._CellTip = new mini._CellToolTip(this);
        this._Sort = new mini._GridSort(this);
        this._ColumnsMenu = new mini._ColumnsMenu(this);
    },
    
   /**
    * 设置表格元素的显示/隐藏，包括resizer、footer工具条、汇总行、过滤行、列头行。
    * @private
    */
    _doShowRows: function () {
        this._resizeEl.style.display = this.allowResize ? "" : "none";
        this._footerEl.style.display = this.showFooter ? "" : "none";
        this._summaryEl.style.display = this.showSummaryRow ? "" : "none";
        this._filterEl.style.display = this.showFilterRow ? "" : "none";
        this._headerEl.style.display = this.showHeader ? "" : "none";
    },
   /**
    * 获取焦点，若存在选择选中行，则选中行获取焦点
    */
    focus: function () {
        try {
            var row = this.getCurrent();
            if (row) {
                var rowEl = this._getRowEl(row);
                if (rowEl) {
                    var rowBox = mini.getBox(rowEl);
                    mini.setY(this._focusEl, rowBox.top);

                    if (isOpera) {
                        rowEl.focus();
                    } else if (isChrome) {
                        this.el.focus();
                    } else if (isGecko) {
                        this.el.focus();
                    } else {
                        this._focusEl.focus();
                    }
                }
            } else {
                this._focusEl.focus();
            }

        } catch (e) {
        }
    },
   /**
    * 创建翻页工具条
    * @private
    */
    _createPager: function () {
        this.pager = new mini.Pager();
        this.pager.render(this._footerEl);
        this.bindPager(this.pager);

    },
   /**
    * 设置表格组件的翻页工具条
    * @param {}/String value pager的id或pager对象 
    */
    setPager: function (value) {
        if (typeof value == "string") {
            var el = mini.byId(value);
            if (!el)
                return;
            mini.parse(value);
            value = mini.get(value);
        }
        if (value) {
            //解决设置pageSize后翻页工具条中信息未显示最新设置（数据未加载） 赵美丹 2013-04-17
            value.update(this.pageIndex, this.pageSize, this.totalCount);
            this.bindPager(value);
        }
    },
   /**
    * 分页工具条事件绑定
    * @param {} pager
    */
    bindPager: function (pager) {
        pager.on("pagechanged", this.__OnPageChanged, this);
        this.on("load", function (e) {
            pager.update(this.pageIndex, this.pageSize, this.totalCount);
            this.totalPage = pager.totalPage;
        }, this);
    },
   /**
    * 设置idField
    * @param String value idField
    */
    setIdField: function (value) {
        this.idField = value;
    },
   /**
    * 获取idField
    * @returns String idField
    */
    getIdField: function () {
        return this.idField;
    },
   /**
    * 设置url
    * @param String url url
    */
    setUrl: function (url) {
        this.url = url;
    },
   /**
    * 获取url
    * @returns String url
    */
    getUrl: function (url) {
        return this.url;
    },
   /**
    * 设置autoLoad
    * @param Boolean value autoLoad值
    */
    setAutoLoad: function (value) {
        this.autoLoad = value;
    },
   /**
    * 获取autoLoad
    * @returns Boolean autoLoad
    */
    getAutoLoad: function (value) {
        return this.autoLoad;
    },
   /**
    *  清除所有行修改痕迹。
    */
    accept: function () {
        this._canUpdateRowEl = false;
        var data = this.getData();
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            this.acceptRecord(row);
        }
        this._canUpdateRowEl = true;

        this.doUpdate();
    },
   /**
    * 清除指定行修改痕迹。
    * @param Object/Number row 行对象或行rowIndex
    */
    acceptRecord: function (row) {
        row = this.getRow(row);
        if (!row)
            return;

        if (row._state == "removed") {
            this._removes.remove(row);
        }

        delete this._originals[row._uid];
        delete row._state;

        if (this._canUpdateRowEl) {
            this._updateRowEl(row);
        }
    },
   /**
    * 是否清空数据修改记录，loadData时有效
    * @private
    * @default true
    * @type Boolean
    */
    _clearOriginals: true,
   /**
    * 加载数据，该方法不处理分页信息，仅适用于无分页的情况，且不触发load事件
    * @param Array data 数据集合
    */
    loadData: function (data) {
        if (!mini.isArray(data))
            data = [];

        this.data = data;

        if (this._clearOriginals == true) {
            this._originals = {};
        }
        this._removes = [];
        this._idRows = {};
        this._selecteds = [];
        this._idSelecteds = {};

        this._cellErrors = [];
        this._cellMapErrors = {};

        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            row._uid = mini.DataGrid.RowID++;
            
            row._index = i;
            this._idRows[row._uid] = row;
        }

        this.doUpdate();

    },
   /**
    * 加载数据，同{@link loadData}
    * @param Array data 数据集合
    */
    setData: function (data) {
        this.loadData(data);
        
        //解决清空数据时无法清空翻页信息的问题 赵美丹 2014-04-18
        if (data.length == 0 && this.pager){
            this.pageIndex = 0;
            this.totalCount = 0;
            
            var ex = {
                result: {
                    data  : data,
                    total : data.length
                },
                data: data,
                total: this.totalCount,
                cancel: false
            }
            this.fire("load", ex);
        }
    },
   /**
    * 获取表格数据
    * @returns Array 表格数据
    */
    getData: function () {
        //解决Array.clone无法彻底clone的问题 赵美丹 2013-03-22
        return mini.decode(mini.encode(this.data));
    },
   /**
    * 获取表格数据，同{@link getData}
    * @private
    * @returns Array 表格数据
    */
    toArray: function () {
        return this.data.clone();
    },
   /**
    * 获取行区间内的行对象
    * @param Number start 起始行rowIndex
    * @param Number end 截止行rowIndex
    * @returns Array 数据集合
    */
    getRange: function (start, end) {
        if (start > end) {
            var t = start;
            start = end;
            end = t;
        }
        var data = this.data;
        var range = [];
        for (var i = start, l = end; i <= l; i++) {
            var o = data[i];
            range.push(o);
        }
        return range;
    },
   /**
    * 选中区间内的数据行
    * @param Number/Object start 起始行rowIndex或起始行对象
    * @param Number/Object end 截止行rowIndex或截止行对象
    */
    selectRange: function (start, end) {
        if (!mini.isNumber(start))
            start = this.indexOf(start);
        if (!mini.isNumber(end))
            end = this.indexOf(end);
        if (mini.isNull(start) || mini.isNull(end))
            return;

        var rs = this.getRange(start, end);
        this.selects(rs);
    },
   /**
    * 获取列头高度
    * @returns Number
    */
    getHeaderHeight: function () {
        return this.showHeader ? mini.getHeight(this._headerEl) : 0;
    },
   /**
    * 获取footer工具条高度
    * @returns Number
    */
    getFooterHeight: function () {

        return this.showFooter ? mini.getHeight(this._footerEl) : 0;
    },
   /**
    * 获取过滤行高度
    * @returns Number
    */
    getFilterRowHeight: function () {
        return this.showFilterRow ? mini.getHeight(this._filterEl) : 0;
    },
   /**
    * 获取汇总行高度
    * @returns Number
    */
    getSummaryRowHeight: function () {
        return this.showSummaryRow ? mini.getHeight(this._summaryEl) : 0;
    },
   /**
    * 获取横向滚动条区域高度
    * @private
    * @returns Number 未锁定列时返回0，否则返回其高度
    */
    _getScrollHeight: function () {
        return this.isFrozen() ? mini.getHeight(this._scrollEl) : 0;
    },
   /**
    * 获取创建tr行的html
    * @private
    * @param String name tr所属区域那么，如：body、filter、summary等
    * @returns String html
    */
    _CreateTopTr: function (name) {
        var isEmpty = name == "empty";
        var height = 0;
        if (isEmpty && this.showEmptyText == false)
            height = 1;

        var s = "";
        var columns = this.getBottomColumns();
        if (isEmpty) {
            s += '<tr style="height:' + height + 'px">';
        } else {
            if (isIE) {
                if (isIE6 || isIE7 || (isIE8 && !mini.boxModel) || (isIE9 && !mini.boxModel)) {
                    s += '<tr style="display:none;">';
                } else {
                    s += '<tr >';
                }
            } else {
                s += '<tr style="height:' + height + 'px">';
            }
        }
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var width = column.width;
            var id = this._createColumnId(column) + "$" + name;

            s += '<td id="' + id + '" style="padding:0;border:0;margin:0;height:' + height + 'px;';
            if (column.width)
                s += 'width:' + column.width;

            if (i < this.frozenStartColumn || column.visible == false) {
                s += ";display:none;";
            }

            s += '" ></td>';
        }
        s += "</tr>";
        return s;
    },
   /**
    * 重绘过滤行
    * @private
    */
   _doUpdateFilterRow: function () {

        if (this._filterEl.firstChild) {
            this._filterEl.removeChild(this._filterEl.firstChild);
        }
        var isFrozen = this.isFrozen();
        var columns = this.getBottomColumns();
        var sb = [];
        sb[sb.length] = '<table class="mini-grid-table" cellspacing="0" cellpadding="0">';
        sb[sb.length] = this._CreateTopTr("filter");
        sb[sb.length] = '<tr >';
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var id = this._createFilterCellId(column);

            sb[sb.length] = '<td id="';
            sb[sb.length] = id;
            sb[sb.length] = '" class="mini-grid-filterCell" style="';
            if ((isFrozen && i < this.frozenStartColumn)
            || column.visible == false
            || column._hide == true) {
                sb[sb.length] = ";display:none;";
            }
            sb[sb.length] = '"><span class="mini-grid-hspace"></span></td>';
        }

        sb[sb.length] = '</tr></table>';
        this._filterEl.innerHTML = sb.join('');

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (column.filter) {

                var cellEl = this.getFilterCellEl(i);
                column.filter.render(cellEl);
            }
        }
    },
   /**
    * 重绘汇总行
    * @private
    */
    _doUpdateSummaryRow: function () {
        var records = this.getData();
        if (this._summaryEl.firstChild) {
            this._summaryEl.removeChild(this._summaryEl.firstChild);
        }
        var isFrozen = this.isFrozen();
        var columns = this.getBottomColumns();
        var sb = [];
        sb[sb.length] = '<table class="mini-grid-table" cellspacing="0" cellpadding="0">';
        sb[sb.length] = this._CreateTopTr("summary");
        sb[sb.length] = '<tr >';
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var id = this._createSummaryCellId(column);
            var e = this._OnDrawSummaryCell(records, column);
            sb[sb.length] = '<td id="';
            sb[sb.length] = id;
            sb[sb.length] = '" class="mini-grid-summaryCell ' + e.cellCls + '" style="' + e.cellStyle + ';';
            if ((isFrozen && i < this.frozenStartColumn)
            || column.visible == false
            || column._hide == true) {
                sb[sb.length] = ";display:none;";
            }
            sb[sb.length] = '">';
            sb[sb.length] = e.cellHtml;
            sb[sb.length] = '</td>';
        }

        sb[sb.length] = '</tr></table>';
        this._summaryEl.innerHTML = sb.join('');

    },
   /**
    * 重绘列头
    * @private
    * @param String 列头样式，默认为""。
    */
    _doUpdateHeader: function (style) {
        style = style || "";
        var isFrozen = this.isFrozen();

        var rows = this.getColumnRows();

        var bottomColumns = this.getBottomColumns();
        var columnLength = bottomColumns.length;

        var sb = [];
        sb[sb.length] = '<table style="' + style + ';display:table" class="mini-grid-table" cellspacing="0" cellpadding="0">';
        sb[sb.length] = this._CreateTopTr("header");

        for (var j = 0, k = rows.length; j < k; j++) {
            var columns = rows[j];

            sb[sb.length] = '<tr >';
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];
                var header = column.header;
                if (typeof header == "function")
                    header = header.call(this, column);
                if (mini.isNull(header) || header === "")
                    header = "&nbsp;";

                var columnId = this._createColumnId(column);

                var sortCls = "";
                if (this.sortField == column.field) {
                    sortCls = this.sortOrder == "asc" ? "mini-grid-asc" : "mini-grid-desc";
                }

                sb[sb.length] = '<td id="';
                sb[sb.length] = columnId;
                sb[sb.length] = '" class="mini-grid-headerCell ' + sortCls + ' ' + (column.headerCls || "") + ' ';

                if (i == columnLength - 1) {
                    sb[sb.length] = " mini-grid-last-column ";
                }

                sb[sb.length] = '" style="';
                var bottomIndex = bottomColumns.indexOf(column);
                if ((isFrozen && bottomIndex != -1 && bottomIndex < this.frozenStartColumn)
                || column.visible == false
                || column._hide == true) {
                    sb[sb.length] = ";display:none;";
                }

                if (column.columns && column.columns.length > 0 && column.colspan == 0) {
                    sb[sb.length] = ";display:none;";
                }

                if (column.headerStyle) {
                    sb[sb.length] = column.headerStyle + ';';
                }
                if (column.headerAlign) {
                    sb[sb.length] = 'text-align:' + column.headerAlign + ';';
                }

                sb[sb.length] = '" ';

                if (column.rowspan) {
                    sb[sb.length] = 'rowspan="' + column.rowspan + '" ';
                }
                if (column.colspan) {
                    sb[sb.length] = 'colspan="' + column.colspan + '" ';
                }

                sb[sb.length] = '><div class="mini-grid-cellInner">';

                sb[sb.length] = header;

                if (sortCls) {
                    sb[sb.length] = '<span class="mini-grid-sortIcon"></span>';
                }

                sb[sb.length] = '</div>';

                sb[sb.length] = '</td>';
            }
            sb[sb.length] = '</tr>';
        }
        sb[sb.length] = '</table>';

        var s = sb.join("");
        s = '<div class="mini-grid-header">' + s + '</div>';

        var s = '<div class="mini-grid-scrollHeaderCell"></div>';
        s += '<div class="mini-grid-topRightCell"></div>';

        this._headerInnerEl.innerHTML = sb.join('') + s;
        this._topRightCellEl = this._headerInnerEl.lastChild;

        this.fire("refreshHeader");
    },
   /**
    * 重绘表格区，包括列头区及数据区
    * @private
    */
    _doUpdateBody: function () {

        var columns = this.getBottomColumns();

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            delete column._hide;
        }

        this._doUpdateHeader();

        var data = this.data;

        var isVirtualScroll = this.isVirtualScroll();
        var viewRegion = this._markRegion();

        var sb = [];

        var autoHeight = this.isAutoHeight();
        var top = 0;

        if (isVirtualScroll) {
            top = viewRegion.top;
        }

        if (autoHeight) {
            sb[sb.length] = '<table class="mini-grid-table" cellspacing="0" cellpadding="0">';
        } else {
            sb[sb.length] = '<table style="position:absolute;top:' + top + 'px;left:0;" class="mini-grid-table" cellspacing="0" cellpadding="0">';
        }

        sb[sb.length] = this._CreateTopTr("body");

        if (data.length > 0) {
            if (this.isGrouping()) {
                var rowIndex = 0;
                var groups = this._getGroupDataView();
                for (var j = 0, k = groups.length; j < k; j++) {
                    var group = groups[j];
                    var id = this.uid + "$group$" + group.id;
                    var e = this._OnDrawGroup(group);
					sb.push('<tr id="' + id + '" class="mini-grid-groupRow">');
					if(this.__fztj){
						var hjtr = {};
						for(var g = 0, gl = group.rows.length; g < gl; g++){
							for(var key in this.__fztj){
								if( !this.__fztj[key]){
									this.__fztj[key] = function(h, v){return h + v};
								}
								hjtr[key] = this.__fztj[key]( hjtr[key] || 0, group.rows[g][key] );
							}
						}
						var c = 0,cl = this.columns.length;
						for(; c < cl; c++){
							if(this.columns[c].field == this._groupField){
								sb.push('<td class="mini-grid-groupCell"><div class="mini-grid-groupHeader">');
			                    sb[sb.length] = '<div class="mini-grid-group-ecicon"></div>';
			                    sb[sb.length] = '<div class="mini-grid-groupTitle">' + e.cellHtml + '</div>';
			                    sb[sb.length] = '</div></td>';
							}else{
                                var subColumns = this.columns[c].columns;
                                if(subColumns && subColumns.length){
                                    var d = 0, dl = subColumns.length;
                                    for(; d < dl; d++){
                                        sb.push('<td class="mini-grid-groupCell">' + (hjtr[subColumns[d].field] || '') + '</td>');
                                    }
                                }else{
                                    sb.push('<td class="mini-grid-groupCell">' + (hjtr[this.columns[c].field] || '') + '</td>');
                                }
							}
						}
					}else{
	                    sb[sb.length] = '<td class="mini-grid-groupCell" colspan="' + columns.length + '"><div class="mini-grid-groupHeader">';
	                    sb[sb.length] = '<div class="mini-grid-group-ecicon"></div>';
	                    sb[sb.length] = '<div class="mini-grid-groupTitle">' + e.cellHtml + '</div>';
	                    sb[sb.length] = '</div></td>';
					}
					sb.push('</tr>');

                    var rows = group.rows;
                    for (var i = 0, l = rows.length; i < l; i++) {
                        var row = rows[i];
                        this._createRow(row, sb, rowIndex++);
                    }

                    if (this.showGroupSummary) {

                    }
                }

            } else {

                if (isVirtualScroll) {

                    var start = viewRegion.start, end = viewRegion.end;
                    for (var i = start, l = end; i < l; i++) {
                        var row = data[i];
                        this._createRow(row, sb, i);
                    }

                } else {
                    for (var i = 0, l = data.length; i < l; i++) {
                        var row = data[i];
                        this._createRow(row, sb, i);
                    }
                }
            }
        } else {

            if (this.showEmptyText) {
                sb[sb.length] = '<tr><td class="mini-grid-emptyText" colspan="50">' + this.emptyText + '</td></tr>';
            }
        }
        sb[sb.length] = '</table>';

        if (this._bodyInnerEl.firstChild) {
            this._bodyInnerEl.removeChild(this._bodyInnerEl.firstChild);
        }

        this._bodyInnerEl.innerHTML = sb.join('');

        if (isVirtualScroll) {

            this._rowHeight = 23;
            try {
                var rowEl = this._bodyInnerEl.firstChild.rows[1];
                if (rowEl)
                    this._rowHeight = rowEl.offsetHeight;
            } catch (ex) {
            }
            var rowAllHeight = this._rowHeight * this.data.length;

            this._bodyScrollEl.style.display = "block";
            this._bodyScrollEl.style.height = rowAllHeight + "px";
        } else {
            this._bodyScrollEl.style.display = "none";
        }
    },
   /**
    * 是否显示新增数据标识
    * @default true
    * @type Boolean
    */
    showNewRow: true,
   /**
    * 获取创建表格数据行的html
    * @private
    * @param row 行对象
    * @param sb html字符串数据，默认为[]
    * @param rowIndex 数据行rowIndex
    * @returns String 当!sb为true时，返回表格数据行的html，否则无返回值
    */
    _createRow: function (row, sb, rowIndex) {
        if (!mini.isNumber(rowIndex))
            rowIndex = this.indexOf(row);

        var lastRow = rowIndex == this.data.length - 1;

        var isFrozen = this.isFrozen();
        var ret = !sb;
        if (!sb)
            sb = [];
        var columns = this.getBottomColumns();

        var rowClsIndex = -1;
        var rowCls = " ";
        var rowStyleIndex = -1;
        var rowStyle = " ";

        sb[sb.length] = '<tr id="';
        sb[sb.length] = this._createRowId(row);
        sb[sb.length] = '" class="mini-grid-row ';
        if (this.isSelected(row)) {
            sb[sb.length] = this._rowSelectedCls;
            sb[sb.length] = " ";
        }

        if (row._state == "deleted")
            sb[sb.length] = "mini-grid-deleteRow ";
        if (row._state == "added" && this.showNewRow)
            sb[sb.length] = "mini-grid-newRow ";

        if (this.allowAlternating && rowIndex % 2 == 1) {
            sb[sb.length] = this._alternatingCls;
            sb[sb.length] = " ";
        }

        rowClsIndex = sb.length;
        sb[sb.length] = rowCls;
        sb[sb.length] = '" style="';
        rowStyleIndex = sb.length;
        sb[sb.length] = rowStyle;
        sb[sb.length] = '">';

        var columnsCount = columns.length - 1;

        for (var j = 0, k = columnsCount; j <= k; j++) {
            var column = columns[j];

            var isModified = column.field ? this._HasRowModified(row, column.field) : false;
            var error = this.getCellError(row, column);

            var e = this._OnDrawCell(row, column, rowIndex, j);

            var cellId = this._createCellId(row, column);

            sb[sb.length] = '<td id="';
            sb[sb.length] = cellId;
            sb[sb.length] = '" class="mini-grid-cell ';
            if (e.cellCls)
                sb[sb.length] = e.cellCls;
            if (error)
                sb[sb.length] = " mini-grid-cell-error ";

            if (this._currentCell && this._currentCell[0] == row && this._currentCell[1] == column) {
                sb[sb.length] = " ";
                sb[sb.length] = this._cellSelectedCls;
            }

            if (lastRow) {
                sb[sb.length] = " mini-grid-last-row ";
            }
            if (j == columnsCount) {
                sb[sb.length] = " mini-grid-last-column ";
            }

            if (isFrozen && this.frozenStartColumn <= j && j <= this.frozenEndColumn) {
                sb[sb.length] = " ";
                sb[sb.length] = this._frozenCellCls + " ";
            }

            sb[sb.length] = '" style="';

            if (column.align) {
                sb[sb.length] = 'text-align:';
                sb[sb.length] = column.align;
                sb[sb.length] = ';';
            }

            if (e.allowCellWrap) {
                sb[sb.length] = "white-space:normal;text-overflow:normal;word-break:normal;";
            }

            if (e.cellStyle) {
                sb[sb.length] = e.cellStyle;
                sb[sb.length] = ";";
            }

            if (isFrozen && j < this.frozenStartColumn || column.visible == false || column._hide == true) {
                sb[sb.length] = "display:none;";
            }

            sb[sb.length] = '">';
            if (isModified && this.showModified) {
                sb[sb.length] = '<div class="mini-grid-cell-inner mini-grid-cell-dirty">';
            }
            sb[sb.length] = e.cellHtml;
            if (isModified) {
                sb[sb.length] = '</div>';
            }
            sb[sb.length] = '</td>';

            if (e.rowCls)
                rowCls = e.rowCls;
            if (e.rowStyle)
                rowStyle = e.rowStyle;
        }

        sb[rowClsIndex] = rowCls;
        sb[rowStyleIndex] = rowStyle;

        sb[sb.length] = '</tr>';

        if (ret) {

            return sb.join('');
        }
    },
   /**
    * 是否虚拟滚动
    * @returns Boolean
    */
    isVirtualScroll: function () {
        return this.virtualScroll && this.isAutoHeight() == false && this.isGrouping() == false;
    },
   /**
    * 获取表格的scrollLeft
    * @returns Number
    */
    getScrollLeft: function () {
        return this.isFrozen() ? this._scrollEl.scrollLeft : this._bodyEl.scrollLeft;
    },
   /**
    * 重绘表格，当_allowUpdate为true时有效
    */
    doUpdate: function () {
        var sss = new Date();
        if (this._allowUpdate === false)
            return;

        if (this.isAutoHeight() == true) {
            this.addCls("mini-grid-auto");
        } else {
            this.removeCls("mini-grid-auto");
        }
        if (this._doUpdateSummaryRow)
            this._doUpdateSummaryRow();
        this._doUpdateBody();

        if (this.isVirtualScroll()) {

        }

        if (this.isFrozen()) {

            this.__OnHScroll();
        }

        this.doLayout();

    },
   /**
    * 修改IE下的样式问题
    * @private
    */
    _fixIE: function () {
        if (isIE) {

            this._borderEl.style.display = "none";
            h = this.getHeight(true);
            w = this.getWidth(true);
            this._borderEl.style.display = "";
        }
    },
   /**
    * 延迟调整布局
    * @private
    */
    _deferLayout: function () {
        var me = this;
        if (this._layoutTimer)
            return;
        this._layoutTimer = setTimeout( function () {
            me.doLayout();
            me._layoutTimer = null;
        }, 1);
    },
   /**
    * 调整布局
    */
    doLayout: function () {

        if (!this.canLayout())
            return;

        this._headerInnerEl.scrollLeft = this._bodyEl.scrollLeft;

        var sss = new Date();

        var isFrozen = this.isFrozen();

        var headerTable = this._headerInnerEl.firstChild, bodyTable = this._bodyInnerEl.firstChild;
        var filterTable = this._filterEl.firstChild, summaryTable = this._summaryEl.firstChild;

        var autoHeight = this.isAutoHeight();

        h = this.getHeight(true);
        w = this.getWidth(true);

        var elWidth = w;
        if (elWidth < 17)
            elWidth = 17;
        if (h < 0)
            h = 0;

        var bodyWidth = elWidth, bodyHeight = 2000;

        if (!autoHeight) {
            h = h - this.getHeaderHeight() - this.getFooterHeight() - this.getFilterRowHeight() - this.getSummaryRowHeight() - this._getScrollHeight();
            if (h < 0)
                h = 0;

            this._bodyEl.style.height = h + "px";

            bodyHeight = h;
        } else {
            this._bodyEl.style.height = "auto";
        }

        var bodyScrollHeight = this._bodyEl.scrollHeight;
        var bodyClientHeight = this._bodyEl.clientHeight;

        var hiddenY = jQuery(this._bodyEl).css("overflow-y") == "hidden";
        if (this.isFitColumns()) {

            if (hiddenY || bodyClientHeight >= bodyScrollHeight || autoHeight) {
                var w = bodyWidth + 'px'
                headerTable.style.width = w;
                bodyTable.style.width = w;
                filterTable.style.width = w;
                summaryTable.style.width = w;
            } else {
                var w = parseInt(bodyWidth - 18);
                if (w < 0)
                    w = 0;
                w = w + 'px';
                headerTable.style.width = w;
                bodyTable.style.width = w;
                filterTable.style.width = w;
                summaryTable.style.width = w;
            }
            if (autoHeight) {

                if (bodyWidth >= this._bodyEl.scrollWidth - 1) {
                    this._bodyEl.style.height = "auto";
                } else {
                    this._bodyEl.style.height = (bodyTable.offsetHeight + 17) + "px";
                }
            }
            if (autoHeight && isFrozen) {
                this._bodyEl.style.height = "auto";
            }

        } else {
            headerTable.style.width = bodyTable.style.width = "0px";
            filterTable.style.width = summaryTable.style.width = "0px";

        }

        if (this.isFitColumns()) {

            if (!hiddenY && bodyClientHeight < bodyScrollHeight) {
                var w = elWidth - 18;
                if (w < 0)
                    w = 0;

            } else {
                this._headerInnerEl.style.width = "100%";
                this._filterEl.style.width = "100%";
                this._summaryEl.style.width = "100%";
                this._footerEl.style.width = "auto";
            }

        } else {
            this._headerInnerEl.style.width = "100%";
            this._filterEl.style.width = "100%";
            this._summaryEl.style.width = "100%";
            this._footerEl.style.width = "auto";
        }

        if (this.isFrozen()) {

            if (!hiddenY && bodyClientHeight < this._bodyEl.scrollHeight) {

                this._scrollEl.style.width = (elWidth - 17) + "px";
            } else {

                this._scrollEl.style.width = (elWidth) + "px";
            }

            if (this._bodyEl.offsetWidth < bodyTable.offsetWidth || this.isFrozen()) {

                this._scrollEl.firstChild.style.width = this._getColumnsScrollWidth() + "px";
                headerTable.style.width = bodyTable.style.width = "0px";
                filterTable.style.width = summaryTable.style.width = "0px";
            } else {
                this._scrollEl.firstChild.style.width = "0px";
            }

        } else {

        }

        if (this.data.length == 0) {
            this._doInnerLayout();
        } else {
            var me = this;
            if (!this._innerLayoutTimer) {

                this._innerLayoutTimer = setTimeout( function () {
                    me._doInnerLayout();
                    me._innerLayoutTimer = null;
                }, 10);
            }
        }

        this._doLayoutTopRightCell();
        this.fire("layout");

    },
   /**
    * 调整列头最后一个单元格的布局
    * @private
    */
    _doLayoutTopRightCell: function () {
        var headerTable = this._headerInnerEl.firstChild;
        var width = headerTable.offsetWidth + 1;
        var height = headerTable.offsetHeight - 1;
        if (height < 0)
            height = 0;
        this._topRightCellEl.style.left = width + "px";
        this._topRightCellEl.style.height = height + "px";
    },
   /**
    * 调整表格内部布局
    * @private
    */
    _doInnerLayout: function () {

        this._doLayoutDetailRows();
        this._doLayoutEditingRows();
        mini.layout(this._filterEl);
        mini.layout(this._summaryEl);
        mini.layout(this._footerEl);
        mini.repaint(this.el);
        this._doLayouted = true;
    },
   /**
    * 设置固定列宽，为true时调整表格布局为固定列宽，否则，取消表格固定列宽布局
    * @param Boolean value
    */
    setFitColumns: function (value) {
        this.fitColumns = value;

        if (this.fitColumns) {
            mini.removeClass(this.el, "mini-grid-fixcolumns");

        } else {
            mini.addClass(this.el, "mini-grid-fixcolumns");
        }

        this.doLayout();
    },
   /**
    * 获取是否固定列宽
    * @returns Boolean
    */
    getFitColumns: function (value) {
        return this.fitColumns;
    },
   /**
    * 判断是否固定列宽
    * @returns Boolean fitColumns为true且无冻结列时返回true
    */
    isFitColumns: function () {
        return this.fitColumns && !this.isFrozen();
    },
   /**
    * 获取列滚动区域宽度
    * @returns Number 当表格存在横向滚动条时返回所有列宽度之和，否则返回0
    */
    _getColumnsScrollWidth: function () {
        if (this._bodyEl.offsetWidth < this._bodyInnerEl.firstChild.offsetWidth || this.isFrozen()) {
            var width = 0;
            var columns = this.getBottomColumns();
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];

                width += this.getColumnWidth(column);

            }
            return width;

        } else {
            return 0;
        }
    },
   /**
    * 获取rowId
    * @private
    * @param Object row 行对象
    * @returns String
    */
    _createRowId: function (row) {
        return this.uid + "$" + row._uid;
    },
   /**
    * 获取单元格id
    * @private
    * @param Object row  行对象
    * @param Object column 列信息
    * @returns String
    */
    _createCellId: function (row, column) {
        return this.uid + "$" + row._uid + "$" + column._id;
    },
   /**
    * 获取过滤行单元格id
    * @private
    * @param Object column 列信息
    * @returns String
    */
    _createFilterCellId: function (column) {
        return this.uid + "$filter$" + column._id;
    },
   /**
    * 获取汇总行单元格id
    * @private
    * @param Object column 列信息
    * @returns String
    */
    _createSummaryCellId: function (column) {
        return this.uid + "$summary$" + column._id;
    },
   /**
    * 获取行详情id
    * @private
    * @param Object row 行对象
    * @returns String
    */
    _createRowDetailId: function (row) {
        return this.uid + "$detail$" + row._uid;
    },
   /**
    * 获取列头inner DOM对象
    * @private
    * @returns DOM对象
    */
    _getHeaderScrollEl: function () {
        return this._headerInnerEl;
    },
   /**
    * 获取过滤行单元格DOM对象
    * @param Object/Number/String column 列对象或列index或列name
    * @returns DOM对象
    */
    getFilterCellEl: function (column) {
        column = this.getColumn(column);
        if (!column)
            return null;
        return document.getElementById(this._createFilterCellId(column));
    },
   /**
    * 获取汇总行单元格DOM对象
    * @param Object/Number/String column 列信息或列index或列name
    * @returns DOM对象
    */
    getSummaryCellEl: function (column) {
        column = this.getColumn(column);
        if (!column)
            return null;
        return document.getElementById(this._createSummaryCellId(column));
    },
   /**
    * 获取数据行DOM对象
    * @private
    * @param Object/Number row 行对象或行rowIndex
    * @returns DOM对象
    */
    _getRowEl: function (row) {
        row = this.getRow(row);
        if (!row)
            return null;
        return document.getElementById(this._createRowId(row));
    },
   /**
    * 获取单元格的布局
    * @param Object/Number row 行对象或行rowIndex
    * @param Object/Number/String column 列信息或列index或列name
    * @returns Object 单元格不存在时返回null，否则返回布局信息，格式：{x:0,y:0,width:100,height:100,left:0,right:10,top:0, bottom:10}
    */
    getCellBox: function (row, column) {
        row = this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column)
            return null;
        var cellEl = this._getCellEl(row, column);
        if (!cellEl)
            return null;
        return mini.getBox(cellEl);
    },
   /**
    * 获取数据行的布局
    * @param Object/Number row 行对象或行rowIndex
    * @returns Object 单元格不存在时返回null，否则返回布局信息，格式：{x:0,y:0,width:100,height:100,left:0,right:10,top:0, bottom:10}
    */
    getRowBox: function (row) {
        var rowEl = this._getRowEl(row);
        if (rowEl)
            return mini.getBox(rowEl);
        return null;
    },
   /**
    * 获取所有数据行的布局
    * @returns Array 格式：[{top: 0, height: 10, bottom: 10}]
    */
    getRowsBox: function () {
        var rowBoxs = [];
        var rows = this.data;
        var top = 0;

        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            var id = this._createRowId(row);
            var rowEl = document.getElementById(id);
            if (rowEl) {
                var h = rowEl.offsetHeight;
                rowBoxs[i] = {
                    top: top,
                    height: h,
                    bottom: top + h
                };
                top += h;
            }
        }
        return rowBoxs;
    },
   /**
    * 设置列宽，并重新布局
    * @param Object/Number/String column 列信息或列index或列name
    * @param Number/String width 列宽
    */
    setColumnWidth: function (column, width) {
        column = this.getColumn(column);
        if (!column)
            return;
        if (mini.isNumber(width))
            width += "px";
        column.width = width;

        var id1 = this._createColumnId(column) + "$header";
        var id2 = this._createColumnId(column) + "$body";
        var id3 = this._createColumnId(column) + "$filter";
        var id4 = this._createColumnId(column) + "$summary";
        var el1 = document.getElementById(id1);
        var el2 = document.getElementById(id2);
        var el3 = document.getElementById(id3);
        var el4 = document.getElementById(id4);
        if (el1)
            el1.style.width = width;
        if (el2)
            el2.style.width = width;
        if (el3)
            el3.style.width = width;
        if (el4)
            el4.style.width = width;

        this.doLayout();
    },
   /**
    * 获取列宽
    * @param Object/Number/String column 列信息或列index或列name
    * @returns Number
    */
    getColumnWidth: function (column) {
        column = this.getColumn(column);
        if (!column)
            return 0;
        if (column.visible == false)
            return 0;

        var w = 0;
        //解决IE8下调整列宽报错问题（表格中无数据时） 赵美丹 2013-02-28
        var id = this._createColumnId(column);
        var el = document.getElementById(id);
        if (el) {
            var display = el.style.display;
            el.style.display = "";
            w = mini.getWidth(el);
            el.style.display = display;
        }
        return w;
    },
   /**
    * 调整列的显示/隐藏
    * @private
    * @param Object column 列信息
    * @param Boolean visible 是否显示
    */
    _doVisibleColumn: function (column, visible) {

        var columnEl = document.getElementById(this._createColumnId(column));
        if (columnEl)
            columnEl.style.display = visible ? "" : "none";

        var filterCell = document.getElementById(this._createFilterCellId(column));
        if (filterCell)
            filterCell.style.display = visible ? "" : "none";

        var summaryCell = document.getElementById(this._createSummaryCellId(column));
        if (summaryCell)
            summaryCell.style.display = visible ? "" : "none";

        var id1 = this._createColumnId(column) + "$header";
        var id2 = this._createColumnId(column) + "$body";
        var id3 = this._createColumnId(column) + "$filter";
        var id4 = this._createColumnId(column) + "$summary";
        var el1 = document.getElementById(id1);
        if (el1)
            el1.style.display = visible ? "" : "none";
        var el3 = document.getElementById(id3);
        if (el3)
            el3.style.display = visible ? "" : "none";
        var el4 = document.getElementById(id4);
        if (el4)
            el4.style.display = visible ? "" : "none";

        if (el2) {
            if (visible && el2.style.display == "")
                return;
            if (!visible && el2.style.display == "none")
                return;
        }

        var el2 = document.getElementById(id2);
        if (el2)
            el2.style.display = visible ? "" : "none";

        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            var cellId = this._createCellId(row, column);
            var cellEl = document.getElementById(cellId);
            if (cellEl) {
                cellEl.style.display = visible ? "" : "none";
            }
        }

    },
    /**
    * 调整列的样式
    * @private
    */ 
    _doClassColumn: function (column, cls, add) {
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            var cellId = this._createCellId(row, column);
            var cellEl = document.getElementById(cellId);
            if (cellEl) {
                if (add) {
                    mini.addClass(cellEl, cls);
                } else {
                    mini.removeClass(cellEl, cls);
                }
            }
        }
    },
   /**
    * 调整列的锁定状态
    * @private
    */ 
    __doFrozen: function () {
        this._scrollEl.scrollLeft = this._headerInnerEl.scrollLeft = this._bodyEl.scrollLeft = 0;

        var isFrozen = this.isFrozen();
        if (isFrozen) {
            mini.addClass(this.el, this._frozenCls);
        } else {
            mini.removeClass(this.el, this._frozenCls);
        }

        var columns = this.getBottomColumns();

        var filterTable = this._filterEl.firstChild, summaryTable = this._summaryEl.firstChild;

        if (isFrozen) {
            filterTable.style.height = jQuery(filterTable).outerHeight() + "px";
            summaryTable.style.height = jQuery(summaryTable).outerHeight() + "px";
        } else {
            filterTable.style.height = "auto";
            summaryTable.style.height = "auto";
        }

        if (this.isFrozen()) {

            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];
                if (this.frozenStartColumn <= i && i <= this.frozenEndColumn) {
                    this._doClassColumn(column, this._frozenCellCls, true);
                }
            }

            this._doFixRowsHeight(true);
        } else {
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];
                delete column._hide;
                if (column.visible) {
                    this._doVisibleColumn(column, true);
                }
                this._doClassColumn(column, this._frozenCellCls, false);
            }
            this._doUpdateHeader();

            this._doFixRowsHeight(false);
        }

        this.doLayout();

        this._fixIE();

    },
   /**
    * 延迟1毫秒调整列锁定状态
    * @private
    */
    _deferFrozen: function () {
        this._headerTableHeight = mini.getHeight(this._headerInnerEl.firstChild);

        var me = this;
        if (this._deferFrozenTimer)
            clearTimeout(this._deferFrozenTimer);
        this._deferFrozenTimer = setTimeout( function () {

            me.__doFrozen();
        }, 1);
    },
   /**
    * 设置锁定开始列，并重新布局
    * @param Number value 列index
    */
    setFrozenStartColumn: function (value) {

        var sss = new Date();
        value = parseInt(value);
        if (isNaN(value))
            return;
        this.frozenStartColumn = value;
        this._deferFrozen();
    },
   /**
    * 获取锁定开始列
    * @returns Number
    */
    getFrozenStartColumn: function () {
        return this.frozenStartColumn;
    },
   /**
    * 设置锁定截止列，并重新布局
    * @param Number value 列index
    */
    setFrozenEndColumn: function (value) {
        value = parseInt(value);
        if (isNaN(value))
            return;
        this.frozenEndColumn = value;

        this._deferFrozen();
    },
   /**
    * 获取锁定截止列
    * @returns Number
    */
    getFrozenEndColumn: function () {
        return this.frozenEndColumn;
    },
   /**
    * 解除列锁定
    */
    unFrozenColumns: function () {
        this.setFrozenStartColumn(-1);
        this.setFrozenEndColumn(-1);
    },
   /**
    * 锁定列
    * @param Number start 锁定开始列
    * @param Number end 锁定截止列
    */
    frozenColumns: function (start, end) {
        this.unFrozenColumns();
        this.setFrozenStartColumn(start);
        this.setFrozenEndColumn(end);
    },
   /**
    * 数据行高度，修改表格行样式时需同步调整该值
    * @default 23
    * @private
    * @type Number
    */
    _rowHeight: 23,
   /**
    * 获取虚拟滚动的布局信息
    * @private
    * @returns Object 格式：{start: 起始行rowIndex, end: 截止行rowIndex, top: top坐标 }
    */
    _markRegion: function () {
        var region = this._getViewNowRegion();

        var rowHeight = this._rowHeight;
        var scrollTop = this._bodyEl.scrollTop;

        var start = region.start, end = region.end;
        for (var i = 0, l = this.data.length; i < l; i += this._virtualRows) {
            var i2 = i + this._virtualRows;
            if (i <= start && start < i2) {
                start = i;
            }
            if (i < end && end <= i2) {
                end = i2;
            }
        }
        if (end > this.data.length)
            end = this.data.length;

        var top = start * rowHeight;

        this._viewRegion = {
            start: start,
            end: end,
            top: top
        };

        return this._viewRegion;
    },
   /**
    * 获取当前表格已加载数据区域的布局信息
    * @private
    * @returns Object 格式：{start: 起始行rowIndex, end: 截止行rowIndex}
    */
    _getViewNowRegion: function () {

        var rowHeight = this._rowHeight;
        var scrollTop = this._bodyEl.scrollTop;
        var bodyHeight = this._bodyEl.offsetHeight;

        var startRow = parseInt(scrollTop / rowHeight);
        var endRow = parseInt((scrollTop + bodyHeight) / rowHeight) + 1;
        var region = {
            start: startRow,
            end: endRow
        };
        return region;
    },
   /**
    * 是否需要虚拟滚动
    * @private
    * @returns Boolean 当前滚动区域数据已加载时返回false，否则返回true
    */
    _canVirtualUpdate: function () {
        if (!this._viewRegion)
            return true;
        var region = this._getViewNowRegion();
        if (this._viewRegion.start <= region.start && region.end <= this._viewRegion.end)
            return false;
        return true;
    },
   /**
    * 绘制虚拟滚动区
    * @private
    */
    _tryUpdateScroll: function () {
        var doUpdate = this._canVirtualUpdate();
        if (doUpdate) {
            this.doUpdate();
        }
    },
   /**
    * 表格数据区滚动事件处理函数（非锁定列情况下）
    * @private
    * @param DataGrid e
    */
    __OnBodyScroll: function (e) {
        if (this.isFrozen())
            return;
        this._filterEl.scrollLeft = this._summaryEl.scrollLeft = this._headerInnerEl.scrollLeft = this._bodyEl.scrollLeft;

        var me = this;
        setTimeout( function () {
            me._headerInnerEl.scrollLeft = me._bodyEl.scrollLeft;
        }, 10);
        if (this.isVirtualScroll()) {

            var me = this;
            if (this._scrollTopTimer) {
                clearTimeout(this._scrollTopTimer);
            }
            this._scrollTopTimer = setTimeout( function () {
                me._scrollTopTimer = null;
                me._tryUpdateScroll();
            }, 100);
        }
    },
   /**
    * 表格数据区滚动事件处理函数（锁定列情况下）
    * @private
    * @param DataGrid e
    */
    __OnHScroll: function (e) {

        var me = this;
        if (this._HScrollTimer)
            return;
        this._HScrollTimer = setTimeout( function () {
            me._doScrollFrozen();
            me._HScrollTimer = null;

        }, 30);
    },
   /**
    * 表格数据区滚动处理（非锁定列情况下）
    * @private
    */
    _doScrollFrozen: function () {
        if (!this.isFrozen())
            return;

        var columns = this.getBottomColumns();

        var x = this._scrollEl.scrollLeft;

        var startColumn = this.frozenEndColumn;
        var left = 0;
        for (var i = startColumn + 1, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (!column.visible) {
                continue;
            }
            var w = this.getColumnWidth(column);
            if (x <= left)
                break;
            startColumn = i;
            left += w;
        }

        if (this._lastStartColumn === startColumn) {

            return;
        }

        this._lastStartColumn = startColumn;

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            delete column._hide;
            if (this.frozenEndColumn < i && i <= startColumn) {
                column._hide = true;
            }
        }

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];

            if (i < this.frozenStartColumn
            || (i > this.frozenEndColumn && i < startColumn)
            ) {

                this._doVisibleColumn(column, false);
            } else {
                this._doVisibleColumn(column, true);
            }
        }

        var style = "width:100%;";
        if (this._scrollEl.offsetWidth < this._scrollEl.scrollWidth || !this.isFitColumns()) {
            style = "width:0px";
        }

        this._doUpdateHeader(style);

        var h = this._headerTableHeight;
        if (mini.isIE9)
            h -= 1;
        mini.setHeight(this._headerInnerEl.firstChild, h);

        for (var i = this.frozenEndColumn + 1, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (!column.visible)
                continue;
            if (i <= startColumn) {
                this._doVisibleColumn(column, false);
            } else {
                this._doVisibleColumn(column, true);
            }
        }

        this._doUpdateDetailColSpan();

        this._doMargeCells();

        this._doLayoutTopRightCell();

        this.fire("layout");
    },
   /**
    * 调整数据行的高度
    * @private
    * @param Boolean fix 为true时将数据行的高度修改为0px，为false时将数据行的高度修改为空
    */
    _doFixRowsHeight: function (fix) {

        var data = this.data;
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            var rowEl = this._getRowEl(row);
            if (rowEl) {
                if (fix) {
                    var h = 0;

                    rowEl.style.height = h + "px";
                } else {
                    rowEl.style.height = "";
                }
            }
        }
    },
   /**
    * 绘制表格线条
    * @private
    */
    _doGridLines: function () {

        if (this.showVGridLines) {
            mini.removeClass(this.el, "mini-grid-hideVLine");
        } else {
            mini.addClass(this.el, "mini-grid-hideVLine");
        }
        if (this.showHGridLines) {
            mini.removeClass(this.el, "mini-grid-hideHLine");
        } else {
            mini.addClass(this.el, "mini-grid-hideHLine");
        }
    },
   /**
    * 设置横向表格线条的显示/隐藏
    * @param Boolean value 是否显示
    */
    setShowHGridLines: function (value) {
        if (this.showHGridLines != value) {
            this.showHGridLines = value;
            this._doGridLines();
            this.doLayout();
        }
    },
   /**
    * 获取是否显示横向表格线条
    * @returns Boolean
    */
    getShowHGridLines: function () {
        return this.showHGridLines;
    },
   /**
    * 设置纵向表格线条的显示/隐藏
    * @param Boolean value 是否显示
    */
    setShowVGridLines: function (value) {
        if (this.showVGridLines != value) {
            this.showVGridLines = value;
            this._doGridLines();
            this.doLayout();
        }
    },
   /**
    * 获取是否显示纵向表格线条
    * @returns Boolean
    */
    getShowVGridLines: function () {
        return this.showVGridLines;
    },
   /**
    * 设置是否显示过滤行
    * @param Boolean value 是否显示
    */
    setShowFilterRow: function (value) {
        if (this.showFilterRow != value) {
            this.showFilterRow = value;
            this._doShowRows();
            this.doLayout();
        }
    },
   /**
    * 获取是否显示过滤行
    * @returns Boolean
    */
    getShowFilterRow: function () {
        return this.showFilterRow;
    },
   /**
    * 设置是否显示汇总行
    * @param Boolean value 是否显示
    */
    setShowSummaryRow: function (value) {
        if (this.showSummaryRow != value) {
            this.showSummaryRow = value;
            this._doShowRows();
            this.doLayout();
        }
    },
   /**
    * 获取是否显示汇总行
    * @returns Boolean
    */
    getShowSummaryRow: function () {
        return this.showSummaryRow;
    },
   /**
    * 绘制斑马纹
    * @private
    */
    _doAlternating: function () {
        if (this.allowAlternating == false)
            return;
        var data = this.data;
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            var rowEl = this._getRowEl(row);
            if (rowEl) {
                if (this.allowAlternating && i % 2 == 1) {
                    mini.addClass(rowEl, this._alternatingCls);
                } else {
                    mini.removeClass(rowEl, this._alternatingCls);
                }
            }
        }
    },
   /**
    * 设置是否显示斑马纹
    * @param Boolean value 是否显示
    */
    setAllowAlternating: function (value) {
        if (this.allowAlternating != value) {
            this.allowAlternating = value;
            this._doAlternating();
        }
    },
   /**
    * 获取是否显示斑马纹
    * @returns Boolean
    */
    getAllowAlternating: function () {
        return this.allowAlternating;
    },
   /**
    * 设置是否移动到行时高亮显示
    * @param Boolean value 是否高亮显示
    */
    setEnableHotTrack: function (value) {
        if (this.enableHotTrack != value) {
            this.enableHotTrack = value;
        }
    },
   /**
    * 获取是否移动到行时高亮显示
    * @returns Boolean
    */
    getEnableHotTrack: function () {
        return this.enableHotTrack;
    },
   /**
    * 设置是否显示Loading遮罩效果
    * @param Boolean value 是否显示
    */
    setShowLoading: function (value) {
        this.showLoading = value;
    },
   /**
    * 设置是否允许单元格换行
    * @param Boolean value 是否允许
    */
    setAllowCellWrap: function (value) {
        if (this.allowCellWrap != value) {
            this.allowCellWrap = value;
        }
    },
   /**
    * 获取是否允许单元格换行
    * @returns Boolean
    */
    getAllowCellWrap: function () {
        return this.allowCellWrap;
    },
   /**
    * 设置是否允许列头文本换行
    * @param Boolean value 是否允许
    */
    setAllowHeaderWrap: function (value) {
        this.allowHeaderWrap = value;
        mini.removeClass(this.el, "mini-grid-headerWrap");
        if (value) {
            mini.addClass(this.el, "mini-grid-headerWrap");
        }
    },
   /**
    * 获取是否允许列头文本换行
    * @returns Boolean
    */
    getAllowHeaderWrap: function () {
        return this.allowHeaderWrap;
    },
   /**
    * 设置是否显示列头菜单
    * @param Boolean value 是否显示
    */
    setShowColumnsMenu: function (value) {
        this.showColumnsMenu = value;
    },
   /**
    * 获取是否显示列头菜单
    * @returns Boolean
    */
    getShowColumnsMenu: function () {
        return this.showColumnsMenu;
    },
   /**
    * 设置是否虚拟滚动
    * @param Boolean value 是否虚拟滚动
    */
    setVirtualScroll: function (value) {
        if (this.virtualScroll != value) {
            this.virtualScroll = value;
        }
    },
   /**
    * 获取是否虚拟滚动
    * @returns Boolean
    */
    getVirtualScroll: function () {
        return this.virtualScroll;
    },
   /**
    * 设置表格数据区的scrollTop
    * @param Number value scrollTop值
    */
    setScrollTop: function (value) {
        this.scrollTop = value;
        this._bodyEl.scrollTop = value;

    },
   /**
    * 获取表格数据区的scrollTop
    * @returns Number
    */
    getScrollTop: function () {
        return this._bodyEl.scrollTop;
    },
   /**
    * 设置表格数据区样式
    * @param String value 样式
    */
    setBodyStyle: function (value) {
        this.bodyStyle = value;
        mini.setStyle(this._bodyEl, value);
    },
   /**
    * 获取表格数据区样式
    * @returns String
    */
    getBodyStyle: function () {
        return this.bodyStyle;
    },
   /**
    * 设置表格数据区样式类
    * @param String value 样式类
    */
    setBodyCls: function (value) {
        this.bodyCls = value;
        mini.addClass(this._bodyEl, value);
    },
   /**
    * 获取表格数据区样式类
    * @returns String
    */
    getBodyCls: function () {
        return this.bodyCls;
    },
   /**
    * 设置表格底部工具条样式
    * @param String value 样式
    */
    setFooterStyle: function (value) {
        this.footerStyle = value;
        mini.setStyle(this._footerEl, value);
    },
   /**
    * 获取表格底部工具条样式
    * @returns String
    */
    getFooterStyle: function () {
        return this.footerStyle;
    },
   /**
    * 设置表格底部工具条样式类
    * @param String value 样式类
    */
    setFooterCls: function (value) {
        this.footerCls = value;
        mini.addClass(this._footerEl, value);
    },
   /**
    * 获取表格底部工具条样式类
    * @returns String
    */
    getFooterCls: function () {
        return this.footerCls;
    },
   /**
    * 设置是否显示列头
    * @param Boolean value 是否显示
    */
    setShowHeader: function (value) {
        this.showHeader = value;
        this._doShowRows();
        this.doLayout();
    },
   /**
    * 设置是否显示底部工具条
    * @param Boolean value 是否显示
    */
    setShowFooter: function (value) {
        this.showFooter = value;
        this._doShowRows();
        this.doLayout();
    },
   /**
    * 设置是否自动收起其他行的行详情，展开行详情时触发
    * @param Boolean value 是否显示
    */
    setAutoHideRowDetail: function (value) {
        this.autoHideRowDetail = value;

    },
   /**
    * 设置排序模式
    * @param String 取值范围server、client
    */
    setSortMode: function (value) {
        this.sortMode = value;
    },
   /**
    * 获取排序模式
    * @returns String
    */
    getSortMode: function () {
        return this.sortMode;
    },
   /**
    * 设置是否允许列排序
    * @param Boolean value 是否允许
    */
    setAllowSortColumn: function (value) {
        this.allowSortColumn = value;
    },
    /**
    * 获取是否允许列排序
    * @returns Boolean
    */
    getAllowSortColumn: function () {
        return this.allowSortColumn;
    },
   /**
    * 设置是否允许移动列
    * @param Boolean value 是否允许
    */
    setAllowMoveColumn: function (value) {
        this.allowMoveColumn = value;
    },
   /**
    * 获取是否允许移动列
    * @returns Boolean
    */
    getAllowMoveColumn: function () {
        return this.allowMoveColumn;
    },
   /**
    * 设置是否允许拖拽调节列宽度
    * @param Boolean value 是否允许
    */
    setAllowResizeColumn: function (value) {
        this.allowResizeColumn = value;
    },
   /**
    * 获取是否允许拖拽调节列宽度
    * @returns Boolean
    */
    getAllowResizeColumn: function () {
        return this.allowResizeColumn;
    },
   /**
    * 设置是否加载完是否自动选中
    * @param Boolean value 是否加载完是否自动选中
    */
    setSelectOnLoad: function (value) {
        this.selectOnLoad = value;
    },
   /**
    * 获取是否加载完是否自动选中
    * @returns Boolean
    */
    getSelectOnLoad: function () {
        return this.selectOnLoad;
    },
   /**
    * 设置是否允许拖拽调节表格尺寸
    * @param Boolean value 是否允许
    */
    setAllowResize: function (value) {
        this.allowResize = value;

        this._resizeEl.style.display = this.allowResize ? "" : "none";
    },
   /**
    * 获取是否允许拖拽调节表格尺寸
    * @returns Boolean
    */
    getAllowResize: function () {
        return this.allowResize;
    },
   /**
    * 设置是否允许数据为空时显示提示文本
    * @param Boolean value 是否允许
    */
    setShowEmptyText: function (value) {
        this.showEmptyText = value;
    },
   /**
    * 获取是否允许数据为空时显示提示文本
    * @returns Boolean
    */
    getShowEmptyText: function () {
        return this.showEmptyText;
    },
   /**
    * 设置数据为空时的提示文本
    * @param String value 提示文本
    */
    setEmptyText: function (value) {
        this.emptyText = value;
    },
   /**
    * 获取数据为空时的提示文本
    * @returns String
    */
    getEmptyText: function () {
        return this.emptyText;
    },
   /**
    * 设置是否显示修改标识
    * @param Boolean value 是否允许
    */
    setShowModified: function (value) {
        this.showModified = value;
    },
   /**
    * 获取是否显示修改标识
    * @returns Boolean
    */
    getShowModified: function () {
        return this.showModified;
    },
   /**
    * 设置是否显示新增标识
    * @param Boolean value 是否允许
    */
    setShowNewRow: function (value) {
        this.showNewRow = value;
    },
   /**
    * 获取是否显示新增标识
    * @returns Boolean
    */
    getShowNewRow: function () {
        return this.showNewRow;
    },
   /**
    * 设置触发单元格编辑的事件，取值范围：cellclick、celldblclick
    * @param String value 事件名称
    */
    setCellEditAction: function (value) {
        this.cellEditAction = value;
    },
   /**
    * 获取触发单元格编辑的事件
    * @returns String
    */
    getCellEditAction: function () {
        return this.cellEditAction;
    },
   /**
    * 设置编辑单元格时是否自动验证
    * @param Boolean value 是否自动验证
    */
    setAllowCellValid: function (value) {
        this.allowCellValid = value;
    },
   /**
    * 获取编辑单元格时是否自动验证
    * @returns Boolean
    */
    getAllowCellValid: function () {
        return this.allowCellValid;
    },
   /**
    * 是否允许重新布局，行详情的显示/隐藏时使用
    * @private
    * @default true
    * @type Boolean
    */
    __allowLayout: true,
   /**
    * 显示所有行详情
    */
    showAllRowDetail: function () {
        this.__allowLayout = false;
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            this.showRowDetail(row);
        }
        this.__allowLayout = true;
        this.doLayout();
    },
   /**
    * 隐藏所有行详情
    */
    hideAllRowDetail: function () {
        this.__allowLayout = false;
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (this.isShowRowDetail(row)) {
                this.hideRowDetail(row);
            }
        }
        this.__allowLayout = true;
        this.doLayout();
    },
   /**
    * 显示行详情
    * @param Object/Number row 行对象或行rowIndex 
    */
    showRowDetail: function (row) {

        row = this.getRow(row);
        if (!row)
            return;
        var tr = this.getRowDetailEl(row);
        tr.style.display = "";

        row._showDetail = true;

        var rowEl = this._getRowEl(row);
        mini.addClass(rowEl, "mini-grid-expandRow");

        this.fire("showrowdetail", {
            record: row
        });

        if (this.__allowLayout) {
            this.doLayout();
        }
        var me = this;

    },
   /**
    * 隐藏行详情
    * @param Object/Number row 行对象或行rowIndex 
    */
    hideRowDetail: function (row) {
        var id = this._createRowDetailId(row);
        var tr = document.getElementById(id);
        if (tr) {
            tr.style.display = "none";
        }
        delete row._showDetail;
        var rowEl = this._getRowEl(row);
        mini.removeClass(rowEl, "mini-grid-expandRow");

        this.fire("hiderowdetail", {
            record: row
        });
        if (this.__allowLayout) {
            this.doLayout();
        }
    },
   /**
    * 切换行详情的显示/隐藏
    * @param Object/Number row 行对象或行rowIndex 
    */
    toggleRowDetail: function (row) {
        row = this.getRow(row);
        if (!row)
            return;
        if (grid.isShowRowDetail(row)) {
            grid.hideRowDetail(row);
        } else {
            grid.showRowDetail(row);
        }
    },
   /**
    * 是否显示行详情
    * @param Object/Number row 行对象或行rowIndex 
    * @returns Boolean
    */
    isShowRowDetail: function (row) {
        row = this.getRow(row);
        if (!row)
            return false;
        return !!row._showDetail;
    },
   /**
    * 获取行详情DOM对象
    * @param Object/Number row 行对象或行rowIndex 
    * @returns DOM对象
    */
    getRowDetailEl: function (row) {

        row = this.getRow(row);
        if (!row)
            return null;
        var id = this._createRowDetailId(row);
        var el = document.getElementById(id);
        if (!el) {
            el = this._createRowDetail(row);
        }
        return el;
    },
   /**
    * 获取行详情第0个单元格DOM元素
    * @param Object/Number row 行对象或行rowIndex 
    * @returns DOM对象
    */
    getRowDetailCellEl: function (row) {
        var el = this.getRowDetailEl(row);
        if (el)
            return el.cells[0];
    },
   /**
    * 创建行详情tr
    * @private
    * @param Object/Number row 行对象或行rowIndex 
    * @returns DOM对象
    */
    _createRowDetail: function (row) {
        var tr = this._getRowEl(row);
        var id = this._createRowDetailId(row);
        var colSpan = this.getBottomColumns().length;
        jQuery(tr).after('<tr id="' + id + '" class="mini-grid-detailRow"><td class="mini-grid-detailCell" colspan="' + colSpan + '"></td></tr>');
        this._doUpdateDetailColSpan();
        return document.getElementById(id);
    },
   /**
    * 获取显示列数
    * @private
    * @returns Number
    */
    _getColSpan: function () {
        var tr = this._bodyInnerEl.firstChild.getElementsByTagName("tr")[0];
        var tds = tr.getElementsByTagName("td");
        var colSpan = 0;
        for (var i = 0, l = tds.length; i < l; i++) {
            var td = tds[i];
            if (td.style.display != "none") {
                colSpan++;
            }
        }
        return colSpan;
    },
   /**
    * 合并行详情的列
    * @private
    */
    _doUpdateDetailColSpan: function () {

        var trs = jQuery(".mini-grid-detailRow", this.el);

        var colSpan = this._getColSpan();
        for (var i = 0, l = trs.length; i < l; i++) {
            var tr = trs[i];
            var td = tr.firstChild;
            td.colSpan = colSpan;
        }
    },
   /**
    * 调整行详情的布局
    * @private
    */
    _doLayoutDetailRows: function () {
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row._showDetail == true) {
                var id = this._createRowDetailId(row);
                var el = document.getElementById(id);
                if (el) {
                    mini.layout(el);
                }
            }
        }

    },
   /**
    * 调整编辑行的布局
    * @private
    */
    _doLayoutEditingRows: function () {

        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row._editing == true) {
                var el = this._getRowEl(row);
                if (el) {
                    mini.layout(el);
                }
            }
        }
    },
   /**
    * 翻页处理
    * @private
    * @param DataGrid e
    */
    __OnPageChanged: function (e) {

        e.cancel = true;
        this.gotoPage(e.pageIndex, e.pageSize);
    },
    /**
     * 设置是否显示翻页信息
     * @param {Boolean} 是否显示翻页信息
     */
    setShowPageInfo: function (value) {
        this.pager.setShowPageInfo(value);
    },
    /**
     * 获取是否显示翻页信息
     * @return {Boolean}
     */
    getShowPageInfo: function () {
        return this.pager.getShowPageInfo();
    },
   /**
    * 设置每页显示记录数选择集合，如[5,10,100]
    * @param Array value
    */
    setSizeList: function (value) {
        if (!mini.isArray(value))
            return;
        this.pager.setSizeList(value);
    },
   /**
    * 获取每页显示记录数选择集合
    * @return Array
    */
    getSizeList: function () {
        return this.pager.getSizeList();
    },
   /**
    * 设置每页显示记录数
    * @param Number value
    */
    setPageSize: function (value) {
        value = parseInt(value);
        if (isNaN(value))
            return;
        this.pageSize = value;
        if (this.pager)
            this.pager.update(this.pageIndex, this.pageSize, this.totalCount);
    },
   /**
    * 获取每页显示记录数
    * @return Number
    */
    getPageSize: function () {
        return this.pageSize;
    },
   /**
    * 设置当前页码
    * @param Number value
    */
    setPageIndex: function (value) {
        value = parseInt(value);
        if (isNaN(value))
            return;
        this.pageIndex = value;
        if (this.pager)
            this.pager.update(this.pageIndex, this.pageSize, this.totalCount);
    },
   /**
    * 获取当前页码
    * @return Number
    */
    getPageIndex: function () {
        return this.pageIndex;
    },
   /**
    * 设置是否显示每页显示记录数
    * @param Boolean value
    */
    setShowPageSize: function (value) {
        this.showPageSize = value;
        this.pager.setShowPageSize(value);
    },
   /**
    * 获取是否显示每页显示记录数
    * @returns Boolean
    */
    getShowPageSize: function () {
        return this.showPageSize;
    },
   /**
    * 设置是否显示当前页码
    * @param Boolean value
    */
    setShowPageIndex: function (value) {
        this.showPageIndex = value;
        this.pager.setShowPageIndex(value);
    },
   /**
    * 获取是否显示当前页码
    * @returns Boolean
    */
    getShowPageIndex: function () {
        return this.showPageIndex;
    },
   /**
    * 设置是否显示总记录数
    * @param Boolean value
    */
    setShowTotalCount: function (value) {
        this.showTotalCount = value;
        this.pager.setShowTotalCount(value);
    },
   /**
    * 获取是否显示总记录数
    * @returns Boolean
    */
    getShowTotalCount: function () {
        return this.showTotalCount;
    },
    /**
     * 设置当前页标识字段
     * @param {String} 当前页标识字段
     */
    setPageIndexField: function (value) {
        this.pageIndexField = value;
    },
    /**
     * 获取当前页标识字段
     * @return {String}
     */
    getPageIndexField: function () {
        return this.pageIndexField;
    },
    /**
     * 设置每页显示记录数标识字段
     * @param {String} 每页显示记录数标识字段
     */
    setPageSizeField: function (value) {
        this.pageSizeField = value;
    },
    /**
     * 获取每页显示记录数标识字段
     * @return {String}
     */
    getPageSizeField: function () {
        return this.pageSizeField;
    },
    /**
     * 设置排序字段标识字段
     * @param {String} 排序字段标识字段
     */
    setSortFieldField: function (value) {
        this.sortFieldField = value;
    },
    /**
     * 设置排序字段标识字段
     * @return {String}
     */
    getSortFieldField: function () {
        return this.sortFieldField;
    },
    /**
     * 设置排序方式标识字段
     * @param {String} 排序方式标识字段
     */
    setSortOrderField: function (value) {
        this.sortOrderField = value;
    },
    /**
     * 获取排序方式标识字段
     * @return {String}
     */
    getSortOrderField: function () {
        return this.sortOrderField;
    },
    /**
     * 设置总记录数标识字段
     * @param {String} 总记录数标识字段
     */
    setTotalField: function (value) {
        this.totalField = value;
    },
    /**
     * 获取总记录数标识字段
     * @return {String}
     */
    getTotalField: function () {
        return this.totalField;
    },
    /**
     * 获取排序字段
     * @return {String}
     */
    getSortField: function () {
        return this.sortField;
    },
    /**
     * 获取排序方式
     * @return {String}
     */
    getSortOrder: function () {
        return this.sortOrder;
    },
   /**
    * 当前页码
    * @default 0
    * @type Number
    */
    pageIndex: 0,
   /**
    * 每页显示记录数
    * @default 10
    * @type Number
    */
    pageSize: 10,
   /**
    * 总记录数
    * @default 0
    * @type Number
    */
    totalCount: 0,
   /**
    * 总页数
    * @default 0
    * @type Number
    */
    totalPage: 0,
    /**
     * 是否显示翻页信息
     * @default true
     * @type Boolean
     */
    showPageInfo: true,
    /**
     * 当前页标识字段
     * @default pageIndex
     * @type String
     */
    pageIndexField: "pageIndex",
    /**
     * 每页显示记录数标识字段
     * @default pageSize
     * @type String
     */
    pageSizeField: "pageSize",
    /**
     * 排序字段标识字段
     * @default sortField
     * @type String
     */
    sortFieldField: "sortField",
    /**
     * 排序方式标识字段
     * @default sortOrder
     * @type String
     */
    sortOrderField: "sortOrder",
    /**
     * 总记录数标识字段
     * @default total
     * @type String
     */
    totalField: "total",
   /**
    * 是否显示每页显示记录数
    * @default true
    * @type Boolean
    */
    showPageSize: true,
   /**
    * 是否显示当前页码
    * @default true
    * @type Boolean
    */
    showPageIndex: true,
   /**
    * 是否显示总记录数
    * @default true
    * @type Boolean
    */
    showTotalCount: true,
   /**
    * 设置总记录数
    * @param Number value
    */
    setTotalCount: function (value) {
        this.totalCount = value;
        this.pager.setTotalCount(value);
    },
   /**
    * 获取总记录数
    * @return Number
    */
    getTotalCount: function () {
        return this.totalCount;
    },
   /**
    * 获取总页数
    * @return Number
    */
    getTotalPage: function () {
        return this.totalPage;
    },
   /**
    * 排序字段名
    * @type String
    */
    sortField: "",
   /**
    * 排序方向，取值范围：asc,desc
    * @type String
    */
    sortOrder: "",
   /**
    * 数据加载地址
    * @type String
    */
    url: "",
   /**
    * 是否自动加载
    * @default false
    * @type Boolean
    */
    autoLoad: false,
   /**
    * 数据加载请求参数
    * @type Object
    */
    loadParams: null,
   /**
    * 是否异步请求
    * @default true
    * @type Boolean
    */
    ajaxAsync: true,
   /**
    * 请求方式
    * @default post
    * @type String
    */
    ajaxMethod: "post",
    /**
     * 超时时间
     * @default 30000
     * @type Number
     * @author 赵美丹 2013-04-24
     */
    ajaxTimeout : 30000,
   /**
    * 是否显示Loading遮罩效果
    * @default true
    * @type Boolean
    */
    showLoading: true,
   /**
    * 是否请求返回结果为数据对象，为true时返回结果直接作为data值，total值由data的长度获得
    * @default false
    * @type Boolean
    */
    resultAsData: false,
   /**
    * 数据加载完成后是否选中当前选中数据
    * @default true
    * @type Boolean
    */
    checkSelectOnLoad: true,
   /**
    * 设置数据加载完成后是否选中当前选中数据
    * @param Boolean value
    */
    setCheckSelectOnLoad: function (value) {
        this.checkSelectOnLoad = value;
    },
   /**
    * 获取数据加载完成后是否选中当前选中数据
    * @returns Boolean
    */
    getCheckSelectOnLoad: function () {
        return this.checkSelectOnLoad;
    },
   /**
    * 总记录数对应的字段名
    * @private
    * @default total
    * @type String
    */
    _totalField: "total",
   /**
    * 数据集合对应的字段名，目前未使用到
    * @deprecated
    * @default data
    * @type String
    */
    _dataField: "data",
   /**
    * 获取结果集中的数据
    * @param Object result ajax请求结果集
    * @returns Array 数据集合
    */
    _getFromData: function (result) {
        return result.data;
    },
    /**
     * 获取结果数据
     * @return {Object} this._resultObject||{}
     */
    getResultObject: function () {
        return this._resultObject ? this._resultObject : {};
    },
   /**
    * 加载数据
    * @private
    * @param Object params 请求参数，可选
    * @param Function success 加载成功的回调函数，可选
    * @param Function fail 加载失败的回调函数，可选
    */
    _doLoad: function (params, success, fail) {
        try {
            var url = eval(this.url);
            if (url != undefined) {
                this.url = url;
            }
        } catch (e) {
        }
        params = params || {};
        if (mini.isNull(params.pageIndex))
            params.pageIndex = 0;
        if (mini.isNull(params.pageSize))
            params.pageSize = this.pageSize;
        params.sortField = this.sortField;
        params.sortOrder = this.sortOrder;

        if (this.sortMode != "server") {
            params.sortField = this.sortField = "";
            params.sortOrder = this.sortOrder = "";
        }

        this.loadParams = params;
        var o = {};
        o[this.pageIndexField] = params.pageIndex;
        o[this.pageSizeField] = params.pageSize;
        if (params.sortField)
            o[this.sortFieldField] = params.sortField;
        if (params.sortOrder)
            o[this.sortOrderField] = params.sortOrder;
        delete params.pageIndex;
        delete params.pageSize;
        delete params.sortField;
        delete params.sortOrder;
        mini.copyTo(params, o);
        if (this.showLoading) {
            this.loading();
        }

        var url = this.url;
        var ajaxMethod = this.ajaxMethod;
        if (url) {
            if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
                ajaxMethod = "get";
            }
        }

        var e = {
            url: url,
            async: this.ajaxAsync,
            type: ajaxMethod,
            //ajax 超时配置扩展 赵美丹 2013-04-24
            timeout : this.ajaxTimeout,
            params: params,
            cancel: false
        };
        this.fire("beforeload", e);
        if (e.cancel == true)
            return;

        this._selectedValue = this._selected ? this._selected[this.idField] : null;

        var sf = this;
        var url = e.url;
        this._ajaxer = jQuery.ajax({
            url: e.url,
            async: e.async,
            data: e.params,
            type: e.type,
            timeout: e.timeout,
            cache: false,
            dataType: "text",

            success: function (text, code, jqXHR) {

                var result = null;
                try {
                    result = mini.decode(text);
                } catch (ex) {
                    if (mini_debugger == true) {
                        alert(url + "\ndatagrid json is error.");
                    }
                }

                if (result == null)
                    result = {
                        data: [],
                        total: 0
                    };
                sf._resultObject = result;
                result.total = result[sf.totalField];
                sf.unmask();

                if (mini.isNumber(result.error) && result.error != 0) {
                    var e = {
                        errorCode: result.error,
                        xmlHttp: jqXHR,
                        errorMsg: result.message,
                        result: result
                    };
                    if (mini_debugger == true) {
                        alert(url + "\n" + e.errorMsg + "\n" + result.stackTrace);
                    }
                    sf.fire("loaderror", e);
                    if (fail) {
                        fail.call(sf, e);
                    }
                    return;
                }

                if (sf.resultAsData || mini.isArray(result)) {
                    var r = {};
                    r[sf._totalField] = result.length;
                    r.data = result;
                    result = r;
                }

                var total = parseInt(result[sf._totalField]);
                var data = sf._getFromData(result);

                if (mini.isNumber(params.pageIndex))
                    sf.pageIndex = params.pageIndex;
                if (mini.isNumber(params.pageSize))
                    sf.pageSize = params.pageSize;
                if (mini.isNumber(total))
                    sf.totalCount = total;

                var ex = {
                    result: result,
                    data: data,
                    total: total,
                    cancel: false,
                    xmlHttp: jqXHR
                }
                sf.fire("preload", ex);
                if (ex.cancel == true)
                    return;

                var allowLayout = sf._allowLayout;
                sf._allowLayout = false;
                sf.loadData(ex.data);

                if (sf._selectedValue && sf.checkSelectOnLoad) {
                    var o = sf.getRowByValue(sf._selectedValue);

                    if (o) {
                        sf.select(o);
                    } else {
                        sf.deselectAll();
                    }
                } else if (sf._selected) {
                    sf.deselectAll();
                }

                if (sf.getSelected() == null && sf.selectOnLoad && sf.data.length > 0) {

                    sf.select(0);
                }

                if (sf.collapseGroupOnLoad) {
                    sf.collapseGroups();
                }

                sf.fire("load", ex);

                if (success)
                    success.call(sf, ex);

                sf._allowLayout = allowLayout;
                sf.doLayout();

            },
            error: function (jqXHR, textStatus, errorThrown) {

                var ex = {
                    xmlHttp: jqXHR,
                    errorMsg: jqXHR.responseText,
                    errorCode: jqXHR.status
                };

                if (mini_debugger == true) {
                    alert(url + "\n" + ex.errorCode + "\n" + ex.errorMsg);
                }
                sf.fire("loaderror", ex);

                sf.unmask();

                if (fail) {
                    fail.call(sf, ex);
                }
            }
        });

    },
   /**
    * 加载数据
    * @param Object params 请求参数，可选
    * @param Function success 加载成功的回调函数，可选
    * @param Function fail 加载失败的回调函数，可选
    */
    load: function (params, success, fail) {
        if (this._loadTimer)
            clearTimeout(this._loadTimer);
        var sf = this;

        var el = mini.byClass('mini-grid-emptyText', this.el);
        if (el)
            el.style.display = "none";

        this.cancelEdit();

        this.loadParams = params || {};

        if (this.ajaxAsync) {
            this._loadTimer = setTimeout( function () {
                sf._doLoad(params, success, fail);
            }, 1);
        } else {
            sf._doLoad(params, success, fail);
        }
    },
   /**
    * 重新加载数据
    * @param Function success 加载成功的回调函数，可选
    * @param Function error 加载失败的回调函数，可选
    */
    reload: function (success, error) {
        this.load(this.loadParams, success, error);
    },
   /**
    * 加载某页数据
    * @param Number index 页码
    * @param Number size 每页记录数
    */
    gotoPage: function (index, size) {
        var params = this.loadParams || {};
        if (mini.isNumber(index))
            params.pageIndex = index;
        if (mini.isNumber(size))
            params.pageSize = size;
        this.load(params);
    },
   /**
    * 排序
    * @param String sortField 排序字段
    * @param String sortOrder 排序方向，默认desc
    */
    sortBy: function (sortField, sortOrder) {
        this.sortField = sortField;
        this.sortOrder = sortOrder == "asc" ? "asc" : "desc";
		//点击列头，当url为空时仍进行服务端排序（修改为url为空时改为客户端排序）赵美丹 2013-04-22
        if (this.sortMode == "server" && this.url) {
            var params = this.loadParams || {};
            params.sortField = sortField;
            params.sortOrder = sortOrder;
            params.pageIndex = this.pageIndex;
            var me = this;
            this.load(params, function () {
                me.fire("sort");
            });
        } else {
            var data = this.getData().clone();
            var sortFn = this._getSortFnByField(sortField);
            if (!sortFn)
                return;

            var arr1 = [];
            for (var i = data.length - 1; i >= 0; i--) {
                var o = data[i];
                var v = o[sortField];
                if (mini.isNull(v) || v === "") {
                    arr1.insert(0, o);
                    data.removeAt(i);
                }
            }
            data = data.clone();
            mini.sort(data, sortFn, this);
            data.insertRange(0, arr1);

            if (this.sortOrder == "desc") {
                data.reverse();
            }

            this.data = data;
            this.doUpdate();
            this.fire("sort");
        }
    },
   /**
    * 取消排序，并重新加载数据
    */
    clearSort: function () {
        this.sortField = "";
        this.sortOrder = "";
        this.reload();
    },
   /**
    * 根据column的dataType获取排序方法
    * @param String field column的field值
    * @return Function
    */
    _getSortFnByField: function (field) {
        if (!field)
            return null;
        var sortType = "string";
        var sortFn = null;
        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            if (column.field == field) {
                if (column.dataType)
                    sortType = column.dataType.toLowerCase();
                break;
            }
        }

        var typeFn = mini.sortTypes[sortType];
        if (!typeFn)
            typeFn = mini.sortTypes["string"];
        function sortBy(a, b) {
            var a1 = a[field], b1 = b[field];

            var v1 = typeFn(a1);
            var v2 = typeFn(b1);
            if (v1 > v2)
                return 1;
            else if (v1 == v2)
                return 0;
            else
                return -1;
        }

        sortFn = sortBy;
        return sortFn;
    },
   /**
    * 是否允许选中单元格
    * @default false
    * @type Boolean
    */
    allowCellSelect: false,
   /**
    * 允许单元格编辑，为true时行编辑将失效。
    * @default false
    * @type Boolean
    */
    allowCellEdit: false,
   /**
    * 单元格选中样式类
    * @private
    * @default mini-grid-cell-selected
    * @type String
    */
    _cellSelectedCls: "mini-grid-cell-selected",
   /**
    * 当前单元格，格式：[行对象对象, 列信息]
    * @private
    * @type Array 
    */
    _currentCell: null,
   /**
    * 当前编辑单元格，格式：[行对象对象, 列信息]
    * @private
    * @type Array
    */
    _editingCell: null,
   /**
    * 当前编辑单元格的editor
    * @private
    * @type Mini组件
    */
    _editingControl: null,
   /**
    * editor的容器DOM元素
    * @private
    * @type DOM元素
    */
    _editWrap: null,
   /**
    * 设置当前单元格的样式
    * @private
    * @param Boolean select 为true时，添加选中样式，为false，取消选中样式
    */
    _doCurrentCell: function (select) {
        if (this._currentCell) {
            var record = this._currentCell[0], column = this._currentCell[1];
            var cellEl = this._getCellEl(record, column);
            if (cellEl) {
                if (select) {
                    mini.addClass(cellEl, this._cellSelectedCls);
                } else {
                    mini.removeClass(cellEl, this._cellSelectedCls);
                }
            }
        }
    },
   /**
    * 设置当前单元格，并滚动至视线范围内
    * @param Array cell 格式：[行对象对象, 列信息]
    */
    setCurrentCell: function (cell) {
        if (this._currentCell != cell) {
            this._doCurrentCell(false);
            this._currentCell = cell;
            this._doCurrentCell(true);
            if (cell) {
                if (this.isFrozen()) {
                    this.scrollIntoView(cell[0]);
                } else {
                    this.scrollIntoView(cell[0], cell[1]);
                }
            }
            this.fire("currentcellchanged");

        }
    },
   /**
    * 获取当前单元格
    * @returns Array cell，格式：[行对象对象, 列信息]
    */
    getCurrentCell: function () {
        var cc = this._currentCell;
        if (cc) {
            if (this.data.indexOf(cc[0]) == -1) {
                this._currentCell = null;
                cc = null;
            }
        }
        return cc;
    },
   /**
    * 设置是否允许选中单元格
    * @param Boolean value
    */
    setAllowCellSelect: function (value) {
        this.allowCellSelect = value;
    },
   /**
    * 获取是否允许选中单元格
    * @return Boolean
    */
    getAllowCellSelect: function (value) {
        return this.allowCellSelect;
    },
   /**
    * 设置是否允许单元格编辑
    * @param Boolean value
    */
    setAllowCellEdit: function (value) {
        this.allowCellEdit = value;
    },
   /**
    * 获取是否允许单元格编辑
    * @return Boolean
    */
    getAllowCellEdit: function (value) {
        return this.allowCellEdit;
    },
   /**
    * 对当前选中单元格启动编辑
    * @param Object row 行对象对象
    * @param Object column 列信息
    */
    beginEditCell: function (row, column) {
        row = this.getRow(row);
        column = this.getColumn(column);
        var cell = [row, column];
        if (row && cell) {
            this.setCurrentCell(cell);
        }

        var cell = this.getCurrentCell();
        if (this._editingCell && cell) {
            if (this._editingCell[0] == cell[0] && this._editingCell[1] == cell[1])
                return;
        }

        if (this._editingCell)
            this.commitEdit();
        if (cell) {
            var row = cell[0], column = cell[1];
            var canEdit = this._OnCellBeginEdit(row, column, this.getCellEditor(column));
            if (canEdit !== false) {
                this._editingCell = cell;
                this._OnCellShowingEdit(row, column);
            }
        }
    },
   /**
    * 取消所有行编辑
    */
    cancelEdit: function () {
        if (this.allowCellEdit) {
            if (this._editingCell) {
                this._OnCellEndEdit();
            }
        } else {
            if (this.isEditing()) {
                this._allowLayout = false;
                var data = this.data.clone();
                for (var i = 0, l = data.length; i < l; i++) {
                    var row = data[i];
                    if (row._editing == true)
                        this.cancelEditRow(i);
                }
                this._allowLayout = true;
                this.doLayout();
            }
        }
    },
   /**
    * 提交所有行编辑
    */
    commitEdit: function () {
        if (this.allowCellEdit) {

            if (this._editingCell) {
                this._OnCellCommitEdit(this._editingCell[0], this._editingCell[1]);
                this._OnCellEndEdit();
            }
        } else {
            if (this.isEditing()) {
                this._allowLayout = false;
                var data = this.data.clone();
                for (var i = 0, l = data.length; i < l; i++) {
                    var row = data[i];
                    if (row._editing == true)
                        this.commitEditRow(i);
                }
                this._allowLayout = true;
                this.doLayout();
            }
        }
    },
   /**
    * 获取指定单元格的editor控件对象
    * @param Object/Number/String column 列信息或列index或列name
    * @param Object/Number row 行对象或行rowIndex
    * @returns Mini组件
    */
    getCellEditor: function (column, row) {
        column = this.getColumn(column);
        if (!column)
            return;
        if (this.allowCellEdit) {
            var editor = mini.getAndCreate(column.editor);
            if (editor && editor != column.editor) {
                column.editor = editor;
            }
            return editor;
        } else {
            row = this.getRow(row);
            column = this.getColumn(column);
            if (!row)
                row = this.getEditingRow();
            if (!row || !column)
                return null;
            var id = this.uid + "$" + row._uid + "$" + column.name + "$editor";
            return mini.get(id);
        }
    },
   /**
    * 单元格启动编辑处理
    * @private
    * @param Object record 行对象
    * @param Object column 列信息
    * @param Mini组件 editor 编辑器
    * @return Boolean 
    */
    _OnCellBeginEdit: function (record, column, editor) {
        var value = mini._getMap(column.field, record);
        var e = {
            sender: this,
            rowIndex: this.data.indexOf(record),
            row: record,
            record: record,
            column: column,
            field: column.field,
            editor: editor,
            value: value,
            cancel: false
        };

        this.fire("cellbeginedit", e);

        var editor = e.editor;
        value = e.value;

        if (e.cancel) {
            return false;
        }
        if (!editor)
            return false;

        if (mini.isNull(value))
            value = "";
        if (editor.setValue)
            editor.setValue(value);
        editor.ownerRowID = record._uid;

        if (column.displayField && editor.setText) {
            var text = record[column.displayField];
            editor.setText(text);
        }

        if (this.allowCellEdit) {
            this._editingControl = e.editor;
        }

        return true;
    },
   /**
    * 单元格提交编辑处理
    * @private
    * @param Object record 行对象
    * @param Object column 列信息
    * @param Object value 单元格值
    * @param Mini组件 editor 编辑器
    * @return Object {
    *        sender: this,
    *        record: record,
    *        row: record,
    *        column: column,
    *        field: column.field,
    *        editor: editor ? editor : this.getCellEditor(column),
    *        value: mini.isNull(value) ? "" : value,
    *        text: "",
    *        cancel: false
    *    }
    */
    _OnCellCommitEdit: function (record, column, value, editor) {
        var e = {
            sender: this,
            record: record,
            row: record,
            column: column,
            field: column.field,
            editor: editor ? editor : this.getCellEditor(column),
            value: mini.isNull(value) ? "" : value,
            text: "",
            cancel: false
        };

        if (e.editor && e.editor.getValue) {
            //解决editor不支持formValue的获取(本质上应该与form是一致的） 赵美丹 2013-03-11
            if(e.editor.getFormValue){
                e.value = e.editor.getFormValue();
            }else{
                e.value = e.editor.getValue();
            }
        }
        if (e.editor && e.editor.getText) {
            e.text = e.editor.getText();
        }

        var oldValue = record[column.field], newValue = e.value;
        if (mini.isEquals(oldValue, newValue))
            return e;

        this.fire("cellcommitedit", e);

        if (e.cancel == false) {
            if (this.allowCellEdit) {

                var o = {};
                o[column.field] = e.value;
                if (column.displayField) {
                    o[column.displayField] = e.text;
                }
                this.updateRow(record, o);
            }
        }
        return e;
    },
   /**
    * 单元格结束编辑处理
    * @private
    */
    _OnCellEndEdit: function () {
        if (!this._editingCell)
            return;
        var record = this._editingCell[0];
        var column = this._editingCell[1];
        var e = {
            sender: this,
            record: record,
            row: record,
            column: column,
            field: column.field,
            editor: this._editingControl,
            value: record[column.field]
        };

        this.fire("cellendedit", e);

        if (this.allowCellEdit) {
            var editor = e.editor;
            if (editor && editor.setIsValid) {

                editor.setIsValid(true);
            }

            if (this._editWrap)
                this._editWrap.style.display = 'none';
            var childNodes = this._editWrap.childNodes;
            for (var i = childNodes.length - 1; i >= 0; i--) {
                var el = childNodes[i];
                this._editWrap.removeChild(el);
            }

            if (editor && editor.hidePopup) {
                editor.hidePopup();
            }
            if (editor && editor.setValue) {
                editor.setValue("");
            }

            this._editingControl = null;
            this._editingCell = null;

            if (this.allowCellValid) {
                this.validateCell(record, column);
            }
        }
    },
   /**
    * 单元格渲染为编辑单元格处理
    * @private
    * @param Object record 行对象
    * @param Object column 列信息
    * @return Boolean
    */
    _OnCellShowingEdit: function (record, column) {
        if (!this._editingControl)
            return false;

        var cellBox = this.getCellBox(record, column);
        var viewWidth = mini.getViewportBox().width;
        if (cellBox.right > viewWidth) {

            cellBox.width = viewWidth - cellBox.left;
            if (cellBox.width < 10)
                cellBox.width = 10;
            cellBox.right = cellBox.left + cellBox.width;
        }
        var e = {
            sender: this,
            record: record,
            row: record,
            column: column,
            field: column.field,
            cellBox: cellBox,
            editor: this._editingControl
        };

        this.fire("cellshowingedit", e);

        var editor = e.editor;
        if (editor && editor.setIsValid) {

            editor.setIsValid(true);
        }

        var editWrap = this._getEditWrap(cellBox);
        this._editWrap.style.zIndex = mini.getMaxZIndex();

        if (editor.render) {
            editor.render(this._editWrap);
            setTimeout( function () {
                editor.focus();
                if (editor.selectText)
                    editor.selectText();
            }, 10);
            if (editor.setVisible)
                editor.setVisible(true);
        } else if (editor.el) {
            this._editWrap.appendChild(editor.el);
            setTimeout( function () {
                try {
                    editor.el.focus();
                } catch (e) {
                }
            }, 10);
        }

        if (editor.setWidth) {
            var width = cellBox.width;
            if (width < 20)
                width = 20;
            editor.setWidth(width);
        }
        if (editor.setHeight && editor.type == "textarea") {

            var height = cellBox.height - 1;
            if (editor.minHeight && height < editor.minHeight)
                height = editor.minHeight;
            editor.setHeight(height);
        }
        mini.on(document, 'mousedown', this.__OnBodyMouseDown, this);

        if (column.autoShowPopup && editor.showPopup) {

            editor.showPopup();
        }
    },
   /**
    * document触发mousedown的处理方法
    * @private
    * @param {} e
    * @return {Boolean}
    */
    __OnBodyMouseDown: function (e) {
        if (this._editingControl) {
            var cell = this._getCellByEvent(e);

            if (this._editingCell && cell) {
                if (this._editingCell[0] == cell.record && this._editingCell[1] == cell.column) {
                    return false;
                }
            }

            var within = false;
            if (this._editingControl.within)
                within = this._editingControl.within(e);
            else
                within = mini.isAncestor(this._editWrap, e.target);

            if (within == false) {
                var me = this;
                if (mini.isAncestor(this._bodyEl, e.target) == false) {
                    setTimeout( function () {

                        me.commitEdit();

                    }, 1);
                } else {

                    var cell1 = me._editingCell;
                    setTimeout( function () {
                        var cell2 = me._editingCell;
                        if (cell1 == cell2) {
                            me.commitEdit();
                        }
                    }, 70);
                }
                mini.un(document, 'mousedown', this.__OnBodyMouseDown, this);
            }
        }
    },
   /**
    * 获取editor的容器DOM元素
    * @private
    * @param Object box 单元格布局信息，格式：{x:x,y:y,width:width,height:height}
    * @return DOM元素
    */
    _getEditWrap: function (box) {
        if (!this._editWrap) {
            this._editWrap = mini.append(document.body, '<div class="mini-grid-editwrap" style="position:absolute;"></div>');

            mini.on(this._editWrap, "keydown", this.___OnEditControlKeyDown, this);
        }
        this._editWrap.style.zIndex = 1000000000;
        this._editWrap.style.display = 'block';
        mini.setXY(this._editWrap, box.x, box.y);
        mini.setWidth(this._editWrap, box.width);
        var viewWidth = mini.getViewportBox().width;
        if (box.x > viewWidth)
            mini.setX(this._editWrap, -1000);
        return this._editWrap;
    },
   /**
    * editor的容器DOM元素触发keydown事件的处理方法
    * @private
    * @param DataGrid e
    */
    ___OnEditControlKeyDown: function (e) {
        var editor = this._editingControl;
        if (e.keyCode == 13 && e.ctrlKey == false && editor && editor.type == "textarea") {
            return;
        }
        if (e.keyCode == 38 || e.keyCode == 40) {
            e.preventDefault();
        }
        if (e.keyCode == 13) {

            var cell = this._editingCell;
            if (cell && cell[1] && cell[1].enterCommit === false)
                return;

            this.commitEdit();
            this.focus();
        } else if (e.keyCode == 27) {
            this.cancelEdit();
            this.focus();
        } else if (e.keyCode == 9) {
            this.cancelEdit();
        }
    },
   /**
    * 根据editor获取其行对象
    * @param DOM元素 editor
    * @return Object row行对象
    */
    getEditorOwnerRow: function (editor) {
        var uid = editor.ownerRowID;
        return this.getRowByUID(uid);
    },
   /**
    * 启动行编辑，allowCellEdit为true时无效
    * @param Object/Number row 行对象或行rowIndex
    */
    beginEditRow: function (row) {
        if (this.allowCellEdit)
            return;

        var sss = new Date();

        row = this.getRow(row);
        if (!row)
            return;
        var rowEl = this._getRowEl(row);
        if (!rowEl)
            return;

        row._editing = true;

        var s = this._createRow(row);
        var rowEl = this._getRowEl(row);
        jQuery(rowEl).before(s);
        rowEl.parentNode.removeChild(rowEl);

        var rowEl = this._getRowEl(row);
        mini.addClass(rowEl, "mini-grid-rowEdit");

        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var value = row[column.field];

            var cellId = this._createCellId(row, columns[i]);
            var cellEl = document.getElementById(cellId);
            if (!cellEl)
                continue;

            if (typeof column.editor == "string") {
                column.editor = eval('(' + column.editor + ')');
            }

            var editorConfig = mini.copyTo({}, column.editor);

            editorConfig.id = this.uid + "$" + row._uid + "$" + column.name + "$editor";
            var editor = mini.create(editorConfig);

            if (this._OnCellBeginEdit(row, column, editor)) {
                if (editor) {
                    mini.addClass(cellEl, "mini-grid-cellEdit");
                    cellEl.innerHTML = "";
                    cellEl.appendChild(editor.el);
                    mini.addClass(editor.el, "mini-grid-editor");
                }
            }
        }

        this.doLayout();

    },
   /**
    * 取消行编辑
    * @param Object/Number row 行对象或行rowIndex
    */
    cancelEditRow: function (row) {
        if (this.allowCellEdit)
            return;

        row = this.getRow(row);
        if (!row || !row._editing)
            return;
        delete row._editing;

        var rowEl = this._getRowEl(row);

        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];

            var cellId = this._createCellId(row, columns[i]);
            var cellEl = document.getElementById(cellId);

            var editorEl = cellEl.firstChild;
            var editor = mini.get(editorEl);
            if (!editor)
                continue;

            editor.destroy();
        }

        var s = this._createRow(row);
        jQuery(rowEl).before(s);
        rowEl.parentNode.removeChild(rowEl);

        this.doLayout();

    },
   /**
    * 提交编辑行
    * @param Object/Number row 行对象或行rowIndex
    */
    commitEditRow: function (row) {
        if (this.allowCellEdit)
            return;

        row = this.getRow(row);
        if (!row || !row._editing)
            return;

        var rowData = this.getEditRowData(row);

        this._canUpdateRowEl = false;
        this.updateRow(row, rowData);
        this._canUpdateRowEl = true;

        this.cancelEditRow(row);
    },
   /**
    * 表格是否处于编辑状态
    * @returns Boolean
    */
    isEditing: function () {
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row._editing == true)
                return true;
        }
        return false;
    },
   /**
    * 指定行是否处于编辑状态
    * @param Object/Number row 行对象或行rowIndex
    * @return Boolean
    */
    isEditingRow: function (row) {
        row = this.getRow(row);
        if (!row)
            return false;
        return !!row._editing;
    },
   /**
    * 指定行是否为新增行
    * @param Object/Number row 行对象或行rowIndex
    * @return Boolean
    */
    isNewRow: function (row) {
        return row._state == "added";
    },
   /**
    * 获取处于编辑状态的所有行
    * @return Array
    */
    getEditingRows: function () {
        var rows = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row._editing == true)
                rows.push(row);
        }
        return rows;
    },
   /**
    * 获取第一个处于编辑状态的行
    * @return Object row行对象
    */
    getEditingRow: function () {
        var rows = this.getEditingRows();
        return rows[0];
    },
   /**
    * 获取所有编辑行对象
    * @param Boolean all 为true时返回编辑数据及行对象，false时返回编辑数据
    * @return Array
    */
    getEditData: function (all) {
        var data = [];
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row._editing == true) {
                var rowData = this.getEditRowData(i, all);
                rowData._index = i;

                data.push(rowData);
            }
        }
        return data;
    },
   /**
    * 获取指定编辑行对象
    * @param Object/Number row 行对象或行rowIndex
    * @param Boolean all 为true时返回编辑数据及行对象，false时返回编辑数据
    * @return Array
    */
    getEditRowData: function (row, all) {
        //该方法的返回值，支持json嵌套 赵美丹 2012-11-17
        row = this.getRow(row);

        if (!row || !row._editing)
            return null;

        var rowData = {};

        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var cellId = this._createCellId(row, columns[i]);
            var cellEl = document.getElementById(cellId);

            var editorEl = cellEl.firstChild;
            var editor = mini.get(editorEl);
            if (!editor)
                continue;

            var e = this._OnCellCommitEdit(row, column, null, editor);
            mini._setMap(column.field, e.value, rowData);
            //rowData[column.field] = e.value;
            if (column.displayField) {
                //rowData[column.displayField] = e.text;
                mini._setMap(column.displayField, e.text, rowData);
            }
        }

        //rowData[this.idField] = row[this.idField];
        mini._setMap(this.idField, row[this.idField], rowData);

        if (all) {
            var o = mini.copyTo({}, row);
            rowData = mini.copyTo(o, rowData);
        }

        return rowData;
    },
   /**
    * 获取增加、删除、修改后的数据集合。row._state为added/modified/removed
    * @param String state 数据状态，取值范围：added、modified、removed
    * @return Array
    */
    getChanges: function (state) {
        var rows = [];
        if (!state || state == "removed") {
            rows.addRange(this._removes);
        }
        for (var i = 0, l = this.data.length; i < l; i++) {
            var row = this.data[i];
            if (row._state && (!state || state == row._state)) {
                rows.push(row);
            }
        }
        return rows;
    },
   /**
    * 数据是否发生变化
    * @return Boolean
    */
    isChanged: function () {
        var data = this.getChanges();
        return data.length > 0;
    },
   /**
    * 修改数据行id标识
    * @private
    * @default _uid
    * @type String
    */
    _originalIdField: "_uid",
   /**
    * 获取数据修改记录
    * @private
    * @param Object record 行对象
    * @return Object
    */
    _getOriginal: function (record) {
        var rid = record[this._originalIdField];
        var or = this._originals[rid];
        if (!or) {
            or = this._originals[rid] = {};
        }
        return or;
    },
   /**
    * 行对象是否修改
    * @param Object reocrd 行对象
    * @param String field column的field
    * @return Boolean
    */
    _HasRowModified: function (reocrd, field) {
        var or = this._originals[reocrd[this._originalIdField]];
        if (!or)
            return false;
        if (mini.isNull(field))
            return false;
        return or.hasOwnProperty(field);
    },
   /**
    * 修改行对象时，保存数据修改记录信息
    * @param Object row 行对象
    * @param Object rowData 最新行对象
    * @return Boolean
    */
    _doUpdateRow: function (row, rowData) {

        var updated = false;
        for (var field in rowData) {
            var newValue = rowData[field];
            //解决feild包括"."时oldValue无法正确获取的问题 赵美丹 2013-3-2
            var oldValue = mini._getMap(field, row);

            if (mini.isEquals(oldValue, newValue))
                continue;
            mini._setMap(field, newValue, row);

            if (row._state != "added") {
                row._state = "modified";
                var or = this._getOriginal(row);
                if (!or.hasOwnProperty(field)) {
                    or[field] = oldValue;
                }
            }

            updated = true;
        }
        return updated;
    },
   /**
    * 是否允许行编辑
    * @private
    * @default true
    * @type Boolean
    */
    _canUpdateRowEl: true,
   /**
    * 更新行
    * @param Object/Number row 行对象或行rowIndex
    * @param String/Object rowData 行对象，当rowData为String类型时表示更新列的field
    * @param String/Number/Boolean value 当rowData为String类型时，更新列对应的value
    */
    _updateRowEl: function (row) {
        var me = this;
        var s = me._createRow(row);
        var rowEl = me._getRowEl(row);
        jQuery(rowEl).before(s);
        rowEl.parentNode.removeChild(rowEl);

    },
    /**
     * 更新行数据
     * @param Object/Number row 行对象或行rowIndex
     * @param String/Object rowData 行对象，当rowData为String类型时表示更新列的field
     * @param String/Number/Boolean value 当rowData为String类型时，更新列对应的value
     */
    updateRow: function (row, rowData, value) {

        row = this.getRow(row);
        if (!row || !rowData)
            return;

        if (typeof rowData == "string") {
            var o = {};
            o[rowData] = value;
            rowData = o;
        }

        var updated = this._doUpdateRow(row, rowData);
        if (updated == false)
            return;

        if (this._canUpdateRowEl) {
            this._updateRowEl(row);
        }

        if (row._state == "modified") {
            this.fire("updaterow", {
                record: row,
                row: row
            });
        }

        if (row == this.getSelected()) {
            this._OnCurrentChanged(row);
        }
        this._doMargeCells();
        this._doUpdateSummaryRow();
        this._deferLayout();
    },
   /**
    * 批量删除行
    * @param Array rows 行对象或行rowIndex数组
    */
    deleteRows: function (rows) {
        if (!mini.isArray(rows))
            return;
        rows = rows.clone();
        for (var i = 0, l = rows.length; i < l; i++) {
            this.deleteRow(rows[i]);
        }
    },
   /**
    * 删除行
    * @param Object/Number row 行对象或行rowIndex
    */
    deleteRow: function (row) {
        row = this.getRow(row);
        if (!row || row._state == "deleted")
            return;
        if (row._state == "added") {
            this.removeRow(row, true);
        } else {

            if (this.isEditingRow(row))
                this.cancelEditRow(row);

            row._state = "deleted";
            var rowEl = this._getRowEl(row);
            mini.addClass(rowEl, "mini-grid-deleteRow");

            this.fire("deleterow", {
                record: row,
                row: row
            });
        }
        this._doUpdateSummaryRow();
    },
   /**
    * 批量删除行
    * @param Array rows 行对象或行rowIndex数组
    * @param Boolean autoSelect 是否自动选择下一条记录
    */
    removeRows: function (rows, autoSelect) {
        if (!mini.isArray(rows))
            return;
        rows = rows.clone();
        for (var i = 0, l = rows.length; i < l; i++) {
            this.removeRow(rows[i], autoSelect);
        }
    },
   /**
    * 删除选中行（单选），并自动选择下一条记录
    */
    removeSelected: function () {
        var row = this.getSelected();
        if (row) {
            this.removeRow(row, true);
        }
    },
   /**
    * 删除行
    * @param Object/Number row 行对象或行rowIndex
    * @param Boolean autoSelect 是否自动选择下一条记录
    */
    removeRow: function (row, autoSelect) {
        row = this.getRow(row);
        if (!row)
            return;

        var isCurrent = row == this.getSelected();

        var isSelected = this.isSelected(row);
        var index = this.data.indexOf(row);

        this.data.remove(row);

        if (row._state != "added") {
            row._state = "removed";
            this._removes.push(row);
            delete this._originals[row[this._originalIdField]];
        }

        delete this._idRows[row._uid];

        var s = this._createRow(row);
        var rowEl = this._getRowEl(row);
        if (rowEl)
            rowEl.parentNode.removeChild(rowEl);

        var id = this._createRowDetailId(row);
        var tr = document.getElementById(id);
        if (tr) {
            tr.parentNode.removeChild(tr);
        }

        if (isSelected && autoSelect) {
            var newSelected = this.getAt(index);
            if (!newSelected)
                newSelected = this.getAt(index - 1);
            this.deselectAll();
            this.select(newSelected);
        }

        this._checkSelecteds();

        this._removeRowError(row);
        this.fire("removerow", {
            record: row,
            row: row
        });

        if (isCurrent) {
            this._OnCurrentChanged(row);
        }
        this._doAlternating();
        this._deferLayout();
        this._doMargeCells();
        this._doUpdateSummaryRow();
    },
   /**
    * 是否自动创建行对象中idField对应的字段值，新增行时有效
    * @default false
    * @type Boolean
    */
    autoCreateNewID: false,
   /**
    * 批量新增行
    * @param Array rows 行对象或行rowIndex数组
    * @param Number index 插入位置，默认为表格最后
    */
    addRows: function (rows, index) {
        if (!mini.isArray(rows))
            return;
        rows = rows.clone();
        for (var i = 0, l = rows.length; i < l; i++) {
            this.addRow(rows[i], index);
        }
    },
   /**
    * 新增行
    * @param Object/Number row 行对象或行rowIndex
    * @param Number index 插入位置，默认为表格最后
    */
    addRow: function (row, index) {
        if (mini.isNull(index))
            index = this.data.length;
        index = this.indexOf(index);
        var indexRow = this.getRow(index);
        this.data.insert(index, row);

        if (!row[this.idField]) {
            if (this.autoCreateNewID) {
                row[this.idField] = UUID();
            }
            var e = {
                row: row,
                record: row
            };
            this.fire("beforeaddrow", e);
        }

        row._state = "added";

        delete this._idRows[row._uid];
        row._uid = mini.DataGrid.RowID++;
        this._idRows[row._uid] = row;

        var s = this._createRow(row);
        if (indexRow) {
            var rowEl = this._getRowEl(indexRow);
            jQuery(rowEl).before(s);
        } else {
            mini.append(this._bodyInnerEl.firstChild, s);
        }

        this._doAlternating();

        this._deferLayout();

        this.fire("addrow", {
            record: row,
            row: row
        });
        var el = jQuery(".mini-grid-emptyText", this._bodyEl);
        if (el)
            mini.removeNode(el);

        this._doMargeCells();

        this._doUpdateSummaryRow();

    },
   /**
    * 移动行
    * @param Object/Number row 行对象或行rowIndex
    * @param Number index 插入位置
    */
    moveRow: function (row, index) {

        row = this.getRow(row);
        if (!row)
            return;
        if (index < 0)
            return;

        if (index > this.data.length)
            return;

        var targetRow = this.getRow(index);

        if (row == targetRow)
            return;
        this.data.remove(row);

        var rowEl = this._getRowEl(row);
        if (targetRow) {
            index = this.data.indexOf(targetRow);
            this.data.insert(index, row);
            var rowEl2 = this._getRowEl(targetRow);
            jQuery(rowEl2).before(rowEl);
        } else {

            this.data.insert(this.data.length, row);

            var table = this._bodyInnerEl.firstChild;
            mini.append(table.firstChild || table, rowEl);
        }
        this._doAlternating();
        this._deferLayout();

        this.scrollIntoView(row);

        this.fire("moverow", {
            record: row,
            row: row,
            index: index
        });
        this._doMargeCells();
    },
   /**
    * 清除所有行
    */
    clearRows: function () {
        this.data = [];
        this.doUpdate();
    },
   /**
    * 获取行索引号
    * @param Object/Number row 行对象或行rowIndex
    * @return Number
    */
    indexOf: function (row) {
        if (typeof row == "number")
            return row;
        if (this.isGrouping()) {

            var g = this._getGroupDataView();
            return g.data.indexOf(row);
        } else {
            return this.data.indexOf(row);
        }
    },
   /**
    * 根据rowIndex获取行对象
    * @param Number index 行rowIndex
    * @return Object
    */
    getAt: function (index) {
        return this.data[index];
    },
   /**
    * 获取行对象
    * @param Object/Number index 行对象或行rowIndex
    * @return Object
    */
    getRow: function (index) {
        var t = typeof index;
        if (t == "number")
            return this.data[index];
        else if (t == "object")
            return index;
    },
   /**
    * 根据行对象唯一标识（idField）值获取行对象
    * @param String value 行对象唯一标识（idField）值
    * @return Object
    */
    getRowByValue: function (value) {
        for (var i = 0, l = this.data.length; i < l; i++) {
            var o = this.data[i];
            if (o[this.idField] == value)
                return o;
        }
    },
   /**
    * 根据行id字段（_uid）值获取行对象
    * @param String uid 行id字段（_uid）值
    * @return Object
    */
    getRowByUID: function (uid) {
        return this._idRows[uid];
    },
   /**
    * 通过查询函数获取行对象数组
    * @param Function fn 过滤方法，return true时该行对象数据返回，否则不返回该行对象
    * @return Array
    */
    findRows: function (fn) {
        var rows = [];
        if (fn) {
            for (var i = 0, l = this.data.length; i < l; i++) {

                var row = this.data[i];
                var ret = fn(row);
                //解决findRows的参数function调用两遍的问题 赵美丹 2012-12-05
                if (ret === true)
                    rows.push(row);
                if (ret === 1)
                    break;
            }
        }
        return rows;
    },
   /**
    * 通过查询函数获取行对象
    * @param Function fn 过滤方法，return true时该行对象数据返回
    * @return Object
    */
    findRow: function (fn) {
        if (fn) {
            for (var i = 0, l = this.data.length; i < l; i++) {
                var row = this.data[i];
                if (fn(row) === true)
                    return row;
            }
        }
    },
    /**
     * 加载完是否折叠分组
     * @default false
     * @type Boolean
     */
    collapseGroupOnLoad: false,
    /**
     * 设置加载完是否折叠分组
     * @param {Boolean} 加载完是否折叠分组
     */
    setCollapseGroupOnLoad: function (value) {
        this.collapseGroupOnLoad = value;

    },
    /**
     * 获取加载完是否折叠分组
     * @return {Boolean}
     */
    getCollapseGroupOnLoad: function () {
        return this.collapseGroupOnLoad;
    },
    /**
     * 是否显示分组汇总信息
     * @default false
     * @type Boolean
     */
    showGroupSummary: false,
    /**
     * 设置是否显示分组汇总信息
     * @param {Boolean} value
     */
    setShowGroupSummary: function (value) {
        this.showGroupSummary = value;

    },
    /**
     * 获取是否显示分组汇总信息
     * @return {Boolean}
     */
    getShowGroupSummary: function () {
        return this.showGroupSummary;
    },
    /**
     * 折叠所有分组
     */
    collapseGroups: function () {
        if (!this._groupDataView)
            return;
        for (var i = 0, l = this._groupDataView.length; i < l; i++) {
            var g = this._groupDataView[i];
            this._CollapseGroup(g);
        }
    },
    /**
     * 展开所有分组
     */
    expandGroups: function () {
        if (!this._groupDataView)
            return;
        for (var i = 0, l = this._groupDataView.length; i < l; i++) {
            var g = this._groupDataView[i];
            this._ExpandGroup(g);
        }
    },
    _CollapseGroup: function (group) {
        var rows = group.rows;
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            var rowEl = this._getRowEl(row);
            if (rowEl)
                rowEl.style.display = "none";
        }
        group.expanded = false;
        var id = this.uid + "$group$" + group.id;
        var rowGroupEl = document.getElementById(id);
        if (rowGroupEl)
            mini.addClass(rowGroupEl, "mini-grid-group-collapse");

        this.doLayout();
    },
    _ExpandGroup: function (group) {
        var rows = group.rows;
        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];
            var rowEl = this._getRowEl(row);
            if (rowEl)
                rowEl.style.display = "";
        }
        group.expanded = true;
        var id = this.uid + "$group$" + group.id;
        var rowGroupEl = document.getElementById(id);
        if (rowGroupEl)
            mini.removeClass(rowGroupEl, "mini-grid-group-collapse");
        this.doLayout();
    },
    _GroupID: 1,
    _groupField: "",
    _groupDir: "",
    /**
     * 分组
     * @param {String} field 分组字段
     * @param {Stirng} dir 排序方式
     */
    groupBy: function (field, dir, fztj) {
        if (!field)
            return;
        this._groupField = field;
        if (typeof dir == "string")
            dir = dir.toLowerCase();
        this._groupDir = dir;
        this.__fztj = fztj;
        this._groupDataView = null;
        this.doUpdate();
    },
    /**
     * 取消分组
     */
    clearGroup: function () {
        this._groupField = "";
        this._groupDir = "";
        this._groupDataView = null;
        this.doUpdate();
    },
    /**
     * 获取分组字段
     * @return {String}
     */
    getGroupField: function () {
        return this._groupField;
    },
    /**
     * 获取分组排序方式
     * @return {}
     */
    getGroupDir: function () {
        return this._groupDir;
    },
    /**
     * 是否分组
     * @return {Boolean}
     */
    isGrouping: function () {
        return this._groupField != "";
    },
    _getGroupDataView: function () {
        if (this.isGrouping() == false)
            return null;
        this._groupDataView = null;
        if (!this._groupDataView) {
            var field = this._groupField, dir = this._groupDir;

            var data = this.data.clone();

            if (typeof dir == "function") {
                mini.sort(data, dir);
            } else {
                mini.sort(data, function (a, b) {
                    var v1 = a[field];
                    var v2 = b[field];
                    if (v1 > v2)
                        return 1;
                    else
                        return 0;
                }, this);
                if (dir == "desc")
                    data.reverse();

            }

            var groups = [];
            var groupMaps = {};
            for (var i = 0, l = data.length; i < l; i++) {
                var o = data[i];
                var v = o[field];
                var p = mini.isDate(v) ? v.getTime() : v;
                var group = groupMaps[p];
                if (!group) {
                    group = groupMaps[p] = {};
                    group.header = field;
                    group.field = field;
                    group.dir = dir;
                    group.value = v;
                    group.rows = [];
                    groups.push(group);
                    group.id = this._GroupID++;
                }
                group.rows.push(o);
            }

            this._groupDataView = groups;
            var data = [];
            for (var i = 0, l = groups.length; i < l; i++) {
                data.addRange(groups[i].rows);
            }

            this._groupDataView.data = data;
        }
        return this._groupDataView;
    },
    _getGroupByID: function (id) {
        if (!this._groupDataView)
            return null;
        var groups = this._groupDataView;
        for (var i = 0, l = groups.length; i < l; i++) {
            var group = groups[i];
            if (group.id == id)
                return group;
        }
    },
    _OnDrawGroup: function (group) {
        var e = {
            group: group,
            rows: group.rows,
            field: group.field,
            dir: group.dir,
            value: group.value,
            cellHtml: group.header + " : " + group.value
        };
        this.fire("drawgroup", e);
        return e;
    },
    /**
     * 绘制分组标题事件监听绑定
     * @param {function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onDrawGroupHeader: function (fn, scope) {
        this.on("drawgroupheader", fn, scope);
    },
    /**
     * 绘制分组汇总信息事件监听绑定
     * @param {function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onDrawGroupSummary: function (fn, scope) {
        this.on("drawgroupsummary", fn, scope);
    },
    /**
     * 合并相同值单元格
     * @param {Array/String/Number} columns 合并列的name或index
     * @example grid.margeColumns(["company"]);//company是某列的name
     */
    mergeColumns: function (columns) {
        if (columns && mini.isArray(columns) == false)
            columns = [columns];

        var grid = this;
        var bottomColumns = grid.getBottomColumns();
        if (!columns)
            columns = bottomColumns;
        var data = grid.getData().clone();
        data.push({});

        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            column = grid.getColumn(column);
            if (!column)
                continue;
            margeCells(column);
        }

        function margeCells(column) {
            if (!column.field)
                return;
            var cells = [];
            var rowIndex = -1, rowSpan = 1, columnIndex = bottomColumns.indexOf(column);
            var cellValue = null;
            for (var i = 0, l = data.length; i < l; i++) {
                var row = data[i];
                var value = row[column.field];

                if (rowIndex == -1 || value != cellValue) {
                    if (rowSpan > 1) {
                        var cell = {
                            rowIndex: rowIndex,
                            columnIndex: columnIndex,
                            rowSpan: rowSpan,
                            colSpan: 1
                        };
                        cells.push(cell);
                    }
                    rowIndex = i;
                    rowSpan = 1;
                    cellValue = value;
                } else {
                    rowSpan++;
                }

            }
            grid.margeCells(cells);
        }

    },
    /**
     * 合并单元格
     * @param {Array} cells
     * @example 
     * var cells = [
	 *	    { rowIndex: 1, columnIndex: 0, rowSpan: 1, colSpan: 2 },
	 *	    { rowIndex: 3, columnIndex: 0, rowSpan: 4, colSpan: 3 }
	 *	];
	 *	grid.margeCells(marges);
     */
    mergeCells: function (cells) {
        if (!mini.isArray(cells))
            return;
        this._margedCells = cells;
        this._doMargeCells();
    },
    /**
     * 合并单元格，同mergeCells
     * @param {} cells
     */
    margeCells: function (cells) {
        this.mergeCells(cells);
    },
    _doMargeCells: function () {
        function _doMargeCells() {
            var cells = this._margedCells;
            if (!cells)
                return;
            for (var i = 0, l = cells.length; i < l; i++) {
                var cell = cells[i];
                if (!cell.rowSpan)
                    cell.rowSpan = 1;
                if (!cell.colSpan)
                    cell.colSpan = 1;
                var cellEls = this._getCellEls(cell.rowIndex, cell.columnIndex, cell.rowSpan, cell.colSpan);

                for (var j = 0, k = cellEls.length; j < k; j++) {
                    var el = cellEls[j];
                    if (j != 0) {
                        el.style.display = "none";
                    } else {
                        el.rowSpan = cell.rowSpan;
                        el.colSpan = cell.colSpan;
                    }
                }
            }
        }

        _doMargeCells.call(this);
    },
    _getCellEls: function (rowIndex, columnIndex, rowSpan, colSpan) {
        var cells = [];
        if (!mini.isNumber(rowIndex))
            return [];
        if (!mini.isNumber(columnIndex))
            return [];

        var columns = this.getBottomColumns();
        var data = this.data;

        for (var i = rowIndex, l = rowIndex + rowSpan; i < l; i++) {
            for (var j = columnIndex, k = columnIndex + colSpan; j < k; j++) {
                var cell = this._getCellEl(i, j);
                if (cell)
                    cells.push(cell);
            }
        }

        return cells;
    },
    _selected: null,
    _selecteds: [],
    _checkSelecteds: function () {

        var rows = this._selecteds;
        for (var i = rows.length - 1; i >= 0; i--) {
            var row = rows[i];
            if (!!this._idRows[row._uid] == false) {
                rows.removeAt(i);
                delete this._idSelecteds[row._uid];
            }
        }
        if (this._selected) {
            if (!!this._idSelecteds[this._selected._uid] == false) {
                this._selected = null;
            }
        }
    },
    /**
     * 设置是否允许反选
     * @param {Boolean} value 是否允许反选
     */
    setAllowUnselect: function (value) {
        this.allowUnselect = value;
    },
    /**
     * 获取是否允许反选
     * @return {Boolean}
     */
    getAllowUnselect: function (value) {
        return this.allowUnselect;
    },
    /**
     * 设置是否允许选择行
     * @param {Boolean} value
     */
    setAllowRowSelect: function (value) {
        this.allowRowSelect = value;
    },
    /**
     * 获取是否允许选择行
     * @return {Boolean}
     */
    getAllowRowSelect: function (value) {
        return this.allowRowSelect;
    },
    /**
     * 设置是否多选
     * @param {Boolean} value
     */
    setMultiSelect: function (value) {
        if (this.multiSelect != value) {
            this.multiSelect = value;
            this._doUpdateHeader();
        }
    },
    _getSelectAllCheckState: function () {
        var data = this.getData();
        var state = true;

        var selectedCount = 0;
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            if (this.isSelected(o)) {
                selectedCount++;
            } else {

            }
        }

        if (data.length == selectedCount) {
            state = true;
        } else if (selectedCount == 0) {
            state = false;
        } else {
            state = "has"
        }

        return state;
    },
    /**
     * 是否选中当前行
     * @param Object/Number record 行对象或行rowIndex
     * @return {Boolean}
     */
    isSelected: function (record) {
        record = this.getRow(record);
        if (!record)
            return false;
        return !!this._idSelecteds[record._uid];
    },
    /**
     * 获取所有选中的行
     * @return {Array}
     */
    getSelecteds: function () {
        this._checkSelecteds();
        return this._selecteds.clone();
    },
    /**
     * 设置当前选中行
     * @param Object/Number record 行对象或行rowIndex
     */
    setCurrent: function (record) {
        this.setSelected(record);
    },
    /**
     * 获取当前选中行，同getSelected
     * @return {Object}
     */
    getCurrent: function () {
        return this.getSelected();
    },
    /**
     * 获取当前选中行，同getCurrent
     * @return {Object}
     */
    getSelected: function () {
        this._checkSelecteds();
        return this._selected;
    },
    /**
     * 定位滚动条到某行
     * @param Object/Number record 行对象或行rowIndex
     * @param {Array/String/Number} columns 合并列的name或index
     */
    scrollIntoView: function (row, column) {
        try {

            if (column) {
                var cellEl = this._getCellEl(row, column);
                mini.scrollIntoView(cellEl, this._bodyEl, true);
            } else {
                var rowEl = this._getRowEl(row);
                mini.scrollIntoView(rowEl, this._bodyEl, false);
            }
        } catch (e) {
        }
    },
    /**
     * 当record不为空时，选中该行，并定位滚动条至该行，否则取消当前选中行的选中状态
     * @param Object/Number record 行对象或行rowIndex，可选
     */
    setSelected: function (record) {
        if (record) {
            this.select(record);
        } else {
            this.deselect(this._selected);
        }
        if (this._selected) {
            this.scrollIntoView(this._selected);
        }
        this._blurRow();
    },
    /**
     * 选中某行
     * @param Object/Number record 行对象或行rowIndex
     */
    select: function (record) {
        if (this.multiSelect == false) {
            this.deselectAll();
        }
        record = this.getRow(record);
        if (!record)
            return;

        this._selected = record;
        this.selects([record]);
    },
    /**
     * 取消选中某行
     * @param Object/Number record 行对象或行rowIndex
     */
    deselect: function (record) {
        record = this.getRow(record);
        if (!record)
            return;

        this.deselects([record]);
    },
    /**
     * 全选
     */
    selectAll: function () {
        var data = this.data.clone();
        this.selects(data);
    },
    /**
     * 取消全选，同clearSelect
     */
    deselectAll: function () {
        var selecteds = this._selecteds.clone();
        this._selected = null;
        this.deselects(selecteds);
    },
    /**
     * 取消全选，同deselectAll
     */
    clearSelect: function () {
        this.deselectAll();
    },
    /**
     * 选中行
     * @param {Array} records
     */
    selects: function (records) {
        if (!records || records.length == 0)
            return;
        records = records.clone();
        this._doSelects(records, true);
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (!this.isSelected(record)) {
                this._selecteds.push(record);
                this._idSelecteds[record._uid] = record;
            }
        }
        this._OnSelectionChanged();
    },
    /**
     * 取消行选中
     * @param {Array} records
     */
    deselects: function (records) {

        if (!records)
            records = [];
        records = records.clone();
        this._doSelects(records, false);
        for (var i = records.length - 1; i >= 0; i--) {
            var record = records[i];
            if (this.isSelected(record)) {
                this._selecteds.remove(record);
                delete this._idSelecteds[record._uid];
            }
        }
        if (records.indexOf(this._selected) != -1)
            this._selected = null;

        this._OnSelectionChanged();
    },
    _doSelects: function (rows, select) {
        var sss = new Date();
        for (var i = 0, l = rows.length; i < l; i++) {
            var record = rows[i];
            if (select) {
                this.addRowCls(record, this._rowSelectedCls);
            } else {
                this.removeRowCls(record, this._rowSelectedCls);
            }

        }

    },
    _OnSelectionChanged: function () {
        if (this._selectionTimer) {
            clearTimeout(this._selectionTimer);
        }
        var me = this;
        this._selectionTimer = setTimeout( function () {
            var e = {
                selecteds: me.getSelecteds(),
                selected: me.getSelected()
            };
            me.fire("SelectionChanged", e);
            me._OnCurrentChanged(e.selected);
        }, 1);
    },
    _OnCurrentChanged: function (row) {
        if (this._currentTimer) {
            clearTimeout(this._currentTimer);
        }
        var me = this;
        this._currentTimer = setTimeout( function () {
            var e = {
                record: row,
                row: row
            };
            me.fire("CurrentChanged", e);
            me._currentTimer = null;
        }, 1);
    },
    /**
     * 添加行样式
     * @param Object/Number record 行对象或行rowIndex
     * @param {String} cls 样式class
     */
    addRowCls: function (row, cls) {
        var rowEl = this._getRowEl(row);
        if (rowEl)
            mini.addClass(rowEl, cls);
    },
    /**
     * 删除行样式
     * @param Object/Number record 行对象或行rowIndex
     * @param {String} cls 样式class
     */
    removeRowCls: function (row, cls) {
        var rowEl = this._getRowEl(row);
        if (rowEl)
            mini.removeClass(rowEl, cls);
    },
    _focusRow: function (row, view) {

        row = this.getRow(row);
        if (!row || row == this._focusedRow) {

            return;
        }
        var dom = this._getRowEl(row);
        if (view && dom) {
            this.scrollIntoView(row);
        }
        if (this._focusedRow == row)
            return;
        this._blurRow();
        this._focusedRow = row;

        mini.addClass(dom, this._rowHoverCls);
    },
    _blurRow: function () {
        if (!this._focusedRow)
            return;
        var dom = this._getRowEl(this._focusedRow);
        if (dom) {
            mini.removeClass(dom, this._rowHoverCls);
        }
        this._focusedRow = null;
    },
    _getRecordByEvent: function (e) {
        var t = mini.findParent(e.target, this._rowCls);
        if (!t)
            return null;
        var ids = t.id.split("$");
        var uid = ids[ids.length - 1];
        return this.getRowByUID(uid);
    },
    __OnMousewheel: function (e, delta) {
        if (this.allowCellEdit) {
            this.commitEdit();

        }

        var overflowY = jQuery(this._bodyEl).css("overflow-y");
        if (overflowY == "hidden") {

            var wheelDelta = e.wheelDelta || -e.detail * 24;
            var top = this._bodyEl.scrollTop;

            top -= wheelDelta;
            this._bodyEl.scrollTop = top;

            if (top == this._bodyEl.scrollTop) {
                e.preventDefault();
            } else {

            }

            var e = {
                scrollTop: this._bodyEl.scrollTop,
                direction: "vertical"
            };

            this.fire("scroll", e);
        }
    },
    __OnClick: function (e) {

        var rowGroupEl = mini.findParent(e.target, "mini-grid-groupRow");
        if (rowGroupEl) {
            var ids = rowGroupEl.id.split("$");
            var id = ids[ids.length - 1];
            var group = this._getGroupByID(id);
            if (group) {

                var expanded = !(group.expanded === false ? false : true);
                if (expanded)
                    this._ExpandGroup(group);
                else
                    this._CollapseGroup(group);
            }
        } else {
            this._fireEvent(e, 'Click');

        }

    },
    _tryFocus: function (e) {
        var tagName = e.target.tagName.toLowerCase();
        if (tagName == "input" || tagName == "textarea" || tagName == "select")
            return;
        //解决表格第一列可编辑时，选中文字后无法输入的问题（鼠标可能拖至表格外时再释放鼠标：mouseup） 赵美丹 2013-3-7
        if(!mini.findParent(e.target, "mini-grid")){
            return;
        }
        if (mini.isAncestor(this._filterEl, e.target)
        || mini.isAncestor(this._summaryEl, e.target)
        || mini.isAncestor(this._footerEl, e.target)
        || mini.findParent(e.target, "mini-grid-rowEdit")
        || mini.findParent(e.target, "mini-grid-detailRow")
        ) {

        } else {
            var me = this;

            me.focus();

        }
    },
    __OnDblClick: function (e) {
        this._fireEvent(e, 'Dblclick');
    },
    __OnMouseDown: function (e) {
        this._fireEvent(e, 'MouseDown');
        this._tryFocus(e);
    },
    __OnMouseUp: function (e) {
        this._tryFocus(e);
        this._fireEvent(e, 'MouseUp');
    },
    __OnMouseMove: function (e) {
        this._fireEvent(e, 'MouseMove');
    },
    __OnMouseOver: function (e) {
        this._fireEvent(e, 'MouseOver');
    },
    __OnMouseOut: function (e) {
        this._fireEvent(e, 'MouseOut');
    },
    __OnKeyDown: function (e) {
        this._fireEvent(e, 'KeyDown');
    },
    __OnKeyUp: function (e) {
        this._fireEvent(e, 'KeyUp');
    },
    __OnContextMenu: function (e) {
        this._fireEvent(e, 'ContextMenu');
    },
    _fireEvent: function (e, name) {

        if (!this.enabled)
            return;

        var cell = this._getCellByEvent(e);
        var record = cell.record, column = cell.column;
        if (record) {
            var eve = {
                record: record,
                row: record,
                htmlEvent: e
            };

            var fn = this['_OnRow' + name];
            if (fn) {
                fn.call(this, eve);
            } else {
                this.fire("row" + name, eve);
            }
        }
        if (column) {
            var eve = {
                column: column,
                field: column.field,
                htmlEvent: e
            };

            var fn = this['_OnColumn' + name];
            if (fn) {
                fn.call(this, eve);
            } else {
                this.fire("column" + name, eve);
            }
        }

        if (record && column) {
            var eve = {
                sender: this,
                record: record,
                row: record,
                column: column,
                field: column.field,
                htmlEvent: e
            };

            var fn = this['_OnCell' + name];
            if (fn) {
                fn.call(this, eve);
            } else {

                this.fire("cell" + name, eve);
            }

            if (column["onCell" + name]) {
                column["onCell" + name].call(column, eve);
            }

        }
        if (!record && column) {
            var eve = {
                column: column,
                htmlEvent: e
            };
            var fn = this['_OnHeaderCell' + name];
            if (fn) {
                fn.call(this, eve);
            } else {

                var evName = "onheadercell" + name.toLowerCase();
                if (column[evName]) {
                    eve.sender = this;
                    column[evName](eve);
                }

                this.fire("headercell" + name, eve);
            }
        }

        if (!record)
            this._blurRow();
    },
    _OnDrawCell: function (record, column, rowIndex, columnIndex) {
        var value = mini._getMap(column.field, record);
        var e = {
            sender: this,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            record: record,
            row: record,
            column: column,
            field: column.field,
            value: value,
            cellHtml: value,
            rowCls: null,
            cellCls: column.cellCls || '',
            rowStyle: null,
            cellStyle: column.cellStyle || '',
            allowCellWrap: this.allowCellWrap
        };

        if (column.dateFormat) {
            if (mini.isDate(e.value)) {

                e.cellHtml = mini.formatDate(value, column.dateFormat);
            } else if(mini.isNull(value) || value === ''){
                e.cellHtml = value;
            } else {//解决字符串日期的格式化 赵美丹 2013-04-02
                var date = new Date(value.split(".")[0].replace(/-/g,"/"));
                e.cellHtml = mini.formatDate(date, column.dateFormat);
            }
                
        }
        if (column.dataType == "currency") {
            e.cellHtml = mini.formatCurrency(e.value, column.currencyUnit);
        }
        //扩展数据类型--百分比 赵美丹 2013-04-07
        if (column.dataType == "percent") {
            e.cellHtml = mini.formatPercent(e.value, column.showPercent);
        }
        if (column.displayField) {
            e.cellHtml = record[column.displayField];
        }
        e.cellHtml = mini.htmlEncode(e.cellHtml);

        var renderer = column.renderer;
        if (renderer) {
            fn = typeof renderer == "function" ? renderer : window[renderer];
            if (fn) {
                e.cellHtml = fn.call(column, e);
            }
        }

        this.fire("drawcell", e);

        if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "")
            e.cellHtml = "&nbsp;";

        return e;
    },
    _OnDrawSummaryCell: function (records, column) {
        var e = {
            result: this.getResultObject(),
            sender: this,
            data: records,
            column: column,
            field: column.field,
            value: "",
            cellHtml: "",
            cellCls: column.cellCls || '',
            cellStyle: column.cellStyle || '',
            allowCellWrap: this.allowCellWrap
        };

        if (column.summaryType) {
            var fn = mini.summaryTypes[column.summaryType];
            if (fn) {
                e.value = fn(records, column.field);
            }
        }

        if (e.value && parseInt(e.value) != e.value && e.value.toFixed) {
            e.value = e.value.toFixed(2);
        }
        var value = e.value;

        e.cellHtml = e.value;

        if (column.dateFormat) {
            if (mini.isDate(e.value)) {

                e.cellHtml = mini.formatDate(value, column.dateFormat);
            } else
                e.cellHtml = value;
        }
        if (column.dataType == "currency") {
            e.cellHtml = mini.formatCurrency(e.value, column.currencyUnit);
        }

        var renderer = column.summaryRenderer;
        if (renderer) {
            fn = typeof renderer == "function" ? renderer : window[renderer];
            if (fn) {
                e.cellHtml = fn.call(column, e);
            }
        }

        this.fire("drawsummarycell", e);

        if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "")
            e.cellHtml = "&nbsp;";

        return e;
    },
    _OnDrawGroupSummaryCell: function (records, column) {
        var e = {
            sender: this,
            data: records,
            column: column,
            field: column.field,
            value: "",
            cellHtml: "",
            cellCls: column.cellCls || '',
            cellStyle: column.cellStyle || '',
            allowCellWrap: this.allowCellWrap
        };

        if (column.groupSummaryType) {
            var fn = mini.groupSummaryType[column.summaryType];
            if (fn) {
                e.value = fn(records, column.field);
            }
        }
        e.cellHtml = e.value;

        var renderer = column.groupSummaryRenderer;
        if (renderer) {
            fn = typeof renderer == "function" ? renderer : window[renderer];
            if (fn) {
                e.cellHtml = fn.call(column, e);
            }
        }

        this.fire("drawgroupsummarycell", e);

        if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "")
            e.cellHtml = "&nbsp;";

        return e;
    },
    _OnCellMouseDown: function (e) {
        var record = e.record;
        this.fire("cellmousedown", e);
    },
    _OnRowMouseOut: function (e) {
        if (!this.enabled)
            return;
        if (mini.isAncestor(this.el, e.target))
            return;

    },
    _OnRowMouseMove: function (e) {
        record = e.record;
        if (!this.enabled || record.enabled === false || this.enableHotTrack == false)
            return;

        this.fire("rowmousemove", e);

        var me = this;

        me._focusRow(record);

    },
    _OnHeaderCellClick: function (e) {
        e.sender = this;
        var column = e.column;

        if (!mini.hasClass(e.htmlEvent.target, "mini-grid-splitter")) {
            if (this.allowSortColumn && this.isEditing() == false) {
                if (!column.columns || column.columns.length == 0) {
                    if (column.field && column.allowSort !== false) {
                        var sortOrder = "asc";
                        if (this.sortField == column.field) {
                            sortOrder = this.sortOrder == "asc" ? "desc" : "asc";
                        }
                        this.sortBy(column.field, sortOrder);
                    }
                }
            }
            this.fire("headercellclick", e);
        }
    },
    __OnHtmlContextMenu: function (e) {
        var ev = {
            popupEl: this.el,
            htmlEvent: e,
            cancel: false
        };

        if (mini.isAncestor(this._headerEl, e.target)) {
            if (this.headerContextMenu) {
                this.headerContextMenu.fire("BeforeOpen", ev);
                if (ev.cancel == true)
                    return;
                this.headerContextMenu.fire("opening", ev);
                if (ev.cancel == true)
                    return;
                this.headerContextMenu.showAtPos(e.pageX, e.pageY);
                this.headerContextMenu.fire("Open", ev);
            }
        } else {
            if (this.contextMenu) {
                this.contextMenu.fire("BeforeOpen", ev);
                if (ev.cancel == true)
                    return;
                this.contextMenu.fire("opening", ev);
                if (ev.cancel == true)
                    return;
                this.contextMenu.showAtPos(e.pageX, e.pageY);
                this.contextMenu.fire("Open", ev);
            }
        }
        return false;

    },
    /**
     * 列头右键菜单
     * @type ContextMenu
     */
    headerContextMenu: null,
    /**
     * 设置列头右键菜单
     * @param {String/Array} value 右键菜单ID或Items
     */
    setHeaderContextMenu: function (value) {
        var ui = this._getContextMenu(value);
        if (!ui)
            return;
        if (this.headerContextMenu !== ui) {
            this.headerContextMenu = ui;
            this.headerContextMenu.owner = this;
            mini.on(this.el, "contextmenu", this.__OnHtmlContextMenu, this);
        }
    },
    /**
     * 获取列头右键菜单
     * @return ContextMenu
     */
    getHeaderContextMenu: function () {
        return this.headerContextMenu;
    },
    /**
     * 列菜单
     * @type Menu
     */
    columnsMenu: null,
    /**
     * 创建列菜单
     * @return {Menu}
     */
    createColumnsMenu: function () {
        if (!this.columnsMenu) {
            this.columnsMenu = mini.create({
                type: "menu",
                items: [{
                    type: "menuitem",
                    text: "Sort Asc"
                },{
                    type: "menuitem",
                    text: "Sort Desc"
                },
                '-',{
                    type: "menuitem",
                    text: "Columns",
                    name: "columns",
                    items: [

                    ]
                }
                ]
            });
        }
        var items = [];

        return this.columnsMenu;
    },
    _doShowColumnsMenu: function (column) {
        var menu = this.createColumnsMenu();
        var el = this._getColumnEl(column);
        var box = mini.getBox(el);
        menu.showAtPos(box.right - 17, box.bottom);
    },
    /**
     * 行双击事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onRowDblClick: function (fn, scope) {
        this.on("rowdblclick", fn, scope);
    },
    /**
     * 行单击事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onRowClick: function (fn, scope) {
        this.on("rowclick", fn, scope);
    },
    /**
     * 行鼠标点击事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onRowMouseDown: function (fn, scope) {
        this.on("rowmousedown", fn, scope);
    },
    /**
     * 行右键事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onRowContextMenu: function (fn, scope) {
        this.on("rowcontextmenu", fn, scope);
    },
    /**
     * 单元格单击事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onCellClick: function (fn, scope) {
        this.on("cellclick", fn, scope);
    },
    /**
     * 单元格鼠标点击事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onCellMouseDown: function (fn, scope) {
        this.on("cellmousedown", fn, scope);
    },
    /**
     * 单元格右键事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onCellContextMenu: function (fn, scope) {
        this.on("cellcontextmenu", fn, scope);
    },
    /**
     * 请求url前事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onBeforeLoad: function (fn, scope) {
        this.on("beforeload", fn, scope);
    },
    /**
     * 加载数据后事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onLoad: function (fn, scope) {
        this.on("load", fn, scope);
    },
    /**
     * 加载数据错误事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onLoadError: function (fn, scope) {
        this.on("loaderror", fn, scope);
    },
    /**
     * 加载数据前事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onPreLoad: function (fn, scope) {
        this.on("preload", fn, scope);
    },
    /**
     * 绘制单元格事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onDrawCell: function (fn, scope) {
        this.on("drawcell", fn, scope);
    },
    /**
     * 单元格编辑前事件监听绑定
     * @private
     * @param {Function} fn 监听函数
     * @param {Object} scope 作用域
     */
    onCellBeginEdit: function (fn, scope) {
        this.on("cellbeginedit", fn, scope);
    },
    /**
     * 获取属性
     * @private
     * @param {DOMElement} el
     * @return {Array}
     */
    getAttrs: function (el) {

        var attrs = mini.DataGrid.superclass.getAttrs.call(this, el);

        var cs = mini.getChildNodes(el);
        for (var i = 0, l = cs.length; i < l; i++) {
            var node = cs[i];
            var property = jQuery(node).attr("property");
            if (!property)
                continue;
            property = property.toLowerCase();
            if (property == "columns") {

                attrs.columns = mini._ParseColumns(node);
            } else if (property == "data") {
                attrs.data = node.innerHTML;
            }
        }

        mini._ParseString(el, attrs,
        [
        "url", "sizeList", "bodyCls", "bodyStyle", "footerCls", "footerStyle", "pagerCls", "pagerStyle",
        "onheadercellclick", "onheadercellmousedown", "onheadercellcontextmenu",
        "onrowdblclick",
        "onrowclick", "onrowmousedown", "onrowcontextmenu",
        "oncellclick", "oncellmousedown", "oncellcontextmenu",
        "onbeforeload", "onpreload", "onloaderror", "onload",
        "ondrawcell", "oncellbeginedit", "onselectionchanged",
        "onshowrowdetail", "onhiderowdetail", "idField", "valueField",
        "ajaxMethod", "ondrawgroup", "pager", "oncellcommitedit", "oncellendedit",
        "headerContextMenu", "loadingMsg", "emptyText", "cellEditAction",
        "sortMode", "oncellvalidation", "onsort", "pageIndexField", "pageSizeField", "sortFieldField", "sortOrderField", "totalField",
        "ondrawsummarycell", "ondrawgroupsummarycell", "onresize"
        ]
        );
        mini._ParseBool(el, attrs,
        ["showHeader", "showFooter", "showTop", "allowSortColumn", "allowMoveColumn", "allowResizeColumn",
        "showHGridLines", "showVGridLines", "showFilterRow", "showSummaryRow", "showFooter", "showTop",
        "fitColumns", "showLoading", "multiSelect", "allowAlternating", "resultAsData", "allowRowSelect", "allowUnselect",
        "enableHotTrack", "showPageIndex", "showPageSize", "showTotalCount",
        "checkSelectOnLoad", "allowResize", "autoLoad",
        "autoHideRowDetail", "allowCellSelect", "allowCellEdit", "allowCellWrap", "allowHeaderWrap", "selectOnLoad",
        "virtualScroll", "collapseGroupOnLoad", "showGroupSummary",
        "showEmptyText", "allowCellValid", "showModified", "showColumnsMenu", "showPageInfo",
        "showNewRow"
        ]
        );

		//ajax 超时配置扩展 赵美丹 2013-04-24
        mini._ParseInt(el, attrs,
        ["columnWidth", "frozenStartColumn", "frozenEndColumn",
        "pageIndex", "pageSize", "ajaxTimeout"
        ]
        );

        if (typeof attrs.sizeList == "string") {
            attrs.sizeList = eval(attrs.sizeList);
        }
        if (!attrs.idField && attrs.valueField) {
            attrs.idField = attrs.valueField;
        }

        return attrs;
    }
});

mini.regClass(mini.DataGrid, "datagrid");
/**
 * @class 表格组件列插件，主要实现列操作相关功能。
 */
mini_Column_Prototype = {
    _getColumnEl: function (column) {
        column = this.getColumn(column);
        if (!column)
            return null;
        var id = this._createColumnId(column);
        return document.getElementById(id);
    },
    _getCellEl: function (row, column) {
        row = this.getRow ? this.getRow(row) : this.getNode(row);
        column = this.getColumn(column);
        if (!row || !column)
            return null;
        var id = this._createCellId(row, column);
        return document.getElementById(id);
    },
    _getCellByEvent: function (e) {
        var record = this._getRecordByEvent ? this._getRecordByEvent(e) : this._getNodeByEvent(e);
        var column = this._getColumnByEvent(e);
        return {
            record: record,
            column: column
        };
    },
    _getColumnByEvent: function (e) {
        var t = mini.findParent(e.target, this._cellCls);
        if (!t)
            t = mini.findParent(e.target, this._headerCellCls);
        if (t) {
            var ids = t.id.split("$");
            var id = ids[ids.length - 1];
            return this._getColumnById(id);
        }
        return null;
    },
    _createColumnId: function (column) {
        return this.uid + "$column$" + column._id;
    },
    /**
     * 获取列box
     * @param {Object} column 列信息
     * @return {Object}
     */
    getColumnBox: function (column) {
        var id = this._createColumnId(column);
        var el = document.getElementById(id);
        if (el) {

            var box = mini.getBox(el);
            box.x -= 1;
            box.left = box.x;
            box.right = box.x + box.width;
            return box;
        }
    },
    /**
     * 设置列信息
     * @param {Array} value 列信息
     */
    setColumns: function (value) {

        if (!mini.isArray(value))
            value = [];
        this.columns = value;

        this._idColumns = {};
        this._nameColumns = {};
        this._bottomColumns = [];

        this.maxColumnLevel = 0;
        var level = 0;

        function init(column, index, parentColumn) {
            if (column.type) {
                if (!mini.isNull(column.header) && typeof column.header !== "function") {
                    if (column.header.trim() == "") {
                        delete column.header;
                    }
                }
                var col = mini._getColumn(column.type);
                if (col) {
                    var _column = mini.copyTo({}, column);
                    mini.copyTo(column, col);
                    mini.copyTo(column, _column);
                }
            }

            var width = parseInt(column.width);
            if (mini.isNumber(width) && String(width) == column.width)
                column.width = width + "px";
            if (mini.isNull(column.width))
                column.width = this.columnWidth + "px";
            column.visible = column.visible !== false;
            //解决allowResize错写为allowRresize 赵美丹 2012-11-29
            column.allowResize = column.allowResize !== false;
            column.allowMove = column.allowMove !== false;
            column.allowSort = column.allowSort === true;
            column.allowDrag = !!column.allowDrag;
            column.readOnly = !!column.readOnly;

            if (!column._id)
                column._id = mini.DataGrid.ColumnID++;
            column._gridUID = this.uid;
            column._rowIdField = this._rowIdField;
            column._pid = parentColumn == this ? -1 : parentColumn._id;
            this._idColumns[column._id] = column;
            if (column.name)
                this._nameColumns[column.name] = column;

            if (!column.columns || column.columns.length == 0) {
                this._bottomColumns.push(column);
            }

            column.level = level;
            level += 1;
            this.eachColumns(column, init, this);
            level -= 1;
            if (column.level > this.maxColumnLevel)
                this.maxColumnLevel = column.level;

            if (typeof column.editor == "string") {
                var cls = mini.getClass(column.editor);
                if (cls) {
                    column.editor = {
                        type: column.editor
                    };
                } else {
                    column.editor = eval('(' + column.editor + ')');
                }
            }

            if (typeof column.filter == "string") {
                column.filter = eval('(' + column.filter + ')');
            }
            if (column.filter && !column.filter.el) {
                column.filter = mini.create(column.filter);
            }

            if (typeof column.init == "function" && column.inited != true) {
                column.init(this);
            }
            column.inited = true;
        }

        this.eachColumns(this, init, this);

        if (this._doUpdateFilterRow)
            this._doUpdateFilterRow();
        this.doUpdate();
    },
    /**
     * 获取所有列
     * @return {Array}
     */
    getColumns: function () {
        return this.columns;
    },
    /**
     * 获取最低层columns
     * @return {Array}
     */
    getBottomColumns: function () {
        return this._bottomColumns;
    },
    /**
     * 获取最底层columns中可见的columns
     * @return {Array}
     */
    getBottomVisibleColumns: function () {
        var columns = [];
        for (var i = 0, l = this._bottomColumns.length; i < l; i++) {
            var c = this._bottomColumns[i];
            if (this.isVisibleColumn(c))
                columns.push(c);
        }
        return columns;
    },
    /**
     * 遍历指定列的子列
     * @param {Object} column 列对象
     * @param {Function} fn 处理函数
     * @param {Object} scope 作用域
     */
    eachColumns: function (column, fn, scope) {
        var columns = column.columns;
        if (columns) {
            var list = columns.clone();
            for (var i = 0, l = list.length; i < l; i++) {
                var o = list[i];
                if (fn.call(scope, o, i, column) === false)
                    break;
            }
        }
    },
    /**
     * 获取列信息
     * @param {Object/String/Number} index 列的name或index
     * @return {Object}
     */
    getColumn: function (index) {
        var t = typeof index;
        if (t == "number")
            return this.getBottomColumns()[index];
        else if (t == "object")
            return index;
        else {
            return this._nameColumns[index];
        }
    },
    _getColumnById: function (id) {
        return this._idColumns[id];
    },
    /**
     * 获取上级列信息
     * @param {Object/String/Number} index 列的name或index
     * @return {Object}
     */
    getParentColumn: function (column) {
        column = this.getColumn(column);
        var pid = column._pid;
        if (pid == -1)
            return this;
        return this._idColumns[pid];
    },
    /**
     * 获取列层级信息，倒序（父列->子列）
     * @param {Object/String/Number} index 列的name或index
     * @return {Array}
     */
    getAncestorColumns: function (node) {
        var as = [];
        while (1) {
            var parentNode = this.getParentColumn(node);
            if (!parentNode || parentNode == this)
                break;
            as[as.length] = parentNode;
            node = parentNode;
        }
        as.reverse();
        return as;
    },
    /**
     * 是否为上下级列
     * @param {Object} parentNode 上级列信息
     * @param {Object/String/Number} node 下级列的name或index
     * @return {Boolean}
     */
    isAncestorColumn: function (parentNode, node) {
        if (parentNode == node)
            return true;
        if (!parentNode || !node)
            return false;
        var as = this.getAncestorColumns(node);
        for (var i = 0, l = as.length; i < l; i++) {
            if (as[i] == parentNode)
                return true;
        }
        return false;
    },
    /**
     * 列是否可见
     * @param {Object/String/Number} column 列的name或index
     * @return {Boolean}
     */
    isVisibleColumn: function (column) {
        column = this.getColumn(column);
        var columns = this.getAncestorColumns(column);
        for (var i = 0, l = columns.length; i < l; i++) {
            if (columns[i].visible == false)
                return false;
        }
        return true;
    },
    /**
     * 更新列配置属性
     * @param {Object/String/Number} column 列的name或index
     * @param {Object} option 配置属性
     */
    updateColumn: function (column, option) {
        column = this.getColumn(column);
        if (!column)
            return;
        mini.copyTo(column, option);
        this.setColumns(this.columns);
    },
    /**
     * 删除列
     * @param {Object/String/Number} column 列的name或index
     * @return {Object}
     */
    removeColumn: function (column) {
        column = this.getColumn(column);
        var pcolumn = this.getParentColumn(column);
        if (column && pcolumn) {
            pcolumn.columns.remove(column);
            this.setColumns(this.columns);
        }
        return column;
    },
    /**
     * 移动列
     * @param {Object/String/Number} column 列的name或index
     * @param {Object/String/Number} targetColumn 目标列的name或index
     * @param {Boolean} action 为false时不移动
     */
    moveColumn: function (column, targetColumn, action) {
        column = this.getColumn(column);
        targetColumn = this.getColumn(targetColumn);
        if (!column || !targetColumn || !action || column == targetColumn)
            return;

        if (this.isAncestorColumn(column, targetColumn)
        ) {
            return;
        }

        var pcolumn = this.getParentColumn(column);
        if (pcolumn) {
            pcolumn.columns.remove(column);
        }

        var parentColumn = targetColumn;
        var index = action;
        if (index == 'before') {
            parentColumn = this.getParentColumn(targetColumn);
            index = parentColumn.columns.indexOf(targetColumn);
        } else if (index == 'after') {
            parentColumn = this.getParentColumn(targetColumn);
            index = parentColumn.columns.indexOf(targetColumn) + 1;
        } else if (index == 'add' || index == "append") {
            if (!parentColumn.columns)
                parentColumn.columns = [];
            index = parentColumn.columns.length;
        } else if (!mini.isNumber(index)) {
            return;
        }

        parentColumn.columns.insert(index, column);

        this.setColumns(this.columns);
    },
    /**
     * 隐藏列
     * @param {Object/String/Number} column 列的name或index
     */
    hideColumn: function (column) {
        column = this.getColumn(column);
        if (!column)
            return;

        if (this.allowCellEdit) {
            this.commitEdit();
        }

        column.visible = false;
        this._doVisibleColumn(column, false);
        this._doUpdateHeader();
        this.doLayout();
        this._fixIE();
    },
    /**
     * 显示列
     * @param {Object/String/Number} column 列的name或index
     */
    showColumn: function (column) {
        column = this.getColumn(column);
        if (!column)
            return;

        if (this.allowCellEdit) {
            this.commitEdit();
        }

        column.visible = true;
        this._doVisibleColumn(column, true);
        this._doUpdateHeader();
        this.doLayout();
        this._fixIE();
    },
    /**
     * 获取所有列的rowspan
     */
    getColumnRows: function () {
        var maxLevel = this.getMaxColumnLevel();
        var dcs = [];
        for (var i = 0, l = maxLevel; i <= l; i++) {
            dcs.push([]);
        }

        function getColSpan(col) {
            var subColumns = mini.treeToArray(col.columns, "columns");
            var colSpan = 0;
            for (var i = 0, l = subColumns.length; i < l; i++) {
                var c = subColumns[i];
                if (c.visible != true || c._hide == true)
                    continue;
                if (!c.columns || c.columns.length == 0) {
                    colSpan += 1;
                }
            }
            return colSpan;
        }

        var list = mini.treeToArray(this.columns, "columns");

        for (var i = 0, l = list.length; i < l; i++) {
            var column = list[i];
            var cols = dcs[column.level];

            if (column.columns && column.columns.length > 0) {
                column.colspan = getColSpan(column);
            }
            if ((!column.columns || column.columns.length == 0) && column.level < maxLevel) {
                column.rowspan = maxLevel - column.level + 1;
            }

            cols.push(column);
        }

        return dcs;
    },
    /**
     * 获取列层级最大值
     * @return {Number}
     */
    getMaxColumnLevel: function () {
        return this.maxColumnLevel;
    }
}

mini.copyTo(mini.DataGrid.prototype, mini_Column_Prototype);
/**
 * @class 表格组件排序插件，主要实现排序相关功能。
 * @constructor
 */
mini._GridSort = function (grid) {

    this.grid = grid;

    mini.on(grid._headerEl, "mousemove", this.__OnGridHeaderMouseMove, this);
    mini.on(grid._headerEl, "mouseout", this.__OnGridHeaderMouseOut, this);
};
mini._GridSort.prototype = {
    destroy: function (removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        if(this._focusedColumnEl){
            mini.clearEvent(this._focusedColumnEl);
            var parent = this._focusedColumnEl.parentNode;
            if(parent)
                parent.removeChild(this._focusedColumnEl);
            this._focusedColumnEl = null;
        }
    },
    /** @lends mini._GridSort.prototype */
    __OnGridHeaderMouseOut: function (e) {
        if (this._focusedColumnEl) {
            mini.removeClass(this._focusedColumnEl, "mini-grid-headerCell-hover");
        }
    },
    __OnGridHeaderMouseMove: function (e) {
        var t = mini.findParent(e.target, "mini-grid-headerCell");
        if (t) {

            mini.addClass(t, "mini-grid-headerCell-hover");
            this._focusedColumnEl = t;
        }
    },
    __onGridHeaderCellClick: function (e) {
        var grid = this.grid;

        var t = mini.findParent(e.target, "mini-grid-headerCell");
        if (t) {
            var column = grid.getColumn(t.id.split("$")[2]);
            if (grid.allowMoveColumn && column && column.allowDrag) {
                this.dragColumn = column;
                this._columnEl = t;
                this.getDrag().start(e);
            }
        }
    }
};
/**
 * @class 表格组件单元格校验插件，主要实现单元格校验相关功能。
 */
mini_CellValidator_Prototype = {
    /**
     * 获取所有单元格错误信息
     * @return {Array}
     */
    getCellErrors: function () {
        return this._cellErrors;
    },
    /**
     * 获取单元格错误信息
     * @param Object/Number row 行对象或行rowIndex
     * @param {Object/String/Number} column 列的name或index
     */
    getCellError: function (row, column) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column)
            return;

        var id = row[this._rowIdField] + "$" + column._id;
        return this._cellMapErrors[id];
    },
    /**
     * 单元格数据是否有效
     * @return {}
     */
    isValid: function () {

        return this._cellErrors.length == 0;
    },
    /**
     * 校验数据有效性
     */
    validate: function () {
        var data = this.data;
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            this.validateRow(row);

        }
    },
    /**
     * 校验行数据有效性
     * @param Object/Number row 行对象或行rowIndex
     */
    validateRow: function (row) {
        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            this.validateCell(row, column);
        }
    },
    /**
     * 校验单元格数据有效性
     * @param Object/Number row 行对象或行rowIndex
     * @param {Object/String/Number} column 列的name或index
     */
    validateCell: function (row, column) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column)
            return;
        var e = {
            record: row,
            row: row,
            node: row,
            column: column,
            field: column.field,
            value: row[column.field],
            isValid: true,
            errorText: ""
        };

        if (column.vtype) {
            mini._ValidateVType(column.vtype, e.value, e, column);
        }

        if (e.isValid == true && column.unique && column.field) {

            var maps = {};
            var data = this.data, field = column.field;
            for (var i = 0, l = data.length; i < l; i++) {
                var o = data[i];
                var v = o[field];
                if (mini.isNull(v) || v === "") {
                } else {
                    var old = maps[v];
                    if (old && o == row) {
                        e.isValid = false;
                        e.errorText = mini._getErrorText(column, "uniqueErrorText");

                        this.setCellIsValid(old, column, e.isValid, e.errorText);
                        break;
                    }
                    maps[v] = o;
                }
            }
        }

        this.fire("cellvalidation", e);
        this.setCellIsValid(row, column, e.isValid, e.errorText);
    },
    /**
     * 设置数据是否有效显示效果
     * @param {Boolean} value
     */
    setIsValid: function (value) {
        if (value) {
            var errors = this._cellErrors.clone();
            for (var i = 0, l = errors.length; i < l; i++) {
                var error = errors[i];
                this.setCellIsValid(error.record, error.column, true);
            }
        }
    },
    _removeRowError: function (row) {
        var columns = this.getColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var id = row[this._rowIdField] + "$" + column._id;
            var error = this._cellMapErrors[id];
            if (error) {
                delete this._cellMapErrors[id];
                this._cellErrors.remove(error);
            }
        }
    },
    /**
     * 设置单元格数据是否有效显示效果
     * @param Object/Number row 行对象或行rowIndex
     * @param {Object/String/Number} column 列的name或index
     * @param {Boolean} isValid 是否有效
     * @param {String} errorText 错误信息
     */
    setCellIsValid: function (row, column, isValid, errorText) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column)
            return;
        var id = row[this._rowIdField] + "$" + column._id;
        var cellEl = this._getCellEl(row, column);

        var error = this._cellMapErrors[id];
        delete this._cellMapErrors[id];
        this._cellErrors.remove(error);

        if (isValid === true) {
            if (cellEl && error) {
                mini.removeClass(cellEl, 'mini-grid-cell-error');
            }
        } else {
            error = {
                record: row,
                column: column,
                isValid: isValid,
                errorText: errorText
            };
            this._cellMapErrors[id] = error;
            this._cellErrors.add(error);
            if (cellEl) {
                mini.addClass(cellEl, 'mini-grid-cell-error');
            }
        }
    }
}

mini.copyTo(mini.DataGrid.prototype, mini_CellValidator_Prototype);