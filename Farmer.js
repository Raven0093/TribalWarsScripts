// ==UserScript==
// @name        Farma 132
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl132\.plemiona\.pl/game\.php*.*screen=am_farm*.*/
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==


var DEBUG = false;

var VILLAGE_ITS = ["28743","22738", "23753"];

var GM_VILLAGE_ID = "villageId";

var SPEAR = 0;
var SWORD = 1;
var AXE = 2;
var ARCHER = 3;
var SPY = 4;
var LIGHT= 5;
var MARCHER = 6;
var HEAVY = 7;
var KNIGHT = 8;

var UNITS = [
    [SPEAR, "#spear"],
    [SWORD, "#sword"],
    [AXE, "#axe"],
    [ARCHER, "#archer"],
    [SPY, "#spy"],
    [LIGHT, "#light"],
    [MARCHER, "#marcher"],
    [HEAVY, "#heavy"],
    [KNIGHT, "#knight"],
];

var MAX_DISTANCE_A = 0;
var MAX_DISTANCE_B = 40;

function getParameters(url, param) {
    var urlC = new URL(url);
    var parVal = urlC.searchParams.get(param);
    return parVal;
}
function getUnitsInVillage(){
    var units =[];
    for(var i = 0; i< UNITS.length; i ++){
        units[i] = parseInt($(document).find(UNITS[i][1]).get()[0].innerText);
    }
    return units;
}

function getUnitsA(){
    var units =[];
    for(var i = 0; i< UNITS.length; i ++){
        try{
            units[i] = parseInt($(document).find(".vis").get()["0"].children[1].children[0][UNITS[i][0]+1].attributes[3].value);
        }
        catch(e){
            units[i] = parseInt($(document).find(".vis").get()["1"].children[1].children[0][UNITS[i][0]+1].attributes[3].value);

        }
    }
    return units;
}

function getUnitsB(){
    var units =[];
    for(var i = 0; i< UNITS.length; i ++){
        try{
            units[i] = parseInt($(document).find(".vis").get()["0"].children[1].children[1][UNITS[i][0]+1].attributes[3].value);
        }
        catch(e){
            units[i] = parseInt($(document).find(".vis").get()["1"].children[1].children[1][UNITS[i][0]+1].attributes[3].value);

        }
    }
    return units;
}

function checkUnits(unitsInVillage , units){
    for(var i = 0; i < UNITS.length; i ++){
        if(unitsInVillage[i] < units[i]){
            return false;
        }
    }
    return true;
}

var lastId = 0;
function getVillageToFarm(){
    var cols = $(document).find("#plunder_list").get()["0"].children[0];
    for(var i = lastId; i < cols.children.length; i++){

        if(cols.children[i].hasAttribute("id") && !cols.children[i].hasAttribute("style")){
            lastId= i;
            return cols.children[i];
        }
    }
    return null;
}

function nextVillage(){
    if ($(document).find("#village_switch_right").get()["0"]){
        jQuery.event.trigger({ type: 'keydown', which: 68 });
    }else{
        location.reload();
    }
}

function farm(iconName, maxDistance, villageToFarm){
    var cells = villageToFarm.cells;
    var distance = parseFloat(cells[7].innerHTML);
    var button = $(cells).find(iconName).not(".farm_icon_disabled").get()[0];
    if(distance < maxDistance && button){
        $(button).click();
        $(villageToFarm).remove()
        return 1;
    }else{
        return 0;
    }
}

function getMaxPage() {
    if(DEBUG){
        console.log("getMaxPage - [->]")
    }
    var maxPage = 0;
    try{
        var plounderList = $(document).find("#plunder_list_nav").get();
        var select = $(plounderList).find("select").get();
        var table = $(plounderList).find(".paged-nav-item").get();

        if(select && select[0]){
            table = select[0];
        }
        maxPage = table.length;
    } catch(e){
        if(DEBUG){
            console.log("getMaxPage - [False]");
        }
    }
    if(DEBUG){
        console.log("getMaxPage - page: ", maxPage);
    }
    return maxPage;
}

function setPage(page) {
    window.location.href = 'game.php?village=' + getParameters(window.location.href, "village") + '&screen=am_farm&order=distance&dir=asc&Farm_page=' + page
}


function nextPage(){
    if(DEBUG){
        console.log("nextPage - [->]")
    }
    var page = getParameters(window.location.href, "Farm_page");
    if (page == null) {
        page = 0;
    }
    page = parseInt(page) + 1
    var maxPage = getMaxPage();
    if(DEBUG){
        console.log("page: ", page);
        console.log("max page: ", maxPage);
    }
    if (maxPage> page) {
        setPage(page);
        return 1
    } else {
        return 0
    }
}


function StartFarm(){
    var unitsInVillage = getUnitsInVillage();
    var unitsA = getUnitsA();
    var unitsB = getUnitsB();

    var villageToFarm = getVillageToFarm();
    if(DEBUG){
        console.log("Get Village to farm- [->]")
    }
    if(villageToFarm){
        if(DEBUG){
            console.log("Get Village to farm - [OK]")
            console.log("Farm A/B - [->]")
        }
        if(checkUnits(unitsInVillage, unitsA) && farm(".farm_icon_a", MAX_DISTANCE_A, villageToFarm)){
            if(DEBUG){
                console.log("Farm A - [OK]")
            }
            return setTimeout(StartFarm, 1000 + Math.random() * 300);
        }
        else if(checkUnits(unitsInVillage, unitsB) && farm(".farm_icon_b", MAX_DISTANCE_B, villageToFarm)){
            if(DEBUG){
                console.log("Farm B - [OK]")
            }
            return setTimeout(StartFarm, 1000 + Math.random() * 300);
        } else {
            if(DEBUG){
                console.log("Farm A/B - [FALSE]")
            }
            var page = parseInt(getParameters(window.location.href, "Farm_page"));
            if(DEBUG){
                console.log("page:", page)
            }
            if (page != null && page > 0) {
                if(DEBUG){
                    console.log("Set page 0 - [->]")
                }
                setPage(0);
            } else {
                if(DEBUG){
                    console.log("Next village - [->]")
                }
                setTimeout(nextVillage, 250000 + Math.random() * 5000);
            }
        }
    }
    else {
        if(DEBUG){
            console.log("Get Village - [FALSE]")
            console.log("Next Page - [->]")
        }
        if (!nextPage()){
            if(DEBUG){
                console.log("Next Page - [False]")
                console.log("Next Village - [->]")
            }
            setTimeout(nextVillage, 250000 + Math.random() * 5000);
        }
    }
}

if(DEBUG){
console.log("Max page: ", getMaxPage())
}
StartFarm();