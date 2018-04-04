// ==UserScript==
// @name         podziekowania
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl126\.plemiona\.pl/game\.php*.*screen=forum*.*thread_id=50320*.*/
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

class Village {
    constructor(coord,thanks) {
        this.coord = coord;
        this.thanks = thanks;
    }
    addThanks(number){
        this.thanks += number;
    }
}

TribalWarsAlpieThanksHelper = {};
TribalWarsAlpieThanksHelper.Constants = {};
TribalWarsAlpieThanksHelper.Constants.ALLY_IDS = [161, 1127, 3442];
TribalWarsAlpieThanksHelper.Constants.MAIN_THREAD_ID = 50320;
// @ include  /^https://pl126\.plemiona\.pl/game\.php*.*screen=forum*.*screenmode=view_thread*.*/
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

TribalWarsAlpieThanksHelper.getThreadsUrlsFromPost = function(page){
    var urls = [];
    if (!TribalWarsHtmlParser.checkAccess(page)) {
        return urls;
    }
    try {
        var posts = $(document).find(".post").get();
        var texts = $(posts).find(".text").get();
        var as = $(texts).find("a[href]").get();

        for (var i = 0; i < as.length; i++){
            urls.push(as[i].getAttribute("href"));
        }
    }
    catch (err) {
        return urls;
    }
    return urls;
};

TribalWarsAlpieThanksHelper.getVillagesWithThanks = function(page, skipPosts = 0){
    var posts = $(page).find(".post").get();
    var villages = [];
    if (posts.length > 1){
        for (var i = 0 + skipPosts; i < posts.length; i++){
            try{
            var vil = $(posts[i]).find(".village_anchor").get();
            var aVil = $(vil).find("a").get()[0];
            var villageCoord = aVil.innerText.match(/[(][0-9]*[|][0-9]*[)]/)[0].match(/[0-9]*[|][0-9]*/)[0];

            var postThanksWho = $(posts[i]).find(".post_thanks_who").get();
            var a = $(postThanksWho).find("a").get();
            var villageThanksCount = a.length;
            villages.push(new Village(villageCoord, villageThanksCount));
            }
            catch(err){}
        }
    }
    return villages;
};
TribalWarsAlpieThanksHelper.getThankPlayers = function(page, skipPosts = 0){
    var posts = $(page).find(".post").get();
    var postThanks = {};
    if (posts.length > 1){
        for (var i = 0 + skipPosts; i < posts.length; i++){
            var postThanksWho = $(posts[i]).find(".post_thanks_who").get();
            var a = $(postThanksWho).find("a").get();
            for (var j = 0; j < a.length; j++){
                if (!postThanks.hasOwnProperty(a[j].innerText)){
                    postThanks[a[j].innerText] = 0;
                }
                postThanks[a[j].innerText] += 1;
            }

        }
    }
    return postThanks;
};
TribalWarsAlpieThanksHelper.playersToDictionary = function(players){
    var playerDic = {};
    for(var p of players){
        playerDic[p.name] = p;
    }
    return playerDic;
};

TribalWarsAlpieThanksHelper.getAlliesPlayers = function(players){
    var promises = [];
    for (var id of TribalWarsAlpieThanksHelper.Constants.ALLY_IDS){
        promises.push(new Promise(function (resolve, reject) {
            var url = HttpHelper.createURL(GAME_URL, null, 'info_member', null, null, ["id",id]);
            HttpHelper.getPage(url).then(function (req) {
                for (var item of TribalWarsHtmlParser.TribeMembersPage.getPlayers(req)){
                    players.push(item);
                }
                resolve();
            });
        }));
    }
    return Promise.all(promises);
};

TribalWarsAlpieThanksHelper.getThreadsUrlsFromMainThread = function(){
    var url = HttpHelper.createURL(GAME_URL, null, "forum", null, null, ["screenmode","view_thread"], ["thread_id", TribalWarsAlpieThanksHelper.Constants.MAIN_THREAD_ID]);
    return HttpHelper.getPage(url).then(TribalWarsAlpieThanksHelper.getThreadsUrlsFromPost);
};


TribalWarsAlpieThanksHelper.fromDictionaryToList = function(dic){
    var list = [];
    for (var p in dic){
        list.push(dic[p]);
    }
    return list;
};
TribalWarsAlpieThanksHelper.getVillagesThanksData = function(villageDic){

    var promise = new Promise(function (resolve, reject) {
        TribalWarsAlpieThanksHelper.getThreadsUrlsFromMainThread().then(function(req){
            var promises = [];
            for (var url of req){
                var skip = 1;
                var page = HttpHelper.getParameters(url, "page");
                if(page && page>0){
                    skip = 0;
                }
                promises.push(
                    HttpHelper.getPage(url).then(function(req){
                        var villages = TribalWarsAlpieThanksHelper.getVillagesWithThanks(req, skip);
                        for (var village of villages){
                            if(villageDic.hasOwnProperty(village.coord)){
                                villageDic[village.coord].addThanks(village.thanks);
                            }
                            else{
                                villageDic[village.coord] = village;
                            }

                        }
                    }));
            }
            Promise.all(promises).then(function (req) { resolve(); });
        });
    });
    return promise;
};

TribalWarsAlpieThanksHelper.getThanksData = function(playersDictionary, OtherPlayersDictionary){
    // var playersDictionary = {};
    // var OtherPlayersDictionary = {};
    var players = [];
    var promise = new Promise(function (resolve, reject) {
        TribalWarsAlpieThanksHelper.getAlliesPlayers(players).then(
            function(req){
                dictionary = TribalWarsAlpieThanksHelper.playersToDictionary(players);
                for (var p in dictionary){
                playersDictionary[p] = dictionary[p];
                }
            }).then(
            TribalWarsAlpieThanksHelper.getThreadsUrlsFromMainThread).then(function(req){
            var promises = [];
            for (var url of req){
                var skip = 1;
                var page = HttpHelper.getParameters(url, "page");
                if(page && page>0){
                    skip = 0;
                }
                promises.push(
                    HttpHelper.getPage(url).then(function(req){
                        var playerThanks = TribalWarsAlpieThanksHelper.getThankPlayers(req, skip);
                        for (var player in playerThanks){
                            if(playersDictionary.hasOwnProperty(player)){
                                playersDictionary[player].addThanks(playerThanks[player]);
                            }
                            else{
                                if(!OtherPlayersDictionary.hasOwnProperty(player)){
                                    OtherPlayersDictionary[player] = 0;
                                }
                                OtherPlayersDictionary[player] += playerThanks[player];
                            }

                        }
                    }));
            }
            Promise.all(promises).then(function (req) { resolve(); });
        });
    });
    return promise;
};

var row = document.getElementById("menu_row");
var cell1 = row.insertCell(0);
cell1.innerHTML = '<p><a id="showThanksInDialog" href="#">Podziękowania</a></p>';
var cell2 = row.insertCell(0);
cell2.innerHTML = '<p><a id="showVillagesInDialog" href="#">Wioski</a></p>';

function compareThanks(a,b) {
  if (a.thanks < b.thanks)
    return -1;
  if (a.thanks > b.thanks)
    return 1;
  return 0;
}


document.getElementById('showThanksInDialog').onclick = function (e) {
    e.preventDefault();
    var playersDictionary = {};
    var OtherPlayersDictionary = {};
    TribalWarsAlpieThanksHelper.getThanksData(playersDictionary, OtherPlayersDictionary).then(
        function(req){
            var playersList = TribalWarsAlpieThanksHelper.fromDictionaryToList(playersDictionary);
            console.log(playersList);
            playersList.sort(compareThanks);
            playersList.reverse();
            var data = [];
            data.push("[table]");
            data.push("[**]Gracz[||]Liczba wiosek[||]Liczba podziękowań[/**]");
            for (var p of playersList){
                data.push("[*]"+ p.name + "[|]" + p.villageCount+ "[|]" + p.thanks);
            }
            data.push("[/table]");

            data.push("[table]");
            data.push("[**]Gracz[||]Liczba podziękowań[/**]");
            for (var p in OtherPlayersDictionary){
                data.push("[*]"+ p + "[|]" + OtherPlayersDictionary[p]);
            }
            data.push("[/table]");

            Dialog.show("inDialog", '<textarea id="dataIn" cols="20" rows="30">' +data.join("\n")+ '</textarea>');
        }
    );

};


document.getElementById('showVillagesInDialog').onclick = function (e) {
    e.preventDefault();
    var villages = {};
    var OtherPlayersDictionary = {};
    TribalWarsAlpieThanksHelper.getVillagesThanksData(villages).then(
        function(req){
            var data = [];
            data.push("[table]");
            data.push("[**]Kordy[||]Liczba podziękowań[/**]");
            for (var p in villages){
                data.push("[*][coord]"+ villages[p].coord + "[/coord][|]" + villages[p].thanks);
            }
            data.push("[/table]");

            Dialog.show("inDialog", '<textarea id="dataIn" cols="20" rows="30">' +data.join("\n")+ '</textarea>');
        }
    );




};



