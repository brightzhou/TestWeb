/**
 * @class 表格组件调整大小插件，主要实现调整大小相关功能。
 */
mini._Resizer = function (grid) {
    this.owner = grid;
    mini.on(this.owner.el, "mousedown", this.__OnMouseDown, this);
}
mini._Resizer.prototype = {
    destroy: function (removeEl) {
        //内存泄露问题优化 赵美丹 2013-04-17
        if (this._resizeDragger) {
            this._resizeDragger.destroy();
        }
    },
    __OnMouseDown: function (e) {

        var has = mini.hasClass(e.target, "mini-resizer-trigger");
        if (has && this.owner.allowResize) {
            var drag = this._getResizeDrag();
            drag.start(e);
        }
    },
    _getResizeDrag: function () {
        if (!this._resizeDragger) {
            this._resizeDragger = new mini.Drag({
                capture: true,
                onStart: mini.createDelegate(this._OnDragStart, this),
                onMove: mini.createDelegate(this._OnDragMove, this),
                onStop: mini.createDelegate(this._OnDragStop, this)
            });
        }
        return this._resizeDragger;
    },
    _OnDragStart: function (drag) {

        this.proxy = mini.append(document.body, '<div class="mini-resizer-proxy"></div>');
        this.proxy.style.cursor = "se-resize";

        this.elBox = mini.getBox(this.owner.el);
        mini.setBox(this.proxy, this.elBox);
    },
    _OnDragMove: function (drag) {
        var grid = this.owner;
        var xOffset = drag.now[0] - drag.init[0];
        var yOffset = drag.now[1] - drag.init[1];

        var w = this.elBox.width + xOffset;
        var h = this.elBox.height + yOffset;
        if (w < grid.minWidth) w = grid.minWidth;
        if (h < grid.minHeight) h = grid.minHeight;
        if (w > grid.maxWidth) w = grid.maxWidth;
        if (h > grid.maxHeight) h = grid.maxHeight;

        mini.setSize(this.proxy, w, h);
    },
    _OnDragStop: function (drag, success) {
        if (!this.proxy) return;
        var box = mini.getBox(this.proxy);

        jQuery(this.proxy).remove();
        this.proxy = null;
        this.elBox = null;

        if (success) {
            this.owner.setWidth(box.width);
            this.owner.setHeight(box.height);
            this.owner.fire("resize");
        }
    }
};


