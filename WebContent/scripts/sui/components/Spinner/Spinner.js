
mini.Spinner = function () {
    mini.Spinner.superclass.constructor.call(this);
    this.setValue(this.minValue);
}
mini.extend(mini.Spinner, mini.ButtonEdit, {
    value: 0,
    minValue: 0,
    maxValue: 100,
    increment: 1,
    decimalPlaces: 0,   
    changeOnMousewheel: true,
    allowLimitValue: true,

    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var value = kv.value;
        delete kv.value;

        mini.Spinner.superclass.set.call(this, kv);

        if (!mini.isNull(value)) {
            this.setValue(value);
        }

        return this;
    },

    uiCls: "mini-spinner",
    _getButtonHtml: function () {
        var hover = 'onmouseover="mini.addClass(this, \'' + this._buttonHoverCls + '\');" '
                        + 'onmouseout="mini.removeClass(this, \'' + this._buttonHoverCls + '\');"';
        return '<span class="mini-buttonedit-button" ' + hover + '><span class="mini-buttonedit-up"><span></span></span><span class="mini-buttonedit-down"><span></span></span></span>';
    },
    
    _initEvents: function () {
        mini.Spinner.superclass._initEvents.call(this);

        mini._BindEvents(function () {


            

            this.on("buttonmousedown", this.__OnButtonMouseDown, this);
            mini.on(this.el, "mousewheel", this.__OnMousewheel, this);
        }, this);

    },

    _ValueLimit: function () {
        if (this.allowLimitValue == false) return;

        if (this.minValue > this.maxValue) {
            this.maxValue = this.minValue + 100;
        }
        if (this.value < this.minValue) {
            this.setValue(this.minValue);
        }
        if (this.value > this.maxValue) {
            this.setValue(this.maxValue);
        }
    },
    getFormValue: function () {
        var v = this.value;
        v = parseFloat(v);
        if (isNaN(v)) v = 0;
        var s = String(v).split(".");
        var s1 = s[0], s2 = s[1];
        if (!s2) s2 = "";
        if (this.decimalPlaces > 0) {
            for (var i = s2.length, l = this.decimalPlaces; i < l; i++) {
                s2 += "0";
            }
            s2 = "." + s2;
        }
        return s1 + s2;
    },

    setValue: function (value) {
        value = parseFloat(value);
        if (isNaN(value)) value = this.defaultValue;
        value = parseFloat(value);
        if (isNaN(value)) value = this.minValue;
        value = parseFloat(value.toFixed(this.decimalPlaces));
        if (this.value != value) {
            this.value = value;
            this._ValueLimit();
            this._valueEl.value = this.value;
            this.text = this._textEl.value = this.getFormValue();
        } else {
            this.text = this._textEl.value = this.getFormValue();
        }
    },

    setMaxValue: function (value) {
        value = parseFloat(value);
        if (isNaN(value)) return;
        value = parseFloat(value.toFixed(this.decimalPlaces));
        if (this.maxValue != value) {
            this.maxValue = value;
            this._ValueLimit();
        }
    },
    getMaxValue: function (value) {
        return this.maxValue;
    },
    setMinValue: function (value) {
        value = parseFloat(value);
        if (isNaN(value)) return;
        value = parseFloat(value.toFixed(this.decimalPlaces));
        if (this.minValue != value) {
            this.minValue = value;
            this._ValueLimit();
        }
    },
    getMinValue: function (value) {
        return this.minValue;
    },
    setIncrement: function (value) {
        value = parseFloat(value);
        if (isNaN(value)) return;
        if (this.increment != value) {
            this.increment = value;
        }
    },
    getIncrement: function (value) {
        return this.increment;
    },
    setDecimalPlaces: function (value) {
        value = parseInt(value);
        if (isNaN(value) || value < 0) return;
        this.decimalPlaces = value;
    },
    getDecimalPlaces: function (value) {
        return this.decimalPlaces;
    },
    setChangeOnMousewheel: function (value) {
        this.changeOnMousewheel = value;
    },
    getChangeOnMousewheel: function (value) {
        return this.changeOnMousewheel;
    },
    setAllowLimitValue: function (value) {
        this.allowLimitValue = value;
    },
    getAllowLimitValue: function (value) {
        return this.allowLimitValue;
    },

    _SpinTimer: null,
    _StartSpin: function (Increment, time, count) {
        this._StopSpin();

        this.setValue(this.value + Increment);
        
        

        var sf = this;
        var sourceCount = count;
        var now = new Date();
        this._SpinTimer = setInterval(function () {

            sf.setValue(sf.value + Increment);
            sf._OnValueChanged();

            count--;
            if (count == 0 && time > 50) {
                sf._StartSpin(Increment, time - 100, sourceCount + 3);

            }

            
            var now2 = new Date();
            if (now2 - now > 500) sf._StopSpin();
            now = now2;
        }, time);
        mini.on(document, "mouseup", this._OnDocumentMouseUp, this);
        
    },
    _StopSpin: function () {
        clearInterval(this._SpinTimer);
        this._SpinTimer = null;
    },
    __OnButtonMouseDown: function (e) {
        this._DownValue = this.getValue();

        this.__OnInputTextChanged();
        if (e.spinType == "up") {
            this._StartSpin(this.increment, 230, 2);
        } else {
            this._StartSpin(-this.increment, 230, 2);
        }
    },
    __OnInputKeyDown: function (e) {
        mini.Spinner.superclass.__OnInputKeyDown.call(this, e);

        var KEY = mini.Keyboard;
        
        switch (e.keyCode) {
            case KEY.Top:
                this.setValue(this.value + this.increment);
                this._OnValueChanged();
                break;
            case KEY.Bottom:
                this.setValue(this.value - this.increment);
                this._OnValueChanged();
                break;
        }
    },
    __OnMousewheel: function (e) {
        if (this.isReadOnly()) return;
        if (this.changeOnMousewheel == false) return;

        var wheelDelta = e.wheelDelta || e.originalEvent.wheelDelta;
        if (mini.isNull(wheelDelta)) wheelDelta = -e.detail * 24;
        var increment = this.increment;
        if (wheelDelta < 0) increment = -increment;
        this.setValue(this.value + increment);
        this._OnValueChanged();



        return false;
    },

    _OnDocumentMouseUp: function (e) {
        this._StopSpin();
        mini.un(document, "mouseup", this._OnDocumentMouseUp, this);

        if (this._DownValue != this.getValue()) {
            this._OnValueChanged();
        }
    },
    __OnInputTextChanged: function (e) {
        var _value = this.getValue();

        var value = parseFloat(this._textEl.value);
        this.setValue(value);
        
        
        
        
        
        
        
        
        

        if (_value != this.getValue()) {
            this._OnValueChanged();
        }
    },
    
    getAttrs: function (el) {
        var attrs = mini.Spinner.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["minValue", "maxValue", "increment", "decimalPlaces", "changeOnMousewheel"
            ]
        );
        mini._ParseBool(el, attrs,
            ["allowLimitValue"
            ]
        );

        return attrs;
    }


});
mini.regClass(mini.Spinner, 'spinner');