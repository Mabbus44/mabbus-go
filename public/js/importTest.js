define(["require", "exports", "socket.io-client"], function (require, exports, socket_io_client_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require.config({
        baseUrl: ".",
        paths: {
            "socket.io-client": "node_modules/socket.io-client/build/index",
        },
    });
    //import { io } from "../node_modules/socket.io-client/build/index";
    var socket = socket_io_client_1.io();
    socket.on("dbg", function (msg) {
        document.getElementById("dbg").innerHTML = msg;
    });
});
