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
      'obrona',
      'ogłoszenia rady',
      'ataki',
      'dyskusje',
      'FAQ',
      'IPN',
      'kosz',
      'zaufani',
      'hus - rada',
      'hus - dyplomacja',
      'hus - teczki graczy',
      'hus - kosz rady',
      'cnb - rada',
      'cnb - karczma sojuszu',
      'hus - HUS & AKA',
  ];

    var forum = document.getElementsByClassName("forum-container")[0];
    var forumTabls = forum.childNodes[1].childNodes;

    var textElement;
    for (let j=0; j<forumTabls.length; j++) {
        if(forumTabls[j].nodeName === "#text"){
            textElement = forumTabls[j].cloneNode(true);
            break;
        }
    }

    for (let j = forumTabls.length -1; j >= 0; j--) {
        if(forumTabls[j].nodeName === "#text"){
            $(forumTabls[j]).remove();
        }
    }

    for (let i=FORUM_TABS_ORDER.length - 1 ; i>=0; i--) {
        for (let j=forumTabls.length - 1; j >=0; j--) {
            if (forumTabls[j].innerText && forumTabls[j].innerText.toLowerCase().includes(FORUM_TABS_ORDER[i].toLowerCase())){
                var node1 = forumTabls[j];
                node1.parentNode.insertBefore(node1,node1.parentNode.firstChild);
                break;
            }
        }
    }

    for (let j=forumTabls.length - 1; j >=0; j--) {
        var node = forumTabls[j];
        var newNode = textElement.cloneNode(true);
        node.parentNode.insertBefore(newNode,node);
    }

})();