
mini.HtmlFile = function () {
    mini.HtmlFile.superclass.constructor.call(this);
    this.on("validation", this.__OnValidation, this);
}
mini.extend(mini.HtmlFile, mini.ButtonEdit, {
    width: 180,
    buttonText: "浏览...",
    _buttonWidth: 56,

    limitType: "",  
    

    limitTypeErrorText: "上传文件格式为：",

    allowInput: false,
    readOnly: true,
    _cellSpacing: 0,

    uiCls: "mini-htmlfile",
    _create: function () {
        mini.HtmlFile.superclass._create.call(this);

        this._fileEl = mini.append(this.el, '<input type="file" hideFocus class="mini-htmlfile-file" name="' + this.name + '" ContentEditable=false/>');
        mini.on(this._borderEl, "mousemove", this.__OnMouseMove, this);
        mini.on(this._fileEl, "change", this.__OnFileChange, this);
    },
    _getButtonHtml: function () {
        var hover = 'onmouseover="mini.addClass(this, \'' + this._buttonHoverCls + '\');" '
                        + 'onmouseout="mini.removeClass(this, \'' + this._buttonHoverCls + '\');"';
        return '<span class="mini-buttonedit-button" ' + hover + '>' + this.buttonText + '</span>';
    },
    __OnFileChange: function (e) {
        this.value = this._textEl.value = this._fileEl.value;
        this._OnValueChanged();
        e = { htmlEvent: e };
        this.fire("fileselect", e);

    },
    __OnMouseMove: function (e) {

        var x = e.pageX, y = e.pageY;
        var box = mini.getBox(this.el);

        x = (x - box.x - 5);
        y = (y - box.y - 5);

        if (this.enabled == false) {

            x = -20;
            y = -20;
        }
        this._fileEl.style.display = "";
        this._fileEl.style.left = x + 'px';
        this._fileEl.style.top = y + 'px';
    },
    __OnValidation: function (e) {
        if (!this.limitType) return;

        var vs = e.value.split(".");
        var fileType = "*." + vs[vs.length - 1];
        var types = this.limitType.split(";");

        if (types.length > 0 && types.indexOf(fileType) == -1) {
            e.errorText = this.limitTypeErrorText + this.limitType;
            e.isValid = false;
        }
    },
    setName: function (value) {
        this.name = value;
        mini.setAttr(this._fileEl, "name", this.name);
    },
    getValue: function () {
        return this._textEl.value;
    },

    setButtonText: function (value) {
        this.buttonText = value;
        
    },
    getButtonText: function () {
        return this.buttonText;
    },
    setLimitType: function (value) {
        this.limitType = value;
    },
    getLimitType: function () {
        return this.limitType;
    },
    
    getAttrs: function (el) {
        var attrs = mini.HtmlFile.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["limitType", "buttonText", "limitTypeErrorText"
             ]
        );

        return attrs;
    }
});
mini.regClass(mini.HtmlFile, "htmlfile");