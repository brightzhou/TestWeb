mini.Box = function () {
	mini.Box.superclass.constructor.call(this);

}
mini.extend(mini.Box, mini.Container, {

	style: "",
	borderStyle: "",
	bodyStyle: "",

	uiCls: "mini-box",
	_create: function () {
		this.el = document.createElement("div");
		this.el.className = "mini-box";
		this.el.innerHTML = '<div class="mini-box-border"></div>';
		this._bodyEl = this._borderEl = this.el.firstChild;

		this._contentEl = this._bodyEl;
	},
	_initEvents: function () {

	},
	doLayout: function () {
		if (!this.canLayout())
			return;

		var autoHeight = this.isAutoHeight();
		var autoWidth = this.isAutoWidth();

		var padding = mini.getPaddings(this._bodyEl);
		var margin = mini.getMargins(this._bodyEl);

		if (!autoHeight) {

			var h = this.getHeight(true);
			if (jQuery.boxModel) {

				h = h - padding.top - padding.bottom;
			}
			h = h - margin.top - margin.bottom;
			if (h < 0)
				h = 0;
			this._bodyEl.style.height = h + "px";
		} else {
			this._bodyEl.style.height = "";
		}

		var w = this.getWidth(true);
		var elWidth = w;
		w = w - margin.left - margin.right;
		if (jQuery.boxModel) {
			w = w - padding.left - padding.right;
		}
		if (w < 0)
			w = 0;
		this._bodyEl.style.width = w + "px";

		mini.layout(this._borderEl);
		this.fire("layout");
	},
	setBody: function (value) {
		if (!value)
			return;
		if (!mini.isArray(value))
			value = [value];
		for (var i = 0, l = value.length; i < l; i++) {
			mini.append(this._bodyEl, value[i]);
		}
		mini.parse(this._bodyEl);
		this.doLayout();
	},
	set_bodyParent: function (value) {

		if (!value)
			return;

		var el = this._bodyEl;

		var p = value;
		while (p.firstChild) {
			el.appendChild(p.firstChild);
		}
		this.doLayout();
	},
	setBodyStyle: function (value) {
		mini.setStyle(this._bodyEl, value);
		this.doLayout();
	},
	getAttrs: function (el) {
		var attrs = mini.Box.superclass.getAttrs.call(this, el);

		attrs._bodyParent = el;

		mini._ParseString(el, attrs,
		["bodyStyle"
		]
		);

		return attrs;
	}
});
mini.regClass(mini.Box, "box");