// ==UserScript==
// @name         GoToTab
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl126\.plemiona\.pl/game\.php\?village=*.*&screen=forum$/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    window.location = window.location + "&screenmode=view_forum&forum_id=545";
})();
