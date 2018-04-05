// ==UserScript==
// @name         lista mailingowa
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include   /^https://pl126\.plemiona\.pl/game\.php*.*screen=settings*.*/
// @grant        none
// ==/UserScript==

var GAME_URL = "https://pl126.plemiona.pl/game.php";

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}

class Player {
    constructor(name, villageCount) {
        this.name = name;
        this.villageCount = villageCount;
        this.thanks = 0;
    }
    addThanks(number){
        this.thanks += number;
    }
}


TribalWarsAlpieThanksHelper = {};
TribalWarsAlpieThanksHelper.Constants = {};
TribalWarsAlpieThanksHelper.Constants.ALLY_IDS = [161, 1127, 3442];
TribalWarsAlpieThanksHelper.Constants.ALLY_NAMES = ["HUS", "HUS.", "HUS*"];
TribalWarsAlpieThanksHelper.Constants.MAIN_THREAD_ID = 50320;

HttpHelper = {};
HttpHelper.WAIT_FOR_NEXT_GET_QUEUE = [];
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

        for (i = 4; i < arguments.length; i++) {
            var arg = arguments[i];
            if (Array.isArray(arg)) {
                url.searchParams.set(arg[0], arg[1]);
            }
        }
    }
    return url;
};
HttpHelper.xhrSendPromise = function (req, promise) {
    return new Promise(function (resolve, reject) {
        promise.then(function (values) {
            req.send();
            setTimeout(function () {
                resolve();
            }, 250 + Math.random() * 100);
        });
    });
};
HttpHelper.xhrSend = function (req) {
    return new Promise(function (resolve, reject) {
        req.send();
        setTimeout(function () {
            resolve();
        }, 250 + Math.random() * 100);
    });
};
HttpHelper.getParameters = function (url, param) {
    var urlC = new URL(url);
    var parVal = urlC.searchParams.get(param);
    return parVal;
};
HttpHelper.getPage = function (url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function () {
            if (req.status == 200) {
                var requestedBody = document.createElement("body");
                requestedBody.innerHTML = req.responseText;
                resolve(req.response);
            }
            else {
                reject();
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        if (HttpHelper.WAIT_FOR_NEXT_GET_QUEUE.length === 0) {
            HttpHelper.WAIT_FOR_NEXT_GET_QUEUE.push(HttpHelper.xhrSend(req));
        }
        else {
            var newPromise = HttpHelper.xhrSendPromise(req, HttpHelper.WAIT_FOR_NEXT_GET_QUEUE.last());
            HttpHelper.WAIT_FOR_NEXT_GET_QUEUE.push(newPromise);
        }
    });
};

TribalWarsHtmlParser = {};

TribalWarsHtmlParser.findElements = function (page, elementName) {
    return $(page).find(elementName).get();
};
TribalWarsHtmlParser.Constants = {};
TribalWarsHtmlParser.Constants.NO_PERMISSION_TO_PAGE_CONTENT = "Nie masz uprawnień do wykonania tego jako zastępca.";
TribalWarsHtmlParser.Constants.ALLY_NOT_EXIST = "plemię nie istnieje";
TribalWarsHtmlParser.Constants.NO_PERMISSION_TO_THREAD = "Twoje plemię nie ma upoważnienia do czytania tego forum";

TribalWarsHtmlParser.checkAccess = function (page) {
    var text = TribalWarsHtmlParser.findElements(page, "content_value")[0];
    if (text) {
        text = text.innerHtml;
        if (text.include(TribalWarsHtmlParser.Constants.NO_PERMISSION_TO_PAGE_CONTENT)) {
            return false;
        }
        if (text.include(TribalWarsHtmlParser.Constants.ALLY_NOT_EXIST)) {
            return false;
        }
        if (text.include(TribalWarsHtmlParser.Constants.NO_PERMISSION_TO_THREAD)) {
            return false;
        }
    }
    return true;
};
TribalWarsHtmlParser.TribeMembersPage = {};
TribalWarsHtmlParser.TribeMembersPage.getPlayers = function (page) {
    var players = [];

    if (!TribalWarsHtmlParser.checkAccess(page)) {
        return players;
    }


    try {
        var table = TribalWarsHtmlParser.findElements(page, '.vis')[0];
        var tableTRs = TribalWarsHtmlParser.findElements(table, 'tr');

        for (var i = 1; i < tableTRs.length; i++){
            var name = TribalWarsHtmlParser.findElements(tableTRs[i].children[0], 'a')[0].innerText;
            var villageCount = tableTRs[i].children[4].innerText;
            players.push(new Player(name, villageCount));
        }
    }
    catch (err) {
        players = null;
    }
    return players;
};



TribalWarsAlpieThanksHelper.getAlliesPlayersDictionary = function(players){
    var promises = [];
    for (var i = 0; i < TribalWarsAlpieThanksHelper.Constants.ALLY_IDS.length; i++){
        promises.push(new Promise(function (resolve, reject) {
            var index = i;
            var url = HttpHelper.createURL(GAME_URL, null, 'info_member', null, null, ["id",TribalWarsAlpieThanksHelper.Constants.ALLY_IDS[index]]);
            HttpHelper.getPage(url).then(function (req) {
                players[TribalWarsAlpieThanksHelper.Constants.ALLY_NAMES[index]] = TribalWarsHtmlParser.TribeMembersPage.getPlayers(req);
                resolve();
            });
        }));
    }
    return Promise.all(promises);
};



var row = document.getElementById("menu_row");
var cell1 = row.insertCell(0);
cell1.innerHTML = '<p><a id="listyMailingowe" href="#">Listy mailingowe</a></p>';


document.getElementById('listyMailingowe').onclick = function (e) {
    e.preventDefault();
    var players = {};
    TribalWarsAlpieThanksHelper.getAlliesPlayersDictionary(players).then(
        function(req){
            var data = [];
            for (var ally in players){
                data.push(ally);
                data.push('<textarea id="dataIn" cols="20" rows="30">');
                var i = 0;
                for (var p of players[ally]){
                    data.push(p.name + ";");
                    i += 1;
                    if(i === 50){
                        data.push("\n");
                        data.push("\n");
                    }
                }
                data.push('</textarea>');
            }

            Dialog.show("inDialog", data.join(""));
        }
    );




};



