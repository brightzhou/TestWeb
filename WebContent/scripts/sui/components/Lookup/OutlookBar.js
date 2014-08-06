
/**
 * @class mini.OutlookBar  是mini UI中的导航组件，构造函数中调用了Control方法及扩展的私有方法_initGroups
 * @constructor
 * @extends mini.Control 
 */
mini.OutlookBar = function () {    
    this._initGroups();
    mini.OutlookBar.superclass.constructor.call(this);
}
mini.extend(mini.OutlookBar, mini.Control, /** @lends mini.OutlookBar.prototype */{
	
	/**
     * 组件宽度
     * @default 180
     */
    width: 180,
	/**
     * 加载后是否展开。比如：true展开所有节点；0展开第一级节点。以此类推。
     * @default true
     */
    expandOnLoad: true,
	/**
     * 选中面板的索引
     * @default -1
     */
    activeIndex: -1,
	/**
     * 是否自动折叠
     * @default false
     */
    autoCollapse: false, 
	/**
     * 以下几个都是空属性，没用到过
     */
    groupCls: "",
    groupStyle: "",
    groupHeaderCls: "",
    groupHeaderStyle: "",
    groupBodyCls: "",
    groupBodyStyle: "",
    groupHoverCls: "",
    groupActiveCls: "",
	
    allowAnim: true,
	/**
	 * 通用的设置属性方法，可以用于设置事件，设置属性。
	 * @param kv JSON对象
	 * @returns 组件实例本身
	 */
    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }

        var _allowLayout = this._allowLayout;
        this._allowLayout = false;

        var activeIndex = kv.activeIndex;
        delete kv.activeIndex;

        mini.OutlookBar.superclass.set.call(this, kv);

        if (mini.isNumber(activeIndex)) {
            this.setActiveIndex(activeIndex);
        }

        this._allowLayout = _allowLayout;
        this.doLayout();

        return this;
    },
	/**
     * 组将样式类
     * @default "mini-outlookbar"
     */
    uiCls: "mini-outlookbar",
	/**
     * 创建组件最外层HTML结构，并绑定给组件实例。
     * @default
     * @private
     */
    _create: function () {
        this.el = document.createElement("div");
        this.el.className = "mini-outlookbar";
        this.el.innerHTML = '<div class="mini-outlookbar-border"></div>';
        this._borderEl = this.el.firstChild;
        
    },
    destroy: function (removeEl) {
    	//内存泄露问题优化 赵美丹 2013-04-17
        if (this._borderEl) {
            mini.clearEvent(this._borderEl);
            this.el.removeChild(this._borderEl);
            this._borderEl = null;
        }
        
        mini.OutlookBar.superclass.destroy.call(this, removeEl);
    },
	/**
     * 设置组件初始化完成后的需要执行的回调函数，
     * 通常组件的非结构和样式相关操作都绑定在这里，这样可以提前绘制完成组件.
     * @private
     */
    _initEvents: function () {

        mini._BindEvents(function () {
            mini.on(this.el, "click", this.__OnClick, this);
        }, this);
    },
	/**
	 * 生成面板ID。
	 * @param group JSON对象
	 * @returns {String} 面板ID
	 * @private
	 */
    _createGroupId: function (group) {
        return this.uid + "$" + group._id;
    },
    _GroupId: 1,
	/**
	 * 初始化面板数组
	 */
    _initGroups: function () {
        this.groups = [];
    },
	/**
	 * 创建面板
	 * @param group JSON对象
	 * @returns {Object} 面板对象
	 * @private
	 */
    _createGroupEl: function (group) {

        var id = this._createGroupId(group);
        var s = '<div id="' + id + '" class="mini-outlookbar-group ' + group.cls + '" style="' + group.style + '">'
                    + '<div class="mini-outlookbar-groupHeader ' + group.headerCls + '" style="' + group.headerStyle + ';"></div>'
                    + '<div class="mini-outlookbar-groupBody ' + group.bodyCls + '" style="' + group.bodyStyle + ';"></div>'
                + '</div>';
        var el = mini.append(this._borderEl, s);

        var bodyEl = el.lastChild;
        var cs = group.body;
        delete group.body;
        if (cs) {
            if (!mini.isArray(cs)) cs = [cs];
            for (var i = 0, l = cs.length; i < l; i++) {
                var node = cs[i];
                mini.append(bodyEl, node);
                
            }
            cs.length = 0;
        }

        
        if (group.bodyParent) {
            var p = group.bodyParent;
            while (p.firstChild) {
                bodyEl.appendChild(p.firstChild);
            }
        }
        delete group.bodyParent;

        return el;
    },
	/**
	 * 创建group面板
	 * @param options Object group对象
	 * @returns {Object} 面板对象
	 */
    createGroup: function (options) {
        var group = mini.copyTo({
            _id: this._GroupId++,
            name: "",
            title: "",

            cls: "",
            style: "",
            iconCls: "",
            iconStyle: "",
            headerCls: "",
            headerStyle: "",
            bodyCls: "",
            bodyStyle: "",

            visible: true,
            enabled: true,
            showCollapseButton: true,
            expanded: this.expandOnLoad

        }, options);


        return group;
    },
	/**
	 * 设置groups数组
	 * @param groups Object group对象
	 * @returns {Object} 面板对象
	 */
    setGroups: function (groups) {
        if (!mini.isArray(groups)) return;
        this.removeAll();
        for (var i = 0, l = groups.length; i < l; i++) {
            this.addGroup(groups[i]);
        }
    },
	/**
	 * 获取groups数组
	 */
    getGroups: function () {
        return this.groups;
    },
	/**
	 * 将面板添加到指定的索引
	 * @param {Object} group对象
	 * @param {Number} index 索引号。
	 * @returns {Object} 面板对象
	 */
    addGroup: function (group, index) {
        if (typeof group == "string") {
            group = { title: group };
        }
        group = this.createGroup(group);

        if (typeof index != "number") index = this.groups.length;
        this.groups.insert(index, group);

        var el = this._createGroupEl(group);
        group._el = el;
        var index = this.groups.indexOf(group);
        var targetGroup = this.groups[index + 1];
        if (targetGroup) {
            var tEl = this.getGroupEl(targetGroup);
            jQuery(tEl).before(el);
        }
        this.doUpdate();
        return group;
    },
	/**
	 * 更新group面板
	 * @param {Object} group面板对象
	 * @param {Object} group对象
	 */
    updateGroup: function (group, options) {
        var group = this.getGroup(group);
        if (!group) return;
        mini.copyTo(group, options);
        this.doUpdate();
    },
	/**
	 * 删除group面板
	 * @param {String} name/index group名称或者索引
	 */
    removeGroup: function (group) {
        group = this.getGroup(group);
        if (!group) return;
        var groupEl = this.getGroupEl(group);
        if (groupEl) groupEl.parentNode.removeChild(groupEl);
        this.groups.remove(group);
        this.doUpdate();
    },
	/**
	 * 删除所有子Group
	 */
    removeAll: function () {
        for (var i = this.groups.length - 1; i >= 0; i--) {
            this.removeGroup(i);
        }
    },
	/**
	 * 移动group面板到新位置
	 * @param {Object} group面板对象
	 * @param {Number} index
	 */
    moveGroup: function (group, index) {
        group = this.getGroup(group);
        if (!group) return;
        target = this.getGroup(index);

        var groupEl = this.getGroupEl(group);
        this.groups.remove(group);

        if (target) {
            index = this.groups.indexOf(target);
            this.groups.insert(index, group);
            var tEl = this.getGroupEl(target);
            jQuery(tEl).before(groupEl);
        } else {
            this.groups.add(group);
            this._borderEl.appendChild(groupEl);
        }

        this.doUpdate();
    },
	/**
     * 更新组件函数
     */
    doUpdate: function () {
        for (var i = 0, l = this.groups.length; i < l; i++) {
            var group = this.groups[i];
            var groupEl = group._el;
            var headerEl = groupEl.firstChild;
            var groupBodyEl = groupEl.lastChild;

            var icons = '<div class="mini-outlookbar-icon ' + group.iconCls + '" style="' + group.iconStyle + ';"></div>';
            //解决showCollapseButton不起作用的问题 赵美丹 2012-12-10
            var s = '';
            if(group.showCollapseButton){
                s += '<div class="mini-tools"><span class="mini-tools-collapse"></span></div>';
            }
            s += ((group.iconStyle || group.iconCls) ? icons : '')
                    + '<div class="mini-outlookbar-groupTitle">' + group.title + '</div><div style="clear:both;"></div>';

            headerEl.innerHTML = s;

            if (group.enabled) {
                mini.removeClass(groupEl, "mini-disabled");
            } else {
                mini.addClass(groupEl, "mini-disabled");
            }

            mini.addClass(groupEl, group.cls);
            mini.setStyle(groupEl, group.style);

            mini.addClass(groupBodyEl, group.bodyCls);
            mini.setStyle(groupBodyEl, group.bodyStyle);

            mini.addClass(headerEl, group.headerCls);
            mini.setStyle(headerEl, group.headerStyle);

            mini.removeClass(groupEl, "mini-outlookbar-firstGroup");
            mini.removeClass(groupEl, "mini-outlookbar-lastGroup");
            if (i == 0) {
                mini.addClass(groupEl, "mini-outlookbar-firstGroup");
            }
            if (i == l - 1) {
                mini.addClass(groupEl, "mini-outlookbar-lastGroup");
            }
        }
        this.doLayout();
    },
	/**
     * 重新调整组件布局
     */
    doLayout: function () {
        if (!this.canLayout()) return;
        if (this._inAniming) return;

        this._doLayoutInner();

        for (var i = 0, l = this.groups.length; i < l; i++) {
            var group = this.groups[i];
            var groupEl = group._el;
            var groupBodyEl = groupEl.lastChild;

            if (group.expanded) {
                mini.addClass(groupEl, "mini-outlookbar-expand");
                mini.removeClass(groupEl, "mini-outlookbar-collapse");
            } else {
                mini.removeClass(groupEl, "mini-outlookbar-expand");
                mini.addClass(groupEl, "mini-outlookbar-collapse");
            }
            groupBodyEl.style.height = "auto";
            groupBodyEl.style.display = group.expanded ? "block" : "none";

            groupEl.style.display = group.visible ? "" : "none";

            //解决IE下收起再展开时右侧出现空白的问题（非IE下改为不做处理，增加if判断，其他浏览器目前正常，不做调整） 赵美丹 2012-12-12
            if(!isIE){
	            var w = mini.getWidth(groupEl, true);
	            var padding = mini.getPaddings(groupBodyEl);
	            var border = mini.getBorders(groupBodyEl);
	            if (jQuery.boxModel) {
	                w = w - padding.left - padding.right - border.left - border.right;
	            }
	            groupBodyEl.style.width = w + "px";
            }
        }

        var autoHeight = this.isAutoHeight();

        var acGroup = this.getActiveGroup();
        if (!autoHeight && this.autoCollapse && acGroup) {
            var groupEl = this.getGroupEl(this.activeIndex);
            groupEl.lastChild.style.height = this._getFillGroupBodyHeight() + "px";
        } else {

        }
        
        //解决IE下收起再展开出现滚动条时不能自适应的问题  赵美丹 2012-12-12
        if(isIE){
            var padding = mini.getPaddings(this.el.parentNode);
	        if(this._borderEl.offsetHeight > (this.el.parentNode.offsetHeight-padding.top-padding.bottom)){
                this.el.style.width = (this.el.parentNode.clientWidth-20)+"px";
	        }else{
	            this.el.style.width = this.width;
	        }
        }
        
        mini.layout(this._borderEl);
    },
	/**
     * 重新调整组件内部布局
     */
    _doLayoutInner: function () {
        if (this.isAutoHeight()) {
            this._borderEl.style.height = "auto";
        } else {
            var h = this.getHeight(true);
            if (!jQuery.boxModel) {
                var b2 = mini.getBorders(this._borderEl);
                h = h + b2.top + b2.bottom;
            }
            if (h < 0) h = 0;
            this._borderEl.style.height = h + "px";
        }
    },
	/**
     * 根据Body的高度自动填充Group面板
     */
    _getFillGroupBodyHeight: function () {

        var h = jQuery(this.el).height();
        var b2 = mini.getBorders(this._borderEl);
        h = h - b2.top - b2.bottom;

        var acGroup = this.getActiveGroup();
        var h2 = 0;
        for (var i = 0, l = this.groups.length; i < l; i++) {
            var group = this.groups[i];
            var div = this.getGroupEl(group);
            if (group.visible == false || group == acGroup) continue;
            var display = div.lastChild.style.display;
            div.lastChild.style.display = "none";
            var dh = jQuery(div).outerHeight();
            div.lastChild.style.display = display;
            
            var margin = mini.getMargins(div);

            dh = dh + margin.top + margin.bottom;

            h2 += dh;
        }
        h = h - h2;

        var groupEl = this.getGroupEl(this.activeIndex);
        if (!groupEl) return 0;
        h = h - jQuery(groupEl.firstChild).outerHeight();
        if (jQuery.boxModel) {

            var padding = mini.getPaddings(groupEl.lastChild);
            var border = mini.getBorders(groupEl.lastChild);
            h = h - padding.top - padding.bottom - border.top - border.bottom;
        }

        var padding = mini.getPaddings(groupEl);
        var border = mini.getBorders(groupEl);
        var margin = mini.getMargins(groupEl);

        h = h - margin.top - margin.bottom;
        h = h - padding.top - padding.bottom - border.top - border.bottom;

        if (h < 0) h = 0;
        return h;
    },
	/**
	 * 获取Group面板
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 * @return {Object} Group面板
	 */
    getGroup: function (index) {
        if (typeof index == "object") return index;
        if (typeof index == "number") {
            return this.groups[index];
        } else {
            for (var i = 0, l = this.groups.length; i < l; i++) {
                var group = this.groups[i];
                if (group.name == index) return group;
            }
        }
    },
	/**
	 * 获取Group面板
	 * @param {Number} 面板索引
	 * @return {Object} Group面板
	 * @private
	 */
    _getGroupById: function (id) {
        for (var i = 0, l = this.groups.length; i < l; i++) {
            var group = this.groups[i];
            if (group._id == id) return group;
        }
    },
	/**
	 * 获取Group面板元素对象
	 * @param {Number} 面板索引
	 * @return {Object} Group面板
	 */
    getGroupEl: function (index) {
        var group = this.getGroup(index);
        if (!group) return null;
        return group._el;
    },
	/**
	 * 获取group面板对象内容区DOM元素
	 * @param {Number} 面板索引
	 * @return {Object} Dom对象
	 */
    getGroupBodyEl: function (index) {
        var groupEl = this.getGroupEl(index);
        if (groupEl) return groupEl.lastChild;
        return null;
    },
	/**
	 * 设置是否自动折叠属性
	 * @param {Boolean} value 面板索引
	 */
    setAutoCollapse: function (value) {
        this.autoCollapse = value;
    },
	/**
	 * 获取是否自动折叠属性的值
	 * @return {Boolean} 
	 */
    getAutoCollapse: function () {
        return this.autoCollapse;
    },
	/**
     * 设置是否加载时展开节点
     */
    setExpandOnLoad: function (value) {
        this.expandOnLoad = value;
    },
	/**
     * 获取是否加载时展开属性的值
     */
    getExpandOnLoad: function () {
        return this.expandOnLoad;
    },
    /**
	 * 设置默认选中的面板
	 * @return {Number} 面板索引值
	 */
    setActiveIndex: function (value) {

        var group = this.getGroup(value);
        var acGroup = this.getGroup(this.activeIndex);
        var fire = group != acGroup;
        if (group) {
            this.activeIndex = this.groups.indexOf(group);
        } else {
            this.activeIndex = -1;
        }

        var group = this.getGroup(this.activeIndex);
        if (group) {
            var anim = this.allowAnim;
            this.allowAnim = false;
            this.expandGroup(group);
            this.allowAnim = anim;
        }
    },
	/**
	 * 获取当前选中面板的索引
	 * @return {Number} 面板索引值
	 */
    getActiveIndex: function () {
        return this.activeIndex;
    },
	/**
	 * 获取当前选中的面板对象
	 * @return {Object} 面板对象
	 */
    getActiveGroup: function () {
        return this.getGroup(this.activeIndex);
    },
	/**
	 * 显示指定的面板
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 */
    showGroup: function (group) {
        group = this.getGroup(group);
        if (!group || group.visible == true) return;
        group.visible = true;
        this.doUpdate();
    },
	/**
	 * 隐藏指定的面板
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 */
    hideGroup: function (group) {
        group = this.getGroup(group);
        if (!group || group.visible == false) return;
        group.visible = false;
        this.doUpdate();
    },
	/**
	 * 切换指定的面板折叠与展开
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 */
    toggleGroup: function (group) {
        group = this.getGroup(group);
        if (!group) return;
        //性能优化 赵美丹 2013-04-17
        this._allowLayout = false;
        if (group.expanded) {
            this.collapseGroup(group);
        } else {
            this.expandGroup(group);
        }
        this._allowLayout = true;
        this.doLayout();
    },
	/**
	 * 折叠指定的面板
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 */
    collapseGroup: function (group) {
        group = this.getGroup(group);
        if (!group) return;
        var expanded = group.expanded;

        var fillHeight = 0;
        if (this.autoCollapse && !this.isAutoHeight()) {
            fillHeight = this._getFillGroupBodyHeight();
        }

        var fire = false;
        group.expanded = false;
        var index = this.groups.indexOf(group);
        if (index == this.activeIndex) {
            this.activeIndex = -1;
            fire = true;
        }

        var el = this.getGroupBodyEl(group);
        if (this.allowAnim && expanded) {
            this._inAniming = true;

            el.style.display = "block";
            el.style.height = "auto";
            if (this.autoCollapse && !this.isAutoHeight()) {
                el.style.height = fillHeight + "px";
            }
            var config = { height: "1px" };
            mini.addClass(el, "mini-outlookbar-overflow");

            var sf = this;
            var jq = jQuery(el);
            jq.animate(
            config,
            180,
            function () {
                sf._inAniming = false;
                mini.removeClass(el, "mini-outlookbar-overflow");
                sf.doLayout();
            }
            );
        } else {
            this.doLayout();
        }
        var e = {
            group: group,
            index: this.groups.indexOf(group),
            name: group.name
        };
        this.fire("Collapse", e);
        if (fire) {
            this.fire("activechanged");
        }
    },
	/**
	 * 展开指定的面板
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 */
    expandGroup: function (group) {
        group = this.getGroup(group);
        if (!group) return;

        var expanded = group.expanded;
        group.expanded = true;
        this.activeIndex = this.groups.indexOf(group);

        fire = true;
        if (this.autoCollapse) {
            for (var i = 0, l = this.groups.length; i < l; i++) {
                var g = this.groups[i];
                if (g.expanded && g != group) {
                    this.collapseGroup(g);
                }
            }
        }

        var el = this.getGroupBodyEl(group);
        if (this.allowAnim && expanded == false) {
            this._inAniming = true;

            el.style.display = "block";
            if (this.autoCollapse && !this.isAutoHeight()) {
                var fillHeight = this._getFillGroupBodyHeight();
                el.style.height = (fillHeight) + "px";
            } else {
                el.style.height = "auto";
            }

            var h = mini.getHeight(el);
            el.style.height = "1px";
            var config = { height: h + "px" };

            var overflow = el.style.overflow;
            el.style.overflow = "hidden";
            mini.addClass(el, "mini-outlookbar-overflow");
            
            var sf = this;
            var jq = jQuery(el);
            jq.animate(
                config,
                180,
                function () {
                    el.style.overflow = overflow;
                    mini.removeClass(el, "mini-outlookbar-overflow");
                    sf._inAniming = false;
                    sf.doLayout();
                }
            );
        } else {
            this.doLayout();
        }

        var e = {
            group: group,
            index: this.groups.indexOf(group),
            name: group.name
        };
        this.fire("Expand", e);

        if (fire) {

            this.fire("activechanged");
        }
    },
	/**
	 * 切换指定的面板（折叠/展开）
	 * @param {Object/Number/String} 面板对象/面板名称/面板索引
	 */
    _tryToggleGroup: function (group) {
        group = this.getGroup(group);
        var e = {
            group: group,
            groupIndex: this.groups.indexOf(group),
            groupName: group.name,
            cancel: false
        };
        if (group.expanded) {
            this.fire("BeforeCollapse", e);
            if (e.cancel == false) {
                this.collapseGroup(group);
            }
        } else {
            this.fire("BeforeExpand", e);
            if (e.cancel == false) {
                this.expandGroup(group);
            }
        }
    },
    /**
     * 根据Event，获取面板对象
     * @param e Event
     */
    _getGroupByEvent: function (e) {
        var el = mini.findParent(e.target, 'mini-outlookbar-group');
        if (!el) return null;
        var ids = el.id.split("$");
        var id = ids[ids.length - 1];
        return this._getGroupById(id);
    },
	/**
     * 按钮组件实例的默认点击事件响应函数。
     * @param e Event
     */
    __OnClick: function (e) {
        if (this._inAniming) return;
        var hd = mini.findParent(e.target, 'mini-outlookbar-groupHeader');
        if (!hd) return;

        var group = this._getGroupByEvent(e);
        if (!group) return;

        this._tryToggleGroup(group);
    },
    /**
     * 解析面板对象并返回属性数组集合
     * @param nodes DOM元素
     * @returns {String[]} 属性集合
     */
    parseGroups: function (nodes) {
        var groups = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];

            var group = {};
            groups.push(group);

            group.style = node.style.cssText;
            mini._ParseString(node, group,
                ["name", "title", "cls", "iconCls", "iconStyle", "headerCls", "headerStyle", "bodyCls", "bodyStyle"
                 ]
            );
            mini._ParseBool(node, group,
                ["visible", "enabled", "showCollapseButton", "expanded"
                 ]
            );
            group.bodyParent = node;
        }
        return groups;
    },
	/**
     * 取得指定元素的属性JSON集合
     * @param el DOM元素
     * @returns JSON对象
     */
    getAttrs: function (el) {
        var attrs = mini.OutlookBar.superclass.getAttrs.call(this, el);
		/**
		 * onactivechanged 事件当列面板切换时触发<br/>
		 * 支持标签配置。
		 * @name onactivechanged
		 * @event
		 * @memberOf mini.OutlookBar.prototype
		 */
		/**
		 * oncollapse 事件当折叠其面板时触发<br/>
		 * 支持标签配置。
		 * @name oncollapse
		 * @event
		 * @memberOf mini.OutlookBar.prototype
		 */
		/**
		 * onexpand 事件当展开面板时触发<br/>
		 * 支持标签配置。
		 * @name onexpand
		 * @event
		 * @memberOf mini.OutlookBar.prototype
		 */
        mini._ParseString(el, attrs,
            ["onactivechanged", "oncollapse", "onexpand"
                ]
        );
        mini._ParseBool(el, attrs,
            ["autoCollapse", "allowAnim", "expandOnLoad"
                ]
        );
        mini._ParseInt(el, attrs,
            ["activeIndex"
                ]
        );
        var nodes = mini.getChildNodes(el);
        attrs.groups = this.parseGroups(nodes);
        return attrs;
    }
});
//注册Button组件
mini.regClass(mini.OutlookBar, "outlookbar");