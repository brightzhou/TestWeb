
mini.SplitButton = function () {
    mini.SplitButton.superclass.constructor.call(this);
}
mini.extend(mini.SplitButton, mini.MenuButton, {
    uiCls: "mini-splitbutton",
    allowCls: "mini-button-split"
});
mini.regClass(mini.SplitButton, "splitbutton");
