mini.DataBinding = function () {
    this._bindFields = [];
    this._bindForms = [];
    mini.DataBinding.superclass.constructor.call(this);
}

mini.extend(mini.DataBinding, mini.Component, {
    bindField: function (control, source, field, mode, convert) {
        control = mini.get(control);
        source = mini.get(source);
        if (!control || !source || !field) return;
        var bind = { control: control, source: source, field: field, convert: convert, mode: mode };
        this._bindFields.push(bind);

        source.on("currentchanged", this.__OnCurrentChanged, this);
        control.on("valuechanged", this.__OnValueChanged, this);
    },
    bindForm: function (form, source, mode, convert) {
        form = mini.byId(form);
        source = mini.get(source);
        if (!form || !source) return;

        var form = new mini.Form(form);
        var controls = form.getFields();
        for (var i = 0, l = controls.length; i < l; i++) {
            var control = controls[i];
            this.bindField(control, source, control.getName(), mode, convert);
        }
    },
    
    __OnCurrentChanged: function (e) {
        if (this._doSetting) return;
        this._doSetting = true;

        var source = e.sender;
        var record = e.record;

        
        for (var i = 0, l = this._bindFields.length; i < l; i++) {
            var bind = this._bindFields[i];
            if (bind.source != source) continue;

            var control = bind.control;
            var field = bind.field;
            if (control.setValue) {
                if (record) {
                    var value = record[field];
                    control.setValue(value);
                } else {
                    control.setValue("");
                }
            }

            if (control.setText && control.textName) {
                if (record) {
                    control.setText(record[control.textName]);
                } else {
                    control.setText("");
                }
            }
        }

        var me = this;
        setTimeout(function () {
            me._doSetting = false;
        }, 10);
    },
    __OnValueChanged: function (e) {

        if (this._doSetting) return;
        this._doSetting = true;

        var control = e.sender;
        var value = control.getValue();

     
        
        for (var i = 0, l = this._bindFields.length; i < l; i++) {
            var bind = this._bindFields[i];

            if (bind.control != control || bind.mode === false) continue;
            var source = bind.source;
            var current = source.getCurrent();
            if (!current) continue;

            var obj = {};
            obj[bind.field] = value;

            if (control.getText && control.textName) {
                obj[control.textName] = control.getText();
            }

            source.updateRow(current, obj);

        }

        var me = this;
        setTimeout(function () {
            me._doSetting = false;
        }, 10);
    }
});
mini.regClass(mini.DataBinding, "databinding");