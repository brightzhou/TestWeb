
mini.Calendar = function () {
    this.viewDate = new Date();
    this._selectedDates = [];
    mini.Calendar.superclass.constructor.call(this);
}
mini.extend(mini.Calendar, mini.Control, {
    width: 220,
    height: 160,

    _clearBorder: false,

    viewDate: null,
    _selectedDate: "",
    _selectedDates: [],
    multiSelect: false,

    firstDayOfWeek: 0,
    todayText: "Today",
    clearText: "Clear",
    okText: "OK",
    cancelText: "Cancel",
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    format: "MMM, yyyy",

    timeFormat: 'H:mm',

    showTime: false,
    currentTime: true,

    rows: 1,
    columns: 1,

    headerCls: "",
    bodyCls: "",
    footerCls: "",

    _todayCls: "mini-calendar-today",
    _weekendCls: "mini-calendar-weekend",
    _otherMonthCls: "mini-calendar-othermonth",
    _selectedDateCls: "mini-calendar-selected",

    showHeader: true,
    showFooter: true,
    showWeekNumber: false,
    showDaysHeader: true,
    showMonthButtons: true,
    showYearButtons: true,
    showTodayButton: true,
    showClearButton: true,
    showOkButton: false,

    isWeekend: function (date) {
        var day = date.getDay();
        return day == 0 || day == 6;
    },
    getFirstDateOfMonth: function (date) {

        var date = new Date(date.getFullYear(), date.getMonth(), 1);

        return mini.getWeekStartDate(date, this.firstDayOfWeek);
    },
    getShortWeek: function (week) {
        return this.daysShort[week];
    },

    uiCls: "mini-calendar",
    _create: function () {
        var s = '<tr style="width:100%;"><td style="width:100%;"></td></tr>';
        s += '<tr ><td><div class="mini-calendar-footer">'
                    + '<span style="display:inline-block;"><input name="time" class="mini-timespinner" style="width:80px" format="' + this.timeFormat + '"/>'
                    + '<span class="mini-calendar-footerSpace"></span></span>'
                    + '<span class="mini-calendar-tadayButton">' + this.todayText + '</span>'
                    + '<span class="mini-calendar-footerSpace"></span>'
                    + '<span class="mini-calendar-clearButton">' + this.clearText + '</span>'
                    + '<span class="mini-calendar-okButton">' + this.okText + '</span>'
                    + '<a href="#" class="mini-calendar-focus" style="position:absolute;left:-10px;top:-10px;width:0px;height:0px;outline:none" hideFocus></a>'
                    + '</div></td></tr>';

        var html = '<table class="mini-calendar" cellpadding="0" cellspacing="0">' + s + '</table>';

        var d = document.createElement("div");
        d.innerHTML = html;
        this.el = d.firstChild;

        var trs = this.el.getElementsByTagName("tr");
        var tds = this.el.getElementsByTagName("td");

        this._innerEl = tds[0];
        this._footerEl = mini.byClass("mini-calendar-footer", this.el);

        this.timeWrapEl = this._footerEl.childNodes[0];
        this.todayButtonEl = this._footerEl.childNodes[1];
        this.footerSpaceEl = this._footerEl.childNodes[2];
        this.closeButtonEl = this._footerEl.childNodes[3];
        this.okButtonEl = this._footerEl.childNodes[4];

        this._focusEl = this._footerEl.lastChild;

        mini.parse(this._footerEl);
        this.timeSpinner = mini.getbyName('time', this.el);
        this.doUpdate();
    },
    focus: function () {
        try {
            this._focusEl.focus();
        } catch (e) { }
    },
    destroy: function (removeEl) {
        this._innerEl = this._footerEl = this.timeWrapEl = this.todayButtonEl = this.footerSpaceEl = this.closeButtonEl = null;

        mini.Calendar.superclass.destroy.call(this, removeEl);
    },
    _initEvents: function () {
        if (this.timeSpinner) this.timeSpinner.on("valuechanged", this.__OnTimeChanged, this);
        mini._BindEvents(function () {





            mini.on(this.el, "click", this.__OnClick, this);
            mini.on(this.el, "mousedown", this.__OnMouseDown, this);
            mini.on(this.el, "keydown", this.__OnKeyDown, this);

        }, this);
    },
    getDateEl: function (date) {
        if (!date) return null;
        var id = this.uid + "$" + mini.clearTime(date).getTime();
        return document.getElementById(id);
    },
    within: function (e) {
        if (mini.isAncestor(this.el, e.target)) return true;
        if (this.menuEl && mini.isAncestor(this.menuEl, e.target)) return true;
        return false;
    },





















































    setShowHeader: function (value) {
        this.showHeader = value;
        this.doUpdate();
    },
    getShowHeader: function () {
        return this.showHeader;
    },
    setShowFooter: function (value) {
        this.showFooter = value;
        this.doUpdate();
    },
    getShowFooter: function () {
        return this.showFooter;
    },
    setShowWeekNumber: function (value) {
        this.showWeekNumber = value;
        this.doUpdate();
    },
    getShowWeekNumber: function () {
        return this.showWeekNumber;
    },
    setShowDaysHeader: function (value) {
        this.showDaysHeader = value;
        this.doUpdate();
    },
    getShowDaysHeader: function () {
        return this.showDaysHeader;
    },
    setShowMonthButtons: function (value) {
        this.showMonthButtons = value;
        this.doUpdate();
    },
    getShowMonthButtons: function () {
        return this.showMonthButtons;
    },
    setShowYearButtons: function (value) {
        this.showYearButtons = value;
        this.doUpdate();
    },
    getShowYearButtons: function () {
        return this.showYearButtons;
    },
    setShowTodayButton: function (value) {
        this.showTodayButton = value;
        this.todayButtonEl.style.display = this.showTodayButton ? "" : "none";
        this.doUpdate();
    },
    getShowTodayButton: function () {
        return this.showTodayButton;
    },
    setShowClearButton: function (value) {
        this.showClearButton = value;
        this.closeButtonEl.style.display = this.showClearButton ? "" : "none";
        this.doUpdate();
    },
    getShowClearButton: function () {
        return this.showClearButton;
    },
    setShowOkButton: function (value) {
        this.showOkButton = value;
        this.okButtonEl.style.display = this.showOkButton ? "" : "none";
        this.doUpdate();
    },
    getShowOkButton: function () {
        return this.showOkButton;
    },

    setViewDate: function (value) {
        value = mini.parseDate(value);
        if (!value) value = new Date();
        if (mini.isDate(value)) value = new Date(value.getTime());
        this.viewDate = value;
        this.doUpdate();
    },
    getViewDate: function () {
        return this.viewDate;
    },
    setSelectedDate: function (value) {
        value = mini.parseDate(value);
        if (!mini.isDate(value)) value = "";
        else value = new Date(value.getTime());

        var dateEl = this.getDateEl(this._selectedDate);
        if (dateEl) mini.removeClass(dateEl, this._selectedDateCls);


        this._selectedDate = value;
        if (this._selectedDate) this._selectedDate = mini.cloneDate(this._selectedDate);

        var dateEl = this.getDateEl(this._selectedDate);
        if (dateEl) mini.addClass(dateEl, this._selectedDateCls);

        this.fire("datechanged");

    },
    setSelectedDates: function (value) {
        if (!mini.isArray(value)) value = [];
        this._selectedDates = value;
        this.doUpdate();
    },
    getSelectedDate: function () {
        return this._selectedDate ? this._selectedDate : "";
    },
    setTime: function (time) {
        this.timeSpinner.setValue(time);
    },
    getTime: function () {
        return this.timeSpinner.getFormValue();
    },
    setValue: function (value) {
        this.setSelectedDate(value);
        if (!value) {
            value = new Date();
        }
        this.setTime(value);
    },
    getValue: function () {
        var d = this._selectedDate;
        if (d) {
            d = mini.clearTime(d);
            if (this.showTime) {
                var d2 = this.timeSpinner.getValue();
                d.setHours(d2.getHours());
                d.setMinutes(d2.getMinutes());
                d.setSeconds(d2.getSeconds());
            }
        }
        return d ? d : "";
    },
    getFormValue: function () {
        var d = this.getValue();
        if (d) return mini.formatDate(d, 'yyyy-MM-dd HH:mm:ss');
        return "";
    },
    isSelectedDate: function (date) {
        if (!date || !this._selectedDate) return false;
        return mini.clearTime(date).getTime()
                == mini.clearTime(this._selectedDate).getTime();
    },
    setMultiSelect: function (value) {
        this.multiSelect = value;
        this.doUpdate();
    },
    getMultiSelect: function () {
        return this.multiSelect;
    },
    setRows: function (value) {
        if (isNaN(value)) return;
        if (value < 1) value = 1;
        this.rows = value;
        this.doUpdate();
    },
    getRows: function () {
        return this.rows;
    },
    setColumns: function (value) {
        if (isNaN(value)) return;
        if (value < 1) value = 1;
        this.columns = value;
        this.doUpdate();
    },
    getColumns: function () {
        return this.columns;
    },
    setShowTime: function (value) {
        if (this.showTime != value) {
            this.showTime = value;
            this.timeWrapEl.style.display = this.showTime ? '' : "none";
            this.doLayout();
        }
    },
    getShowTime: function () {
        return this.showTime;
    },
    setTimeFormat: function (value) {
        if (this.timeFormat != value) {

            this.timeSpinner.setFormat(value);
            this.timeFormat = this.timeSpinner.format;
        }
    },
    getTimeFormat: function () {
        return this.timeFormat;
    },
    doLayout: function () {

        if (!this.canLayout()) return;

        this.timeWrapEl.style.display = this.showTime ? '' : "none";
        this.todayButtonEl.style.display = this.showTodayButton ? "" : "none";
        this.closeButtonEl.style.display = this.showClearButton ? "" : "none";

        this.okButtonEl.style.display = this.showOkButton ? "" : "none";
        this.footerSpaceEl.style.display = (this.showClearButton && this.showTodayButton) ? "" : "none";

        this._footerEl.style.display = this.showFooter ? "" : "none";

        var views = this._innerEl.firstChild;

        var autoHeight = this.isAutoHeight();
        if (!autoHeight) {

            views.parentNode.style.height = "100px";
            h = jQuery(this.el).height();


            h -= jQuery(this._footerEl).outerHeight()

            views.parentNode.style.height = h + "px";
        } else {
            views.parentNode.style.height = "";
        }

        mini.layout(this._footerEl);
    },
    doUpdate: function () {
        if (!this._allowUpdate) return;

        var viewDate = new Date(this.viewDate.getTime());
        var isOne = this.rows == 1 && this.columns == 1;
        var h = 100 / this.rows;
        var s = '<table class="mini-calendar-views" border="0" cellpadding="0" cellspacing="0">';
        for (var i = 0, l = this.rows; i < l; i++) {
            s += '<tr >';
            for (var j = 0, k = this.columns; j < k; j++) {
                s += '<td style="height:' + h + '%">';

                s += this._CreateView(viewDate, i, j);

                s += '</td>';

                viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
            }
            s += '</tr>';
        }

        s += '</table>';
        this._innerEl.innerHTML = s;

        var el = this.el;
        setTimeout(function () {
            mini.repaint(el);
        }, 100);

        this.doLayout();
    },
    _CreateView: function (viewDate, row, column) {
        var month = viewDate.getMonth();
        var date = this.getFirstDateOfMonth(viewDate);
        var firstDateOfWeek = new Date(date.getTime());
        var todayTime = mini.clearTime(new Date()).getTime();
        var selectedTime = this.value ? mini.clearTime(this.value).getTime() : -1;

        var multiView = this.rows > 1 || this.columns > 1;

        var s = '';
        s += '<table class="mini-calendar-view" border="0" cellpadding="0" cellspacing="0">';

        if (this.showHeader) {
            s += '<tr ><td colSpan="10" class="mini-calendar-header"><div class="mini-calendar-headerInner">';
            if (row == 0 && column == 0) {
                s += '<div class="mini-calendar-prev">';
                if (this.showYearButtons) s += '<span class="mini-calendar-yearPrev"></span>';
                if (this.showMonthButtons) s += '<span class="mini-calendar-monthPrev"></span>';
                s += '</div>';
            }
            if (row == 0 && column == this.columns - 1) {
                s += '<div class="mini-calendar-next">';
                if (this.showMonthButtons) s += '<span class="mini-calendar-monthNext"></span>';
                if (this.showYearButtons) s += '<span class="mini-calendar-yearNext"></span>';
                s += '</div>';
            }
            s += '<span class="mini-calendar-title">' + mini.formatDate(viewDate, this.format); +'</span>';
            s += '</div></td></tr>';
        }


        if (this.showDaysHeader) {
            s += '<tr class="mini-calendar-daysheader"><td class="mini-calendar-space"></td>';
            if (this.showWeekNumber) {
                s += '<td sclass="mini-calendar-weeknumber"></td>';
            }

            for (var j = this.firstDayOfWeek, k = j + 7; j < k; j++) {
                var name = this.getShortWeek(j);
                s += '<td yAlign="middle">';
                s += name;
                s += '</td>';
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            s += '<td class="mini-calendar-space"></td></tr>';
        }


        date = firstDateOfWeek;
        for (var i = 0; i <= 5; i++) {
            s += '<tr class="mini-calendar-days"><td class="mini-calendar-space"></td>';
            if (this.showWeekNumber) {
                var num = mini.getWeek(date.getFullYear(), date.getMonth() + 1, date.getDate());
                if (String(num).length == 1) num = "0" + num;
                s += '<td class="mini-calendar-weeknumber" yAlign="middle">' + num + '</td>';
            }
            for (var j = this.firstDayOfWeek, k = j + 7; j < k; j++) {
                var weekend = this.isWeekend(date);
                var clearTime = mini.clearTime(date).getTime();
                var isToday = clearTime == todayTime;
                var isSelected = this.isSelectedDate(date);

                if (month != date.getMonth() && multiView) {
                    clearTime = -1;
                }

                var e = this._OnDrawDate(date);

                s += '<td yAlign="middle" id="';
                s += this.uid + "$" + clearTime;
                s += '" class="mini-calendar-date ';
                if (weekend) {
                    s += ' mini-calendar-weekend '
                }
                if (e.allowSelect == false) {
                    s += ' mini-calendar-disabled '
                }

                if (month != date.getMonth() && multiView) {
                } else {
                    if (isSelected) {
                        s += ' ' + this._selectedDateCls + ' ';
                    }
                    if (isToday) {
                        s += ' mini-calendar-today '
                    }
                }
                if (month != date.getMonth()) {
                    s += ' mini-calendar-othermonth ';
                }
                s += '">';

                if (month != date.getMonth() && multiView) {
                } else {

                    s += e.dateHtml;
                }
                s += '</td>';

                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            s += '<td class="mini-calendar-space"></td></tr>';
        }
        s += '<tr class="mini-calendar-bottom" colSpan="10"><td ></td></tr>';

        s += '</table>';
        return s;
    },
    _OnDrawDate: function (date) {
        var e = {
            date: date,
            dateCls: "",
            dateStyle: "",
            dateHtml: date.getDate(),
            allowSelect: true

        };
        this.fire("drawdate", e);
        return e;
    },
    _OnDateClick: function (date, action) {
        var e = { date: date, action: action };
        this.fire("dateclick", e);

        this._OnValueChanged();
    },

    menuEl: null,
    menuYear: null,
    menuSelectMonth: null,
    menuSelectYear: null,
    showMenu: function (el) {
        if (!el) return;
        this.hideMenu();

        this.menuYear = parseInt(this.viewDate.getFullYear() / 10) * 10;
        this._menuselectMonth = this.viewDate.getMonth();
        this._menuselectYear = this.viewDate.getFullYear();

        var s = '<div class="mini-calendar-menu"></div>';
        this.menuEl = mini.append(document.body, s);
        this.updateMenu(this.viewDate);

        var box = this.getBox();







        if (this.el.style.borderWidth == "0px") {
            this.menuEl.style.border = "0";
        }
        mini.setBox(this.menuEl, box);







        mini.on(this.menuEl, "click", this.__OnMenuClick, this);
        mini.on(document, "mousedown", this.__OnBodyMenuMouseDown, this);
    },
    hideMenu: function () {
        if (this.menuEl) {
            mini.un(this.menuEl, "click", this.__OnMenuClick, this);
            mini.un(document, "mousedown", this.__OnBodyMenuMouseDown, this);
            jQuery(this.menuEl).remove();
            this.menuEl = null;
        }
    },
    updateMenu: function () {
        var s = '<div class="mini-calendar-menu-months">';
        for (var i = 0, l = 12; i < l; i++) {
            var text = mini.getShortMonth(i);
            var cls = "";
            if (this._menuselectMonth == i) cls = "mini-calendar-menu-selected";
            s += '<a id="' + i + '" class="mini-calendar-menu-month ' + cls + '" href="javascript:void(0);" hideFocus onclick="return false">' + text + '</a>';
        }
        s += '<div style="clear:both;"></div></div>';


        s += '<div class="mini-calendar-menu-years">';
        for (var i = this.menuYear, l = this.menuYear + 10; i < l; i++) {
            var text = i;
            var cls = "";
            if (this._menuselectYear == i) cls = "mini-calendar-menu-selected";
            s += '<a id="' + i + '" class="mini-calendar-menu-year ' + cls + '" href="javascript:void(0);" hideFocus onclick="return false">' + text + '</a>';
        }
        s += '<div class="mini-calendar-menu-prevYear"></div><div class="mini-calendar-menu-nextYear"></div><div style="clear:both;"></div></div>';

        s += '<div class="mini-calendar-footer">'
            + '<span class="mini-calendar-okButton">' + this.okText + '</span>'
            + '<span class="mini-calendar-footerSpace"></span>'
            + '<span class="mini-calendar-cancelButton">' + this.cancelText + '</span>'
            + '</div><div style="clear:both;"></div>';

        this.menuEl.innerHTML = s;
    },
    __OnMenuClick: function (e) {

        var t = e.target;
        var monthEl = mini.findParent(t, "mini-calendar-menu-month");
        var yearEl = mini.findParent(t, "mini-calendar-menu-year");
        if (monthEl) {
            this._menuselectMonth = parseInt(monthEl.id);
            this.updateMenu();
        }
        else if (yearEl) {
            this._menuselectYear = parseInt(yearEl.id);
            this.updateMenu();
        }
        else if (mini.findParent(t, "mini-calendar-menu-prevYear")) {
            this.menuYear = this.menuYear - 1;
            this.menuYear = parseInt(this.menuYear / 10) * 10;
            this.updateMenu();
        }
        else if (mini.findParent(t, "mini-calendar-menu-nextYear")) {
            this.menuYear = this.menuYear + 11;
            this.menuYear = parseInt(this.menuYear / 10) * 10;
            this.updateMenu();
        }
        else if (mini.findParent(t, "mini-calendar-okButton")) {
            var date = new Date(this._menuselectYear, this._menuselectMonth, 1);
            this.setViewDate(date);
            this.hideMenu();
        }
        else if (mini.findParent(t, "mini-calendar-cancelButton")) {
            this.hideMenu();
        }
    },
    __OnBodyMenuMouseDown: function (e) {
        if (!mini.findParent(e.target, "mini-calendar-menu")) {
            this.hideMenu();
        }
    },

    __OnClick: function (e) {
        var viewDate = this.viewDate;
        if (this.enabled == false) return;
        var t = e.target;
        var titleEl = mini.findParent(e.target, "mini-calendar-title");

        if (mini.findParent(t, "mini-calendar-monthNext")) {
            viewDate.setMonth(viewDate.getMonth() + 1);
            this.setViewDate(viewDate);
        }
        else if (mini.findParent(t, "mini-calendar-yearNext")) {
            viewDate.setFullYear(viewDate.getFullYear() + 1);
            this.setViewDate(viewDate);
        }
        else if (mini.findParent(t, "mini-calendar-monthPrev")) {
            viewDate.setMonth(viewDate.getMonth() - 1);
            this.setViewDate(viewDate);
        }
        else if (mini.findParent(t, "mini-calendar-yearPrev")) {
            viewDate.setFullYear(viewDate.getFullYear() - 1);
            this.setViewDate(viewDate);
        }
        else if (mini.findParent(t, "mini-calendar-tadayButton")) {



            var d = new Date();
            this.setViewDate(d);
            this.setSelectedDate(d);
            if (this.currentTime) {
                var td = new Date();
                this.setTime(td);
            }
            this._OnDateClick(d, "today");
        }
        else if (mini.findParent(t, "mini-calendar-clearButton")) {
            this.setSelectedDate(null);
            this.setTime(null);
            this._OnDateClick(null, "clear");
        } else if (mini.findParent(t, "mini-calendar-okButton")) {
            this._OnDateClick(null, "ok");



        } else if (titleEl) {
            this.showMenu(titleEl);
        }

        var dateEl = mini.findParent(e.target, "mini-calendar-date");

        if (dateEl && !mini.hasClass(dateEl, "mini-calendar-disabled")) {
            var ids = dateEl.id.split("$");
            var time = parseInt(ids[ids.length - 1]);
            if (time == -1) return;
            var date = new Date(time);

            this._OnDateClick(date);
        }

    },
    __OnMouseDown: function (e) {
        if (this.enabled == false) return;
        var dateEl = mini.findParent(e.target, "mini-calendar-date");
        if (dateEl && !mini.hasClass(dateEl, "mini-calendar-disabled")) {
            var ids = dateEl.id.split("$");
            var time = parseInt(ids[ids.length - 1]);
            if (time == -1) return;
            var date = new Date(time);
            this.setSelectedDate(date);
        }
    },
    __OnTimeChanged: function (e) {
        this.fire("timechanged");
        this._OnValueChanged();
    },

    __OnKeyDown: function (e) {
        if (this.enabled == false) return;

        var date = this.getSelectedDate();
        if (!date) date = new Date(this.viewDate.getTime());
        switch (e.keyCode) {
            case 27:

                break;
            case 13:

                break;
            case 37:
                date = mini.addDate(date, -1, 'D');
                break;
            case 38:
                date = mini.addDate(date, -7, 'D');
                break;
            case 39:
                date = mini.addDate(date, 1, 'D');
                break;
            case 40:
                date = mini.addDate(date, 7, 'D');
                break;
            default:
                break;
        }
        var me = this;


        if (date.getMonth() != me.viewDate.getMonth()) {
            me.setViewDate(mini.cloneDate(date));
            me.focus();
        }

        var dateEl = this.getDateEl(date);
        if (dateEl && mini.hasClass(dateEl, "mini-calendar-disabled")) {
            return;
        }

        me.setSelectedDate(date);

        if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
            e.preventDefault();
        }

    },

    _OnValueChanged: function () {
        this.fire("valuechanged");
    },

    getAttrs: function (el) {
        var attrs = mini.Calendar.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["viewDate", "rows", "columns",
                "ondateclick", "ondrawdate", "ondatechanged", "timeFormat", "ontimechanged", "onvaluechanged"
            ]
        );
        mini._ParseBool(el, attrs,
            ["multiSelect", "showHeader", "showFooter", "showWeekNumber", "showDaysHeader",
            "showMonthButtons", "showYearButtons", "showTodayButton", "showClearButton",
            "showTime", "showOkButton"
            ]
        );

        return attrs;
    }
});
mini.regClass(mini.Calendar, "calendar");


if (mini.Calendar) {
	mini.copyTo(mini.Calendar.prototype, {
		firstDayOfWeek: 0,
		todayText: "今天",
		clearText: "清除",
		okText: "确定",
		cancelText: "取消",
		daysShort: ["日", "一", "二", "三", "四", "五", "六"],
		format: "yyyy年MM月",

		timeFormat: 'H:mm'
	});
}