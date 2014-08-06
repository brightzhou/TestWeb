
mini.Separator = function () {
    mini.Separator.superclass.constructor.call(this);
}
mini.extend(mini.Separator, mini.Control, {
    _clearBorder: false,
    uiCls: "mini-separator",
    _create: function () {
        this.el = document.createElement("span");
        this.el.className = "mini-separator";
    }
});
mini.regClass(mini.Separator, 'separator');
