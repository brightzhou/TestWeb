
mini.MenuButton = function () {

    mini.MenuButton.superclass.constructor.call(this);
}
mini.extend(mini.MenuButton, mini.Button, {
    uiCls: "mini-menubutton",
    allowCls: "mini-button-menu",
    setMenu: function (value) {
        
        if (mini.isArray(value)) {
            value = {
                type: "menu",
                items: value
            };
        }
        if (typeof value == "string") {
            var el = mini.byId(value);
            if (!el) return;
            
            mini.parse(value);
            value = mini.get(value);
        }

        if (this.menu !== value) {
            this.menu = mini.getAndCreate(value);
            this.menu.setPopupEl(this.el);
            this.menu.setPopupCls("mini-button-popup");
            this.menu.setShowAction("leftclick");
            this.menu.setHideAction("outerclick");
            this.menu.setXAlign("left");
            this.menu.setYAlign("below");

            this.menu.hide();
            this.menu.owner = this;
        }
    },
    setEnabled: function (value) {
        this.enabled = value;
        if (value) {
            this.removeCls(this._disabledCls);
        } else {
            this.addCls(this._disabledCls);
        }
        
        jQuery(this.el).attr("allowPopup", !!value)
    }
});
mini.regClass(mini.MenuButton, "menubutton");
