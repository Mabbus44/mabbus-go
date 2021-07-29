(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.btnGoToGame = exports.setSelect2 = exports.setSelect = void 0;
function setSelect(val) {
    var list1 = document.getElementById("challengerName");
    var list2 = document.getElementById("challengerID");
    list1.selectedIndex = val;
    list2.selectedIndex = val;
}
exports.setSelect = setSelect;
function setSelect2(val) {
    var list1 = document.getElementById("oponentName");
    var list2 = document.getElementById("matchID");
    list1.selectedIndex = val;
    list2.selectedIndex = val;
}
exports.setSelect2 = setSelect2;
function btnGoToGame() {
    var list = document.getElementById("matchID");
    var listVal = +list.value;
    if (listVal == null || isNaN(listVal))
        return;
    if (listVal >= 0)
        window.location.href = "/play?id=" + listVal;
}
exports.btnGoToGame = btnGoToGame;

},{}]},{},[1]);
