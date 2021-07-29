import { io } from "socket.io-client";

var socket = io();
socket.on("dbg", (msg) => {
  document.getElementById("dbg").innerHTML = msg;
});
