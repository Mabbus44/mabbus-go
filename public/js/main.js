define(["require", "exports"], function (require, exports) {
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
});
//# sourceMappingURL=main.js.map