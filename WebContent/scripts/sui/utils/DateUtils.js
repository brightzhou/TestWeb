
var DAY_MS = 86400000,	//一天等于8640万毫秒
	HOUR_MS = 3600000,	//一小时等于360万毫秒
	MINUTE_MS = 60000;	//一分钟等于6万毫秒


mini.copyTo(mini, {
	/**
	 * 根据传入参数date的年，月，日等数据创建一个新的Date对象实例，这个对象的时分秒等于0。
	 */
    clearTime: function (date) {
        if (!date) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },
    /**
     * 根据传入参数date的年，月，日等数据创建一个新的Date对象实例，新产生对象的时分秒等参数都被设置为最大。
     * 这个方法产生的时间是一天中最大的时间。
     */
    maxTime: function (date) {
        if (!date) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    },
    
    /**
     * 克隆一个时间对象
     */
    cloneDate: function (date) {
        if (!date) return null;
        return new Date(date.getTime());
    },
    
    /**
     * 生成一个新的Date对象实例，这个实例通过指定的参数加上N年，月，日，时，分，秒产生。
     * @param date 日期对象实例。
     * @param num 增加的数值
     * @param type 增加的类型， 'Y'年,'MO'月,'D'日,'H'时,'M'分,'S'秒,'MS'毫秒
     */
    addDate: function (date, num, type) {
        if (!type) type = "D";
        date = new Date(date.getTime());
        switch (type.toUpperCase()) {
            case "Y":
                date.setFullYear(date.getFullYear() + num);
                break;
            case "MO":
                date.setMonth(date.getMonth() + num);
                break;
            case "D":
                date.setDate(date.getDate() + num);
                break;
            case "H":
                date.setHours(date.getHours() + num);
                break;
            case "M":
                date.setMinutes(date.getMinutes() + num);
                break;
            case "S":
                date.setSeconds(date.getSeconds() + num);
                break;
            case "MS":
                date.setMilliseconds(date.getMilliseconds() + num);
                break;
        }
        return date;
    },
    
    /**
     * 根据给定年，月，日，计算这一天是一年中的第几周。
     */
    getWeek: function (year,month,day){
        month += 1; 

        var a = Math.floor((14-(month))/12);
        var y = year+4800-a;
        var m = (month)+(12*a)-3;
        var jd = day + Math.floor(((153*m)+2)/5) + 
                     (365*y) + Math.floor(y/4) - Math.floor(y/100) + 
                     Math.floor(y/400) - 32045;

        var d4 = (jd+31741-(jd%7))%146097%36524%1461;
        var L = Math.floor(d4/1460);
        var d1 = ((d4-L)%365)+L;
        NumberOfWeek = Math.floor(d1/7) + 1;
        return NumberOfWeek;        
    },
    
    /**
     * 获得指定日期前最近星期N
     * @param date 给定日期
     * @param weekStartDay 星期N。
     */
    getWeekStartDate: function (date, weekStartDay) {
        if (!weekStartDay) weekStartDay = 0;
        if (weekStartDay > 6 || weekStartDay < 0) throw new Error("out of weekday");
        var day = date.getDay();
        var num = weekStartDay - day;
        if (day < weekStartDay) {
            num -= 7;
        }
        var d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + num);
        return d;
    },
    
    /**
     * 取得周N的短名称。
     */
    getShortWeek: function (week) {
        var weeks = this.dateInfo.daysShort;
        return weeks[week];
    },
     
     /**
     * 取得周N的长名称。
     */
    getLongWeek: function (week) {
        var weeks = this.dateInfo.daysLong;
        return weeks[week];
    },

     /**
     * 取得月N的短名称。
     */
    getShortMonth: function (month) {
        var months = this.dateInfo.monthsShort;
        return months[month];
    },

     /**
     * 取得月N的长名称。
     */ 
    getLongMonth: function (month) {
        var months = this.dateInfo.monthsLong;
        return months[month];
    },
    /**
     * 日期的国际化配置
     */
    dateInfo: {
        monthsLong: ["January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        daysLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        daysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        quarterLong: ['Q1', 'Q2', 'Q3', 'Q4'],
        quarterShort: ['Q1', 'Q2', 'Q3', 'Q4'],
        halfYearLong: ['first half', 'second half'],
        patterns: {
            "d": "M/d/yyyy",
            "D": "dddd, MMMM dd, yyyy",
            "f": "dddd, MMMM dd, yyyy H:mm tt",
            "F": "dddd, MMMM dd, yyyy H:mm:ss tt",
            "g": "M/d/yyyy H:mm tt",
            "G": "M/d/yyyy H:mm:ss tt",
            "m": "MMMM dd",
            "o": "yyyy-MM-ddTHH:mm:ss.fff",
            "s": "yyyy-MM-ddTHH:mm:ss",
            "t": "H:mm tt",
            "T": "H:mm:ss tt",
            "U": "dddd, MMMM dd, yyyy HH:mm:ss tt",
            "y": "MMM, yyyy"
        },
        tt: {
            "AM": "AM",
            "PM": "PM"
        },
        ten: {
            "Early": "Early",
            "Mid": "Mid",
            "Late": "Late"
        },
        today: 'Today',
        clockType: 24
    }
});

/**
 * 日期格式化
 */
mini.formatDate = function (date, format, locale) {
    if (!date || !date.getFullYear || isNaN(date)) return "";
    var fd = date.toString();

	//这个是开玩笑的代码吧。
    var dateFormat = mini.dateInfo;
    if (!dateFormat) dateFormat = mini.dateInfo;

    if (typeof (dateFormat) !== "undefined") {
        var pattern = typeof (dateFormat.patterns[format]) !== "undefined" ? dateFormat.patterns[format] : format;
        
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        
        if(format == "yyyy-MM-dd"){ 
            month = month + 1 < 10 ? "0" + (month + 1) : month + 1;
            day = day < 10 ? "0" + day : day;
            return year +"-"+month+"-"+day;
        }
        if(format == "MM/dd/yyyy"){ 
            month = month + 1 < 10 ? "0" + (month + 1) : month + 1;
            day = day < 10 ? "0" + day : day;
            return month+"/"+day+"/"+year;
        }
        

        
        fd = pattern.replace(/yyyy/g, year);
        fd = fd.replace(/yy/g, (year + "").substring(2));

        
        var halfyear = date.getHalfYear();
        fd = fd.replace(/hy/g, dateFormat.halfYearLong[halfyear]);

        
        var quarter = date.getQuarter();
        fd = fd.replace(/Q/g, dateFormat.quarterLong[quarter]);
        fd = fd.replace(/q/g, dateFormat.quarterShort[quarter]);

        
        fd = fd.replace(/MMMM/g, dateFormat.monthsLong[month].escapeDateTimeTokens());
        fd = fd.replace(/MMM/g, dateFormat.monthsShort[month].escapeDateTimeTokens());
        fd = fd.replace(/MM/g, month + 1 < 10 ? "0" + (month + 1) : month + 1);
        fd = fd.replace(/(\\)?M/g, function ($0, $1) { return $1 ? $0 : month + 1; });

        var dayOfWeek = date.getDay();
        fd = fd.replace(/dddd/g, dateFormat.daysLong[dayOfWeek].escapeDateTimeTokens());
        fd = fd.replace(/ddd/g, dateFormat.daysShort[dayOfWeek].escapeDateTimeTokens());

        
        fd = fd.replace(/dd/g, day < 10 ? "0" + day : day);
        fd = fd.replace(/(\\)?d/g, function ($0, $1) { return $1 ? $0 : day; });

        var hour = date.getHours();
        var halfHour = hour > 12 ? hour - 12 : hour;
        if (dateFormat.clockType == 12) {
            if (hour > 12) {
                hour -= 12;
            }
        }

        
        fd = fd.replace(/HH/g, hour < 10 ? "0" + hour : hour);
        fd = fd.replace(/(\\)?H/g, function ($0, $1) { return $1 ? $0 : hour; });

        
        fd = fd.replace(/hh/g, halfHour < 10 ? "0" + halfHour : halfHour);
        fd = fd.replace(/(\\)?h/g, function ($0, $1) { return $1 ? $0 : halfHour; });

        var minutes = date.getMinutes();
        fd = fd.replace(/mm/g, minutes < 10 ? "0" + minutes : minutes);
        fd = fd.replace(/(\\)?m/g, function ($0, $1) { return $1 ? $0 : minutes; });

        var seconds = date.getSeconds();
        fd = fd.replace(/ss/g, seconds < 10 ? "0" + seconds : seconds);
        fd = fd.replace(/(\\)?s/g, function ($0, $1) { return $1 ? $0 : seconds; });

        fd = fd.replace(/fff/g, date.getMilliseconds());

        fd = fd.replace(/tt/g, date.getHours() > 12 || date.getHours() == 0 ? dateFormat.tt["PM"] : dateFormat.tt["AM"]);

        
        var date = date.getDate();
        var tenF = '';
        if (date <= 10) tenF = dateFormat.ten['Early'];
        else if (date <= 20) tenF = dateFormat.ten['Mid'];
        else tenF = dateFormat.ten['Late'];
        fd = fd.replace(/ten/g, tenF);
    }

    return fd.replace(/\\/g, "");
}



mini.fixDate = function (d, check) { 
	if (+d) { 
		while (d.getDate() != check.getDate()) {
			d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
		}
	}
}

/**
 * 解析成日期对象。
 */
mini.parseDate = function (s, ignoreTimezone) {
    try {
        var d = eval(s);
        if (d && d.getFullYear) return d;
    } catch (ex) {
    }
    
    if (typeof s == 'object') { 
        return isNaN(s) ? null : s;
    }
    if (typeof s == 'number') { 
        
        var d = new Date(s * 1000);
        if (d.getTime() != s) return null;
        return isNaN(d) ? null : d;
    }
    if (typeof s == 'string') {
        m = s.match(/^([0-9]{4}).([0-9]*)$/);
        if (m) {
            var date = new Date(m[1], m[2] - 1);
            return date;
        }

        if (s.match(/^\d+(\.\d+)?$/)) { 
            var d = new Date(parseFloat(s) * 1000);
            if (d.getTime() != s) return null;
            else return d;
        }
        if (ignoreTimezone === undefined) {
            ignoreTimezone = true;
        }
        var d = mini.parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
        return isNaN(d) ? null : d;
    }
    
    return null;
}

/**
 * 将一个ISO8601 字符串解析成日期对象。
 */
mini.parseISO8601 = function (s, ignoreTimezone) { 
    
    var m = s.match(/^([0-9]{4})([-\/]([0-9]{1,2})([-\/]([0-9]{1,2})([T ]([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
    if (!m) {
        
        m = s.match(/^([0-9]{4})[-\/]([0-9]{2})[-\/]([0-9]{2})[T ]([0-9]{1,2})/);
        if (m) {
            var date = new Date(m[1], m[2] - 1, m[3], m[4]);
            return date;
        }


        m = s.match(/^([0-9]{4}).([0-9]*)/);
        if (m) {
            var date = new Date(m[1], m[2] - 1);
            return date;
        }


        m = s.match(/^([0-9]{4}).([0-9]*).([0-9]*)/);
        if (m) {
            var date = new Date(m[1], m[2] - 1, m[3]);
            return date;
        }

        m = s.match(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/);
        if (!m) return null;
        else {
            var date = new Date(m[3], m[1] - 1, m[2]);
            return date;
        }
    }
    var date = new Date(m[1], 0, 1);
    if (ignoreTimezone || !m[14]) {
        var check = new Date(m[1], 0, 1, 9, 0);
        if (m[3]) {
            date.setMonth(m[3] - 1);
            check.setMonth(m[3] - 1);
        }
        if (m[5]) {
            date.setDate(m[5]);
            check.setDate(m[5]);
        }
        mini.fixDate(date, check);
        if (m[7]) {
            date.setHours(m[7]);
        }
        if (m[8]) {
            date.setMinutes(m[8]);
        }
        if (m[10]) {
            date.setSeconds(m[10]);
        }
        if (m[12]) {
            date.setMilliseconds(Number("0." + m[12]) * 1000);
        }
        mini.fixDate(date, check);
    } else {
        date.setUTCFullYear(
			m[1],
			m[3] ? m[3] - 1 : 0,
			m[5] || 1
		);
        date.setUTCHours(
			m[7] || 0,
			m[8] || 0,
			m[10] || 0,
			m[12] ? Number("0." + m[12]) * 1000 : 0
		);
        var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
        offset *= m[15] == '-' ? 1 : -1;
        date = new Date(+date + (offset * 60 * 1000));
    }
    return date;
}


/**
 * 转化成时间对象。日期位为0 。
 */
mini.parseTime = function (s, format) {
    if (!s) return null;
    var n = parseInt(s);

    if (n == s && format) {
        d = new Date(0);
        if (format[0] == "H") {
            d.setHours(n);
        } else if (format[0] == "m") {
            d.setMinutes(n);
        } else if (format[0] == "s") {
            d.setSeconds(n);
        }
        return d;
    }

    var d = mini.parseDate(s);
    if (!d) {
        var ss = s.split(":");
        var t1 = parseInt(parseFloat(ss[0]));
        var t2 = parseInt(parseFloat(ss[1]));
        var t3 = parseInt(parseFloat(ss[2]));
        if (!isNaN(t1) && !isNaN(t2) && !isNaN(t3)) {
            d = new Date(0);
            d.setHours(t1);
            d.setMinutes(t2);
            d.setSeconds(t3);
        }
        if (!isNaN(t1) && (format == "H" || format == "HH")) {
            d = new Date(0);
            d.setHours(t1);
        } else if (!isNaN(t1) && !isNaN(t2) && (format == "H:mm" || format == "HH:mm")) {
            d = new Date(0);
            d.setHours(t1);
            d.setMinutes(t2);
        } else if (!isNaN(t1) && !isNaN(t2) && format == "mm:ss") {
            d = new Date(0);
            d.setMinutes(t1);
            d.setSeconds(t2);
        }
    }
    return d;
}