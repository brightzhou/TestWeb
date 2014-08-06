/**
 * 定义了所有组件的最终基类。
 * @fileOverview Components.js
 * @author 殷文旭
 */

mini = mini || {};

/**
 * Component 是mini UI中所有组件的根源，构造函数中组要做了几件事情，1生成uid。2 id = id || uid。3注册组件
 * @class mini.Component
 * @constructor
 * @requires mini
 */
mini.Component = function () {
	//保存每个组建事件绑定的响应函数集合。
    this._events = {};
    /**
     * 由mini UI为每个组建生成的唯一标识 
     * @type String
     */
    this.uid = mini.newId(this._idPre);	//生成一个组件实例id。
    this._id = this.uid;

    if (!this.id){
					
        this.id = this.uid;    
    }
    //将组件实例组侧到Mini对象的组件实例池中。
    mini.reg(this);
}

mini.Component.prototype = /** @lends mini.Component.prototype */{
	
	/**
	 * 组件实例标志。代表对象时一个组件。
	 * @type Boolean
	 * @default true
	 */
    isControl: true,
    /**
     * HTML标签的id属性，如果标签没有声明，则值与uid一致。
     * @type String
     * @default null
     */
    id: null,
    /**
     * 动态生成id的前缀
     * @private
     * @default "mini-"
     */
    _idPre: "mini-",
    /**
     * ID被重新设置开关，默认为开启，一旦被设置一次之后就关闭设置功能。
     * @private
	 * @default false
     */	
    _idSet: false,
    /**
     * 开关，用于判断组件实例是否支持，调用fire方法触发事件。
     * @private
	 * @default true
     */
    _canFire: true,	

	/**
	 * 通用的设置属性方法，可以用于设置事件，设置属性。设置属性完成就会自动调用组件的doLayout方法。
	 * 属性中可以包括自定义的renderTo 或 render 用于指向渲染到的容器对象，
	 * 则设置完成后将会调用组件的render方法把组件渲染到容器中。
	 * @param kv {Object} 参数对象
	 * @return {Object} 组件实例本身
	 * @example
	 * var a = new Component();
	 * a.set({id:'id'});
	 * a.id => id
	 */
    set: function (kv) {
        if (typeof kv == 'string') {
            return this;
        }
        var _allowLayout = this._allowLayout;
        this._allowLayout = false;

        var renderTo = kv.renderTo || kv.render;
        delete kv.renderTo;
        delete kv.render;
        
        for (var key in kv) {
            if (key.toLowerCase().indexOf('on') == 0) {

                var fn = kv[key];
                this.on(key.substring(2, key.length).toLowerCase(), fn);
                delete kv[key];
            }
        }
        
        for (var key in kv) {
            var v = kv[key];
            var n = 'set' + key.charAt(0).toUpperCase() + key.substring(1, key.length);
            var setter = this[n];
            if (setter) {
                setter.call(this, v);
            } else {
                this[key] = v;
            }
        }

        if (renderTo && this.render) {
            this.render(renderTo);
        }

        this._allowLayout = _allowLayout;
        if (this.doLayout) this.doLayout();

        return this;
    },

	/**
	 * 触发组件实例的一个事件
     * @param type {String}事件类型
     * @param [event] {Event}可以使一个JSON对象
     * @example 
     * var a = new Component();
     * a.fire('click');
	 */
    fire: function (type, event) {
        if (this._canFire == false) return;
        type = type.toLowerCase();
        var handlers = this._events[type];
        if (handlers) {
            if (!event) event = {};
            if (event && event != this) {
                event.source = event.sender = this;
                if (!event.type) {
                    event.type = type;
                }
            }
            for (var i = 0, l = handlers.length; i < l; i++) {
                var listener = handlers[i];
                if (listener) {
                    listener[0].apply(listener[1], [event]);
                }
            }
        }
    },
    
    /**
     * 为组件实例添加一个事件响应函数
     * @param type {String} 事件类型
     * @param fn {Function} 响应函数
     * @param [scope] {Object} 函数上下文
     * @returns {Object} 组件实例本身
     */
    on: function (type, fn, scope) {

        if (typeof fn == "string") {
            var f = mini._getFunctoin(fn);
            //fn可以直接是脚本
            if (!f) {
                
                var id = mini.newId("__str_");
                window[id] = fn;
                eval("fn = function(e){var s = " + id + ";var fn = mini._getFunctoin(s); if(fn) {fn.call(this, e)}else{eval(s);}}");
            } else {
                fn = f;
            }
        }

        if (typeof fn != 'function' || !type) return false;
        type = type.toLowerCase();
        var event = this._events[type];
        if (!event) {
            event = this._events[type] = [];
        }
        scope = scope || this;
        if (!this.findListener(type, fn, scope)) {
            event.push([fn, scope]);
        }
        return this;
    },
    
    /**
     * 删除一个事件响应函数
     * @param type {String} 事件类型
     * @param fn {Function} 响应函数
     * @param [scope] {Object} 函数上下文
     * @returns {Object} 组件实例本身
     */
    un: function (type, fn, scope) {
        if (typeof fn != 'function') return false;
        type = type.toLowerCase();
        var event = this._events[type];
        if (event) {
            scope = scope || this;
            var listener = this.findListener(type, fn, scope);
            if (listener) {
                event.remove(listener);
            }
        }
        return this;
    },
    
    /**
     * 获得指定类型时间的执行响应函数的定义内容 Listener。
     * @param type {String} 事件类型
     * @param fn {Function} 响应函数
     * @param [scope] {Object} 函数上下文
     * @returns {Object} Listener
     */
    findListener: function (type, fn, scope) {
        type = type.toLowerCase();
        scope = scope || this;
        var handlers = this._events[type];
        if (handlers) {
            for (var i = 0, l = handlers.length; i < l; i++) {
                var listener = handlers[i];
                if (listener[0] === fn && listener[1] === scope) return listener;
            }
        }
    },
    
    /**
     * 设置组件实例的ID属性
     * @param id {String} ID值
     */
    setId: function (id) {
        if (!id) throw new Error("id not null");
        if (this._idSet) throw new Error("id just set only one");
        mini["unreg"](this);
        this.id = id;
        if (this.el) this.el.id = id;
        if (this._textEl) this._textEl.id = id + "$text";
        if (this._valueEl) this._valueEl.id = id + "$value";
        this._idSet = true;
        mini.reg(this);
    },
    
    /**
     * 取得组件实例的ID属性值
     * @return {String} ID
     */
    getId: function () {
        return this.id;
    },
    
    /**
     * 组件实例的析构方法
     */
    destroy: function () {
        mini["unreg"](this);
        this.fire("destroy");
    }
}