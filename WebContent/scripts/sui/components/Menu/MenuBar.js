
mini.MenuBar = function () {
    mini.MenuBar.superclass.constructor.call(this);
}
mini.extend(mini.MenuBar, mini.Menu, {
    uiCls: "mini-menubar",
    vertical: false,
    setVertical: function (value) {
        this.vertical = false;
    }
});
mini.regClass(mini.MenuBar, 'menubar');