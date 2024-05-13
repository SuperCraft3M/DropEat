const { query } = require("raraph84-lib");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql").Pool} database 
 */
module.exports.run = async (request, database) => {

    let leaderboard;
    try {
        leaderboard = await query(database, "SELECT * FROM Leaderboard ORDER BY Time ASC");
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, {
        leaderboard: leaderboard.map((leaderboard) => ({
            name: leaderboard.Player_Name,
            character: leaderboard.Personnage,
            time: leaderboard.Time
        }))
    });
}

module.exports.infos = {
    path: "/leaderboard",
    method: "GET",
    requireAuth: true
}
