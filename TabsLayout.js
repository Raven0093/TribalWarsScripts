// ==UserScript==
// @name         Tabs layout
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include  /^https://pl126\.plemiona\.pl/game\.php*.*screen=forum*.*/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

  var FORUM_TABS_ORDER = [
      'Obrona',
      'Komunikaty',
      'Ataki',
      'Dyskusje',
      'FAQ',
      'IPN',
      'Karczma',
      'Zastępstwa',
      '♦ RADA ♦',
      '♦ Dypolomacja ♦',
      '♦ KoszRady ♦',
      '♦ Kosz ♦',
      'Kosz-komunikaty',
      'CnB - Rada HUS & CnB',
      'Karczma Sojuszu',
      'Karczma Świata'
  ];

    var forum = document.getElementsByClassName("forum-container")[0];
    var forumTabls = forum.childNodes[1].childNodes;
    for (let i=0; i<FORUM_TABS_ORDER.length; i++) {
        for (let j=0; j<forumTabls.length; j++) {
            if (forumTabls[j].innerText && forumTabls[j].innerText.includes(FORUM_TABS_ORDER[i])){
                var node1 = forumTabls[j];
                var node2 = forumTabls[i*2+1];
                node1.parentNode.insertBefore(node1,node2);
                node2.parentNode.insertBefore(node2,forumTabls[j+1]);
                break;
            }

        }

    }
})();