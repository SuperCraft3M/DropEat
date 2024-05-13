const { getConfig, query } = require("raraph84-lib");
const Config = getConfig(__dirname + "/../..");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql").Pool} database 
 */
module.exports.run = async (request, database) => {

    let body;
    try {
        body = JSON.parse(request.body);
    } catch (error) {
        request.end(400, "Invalid JSON");
        return;
    }

    if (typeof body.password !== "string") {
        request.end(400, "Password must be a string");
        return;
    }

    if (body.password !== Config.password) {
        request.end(401, "Invalid password");
        return;
    }

    if (typeof body.name !== "string") {
        request.end(400, "Name must be a string");
        return;
    }

    if (body.name.length === 0) {
        request.end(400, "Name must not be empty");
        return;
    }

    if (typeof body.character !== "string") {
        request.end(400, "Character must be a string");
        return;
    }

    if (typeof body.time !== "number") {
        request.end(400, "Time must be a number");
        return;
    }

    if (body.time < 0) {
        request.end(400, "Time must be positive");
        return;
    }

    let participant;
    try {
        participant = (await query(database, "SELECT * FROM Leaderboard WHERE Player_Name=?", [body.name]))[0];
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        request.end(500, "Internal server error");
        return;
    }

    const time = !participant ? body.time : Math.min(participant.Time, body.time);

    try {
        await query(database, "INSERT INTO Leaderboard (Player_Name, Personnage, Time) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Time=?, Personnage=?", [body.name, body.character, time, body.character, time]);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        request.end(500, "Internal server error");
        return;
    }

    request.end(204);
}

module.exports.infos = {
    path: "/leaderboard",
    method: "POST",
    requireAuth: true
}
