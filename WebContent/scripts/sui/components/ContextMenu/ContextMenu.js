mini.ContextMenu = function () {
    mini.ContextMenu.superclass.constructor.call(this);
}
mini.extend(mini.ContextMenu, mini.Menu, {
    uiCls: "mini-contextmenu",
    vertical: true,
    visible: false,
    _disableContextMenu: true,

    setVertical: function (value) {
        this.vertical = true;
    }
});
mini.regClass(mini.ContextMenu, 'contextmenu');