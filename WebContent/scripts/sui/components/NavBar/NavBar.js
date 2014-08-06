
mini.NavBar = function () {
    mini.NavBar.superclass.constructor.call(this);
}
mini.extend(mini.NavBar, mini.OutlookBar, {
    uiCls: "mini-navbar"
});
mini.regClass(mini.NavBar, "navbar");