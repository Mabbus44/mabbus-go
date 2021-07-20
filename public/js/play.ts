function dbgfunc(): void {
  let lblDbg = document.getElementById("dbg") as HTMLLabelElement;
  lblDbg.innerHTML = "itWorks";
}

function uppdateDebug(dbgText) {
  let lblDbg = document.getElementById("dbg");
  lblDbg.innerHTML = dbgText;
}

//var socket = io() as HTMLLabelElement
//socket.on("dbg", uppdateDebug);
