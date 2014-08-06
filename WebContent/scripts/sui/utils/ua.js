//-------------------------------------------浏览器相关--------------------------------------
var ua = navigator.userAgent.toLowerCase(),
    check = function (r) {
        return r.test(ua);
    },
    DOC = document,
    isStrict = DOC.compatMode == "CSS1Compat",
    isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]',
    isChrome = check(/chrome/),
    isWebKit = check(/webkit/),
    isSafari = !isChrome && check(/safari/),
    isSafari2 = isSafari && check(/applewebkit\/4/), 
    isSafari3 = isSafari && check(/version\/3/),
    isSafari4 = isSafari && check(/version\/4/),
    isIE = !!window.attachEvent && !isOpera,
    isIE7 = isIE && check(/msie 7/),
    isIE8 = isIE && check(/msie 8/),
    isIE9 = isIE && check(/msie 9/),
    isIE10 = isIE && document.documentMode == 10,
    isIE6 = isIE && !isIE7 && !isIE8 && !isIE9 && !isIE10,
    isFirefox = navigator.userAgent.indexOf("Firefox") > 0,
    isGecko = !isWebKit && check(/gecko/),
    isGecko2 = isGecko && check(/rv:1\.8/),
    isGecko3 = isGecko && check(/rv:1\.9/),
    isBorderBox = isIE && !isStrict,
    isWindows = check(/windows|win32/),
    isMac = check(/macintosh|mac os x/),
    isAir = check(/adobeair/),
    isLinux = check(/linux/),
    isSecure = /^https/i.test(window.location.protocol);
    
if (isIE6) {
    try {
        DOC.execCommand("BackgroundImageCache", false, true);
    } catch (e) { }
}


mini.boxModel = !isBorderBox;
mini.isIE = isIE;
mini.isIE6 = isIE6;
mini.isIE7 = isIE7;
mini.isIE8 = isIE8;
mini.isIE9 = isIE9;
mini.isFirefox = isFirefox;
mini.isOpera = isOpera;
mini.isSafari = isSafari;

if (jQuery) jQuery.boxModel = mini.boxModel;

mini.noBorderBox = false;
if (jQuery.boxModel == false && isIE && isIE9 == false) mini.noBorderBox = true;
