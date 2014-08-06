/**
 * 将Html字符串做转码处理。
 */
mini.htmlEncode = function (str) {
    if (typeof str !== "string") return str;
    var s = "";
    if (str.length == 0) return "";
    s = str;

    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    
    return s;
}

/**
 * 将html字符串做反转码处理。
 */
mini.htmlDecode = function (str) {
    if (typeof str !== "string") return str;
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    
    return s;
}  