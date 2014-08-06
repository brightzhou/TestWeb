
mini.MessageBox = {
    
    
    
    
    

    alertTitle: "提醒",
    confirmTitle: "确认",
    prompTitle: "输入",
    prompMessage: "请输入内容：",
    buttonText: {
        ok: "确定", 
        cancel: "取消", 
        yes: "是", 
        no: "否"
    },

    show: function (options) {

        options = mini.copyTo({
            width: "auto",
            height: "auto",
            showModal: true,

            minWidth: 150,
            maxWidth: 800,
            minHeight: 100,
            maxHeight: 350,
            showHeader: true,

            title: "",
            titleIcon: "",
            iconCls: "",
            iconStyle: "",
            message: "",
            html: "",

            spaceStyle: "margin-right:15px",

            showCloseButton: true,
            buttons: null,
            buttonWidth: 58,
            callback: null
        }, options);

        var callback = options.callback;

        var control = new mini.Window();

        //修改滚动条仅在内容区出现（不包括按钮区）， 内容区和button区由原有的_bodyEl显示修改为_bodyEl、_footerEl显示  赵美丹 2012-12-26
        //control.setBodyStyle("overflow:hidden");
        control.setShowModal(options.showModal);
        //修改滚动条仅在内容区出现（不包括按钮区）， 内容区和button区由原有的_bodyEl显示修改为_bodyEl、_footerEl显示  赵美丹 2012-12-26
        control.setShowFooter(true);
        
        control.setTitle(options.title || "");
        control.setIconCls(options.titleIcon);
        control.setShowHeader(options.showHeader);

        //增加样式，方便个性化  赵美丹 2012-12-26
        control.setCls("mini-messagebox");
        
        control.setShowCloseButton(options.showCloseButton);

        var id1 = control.uid + "$table", id2 = control.uid + "$content";

        var icon = '<div class="' + options.iconCls + '" style="' + options.iconStyle + '"></div>';
        var s = '<table class="mini-messagebox-table" id="' + id1 + '" style="" cellspacing="0" cellpadding="0"><tr><td>'
         + icon + '</td><td id="' + id2 + '" class="mini-messagebox-content-text">'
         + (options.message || "") + '</td></tr></table>';


        
        
        //修改滚动条仅在内容区出现（不包括按钮区）， 内容区和button区由原有的_bodyEl显示修改为_bodyEl、_footerEl显示  赵美丹 2012-12-26
        var ws = '<div class="mini-messagebox-content"></div>';
            // + '<div class="mini-messagebox-buttons"></div>';
        control._bodyEl.innerHTML = ws;
        control._footerEl.innerHTML = '<div class="mini-messagebox-buttons"></div>';
        var contentEl = control._bodyEl.firstChild;

        if (options.html) {
            if (typeof options.html == "string") {
                contentEl.innerHTML = options.html;
            } else if (mini.isElement(options.html)) {
                contentEl.appendChild(options.html);
            }
        } else {
            contentEl.innerHTML = s;
        }

        control._Buttons = [];
        //修改滚动条仅在内容区出现（不包括按钮区）， 内容区和button区由原有的_bodyEl显示修改为_bodyEl、_footerEl显示  赵美丹 2012-12-26
        var buttonsEl = control._footerEl.firstChild;
        
        if (options.buttons && options.buttons.length > 0) {
            for (var i = 0, l = options.buttons.length; i < l; i++) {
                var button = options.buttons[i];
                var text = mini.MessageBox.buttonText[button];
                if (!text) text = button;

                var btn = new mini.Button();
                btn.setText(text);
                btn.setWidth(options.buttonWidth);
                btn.render(buttonsEl);
                btn.action = button;
                btn.on("click", function (e) {
                    var button = e.sender;
                    //解决alert回调函数执行时若关闭当前页面，IE兼容模式下页面会报错的问题(调整MessageBox.hide和callback的执行顺序) 赵美丹 2012-01-08
                    mini.MessageBox.hide(control);
                    if (callback) callback(button.action);
                });

                if (i != l - 1) {
                    btn.setStyle(options.spaceStyle);
                }

                control._Buttons.push(btn);
            }
        } else {
            buttonsEl.style.display = "none";
        }

        control.setMinWidth(options.minWidth);
        control.setMinHeight(options.minHeight);
        control.setMaxWidth(options.maxWidth);
        control.setMaxHeight(options.maxHeight);
        control.setWidth(options.width);
        control.setHeight(options.height);
        control.show();




        var width = control.getWidth();
        control.setWidth(width);
        var height = control.getHeight();
        control.setHeight(height);

        var tb = document.getElementById(id1);
        if (tb) {
            tb.style.width = "100%";
        }
        var td = document.getElementById(id2);
        if (td) {
            td.style.width = "100%";
        }
        

        var firstButton = control._Buttons[0];
        if (firstButton) {
            firstButton.focus();
        } else {
            control.focus();
        }

        control.on("beforebuttonclick", function (e) {
            if (callback) callback("close");
            e.cancel = true;
            mini.MessageBox.hide(control);
        });
        mini.on(control.el, "keydown", function (e) {
            if (e.keyCode == 27) {
                if (callback) callback("close");
                e.cancel = true;
                mini.MessageBox.hide(control);
            }
        });

        return control.uid;
    },
    hide: function (id) {
        if (!id) return;
        var control = typeof id == "object" ? id : mini.getbyUID(id);
        if (!control) return;

        
        for (var i = 0, l = control._Buttons.length; i < l; i++) {
            var button = control._Buttons[i];
            button.destroy();
        }
        control._Buttons = null;

        control.destroy();
    },
    alert: function (message, title, callback) {
        return mini.MessageBox.show({
            minWidth: 250,
            title: title || mini.MessageBox.alertTitle,
            buttons: ["ok"],
            message: message,
            iconCls: "mini-messagebox-warning",
            callback: callback
        });
    },
    confirm: function (message, title, callback) {
        return mini.MessageBox.show({
            minWidth: 250,
            title: title || mini.MessageBox.confirmTitle,
            buttons: ["ok", "cancel"],
            message: message,
            iconCls: "mini-messagebox-question",
            callback: callback
        });
    },
    prompt: function (message, title, callback, multi) {
        var id = "prompt$" + new Date().getTime();
        var s = message || mini.MessageBox.promptMessage;
        if (multi) {
            s = s + '<br/><textarea id="' + id + '" style="width:200px;height:60px;margin-top:3px;"></textarea>';
        } else {
            s = s + '<br/><input id="' + id + '" type="text" style="width:200px;margin-top:3px;"/>';
        }
        var uid = mini.MessageBox.show({
            title: title || mini.MessageBox.promptTitle,
            buttons: ["ok", "cancel"],
            width: 250,
            html: '<div style="padding:5px;padding-left:10px;">' + s + '</div>',
            callback: function (action) {
                var input = document.getElementById(id);
                if (callback) callback(action, input.value);
            }
        });
        var input = document.getElementById(id);
        input.focus();
        return uid;
    },
    loading: function (message, title) {
        return mini.MessageBox.show({
            minHeight: 50,
            title: title,
            showCloseButton: false,
            message: message,
            iconCls: "mini-messagebox-waiting"
        });
    }
};
mini.alert = mini.MessageBox.alert;
mini.confirm = mini.MessageBox.confirm;
mini.prompt = mini.MessageBox.prompt;
mini.loading = mini.MessageBox.loading;
mini.showMessageBox = mini.MessageBox.show;
mini.hideMessageBox = mini.MessageBox.hide;