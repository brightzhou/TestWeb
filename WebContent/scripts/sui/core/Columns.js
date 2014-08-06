/**
 * @fileOverview Columns.js文件定义了mini UI框架中部分组件用到的一些方法。
 * @requires mini.js
 */

mini = mini || {};

mini._Columns = {};

mini._getColumn = function (columnType) {
	var columnFn = mini._Columns[columnType.toLowerCase()];
	if (!columnFn)
		return {};
	return columnFn();
}
/**
 * 用参数替换默认设置，并返回这个对象。
 */
mini.IndexColumn = function (config) {
    return mini.copyTo({width: 30, cellCls: "", align: "center", draggable: false, allowDrag: true,
        init: function (grid) {
			grid.on("addrow", this.__OnIndexChanged, this);
			grid.on("removerow", this.__OnIndexChanged, this);
			grid.on("moverow", this.__OnIndexChanged, this);

			if (grid.isTree) {
				grid.on("loadnode", this.__OnIndexChanged, this);
				this._gridUID = grid.uid;
				this._rowIdField = "_id";
			}
		},
		getNumberId: function (record) {
			return this._gridUID + "$number$" + record[this._rowIdField];
		},
		createNumber: function (grid, rowIndex) {
			if (mini.isNull(grid.pageIndex)) {
				return rowIndex + 1;
			} else
				return (grid.pageIndex * grid.pageSize) + rowIndex + 1;
		},
		renderer: function (e) {
			var grid = e.sender;
			if (this.draggable) {
				if (!e.cellStyle)
					e.cellStyle = "";
				e.cellStyle += ";cursor:move;";
			}
			var s = '<div id="' + this.getNumberId(e.record) + '">';
			if (mini.isNull(grid.pageIndex))
				s += e.rowIndex + 1;
			else
				s += (grid.pageIndex * grid.pageSize) + e.rowIndex + 1;
			s += '</div>';
			return s;
		},
		__OnIndexChanged: function (e) {
			var grid = e.sender;

			var records = grid.toArray();

			for (var i = 0, l = records.length; i < l; i++) {
				var record = records[i];
				var id = this.getNumberId(record);
				var ck = document.getElementById(id);
				if (ck)
					ck.innerHTML = this.createNumber(grid, i);
			}

		}
	}, config);
}
// mini._Columns.indexcolumn = mini.IndexColumn
mini._Columns["indexcolumn"] = mini.IndexColumn;

// mini._Columns.checkcolumn = mini.CheckColumn
mini.CheckColumn = function (config) {
	return mini.copyTo({
		width: 30,
		cellCls: "mini-checkcolumn",
		headerCls: "mini-checkcolumn",
		_multiRowSelect: true,
		header: function (column) {

			var id = this.uid + "checkall";
			var s = '<input type="checkbox" id="' + id + '" />';
			if (this.multiSelect == false)
				s = "";
			return s;
		},
		getCheckId: function (record) {
			return this._gridUID + "$checkcolumn$" + record[this._rowIdField];
		},
		init: function (grid) {
			grid.on("selectionchanged", this.__OnSelectionChanged, this);
			grid.on("HeaderCellClick", this.__OnHeaderCellClick, this);
		},
		renderer: function (e) {
			var id = this.getCheckId(e.record);
			var selected = e.sender.isSelected ? e.sender.isSelected(e.record) : false;

			var type = "checkbox";

			var grid = e.sender;
			if (grid.multiSelect == false)
				type = "radio";

			return '<input type="' + type + '" id="' + id + '" ' + (selected ? "checked" : "") + ' hidefocus style="outline:none;" onclick="return false"/>';
		},
		__OnHeaderCellClick: function (e) {
		    var grid = e.sender;
		    if (e.column != this) return;

			var id = grid.uid + "checkall";
			var ck = document.getElementById(id);
			//解决datagrid点击列头时checkbox选中状态混乱的问题  赵美丹 2013-04-17
			if (ck && e.htmlEvent.target.id == id) {
			    if (grid.getMultiSelect()) {
					if (ck.checked) {
						grid.selectAll();
					} else {
						grid.deselectAll();
					}
				} else {
					grid.deselectAll();
					if (ck.checked) {
						grid.select(0);
					}
				}
				grid.fire("checkall");
			}
		},
		__OnSelectionChanged: function (e) {
			var grid = e.sender;
			var records = grid.toArray();

			for (var i = 0, l = records.length; i < l; i++) {
				var record = records[i];
				var select = grid.isSelected(record);
				var id = grid.uid + "$checkcolumn$" + record[grid._rowIdField];
				var ck = document.getElementById(id);

				if (ck)
					ck.checked = select;
			}
			var me = this;
			if (!this._timer) {
				this._timer = setTimeout( function () {
					me._doCheckState(grid);
					me._timer = null;
				}, 10);
			}
		},
		_doCheckState: function (grid) {
            //解决表格无数据时全选checkbox只能选中，无法取消选中的问题 赵美丹 2013-03-09
            var data = grid.getData();
            if(data.length == 0){
                return;
            }
            
			var id = grid.uid + "checkall";
			var ck = document.getElementById(id);
			if (ck && grid._getSelectAllCheckState) {
				var state = grid._getSelectAllCheckState();
				if (state == "has") {
					ck.indeterminate = true;
					ck.checked = true;
				} else {
					ck.indeterminate = false;
					ck.checked = state;
				}
			}
		}
	}, config);
};
mini._Columns["checkcolumn"] = mini.CheckColumn;

mini.ExpandColumn = function (config) {
	return mini.copyTo({
		width: 30,
		cellCls: "",
		align: "center",
		draggable: false,
		cellStyle: "padding:0",
		renderer: function (e) {
			return '<a class="mini-grid-ecIcon" href="javascript:#" onclick="return false"></a>';
		},
		init: function (grid) {
			grid.on("cellclick", this.__OnCellClick, this);
		},
		__OnCellClick: function (e) {
			var grid = e.sender;
			if (e.column == this && grid.isShowRowDetail) {
				if (mini.findParent(e.htmlEvent.target, "mini-grid-ecIcon")) {
					var isShow = grid.isShowRowDetail(e.record);
					if (grid.autoHideRowDetail) {
						grid.hideAllRowDetail();
					}

					if (isShow) {
						grid.hideRowDetail(e.record);
					} else {
						grid.showRowDetail(e.record);
					}
				}
			}
		}
	}, config);
}
mini._Columns["expandcolumn"] = mini.ExpandColumn;

mini.CheckBoxColumn = function (config) {
	return mini.copyTo({
		_type: "checkboxcolumn",
		header: "#",
		headerAlign: "center",
		cellCls: "mini-checkcolumn",
		trueValue: true,
		falseValue: false,
		readOnly: false,
		getCheckId: function (record) {
			return this._gridUID + "$checkbox$" + record[this._rowIdField];
		},
		getCheckBoxEl: function (record) {
		    return document.getElementById(this.getCheckId(record));
		},
		renderer: function (e) {
		    var id = this.getCheckId(e.record);
		    var v = mini._getMap(e.field, e.record);
		    var checked = v == this.trueValue ? true : false;
		    var type = "checkbox";
			return '<input type="' + type + '" id="' + id + '" ' + (checked ? "checked" : "") + ' hidefocus style="outline:none;" onclick="return false;"/>';
		},
		init: function (grid) {
		    this.grid = grid;
		    function oneditchange(e) {

		        if (grid.isReadOnly() || this.readOnly) return;
		        e.value = mini._getMap(e.field, e.record);
		        grid.fire("cellbeginedit", e);

		        if (e.cancel !== true) {




		            var v = mini._getMap(e.column.field, e.record);
		            var value = v == this.trueValue ? this.falseValue : this.trueValue;
		            if (grid._OnCellCommitEdit) {
		                grid._OnCellCommitEdit(e.record, e.column, value);






		            }
		        }
		    }
		    function onEdit(e) {

		        if (e.column == this) {

		            var id = this.getCheckId(e.record);
		            var ck = e.htmlEvent.target;
		            if (ck.id == id) {
		                if (grid.allowCellEdit) {
		                    e.cancel = false;
		                    oneditchange.call(this, e);
		                } else {
		                    if (grid.isEditingRow && grid.isEditingRow(e.record)) {
		                        setTimeout(function () {
		                            ck.checked = !ck.checked;
		                        }, 1);
		                    }
		                }
		            }
		        }
		    }
		    grid.on("cellclick", onEdit, this);
		    mini.on(this.grid.el, "keydown", function (e) {
		        if (e.keyCode == 32 && grid.allowCellEdit) {
		            var currentCell = grid.getCurrentCell();
		            if (!currentCell) return;
		            var ex = { record: currentCell[0], column: currentCell[1] };

		            oneditchange.call(this, ex);
		            e.preventDefault();
		        }
		    }, this);


		    var tv = parseInt(this.trueValue), fv = parseInt(this.falseValue);
		    if (!isNaN(tv)) this.trueValue = tv;
		    if (!isNaN(fv)) this.falseValue = fv;
		}
	}, config);

};
mini._Columns["checkboxcolumn"] = mini.CheckBoxColumn;

mini.ComboBoxColumn = function (config) {
    return mini.copyTo(
        {
            renderer: function (e) {
                var value = !mini.isNull(e.value) ? String(e.value) : "";
                var values = value.split(",");

                var valueField = "id", textField = "text";
                var valueMaps = {};

                var editor = e.column.editor;
                if (editor && editor.type == "combobox") {
                    var combo = this.__editor;
                    if (!combo) {

                        if (mini.isControl(editor)) {
                            combo = editor;
                        } else {
                            editor = mini.clone(editor);
                            combo = mini.create(editor);
                        }
                        this.__editor = combo;
                    }

                    valueField = combo.getValueField();
                    textField = combo.getTextField();

                    valueMaps = this._valueMaps;
                    if (!valueMaps) {
                        valueMaps = {};
                        var data = combo.getData();
                        for (var i = 0, l = data.length; i < l; i++) {
                            var o = data[i];
                            valueMaps[o[valueField]] = o;
                        }
                        this._valueMaps = valueMaps;
                    }
                }

                var texts = [];
                for (var i = 0, l = values.length; i < l; i++) {
                    var id = values[i];
                    var o = valueMaps[id];
                    if (o) {
                        var text = o[textField];
                        if (text === null || text === undefined) {
                            text = "";
                        }
                        texts.push(text);
                    }
                }
                return texts.join(',');
            }
        }, config);
};
mini._Columns["comboboxcolumn"] = mini.ComboBoxColumn;

