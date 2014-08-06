
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
        if (this._focusedColumnEl) {
            mini.clearEvent(this._focusedColumnEl);
            var parent = this._focusedColumnEl.parentNode;
            if (parent)
                parent.removeChild(this._focusedColumnEl);
            this._focusedColumnEl = null;
        }
    },
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











    }
};



/**
* @class 表格组件列分隔容器插件，主要实现调整列宽相关功能。
*/


mini._ColumnSplitter = function (grid) {

    this.grid = grid;
    mini.on(this.grid.el, "mousedown", this.__onGridMouseDown, this);


    grid.on("layout", this.__OnGridLayout, this);
};
mini._ColumnSplitter.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        if (this.splittersEl) {
            mini.clearEvent(this.splittersEl);
            mini.removeNode(this.splittersEl);
            this.splittersEl = null;
        }
        if (this.drag) {
            this.drag.destroy();
            this.drag = null;
        }
    },
    __OnGridLayout: function (e) {

        if (this.splittersEl) mini.removeNode(this.splittersEl);
        if (this.splitterTimer) return;
        var grid = this.grid;
        if (grid.isDisplay() == false) return;

        var sf = this;
        this.splitterTimer = setTimeout(function () {


            var bottomColumns = grid.getBottomColumns();
            var columnLength = bottomColumns.length;

            var headerBox = mini.getBox(grid._headerEl, true);
            var scrollLeft = grid.getScrollLeft();

            var sb = [];

            for (var i = 0, l = bottomColumns.length; i < l; i++) {
                var column = bottomColumns[i];
                var box = grid.getColumnBox(column);
                if (!box) break;
                var top = box.top - headerBox.top;
                var left = box.right - headerBox.left - 2;
                var height = box.height;



                if (grid.isFrozen && grid.isFrozen()) {
                    if (i >= grid.frozenStartColumn) {

                    }
                } else {
                    left += scrollLeft;
                }


                var pcolumn = grid.getParentColumn(column);
                if (pcolumn && pcolumn.columns) {
                    if (pcolumn.columns[pcolumn.columns.length - 1] == column) {
                        if (height + 5 < headerBox.height) {
                            top = 0;
                            height = headerBox.height;
                        }
                    }
                }

                if (grid.allowResizeColumn && column.allowResize) {
                    sb[sb.length] = '<div id="' + column._id + '" class="mini-grid-splitter" style="left:'
                                + (left - 1) + 'px;top:' + top + 'px;height:' + height + 'px;"></div>';
                }
            }

            var s = sb.join('');

            sf.splittersEl = document.createElement("div");
            sf.splittersEl.className = 'mini-grid-splitters';
            sf.splittersEl.innerHTML = s;

            var el = grid._getHeaderScrollEl();
            el.appendChild(sf.splittersEl);



            sf.splitterTimer = null;
        }, 100);

    },
    __onGridMouseDown: function (e) {
        var grid = this.grid;
        var t = e.target;

        if (mini.hasClass(t, "mini-grid-splitter")) {
            var column = grid._idColumns[t.id];
            if (grid.allowResizeColumn && column && column.allowResize) {
                this.splitterColumn = column;
                this.getDrag().start(e);
            }
        }
    },
    getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    },
    _OnDragStart: function (drag) {
        var grid = this.grid;
        var columnBox = grid.getColumnBox(this.splitterColumn);
        this.columnBox = columnBox;
        this._dragProxy = mini.append(document.body, '<div class="mini-grid-proxy"></div>');


        var box = grid.getBox(true);
        box.x = columnBox.x;
        box.width = columnBox.width;
        box.right = columnBox.right;
        mini.setBox(this._dragProxy, box);
    },
    _OnDragMove: function (drag) {
        var grid = this.grid;
        var box = mini.copyTo({}, this.columnBox);
        var width = box.width + (drag.now[0] - drag.init[0]);
        if (width < grid.columnMinWidth) width = grid.columnMinWidth;
        if (width > grid.columnMaxWidth) width = grid.columnMaxWidth;

        mini.setWidth(this._dragProxy, width);
    },
    _OnDragStop: function (drag) {
        //内存泄露问题优化 赵美丹 2013-04-17
        this.columnBox = null;

        var grid = this.grid;
        var box = mini.getBox(this._dragProxy);
        var sf = this;
        var allowSort = grid.allowSortColumn;
        grid.allowSortColumn = false;
        setTimeout(function () {
            jQuery(sf._dragProxy).remove();
            sf._dragProxy = null;

            grid.allowSortColumn = allowSort;
        }, 10);

        var column = this.splitterColumn;

        var columnWidth = parseInt(column.width);
        if (columnWidth + "%" != column.width) {
            var width = grid.getColumnWidth(column);
            var w = parseInt(columnWidth / width * box.width);
            grid.setColumnWidth(column, w);
        }
    }
};


/**
 * @class 表格组件列移动插件，主要实现移动列相关功能。
 */

mini._ColumnMove = function (grid) {
    this.grid = grid;
    mini.on(this.grid.el, "mousedown", this.__onGridMouseDown, this);
};
mini._ColumnMove.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        if (this.drag) {
            this.drag.destroy();
            this.drag = null;
        }
    },
    __onGridMouseDown: function (e) {

        var grid = this.grid;

        if (grid.isEditing && grid.isEditing()) return;
        if (mini.hasClass(e.target, "mini-grid-splitter")) return;

        if (e.button == mini.MouseButton.Right) return;
        var t = mini.findParent(e.target, grid._headerCellCls);
        if (t) {
            this._remove();

            var column = grid._getColumnByEvent(e);
            if (grid.allowMoveColumn && column && column.allowMove) {
                this.dragColumn = column;
                this._columnEl = t;
                this.getDrag().start(e);
            }
        }
    },
    getDrag: function () {
        if (!this.drag) {
            this.drag = new mini.Drag({
                capture: false,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this.drag;
    },
    _OnDragStart: function (drag) {
        function createHeaderCell(column) {
            var header = column.header;
            if (typeof header == "function") header = header.call(grid, column);
            if (mini.isNull(header) || header === "") header = "&nbsp;";
            return header;
        }

        var grid = this.grid;
        this._dragProxy = mini.append(document.body, '<div class="mini-grid-columnproxy"></div>');
        this._dragProxy.innerHTML = '<div class="mini-grid-columnproxy-inner" style="height:26px;">' + createHeaderCell(this.dragColumn) + '</div>';
        mini.setXY(this._dragProxy, drag.now[0] + 15, drag.now[1] + 18);
        mini.addClass(this._dragProxy, "mini-grid-no");

        this.moveTop = mini.append(document.body, '<div class="mini-grid-movetop"></div>');
        this.moveBottom = mini.append(document.body, '<div class="mini-grid-movebottom"></div>');
    },
    _OnDragMove: function (drag) {
        var grid = this.grid;
        var x = drag.now[0];

        mini.setXY(this._dragProxy, x + 15, drag.now[1] + 18);

        this.targetColumn = this.insertAction = null;
        var t = mini.findParent(drag.event.target, grid._headerCellCls);
        if (t) {
            var column = grid._getColumnByEvent(drag.event);
            if (column && column != this.dragColumn) {
                var p1 = grid.getParentColumn(this.dragColumn);
                var p2 = grid.getParentColumn(column);
                if (p1 == p2) {

                    this.targetColumn = column;
                    this.insertAction = "before";
                    var columnBox = grid.getColumnBox(this.targetColumn);

                    if (x > columnBox.x + columnBox.width / 2) {

                        this.insertAction = "after";
                    }
                }
            }
        }

        if (this.targetColumn) {

            mini.addClass(this._dragProxy, "mini-grid-ok");
            mini.removeClass(this._dragProxy, "mini-grid-no");

            var box = grid.getColumnBox(this.targetColumn);

            this.moveTop.style.display = 'block';
            this.moveBottom.style.display = 'block';
            if (this.insertAction == "before") {

                mini.setXY(this.moveTop, box.x - 4, box.y - 9);
                mini.setXY(this.moveBottom, box.x - 4, box.bottom);
            } else {

                mini.setXY(this.moveTop, box.right - 4, box.y - 9);
                mini.setXY(this.moveBottom, box.right - 4, box.bottom);
            }
        } else {
            mini.removeClass(this._dragProxy, "mini-grid-ok");
            mini.addClass(this._dragProxy, "mini-grid-no");

            this.moveTop.style.display = 'none';
            this.moveBottom.style.display = 'none';
        }
    },
    _remove: function () {
        var grid = this.grid;
        mini.removeNode(this._dragProxy);
        mini.removeNode(this.moveTop);
        mini.removeNode(this.moveBottom);
        this._dragProxy = this.moveTop = this.moveBottom = this.dragColumn = this.targetColumn = null;
    },
    _OnDragStop: function (drag) {

        var grid = this.grid;
        grid.moveColumn(this.dragColumn, this.targetColumn, this.insertAction);
        this._remove();
    }
};




/**
 * @class 表格组件行/单元格选择插件，主要实现行/单元格选择相关功能。
 */

mini._GridSelect = function (grid) {

    this.grid = grid;
    this.grid.on("cellmousedown", this.__onGridCellMouseDown, this);
    this.grid.on("cellclick", this.__onGridCellClick, this);
    this.grid.on("celldblclick", this.__onGridCellClick, this);

    mini.on(this.grid.el, "keydown", this.__OnGridKeyDown, this);
};
mini._GridSelect.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        delete this.currentRecord;
    },
    __OnGridKeyDown: function (e) {


        var grid = this.grid;
        if (mini.isAncestor(grid._filterEl, e.target)
            || mini.isAncestor(grid._summaryEl, e.target)
            || mini.isAncestor(grid._footerEl, e.target)
            || mini.findParent(e.target, 'mini-grid-detailRow')
            || mini.findParent(e.target, 'mini-grid-rowEdit')

            ) {
            return;
        }


        var currentCell = grid.getCurrentCell();

        if (e.ctrlKey) {
            return;
        }

        if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
            e.preventDefault();
        }

        var columns = grid.getBottomVisibleColumns();

        var column = currentCell ? currentCell[1] : null,
            record = currentCell ? currentCell[0] : null;
        if (!currentCell) record = grid.getCurrent();
        var columnIndex = columns.indexOf(column);
        var rowIndex = grid.indexOf(record);
        var count = grid.getData().length;

        switch (e.keyCode) {
            case 9:
                if (grid.allowCellEdit && grid.editOnTabKey) {
                    e.preventDefault();

                    grid._beginEditNextCell(e.shiftKey == false);
                    return;
                }








                break;
            case 27:

                break;
            case 13:
                if (grid.allowCellEdit && grid.editNextOnEnterKey) {
                    if (grid.isEditingCell(currentCell) || !column.editor) {
                        grid._beginEditNextCell(e.shiftKey == false);
                        return;
                    }
                }
                if (grid.allowCellEdit && currentCell && !column.readOnly) {
                    grid.beginEditCell();
                }
                break;
            case 37:
                if (column) {
                    if (columnIndex > 0) {
                        columnIndex -= 1;
                    }
                } else {
                    columnIndex = 0;
                }
                break;
            case 38:
                if (record) {
                    if (rowIndex > 0) rowIndex -= 1;
                } else {
                    rowIndex = 0;
                }
                if (rowIndex != 0 && grid.isVirtualScroll()) {
                    if (grid._viewRegion.start > rowIndex) {
                        grid._bodyEl.scrollTop -= grid._rowHeight;
                        grid._tryUpdateScroll();
                    }
                }
                break;
            case 39:
                if (column) {
                    if (columnIndex < columns.length - 1) {
                        columnIndex += 1;
                    }
                } else {
                    columnIndex = 0;
                }
                break;
            case 40:
                if (record) {
                    if (rowIndex < count - 1) rowIndex += 1;
                } else {
                    rowIndex = 0;
                }
                if (grid.isVirtualScroll()) {
                    if (grid._viewRegion.end < rowIndex) {
                        grid._bodyEl.scrollTop += grid._rowHeight;
                        grid._tryUpdateScroll();
                    }
                }
                break;
            default:
                break;
        }

        column = columns[columnIndex];
        record = grid.getAt(rowIndex);

        if (column && record && grid.allowCellSelect) {
            var currentCell = [record, column];
            grid.setCurrentCell(currentCell);
            grid.scrollIntoView(record, column);
        }

        if (record && grid.allowRowSelect) {
            grid.deselectAll();
            grid.setCurrent(record);
        }
    },
    __onGridCellClick: function (e) {
        var grid = this.grid;
        if (grid.allowCellEdit == false) return;
        if (this.grid.cellEditAction != e.type) return;
        var record = e.record, column = e.column;
        if (!column.readOnly && !this.grid.isReadOnly()) {
            if (e.htmlEvent.shiftKey || e.htmlEvent.ctrlKey) {
            } else {
                this.grid.beginEditCell();

            }
        }
    },
    __onGridCellMouseDown: function (e) {

        var me = this;
        //解决shift、ctrl键多选时报错问题 赵美丹 2013-03-09
        //setTimeout(function () {
        me.__doSelect(e);
        //}, 1);
    },

    __doSelect: function (e) {

        var record = e.record, column = e.column;
        var grid = this.grid;


        if (this.grid.allowCellSelect) {
            var cell = [record, column];
            this.grid.setCurrentCell(cell);
        }


        if (grid.allowRowSelect) {
            if (grid.multiSelect) {
                this.grid.el.onselectstart = function () { };
                if (e.htmlEvent.shiftKey) {
                    this.grid.el.onselectstart = function () { return false };
                    e.htmlEvent.preventDefault();

                    if (!this.currentRecord) {
                        this.grid.select(record);
                        this.currentRecord = this.grid.getSelected();
                    } else {
                        this.grid.deselectAll();
                        this.grid.selectRange(this.currentRecord, record);
                    }

                } else {
                    this.grid.el.onselectstart = function () { };
                    if (e.htmlEvent.ctrlKey) {
                        this.grid.el.onselectstart = function () { return false };
                        try {
                            e.htmlEvent.preventDefault();
                        } catch (ex) { }
                    }

                    if (e.column._multiRowSelect === true || e.htmlEvent.ctrlKey || grid.allowUnselect) {
                        if (grid.isSelected(record)) {
                            grid.deselect(record);
                        } else {
                            grid.select(record);
                        }
                    } else {
                        if (grid.isSelected(record)) {

                        } else {
                            grid.deselectAll();
                            grid.select(record);
                        }
                    }
                    this.currentRecord = this.grid.getSelected();
                }
            } else {
                if (!grid.isSelected(record)) {
                    grid.deselectAll();
                    grid.select(record);
                } else {
                    if (e.htmlEvent.ctrlKey) {
                        grid.deselectAll();
                    }
                }
            }
        }

    }
};

/**
 * @class 表格组件单元格浮动信息插件，主要实现单元格浮动信息相关功能。
 */
mini._CellToolTip = function (grid) {
    this.grid = grid;
    mini.on(this.grid.el, "mousemove", this.__onGridMouseMove, this);
    //解决title长时间停留后消失，此时移出再移入不显示title的问题 赵美丹 2013-03-25
    mini.on(this.grid.el, "mouseout", this.__onGridMouseOut, this);
};
mini._CellToolTip.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
    },
    /**
    * @lends mini._CellToolTip.prototype
    */
    __onGridMouseMove: function (e) {

        var grid = this.grid;
        var cell = grid._getCellByEvent(e);

        var cellEl = grid._getCellEl(cell.record, cell.column);

        var error = grid.getCellError(cell.record, cell.column);
        if (cellEl) {
            if (error) {
                cellEl.title = error.errorText;
                return;
            }

            if (cellEl.firstChild) {
                if (mini.hasClass(cellEl.firstChild, "mini-grid-cell-inner")
                    || mini.hasClass(cellEl.firstChild, "mini-treegrid-treecolumn-inner")
                    ) {
                    cellEl = cellEl.firstChild;
                }
            }
            if (cellEl.scrollWidth > cellEl.clientWidth) {
                var s = cellEl.innerText || cellEl.textContent || "";
                cellEl.title = s.trim();
            } else {
                cellEl.title = "";
            }

        }
    },
    /**
     * 解决title长时间停留后消失，此时移出再移入不显示title的问题
     * @author 赵美丹
     * @date 2013-03-25
     */
    __onGridMouseOut: function (e) {
        var grid = this.grid;
        var cell = grid._getCellByEvent(e);

        var cellEl = grid._getCellEl(cell.record, cell.column);
        if (cellEl) {
            cellEl.title = "";
        }
    }
};


/**
 * @class 表格组件列菜单插件，主要实现列菜单相关功能。
 */
mini._ColumnsMenu = function (grid) {
    this.grid = grid;
    this.menu = this.createMenu();
    mini.on(grid.el, "contextmenu", this.__OnContextMenu, this);
}
mini._ColumnsMenu.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        if (this.arrowEl) {
            mini.clearEvent(this.arrowEl);
            this.arrowEl.parentNode.removeChild(this.arrowEl);
            this.arrowEl = null;
        }
    },
    createMenu: function () {
        var menu = mini.create({ type: "menu", hideOnClick: false });
        menu.on("itemclick", this.__OnItemClick, this);
        return menu;
    },
    updateMenu: function () {
        var grid = this.grid, menu = this.menu;
        var columns = grid.getBottomColumns();
        var items = [];
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            var item = {};
            item.checked = column.visible;
            item.checkOnClick = true;
            item.text = grid._createHeaderText(column);
            if (item.text == "&nbsp;") {
                if (column.type == "indexcolumn") item.text = "序号";
                if (column.type == "checkcolumn") item.text = "选择";
            }
            items.push(item);

            item._column = column;
        }
        menu.setItems(items);
    },
    __OnContextMenu: function (e) {
        var grid = this.grid;
        if (grid.showColumnsMenu == false) return;
        if (mini.isAncestor(grid._headerEl, e.target) == false) return;
        this.updateMenu();
        this.menu.showAtPos(e.pageX, e.pageY);
        return false;
    },
    __OnItemClick: function (e) {
        var grid = this.grid, menu = this.menu;
        var columns = grid.getBottomColumns();
        var items = menu.getItems();
        var item = e.item, column = item._column;

        var checkedCount = 0;
        for (var i = 0, l = items.length; i < l; i++) {
            var it = items[i];
            if (it.getChecked()) checkedCount++;
        }
        if (checkedCount < 1) {
            item.setChecked(true);
        }

        var checked = item.getChecked();
        if (checked) grid.showColumn(column);
        else grid.hideColumn(column);
    }
}



/**
 * @class 表格组件单元格校验插件，主要实现单元格校验相关功能。
 */
mini_CellValidator_Prototype = {
    getCellErrors: function () {
        var errors = this._cellErrors.clone();

        var data = this.data;
        for (var i = 0, l = errors.length; i < l; i++) {
            var error = errors[i];
            var row = error.record;
            var column = error.column;
            if (data.indexOf(row) == -1) {
                var id = row[this._rowIdField] + "$" + column._id;
                delete this._cellMapErrors[id];
                this._cellErrors.remove(error);
            }
        }

        return this._cellErrors;
    },
    getCellError: function (row, column) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return;

        var id = row[this._rowIdField] + "$" + column._id;
        return this._cellMapErrors[id];
    },
    isValid: function () {

        return this.getCellErrors().length == 0;
    },
    validate: function () {

        var data = this.data;
        for (var i = 0, l = data.length; i < l; i++) {
            var row = data[i];
            this.validateRow(row);

        }
    },
    validateRow: function (row) {
        var columns = this.getBottomColumns();
        for (var i = 0, l = columns.length; i < l; i++) {
            var column = columns[i];
            this.validateCell(row, column);
        }
    },
    validateCell: function (row, column) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return;
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
    setCellIsValid: function (row, column, isValid, errorText) {
        row = this.getNode ? this.getNode(row) : this.getRow(row);
        column = this.getColumn(column);
        if (!row || !column) return;
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
            error = { record: row, column: column, isValid: isValid, errorText: errorText };
            this._cellMapErrors[id] = error;
            this._cellErrors.add(error);
            if (cellEl) {
                mini.addClass(cellEl, 'mini-grid-cell-error');
            }
        }
    }
}


mini.copyTo(mini.DataGrid.prototype, mini_CellValidator_Prototype);




mini.GridEditor = function () {
    this._inited = true;
    mini.Control.superclass.constructor.call(this);

    this._create();
    this.el.uid = this.uid;

    this._initEvents();

    this._doInit();

    this.addCls(this.uiCls);
}
mini.extend(mini.GridEditor, mini.Control, {
    el: null,
    _create: function () {
        this.el = document.createElement("input");
        this.el.type = "text";
        this.el.style.width = "100%";
    },
    getValue: function () {
        return this.el.value;
    },
    setValue: function (value) {
        this.el.value = value;
    },
    setWidth: function (value) {

    }
});


