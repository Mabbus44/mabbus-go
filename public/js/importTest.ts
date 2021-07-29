declare var require: any;
require.config({
  baseUrl: ".",
  paths: {
    socket.io-client: "node_modules/socket.io-client/build/index",
  },
});

import { io } from "socket.io-client";
//import { io } from "../node_modules/socket.io-client/build/index";

var socket = io();
socket.on("dbg", (msg) => {
  document.getElementById("dbg").innerHTML = msg;
});
