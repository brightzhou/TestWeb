

mini.DatePicker = function () {
    mini.DatePicker.superclass.constructor.call(this);
}

mini.extend(mini.DatePicker, mini.PopupEdit, {
    format: "yyyy-MM-dd",


    maxDate: null,
    minDate: null,

    popupWidth: "",

    viewDate: new Date(),
    showTime: false,
    timeFormat: 'H:mm',

    showTodayButton: true,
    showClearButton: true,
    showOkButton: false,
   
    uiCls: "mini-datepicker",

    _getCalendar: function () {
        if (!mini.DatePicker._Calendar) {
            var calendar = mini.DatePicker._Calendar = new mini.Calendar();

            calendar.setStyle("border:0;");
        }
        return mini.DatePicker._Calendar;
    },

    _createPopup: function () {
        mini.DatePicker.superclass._createPopup.call(this);

        this._calendar = this._getCalendar();
    },
    destroy: function (removeEl) {
       //内存泄露问题优化 潘正锋 2013-06-09
        delete this._calendar;
        mini.DatePicker.superclass.destroy.call(this, removeEl);
    },
    showPopup: function () {
        var ex = { cancel: false };
        this.fire("beforeshowpopup", ex);
        if (ex.cancel == true) return;

        this._calendar.beginUpdate();
        this._calendar._allowLayout = false;
        if (this._calendar.el.parentNode != this.popup._contentEl) {
            this._calendar.render(this.popup._contentEl);
        }

        this._calendar.set({
            showTime: this.showTime,
            timeFormat: this.timeFormat,
            showClearButton: this.showClearButton,
            showTodayButton: this.showTodayButton,
            showOkButton: this.showOkButton
        });

        this._calendar.setValue(this.value);

        if (this.value) {
            this._calendar.setViewDate(this.value);
        } else {
            this._calendar.setViewDate(this.viewDate);
        }

        mini.DatePicker.superclass.showPopup.call(this);

        function doUpdate() {
            if (this._calendar._target) {
                var obj = this._calendar._target;
                this._calendar.un("timechanged", obj.__OnTimeChanged, obj);
                this._calendar.un("dateclick", obj.__OnDateClick, obj);
                this._calendar.un("drawdate", obj.__OnDrawDate, obj);
            }
            this._calendar.on("timechanged", this.__OnTimeChanged, this);
            this._calendar.on("dateclick", this.__OnDateClick, this);
            this._calendar.on("drawdate", this.__OnDrawDate, this);

            this._calendar.endUpdate();

            this._calendar._allowLayout = true;
            this._calendar.doLayout();

            this._calendar.focus();

            this._calendar._target = this;
        }

        var me = this;

        doUpdate.call(me);



    },
    hidePopup: function () {
        mini.DatePicker.superclass.hidePopup.call(this);

        this._calendar.un("timechanged", this.__OnTimeChanged, this);
        this._calendar.un("dateclick", this.__OnDateClick, this);
        this._calendar.un("drawdate", this.__OnDrawDate, this);

    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this._calendar.within(e)) return true;
        return false;
    },
    __OnPopupKeyDown: function (e) {
        if (e.keyCode == 13) {
            this.__OnDateClick();
        }
        if (e.keyCode == 27) {
            this.hidePopup();
            this.focus();
        }
    },
    __OnDrawDate: function (e) {
        var date = e.date;
        var maxDate = mini.parseDate(this.maxDate);
        var minDate = mini.parseDate(this.minDate);
        if (mini.isDate(maxDate)) {
            if (date.getTime() > maxDate.getTime()) {
                e.allowSelect = false;
            }
        }
        if (mini.isDate(minDate)) {
            if (date.getTime() < minDate.getTime()) {
                e.allowSelect = false;
            }
        }

        this.fire("drawdate", e);
    },
    __OnDateClick: function (e) {

        if (this.showOkButton && e.action != "ok") return;

        var date = this._calendar.getValue();
        var value = this.getFormValue();

        this.setValue(date);

        if (value !== this.getFormValue()) {
            this._OnValueChanged();
        }

        this.focus();

        this.hidePopup();
    },
    __OnTimeChanged: function (e) {
        if (this.showOkButton) return;
        var date = this._calendar.getValue();
        this.setValue(date);
        this._OnValueChanged();
    },
    setFormat: function (value) {
        if (typeof value != "string") return;
        if (this.format != value) {
            this.format = value;
            this._textEl.value = this._valueEl.value = this.getFormValue();
        }
    },
    getFormat: function () {
        return this.format;
    },
    setValue: function (value) {

        value = mini.parseDate(value);
        if (mini.isNull(value)) value = "";
        if (mini.isDate(value)) value = new Date(value.getTime());
        if (this.value != value) {
            this.value = value;
            this.text = this._textEl.value = this._valueEl.value = this.getFormValue();

        }
    },
    getValue: function () {
        if (!mini.isDate(this.value)) return "";
        return this.value;
    },
    getFormValue: function () {
        if (!mini.isDate(this.value)) return "";
        return mini.formatDate(this.value, this.format);
    },
    setViewDate: function (value) {
        value = mini.parseDate(value);
        if (!mini.isDate(value)) return;
        this.viewDate = value;
    },
    getViewDate: function () {
        return this._calendar.getViewDate();
    },
    setShowTime: function (value) {
        if (this.showTime != value) {
            this.showTime = value;

        }
    },
    getShowTime: function () {
        return this.showTime;
    },
    setTimeFormat: function (value) {
        if (this.timeFormat != value) {
            this.timeFormat = value;

        }
    },
    getTimeFormat: function () {
        return this.timeFormat;
    },
    setShowTodayButton: function (value) {
        this.showTodayButton = value;

    },
    getShowTodayButton: function () {
        return this.showTodayButton;
    },
    setShowClearButton: function (value) {
        this.showClearButton = value;

    },
    getShowClearButton: function () {
        return this.showClearButton;
    },
    setShowOkButton: function (value) {
        this.showOkButton = value;
    },
    getShowOkButton: function () {
        return this.showOkButton;
    },

    setMaxDate: function (value) {
        this.maxDate = value;
    },
    getMaxDate: function () {
        return this.maxDate;
    },
    setMinDate: function (value) {
        this.minDate = value;
    },
    getMinDate: function () {
        return this.minDate;
    },

    __OnInputTextChanged: function (e) {
        var v = this._textEl.value;

        var d = mini.parseDate(v);

        if (!d || isNaN(d) || d.getFullYear() == 1970) {
            d = null;
        }

        var value = this.getFormValue();

        this.setValue(d);
        if (d == null) this._textEl.value = "";









        if (value !== this.getFormValue()) {
            this._OnValueChanged();
        }

    },
    __OnInputKeyDown: function (e) {

        this.fire("keydown", { htmlEvent: e });
        if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
            return false;
        }

        if (e.keyCode == 9) {
            this.hidePopup();
            return;
        }

        if (this.isReadOnly()) return;

        switch (e.keyCode) {
            case 27:
                e.preventDefault();
                if (this.isShowPopup()) {
                    e.stopPropagation();
                }

                this.hidePopup();
                break;
            case 9:
            case 13:
                if (this.isShowPopup()) {
                    e.preventDefault();
                    e.stopPropagation();


                    this.hidePopup();

                } else {
                    this.__OnInputTextChanged(null);
                    var me = this;
                    setTimeout(function () {
                        me.fire("enter");
                    }, 10);
                }
                break;
            case 37:
                break;
            case 38:
                e.preventDefault();
                break;
            case 39:
                break;
            case 40:
                e.preventDefault();
                this.showPopup();
                break;
            default:
                break;
        }
    },

    getAttrs: function (el) {
        var attrs = mini.DatePicker.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["format", "viewDate", "timeFormat", "ondrawdate", "minDate", "maxDate"
            ]
        );
        mini._ParseBool(el, attrs,
            ["showTime", "showTodayButton", "showClearButton", "showOkButton"
            ]
        );

        return attrs;
    }
});

mini.regClass(mini.DatePicker, 'datepicker');
