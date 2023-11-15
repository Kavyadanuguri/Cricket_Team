const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeAndStart = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`dberror : ${e.message}`);
    process.exit(1);
  }
};

initializeAndStart();

const convertDbObjectToResponseObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

//API GET

app.get("/players/", async (request, response) => {
  const playersList = `
        select *
        from cricket_team
    `;
  const playersArray = await db.all(playersList);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API GET ONE

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersList = `
        SELECT
           *
        FROM 
          cricket_team
        WHERE 
          player_id = ${playerId};`;
  const player = await db.get(playersList);
  response.send(convertDbObjectToResponseObject(player));
});
//API POST

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayer = `
      INSERT INTO
      cricket_team(player_name, jersey_number, role)
      VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;
  const insertDetails = await db.run(addPlayer);
  response.send("Player Added to Team");
});

//API PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerDetails = `
        UPDATE
          cricket_team
        SET
         player_name ='${playerName}',
         jersey_number = ${jerseyNumber},
         role = '${role}'
        WHERE
         player_id = ${playerId};`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//API DELETE
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteDetails = `
     DELETE FROM 
        cricket_team
     WHERE 
        player_id = ${playerId};`;
  await db.run(deleteDetails);
  response.send("Player Removed");
});

module.exports = app;
