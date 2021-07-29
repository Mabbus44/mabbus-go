//import { io } from "socket.io-client";
import * as testLib from "./testLib";

//var socket = io();
//socket.on("dbg", (msg) => {
//  document.getElementById("dbg").innerHTML = msg;
//});
document.getElementById("dbg").innerHTML = testLib.myAdd(2, 3);
