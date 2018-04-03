// ==UserScript==
// @name         PlayerData
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl126\.plemiona\.pl/game\.php*.*screen=settings*.*/
// @grant        none
// ==/UserScript==

var GAME_URL = "https://pl126.plemiona.pl/game.php";

function Round(n, k) {
    var factor = Math.pow(10, k);
    return Math.round(n * factor) / factor;
}

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}

class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Player {
    constructor() {
        this.name = "";
        this.tribeName = "";
        this.globalRank = 0;
        this.tribeRank = 0;
        this.plunderer = 0;
        this.robber = 0;
        this.points = 0;
        this.ra = 0;
        this.rd = 0;
        this.rs = 0;
        this.villages = [];
        this.units = {};
        this.supportedPlayers = [];
        this.units.ownIn = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.otherPlayers = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.scavenging = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.awayInOwn = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.awayInOtherPlayers = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.trasitSupported = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.trasitOther = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.totalOwn = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.totalSpec = {};
        this.villageOnK = {};
    }
    getSpecs(specIdArray) {
        var returnData = 0;
        for (var i = 0; i < specIdArray.length; i++) {
            returnData += this.getSpec(specIdArray[i]);
        }
        return returnData;
    }
    updateUnits() {
        for (var i = 0; i < this.villages.length; i++) {
            this.units.ownIn = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.ownIn, this.villages[i].units.ownIn]);
            this.units.otherPlayers = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.otherPlayers, this.villages[i].units.otherPlayers]);
            this.units.scavenging = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.scavenging, this.villages[i].units.scavenging]);
            this.units.awayInOwn = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.awayInOwn, this.villages[i].units.awayInOwn]);
            this.units.awayInOtherPlayers = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.awayInOtherPlayers, this.villages[i].units.awayInOtherPlayers]);
            this.units.trasitSupported = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.trasitSupported, this.villages[i].units.trasitSupported]);
            this.units.trasitOther = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.trasitOther, this.villages[i].units.trasitOther]);
            this.units.totalOwn = TribalWarsHtmlParser.TroopsPage.sumUnits([this.units.totalOwn, this.villages[i].units.totalOwn]);
        }
    }
    getVillageOnK(k) {
        if (this.villageOnK[k]) {
            return this.villageOnK[k];
        } else {
            return 0;
        }
    }
    getSpec(specId) {
        if (this.totalSpec[specId]) {
            return this.totalSpec[specId];
        } else {
            return 0;
        }
    }
    updateSupportedPlayers() {
        for (var i = 0; i < this.villages.length; i++) {
            this.supportedPlayers = this.supportedPlayers.concat(this.villages[i].supportedPlayers);
        }
    }
    updateSpecs() {
        for (var i = 0; i < this.villages.length; i++) {
            if (this.totalSpec[this.villages[i].spec]) { this.totalSpec[this.villages[i].spec]++; } else { this.totalSpec[this.villages[i].spec] = 1; }
        }
    }
    updateKs() {
        for (var i = 0; i < this.villages.length; i++) {
            if (this.villageOnK[this.villages[i].k]) { this.villageOnK[this.villages[i].k]++; } else { this.villageOnK[this.villages[i].k] = 1; }
        }
    }
    setRa(p) {
        this.ra = p;
    }
    setRd(p) {
        this.rd = p;
    }
    setRs(p) {
        this.rs = p;
    }
    setRobber(p) {
        this.robber = p;
    }
    setPlunderer(p) {
        this.plunderer = p;
    }
    setName(name) {
        this.name = name;
    }
    setTribeName(name) {
        this.tribeName = name;
    }
    setGlobalRank(rank) {
        this.globalRank = rank;
    }
    setTribeRank(rank) {
        this.tribeRank = rank;
    }
    setPoints(rank) {
        this.points = rank;
    }
    addVillage(village) {
        this.villages.push(village);
    }

}

class Village {
    constructor() {
        this.coords = null;
        this.k = null;
        this.spec = null;
        this.units = {};
        this.supportedPlayers = [];
        this.units.ownIn = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.otherPlayers = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.scavenging = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.awayInOwn = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.awayInOtherPlayers = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.trasitSupported = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.trasitOther = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
        this.units.totalOwn = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    }
    updateTotalOwnUnits() {
        this.units.totalOwn = TribalWarsHtmlParser.TroopsPage.sumUnits([
            this.units.ownIn,
            this.units.scavenging,
            this.units.awayInOwn,
            this.units.awayInOtherPlayers,
            this.units.trasitSupported,
            this.units.trasitOther]);
    }
    setCoords(coords) {
        this.coords = coords;
    }
    setK(k) {
        this.k = k;
    }
    setSpec(spec) {
        this.spec = spec;
    }
    setOwnInUnits(units) {
        this.units.ownIn = units;
    }
    setScavengingUnits(units) {
        this.units.scavenging = units;
    }
    setSupportedPlayers(playersNames) {
        this.supportedPlayers = playersNames;
    }
    setTrasitSupportedUnits(units) {
        this.units.trasitSupported = units;
    }
    setTrasitOtherUnits(units) {
        this.units.trasitOther = units;
    }
    setAwayInOwnUnits(units) {
        this.units.awayInOwn = units;
    }
    setAwayInOtherPlayersUnits(units) {
        this.units.awayInOtherPlayers = units;
    }
    setOtherPlayersUnits(units) {
        this.units.otherPlayers = units;
    }
}
var TribalWarsUnits = {};
TribalWarsUnits.Config = {};
TribalWarsUnits.Config.SPEAR = 0;
TribalWarsUnits.Config.SWORD = 1;
TribalWarsUnits.Config.AXE = 2;
TribalWarsUnits.Config.ARCHER = 3;
TribalWarsUnits.Config.SPY = 4;
TribalWarsUnits.Config.LIGHT = 5;
TribalWarsUnits.Config.MARCHER = 6;
TribalWarsUnits.Config.HEAVY = 7;
TribalWarsUnits.Config.RAM = 8;
TribalWarsUnits.Config.CATAPULT = 9;
TribalWarsUnits.Config.KNIGHT = 10;
TribalWarsUnits.Config.SNOB = 11;

TribalWarsUnits.Config.POPULATION = [1, 1, 1, 1, 2, 4, 5, 6, 5, 8, 1, 100];
TribalWarsUnits.Config.SPEC = {};
TribalWarsUnits.Config.SPEC.IDS = {
    FULL_OFF: 10,
    BIG_OFF: 11,
    MEDIUM_OFF: 12,
    SMALL_OFF: 13,
    NEW_OFF: 14,
    OFF_LK: 15,
    SPY: 30,
    DEF_SPEAR_SWORD: 0,
    DEF_SPEAR_ARCHER: 1,
    DEF_SPEAR_CK: 2,
    DEF_CK: 3,
    DEF_CAT: 4,
    DEF_SPEAR: 5,
    DEF_SWORD: 6,
    DEF_ARCHER: 7,
    UNDEFINED: 99,
};

TribalWarsUnits.Config.SPEC.TABLE_INDEX = 0;
TribalWarsUnits.Config.SPEC.TABLE_UNITS_IDS = 1;
TribalWarsUnits.Config.SPEC.TABLE_UNITS_NUMBER = 2;

TribalWarsUnits.Config.SPEC.OFF = [
    [TribalWarsUnits.Config.SPEC.IDS.FULL_OFF, [TribalWarsUnits.Config.AXE, TribalWarsUnits.Config.LIGHT, TribalWarsUnits.Config.RAM], [5000, 2500, 250]],
    [TribalWarsUnits.Config.SPEC.IDS.BIG_OFF, [TribalWarsUnits.Config.AXE, TribalWarsUnits.Config.LIGHT], [5000, 2500]],
    [TribalWarsUnits.Config.SPEC.IDS.MEDIUM_OFF, [TribalWarsUnits.Config.AXE, TribalWarsUnits.Config.LIGHT], [2500, 1000]],
    [TribalWarsUnits.Config.SPEC.IDS.SMALL_OFF, [TribalWarsUnits.Config.AXE, TribalWarsUnits.Config.LIGHT], [1000, 500]],
    [TribalWarsUnits.Config.SPEC.IDS.NEW_OFF, [TribalWarsUnits.Config.AXE, TribalWarsUnits.Config.LIGHT], [100, 50]],
    [TribalWarsUnits.Config.SPEC.IDS.OFF_LK, [TribalWarsUnits.Config.LIGHT], [2500]],
];

TribalWarsUnits.Config.SPEC.SPY = [
    [TribalWarsUnits.Config.SPEC.IDS.SPY, [TribalWarsUnits.Config.SPY], [1000]],
];

TribalWarsUnits.Config.SPEC.DEF = [
    [TribalWarsUnits.Config.SPEC.IDS.DEF_SPEAR_CK, [TribalWarsUnits.Config.SPEAR, TribalWarsUnits.Config.HEAVY], [100, 100]],
    [TribalWarsUnits.Config.SPEC.IDS.DEF_CAT, [TribalWarsUnits.Config.CATAPULT], [100]],
    [TribalWarsUnits.Config.SPEC.IDS.DEF_SPEAR_SWORD, [TribalWarsUnits.Config.SPEAR, TribalWarsUnits.Config.SWORD], [100, 100]],
    [TribalWarsUnits.Config.SPEC.IDS.DEF_SPEAR_ARCHER, [TribalWarsUnits.Config.SPEAR, TribalWarsUnits.Config.ARCHER], [100, 100]],
    [TribalWarsUnits.Config.SPEC.IDS.DEF_SPEAR, [TribalWarsUnits.Config.SPEAR], [100]],
    [TribalWarsUnits.Config.SPEC.IDS.DEF_SWORD, [TribalWarsUnits.Config.SWORD], [100]],
    [TribalWarsUnits.Config.SPEC.IDS.DEF_ARCHER, [TribalWarsUnits.Config.ARCHER], [100]],
];

TribalWarsUnits.Config.SPEC.OTHER = [
    [TribalWarsUnits.Config.SPEC.IDS.UNDEFINED, [TribalWarsUnits.Config.SPEAR], [-1]]
];

TribalWarsUnits.Config.SPEC.ALL = [TribalWarsUnits.Config.SPEC.OFF, TribalWarsUnits.Config.SPEC.DEF, TribalWarsUnits.Config.SPEC.SPY];

var TribalWarsHtmlParser = {};

TribalWarsHtmlParser.Config = {};
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES = {};
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.SPEAR] = '.unit-item-spear';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.SWORD] = '.unit-item-sword';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.AXE] = '.unit-item-axe';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.ARCHER] = '.unit-item-archer';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.SPY] = '.unit-item-spy';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.LIGHT] = '.unit-item-light';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.MARCHER] = '.unit-item-marcher';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.HEAVY] = '.unit-item-heavy';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.RAM] = '.unit-item-ram';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.CATAPULT] = '.unit-item-catapult';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.KNIGHT] = '.unit-item-knight';
TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[TribalWarsUnits.Config.SNOB] = '.unit-item-snob';

TribalWarsHtmlParser.Config.UNITS_NUMBER = Object.keys(TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES).length;
TribalWarsHtmlParser.Constants = {};
TribalWarsHtmlParser.Constants.NO_PERMISSION_TO_PAGE_CONTENT = "Nie masz uprawnień do wykonania tego jako zastępca.";
TribalWarsHtmlParser.Constants.PLUNDRER_STRING = "Grabieżca";
TribalWarsHtmlParser.Constants.ROOBER_STRING = "Rabuś";

TribalWarsHtmlParser.findElements = function (page, elementName) {
    return $(page).find(elementName).get();
};
TribalWarsHtmlParser.checkAccess = function (page) {
    var text = TribalWarsHtmlParser.findElements(page, "content_value")[0];
    if (text) {
        text = text.innerHtml;
        if (text.include(TribalWarsHtmlParser.Constants.NO_PERMISSION_TO_PAGE_CONTENT)) {
            return false;
        }
    }
    return true;
};

TribalWarsHtmlParser.TribeMembersPage = {};
TribalWarsHtmlParser.TribeMembersPage.getSelectedPlayerRank = function (page) {
    var rank = "";

    if (!TribalWarsHtmlParser.checkAccess(page)) {
        rank = 'access denied';
    }
    try {
        var selected = TribalWarsHtmlParser.findElements(page, 'tr.selected');
        TribalWarsHtmlParser.findElements(selected, '.lit-item');
        rank = TribalWarsHtmlParser.findElements(selected, '.lit-item')[1].innerText;
    }
    catch (err) {
        rank = null;
    }
    return rank;
};

TribalWarsHtmlParser.ProfilePage = {};
TribalWarsHtmlParser.ProfilePage.Constants = {};
TribalWarsHtmlParser.ProfilePage.Constants.ATTACKER_REGEX = /agresor:[1-9][0-9]*/g;
TribalWarsHtmlParser.ProfilePage.Constants.DEFENDER_REGEX = /wspierający:[1-9][0-9]*/g;
TribalWarsHtmlParser.ProfilePage.Constants.SUPPORTER_REGEX = /obrońca:[1-9][0-9]*/g;
TribalWarsHtmlParser.ProfilePage.Constants.ATTACKER_TEXT = "agresor:";
TribalWarsHtmlParser.ProfilePage.Constants.DEFENDER_TEXT = "wspierający:";
TribalWarsHtmlParser.ProfilePage.Constants.SUPPORTER_TEXT = "obrońca:";

TribalWarsHtmlParser.ProfilePage.getOpponentsDefeated = function (page) {
    var tooltipData = TribalWarsHtmlParser.findElements(page, 'td.tooltip')[0];
    var ra = 0, rd = 0, rs = 0;
    if (tooltipData) {
        tooltipData = tooltipData.title;
        var titleString = tooltipData.split('<span class="grey">.</span>').join("").split(" ").join("").trim();

        try {
            ra = parseInt(titleString.match(TribalWarsHtmlParser.ProfilePage.Constants.ATTACKER_REGEX)[0].replace(TribalWarsHtmlParser.ProfilePage.Constants.ATTACKER_TEXT, ""));
        } catch (err) {
        }
        try {
            rd = parseInt(titleString.match(TribalWarsHtmlParser.ProfilePage.Constants.DEFENDER_REGEX)[0].replace(TribalWarsHtmlParser.ProfilePage.Constants.DEFENDER_TEXT, ""));
        }
        catch (err) {
        }
        try {
            rs = parseInt(titleString.match(TribalWarsHtmlParser.ProfilePage.Constants.SUPPORTER_REGEX)[0].replace(TribalWarsHtmlParser.ProfilePage.Constants.SUPPORTER_TEXT, ""));
        }
        catch (err) {
        }
    }
    return [ra, rd, rs];
};
TribalWarsHtmlParser.ProfilePage.getGlobalRank = function (page) {
    var playerInfo = TribalWarsHtmlParser.findElements(page, '#player_info')[0];
    var globalRank = 0;
    if (playerInfo) {
        globalRank = playerInfo.children["0"].children[3].children[1].innerText.split(".").join("").trim();
        globalRank = parseInt(globalRank);
    }
    return globalRank;
};
TribalWarsHtmlParser.ProfilePage.getTribeName = function (page) {
    var playerInfo = TribalWarsHtmlParser.findElements(page, '#player_info')[0];
    var tribieName = "";
    if (playerInfo) {
        try {
            tribieName = playerInfo.children["0"].children[5].children[1].childNodes[1].innerHTML;
        }
        catch (err) {
            tribieName = "Brak";
        }
    }
    return tribieName;
};

TribalWarsHtmlParser.ProfilePage.getPlayerName = function (page) {
    var playerInfo = TribalWarsHtmlParser.findElements(page, '#player_info')[0];
    var playerName = "";
    if (playerInfo) {
        playerName = playerInfo.children["0"].children["0"].children["0"].innerText.trim();
    }
    return playerName;
};

TribalWarsHtmlParser.ProfilePage.getPoints = function (page) {
    var playerInfo = TribalWarsHtmlParser.findElements(page, '#player_info')[0];
    var points = 0;
    if (playerInfo) {
        points = playerInfo.children["0"].children[2].children[1].innerText.split(".").join("").trim();
        points = parseInt(points);
    }
    return points;
};


TribalWarsHtmlParser.AchievementsPage = {};
TribalWarsHtmlParser.AchievementsPage.Constants = {
    TOTAL_STRING: "Razem: ",
    COMBAT_ACHIEVEMENTS: "Odznaczenia bojowe"
};
TribalWarsHtmlParser.AchievementsPage.getAchievements = function (page, achievementsNameArray) {
    var achievementsResults = Array(achievementsNameArray.length).fill(0);
    try {
        var combatAchievementsData = TribalWarsHtmlParser.findElements(page, 'div.award-group');
        if (combatAchievementsData) {
            for (var j = 0; j < combatAchievementsData.length; j++) {
                if (combatAchievementsData[j].innerText.includes(TribalWarsHtmlParser.AchievementsPage.Constants.COMBAT_ACHIEVEMENTS)) {
                    combatAchievementsData = combatAchievementsData[j].children[1];
                    for (var i = 0; i < combatAchievementsData.children.length; i++) {
                        for (var j = 0; j < achievementsNameArray.length; j++) {
                            try {
                                if (combatAchievementsData.children[i].innerText.includes(achievementsNameArray[j])) {
                                    if (combatAchievementsData.children[i].innerText.includes(TribalWarsHtmlParser.AchievementsPage.Constants.TOTAL_STRING)) {
                                        achievementsResults[j] = combatAchievementsData.children[i].children[1].children[2].innerText.replace(TribalWarsHtmlParser.AchievementsPage.Constants.TOTAL_STRING, '').trim().split('.').join('');
                                    }
                                    else {
                                        achievementsResults[j] = combatAchievementsData.children[i].children[1].children[3].innerText.split("/")[0].trim().split('.').join('');
                                    }
                                }
                            }
                            catch (err) { achievementsResults[j] = "brak danych"; }
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        for (var j = 0; j < achievementsNameArray.length; j++) {
            achievementsResults[j] = "błąd pobierania";
        }
    }

    return achievementsResults;
};

TribalWarsHtmlParser.TroopsPage = {};

TribalWarsHtmlParser.TroopsPage.sumUnits = function (unitsArray) {
    var units = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    for (var i = 0; i < unitsArray.length; i++) {
        for (var unitHtmlClass in TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES) {
            units[unitHtmlClass] += unitsArray[i][unitHtmlClass];
        }
    }

    return units;
};

TribalWarsHtmlParser.TroopsPage.unitsStructureToArray = function (unitsStructure) {
    var units = [];
    for (var unitHtmlClass in TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES) {
        units.push(unitsStructure[unitHtmlClass]);
    }
    return units;
};


TribalWarsHtmlParser.TroopsPage.getUnitsStructure = function () {
    var units = {};
    for (var unitHtmlClass in TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES) {
        units[unitHtmlClass] = 0;
    }
    return units;
};

TribalWarsHtmlParser.TroopsPage.getSumPopulation = function (units) {
    var pop = 0;
    for (var unitHtmlClass in TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES) {
        pop += units[unitHtmlClass] * TribalWarsUnits.Config.POPULATION[unitHtmlClass];
    }
    return pop;
};



TribalWarsHtmlParser.TroopsPage.unitsHtmlRowToUnits = function (row) {
    var units = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    for (var unitHtmlClass in TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES) {
        var unitCol = TribalWarsHtmlParser.findElements(row, TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[unitHtmlClass]);
        if (unitCol.length > 0) {
            units[unitHtmlClass] = parseInt(unitCol[0].innerHTML);
        }
    }
    return units;
};

TribalWarsHtmlParser.TroopsPage.unitsHtmlTableToUnits = function (table) {
    var units = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    for (var unitHtmlClass in TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES) {
        var col = TribalWarsHtmlParser.findElements(table, TribalWarsHtmlParser.Config.UNITS_HTML_CLASSES[unitHtmlClass]);
        units[unitHtmlClass] = 0;
        for (var j = 0; j < col.length; j++) {
            units[unitHtmlClass] = units[unitHtmlClass] + parseInt(col[j].innerHTML);
        }
    }
    return units;
};

TribalWarsHtmlParser.TroopsPage.getOwnUnitsInVillage = function (page) {
    var tables = TribalWarsHtmlParser.findElements(page, '#units_home')[0];
    var ownHomeUnits = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    if (tables) {
        var homeUnitTable = tables.children[0].children[1];
        ownHomeUnits = TribalWarsHtmlParser.TroopsPage.unitsHtmlRowToUnits(homeUnitTable);
    }
    return ownHomeUnits;
};

TribalWarsHtmlParser.TroopsPage.getOtherUnitsInVillage = function (page) {
    var otherHomeUnits = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    var tables = TribalWarsHtmlParser.findElements(page, '#units_home')[0];
    if (tables) {
        if (tables.children[0].children.length > 3) {
            $(tables.children[0].children).last().remove();
            $(tables.children[0].children).last().remove();
            tables.children[0].children[1].remove();
            tables.children[0].children[0].remove();
            var homeUnitTable = tables.children[0].children;
            otherHomeUnits = TribalWarsHtmlParser.TroopsPage.unitsHtmlTableToUnits(homeUnitTable);
        }
    }
    return otherHomeUnits;
};

TribalWarsHtmlParser.TroopsPage.getSupportingPlayers = function (page) {
    Console.log("TODO");
};


TribalWarsHtmlParser.TroopsPage.getScavengingUnits = function (page) {
    var scavengingUnits = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    if (page.includes("Misje zbieractwa")) {
        var tables = $(TribalWarsHtmlParser.findElements(page, 'table')).last()[0];
        if (tables) {
            var scavengingUnitsTable = $(tables.children[0].children).last()[0];
            scavengingUnits = TribalWarsHtmlParser.TroopsPage.unitsHtmlRowToUnits(scavengingUnitsTable);
        }
    }
    return scavengingUnits;
};

TribalWarsHtmlParser.TroopsPage.getIndexOfAwayUnits = function (page, ownVillages) {
    var tableIndexes = [null, null];
    var textInOwn = page.includes("Wojska w innych własnych wioskach");
    var textInOther = page.includes("Wojska w wioskach innych graczy");

    if (textInOwn && textInOther) {
        tableIndexes[0] = 0;
        tableIndexes[1] = 1;
    }
    else if (!textInOwn && textInOther) {
        tableIndexes[0] = null;
        tableIndexes[1] = 0;
    }
    else if (textInOwn && !textInOther) {
        tableIndexes[0] = 0;
        tableIndexes[1] = null;
    }

    if (ownVillages) {
        return tableIndexes[0];
    }
    else {
        return tableIndexes[1];
    }
};

TribalWarsHtmlParser.TroopsPage.getAwayUnitsInOwnVillages = function (page) {
    var unitsAway = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    var tabIndex = TribalWarsHtmlParser.TroopsPage.getIndexOfAwayUnits(page, true);
    if (tabIndex != null) {
        var unitsAwayPage = TribalWarsHtmlParser.findElements(page, '#units_away');
        if (unitsAwayPage[tabIndex]) {
            unitsAway = TribalWarsHtmlParser.TroopsPage.unitsHtmlTableToUnits(unitsAwayPage[tabIndex]);
        }
    }
    return unitsAway;
};

TribalWarsHtmlParser.TroopsPage.getAwayUnitsInOtherPlayers = function (page) {
    var unitsAway = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    var tabIndex = TribalWarsHtmlParser.TroopsPage.getIndexOfAwayUnits(page, false);
    if (tabIndex != null) {
        var unitsAwayPage = TribalWarsHtmlParser.findElements(page, '#units_away');
        if (unitsAwayPage[tabIndex]) {
            unitsAway = TribalWarsHtmlParser.TroopsPage.unitsHtmlTableToUnits(unitsAwayPage[tabIndex]);
        }
    }
    return unitsAway;
};


TribalWarsHtmlParser.TroopsPage.getSuppotedPlayers = function (page) {
    var unitsAwayPage = TribalWarsHtmlParser.findElements(page, '#units_away');
    var tabIndex = TribalWarsHtmlParser.TroopsPage.getIndexOfAwayUnits(page, false);
    var supportedPlayers = [];
    if (tabIndex != null) {
        try {
            if (unitsAwayPage[tabIndex]) {
                var players = TribalWarsHtmlParser.findElements(unitsAwayPage[tabIndex], "[data-id]");
                for (var j = 0; j < players.length; j++) {
                    supportedPlayers.push(players[j].innerText.split("(")[1].split(")")[0]);
                }
            }
        }
        catch (errr) { }
    }
    return supportedPlayers;
};

TribalWarsHtmlParser.TroopsPage.getTrasitUnits = function (page) {
    var unitsTransitTable = TribalWarsHtmlParser.findElements(page, '#units_transit')[0];
    var supportedUnits = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    var otherUnits = TribalWarsHtmlParser.TroopsPage.getUnitsStructure();
    if (unitsTransitTable) {
        unitsTransitTable = unitsTransitTable.children[0];
        for (var j = 1; j < unitsTransitTable.children.length; j++) {
            if (TribalWarsHtmlParser.findElements(unitsTransitTable.children[j], "[src]")[0].getAttribute("src").includes("support")) {
                supportedUnits = TribalWarsHtmlParser.TroopsPage.sumUnits([supportedUnits, TribalWarsHtmlParser.TroopsPage.unitsHtmlRowToUnits(unitsTransitTable.children[j])]);
            }
            else {
                otherUnits = TribalWarsHtmlParser.TroopsPage.sumUnits([otherUnits, TribalWarsHtmlParser.TroopsPage.unitsHtmlRowToUnits(unitsTransitTable.children[j])]);
            }
        }
    }
    return [otherUnits, supportedUnits];
};

TribalWarsHtmlParser.TroopsPage.getCoords = function (data) {
    var coord = [null, null];
    try {
        var villageData = $(data).find('#menu_row2').find(".box-item").find(".nowrap").not(".tooltip-delayed").get()[0].innerText;
        coords = villageData.split(")")[0].split("(")[1].split("|");
    }
    catch (err) { }
    finally {
        return new Coords(coords[0], coords[1]);
    }
};
TribalWarsHtmlParser.TroopsPage.getK = function (data) {
    var k = 0;
    try {
        var villageData = $(data).find('#menu_row2').find(".box-item").find(".nowrap").not(".tooltip-delayed").get()[0].innerText;
        k = parseInt(villageData.split("K")[1]);
    } catch (err) { }
    finally {
        return k;
    }
};
TribalWarsHtmlParser.OverviewVillagesPage = {};
TribalWarsHtmlParser.OverviewVillagesPage.getVillagesIds = function (page) {
    var villageTable = TribalWarsHtmlParser.findElements(TribalWarsHtmlParser.findElements(page, '#production_table'), "span[data-id]");
    var villagesIds = [];
    for (var i = 0; i < villageTable.length; i++) {

        villagesIds.push(villageTable[i].getAttribute("data-id"));
    }
    return villagesIds;
};


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

TribalWarsPlayerDataHelper = {};
TribalWarsPlayerDataHelper.getPlayerInfoData = function (player) {
    var url = HttpHelper.createURL(GAME_URL, null, "info_player", null, HttpHelper.getParameters(window.location.href, 't'));

    var promises = [];
    promises.push(HttpHelper.getPage(url).then(function (response) {
        player.setName(TribalWarsHtmlParser.ProfilePage.getPlayerName(response));
        player.setGlobalRank(TribalWarsHtmlParser.ProfilePage.getGlobalRank(response));
        player.setTribeName(TribalWarsHtmlParser.ProfilePage.getTribeName(response));
        player.setPoints(TribalWarsHtmlParser.ProfilePage.getPoints(response));
        var rads = TribalWarsHtmlParser.ProfilePage.getOpponentsDefeated(response);
        player.setRa(rads[0]);
        player.setRd(rads[2]);
        player.setRs(rads[1]);
    }));

    url = HttpHelper.createURL(GAME_URL, null, "info_player", 'awards', HttpHelper.getParameters(window.location.href, 't'));
    promises.push(HttpHelper.getPage(url).then(function (response) {
        var achive = TribalWarsHtmlParser.AchievementsPage.getAchievements(response, [TribalWarsHtmlParser.Constants.PLUNDRER_STRING, TribalWarsHtmlParser.Constants.ROOBER_STRING]);
        player.setPlunderer(achive[0]);
        player.setRobber(achive[1]);
    }));

    url = HttpHelper.createURL(GAME_URL, null, "ally", "members", HttpHelper.getParameters(window.location.href, 't'));
    promises.push(HttpHelper.getPage(url).then(function (response) {
        player.setTribeRank(TribalWarsHtmlParser.TribeMembersPage.getSelectedPlayerRank(response));
    }));

    url = HttpHelper.createURL(GAME_URL, null, "overview_villages", "prod", HttpHelper.getParameters(window.location.href, 't'), ["group", "0"]);
    var newPromise = new Promise(function (resolve, reject) {
        HttpHelper.getPage(url).then(function (response) {
            var villagesId = TribalWarsHtmlParser.OverviewVillagesPage.getVillagesIds(response);
            var promises = [];
            for (var i = 0; i < villagesId.length; i++) {
                var villageId = villagesId[i];
                url = HttpHelper.createURL(GAME_URL, villagesId[i], "place", "units", HttpHelper.getParameters(window.location.href, 't'));
                promises.push(HttpHelper.getPage(url).then(function (req) {
                    var newVillage = new Village();
                    player.addVillage(newVillage);
                    newVillage.setCoords(TribalWarsHtmlParser.TroopsPage.getCoords(req));
                    newVillage.setK(TribalWarsHtmlParser.TroopsPage.getK(req));
                    newVillage.setOwnInUnits(TribalWarsHtmlParser.TroopsPage.getOwnUnitsInVillage(req));
                    newVillage.setOtherPlayersUnits(TribalWarsHtmlParser.TroopsPage.getOtherUnitsInVillage(req));
                    newVillage.setScavengingUnits(TribalWarsHtmlParser.TroopsPage.getScavengingUnits(req));
                    newVillage.setSupportedPlayers(TribalWarsHtmlParser.TroopsPage.getSuppotedPlayers(req));

                    var trasitUnites = TribalWarsHtmlParser.TroopsPage.getTrasitUnits(req);
                    newVillage.setTrasitSupportedUnits(trasitUnites[1]);
                    newVillage.setTrasitOtherUnits(trasitUnites[0]);
                    newVillage.setAwayInOwnUnits(TribalWarsHtmlParser.TroopsPage.getAwayUnitsInOwnVillages(req));
                    newVillage.setAwayInOtherPlayersUnits(TribalWarsHtmlParser.TroopsPage.getAwayUnitsInOtherPlayers(req));
                    newVillage.updateTotalOwnUnits();
                }));
            }
            Promise.all(promises).then(function (req) { resolve(); });

        });
    });
    promises.push(newPromise);
    return Promise.all(promises);

};

TribalWarsPlayerDataHelper.getPlayerData = function () {
    var player = new Player();
    return TribalWarsPlayerDataHelper.getPlayerInfoData(player).then(function (req) {
        TribalWarsUnits.UpdateVillagesSpec(player.villages);
        player.updateUnits();
        player.updateKs();
        player.updateSpecs();
        player.updateSupportedPlayers();
    }).then(function (req) { return player; });

};

TribalWarsUnits.UpdateVillageSpec = function (village) {
    var spec = -1;
    for (var i = 0; i < TribalWarsUnits.Config.SPEC.ALL.length; i++) {
        for (var j = 0; j < TribalWarsUnits.Config.SPEC.ALL[i].length; j++) {
            spec = TribalWarsUnits.Config.SPEC.ALL[i][j][TribalWarsUnits.Config.SPEC.TABLE_INDEX];
            for (var y = 0; y < TribalWarsUnits.Config.SPEC.ALL[i][j][TribalWarsUnits.Config.SPEC.TABLE_UNITS_IDS].length; y++) {
                if (village.units.totalOwn[TribalWarsUnits.Config.SPEC.ALL[i][j][TribalWarsUnits.Config.SPEC.TABLE_UNITS_IDS][y]] < TribalWarsUnits.Config.SPEC.ALL[i][j][TribalWarsUnits.Config.SPEC.TABLE_UNITS_NUMBER][y]) {
                    spec = -1;
                }
            }
            if (spec > -1) {
                break;
            }
        }
        if (spec > -1) {
            break;
        }
    }
    if (spec === -1) {
        for (var i = 0; i < TribalWarsUnits.Config.SPEC.OTHER.length; i++) {
            for (var y = 0; y < TribalWarsUnits.Config.SPEC.OTHER[i][TribalWarsUnits.Config.SPEC.TABLE_UNITS_IDS].length; y++) {
                if (village.units.totalOwn[TribalWarsUnits.Config.SPEC.OTHER[i][TribalWarsUnits.Config.SPEC.TABLE_UNITS_IDS][y]] >= TribalWarsUnits.Config.SPEC.OTHER[i][TribalWarsUnits.Config.SPEC.TABLE_UNITS_NUMBER][y]) {
                    spec = TribalWarsUnits.Config.SPEC.OTHER[i][TribalWarsUnits.Config.SPEC.TABLE_INDEX];
                }
                if (spec > -1) {
                    break;
                }
            }
            if (spec > -1) {
                break;
            }
        }
    }
    village.setSpec(spec);
};
TribalWarsUnits.UpdateVillagesSpec = function (villages) {
    for (var j = 0; j < villages.length; j++) {
        TribalWarsUnits.UpdateVillageSpec(villages[j]);
    }
};

function getDate() {
    var now = new Date();

    var options = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return now.toLocaleString(undefined, options);
}
function convertToAplieData(player) {
    console.log(player);
    var returnData = [];


    returnData.push("");
    returnData.push(getDate());
    returnData.push(player.tribeName);
    returnData.push(player.name);
    returnData.push(player.plunderer);
    returnData.push(player.robber);
    returnData.push(player.points);
    var totalPlayerUnits = TribalWarsHtmlParser.TroopsPage.getSumPopulation(player.units.totalOwn);
    returnData.push(totalPlayerUnits);
    returnData.push(Round((player.points / totalPlayerUnits), 2).toString().replace(".", ","));
    returnData.push(player.villages.length);

    var defSpecs = [];
    for (var i = 0; i< TribalWarsUnits.Config.SPEC.DEF.length; i++){
        defSpecs.push(TribalWarsUnits.Config.SPEC.DEF[i][0]);
    }
    var defVillageCount = player.getSpecs(defSpecs);

    returnData.push(defVillageCount);
    returnData.push(Round(defVillageCount/player.villages.length, 2).toString().replace(".", ","));

    var defTotalOwn =
        player.units.totalOwn[TribalWarsUnits.Config.SPEAR] +
        player.units.totalOwn[TribalWarsUnits.Config.SWORD] +
        player.units.totalOwn[TribalWarsUnits.Config.ARCHER]+
        player.units.totalOwn[TribalWarsUnits.Config.HEAVY] * TribalWarsUnits.Config.POPULATION[TribalWarsUnits.Config.HEAVY];


    returnData.push(defTotalOwn);

    returnData.push(player.villages.length * 5000);


    var defAwayInOwn =
        player.units.awayInOwn[TribalWarsUnits.Config.SPEAR] +
        player.units.awayInOwn[TribalWarsUnits.Config.SWORD] +
        player.units.awayInOwn[TribalWarsUnits.Config.ARCHER] +
        player.units.totalOwn[TribalWarsUnits.Config.HEAVY] * TribalWarsUnits.Config.POPULATION[TribalWarsUnits.Config.HEAVY];

    returnData.push(defAwayInOwn);

    var defAwayInOtherPlayers =
        player.units.awayInOtherPlayers[TribalWarsUnits.Config.SPEAR] +
        player.units.awayInOtherPlayers[TribalWarsUnits.Config.SWORD] +
        player.units.awayInOtherPlayers[TribalWarsUnits.Config.ARCHER] +
        player.units.awayInOtherPlayers[TribalWarsUnits.Config.HEAVY] * TribalWarsUnits.Config.POPULATION[TribalWarsUnits.Config.HEAVY];

    returnData.push(defAwayInOtherPlayers);

    var defOwIn =
        player.units.ownIn[TribalWarsUnits.Config.SPEAR] +
        player.units.ownIn[TribalWarsUnits.Config.SWORD] +
        player.units.ownIn[TribalWarsUnits.Config.ARCHER] +
        player.units.ownIn[TribalWarsUnits.Config.HEAVY] * 6;

    returnData.push(defOwIn);

    returnData.push(Math.floor(defOwIn/1000));

     returnData.push(Round((defTotalOwn/totalPlayerUnits), 2).toString().replace(".", ","));

    var supportedPlayers = [];
    $.each(player.supportedPlayers, function(i, el){
        if($.inArray(el, supportedPlayers) === -1) supportedPlayers.push(el);
    });

    returnData.push(supportedPlayers.join(" - "));

    returnData.push("WSZYSTKIE WŁASNE JEDNOSTKI");
    returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(player.units.totalOwn));

    returnData.push("WIOSKI");
    returnData.push(player.getVillageOnK(14));
    returnData.push(player.getVillageOnK(24));
    returnData.push(player.getVillageOnK(34));
    returnData.push(player.getVillageOnK(44));
    returnData.push(player.getVillageOnK(54));
    returnData.push(player.getVillageOnK(15));
    returnData.push(player.getVillageOnK(25));
    returnData.push(player.getVillageOnK(35));
    returnData.push(player.getVillageOnK(45));
    returnData.push(player.getVillageOnK(55));
    returnData.push(player.getVillageOnK(16));
    returnData.push(player.getVillageOnK(26));
    returnData.push(player.getVillageOnK(36));
    returnData.push(player.getVillageOnK(46));
    returnData.push(player.getVillageOnK(56));

    returnData.push("WIOSKI SPECJALIZACJA");

    returnData.push(player.getSpec(TribalWarsUnits.Config.SPEC.IDS.FULL_OFF));
    returnData.push(player.getSpecs([TribalWarsUnits.Config.SPEC.IDS.BIG_OFF,
                                     TribalWarsUnits.Config.SPEC.IDS.MEDIUM_OFF,
                                     TribalWarsUnits.Config.SPEC.IDS.SMALL_OFF,
                                     TribalWarsUnits.Config.SPEC.IDS.NEW_OFF,
                                     TribalWarsUnits.Config.SPEC.IDS.OFF_LK]
                                   ));
    returnData.push(player.getSpec(TribalWarsUnits.Config.SPEC.IDS.SPY));
    returnData.push(defVillageCount);
    returnData.push(player.getSpec(TribalWarsUnits.Config.SPEC.IDS.UNDEFINED));

    returnData.push("DOSTĘPNE JEDNOSTKI");
    returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(player.units.ownIn));

    returnData.push("WSPARCIE U SIEBIE");
    returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(player.units.awayInOwn));

    returnData.push("WSPARCIE U INNYCH");
    returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(player.units.awayInOtherPlayers));

    returnData.push("INNE W DRODZE");
    returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(TribalWarsHtmlParser.TroopsPage.sumUnits(
        [player.units.trasitSupported,
        player.units.scavenging,
        player.units.trasitOther]
    )));


//     returnData.push("WYSŁANE WSPARCIE");
//     //returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(player.units.away));
//     returnData.push("WSPIERANI GRACZE");
//     returnData.push(player.supportedPlayers.join(" - "));
//     returnData.push("WSPARCIE W DRODZE");
//     returnData = returnData.concat(TribalWarsHtmlParser.TroopsPage.unitsStructureToArray(player.units.trasitSupported));

//     returnData.push("WCIELENI REKRUCI");

//     returnData.push("");
//     returnData.push(player.name);
//     returnData.push(player.villages.length * 1000);

//     var def = player.units.totalOwn[TribalWarsUnits.Config.SPEAR] +
//         player.units.totalOwn[TribalWarsUnits.Config.SWORD] +
//         player.units.totalOwn[TribalWarsUnits.Config.ARCHER];

//     returnData.push(def);

//     var defOwnIn =
//         player.units.ownIn[TribalWarsUnits.Config.SPEAR] +
//         player.units.ownIn[TribalWarsUnits.Config.SWORD] +
//         player.units.ownIn[TribalWarsUnits.Config.ARCHER];

//     returnData.push(defOwnIn);

//     // var defAway =
//     //     player.units.defAway[TribalWarsUnits.Config.SPEAR] +
//     //     player.units.defAway[TribalWarsUnits.Config.SWORD] +
//     //     player.units.defAway[TribalWarsUnits.Config.ARCHER];

//     // returnData.push(defAway);

//     console.log(player);

//     returnData.push(def - player.villages.length * 1000)

//     returnData.push(Math.floor((def - player.villages.length * 1000) / 1000));
    return returnData.join("\n");

}

var row = document.getElementById("menu_row");
var cell1 = row.insertCell(0);
cell1.innerHTML = '<p><a id="pobierzDane" href="#">Pobierz dane</a></p>';

document.getElementById('pobierzDane').onclick = function (e) {
    e.preventDefault();
    TribalWarsPlayerDataHelper.getPlayerData().then(convertToAplieData).then(function (data) { Dialog.show("okienko_komunikatu", '<textarea name="post" maxlength="100" cols="20" rows="30" class="myCustomTextarea">' + data + '</textarea>'); });

};