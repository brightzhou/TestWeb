mini.Drag = function (options) {
    mini.copyTo(this, options);
};
mini.Drag.prototype = {
    onStart: mini.emptyFn,
    onMove: mini.emptyFn,
    onStop: mini.emptyFn,
    capture: false,
    fps: 20,
    event: null,
    delay: 80,


    start: function (e) {

        e.preventDefault();
        if (e) this.event = e;

        this.now = this.init = [this.event.pageX, this.event.pageY];

        var bd = document;
        mini.on(bd, 'mousemove', this.move, this);
        mini.on(bd, 'mouseup', this.stop, this);
        mini.on(bd, 'contextmenu', this.contextmenu, this);
        if (this.context) mini.on(this.context, 'contextmenu', this.contextmenu, this);

        this.trigger = e.target;
        mini.selectable(this.trigger, false);
        mini.selectable(bd.body, false);

        if (this.capture) {
            if (isIE) this.trigger.setCapture(true);
            else if (document.captureEvents) document.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP | Event.MOUSEDOWN);
        }
        this.started = false;


        this.startTime = new Date();
    },
    contextmenu: function (e) {
        if (this.context) mini.un(this.context, 'contextmenu', this.contextmenu, this);
        mini.un(document, 'contextmenu', this.contextmenu, this);
        e.preventDefault();
        e.stopPropagation();
    },
    move: function (e) {
        if (this.delay) {
            if (new Date() - this.startTime < this.delay) return;
        }


        if (!this.started) {
            this.started = true;
            this.onStart(this);
        }



        var sf = this;

        if (!this.timer) {
            this.timer = setTimeout(function () {
                sf.now = [e.pageX, e.pageY]
                sf.event = e;
                sf.onMove(sf);
                sf.timer = null;
            }, 5);
        }
    },
    stop: function (e) {

        this.now = [e.pageX, e.pageY]
        this.event = e;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        var bd = document;

        mini.selectable(this.trigger, true);
        mini.selectable(bd.body, true);

        if (isIE) {
            this.trigger.setCapture(false);
            this.trigger.releaseCapture();
        }





        var success = mini.MouseButton.Right != e.button;
        if (success == false) {
            e.preventDefault();

        }





        mini.un(bd, 'mousemove', this.move, this);
        mini.un(bd, 'mouseup', this.stop, this);
        var sf = this;
        setTimeout(function () {
            mini.un(document, 'contextmenu', sf.contextmenu, sf);
            if (sf.context) mini.un(sf.context, 'contextmenu', sf.contextmenu, sf);
        }, 1);


        if (this.started) this.onStop(this, success);
    }
};