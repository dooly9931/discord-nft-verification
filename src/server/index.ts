import path from "path";
import dotenv from "dotenv";
import app from "./app";
import http from "http";
import { AddressInfo } from "net";
import { port } from "../constants";

const envPath = path.resolve(".env");
dotenv.config({ path: envPath });

app.set("port", port);

const server = http.createServer(app);

server.listen(port);

const onError = (error: any) => {
  console.error(error);
  process.exit(1);
};

server.on("error", onError);

function onListening() {
  const addr = server.address() as AddressInfo;
  const bind = "port " + addr.port;
  console.log("Listening on " + bind);
}

server.on("listening", onListening);
