

mini.TreeGrid = function () {
    this.columns = [];
    this._bottomColumns = [];
    this._idColumns = {};
    this._nameColumns = {};

    this._cellErrors = [];
    this._cellMapErrors = {};

    mini.TreeGrid.superclass.constructor.call(this);

    this._resizeEl.style.display = this.allowResize ? "" : "none";
}
mini.extend(mini.TreeGrid, mini.Tree, {
    _rowIdField: "_id",

    width: 300,
    height: 180,

    minWidth: 300,
    minHeight: 150,
    maxWidth: 5000,
    maxHeight: 3000,

    allowResize: false,

    treeColumn: "",

    columns: [],
    columnWidth: 80,

    allowResizeColumn: true,
    allowMoveColumn: true,

    _doPositoin: true,

    _headerCellCls: "mini-treegrid-headerCell",
    _cellCls: "mini-treegrid-cell",

    _borderCls: "mini-treegrid-border",
    _headerCls: "mini-treegrid-header",
    _bodyCls: "mini-treegrid-body",

    _nodeCls: "mini-treegrid-node",
    _nodesCls: "mini-treegrid-nodes",
    _selectedNodeCls: "mini-treegrid-selectedNode",
    _nodeHoverCls: "mini-treegrid-hoverNode",

    _expandNodeCls: "mini-treegrid-expand",
    _collapseNodeCls: "mini-treegrid-collapse",
    _eciconCls: "mini-treegrid-ec-icon",
    _inNodeCls: "mini-treegrid-nodeTitle",
    _getNodeHoverEl: function (node) {
        if (!node) return null;
        var el = this._getNodeTitleEl(node);
        return el;
    },

    uiCls: "mini-treegrid",
    _create: function () {
        mini.TreeGrid.superclass._create.call(this);

        this._resizeEl = mini.append(this._borderEl, '<div class="mini-resizer-trigger" style=""></div>');

        mini.on(this._bodyEl, "scroll", this.__OnScroll, this);

        this._Resizer = new mini._Resizer(this);
        this._ColumnMove = new mini._ColumnMove(this);
        this._Splitter = new mini._ColumnSplitter(this);
        this._CellTip = new mini._CellToolTip(this);
    },
    _createColumnId: function (column) {
        return this.uid + "$column$" + column.id;
    },
    _getHeaderScrollEl: function () {
        return this._headerEl.firstChild;
    },
    _CreateTopTr: function (name) {
        var s = "";
        var columns = this.getBottomColumns();
        if (isIE) {
            if (isIE6 || isIE7 || (isIE8 && !jQuery.boxModel) || (isIE9 && !jQuery.boxModel)) {
                s += '<tr style="display:none;">';
            } else {
                s += '<tr >';
            }
        } else {
            s += '<tr>';
        }
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var width = column.width;
            var id = this._createColumnId(column) + "$" + name;

            s += '<td id="' + id + '" style="padding:0;border:0;margin:0;height:0;';
            if (column.width) s += 'width:' + column.width;

            if (column.visible == false) {
                s += ";display:none;";
            }

            s += '" ></td>';
        }
        s += "</tr>";
        return s;
    },









































    _doUpdateHeader: function () {

        var rows = this.getColumnRows();

        var bottomColumns = this.getBottomColumns();
        var columnLength = bottomColumns.length;

        var sb = [];
        sb[sb.length] = '<div class="mini-treegrid-headerInner"><table style="display:table" class="mini-treegrid-table" cellspacing="0" cellpadding="0">';
        sb[sb.length] = this._CreateTopTr("header");

        for (var j = 0, k = rows.length; j < k; j++) {
            var columns = rows[j];

            sb[sb.length] = '<tr >';
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];
                var header = column.header;
                if (typeof header == "function") header = header.call(this, column);
                if (mini.isNull(header) || header === "") header = "&nbsp;";

                var columnId = this._createColumnId(column);

                sb[sb.length] = '<td id="';
                sb[sb.length] = columnId;
                sb[sb.length] = '" class="mini-treegrid-headerCell  ' + (column.headerCls || "") + ' ';


                sb[sb.length] = '" style="';
                var bottomIndex = bottomColumns.indexOf(column);
                if (column.visible == false) {
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

                sb[sb.length] = '>';

                sb[sb.length] = header;

                sb[sb.length] = '</td>';
            }
            sb[sb.length] = '</tr>';
        }
        sb[sb.length] = '</table><div class="mini-treegrid-topRightCell"></div></div>';

        var s = sb.join("");

        this._headerEl.innerHTML = s;

        this._headerInnerEl = this._headerEl.firstChild;
        this._topRightCellEl = this._headerInnerEl.lastChild;

    },
    _createNodeTitle: function (node, useEdit, sb) {
        var isReturn = !sb;
        if (!sb) sb = [];

        var text = node[this.textField];
        if (text === null || text === undefined) text = "";
        var isLeaf = this.isLeaf(node);
        var level = this.getLevel(node);

        var cls = "";
        if (!isLeaf) {
            cls = this.isExpandedNode(node) ? this._expandNodeCls : this._collapseNodeCls;
        }
        if (this._selectedNode == node) {
            cls += " " + this._selectedNodeCls;
        }

        var columns = this.getBottomColumns();

        sb[sb.length] = '<table class="mini-treegrid-nodeTitle ';
        sb[sb.length] = cls;
        sb[sb.length] = '" cellspacing="0" cellpadding="0">';
        sb[sb.length] = this._CreateTopTr();
        sb[sb.length] = '<tr>';
        for (var j = 0, k = columns.length; j < k; j++) {
            var column = columns[j];
            var cellId = this._createCellId(node, column);

            var e = this._OnDrawCell(node, column);

            var w = column.width;
            if (typeof w == "number") w = w + "px";

            sb[sb.length] = '<td id="';
            sb[sb.length] = cellId;
            sb[sb.length] = '" class="mini-treegrid-cell ';
            if (e.cellCls) sb[sb.length] = e.cellCls;
            sb[sb.length] = '" style="';
            if (e.cellStyle) {
                sb[sb.length] = e.cellStyle;
                sb[sb.length] = ";";
            }





            if (column.align) {
                sb[sb.length] = 'text-align:';
                sb[sb.length] = column.align;
                sb[sb.length] = ';';
            }
            if (column.visible == false) {
                sb[sb.length] = 'display:none;';
            }

            sb[sb.length] = '">';
            sb[sb.length] = e.cellHtml;
            sb[sb.length] = '</td>';

            if (e.rowCls) rowCls = e.rowCls;
            if (e.rowStyle) rowStyle = e.rowStyle;

        }
        sb[sb.length] = '</table>';

        if (isReturn) return sb.join('');
    },
    doUpdate: function () {
        if (!this._allowUpdate) return;

        this._doUpdateHeader();

        var sss = new Date();

        var nodes = this._getViewChildNodes(this.root);
        var sb = [];
        this._createNodes(nodes, this.root, sb);
        var s = sb.join('');

        this._bodyEl.innerHTML = s;
        this._deferLayout();





    },
    getScrollLeft: function () {
        return this._bodyEl.scrollLeft;
    },
    doLayout: function () {
        if (!this.canLayout()) return;



        var autoHeight = this.isAutoHeight();
        var autoWidth = this.isAutoWidth();

        var width = this.getWidth(true);
        var height = this.getHeight(true);
        var headerHeight = this.getHeaderHeight();
        var bodyHeight = height - headerHeight;

        this._bodyEl.style.width = width + "px";
        if (autoHeight) {
            this._bodyEl.style.height = "auto";
        } else {
            this._bodyEl.style.height = bodyHeight + "px";
        }

        this._doLayoutHeader();

        this._doLayoutTopRightCell();

        this.fire("layout");

    },
    _doLayoutTopRightCell: function () {
        var headerTable = this._headerInnerEl.firstChild;
        var width = headerTable.offsetWidth + 1;
        var height = headerTable.offsetHeight - 1;
        if (height < 0) height = 0;

        this._topRightCellEl.style.height = height + "px";
    },
    _doLayoutHeader: function () {










        var bodyScrollHeight = this._bodyEl.scrollHeight;
        var bodyClientHeight = this._bodyEl.clientHeight;

        var elWidth = this.getWidth(true);

        var table1 = this._headerEl.firstChild.firstChild, table2 = this._bodyEl.firstChild;

        if (bodyClientHeight >= bodyScrollHeight) {
            if (table2) table2.style.width = "100%";
            if (table1) table1.style.width = "100%";
        } else {
            if (table2) {
                var w = parseInt(table2.parentNode.offsetWidth - 17) + 'px'
                table2.style.width = w;
            }

            if (table1) table1.style.width = w;
        }










        try {
            var w = this._headerEl.firstChild.firstChild.firstChild.offsetWidth;

            this._bodyEl.firstChild.style.width = w + "px";
        } catch (e) { }

        this.__OnScroll();
    },
    getHeaderHeight: function () {
        return mini.getHeight(this._headerEl);
    },

    _OnDrawCell: function (record, column) {

        var showCheckBox = this.showCheckBox;
        if (showCheckBox && this.hasChildren(record)) {
            showCheckBox = this.showFolderCheckBox;
        }

        var value = mini._getMap(column.field, record);
        var e = {
            isLeaf: this.isLeaf(record),
            rowIndex: this.indexOf(record),
            showCheckBox: showCheckBox,
            iconCls: this.getNodeIcon(record),
            showTreeIcon: this.showTreeIcon,

            sender: this,
            record: record,
            row: record,
            node: record,
            column: column,
            field: column ? column.field : null,
            value: value,
            cellHtml: value,
            rowCls: null,
            cellCls: column ? (column.cellCls || '') : "",
            rowStyle: null,
            cellStyle: column ? (column.cellStyle || '') : ""
        };

        if (column.dateFormat) {
            if (mini.isDate(e.value)) e.cellHtml = mini.formatDate(value, column.dateFormat);
            else e.cellHtml = value;
        }

        var renderer = column.renderer;
        if (renderer) {
            fn = typeof renderer == "function" ? renderer : window[renderer];
            if (fn) {
                e.cellHtml = fn.call(column, e);
            }
        }

        this.fire("drawcell", e);

        if (e.cellHtml === null || e.cellHtml === undefined || e.cellHtml === "") e.cellHtml = "&nbsp;";

        if (!this.treeColumn || this.treeColumn !== column.name) return e;

        this._doTreeColumn(e);
        return e;
    },
    _doTreeColumn: function (e) {

        var node = e.node;
        if (mini.isNull(e.showTreeIcon)) e.showTreeIcon = this.showTreeIcon;

        var cellHtml = e.cellHtml;

        var isLeaf = this.isLeaf(node);
        var left = this.getLevel(node) * 18;

        var cls = '';


        if (e.cellCls) {
            e.cellCls += ' mini-treegrid-treecolumn ';
        } else {
            e.cellCls = ' mini-treegrid-treecolumn ';
        }

        var s = '<div class="mini-treegrid-treecolumn-inner ' + cls + '">';

        if (!isLeaf) {
            s += '<a href="#" onclick="return false;"  hidefocus class="' + this._eciconCls + '" style="left:' + (left) + 'px;"></a>';
        }
        left += 18;

        if (e.showTreeIcon) {
            var icon = this.getNodeIcon(node);
            s += '<div class="' + icon + ' mini-treegrid-nodeicon" style="left:' + left + 'px;"></div>';
            left += 18;
        }

        cellHtml = '<span class="mini-tree-nodetext">' + cellHtml + '</span>';

        if (e.showCheckBox) {

            var ckid = this._createCheckNodeId(node);
            var checked = this.isCheckedNode(node);
            cellHtml = '<input type="checkbox" id="' + ckid + '" class="' + this._checkBoxCls + '" hidefocus ' + (checked ? "checked" : "") + '/>' + cellHtml;
        }

        s += '<div class="mini-treegrid-nodeshow" style="margin-left:' + (left + 2) + 'px;">' + cellHtml + '</div>';
        s += '</div>';
        cellHtml = s;
        e.cellHtml = cellHtml;
    },

    setTreeColumn: function (value) {
        if (this.treeColumn != value) {
            this.treeColumn = value;
            this.doUpdate();
        }
    },
    getTreeColumn: function (node) {
        return this.treeColumn;
    },
    setAllowResizeColumn: function (value) {
        this.allowResizeColumn = value;
    },
    getAllowResizeColumn: function (node) {
        return this.allowResizeColumn;
    },
    setAllowMoveColumn: function (value) {
        this.allowMoveColumn = value;
    },
    getAllowMoveColumn: function (node) {
        return this.allowMoveColumn;
    },
    setAllowResize: function (value) {
        this.allowResize = value;

        this._resizeEl.style.display = this.allowResize ? "" : "none";
    },
    getAllowResize: function () {
        return this.allowResize;
    },

    _createCellId: function (node, column) {
        return this.uid + "$" + node._id + "$" + column._id;
    },
    setColumnWidth: function (column, width) {
        column = this.getColumn(column);
        if (!column) return;
        if (mini.isNumber(width)) width += "px";
        column.width = width;

        this.doUpdate();
    },
    getColumnWidth: function (column) {
        var box = this.getColumnBox(column);
        return box ? box.width : 0;
    },

    __OnScroll: function (e) {
        var scrollLeft = this._bodyEl.scrollLeft;
        this._headerEl.firstChild.scrollLeft = scrollLeft;
    },

    getAttrs: function (el) {

        var attrs = mini.TreeGrid.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            [
                "treeColumn", "ondrawcell"
            ]
        );

        mini._ParseBool(el, attrs,
            [
                "allowResizeColumn", "allowMoveColumn", "allowResize"
            ]
        );

        var cs = mini.getChildNodes(el);
        for (var i = 0, l = cs.length; i < l; i++) {
            var node = cs[i];
            var property = jQuery(node).attr("property");
            if (!property) continue;
            property = property.toLowerCase();
            if (property == "columns") {
                attrs.columns = mini._ParseColumns(node);
            }
        }

        delete attrs.data;

        return attrs;
    }
});

mini.copyTo(mini.TreeGrid.prototype, mini_Column_Prototype);
mini.copyTo(mini.TreeGrid.prototype, mini_CellValidator_Prototype);

mini.regClass(mini.TreeGrid, "treegrid");