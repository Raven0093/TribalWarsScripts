// ==UserScript==
// @name         Zbieractwo 132
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl132\.plemiona\.pl/game\.php*.*screen=place*.*mode=scavenge*.*/
// @grant        none
// ==/UserScript==


var CAPS  = [85000,34000,17000, 11330]

var SPEAR = 0;
var SWORD = 1;
var AXE = 2;
var ARCHER = 3;
var LIGHT= 4;
var MARCHER = 5;
var HEAVY = 6;

var UNIT_INEX = 0;
var FIND = 1;
var USE = 2;
var CAP = 3;
var INPUT = 4;

var UNITS = [
    [SPEAR, "a.units-entry-all[data-unit='spear']",true,25,"input.unitsInput[name='spear']"],
    [SWORD, "a.units-entry-all[data-unit='sword']",true,15,"input.unitsInput[name='sword']"],
    [AXE, "a.units-entry-all[data-unit='axe']",true,10,"input.unitsInput[name='axe']"],
    [ARCHER, "a.units-entry-all[data-unit='archer']",true,10,"input.unitsInput[name='archer']"],
    [LIGHT, "a.units-entry-all[data-unit='light']",false,80,"input.unitsInput[name='light']"],
    [MARCHER, "a.units-entry-all[data-unit='marcher']",true,50,"input.unitsInput[name='marcher']"],
    [HEAVY, "a.units-entry-all[data-unit='heavy']",false,50,"input.unitsInput[name='heavy']"],
];


function elementToInt(el){
    try{
        return parseInt(el[0].innerText.replace("(","").replace(")",""))
    } catch (e) {
        return 0;
    }
}

var table = $(document).find(".candidate-squad-widget.vis").get()[0];

function calculate(cap_index){

    var units = []
    var toClick = []
    for (var u in UNITS){
        units.push(0)
        toClick.push(0)
    }


    for(var i = 0; i<  UNITS.length; i++){
        if(UNITS[i][USE]){
            units[i] = elementToInt($(table).find(UNITS[i][FIND]).get())
        }
    }
    var caps = CAPS[cap_index]

    for(i = 0; i<  units.length; i++){
        if (units[i] != 0) {
            if(units[i] * UNITS[i][CAP] > caps){
                toClick[i] = Math.floor(caps/UNITS[i][CAP])
                break;
            } else {
                toClick[i] = units[i];
                caps -= Math.floor(units[i] * UNITS[i][CAP]);
            }
        }
    }

    return toClick;

}

function fill(toClick) {
    for(var i = 0; i<toClick.length; i++){
        var el = $(table).find(UNITS[i][INPUT])
        el.trigger('focus');
        el.trigger('keydown');
        el.val(toClick[i])
        el.trigger('keyup');
        el.trigger('change');
    }
}
var buttons = $(document).find(".btn.btn-default.free_send_button").get();

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


function nextVillage(){
    if ($(document).find("#village_switch_right").get()["0"]){
        jQuery.event.trigger({ type: 'keydown', which: 68 });
    }else{
        location.reload();
    }
}


sleep(10).then(() => {
  fill(calculate(3));
    $(buttons[3]).click();
}).then(sleep(3000).then(() => {
  fill(calculate(2));
    $(buttons[2]).click();
}).then(sleep(6000).then(() => {
  fill(calculate(1));
    $(buttons[1]).click();
}).then(sleep(9000).then(() => {
  fill(calculate(0));
    $(buttons[0]).click();
}).then())))


setTimeout(nextVillage, 12000);
