
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