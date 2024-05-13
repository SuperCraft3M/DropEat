const { readdirSync } = require("fs");
const { createPool } = require("mysql");
const { getConfig, StartTasksManager, HttpServer, filterEndpointsByPath } = require("raraph84-lib");
const Config = getConfig(__dirname);

const tasks = new StartTasksManager();

const database = createPool({ ...Config.database, charset: "utf8mb4_general_ci" });
tasks.addTask((resolve, reject) => {
    console.log("Connexion à la base de données...");
    database.query("SELECT 0", async (error) => {
        if (!error) {
            console.log("Connecté à la base de données !");
            resolve();
        } else {
            console.log("Impossible de se connecter à la base de données - " + error);
            reject();
        }
    });
}, (resolve) => {
    database.end();
    resolve();
});

const api = new HttpServer();
api.on("request", async (/** @type {import("raraph84-lib/src/Request")} */ request) => {

    const endpoints = filterEndpointsByPath(readdirSync(__dirname + "/src/endpoints")
        .map((endpointFile) => require(__dirname + "/src/endpoints/" + endpointFile)), request);

    request.setHeader("Access-Control-Allow-Origin", "*");

    if (!endpoints[0]) {
        request.end(404, "Not found");
        return;
    }

    if (request.method === "OPTIONS") {
        request.setHeader("Access-Control-Allow-Methods", endpoints.map((endpoint) => endpoint.infos.method).join(","));
        if (request.headers["access-control-request-headers"])
            request.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"]);
        request.setHeader("Vary", "Access-Control-Request-Headers");
        request.end(204);
        return;
    }

    const endpoint = endpoints.find((endpoint) => endpoint.infos.method === request.method);
    if (!endpoint) {
        request.end(405, "Method not allowed");
        return;
    }

    request.urlParams = endpoint.params;

    endpoint.run(request, database);
});
tasks.addTask((resolve, reject) => {
    console.log("Lancement du serveur HTTP...");
    api.listen(Config.apiPort).then(() => {
        console.log("Serveur HTTP lancé sur le port " + Config.apiPort + " !");
        resolve();
    }).catch((error) => {
        console.log("Impossible de lancer le serveur HTTP - " + error);
        reject();
    });
}, (resolve) => {
    api.close();
    resolve();
});

tasks.run();
