/**
 * @fileOverview PopupEdit.js 文件定义了带弹出层的录入框组件。
 */

mini = mini || {};

/**
 * PopupEdit 是mini UI中的输入框下拉组件，构造函数中调用了 ButtonEdit 构造函数
 * @class mini.PopupEdit
 * @constructor
 * @extends mini.ValidatorBase
 */

mini.PopupEdit = function () {
	mini.PopupEdit.superclass.constructor.call(this);
	this._createPopup();
	this.el.className += ' mini-popupedit';	//PopupEdit只是在Popup上增加了一个样式名
}
mini.extend(mini.PopupEdit, mini.ButtonEdit, {
	uiCls: "mini-popupedit",
	popup: null,

	popupCls: "mini-buttonedit-popup",

	_hoverCls: "mini-buttonedit-hover",
	_pressedCls: "mini-buttonedit-pressed",

	destroy: function (removeEl) {
		if (this.isShowPopup()) {
			this.hidePopup();
		}
        if(this.el){
            this.el.onmouseover = null;
            this.el.onmouseout = null;
        }
		if (this._popupInner) {
		    this._popupInner.owner = null;
		    this._popupInner = null;
		}
		if (this.popup) {
			//内存泄露问题优化 赵美丹 2013-04-17
            mini.clearEvent(this.popup.el);
            mini.clearEvent(this.popup);
            this.popup.owner = null;
			this.popup.destroy(removeEl);
			this.popup = null;
		}
        this._clickTarget = null;
        
        mini.un(document, "mouseup", this.__OnDocMouseUp, this);
        
		mini.PopupEdit.superclass.destroy.call(this, removeEl);
	},
	_initEvents: function () {
		mini.PopupEdit.superclass._initEvents.call(this);

		mini._BindEvents( function () {
			mini_onOne(this.el, "mouseover", this.__OnMouseOver, this);
			mini_onOne(this.el, "mouseout", this.__OnMouseOut, this);
		}, this);
	},
	_initButtons: function () {
		this.buttons = [];
		var button = this.createButton({
			cls: "mini-buttonedit-popup",
			iconCls: "mini-buttonedit-icons-popup",
			name: "popup"
		});
		this.buttons.push(button);
	},
	__OnBlur: function (e) {
	    this._focused = false;
	    if (this._clickTarget && mini.isAncestor(this.el, this._clickTarget)) return;
	    if (this.isShowPopup()) return;
	    mini.PopupEdit.superclass.__OnBlur.call(this, e);
	},
	/**
	 * 默认鼠标驻留事件响应函数
	 */
	__OnMouseOver: function (e) {
		if (this.isReadOnly() || this.allowInput)
			return;
		if (mini.findParent(e.target, "mini-buttonedit-border")) {
			this.addCls(this._hoverCls);
		}
	},
	/**
	 * 默认鼠标移出事件响应函数
	 */
	__OnMouseOut: function (e) {
		if (this.isReadOnly() || this.allowInput)
			return;
		this.removeCls(this._hoverCls);
	},
	__OnMouseDown: function (e) {
		if (this.isReadOnly())
			return;
		mini.PopupEdit.superclass.__OnMouseDown.call(this, e);
		if (this.allowInput == false && mini.findParent(e.target, "mini-buttonedit-border")) {
			mini.addClass(this.el, this._pressedCls);
			mini.on(document, "mouseup", this.__OnDocMouseUp, this);
		}
	},
	__OnInputKeyDown: function (e) {
		this.fire("keydown", {
			htmlEvent: e
		});
		if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
			return false;
		}
		if (e.keyCode == 9) {
			this.hidePopup();
			return;
		}
		if (e.keyCode == 27) {
			this.hidePopup();
			return;
		}
		if (e.keyCode == 13) {
			this.fire("enter");
		}

		if (this.isShowPopup()) {

			if (e.keyCode == 13 || e.keyCode == 27) {
				e.stopPropagation();
			}
		}
	},
	within: function (e) {
		if (mini.isAncestor(this.el, e.target))
			return true;
		if (this.popup.within(e))
			return true;
		return false;
	},
	popupWidth: "100%",
	popupMinWidth: 50,
	popupMaxWidth: 2000,

	popupHeight: "",
	popupMinHeight: 100,
	popupMaxHeight: 2000,

	setPopup: function (value) {
		if (typeof value == "string") {
			mini.parse(value);
			value = mini.get(value);
		}
		var p = mini.getAndCreate(value);
		if (!p)
			return;
		p.setVisible(true);
		p.render(this.popup._contentEl);

		p.owner = this;

		p.on("beforebuttonclick", this.__OnPopupButtonClick, this);
	},
	getPopup: function () {
		if (!this.popup) {
			this._createPopup();
		}
		return this.popup;
	},
	/**
	 * 创造弹出层组件实例
	 *
	 */
	_createPopup: function () {
		this.popup = new mini.Popup();
		this.popup.setShowAction("none");
		this.popup.setHideAction("outerclick");
		this.popup.setPopupEl(this.el);

		this.popup.on("BeforeClose", this.__OnPopupBeforeClose, this);
		mini.on(this.popup.el, "keydown", this.__OnPopupKeyDown, this);
	},
	/**
	 * 默认事件，如果事件发生在弹出源元素内，则接收后续动作。
	 */
	__OnPopupBeforeClose: function (e) {
		if (this.within(e.htmlEvent))
			e.cancel = true;
	},
	__OnPopupKeyDown: function (e) {
	},
	showPopup: function () {
		var ex = {
			cancel: false
		};
		this.fire("beforeshowpopup", ex);
		if (ex.cancel == true)
			return;
		var popup = this.getPopup();
		this._syncShowPopup();

		popup.on("Close", this.__OnPopupHide, this);

		this.fire("showpopup");
	},
    doLayout: function () {
        mini.PopupEdit.superclass.doLayout.call(this);
        if (this.isShowPopup()) {

        }
    },
    _syncShowPopup: function () {
        var popup = this.getPopup();

        if (this._popupInner && this._popupInner.el.parentNode != this.popup._contentEl) {
            this.popup._contentEl.appendChild(this._popupInner.el);
            this._popupInner.setVisible(true);
        }

        var box = this.getBox();
       
		var w = this.popupWidth;
		if (this.popupWidth == "100%") w = box.width;
		popup.setWidth(w);
       
		var h = parseInt(this.popupHeight);
		if (!isNaN(h)) {
			popup.setHeight(h);
		} else {
			popup.setHeight("auto");
		}

		popup.setMinWidth(this.popupMinWidth);
		popup.setMinHeight(this.popupMinHeight);
		popup.setMaxWidth(this.popupMaxWidth);
		popup.setMaxHeight(this.popupMaxHeight);

		popup.showAtEl(this.el, {
		    xAlign: "left",
		    yAlign: "below",
		    outYAlign: "above",
		    outXAlign: "right",
		    popupCls: this.popupCls
		});

		
	},
    __OnPopupHide: function (e) {
        this.__doFocusCls();
		this.fire("hidepopup");
	},
    hidePopup: function () {
        if (this.isShowPopup()) {
            var popup = this.getPopup();
            popup.close();
        }

	},
	isShowPopup: function () {
	    if (this.popup && this.popup.isDisplay()) 
            return true;
		else
			return false;
	},
	setPopupWidth: function (value) {
		this.popupWidth = value;
	},
	setPopupMaxWidth: function (value) {
		this.popupMaxWidth = value;
	},
	setPopupMinWidth: function (value) {
		this.popupMinWidth = value;
	},
	getPopupWidth: function (value) {
		return this.popupWidth;
	},
	getPopupMaxWidth: function (value) {
		return this.popupMaxWidth;
	},
	getPopupMinWidth: function (value) {
		return this.popupMinWidth;
	},
	setPopupHeight: function (value) {
		this.popupHeight = value;
	},
	setPopupMaxHeight: function (value) {
		this.popupMaxHeight = value;
	},
	setPopupMinHeight: function (value) {
		this.popupMinHeight = value;
	},
	getPopupHeight: function (value) {
		return this.popupHeight;
	},
	getPopupMaxHeight: function (value) {
		return this.popupMaxHeight;
	},
	getPopupMinHeight: function (value) {
		return this.popupMinHeight;
	},
	__OnClick: function (e) {
		if (this.isReadOnly())
			return;

		if (mini.isAncestor(this._buttonEl, e.target)) {
			this._OnButtonClick(e);
		}
		if (mini.findParent(e.target, this._closeCls)) {
		    if (this.isShowPopup()) {
		        this.hidePopup();
		    }
		    this.fire("closeclick", { htmlEvent: e });
		    return;
		}

		if (this.allowInput == false || mini.isAncestor(this._buttonEl, e.target)) {
			if (this.isShowPopup()) {
				this.hidePopup();
			} else {
				var sf = this;
				setTimeout( function () {
					sf.showPopup();
				}, 1);
			}
		}
	},
	__OnPopupButtonClick: function (e) {
		if (e.name == "close")
			this.hidePopup();
		e.cancel = true;
	},
	getAttrs: function (el) {
		var attrs = mini.PopupEdit.superclass.getAttrs.call(this, el);

		mini._ParseString(el, attrs,
		["popupWidth", "popupHeight", "popup", "onshowpopup", "onhidepopup", "onbeforeshowpopup"
		]
		);
		mini._ParseInt(el, attrs,
		["popupMinWidth", "popupMaxWidth", "popupMinHeight", "popupMaxHeight"
		]
		);

		return attrs;
	}
});
mini.regClass(mini.PopupEdit, 'popupedit');