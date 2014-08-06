//-----------------------------------------后续内容都是  Grid 组件相关内容了。---------------------------------------------
/**
 * @fileOverview 表格组件插件。
 */
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
        if(this.drag){
            this.drag.destroy();
            this.drag = null;
        }
    },
    /**
    * @lends mini._ColumnSplitter.prototype
    */
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
        if(this.drag){
            this.drag.destroy();
            this.drag = null;
        }
    },
    /**
    * @lends mini._ColumnMove.prototype
    */
    __onGridMouseDown: function (e) {
        
        var grid = this.grid;

        if (grid.isEditing && grid.isEditing()) return;
        if (mini.hasClass(e.target, "mini-grid-splitter")) return;

        if (e.button == mini.MouseButton.Right) return;
        var t = mini.findParent(e.target, grid._headerCellCls);
        if (t) {
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
                capture: isIE9 ? false : true,
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
    _OnDragStop: function (drag) {
        
        var grid = this.grid;
        mini.removeNode(this._dragProxy);
        mini.removeNode(this.moveTop);
        mini.removeNode(this.moveBottom);
        grid.moveColumn(this.dragColumn, this.targetColumn, this.insertAction);
        this._dragProxy = this.moveTop = this.moveBottom = this.dragColumn = this.targetColumn = null;
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
    /**
    * @lends mini._GridSelect.prototype
    */
    __OnGridKeyDown: function (e) {

        var grid = this.grid;
        if (mini.isAncestor(grid._filterEl, e.target)
            || mini.isAncestor(grid._summaryEl, e.target)
            || mini.isAncestor(grid._footerEl, e.target)
            ) {
            return;
        }


        var currentCell = grid.getCurrentCell();

        if (e.shiftKey || e.ctrlKey) {
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
            case 27:        

                break;
            case 13:     
                if (grid.allowCellEdit && currentCell  && !column.readOnly) {
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
        }
        
        if (record && grid.allowRowSelect) {
            grid.deselectAll();
            grid.setCurrent(record);
        }
    },
    __onGridCellClick: function (e) {
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
                        e.htmlEvent.preventDefault();
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
    __onGridMouseOut : function (e) {
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
    mini.on(this.grid.el, "mousemove", this.__onGridMouseMove, this);
};
mini._ColumnsMenu.prototype = {
    destroy: function (removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        if(this.arrowEl){
            mini.clearEvent(this.arrowEl);
            this.arrowEl.parentNode.removeChild(this.arrowEl);
            this.arrowEl = null;
        }
    },
    column: null,
    __OnArrowClick: function (e) {
        var grid = this.grid;
        grid._doShowColumnsMenu(this.column);
    },
    _getArrowEl: function () {
        if (!this.arrowEl) {
            this.arrowEl = mini.append(document.body, '<div class="mini-grid-menuArrow"><div class="mini-grid-menuArrowIcon"></div></div>');
            mini.on(this.arrowEl, "click", this.__OnArrowClick, this);
        }
        this.arrowEl.style.display = "block";
        return this.arrowEl;
    },
    __onGridMouseMove: function (e) {
        var grid = this.grid;
        if (grid.showColumnsMenu == false) return;

        var el = this._getArrowEl();
        if (!mini.isAncestor(grid._headerEl, e.target)) {
            el.style.display = "none";
            return;
        }

        var column = grid._getColumnByEvent(e);
        this.column = column;
        var columnEl = grid._getColumnEl(column);
        if (columnEl) {
            var box = mini.getBox(columnEl);

            mini.setXY(el, box.right - 17, box.top);
            mini.setHeight(el, box.height - 1);
            mini.setWidth(el, 16);
        }
    }
};

//dataGrid 和treeGrid增加改变大小的能力。
/**
 * @class 表格组件调整大小插件，主要实现调整大小相关功能。
 */
mini._GridResizer = function (grid) {
    this.owner = grid;
    mini.on(this.owner.el, "mousedown", this.__OnMouseDown, this);
}
mini._GridResizer.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        if (this._resizeDragger) {
            this._resizeDragger.destroy();
        }
    },
    __OnMouseDown: function (e) {
        if (mini.hasClass(e.target, "mini-grid-resizeGrid") && this.owner.allowResize) {
            var drag = this._getResizeDrag();
            drag.start(e);
        }
    },
    _getResizeDrag: function () {
        if (!this._resizeDragger) {
            this._resizeDragger = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this._resizeDragger;
    },
    _OnDragStart: function (drag) {

        this.proxy = mini.append(document.body, '<div class="mini-grid-resizeProxy"></div>');
        this.proxy.style.cursor = "se-resize";

        this.elBox = mini.getBox(this.owner.el);
        mini.setBox(this.proxy, this.elBox);
    },
    _OnDragMove: function (drag) {
        var grid = this.owner;
        var xOffset = drag.now[0] - drag.init[0];
        var yOffset = drag.now[1] - drag.init[1];

        var w = this.elBox.width + xOffset;
        var h = this.elBox.height + yOffset;
        if (w < grid.minWidth)
            w = grid.minWidth;
        if (h < grid.minHeight)
            h = grid.minHeight;
        if (w > grid.maxWidth)
            w = grid.maxWidth;
        if (h > grid.maxHeight)
            h = grid.maxHeight;

        mini.setSize(this.proxy, w, h);
    },
    _OnDragStop: function (drag, success) {
        if (!this.proxy)
            return;
        var box = mini.getBox(this.proxy);

        jQuery(this.proxy).remove();
        this.proxy = null;
        this.elBox = null;

        if (success) {
            this.owner.setWidth(box.width);
            this.owner.setHeight(box.height);
            this.owner.fire("resize");
        }
    }
};