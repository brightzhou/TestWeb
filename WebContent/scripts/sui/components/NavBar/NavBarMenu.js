mini.NavBarMenu = function () {
    mini.NavBarMenu.superclass.constructor.call(this);
}
mini.extend(mini.NavBarMenu, mini.OutlookMenu, {
    uiCls: "mini-navbarmenu"
});
mini.regClass(mini.NavBarMenu, "navbarmenu");