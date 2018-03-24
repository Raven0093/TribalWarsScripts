// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl126\.plemiona\.pl/game\.php*.*screen=am_farm*.*/
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

VILLAGE_ITS = ["3752","234", "1956"];

GM_VILLAGE_ID = "villageId";

SPEAR = 0;
SWORD = 1;
AXE = 2;
ARCHER = 3;
SPY = 4;
LIGHT= 5;
MARCHER = 6;
HEAVY = 7;
KNIGHT = 8;

UNITS = [
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

MAX_DISTANCE_A = 10;
MAX_DISTANCE_B = 40;

function getUnitsInVillage(){
    units =[];
    for(var i = 0; i< UNITS.length; i ++){
        units[i] = parseInt($(document).find(UNITS[i][1]).get()[0].innerText);
    }
    return units;
}

function getUnitsA(){
    units =[];
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
    units =[];
    for(var i = 0; i< UNITS.length; i ++){
        try{
            units[i] = parseInt($(document).find(".vis").get()["0"].children[1].children[1][UNITS[i][0]+1].attributes[3].value);
        }
        catch{
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
    cols = $(document).find("#plunder_list").get()["0"].children[0];
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
    cells = villageToFarm.cells;
    distance = parseFloat(cells[7].innerHTML);
    button = $(cells).find(iconName).not(".farm_icon_disabled").get()[0];
    if(distance < maxDistance && button){
        $(button).click();
        return 1;
    }else{
        return 0;
    }
}


function StartFarm(){
    var unitsInVillage = getUnitsInVillage();
    var unitsA = getUnitsA();
    var unitsB = getUnitsB();

    var villageToFarm = getVillageToFarm();
    if(villageToFarm){
        if(checkUnits(unitsInVillage, unitsA)){
            if(farm(".farm_icon_a", MAX_DISTANCE_A, villageToFarm)){
                return setTimeout(StartFarm, 1000 + Math.random() * 300);
            }
        }
        if(checkUnits(unitsInVillage, unitsB)){
            if(farm(".farm_icon_b", MAX_DISTANCE_B, villageToFarm)){
                return setTimeout(StartFarm, 1000 + Math.random() * 300);
            }
        }
    }
    setTimeout(nextVillage, 150000 + Math.random() * 5000);
}

StartFarm();
