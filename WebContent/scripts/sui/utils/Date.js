Date.prototype.getHalfYear = function () {
    if (!this.getMonth) return null;
    var m = this.getMonth();
    if (m < 6) return 0;
    return 1;
}
Date.prototype.getQuarter = function () {
    if (!this.getMonth) return null;
    var m = this.getMonth();
    if (m < 3) return 0;
    if (m < 6) return 1;
    if (m < 9) return 2;
    return 3;
}