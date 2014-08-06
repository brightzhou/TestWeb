
String.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    format = format || "";
    return format.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i];
    });
}
String.prototype.trim = function () {
    var re = /^\s+|\s+$/g;
    return function () { return this.replace(re, ""); };
}();

String.prototype.escapeDateTimeTokens = function () {
    return this.replace(/([dMyHmsft])/g, "\\$1");
}