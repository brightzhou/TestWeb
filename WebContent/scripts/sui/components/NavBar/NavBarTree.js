mini.NavBarTree = function () {
    mini.NavBarTree.superclass.constructor.call(this);
}
mini.extend(mini.NavBarTree, mini.OutlookTree, {
    uiCls: "mini-navbartree"
});
mini.regClass(mini.NavBarTree, "navbartree");