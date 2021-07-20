function dbgfunc() {
    var lblDbg = document.getElementById("dbg");
    lblDbg.innerHTML = "itWorks";
}
function uppdateDebug(dbgText) {
    var lblDbg = document.getElementById("dbg");
    lblDbg.innerHTML = dbgText;
}
//var socket = io() as HTMLLabelElement
//socket.on("dbg", uppdateDebug);
