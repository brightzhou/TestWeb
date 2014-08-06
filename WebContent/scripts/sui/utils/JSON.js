/**
 * 包括很对json encode decode操作的两个方法。
 */

mini.JSON = new (function () {
    var sb = [];
    var _dateFormat = null;
    var useHasOwn = !!{}.hasOwnProperty,
        replaceString = function (a, b) {

            var c = m[b];
            if (c) {


                return c;
            }
            c = b.charCodeAt();
            return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);

        },
        doEncode = function (o, field) {

            if (o === null) {
                sb[sb.length] = "null";
                return;
            }
            var t = typeof o;
            if (t == "undefined") {
                sb[sb.length] = "null";
                return;
            } else if (o.push) {

                sb[sb.length] = '[';
                var b, i, l = o.length, v;
                for (i = 0; i < l; i += 1) {
                    v = o[i];
                    t = typeof v;
                    if (t == "undefined" || t == "function" || t == "unknown") {
                    } else {
                        if (b) {
                            sb[sb.length] = ',';
                        }
                        doEncode(v);

                        b = true;
                    }
                }
                sb[sb.length] = ']';
                return;
            } else if (o.getFullYear) {
                if (_dateFormat) {
                    sb[sb.length] = _dateFormat(o, field);
                } else {
                    var n;
                    sb[sb.length] = '"';
                    sb[sb.length] = o.getFullYear();
                    sb[sb.length] = "-";
                    n = o.getMonth() + 1;
                    sb[sb.length] = n < 10 ? "0" + n : n;
                    sb[sb.length] = "-";
                    n = o.getDate();
                    sb[sb.length] = n < 10 ? "0" + n : n;
                    sb[sb.length] = "T"
                    n = o.getHours();
                    sb[sb.length] = n < 10 ? "0" + n : n;
                    sb[sb.length] = ":"
                    n = o.getMinutes();
                    sb[sb.length] = n < 10 ? "0" + n : n;
                    sb[sb.length] = ":"
                    n = o.getSeconds();
                    sb[sb.length] = n < 10 ? "0" + n : n;
                    sb[sb.length] = '"';
                    return;
                }
            } else if (t == "string") {
                if (strReg1.test(o)) {
                    sb[sb.length] = '"';

                    sb[sb.length] = o.replace(strReg2, replaceString);
                    sb[sb.length] = '"';
                    return;
                }
                sb[sb.length] = '"' + o + '"';
                return;
            } else if (t == "number") {
                sb[sb.length] = o;
                return;
            } else if (t == "boolean") {
                sb[sb.length] = String(o);
                return;
            } else {
                sb[sb.length] = "{";
                var b, i, v;
                for (i in o) {
                    if (!useHasOwn || (o.hasOwnProperty && o.hasOwnProperty(i))) {
                        v = o[i];
                        t = typeof v;
                        if (t == "undefined" || t == "function" || t == "unknown") {
                        } else {
                            if (b) {
                                sb[sb.length] = ',';
                            }
                            doEncode(i);
                            sb[sb.length] = ":";
                            doEncode(v, i)

                            b = true;
                        }
                    }
                }
                sb[sb.length] = "}";
                return;
            }
        },
        m = {
            "\b": '\\b',
            "\t": '\\t',
            "\n": '\\n',
            "\f": '\\f',
            "\r": '\\r',
            '"': '\\"',
            "\\": '\\\\'
        },
        strReg1 = /["\\\x00-\x1f]/,
        strReg2 = /([\x00-\x1f\\"])/g;

    this.encode = function () {

        var ec;
        return function (o, dateFormat) {
            sb = [];

            _dateFormat = dateFormat;
            doEncode(o);

            _dateFormat = null;

            return sb.join("");
        };
    }();
    this.decode = function () {

        var re = /[\"\'](\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})[\"\']/g;
        return function (json, parseDate) {
            if (json === "" || json === null || json === undefined) return json;

            if (typeof json == 'object') {
                json = this.encode(json);
            }
            if (parseDate !== false) {
                json = json.replace(re, "new Date($1,$2-1,$3,$4,$5,$6)");

                json = json.replace(__js_dateRegEx, "$1new Date($2)");

                json = json.replace(__js_dateRegEx2, "new Date($1)");
            }

            var s = eval('(' + json + ')');



            return s;
        };
    }();

})();
__js_dateRegEx = new RegExp('(^|[^\\\\])\\"\\\\/Date\\((-?[0-9]+)(?:[a-zA-Z]|(?:\\+|-)[0-9]{4})?\\)\\\\/\\"', "g");
__js_dateRegEx2 = new RegExp('[\"\']\/Date\\(([0-9]+)\\)\/[\"\']', 'g');
mini.encode = mini.JSON.encode;
mini.decode = mini.JSON.decode;

