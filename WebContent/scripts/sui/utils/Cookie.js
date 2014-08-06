/**
 * Cookie扩展，包括取得，设置，删除cookie信息的三个方法。
 */
mini.Cookie = {
    get: function (sName) {
        var aCookie = document.cookie.split("; ");
        var lastMatch = null;
        for (var i = 0; i < aCookie.length; i++) {
            var aCrumb = aCookie[i].split("=");
            if (sName == aCrumb[0]) {
                lastMatch = aCrumb;
            }
        }
        if (lastMatch) {
            var v = lastMatch[1];
            if (v === undefined) return v;
            return unescape(v);
        }
        return null;
    },
    set: function (name, value, expires, domain) {
        var LargeExpDate = new Date();
        if (expires != null) {
            

            LargeExpDate = new Date(LargeExpDate.getTime() + (expires * 1000 * 3600 * 24)); 
        }

        document.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + LargeExpDate.toGMTString())) + ";path=/" + (domain ? "; domain=" + domain : "");
    },
    del: function (name, domain) {
        this.set(name, null, -100, domain);
    }
};