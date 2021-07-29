define(["require", "exports", "./testLib"], function (require, exports, testLib) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //var socket = io();
    //socket.on("dbg", (msg) => {
    //  document.getElementById("dbg").innerHTML = msg;
    //});
    document.getElementById("dbg").innerHTML = testLib.myAdd(2, 3);
});
