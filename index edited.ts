import * as express from "express";
import { Server } from "socket.io";
import * as path from "path";
const PORT = 5000;

const server = express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/*", httpGet)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = new Server(server);

setInterval(() => io.emit("dbg", "yep"), 5000);

async function httpGet(req, res) {
  switch (req.url) {
    case "/importTest":
      await res.render("pages/importTest");
      break;
  }
}
