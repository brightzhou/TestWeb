

mini.ListControl = function () {
    this.data = [];
    this._selecteds = [];
    mini.ListControl.superclass.constructor.call(this);
    this.doUpdate();
}
mini.extend(mini.ListControl, mini.ValidatorBase, {
    defaultValue: '',
    value: '',
    valueField: "id",
    textField: "text",
    delimiter: ',',

    data: null,
    url: "",

    _itemCls: "mini-list-item",
    _itemHoverCls: "mini-list-item-hover",
    _itemSelectedCls: "mini-list-item-selected",

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

        mini.ListControl.superclass.set.call(this, kv);

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

    uiCls: "mini-list",
    _create: function () {

    },
    _initEvents: function () {
        mini._BindEvents(function () {
            mini_onOne(this.el, 'click', this.__OnClick, this);
            mini_onOne(this.el, 'dblclick', this.__OnDblClick, this);

            mini_onOne(this.el, 'mousedown', this.__OnMouseDown, this);
            mini_onOne(this.el, 'mouseup', this.__OnMouseUp, this);
            mini_onOne(this.el, 'mousemove', this.__OnMouseMove, this);
            mini_onOne(this.el, 'mouseover', this.__OnMouseOver, this);
            mini_onOne(this.el, 'mouseout', this.__OnMouseOut, this);

            mini_onOne(this.el, 'keydown', this.__OnKeyDown, this);
            mini_onOne(this.el, 'keyup', this.__OnKeyUp, this);

            mini_onOne(this.el, 'contextmenu', this.__OnContextMenu, this);














        }, this);
    },
    destroy: function (removeEl) {
        if (this.el) {
            this.el.onclick = null;
            this.el.ondblclick = null;
            this.el.onmousedown = null;
            this.el.onmouseup = null;
            this.el.onmousemove = null;
            this.el.onmouseover = null;
            this.el.onmouseout = null;
            this.el.onkeydown = null;
            this.el.onkeyup = null;
            this.el.oncontextmenu = null;
        }
        mini.ListControl.superclass.destroy.call(this, removeEl);
    },

    name: "",
    setName: function (value) {
        this.name = value;
        if (this._valueEl) mini.setAttr(this._valueEl, "name", this.name);
    },

    getItemByEvent: function (event) {
        var domItem = mini.findParent(event.target, this._itemCls);
        if (domItem) {

            var index = parseInt(mini.getAttr(domItem, "index"));

            return this.data[index];
        }
    },
    addItemCls: function (item, cls) {
        var itemEl = this.getItemEl(item);
        if (itemEl) mini.addClass(itemEl, cls);
    },
    removeItemCls: function (item, cls) {
        var itemEl = this.getItemEl(item);
        if (itemEl) mini.removeClass(itemEl, cls);
    },
    getItemEl: function (item) {
        item = this.getItem(item);
        var index = this.data.indexOf(item);
        var id = this._createItemId(index);
        return document.getElementById(id);
    },
    _focusItem: function (item, view) {

        item = this.getItem(item);
        if (!item) return;
        var dom = this.getItemEl(item);
        if (view && dom) {
            this.scrollIntoView(item);
        }
        if (this._focusedItem == item) {
            if (dom) mini.addClass(dom, this._itemHoverCls);
            return;
        }
        this._blurItem();
        this._focusedItem = item;
        if (dom) mini.addClass(dom, this._itemHoverCls);


    },
    _blurItem: function () {
        if (!this._focusedItem) return;

        try {
            var dom = this.getItemEl(this._focusedItem);
            if (dom) {
                mini.removeClass(dom, this._itemHoverCls);
            }
        } catch (e) { };
        this._focusedItem = null;

    },
    getFocusedItem: function () {
        return this._focusedItem;
    },
    getFocusedIndex: function () {
        return this.data.indexOf(this._focusedItem);
    },
    _scrollViewEl: null,
    scrollIntoView: function (item) {
        try {
            var itemEl = this.getItemEl(item);
            var _scrollViewEl = this._scrollViewEl || this.el;
            mini.scrollIntoView(itemEl, _scrollViewEl, false);
        } catch (e) { }
    },

    getItem: function (item) {
        if (typeof item == "object") return item;
        if (typeof item == "number") return this.data[item];
        return this.findItems(item)[0];
    },
    getCount: function () {
        return this.data.length;
    },
    indexOf: function (item) {
        return this.data.indexOf(item);
    },
    getAt: function (index) {
        return this.data[index];
    },
    updateItem: function (item, options) {
        item = this.getItem(item);
        if (!item) return;
        mini.copyTo(item, options);
        this.doUpdate();
    },
    load: function (data) {
        if (typeof data == "string") this.setUrl(data);
        else this.setData(data);
    },
    loadData: function (data) {
        this.setData(data);
    },
    setData: function (data) {
        if (typeof data == "string") {
            data = eval(data);
        }
        if (!mini.isArray(data)) data = [];
        this.data = data;






        this.doUpdate();

        if (this.value != "") {
            this.deselectAll();
            var records = this.findItems(this.value);
            this.selects(records);
        }
    },
    getData: function () {
        return this.data.clone();
    },
    setUrl: function (url) {

        this.url = url;
        this._doLoad({});

    },
    getUrl: function () {
        return this.url;
    },
    _doLoad: function (params) {

        try {
            var url = eval(this.url);
            if (url != undefined) {
                this.url = url;
            }
        } catch (e) { }

        var e = {
            url: this.url,
            async: false,
            type: "get",
            params: params,
            data: params,
            cache: false,
            cancel: false
        };
        this.fire("beforeload", e);
        if (e.data != e.params && e.params != params) {
            e.data = e.params;
        }
        if (e.cancel == true) return;

        var sf = this;
        var url = e.url;
        mini.copyTo(e, {
            success: function (text) {
                var data = null;
                try {
                    data = mini.decode(text);
                } catch (ex) {
                    data = []
                    if (mini_debugger == true) {
                        alert(url + "\njson is error.");
                    }
                }
                if (sf.dataField) {
                    data = mini._getMap(sf.dataField, data);
                }
                if (!data) data = [];
                var ex = { data: data, cancel: false }
                sf.fire("preload", ex);
                if (ex.cancel == true) return;

                sf.setData(ex.data);

                sf.fire("load");

                setTimeout(function () {
                    sf.doLayout();
                }, 100);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                var e = {
                    xmlHttp: jqXHR,
                    errorMsg: jqXHR.responseText,
                    errorCode: jqXHR.status
                };
                if (mini_debugger == true) {
                    alert(url + "\n" + e.errorCode + "\n" + e.errorMsg);
                }

                sf.fire("loaderror", e);
            }
        });

        this._ajaxer = mini.ajax(e);
    },
    setValue: function (value) {
        if (mini.isNull(value)) value = "";
        if (this.value !== value) {

            this.deselectAll();

            this.value = value;
            if (this._valueEl) this._valueEl.value = value;

            var records = this.findItems(this.value);
            this.selects(records);
        }
    },
    getValue: function () {
        return this.value;
    },
    getFormValue: function () {
        return this.value;
    },
    setValueField: function (valueField) {
        this.valueField = valueField;
    },
    getValueField: function () {
        return this.valueField;
    },
    setTextField: function (value) {
        this.textField = value;
    },
    getTextField: function () {
        return this.textField;
    },

    getItemValue: function (item) {
        return String(mini._getMap(this.valueField, item));
    },
    getItemText: function (item) {
        var t = mini._getMap(this.textField, item);
        return mini.isNull(t) ? '' : String(t);
    },
    getValueAndText: function (records) {
        if (mini.isNull(records)) records = [];
        if (!mini.isArray(records)) {
            records = this.findItems(records);
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
    findItems: function (value) {
        if (mini.isNull(value) || value === "") return [];
        var values = String(value).split(this.delimiter);

        var data = this.data;
        var valueRecords = {};
        for (var j = 0, k = data.length; j < k; j++) {
            var record = data[j];
            var v = record[this.valueField];
            valueRecords[v] = record;
        }

        var records = [];
        for (var i = 0, l = values.length; i < l; i++) {
            var v = values[i];
            var record = valueRecords[v];
            if (record) {
                records.push(record);
            }
        }
        return records;
    },


    removeAll: function () {
        var items = this.getData();
        this.removeItems(items);
    },
    addItems: function (items, index) {
        if (!mini.isArray(items)) return;
        if (mini.isNull(index)) index = this.data.length;
        this.data.insertRange(index, items);
        this.doUpdate();
    },
    addItem: function (item, index) {
        if (!item) return;
        if (this.data.indexOf(item) != -1) return;
        if (mini.isNull(index)) index = this.data.length;
        this.data.insert(index, item);
        this.doUpdate();
    },
    removeItems: function (items) {
        if (!mini.isArray(items)) return;
        this.data.removeRange(items);

        this._checkSelecteds();
        this.doUpdate();
    },
    removeItem: function (item) {
        var index = this.data.indexOf(item);
        if (index != -1) {
            this.data.removeAt(index);
            this._checkSelecteds();
            this.doUpdate();
        }
    },
    moveItem: function (item, index) {
        if (!item || !mini.isNumber(index)) return;


        if (index < 0) index = 0;
        if (index > this.data.length) index = this.data.length;
        this.data.remove(item);

        this.data.insert(index, item);
        this.doUpdate();
    },


    _selected: null,
    _selecteds: [],
    multiSelect: false,
    _checkSelecteds: function () {
        for (var i = this._selecteds.length - 1; i >= 0; i--) {
            var record = this._selecteds[i];
            if (this.data.indexOf(record) == -1) {
                this._selecteds.removeAt(i);
            }
        }
        var vts = this.getValueAndText(this._selecteds);
        this.value = vts[0];
        if (this._valueEl) this._valueEl.value = this.value;
    },
    setMultiSelect: function (value) {
        this.multiSelect = value;
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    isSelected: function (record) {
        if (!record) return false;
        return this._selecteds.indexOf(record) != -1;
    },
    getSelecteds: function () {
        var arr = this._selecteds.clone();
        var me = this;
        mini.sort(arr, function (a, b) {
            var index1 = me.indexOf(a);
            var index2 = me.indexOf(b);
            if (index1 > index2) return 1;
            if (index1 < index2) return -1;
            return 0;
        });
        return arr;
    },
    setSelected: function (record) {
        if (record) {
            this._selected = record;
            this.select(record);
        }
    },
    getSelected: function () {
        return this._selected;
    },
    select: function (record) {
        record = this.getItem(record);
        if (!record) return;
        if (this.isSelected(record)) return;
        this.selects([record]);
    },
    deselect: function (record) {
        record = this.getItem(record);
        if (!record) return;
        if (!this.isSelected(record)) return;
        this.deselects([record]);
    },
    selectAll: function () {
        var data = this.data.clone();
        this.selects(data);
    },
    deselectAll: function () {
        this.deselects(this._selecteds);
    },
    clearSelect: function () {
        this.deselectAll();
    },
    selects: function (records) {
        if (!records || records.length == 0) return;
        records = records.clone();
        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i];
            if (!this.isSelected(record)) {
                this._selecteds.push(record);
            }
        }
        var me = this;
        setTimeout(function () {
            me._doSelects();
        }, 1);
    },
    deselects: function (records) {
        if (!records || records.length == 0) return;
        records = records.clone();
        for (var i = records.length - 1; i >= 0; i--) {
            var record = records[i];
            if (this.isSelected(record)) {
                this._selecteds.remove(record);
            }
        }

        var me = this;
        setTimeout(function () {
            me._doSelects();
        }, 1);
    },
    _doSelects: function () {
        var vts = this.getValueAndText(this._selecteds);
        this.value = vts[0];
        if (this._valueEl) this._valueEl.value = this.value;

        for (var i = 0, l = this.data.length; i < l; i++) {
            var record = this.data[i];
            var select = this.isSelected(record);
            if (select) {
                this.addItemCls(record, this._itemSelectedCls);
            } else {
                this.removeItemCls(record, this._itemSelectedCls);
            }
            var index = this.data.indexOf(record);
            var id = this._createCheckId(index);
            var checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = !!select;
        }
    },
    _OnSelectionChanged: function (records, select) {
        var vts = this.getValueAndText(this._selecteds);
        this.value = vts[0];
        if (this._valueEl) this._valueEl.value = this.value;

        var e = {
            selecteds: this.getSelecteds(),
            selected: this.getSelected(),
            value: this.getValue()
        };
        this.fire("SelectionChanged", e);
    },
    _createCheckId: function (index) {
        return this.uid + "$ck$" + index;
    },
    _createItemId: function (index) {
        return this.uid + "$" + index;
    },


    __OnClick: function (e) {
        this._fireEvent(e, 'Click');
    },
    __OnDblClick: function (e) {
        this._fireEvent(e, 'Dblclick');
    },
    __OnMouseDown: function (e) {
        this._fireEvent(e, 'MouseDown');
    },
    __OnMouseUp: function (e) {
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
        if (!this.enabled) return;


        var item = this.getItemByEvent(e);
        if (!item) return;
        var fn = this['_OnItem' + name];
        if (fn) {
            fn.call(this, item, e);
        } else {
            var eve = {
                item: item,
                htmlEvent: e
            };
            this.fire("item" + name, eve);
        }
    },
    _OnItemClick: function (item, e) {

        if (this.isReadOnly() || this.enabled == false || item.enabled === false) {
            e.preventDefault();
            return;
        }

        var value = this.getValue();

        if (this.multiSelect) {
            if (this.isSelected(item)) {
                this.deselect(item);
                if (this._selected == item) {
                    this._selected = null;
                }
            } else {
                this.select(item);
                this._selected = item;
            }
            this._OnSelectionChanged();
        } else {
            if (!this.isSelected(item)) {
                this.deselectAll();
                this.select(item);
                this._selected = item;
                this._OnSelectionChanged();
            }
        }

        if (value != this.getValue()) {
            this._OnValueChanged();
        }

        var e = {
            item: item,
            htmlEvent: e
        };
        this.fire("itemclick", e);
    },
    _blurOnOut: true,
    _OnItemMouseOut: function (item, e) {
        mini.repaint(this.el);
        if (!this.enabled) return;
        if (this._blurOnOut) {
            this._blurItem();
        }
        var e = {
            item: item,
            htmlEvent: e
        };
        this.fire("itemmouseout", e);
    },
    _OnItemMouseMove: function (item, e) {
        mini.repaint(this.el);
        if (!this.enabled || item.enabled === false) return;

        this._focusItem(item);
        var e = {
            item: item,
            htmlEvent: e
        };
        this.fire("itemmousemove", e);
    },
    onItemClick: function (fn, scope) {
        this.on("itemclick", fn, scope);
    },
    onItemMouseDown: function (fn, scope) {
        this.on("itemmousedown", fn, scope);
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
    onPreLoad: function (fn, scope) {
        this.on("preload", fn, scope);
    },

    getAttrs: function (el) {
        var attrs = mini.ListControl.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["url", "data", "value", "textField", "valueField",
            "onitemclick", "onitemmousemove", "onselectionchanged", "onitemdblclick",
            "onbeforeload", "onload", "onloaderror", "ondataload"
            ]
        );
        mini._ParseBool(el, attrs,
            ["multiSelect"
            ]
        );

        var valueField = attrs.valueField || this.valueField;
        var textField = attrs.textField || this.textField;
        if (el.nodeName.toLowerCase() == "select") {
            var data = [];
            for (var i = 0, l = el.length; i < l; i++) {
                var op = el.options[i];
                var o = {};
                o[textField] = op.text;
                o[valueField] = op.value;

                data.push(o);
            }
            if (data.length > 0) {
                attrs.data = data;
            }
        }

        return attrs;
    }
});
