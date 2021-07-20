"use strict";
exports.__esModule = true;
exports.setSelect2 = exports.setSelect = void 0;
function setSelect(val) {
    var list1 = document.getElementById("challengedName");
    var list2 = document.getElementById("challengedID");
    list1.selectedIndex = val;
    list2.selectedIndex = val;
}
exports.setSelect = setSelect;
function setSelect2(val) {
    var list1 = document.getElementById("alreadyChallenged");
    var list2 = document.getElementById("alreadyChallengedID");
    list1.selectedIndex = val;
    list2.selectedIndex = val;
}
exports.setSelect2 = setSelect2;
