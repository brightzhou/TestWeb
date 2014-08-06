/**
 * @fileOverview mini.js文件定义了mini UI框架中的最重要的一些方法和属性。
 * @requires jQuery
 */

/**
 * @namespace mini UI的全局命名空间
 */
mini = {
    /**
	 * @description 以KEY-VALUE形式存储标签ID 与 组件实例
	 * @default {} 空对象
	 */
    components: {},
    /**
	 * @description 以KEY-VALUE形式存储uid 与 组件实例  。uiid是创建组件实例时动态创建的唯一标识。
	 * @default {} 空对象
	 */
    uids: {},		//存储组件实例，根据动态分配的uid找到组件。
    /**
	 * 源代码中未使用过的属性
	 * @default {} 空对象
	 */
    ux: {},
    /**
	 * @description mini UI框架加载是否已经准备完成。
	 * @default false
	 */
    isReady: false,

    /**
	 * @description 根据给定的样式类名匹配 HTML元素。
	 * @param {String} cls 给定的样式类名
	 * @param {String|DOMObject|jquery Object} el 设置范围匹配范围，可以接受 ID字符串，或者DOM对象
	 * @return 匹配的第一个DOM对象。如果没有找到则返回undefined
	 * @requires jQuery
	 */
    byClass: function (cls, el) {
        if (typeof el == "string")
            el = mini.byId(el);
        return jQuery("." + cls, el)[0];
    },
    /**
	 * @description 取得已经实例化的组件实例数组。
	 * @return 已经实例化的组件数组，如果没有实例化的组件则返回一个空数组
	 */
    getComponents: function () {
        var cs = [];
        for (var id in mini.components) {
            var c = mini.components[id];
            cs.push(c);
        }
        return cs;
    },
    /**
	 * <p>取得指定的组件实例，可接三种合法的参数:
	 * <ul><li>1，组件实例对象，</li><li>2，标签id和 uid，</li><li>3，组件DOM对象。</li><ul>
	 * </p>
	 * @param {String|Object} id 获取组件的条件
	 * @returns 组件实例对象，未找到匹配的组件实例则返回null
	 */
    get: function (id) {
        if (!id)
            return null;
        if (mini.isControl(id))
            return id;
        if (typeof id == "string") {
            if (id.charAt(0) == '#')
                id = id.substr(1);
        }
        if (typeof id == "string")
            return mini.components[id];
        else {
            var control = mini.uids[id.uid];
            if (control && control.el == id)
                return control;
        }
        return null;
    },
    /**
	 * 根据动态分配的uid找到对应组件实例
	 * @param {String} uid 创建组件式动态分配的唯一标识
	 * @returns 返回组件实例，如果未找到 则返回undefined。
	 */
    getbyUID: function (uid) {
        return mini.uids[uid];
    },
    /**
	 * 通过给定判断函数和函数作用域，判断每个组件是否符合fn规则，如果符合则被添加到返回数组中。
	 * @param {Function} fn 过滤规则函数,函数传入组件实例作为参数，方法返回true 或 1代表通过过滤规则
	 * @param scope 过滤函数执行的上下文对象。
	 * @returns {Array} 返回符合过滤条件的组件实例数组
	 */
    findControls: function (fn, scope) {
        if (!fn)
            return [];
        scope = scope || mini;
        var controls = [];
        var uids = mini.uids;
        for (var uid in uids) {
            var control = uids[uid];
            var ret = fn.call(scope, control);
            if (ret === true || ret === 1) {
                controls.push(control);
                if (ret === 1)
                    break;
            }
        }
        return controls;
    },
    /**
	 * 取得给定祖先组件的子孙组件实例对象数组。
	 * @param {Object} parent 包含子孙组件的组件实例。
	 * @param {Array} 返回给定组件实例的子孙组件实例数组。
	 */
    getChildControls: function (parent) {
        var p = mini.get(parent);
        if (!p) return [];
        var pel = parent.el ? parent.el : parent;

        var controls = mini.findControls(function (control) {
            //如果组件实例所属元素和父组件实例所属元素相同返回false
            if (!control.el || parent == control)
                return false;
            //如果父组件实例所属元素是参数组件实例所属元素的祖先级元素或者而这相同则返回true
            //但是因为第一个If条件一个过滤掉相等的请求，所以只有在parent是 control祖先时才返回true。
            if (mini.isAncestor(pel, control.el) && control.within)
                return true;
            return false;
        });
        return controls;
    },
    /**
	 * 空函数
	 * @field
	 */
    emptyFn: function () {
    },
    /**
	 * 将给定组件的子孙组件实例作为其属性，属性名是组件的name属性值，如果有多个同name子孙组件，则最后只保留最后一个。
	 * @param obj 指定的包含子孙组件的组件实例。
	 * @param {String|Boolean} pre 参数等于true时子孙组件作为属性的属性名为子孙组件的name属性的首字母大写。
	 * @returns 无
	 */
    createNameControls: function (obj, pre) {
        if (!obj || !obj.el)
            return;
        if (!pre)
            pre = "_";
        var el = obj.el;
        //获取有name属性的obj的子孙组件实例
        var controls = mini.findControls(function (control) {
            if (!control.el || !control.name)
                return false;
            if (mini.isAncestor(el, control.el))
                return true;
            return false;
        });
        for (var i = 0, l = controls.length; i < l; i++) {
            var c = controls[i];
            var name = pre + c.name;
            if (pre === true) {
                name = c.name[0].toUpperCase() + c.name.substring(1, c.name.length);
            }
            //将子孙组件实例作为一个属性添加到obj上。
            obj[name] = c;
        }

    },
    /**
	 * 取得给定名字，给定祖先节点的子组件实例，如果存在多个同名子组件，则选择第一个。
	 * @param {String} name 匹配子组件name属性的值
	 * @param {Object} parentNode 子集范围
	 * @returns 符合条件的组件实例，如果未找到则返回undefined。
	 */
    getbyName: function (name, parentNode) {
        var isControl = mini.isControl(parentNode);	//是否是组件实例
        var parentControl = parentNode;
        if (parentNode && isControl) {
            parentNode = parentNode.el;
        }
        parentNode = mini.byId(parentNode);
        parentNode = parentNode || document.body;
        //如果参数name与control.name匹配，并且control是parentNode的子孙对象则别保存到过滤结果中。
        var controls = this.findControls(function (control) {
            if (!control.el)
                return false;
            if (control.name == name && mini.isAncestor(parentNode, control.el))
                return 1;
            return false;
        }, this);
        //特殊处理，组件内部定义了getbyName的情况下以内部方法为准。
        if (isControl && controls.length == 0 && parentControl && parentControl.getbyName) {
            return parentControl.getbyName(name);
        }

        return controls[0];
    },
    /**
	 * 获取给URL地址附带的数据。
	 * 例如：www.xxx.com?a=1&b=2 -> {a:1,b:2}
	 * @param url 待解析地址字符窜
	 * @returns {Object} json对象
	 */
    getParams: function (url) {
        if (!url)
            url = location.href;
        url = url.split("?")[1];
        var params = {};
        if (url) {
            var us = url.split("&");
            for (var i = 0, l = us.length; i < l; i++) {
                var ps = us[i].split("=");
                try {
                    params[ps[0]] = decodeURIComponent(unescape(ps[1]));
                } catch (ex) {

                }
            }
        }
        return params;
    },
    /**
	 * 将组件实例注册到组件实例缓冲区中。也就是在mini.components和mini.uids中各保存一个引用。
	 * @param {Object} cmp 待注册组件实例
	 * @returns 无
	 */
    reg: function (cmp) {
        this.components[cmp.id] = cmp;	//通过组件既有id属性找到对应的组件实例
        this.uids[cmp.uid] = cmp;		//通过动态分配的uid属性找到对应的组件实例

    },
    /**
	 * 从组件实例缓冲区中删除组件实例注册信息，也就是从mini.components和mini.uids中删除组件实例引用。
	 * @param {Object} cmp 待注销组件实例
	 * @returns 无
	 */
    unreg: function (cmp) {
        delete mini.components[cmp.id];
        delete mini.uids[cmp.uid];
    },
    /**
	 * 组件类名与组件类的键值关系保存组件类引用。例如：button -> Button
	 */
    classes: {},
    /**
	 * 样式类名与组件类的键值关系保存组件类引用。例如：mini-button -> Button
	 */
    uiClasses: {},

    /**
	 * 通过组件类名获取组件类。
	 * @param className 组件类名
	 * @return 组件类引用。
	 */
    getClass: function (className) {
        if (!className)
            return null;
        return this.classes[className.toLowerCase()];
    },
    /**
	 * 根据样式类名获取对应的组件类。
	 * @param uiCls 组件样式类名
	 * return 组件类引用。
	 */
    getClassByUICls: function (uiCls) {

        return this.uiClasses[uiCls.toLowerCase()];
    },
    /**
	 * mini UI动态生成id的默认前缀
	 * @default "mini-"
	 */
    idPre: "mini-",

    /**
	 * mini UI动态生成id的递进增长数。
	 * @default 1
	 */
    idIndex: 1,
    /**
	 * 根据给定前缀创建一个新的唯一id。如果未指定前缀则使用mini.idPre作为默认设置。
	 * @param {String} idPre 生成id的前缀
	 * @returns 生成的id字符串
	 */
    newId: function (idPre) {
        return (idPre || this.idPre) + this.idIndex++;
    },
    /**
	 * 浅拷贝，从源对象中将属性复制并替换到目标对象中。
	 * @param to 拷贝目标对象
	 * @param from 拷贝源对象
	 * @returns 拷贝目标对象
	 */
    copyTo: function (to, from) {
        if (to && from) {
            for (var p in from) {
                to[p] = from[p];
            }
        }
        return to;
    },
    /**
	 * 浅拷贝，从源对象中将属性复制到目标对象中。不覆盖目标对象中的值。
	 * @param to 拷贝目标对象
	 * @param from 拷贝源对象
	 * @returns 拷贝目标对象
	 */
    copyIf: function (to, from) {
        if (to && from) {
            for (var p in from) {
                if (mini.isNull(to[p])) {
                    to[p] = from[p];
                }
            }
        }
        return to;
    },
    /**
	 * 创建一个函数，这个函数用于将给定函数的上下文对象设置为给定对象。
	 * @param {Function} fn 源函数
	 * @param scope 上下文对象
	 * @returns {Function} 绑定在给定上下文对象上的可执行函数。
	 */
    createDelegate: function (fn, scope) {
        if (!fn)
            return function () {
            };
        return function () {
            return fn.apply(scope, arguments);
        }
    },
    /**
	 * 判断一个实例是否是组件实例
	 * @param obj 待判断对象
	 * @returns {Boolean} true/false
	 */
    isControl: function (obj) {
        return !!(obj && obj.isControl);
    },
    /**
	 * 使用DOM元素是否拥有appendChild方法判断参数是否是一个合法的DOM对象。
	 * @param obj 待判断对象
	 * @returns {Boolean} true/false
	 */
    isElement: function (obj) {
        return obj && obj.appendChild;
    },
    /**
	 * 判断参数是否是Date实例
	 * @param obj 待判断对象
	 * @returns {Boolean} true/false
	 */
    isDate: function (value) {
        return value && value.getFullYear;
    },
    /**
	 * 判断参数是否是Array实例
	 * @param obj 待判断对象
	 * @returns {Boolean} true/false
	 *该判断是否数组的方法太过简单，附上比较“高级”的判断方法:
	 *if(myVal && typeof myVal === 'object' && typeof myVal.length === 'number' 
     *  && !(myVal.propertyIsEnumerable('length'))){
     * //myVal确实是一个数组（前提propertyIsEnumerable不被覆盖），arguments满足此条件
     * //可通过增加条件typeof myVal.slice==='function'来区分，因为arguments不拥有数组的任何方法
     *  }
	 */
    isArray: function (value) {
        return value && !!value.unshift
    },
    /**
	 * 判断参数是否为空，这里null 和undefined 都返回true
	 * @param obj 待判断对象
	 * @returns {Boolean} true/false
	 */
    isNull: function (value) {
        return value === null || value === undefined;
    },
    /**
	 * 判断参数是否是数值。
	 * @param obj 待判断对象
	 * @returns {Boolean} true/false
	 */
    isNumber: function (value) {
        return !isNaN(value) && typeof value == 'number';
    },
    /**
	 * 比较有意思的比较规则，1 "",null,undefined被认为是相等的。
	 * 时间，getTime()相等被认为是相等的。
	 * Object === 被认为是相等的。
	 * String(a) === String(b)被认为是相等的。。。
	 * @param a 待判断对象
	 * @param b 待判断对象
	 * @returns {Boolean} true/false
	 */
    isEquals: function (a, b) {

        if (a !== 0 && b !== 0) {
            if ((mini.isNull(a) || a == "") && (mini.isNull(b) || b == "")) return true;
        }

        if (a && b && a.getFullYear && b.getFullYear) return a.getTime() === b.getTime();

        //解决对象是否相等的比较不正确的问题 赵美丹 2013-03-05
        if (typeof a == 'object' && typeof b == 'object') {
            return mini.encode(a) == mini.encode(b);
        }
        return String(a) === String(b);
    },

    /**
	 * 数组循环方法。
	 * @param {Array} array数组对象
	 * @param {Function} method 循环执行的函数，函数会传入三个参数依次是值，下标，源数组对象。
	 * @param scope 循环函数执行的作用域。
	 * @returns 无
	 */
    forEach: function (array, method, scope) {
        var list = array.clone();
        for (var i = 0, l = list.length; i < l; i++) {
            var o = list[i];
            if (method.call(scope, o, i, array) === false)
                break;
        }
    },
    /**
	 * 数组排序方法。此方法没有什么优秀的设计之处。第三个参数在方法内并没有用到。
	 * @param array 数组对象
	 * @param 排序算法函数,内部实现还是使用了Array.prototype.sort()方法
	 * @param scope 没有用到的参数
	 * @returns 无
	 */
    sort: function (array, fn, scope) {
        scope = scope || array;
        array.sort(fn);

    },
    /**
	 * 删除DOM节点
	 * @param {String|DOMObject} el可以使选择器，也可以是DOM对象
	 * @returns 无
	 * @requires jQuery
	 */
    removeNode: function (el) {
        jQuery(el).remove();
    },
    /**
	 * 一个没有被添加到文档流中的DIV DOM对象
	 */
    elWarp: document.createElement("div")
};

/**
 * 將組件类注册到mini对象上，例如：mini.classes.button = Button
 * 将组件样式类名注册到mini对象上，例如:mini.uiClasses.mini-button = Button
 * @private
 */
mini_regClass = function (clazz, className) {

    className = className.toLowerCase();
    if (!mini.classes[className]) {
        mini.classes[className] = clazz;
        clazz.prototype.type = className;
    }
    var uiCls = clazz.prototype.uiCls;
    if (!mini.isNull(uiCls) && !mini.uiClasses[uiCls]) {
        mini.uiClasses[uiCls] = clazz;
    }
}
/**
 * 用于管理组件的继承规则。
 * @private
 */
mini_extend = function (newClass, sp, overrides) {
    if (typeof sp != 'function')
        return this;

    var sb = newClass, sbp = sb.prototype, spp = sp.prototype;
    if (sb.superclass == spp)
        return;
    sb.superclass = spp;	//继承方法简单引用方法。
    sb.superclass.constructor = sp;

    for (var p in spp) {
        sbp[p] = spp[p];	//继承方法
    }
    if (overrides) {		//添加组件方法，并使用组件方法替换集成方法。
        for (var p in overrides) {
            sbp[p] = overrides[p];
        }
    }
    return sb;
}
mini.copyTo(mini, {
    /**#@+
	 * @memberOf mini
	 */

    /**
	 * 用于管理组件的继承规则。
	 * @param newClass 新组件类
	 * @param sp 被继承类
	 * @param overrides 为新组件添加方法，如果与基层来的属性或方法有重复，则会覆盖继承来的属性或方法。
	 * @returns 返回添加继承关系之后的新组件类。
	 * @function
	 */
    extend: mini_extend,

    /**
	 * 將組件类注册到mini对象上，例如：mini.classes.button = Button
	 * 将组件样式类名注册到mini对象上，例如:mini.uiClasses.mini-button = Button
	 * @param clazz 组件类
	 * @param className 组件类名
	 * @returns 无
	 * @function
	 */
    regClass: mini_regClass,
    /**
	 * 沒有什麽用的屬性
	 * @default false
	 */
    debug: false
    /**#@-
	 */
});

mini.namespace = function (names) {
    if (typeof names != "string")
        return;
    names = names.split(".");
    var parent = window;
    for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i];
        var obj = parent[name];
        if (!obj) {
            obj = parent[name] = {};
        }
        parent = obj;
    }
}
/**
 * 根据给定包路径获取函数。
 * @private
 */
mini._getFunctoin = function (fnName) {
    if (typeof fnName != "string")
        return null;
    var names = fnName.split(".");//mini.fn.fn
    var fn = null;
    for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i];
        if (!fn)
            fn = window[name];
        else
            fn = fn[name];
        if (!fn)
            break;
    }
    return fn;
}
mini._getMap = function (name, obj) {
    if (!name) return null;
    if (name.indexOf(".") == -1 && name.indexOf("[") == -1) return obj[name];
    var s = "obj." + name;
    try {
        var v = eval(s);
    } catch (e) {
        return null;
    }
    return v;
}
mini._setMap = function (name, value, obj) {
    if (!obj) return;
    if (typeof name != "string") return;

    var names = name.split(".");

    function createArray(obj, name, num, defaultValue) {
        var arr = obj[name];
        if (!arr) {
            arr = obj[name] = [];
        }
        for (var i = 0; i <= num; i++) {
            var arrObj = arr[i];
            if (!arrObj) {
                if (defaultValue === null || defaultValue === undefined) {
                    arrObj = arr[i] = {};
                } else {
                    arrObj = arr[i] = defaultValue;
                }
            }
        }
        return obj[name][num];
    }

    var obj2 = null;
    for (var i = 0, l = names.length; i <= l - 1; i++) {
        var name = names[i];

        if (i == l - 1) {
            if (name.indexOf(']') == -1) {
                obj[name] = value;
            } else {

                var as = name.split("[");
                var n1 = as[0], n2 = parseInt(as[1]);
                createArray(obj, n1, n2, "");
                obj[n1][n2] = value;
            }

            break;
        }

        if (name.indexOf(']') == -1) {

            obj2 = obj[name];
            if (i <= l - 2 && obj2 == null) {
                obj[name] = obj2 = {};
            }
            obj = obj2;
        } else {

            var as = name.split("[");
            var n1 = as[0], n2 = parseInt(as[1]);
            obj = createArray(obj, n1, n2);

        }

    }
    return value;
}

/**
 * 获取组件实例或者创建一个新组件实例
 * @param id 参数包括 实例id, 组件实例对象， DOM对象， 和一个{}参数对象。
 * @returns 组件实例
 */
mini.getAndCreate = function (id) {
    if (!id)
        return null;
    if (typeof id == "string")
        return mini.components[id];

    if (typeof id == "object") {
        if (mini.isControl(id)) {
            return id;
        } else if (mini.isElement(id)) {
            return mini.uids[id.uid];
        } else {
            return mini.create(id);
        }
    }
    return null;
};
/**
 * 根据参数创建一个组件实例，被创建的实例不会自动注册到mini的实例池中。
 * @param uiConfig{Object} json对象
 * @returns 组件实例
 */
mini.create = function (uiConfig) {
    if (!uiConfig)
        return null;
    if (mini.get(uiConfig.id) === uiConfig)
        return uiConfig;
    var clazz = this.getClass(uiConfig.type);
    if (!clazz)
        return null;
    var ui = new clazz();
    ui.set(uiConfig);
    return ui;
}

/**
 * 方法供组件内部适用，用于动态给一个组件添加一个或多个子组件，添加完成之后解析子组件定义，然后调整区域布局。
 * @param controls {Array|Object}需要添加的子组件
 * @param contentEl 容纳子组件的DOM对象，非必须
 * @param scope 指定完成之后调整布局的区域， 非必须
 * @returns scope
 * @private
 * @function
 */
__mini_setControls = function (controls, contentEl, scope) {
    //这里的this._contentEl = this.el this代表组件实例
    contentEl = contentEl || this._contentEl;
    scope = scope || this;

    if (!controls)
        controls = [];
    if (!mini.isArray(controls))
        controls = [controls];

    for (var i = 0, l = controls.length; i < l; i++) {
        var c = controls[i];
        if (typeof c == "string") {
            if (c.indexOf("#") == 0)
                c = mini.byId(c);
        } else if (mini.isElement(c)) {
        } else {
            c = mini.getAndCreate(c);
            c = c.el;
        }
        if (!c)
            continue;
        mini.append(contentEl, c);
    }
    mini.parse(contentEl);
    scope.doLayout();
    return scope;
}
/**
 * 用于暂存正在做调整的组件，实质是为了避免重复操作的一个策略。
 * @private
 */
mini._Layouts = {};

/**
 * 调整指定组件内的布局，如果不指定则调整整个页面的布局，调整的动作调用组件的dolayout方法完成。
 * @param el 指定调整范围，可以使 ID,DOM,组件对象
 * @param mustLayout {Boolean}设置是否强制重新调整，如果不设置，默认已经调整过的组件不再重新调整
 * @returns 无
 */
mini.layout = function (el, mustLayout) {
    if (!document.body) return;

    function doLayout(el) {
        if (!el) return;

        var control = mini.get(el);
        if (control) {

            if (control.doLayout) {
                if (!mini._Layouts[control.uid]) {
                    mini._Layouts[control.uid] = control;

                    if (mustLayout !== false || control.isFixedSize() == false) {
                        control.doLayout(false);
                    }

                    delete mini._Layouts[control.uid];
                }
            }
        } else {
            var cs = el.childNodes;
            if (cs) {
                for (var i = 0, l = cs.length; i < l; i++) {
                    var cel = cs[i];
                    doLayout(cel);
                }
            }
        }
    }

    if (!el)
        el = document.body;
    doLayout(el);
    if (el == document.body) {
        mini.layoutIFrames();
    }

}
/**
 * 設置生成组件属性的值，使用生成HTML结构替换页面声明组件使用的占位HTML标签。此方法一般采用mini.applyTo.call()方式调用。
 * @param el 被处理的ID，DOM，或者组件实例
 * @return 返回组件实例
 */
mini.applyTo = function (el) {
    el = mini.byId(el);
    if (!el)
        return this;
    if (mini.get(el)) throw new Error("not applyTo a mini control");

    var config = this.getAttrs(el);
    //這一句很奇怪，因為所有組件的getAttrs的定義中沒有與_applyTo屬性相關代碼，
    //看起來是一句無用代碼。或者一個內存洩漏問題的補丁。
    delete config._applyTo;

    //设置默认值
    if (mini.isNull(config.defaultValue) && !mini.isNull(config.value)) {
        config.defaultValue = config.value;
    }

    //判斷生成組件Html是直接添加到定義標籤內了還是重新構建的，如果是重新構建的則替換掉定義標籤。
    var p = el.parentNode;
    if (p && this.el != el) {
        p.replaceChild(this.el, el);
    }

    this.set(config);
    this._afterApply(el);

    return this;
}
/**
 * 无用属性
 * @private
 */
mini._Removes = [];

/**#@+
 * @returns 无
 * @private
 * @function
 */

/**
 * 从给定DOM对象 el中获取attrs数组指定的参数，将获取到的参数添加到config对象中。
 * @param el 属性来源DOM对象
 * @param config 属性存储对象
 * @param attrs 待获取属性数组
 */
mini._ParseString = function (el, config, attrs) {
    for (var i = 0, l = attrs.length; i < l; i++) {
        var property = attrs[i];

        var value = mini.getAttr(el, property);
        if (value) {
            config[property] = value;
        }
    }
}
/**
 * 从给定DOM对象 el中获取attrs指定的参数，参数值解析为布尔值，将获取到的参数添加到config对象中。
 * @param el 属性来源DOM对象
 * @param config 属性存储对象
 * @param attrs 待获取属性数组
 */
mini._ParseBool = function (el, config, attrs) {
    for (var i = 0, l = attrs.length; i < l; i++) {
        var property = attrs[i];
        var value = mini.getAttr(el, property);
        if (value) {
            config[property] = value == "true" ? true : false;
        }
    }
}
/**
 * 从给定DOM对象 el中获取attrs指定的参数，参数值解析为Int，将获取到的参数添加到config对象中。
 * @param el 属性来源DOM对象
 * @param config 属性存储对象
 * @param attrs 待获取属性数组
 */
mini._ParseInt = function (el, config, attrs) {
    for (var i = 0, l = attrs.length; i < l; i++) {
        var property = attrs[i];
        var value = parseInt(mini.getAttr(el, property));
        if (!isNaN(value)) {
            config[property] = value;
        }
    }
}
/**#@- */

/**
 * 解析子节点属性，递归解析。
 * @param el 解析范围
 * @returns 返回解析的结果数组包括所有子节点属性的数组
 * @private
 * @function
 */
mini._ParseColumns = function (el) {
    var columns = [];
    var cs = mini.getChildNodes(el);

    for (var i = 0, l = cs.length; i < l; i++) {
        var node = cs[i];
        var jq = jQuery(node);

        var column = {};
        var editor = null, filter = null;

        //可以像到的使用范围是grid
        var subCs = mini.getChildNodes(node);
        if (subCs) {
            for (var ii = 0, li = subCs.length; ii < li; ii++) {
                var subNode = subCs[ii];
                var property = jQuery(subNode).attr("property");
                if (!property)
                    continue;
                property = property.toLowerCase();
                if (property == "columns") {	//grid中嵌入的单元个组件。
                    column.columns = mini._ParseColumns(subNode);
                    jQuery(subNode).remove();
                }
                if (property == "editor" || property == "filter") {

                    var className = subNode.className;
                    var classes = className.split(" ");
                    for (var i3 = 0, l3 = classes.length; i3 < l3; i3++) {
                        var cls = classes[i3];
                        var clazz = mini.getClassByUICls(cls);
                        if (clazz) {
                            var ui = new clazz();

                            if (property == "filter") {
                                filter = ui.getAttrs(subNode);
                                filter.type = ui.type;
                            } else {
                                editor = ui.getAttrs(subNode);
                                editor.type = ui.type;
                            }
                            break;
                        }
                    }

                    jQuery(subNode).remove();
                }
            }
        }

        column.header = node.innerHTML;
        //扩展数据类型--百分比，扩展值为空时的显示值（emptyText）  赵美丹 2013-04-07
        mini._ParseString(node, column,
		["name", "header", "field", "editor", "filter", "renderer", "width", "type", "renderer",
		"headerAlign", "align", "headerCls", "cellCls", "headerStyle", "cellStyle"
		, "displayField"
		, "dateFormat", "listFormat", "mapFormat",
		'trueValue', "falseValue", "dataType", 'vtype', "currencyUnit",
		"summaryType", "summaryRenderer", "groupSummaryType", "groupSummaryRenderer",
        "defaultValue", "defaultText", "decimalPlaces", "data-options", "emptyText"
		]
		);
        //解决allowResize错写为allowReisze 赵美丹 2012-11-29
        mini._ParseBool(node, column,
		["visible", "readOnly", "allowSort", "allowResize", "allowMove", "allowDrag", "autoShowPopup",
		"unique", "showPercent", "autoEscape"
		]
		);
        if (editor)
            column.editor = editor;
        if (filter)
            column.filter = filter;

        if (column.dataType)
            column.dataType = column.dataType.toLowerCase();
        if (column.defaultValue === "true") column.defaultValue = true;
        if (column.defaultValue === "false") column.defaultValue = false;

        columns.push(column);
        var options = column["data-options"];
        if (options) {
            options = eval("(" + options + ")");
            if (options) {

                mini.copyTo(column, options);
            }
        }

    }

    return columns;
}
mini._topWindow = null;
mini._getTopWindow = function () {
    if (mini._topWindow) return mini._topWindow;
    var ps = [];
    function getParents(me) {
        try {
            me["___try"] = 1;
            ps.push(me);
        } catch (ex) {
        }
        if (me.parent && me.parent != me) {
            getParents(me.parent);
        }
    }

    getParents(window);
    mini._topWindow = ps[ps.length - 1];
    return mini._topWindow;
}
var __ps = mini.getParams();

if (__ps._winid) {
    try {
        window.Owner = mini._getTopWindow()[__ps._winid];
    } catch (ex) {
    }
}

mini._WindowID = "w" + Math.floor(Math.random() * 10000);
mini._getTopWindow()[mini._WindowID] = window;

/**
 * 负责记录创建的iframe数量。
 * @private
 * @default 1
 */
mini.__IFrameCreateCount = 1;

/**
 * 创建一个新的iframe DOM对象
 * @param url iframe地址。
 * @param onIFrameLoad iframe 加载完成之后的回调函数。
 * @returns 新创建的iframe DOM对象
 */
mini.createIFrame = function (url, onIFrameLoad) {
    var fnName = "__iframe_onload" + mini.__IFrameCreateCount++;
    window[fnName] = __OnLoad;

    if (!url)
        url = "";
    var urls = url.split("#");
    url = urls[0];

    var t = '_t=' + Math.floor(Math.random() * 1000000);
    if (url.indexOf("?") == -1) {
        url += "?" + t;
    } else {
        url += "&" + t;
    }
    if (urls[1]) {
        url = url + "#" + urls[1];
    }

    var s = '<iframe style="width:100%;height:100%;" onload="' + fnName + '()"  frameborder="0"></iframe>';

    var div = document.createElement("div");
    var iframe = mini.append(div, s);

    var canFireLoad = false;
    setTimeout(function () {
        if (iframe) {
            iframe.src = url;
            canFireLoad = true;
        }
    }, 5);
    var firstLoad = true;
    function __OnLoad() {

        if (canFireLoad == false)
            return;
        setTimeout(function () {
            if (onIFrameLoad)
                onIFrameLoad(iframe, firstLoad);
            firstLoad = false;
        }, 1);
    }

    iframe._ondestroy = function () {

        window[fnName] = mini.emptyFn;	//为什么不直接删除？
        iframe.src = "";
        try {
            iframe.contentWindow.document.write("");
            iframe.contentWindow.document.close();
        } catch (ex) { }
        iframe._ondestroy = null;
        iframe = null;
    }
    return iframe;
}
/**
 * 根据给定参数，在本窗口创建window。
 * @param options 窗口参数
 * @returns win 窗口组件实例
 * @requires window组件
 * @private
 * @function
 */
mini._doOpen = function (options) {
    if (typeof options == "string") {
        options = {
            url: options
        };
    }

    options = mini.copyTo({
        width: 700,
        height: 400,
        allowResize: true,
        allowModal: true,
        closeAction: "destroy",

        title: "",
        titleIcon: "",
        iconCls: "",
        iconStyle: "",
        bodyStyle: "padding: 0",

        url: "",

        showCloseButton: true,
        showFooter: false
    }, options);

    options.closeAction = "destroy";

    var onload = options.onload;
    delete options.onload;
    var ondestroy = options.ondestroy;
    delete options.ondestroy;
    var url = options.url;
    delete options.url;

    var win = new mini.Window();
    win.set(options);
    win.load(url,
	onload,
	ondestroy
	);
    win.show();

    return win;
}
/**
 * 在最外层窗体创建弹出窗
 * @name openTop
 * @param options 窗口参数
 * @returns win 窗口组件实例
 * @requires window组件
 * @function
 */
mini.open = function (options) {
    if (!options)
        return;
    var url = options.url;
    if (!url)
        url = "";
    var urls = url.split("#");
    var url = urls[0];

    var t = "_winid=" + mini._WindowID;
    if (url.indexOf("?") == -1) {
        url += "?" + t;
    } else {
        url += "&" + t;
    }
    if (urls[1]) {
        url = url + "#" + urls[1];
    }

    options.url = url;
    options.Owner = window;
    var ps = [];
    function getParents(me) {
        if (me.mini)
            ps.push(me);
        if (me.parent && me.parent != me) {
            getParents(me.parent);
        }
    }

    getParents(window);
    var win = ps[ps.length - 1];
    //在最外层创建弹出窗。
    return win["mini"]._doOpen(options);
}
mini.openTop = mini.open;

/**
 * ajax请求，获取格式为Json的数据
 * @param url 请求地址
 * @param params 参数
 * @param success 成功回调函数
 * @param error 失败回调函数
 * @param type 请求类型如get/post
 * @returns json对象
 * @function
 */
mini.getData = function (url, params, success, error, type) {
    var text = mini.getText(url, params, success, error, type);
    var data = mini.decode(text);
    return data;
}
/**
 * ajax请求，获取数据格式为Text
 * @param url 请求地址
 * @param params 参数
 * @param success 成功回调函数
 * @param error 失败回调函数
 * @param type 请求类型如get/post
 * @returns 字符串
 * @function
 * @requires jQuery.ajax
 */
mini.getText = function (url, params, success, error, type) {
    var returnText = null;
    mini.ajax({
        url: url,
        data: params,
        async: false,
        type: type ? type : "get",
        cache: false,
        success: function (text, http) {
            returnText = text;
            if (success) success(text, http);
        },
        error: error
    });
    return returnText;
}
/**
 * 更新指定范围内的内容。
 * @param options {String|Object} 可以使一个Url地址，也可以使一个json对象{url:'xx',el:xx}
 * @param el {Object} DOM对象
 * @returns 无
 * @function
 */
mini.update = function (options, el) {
    if (typeof options == "string")
        options = {
            url: options
        };
    if (el)
        options.el = el;
    var html = mini.loadText(options.url);
    mini.innerHTML(options.el, html);
    mini.parse(options.el);
}
/**
 * 获取给定组件类的实例，如果没有实例则新建一个，如果已经存在则直接返回。使用到了单例模式
 * @param Type {String|Object} 可以使组件类名，也可以使组件类引用
 * @returns 组件单例
 * @function
 */
mini.createSingle = function (Type) {
    if (typeof Type == "string") {
        Type = mini.getClass(Type);
    }
    if (typeof Type != "function")
        return;
    var obj = Type.single;
    if (!obj) {
        obj = Type.single = new Type();
    }
    return obj;
}
/**
 * 在最外层window获取给定组件类的一个实例，如果没有这个实例则新创建一个，如果已经存在则直接返回。使用到了单例设计模式
 * @param Type 组件类
 * @returns 组件单例
 * @function
 */
mini.createTopSingle = function (Type) {
    if (typeof Type != "function")
        return;

    var typeName = Type.prototype.type;
    if (top && top != window && top.mini && top.mini.getClass(typeName)) {
        return top.mini.createSingle(typeName);
    } else {
        return mini.createSingle(Type);
    }
}
/**
 * @namespace mini.sortTypes 提供了几个使用的帮助方法。由于sortTypes内的几个方法都使用""字符串作为属性名，
 * 所以JSDOC无法生成这几个方法的API
 */
mini.sortTypes = {

    /**
	 * 字符串字母变大写
	 * @param s 字符串
	 * @return 变为大写的字符串
	 */
    "string": function (s) {
        return String(s).toUpperCase();
    },
    /**
	 * 返回时间毫秒数
	 * @param s 时间对象，或者是时间字符窜。
	 * @returns 返回给定时间代表的毫秒数。
	 */
    "date": function (s) {
        if (!s) {
            return 0;
        }
        if (mini.isDate(s)) {
            return s.getTime();
        }
        return mini.parseDate(String(s));
    },
    /**
	 * 用于对金额的操作，去除复数金额每三位的“,”分隔符
	 * @param s 待处理金额
	 * @returns 剔除分隔符后的金额数
	 */
    "float": function (s) {
        var val = parseFloat(String(s).replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    },
    /**
	 * 用于对金额的操作，去除整数金额每三位的分隔符
	 * @param s 待处理金额
	 * @returns 剔除分隔符后的金额数
	 */
    "int": function (s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    },
    "currency": function (s) {
        var val = parseFloat(String(s).replace(/,/g, ""));
        return isNaN(val) ? 0 : val;
    }

};


//重复定义，在上面已经有一份定义了。
mini.emptyFn = function () {
};
/**
 * 一个内部适用的克隆方法，深层克隆，但是克隆过程中会删除所有_state , _id, _pid属性。
 * 这个方法的实现，区别于传统克隆方法实现，采用了对象字符串互转换的方式，产生一个新的克隆对象。
 * @param o 待克隆对象。
 * @returns 新对象。
 */
mini.clone = function (jsonObj, _clear) {
    /**
    if (o === null || o === undefined) return o;
    var json = mini.encode(o);
    var obj = mini.decode(json);
    **/
    function clearProp(arr) {
        for (var i = 0, l = arr.length; i < l; i++) {
            var o = arr[i];
            delete o._state;
            delete o._id;
            delete o._pid;
            delete o._uid;
            for (var p in o) {
                var v = o[p];
                if (v instanceof Array) clearProp(v);
            }
        }
    }
    /**
    if (_clear !== false) {
        clearProp(obj instanceof Array ? obj : [obj]);
    }

    return obj;
    **/
    //修改整个方法 原先的方法性能太差了 潘正锋
    var buf;
    if (jsonObj instanceof Array) {
        buf = [];
        var i = jsonObj.length;
        while (i--) {
            buf[i] = arguments.callee(jsonObj[i]);
        }
        if (_clear !== false) {
            clearProp(buf instanceof Array ? buf : [buf]);
        }
        return buf;
    } else if (typeof jsonObj == "function") {
        return jsonObj;
    } else if (jsonObj instanceof Object) {
        buf = {};
        for (var k in jsonObj) {
            buf[k] = arguments.callee(jsonObj[k]);
        }
        if (_clear !== false) {
            clearProp(buf instanceof Array ? buf : [buf]);
        }
        return buf;
    } else {
        return jsonObj;
    }


}


mini.append = function (to, html) {
    to = mini.byId(to);
    if (!html || !to) return;
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
            if (!html) return;
            to.appendChild(html);
            return html;
        } else {
            if (html.indexOf("<tr") == 0) {
                return jQuery(to).append(html)[0].lastChild;
                return;
            }

            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
            while (d.firstChild) {
                to.appendChild(d.firstChild);
            }
            return html;
        }
    } else {
        to.appendChild(html);
        return html;
    }


}
mini.prepend = function (to, html) {
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
        } else {
            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
        }
    }
    return jQuery(to).prepend(html)[0].firstChild;
}
mini.after = function (to, html) {
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
        } else {
            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
        }
    }
    if (!html || !to) return;
    to.nextSibling ? to.parentNode.insertBefore(html, to.nextSibling) : to.parentNode.appendChild(html);
    return html;
}
mini.before = function (to, html) {
    if (typeof html == "string") {
        if (html.charAt(0) == '#') {
            html = mini.byId(html);
        } else {
            var d = document.createElement("div");
            d.innerHTML = html;
            html = d.firstChild;
        }
    }
    if (!html || !to) return;
    to.parentNode.insertBefore(html, to);
    return html;
}

mini.__wrap = document.createElement('div');
mini.createElements = function (html) {
    mini.removeChilds(mini.__wrap);
    var isTr = html.indexOf("<tr") == 0;
    if (isTr) {
        html = '<table>' + html + '</table>';
    }
    mini.__wrap.innerHTML = html;
    return isTr ? mini.__wrap.firstChild.rows : mini.__wrap.childNodes;
}


/**
 * #@+
 * @function
 */
/**
 * mini_byId 方法提供使用Id 或 #Id选择DOM的功能。如果参数不为字符串则直接返回参数本身。
 * @exports mini_byId as mini.byId
 * @param id id或者DOM对象 id可以带"#"前缀
 * @returns 返回DOM对象
 */
mini_byId = function (id, context) {
    if (typeof id == "string") {
        if (id.charAt(0) == '#') id = id.substr(1);
        var el = document.getElementById(id);
        if (el) return el;
        if (context) {

            var els = context.getElementsByTagName("*");
            for (var i = 0, l = els.length; i < l; i++) {
                var el = els[i];
                if (el.id == id) return el;
            }
            el = null;
        }
        return el;
    } else {
        return id;
    }
}

/**
 * 判断dom对象是否 包含给定的样式表类名。
 * @exports mini_hasClass as mini.hasClass
 * @param el ID或者DOM
 * @param className 样式类名
 * returns 是否包含{Boolean}
 */
mini_hasClass = function (el, className) {
    el = mini.byId(el);
    if (!el) return;
    if (!el.className) return false;
    var clss = String(el.className).split(" ");
    return clss.indexOf(className) != -1;
}

/**
 * 为dom对象增加样式类名
 * @exports mini_addClass as mini.addClass
 * @param el ID或者DOM
 * @param className 样式类名
 * @returns 无
 * @requires jQuery.addClass
 */
mini_addClass = function (el, className) {
    if (!className)
        return;
    if (mini.hasClass(el, className) == false) {
        jQuery(el).addClass(className);
    }
}
/**
 * 为dom对象删除样式类名
 * @exports mini_removeClass as mini.removeClass
 * @param el ID或者DOM或者jquery对象
 * @param className 样式类名
 * @returns 无
 * @requires jQuery.removeClass
 */
mini_removeClass = function (el, className) {
    if (!className)
        return;
    jQuery(el).removeClass(className);
}
/**
 * 获取元素的四个边的margin值
 * @exports mini_getMargins as mini.getMargins
 * @param el ID或者DOM或者jquery对象
 * @returns json对象包括上右下左四个方向的margin值
 * @requires jQuery.css
 */
mini_getMargins = function (el) {
    el = mini.byId(el);
    var jq = jQuery(el);
    return {
        top: parseInt(jq.css("margin-top"), 10) || 0,
        left: parseInt(jq.css("margin-left"), 10) || 0,
        bottom: parseInt(jq.css("margin-bottom"), 10) || 0,
        right: parseInt(jq.css("margin-right"), 10) || 0
    };
}
/**
 * 获取元素的四个边的Border值
 * @exports mini_getBorders as mini.getBorders
 * @param el ID或者DOM或者jquery对象
 * @returns json对象包括上右下左四个方向的border值
 * @requires jQuery.css
 */
mini_getBorders = function (el) {
    el = mini.byId(el);
    var jq = jQuery(el);
    return {
        top: parseInt(jq.css("border-top-width"), 10) || 0,
        left: parseInt(jq.css("border-left-width"), 10) || 0,
        bottom: parseInt(jq.css("border-bottom-width"), 10) || 0,
        right: parseInt(jq.css("border-right-width"), 10) || 0
    };
}
/**
 * 获取元素的四个边的Padding值
 * @exports mini_getPaddings as mini.getPaddings
 * @param el ID或者DOM或者jquery对象
 * @returns json对象包括上右下左四个方向的padding值
 * @requires jQuery.css
 */
mini_getPaddings = function (el) {
    el = mini.byId(el);
    var jq = jQuery(el);
    return {
        top: parseInt(jq.css("padding-top"), 10) || 0,
        left: parseInt(jq.css("padding-left"), 10) || 0,
        bottom: parseInt(jq.css("padding-bottom"), 10) || 0,
        right: parseInt(jq.css("padding-right"), 10) || 0
    };
}
/**
 * 给元素设置宽度，宽度会减去左右padding和border
 * @exports mini_setWidth as mini.setWidth
 * @param el ID或者DOM或者jquery对象
 * @param width 宽度值
 * @requires jQuery
 */
mini_setWidth = function (el, width) {
    el = mini.byId(el);
    width = parseInt(width);
    if (isNaN(width) || !el)
        return;
    if (jQuery.boxModel) {
        var p = mini.getPaddings(el);
        var b = mini.getBorders(el);
        width = width - p.left - p.right - b.left - b.right;
    }

    if (width < 0)
        width = 0;
    el.style.width = width + "px";
}
/**
 * 给元素设置高度，高度会减去上下padding 和 border
 * @exports mini_setHeight as mini.setHeight
 * @param el ID或者DOM或者jquery对象
 * @param height 高度值
 * @requires jQuery
 */
mini_setHeight = function (el, height) {
    el = mini.byId(el);
    height = parseInt(height);
    if (isNaN(height) || !el)
        return;
    if (jQuery.boxModel) {
        var p = mini.getPaddings(el);
        var b = mini.getBorders(el);
        height = height - p.top - p.bottom - b.top - b.bottom;
    }

    if (height < 0)
        height = 0;
    el.style.height = height + "px";
}
/**
 * 获取元素宽度，如果第二个参数设置为true获取的是width,不设置第二个参数获取的是包括padding和border的宽度
 * @exports mini_getWidth as mini.getWidth
 * @param el ID或者DOM或者jquery对象
 * @param content {Boolean} 是否包括padding 和border
 * @returns 宽度
 * @requires jQuery.width(),jQuery.outerWidth()
 */
mini_getWidth = function (el, content) {
    el = mini.byId(el);
    if (el.style.display == "none" || el.type == "text/javascript")
        return 0;
    return content ? jQuery(el).width() : jQuery(el).outerWidth();
}
/**
 * 获取元素高度，如果第二个参数设置为true获取的是height,不设置第二个参数获取的是包括padding和border的高度
 * @exports mini_getHeight as mini.getHeight
 * @param el ID或者DOM或者jquery对象
 * @param content {Boolean} 是否包括padding 和border
 * @returns 高度度
 * @requires jQuery.height(),jQuery.outerHeight()
 */
mini_getHeight = function (el, content) {
    el = mini.byId(el);
    if (el.style.display == "none" || el.type == "text/javascript")
        return 0;
    return content ? jQuery(el).height() : jQuery(el).outerHeight();
}
/**
 * 为元素设置位置left/top和宽高width/height
 * @exports mini_setBox as mini.setBox
 * @param el 针对的目标元素ID或者DOM或者jquery对象
 * @param x left位置
 * @param y top位置
 * @param width 宽
 * @param height 高
 */
mini_setBox = function (el, x, y, width, height) {
    if (y === undefined) {
        y = x.y;
        width = x.width;
        height = x.height;
        x = x.x;
    }
    mini.setXY(el, x, y);
    mini.setWidth(el, width);
    mini.setHeight(el, height);
}
/**
 * 获取元素位置left/top和宽高width/height。
 * @exports mini_getBox as mini.getBox
 * @param el 目标元素ID或者DOM或者jquery对象
 * @returns json对象，包括x,y,width,height,left,top,right,bottom 等6个属性
 */
mini_getBox = function (el) {
    var xy = mini.getXY(el);
    var box = {
        x: xy[0],
        y: xy[1],
        width: mini.getWidth(el),
        height: mini.getHeight(el)
    };
    box.left = box.x;
    box.top = box.y;
    box.right = box.x + box.width;
    box.bottom = box.y + box.height;
    return box;
}
/**
 * 为DOM设置内联样式，与JQuery.css相比，支持多了调整格式的步骤，个人认为没有太大意义。
 * @exprots mini_setStyle as mini.setStyle
 * @param el 标元素ID或者DOM或者jquery对象
 * @param style {String} 样式字符串
 * @requires jQuery.css()
 */
mini_setStyle = function (el, style) {
    el = mini.byId(el);
    if (!el || typeof style != "string")
        return;

    var jq = jQuery(el);
    var styles = style.toLowerCase().split(";");
    for (var i = 0, l = styles.length; i < l; i++) {
        var s = styles[i];
        var ss = s.split(":");
        if (ss.length == 2) {
            jq.css(ss[0].trim(), ss[1].trim());
        }
    }
}
/**
 * 获取元素的样式信息，这里获取到的不仅仅包括内联样式也包括外联样式。
 * @exprots mini_getStyle as mini.getStyle
 * @param el 标元素ID或者DOM或者jquery对象
 * @param style {String} 样式字属性名
 * @returns 样式属性值
 */
mini_getStyle = function () {
    var f = document.defaultView;
    return new Function('el', 'style', [
	"style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));",
	"style=='float' && (style='",
	f ? 'cssFloat' : 'styleFloat',
	"');return el.style[style] || ",
	f ? 'window.getComputedStyle(el, null)[style]' : 'el.currentStyle[style]',
	' || null;'].join(''));
}();
/**
 * 判断参数p是否是c的祖先节点。注意，p === c也被认为是正确的。
 * @exports mini_isAncestor as mini.isAncestor
 * @param p 祖先对象
 * @param c 子孙对象
 * @return 判断结果{Boolean}
 */
mini_isAncestor = function (p, c) {
    var ret = false;
    p = mini.byId(p);
    c = mini.byId(c);
    if (p === c)
        return true;	//两个DOM绝对相等。
    if (p && c) {
        if (p.contains) {
            try {
                return p.contains(c);	//判断包含关系p包含c
            } catch (e) {
                return false;
            }
        } else if (p.compareDocumentPosition) {
            return !!(p.compareDocumentPosition(c) & 16);	//p包含c。
        } else {
            while (c = c.parentNode) {
                ret = c == p || ret;
            }
        }
    }
    return ret;
}
/**
 * 在N层内找到有 cls 定义的样式类名的祖先节点。
 * @exports mini_findParent as mini.findParent
 * @param p 起始节点，可以是ID,DOM
 * @param cls 要匹配的样式类名
 * @param maxDepth 最多向上查找的层次，默认值为50
 * @returns 匹配的祖先节点，或者null
 * @function
 */
mini_findParent = function (p, cls, maxDepth) {
    p = mini.byId(p);
    var b = document.body, depth = 0, stopEl;
    maxDepth = maxDepth || 50;
    if (typeof maxDepth != "number") {
        stopEl = mini.byId(maxDepth);
        maxDepth = 10;
    }
    while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
        if (mini.hasClass(p, cls)) {
            return p;
        }
        depth++;
        p = p.parentNode;
    }
    return null;
}
/**
 * #@-
 */
mini.copyTo(mini, {

    byId: mini_byId,
    hasClass: mini_hasClass,
    addClass: mini_addClass,
    removeClass: mini_removeClass,
    getMargins: mini_getMargins,
    getBorders: mini_getBorders,
    getPaddings: mini_getPaddings,
    setWidth: mini_setWidth,
    setHeight: mini_setHeight,
    getWidth: mini_getWidth,
    getHeight: mini_getHeight,
    setBox: mini_setBox,
    getBox: mini_getBox,
    setStyle: mini_setStyle,
    getStyle: mini_getStyle,

    /**
	 * #@+
	 * @memberOf mini
	 */

    /**
	 * 重绘元素DOM，实际只做了一次添加和删除样式类mini-repaint的操作。
	 * @param el 目标元素ID或者DOM或者jquery对象
	 */
    repaint: function (el) {
        if (!el)
            el = document.body;
        mini.addClass(el, "mini-repaint");
        setTimeout(function () {
            mini.removeClass(el, "mini-repaint");
        }, 1);
    },
    /**
	 * 取得给定元素的宽，高
	 * @param el 给定元素，可以使 ID，DOM，jQuery对象
	 * @param content {Boolean} 是否包括Padding 和border
	 * @returns Json对象{width:xx,height:xx}
	 * @requires mini.getWidth, mini.getHeight
	 */
    getSize: function (el, content) {
        return {
            width: mini.getWidth(el, content),
            height: mini.getHeight(el, content)
        };
    },
    /**
	 * 设置给定元素的宽，高
	 * @param el 给定元素，可以使 ID，DOM，jQuery对象
	 * @param width 宽度
	 * @param height 高度
	 * @requires mini.setWidth, mini.setHeight
	 */
    setSize: function (el, width, height) {
        mini.setWidth(el, width);
        mini.setHeight(el, height);
    },
    /**
	 * 设置指定元素的 left 位置值
	 * @param el 给定元素，可以使 ID，DOM，jQuery对象
	 * @param x left 位置值
	 * @requires jQuery, mini.setXY
	 */
    setX: function (el, x) {
        x = parseInt(x);
        var xy = jQuery(el).offset();

        var y = parseInt(xy.top);
        if (y === undefined)
            y = xy[1];
        mini.setXY(el, x, y);
    },
    /**
	 * 设置指定元素的 top 位置值
	 * @param el 给定元素，可以使 ID，DOM，jQuery对象
	 * @param y top 位置值
	 * @requires jQuery, mini.setXY
	 */
    setY: function (el, y) {
        y = parseInt(y);
        var xy = jQuery(el).offset();
        var x = parseInt(xy.left);
        if (x === undefined)
            x = xy[0];
        mini.setXY(el, x, y);
    },
    /**
	 * 设置指定元素的 left和top 位置值
	 * @param el 给定元素，可以使 ID，DOM，jQuery对象
	 * @param x left 位置值
	 * @param y top 位置值
	 * @requires jQuery, mini.setXY
	 */
    setXY: function (el, x, y) {

        var xy = {
            left: parseInt(x),
            top: parseInt(y)
        };
        jQuery(el).offset(xy);
        //去除重复调用 赵美丹 2012-12-07
        //jQuery(el).offset(xy);
    },
    /**
	 * 取得指定元素的 left和top 位置值
	 * @param el 给定元素，可以使 ID，DOM，jQuery对象
	 * @returns 数组[left, top]
	 */
    getXY: function (el) {
        var xy = jQuery(el).offset();
        return [parseInt(xy.left), parseInt(xy.top)];
    },
    /**
	 * 获取窗口的x, y, left, top, right, bottom, width, height等信息。
	 * @returns json对象
	 * @requires jQuery.width(), jQuery.height(), jQuery.scrollLeft(), jQuery.scrollTop()
	 */
    getViewportBox: function () {
        var w = jQuery(window).width(), h = jQuery(window).height();
        var x = jQuery(document).scrollLeft(), y = jQuery(document.body).scrollTop();
        if (document.documentElement)
            y = document.documentElement.scrollTop;

        return {
            x: x,
            y: y,
            width: w,
            height: h,
            right: x + w,
            bottom: y + h
        };
    },
    /**
	 * 获取DOM对象的子节点，第二个参数如果为true则返回数组中包含所有种类的节点，不仅限于Element节点。
	 * @param el {String|DOMObject} ID或者DOM
	 * @param all {Boolean} 如果是true则返回所有子节点，不仅限于Element类型节点
	 * @return 子节点数组
	 */
    getChildNodes: function (el, all) {
        el = mini.byId(el);
        if (!el)
            return;
        var nodes = el.childNodes;
        var cs = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var c = nodes[i];
            if (c.nodeType == 1 || all === true) {
                cs.push(c);
            }
        }
        return cs;
    },
    /**
	 * 删除子元素，第二个参数指定白名单（不删除子元素名单）
	 * @param el {String|DOMObject} ID或者DOM
	 * @param butEl 白名单，不希望被删除的元素
	 * @requires mini.getChildNodes
	 */
    removeChilds: function (el, butEl) {
        el = mini.byId(el);
        if (!el)
            return;
        var cs = mini.getChildNodes(el, true);
        for (var i = 0, l = cs.length; i < l; i++) {
            var c = cs[i];
            if (butEl && c == butEl) {
            } else {
                el.removeChild(cs[i]);
            }
        }
    },
    isAncestor: mini_isAncestor,
    findParent: mini_findParent,

    /**
	 * 在给定元素内找到第一个包含给定样式表类名的子元素。
	 * @param el {String|DOMObject} ID或者DOM
	 * @param cls 指定的样式类名
	 * @return 匹配的子元素，或者是第一个参数本身
	 */
    findChild: function (el, cls) {
        el = mini.byId(el);
        var els = el.getElementsByTagName('*');
        for (var i = 0, l = els.length; i < l; i++) {
            var el = els[i];
            if (mini.hasClass(el, cls))
                return el;
        }
    },
    /**
	 * 判断p 是否是 c的祖先，这里 p == c也被认为正确。 重复定义了。
	 * @ignore
	 */
    isAncestor: function (p, c) {
        var ret = false;
        p = mini.byId(p);
        c = mini.byId(c);
        if (p === c)
            return true;
        if (p && c) {
            if (p.contains) {
                try {
                    return p.contains(c);
                } catch (e) {
                    return false
                }
            } else if (p.compareDocumentPosition) {
                return !!(p.compareDocumentPosition(c) & 16);
            } else {
                while (c = c.parentNode) {
                    ret = c == p || ret;
                }
            }
        }
        return ret;
    },
    /**
	 * 计算el与 target两个元素的位置距离。
	 * @param el {String|DOMObject} ID或者DOM，代表起始元素
	 * @param target {String|DOMObject} ID或者DOM，代表终止元素
	 * @returns 数组，[left 差值, top差值]
	 */
    getOffsetsTo: function (el, target) {
        var o = this.getXY(el), e = this.getXY(target);
        return [o[0] - e[0], o[1] - e[1]];
    },
    /**
	 *设置滚动条，将el调整到可视区域。
	 */
    scrollIntoView: function (el, container, hscroll) {
        var c = mini.byId(container) || document.body,
		o = this.getOffsetsTo(el, c),
		l = o[0] + c.scrollLeft,
		t = o[1] + c.scrollTop,
		b = t + el.offsetHeight,
		r = l + el.offsetWidth,
		ch = c.clientHeight,
		ct = parseInt(c.scrollTop, 10),
		cl = parseInt(c.scrollLeft, 10),
		cb = ct + ch,
		cr = cl + c.clientWidth;

        if (el.offsetHeight > ch || t < ct) {
            c.scrollTop = t;
        } else if (b > cb) {
            c.scrollTop = b - ch;
        }
        c.scrollTop = c.scrollTop;

        if (hscroll !== false) {
            if (el.offsetWidth > c.clientWidth || l < cl) {
                c.scrollLeft = l;
            } else if (r > cr) {
                c.scrollLeft = r - c.clientWidth;
            }
            c.scrollLeft = c.scrollLeft;
        }
        return this;
    },
    /**
	 * 设置给定元素的透明度
	 * @param el {String|DOMObject} ID或者DOM
	 * @param opacity 透明度数值 0~1之间
	 * @requires jQuery.css()
	 */
    setOpacity: function (el, opacity) {
        jQuery(el).css({
            "opacity": opacity
        });
    },
    /**
	 * 设置元素内容是否可以被选中
	 * @param el {String|DOMObject} ID或者DOM
	 * @param selected {Boolean} 是否可已被选中
	 */
    selectable: function (el, selected) {
        el = mini.byId(el);
        if (!!selected) {
            jQuery(el).removeClass('mini-unselectable');
            if (isIE)
                el.unselectable = "off";
            else {
                el.style.MozUserSelect = '';
                el.style.KhtmlUserSelect = '';
                el.style.UserSelect = '';

            }
        } else {
            jQuery(el).addClass('mini-unselectable');
            if (isIE)
                el.unselectable = 'on';
            else {
                el.style.MozUserSelect = 'none';
                el.style.UserSelect = 'none';
                el.style.KhtmlUserSelect = 'none';
            }
        }
    },
    /**
	 * 设置某段文字被选中
	 * @param el {String|DOMObject} ID或者DOM
	 * @param iStart 选中的起始位置
	 * @param iEnd 选中的截止位置
	 */
    selectRange: function (el, iStart, iEnd) {
        if (el.createTextRange) {
            var oRange = el.createTextRange();
            oRange.moveStart("character", iStart);
            oRange.moveEnd("character", iEnd - el.value.length);
            oRange.select();
        } else {
            if (el.setSelectionRange) {
                el.setSelectionRange(iStart, iEnd);
            }
        }
        try {
            el.focus();
        } catch (e) {
        }
    },
    /**
	 * 获取选中的起止位置。
	 * @param el {String|DOMObject} ID或者DOM
	 * @returns 数组[起位置，止位置]
	 */
    getSelectRange: function (el) {
        el = mini.byId(el);
        if (!el)
            return;
        try {
            el.focus();
        } catch (e) {
        }
        var start = 0, end = 0;
        if (el.createTextRange) {

            var r = document.selection.createRange().duplicate();
            r.moveEnd('character', el.value.length);
            if (r.text === '') {
                start = el.value.length;
            } else {
                start = el.value.lastIndexOf(r.text);
            }

            var r = document.selection.createRange().duplicate();
            r.moveStart('character', -el.value.length);
            end = r.text.length;

        } else {
            start = el.selectionStart;
            end = el.selectionEnd;
        }

        return [start, end];
    }
    /**
	 * #@-
	 */
});

(function () {
    var fixAttr = {
        tabindex: 'tabIndex',
        readonly: 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        maxlength: 'maxLength',
        cellspacing: 'cellSpacing',
        cellpadding: 'cellPadding',
        rowspan: 'rowSpan',
        colspan: 'colSpan',
        usemap: 'useMap',
        frameborder: 'frameBorder',
        contenteditable: 'contentEditable'
    };

    var div = document.createElement('div');
    div.setAttribute('class', 't');
    //这里supportSetAttr用于判断浏览器处理DOM的attribute和property的区别。IE存在这个问题。
    //参考http://www.w3help.org/zh-cn/causes/SD9006
    var supportSetAttr = div.className === 't';

    /**
	 * 为给定元素设置属性
	 * @param el 指定元素DOM对象
	 * @param name 属性名
	 * @param val 属性值
	 */
    mini.setAttr = function (el, name, val) {
        el.setAttribute(supportSetAttr ? name : (fixAttr[name] || name), val);
    }
    /**
	 * 获取指定元素属性值
	 * @param el 指定元素DOM对象
	 * @param name 属性名
	 */
    mini.getAttr = function (el, name) {
        if (name == "value" && (isIE6 || isIE7)) {
            var a = el.attributes[name]
            return a ? a.value : null;
        }

        var v = el.getAttribute(supportSetAttr ? name : (fixAttr[name] || name));

        if (typeof v == "function") {
            v = el.attributes[name].value;
        }

        return v;
    }
})()
mini.copyTo(mini, {

    treeToArray: function (nodes, nodesField, idField, parentIdField, parentId) {
        if (!nodesField)
            nodesField = 'children';
        var array = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            array[array.length] = node;

            if (parentIdField)
                node[parentIdField] = parentId;

            var childrenNodes = node[nodesField];
            if (childrenNodes && childrenNodes.length > 0) {
                var id = node[idField];
                var childrenArray = this.treeToArray(childrenNodes, nodesField, idField, parentIdField, id);
                array.addRange(childrenArray);
            }
        }
        return array;
    },
    arrayToTree: function (data, nodesField, idField, parentIdField) {
        if (!nodesField)
            nodesField = 'children';
        idField = idField || '_id';
        parentIdField = parentIdField || '_pid';

        var nodes = [];

        var idHash = {};
        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            if (!o) continue;
            var id = o[idField];
            if (id !== null && id !== undefined) {
                idHash[id] = o;
            }
            delete o[nodesField];
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var o = data[i];
            var p = idHash[o[parentIdField]];
            if (!p) {
                nodes.push(o);
                continue;
            }
            if (!p[nodesField]) {
                p[nodesField] = [];
            }
            p[nodesField].push(o);
        }
        return nodes;
    }
});
mini.treeToList = mini.treeToArray;
mini.listToTree = mini.arrayToTree;

mini.copyTo(mini, {
    measureText: function (el, text, style) {
        if (!this.measureEl) {
            this.measureEl = mini.append(document.body, '<div></div>');
        }

        this.measureEl.style.cssText = "position:absolute;left:-1000px;top:-1000px;visibility:hidden;";
        if (typeof el == "string") {
            this.measureEl.className = el;

        } else {
            this.measureEl.className = "";

            var j1 = jQuery(el);
            var j2 = jQuery(this.measureEl);
            var csses = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
            for (var i = 0, l = csses.length; i < l; i++) {
                var css = csses[i];
                j2.css(css, j1.css(css));
            }
        }
        if (style)
            mini.setStyle(this.measureEl, style);
        this.measureEl.innerHTML = text;
        return mini.getSize(this.measureEl);
    }
});

//这两个值在run.js中也被执行过一次。
mini.__LastWindowWidth = document.documentElement.clientWidth;
mini.__LastWindowHeight = document.documentElement.clientHeight;

mini.allowLayout = true;	//个人认为这个值是否在onload总设置更合适

/**
 * 判断DOM对象是否显示。
 */
mini.isDisplay = function (p, body) {
    var doc = body || document.body;
    while (1) {
        if (p == null || !p.style)
            return false;	// !p.style没有内联style就认为是不显示！！
        if (p && p.style && p.style.display == "none")
            return false;	//display == "none"肯定是不显示
        if (p == doc)
            return true;
        p = p.parentNode;
    }
    return true;
};
mini.isWindowDisplay = function () {
    try {
        var parentWindow = window.parent;
        var isIFrame = parentWindow != window;

        if (isIFrame) {

            var _iframes = parentWindow.document.getElementsByTagName("iframe");
            var _frames = parentWindow.document.getElementsByTagName("frame");
            var iframes = [];		//保存父页面包含的所有iframe和frame的DOM对象。
            for (var i = 0, l = _iframes.length; i < l; i++) {
                iframes.push(_iframes[i]);
            }
            for (var i = 0, l = _frames.length; i < l; i++) {
                iframes.push(_frames[i]);
            }

            var iframe = null;
            for (var i = 0, l = iframes.length; i < l; i++) {
                var el = iframes[i];
                if (el.contentWindow == window) {
                    iframe = el;
                    break;
                }
            }
            //如果没有找到window对象匹配的Iframe则代表该窗口尚不可用。也就是上没有显示完成
            if (!iframe)
                return false;

            return mini.isDisplay(iframe, parentWindow.document.body);//判断iframe window是否展示。

        } else {
            return true;
        }
    } catch (e) {
        return true;
    }
};
/**
 * window是否显示。显示true/不显示false
 */
mini.WindowVisible = mini.isWindowDisplay();

/**
 * 逐层向下调整iframe布局。
 * @param parentNode 调整范围DOM对象
 */
mini.layoutIFrames = function (parentNode) {
    if (!parentNode)
        parentNode = document.body;
    if (!parentNode) return;
    var iframes = parentNode.getElementsByTagName("iframe");
    setTimeout(function () {
        for (var i = 0, l = iframes.length; i < l; i++) {
            var el = iframes[i];
            try {
                if (mini.isDisplay(el) && mini.isAncestor(parentNode, el)) {
                    if (el.contentWindow.mini) {
                        if (el.contentWindow.mini.WindowVisible == false) {
                            el.contentWindow.mini.WindowVisible = el.contentWindow.mini.isWindowDisplay();
                            el.contentWindow.mini.layout();
                        } else {
                            el.contentWindow.mini.layout(null, false);
                        }
                    }
                    el.contentWindow.mini.layoutIFrames();
                }
            } catch (ex) {
            }
        }
    }, 30);
}
/**
 * 当前zindex最高值
 * @default 1000
 */
mini.zIndex = 1000;

/**
 * 返回一个最高zindex值
 * @returns 当前最高zindex值 + 1
 * @function
 */
mini.getMaxZIndex = function () {
    return mini.zIndex++;
}

function js_isTouchDevice() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}
function js_touchScroll(id) {
    if (js_isTouchDevice()) {
        var el = typeof id == "string" ? document.getElementById(id) : id;
        var scrollStartPos = 0;

        el.addEventListener("touchstart", function (event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
            event.preventDefault();
        }, false);

        el.addEventListener("touchmove", function (event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
            event.preventDefault();
        }, false);
    }
}


mini._placeholder = function (el) {
    el = mini.byId(el);
    if (!el || !isIE || isIE10) return;

    function doLabel() {
        var label = el._placeholder_label;

        if (!label) return;

        var placeholder = el.getAttribute("placeholder");
        if (!placeholder) placeholder = el.placeholder;
        if (!el.value && !el.disabled) {
            label.innerHTML = placeholder;
            label.style.display = "";
        } else {
            label.style.display = "none";
        }
    }

    if (el._placeholder) {
        doLabel();
        return;
    }
    el._placeholder = true;

    var label = document.createElement("label");
    label.className = "mini-placeholder-label";
    el.parentNode.appendChild(label);
    el._placeholder_label = label;

    label.onmousedown = function () {
        el.focus();
    }


    el.onpropertychange = function (e) {
        e = e || window.event;
        if (e.propertyName == "value") {

            doLabel();
        }
    }

    doLabel();


    mini.on(el, "focus", function (e) {
        if (!el.readOnly) {
            label.style.display = "none";
        }
    });
    mini.on(el, "blur", function (e) {
        doLabel();
    });

}



mini.ajax = function (options) {
    if (!options.dataType) {
        options.dataType = "text";
    }



    return window.jQuery.ajax(options);
}
