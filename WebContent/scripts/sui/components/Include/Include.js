
mini.Include = function () {
    mini.Include.superclass.constructor.call(this);
}
mini.extend(mini.Include, mini.Control, {

    url: "",
    

    uiCls: "mini-include",
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-include";
    },
    _initEvents: function () {

    },
    doLayout: function () {
        if (!this.canLayout()) return;

        var cs = this.el.childNodes;
        if (cs) {
            for (var i = 0, l = cs.length; i < l; i++) {
                var cel = cs[i];
                mini.layout(cel);
            }
        }
    },
    setUrl: function (value) {
        this.url = value;
        mini.update({
            url: this.url,
            el: this.el,
            async: this.async
        });

        this.doLayout();
    },
    getUrl: function (value) {
        return this.url;
    },






    
    getAttrs: function (el) {
        var attrs = mini.Include.superclass.getAttrs.call(this, el);

        mini._ParseString(el, attrs,
            ["url"
             ]
        );

        return attrs;
    }
});
mini.regClass(mini.Include, "include");