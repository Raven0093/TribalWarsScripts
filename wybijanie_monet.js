// ==UserScript==
// @name         Wybyjanie money 132
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl132\.plemiona\.pl/game\.php*.*screen=snob*.*/
// @grant        none
// ==/UserScript==

var VILLAGES = [32333, 29905, 26588];

var URL_BASE ='https://pl132.plemiona.pl/game.php?'
var HttpHelper = {};
HttpHelper.createURL = function (base, village, screen, mode, t) {
    var url;
    if (base !== undefined && base !== null) {
        url = new URL(base);

        if (village !== undefined && village !== null) {
            url.searchParams.set('village', village);
        }

        if (screen !== undefined && screen !== null) {
            url.searchParams.set('screen', screen);
        }

        if (mode !== undefined && mode !== null) {
            url.searchParams.set('mode', mode);
        }

        if (t !== undefined && t !== null) {
            url.searchParams.set('t', t);
        }

        for (var i = 4; i < arguments.length; i++) {
            var arg = arguments[i];
            if (Array.isArray(arg)) {
                url.searchParams.set(arg[0], arg[1]);
            }
        }
    }
    return url;
};

HttpHelper.getParameters = function (url, param) {
    var urlC = new URL(url);
    var parVal = urlC.searchParams.get(param);
    return parVal;
};






next_village = function(){
    var villageId = parseInt(HttpHelper.getParameters(window.location.href, 'village'));

var index = VILLAGES.indexOf(villageId);

if (index === -1){
    window.location.href = HttpHelper.createURL(URL_BASE, VILLAGES[0], 'snob')
} else {
    if (index === VILLAGES.length - 1) {
        window.location.href = HttpHelper.createURL(URL_BASE, VILLAGES[0], 'snob')
    } else {
            window.location.href = HttpHelper.createURL(URL_BASE, VILLAGES[index + 1], 'snob')
    }
}

};

var all_coinds = $(document).find("#coin_mint_fill_max").get()[0];
var create = $(document).find(".btn-default[value='Wybiæ']").get()[0];

if (all_coinds){
    $(all_coinds).click()
}
if (create){
    $(create).click()
}


setTimeout(next_village, 15000);



