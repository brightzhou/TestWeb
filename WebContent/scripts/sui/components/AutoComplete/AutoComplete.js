/**
 * 文件中定义了 AutoComplete 组件。
 * @fileOverview AutoComplete.js
 * @author 殷文旭
 */

/**
 * @class AutoComplete 是mini UI中的自动补全组件
 * @constructor
 * @extends mini.ComboBox
 * @requires mini.ComboBox
 * @version 1.0
 */
mini.AutoComplete = function () {
	mini.AutoComplete.superclass.constructor.call(this);

	var sf = this;
	sf._ValueChangeTimer = null;
	/** @ignore */
	this._textEl.onfocus = function () {

		sf._LastInputText = sf._textEl.value;
		sf._ValueChangeTimer = setInterval( function () {

			if (sf._LastInputText != sf._textEl.value) {
				sf._tryQuery();
				sf._LastInputText = sf._textEl.value;

				if (sf._textEl.value == "" && sf.value != "") {
					sf.setValue("");
					sf._OnValueChanged();
				}
			}
		}, 10);
	}
	/** @ignore */
	this._textEl.onblur = function () {
		clearInterval(sf._ValueChangeTimer);
		if (!sf.isShowPopup()) {
			if (sf._LastInputText != sf._textEl.value) {

				if (sf._textEl.value == "" && sf.value != "") {
					sf.setValue("");
					sf._OnValueChanged();
				}
			}
		}
	}
	this._buttonEl.style.display = "none";
	this._doInputLayout();

}
mini.extend(mini.AutoComplete, mini.ComboBox, /** @lends mini.AutoComplete.prototype */
{
	/**
	 * 数据的远程加载地址
	 * @type String
	 * @default ""
	 */
	url: "",
	/**
	 * 是否可录入标志
	 * @type Boolean
	 * @default true
	 */
	allowInput: true,
	/**
	 * 查询延迟时间
	 * @priate
	 */
	delay: 150,

	searchField: "key",

	/** @private 未被使用的参数*/
	minChars: 0,
	_buttonWidth: 0,
	/**
	 * 组将样式类
	 * @type String
	 * @default "mini-textbox"
	 */
	uiCls: "mini-autocomplete",
	/**
	 * 设置 url 属性并从url地址获取数据更新组件。
	 * @param url {String}
	 */
	setUrl: function (value) {
		this.url = value;
	},
	/**
	 * 设置值
	 * @param value {String}
	 */
	setValue: function (value) {
	    if (mini.isNull(value)) value = "";

		if (this.value != value) {
			this.value = value;
			this._valueEl.value = this.value;
		}
	},
	/**
	 * 设置显示文本
	 * @param value {String}
	 */
	setText: function (value) {
	    if (mini.isNull(value)) value = "";

		if (this.text != value) {
			this.text = value;
			this._LastInputText = value;
		}
		this._textEl.value = this.text;
	},
	
	/** @private 未被使用的参数set方法*/
	setMinChars: function (value) {
		this.minChars = value;
	},
	/** @private 未被使用的参数的get方法*/
	getMinChars: function () {
		return this.minChars;
	},
	setSearchField: function (value) {
	    this.searchField = value;
	},
	getSearchField: function () {
	    return this.searchField;
	},


	popupLoadingText: "<span class='mini-textboxlist-popup-loading'>Loading...</span>",
	popupErrorText: "<span class='mini-textboxlist-popup-error'>Error</span>",
	popupEmptyText: "<span class='mini-textboxlist-popup-noresult'>No Result</span>",
	/**
	 * 显示弹出层
	 * @param action {String} 目前action支持loading 和 error 分别用于给出等待和错误提示。
	 */
	showPopup: function (action) {

		var popup = this.getPopup();
		var control = this._listbox;
		control.showEmpty = true;
		control.emptyText = this.popupEmptyText;
		if (action == "loading") {
			control.emptyText = this.popupLoadingText;
			this._listbox.setData([]);
		} else if (action == "error") {
			control.emptyText = this.popupLoadingText;
			this._listbox.setData([]);
		}
		this._listbox.doUpdate();

		mini.AutoComplete.superclass.showPopup.call(this);

	},
	// 覆盖combox的实现。
	__OnInputKeyDown: function (e) {

	    this.fire("keydown", { htmlEvent: e });
	    if (e.keyCode == 8 && (this.isReadOnly() || this.allowInput == false)) {
	        return false;
	    }
	    if (e.keyCode == 9) {
	        this.hidePopup();
	        return;
	    }

	    if (this.isReadOnly()) return;

	    switch (e.keyCode) {
	        case 27:
	            if (this.isShowPopup()) {
	                e.stopPropagation();
	            }

	            this.hidePopup();
	            break;
	        case 13:
	            if (this.isShowPopup()) {
	                e.preventDefault();
	                e.stopPropagation();

	                var index = this._listbox.getFocusedIndex();

	                if (index != -1) {
	                    var item = this._listbox.getAt(index);
	                    var vts = this._listbox.getValueAndText([item]);
	                    var value = vts[0];

	                    this.setText(vts[1]);
	                    if (mini.isFirefox) {
	                        this.blur();
	                        this.focus();
	                    }

	                    this.setValue(value, false);

	                    this._OnValueChanged();

	                    this.hidePopup();

	                }
	            } else {
	                this.fire("enter");
	            }
	            break;
	        case 37:
	            break;
	        case 38:
	            var index = this._listbox.getFocusedIndex();
	            if (index == -1) {
	                index = 0;
	                if (!this.multiSelect) {
	                    var item = this._listbox.findItems(this.value)[0];
	                    if (item) {
	                        index = this._listbox.indexOf(item);
	                    }
	                }
	            }
	            if (this.isShowPopup()) {
	                if (!this.multiSelect) {
	                    index -= 1;
	                    if (index < 0) index = 0;
	                    this._listbox._focusItem(index, true);
	                }
	            }
	            break;
	        case 39:
	            break;
	        case 40:

	            var index = this._listbox.getFocusedIndex();
	            if (this.isShowPopup()) {
	                if (!this.multiSelect) {
	                    index += 1;
	                    if (index > this._listbox.getCount() - 1) index = this._listbox.getCount() - 1;
	                    this._listbox._focusItem(index, true);
	                }
	            } else {
	                this._tryQuery(this._textEl.value);
	            }
	            break;
	        default:
	            this._tryQuery(this._textEl.value);
	            break;
	    }
	},

	/**
	 * 查询匹配项
	 */
	doQuery: function () {
		this._tryQuery();
	},
	
	_tryQuery: function (oldText) {
		var sf = this;
		if (this._queryTimer) {
			clearTimeout(this._queryTimer);
			this._queryTimer = null;
		}
		this._queryTimer = setTimeout( function () {
			var text = sf._textEl.value;
			sf._doQuery(text);
		}, this.delay);
		this.showPopup("loading");
	},
	_doQuery: function (key) {
	    if (!this.url) return;
	    if (this._ajaxer) {
	        this._ajaxer.abort();
	    }

	    var url = this.url;
	    var ajaxMethod = "post";
	    if (url) {
	        if (url.indexOf(".txt") != -1 || url.indexOf(".json") != -1) {
	            ajaxMethod = "get";
	        }
	    }

	    var params = {};
	    params[this.searchField] = key;

	    var e = {
	        url: url,
	        async: true,
	        params: params,
	        data: params,
	        type: ajaxMethod,
	        cache: false,
	        cancel: false
	    };
	    this.fire("beforeload", e);
	    if (e.data != e.params && e.params != params) {
	        e.data = e.params;
	    }
	    if (e.cancel) return;

	    var me = sf = this;
	    mini.copyTo(e, {
	        success: function (text) {
	            try {
	                var data = mini.decode(text);
	            } catch (ex) {
	                throw new Error("autocomplete json is error");
	            }
	            if (sf.dataField) {
	                data = mini._getMap(sf.dataField, data);
	            }
	            if (!data) data = [];

	            me._listbox.setData(data);
	            me.showPopup();
	            me._listbox._focusItem(0, true);
	            me.data = data;
	            me.fire("load", { data: data });

	        },
	        error: function (jqXHR, textStatus, errorThrown) {
	            me.showPopup("error");
	        }
	    });

	    this._ajaxer = mini.ajax(e);
	},

	getAttrs: function (el) {
	    var attrs = mini.AutoComplete.superclass.getAttrs.call(this, el);

	    mini._ParseString(el, attrs,
            ["searchField"]
        );

	    return attrs;
	}

});

mini.regClass(mini.AutoComplete, "autocomplete");