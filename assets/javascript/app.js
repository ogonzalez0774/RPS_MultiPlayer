// Initialize Firebase
var config = {
  apiKey: "AIzaSyD3M9BXAuU8pADnXXIqKBZ5uJFm5cYZ7Zg",
  authDomain: "rpsgamehomework1.firebaseapp.com",
  databaseURL: "https://rpsgamehomework1.firebaseio.com/",
  projectId: "rpsgamehomework",
  storageBucket: "rpsgamehomework1.appspot.com",
  messagingSenderId: "project-11706413843"
};

firebase.initializeApp(config);

var database = firebase.database();

// each player enters in as their own folder in the database
var playerTurn = database.ref();
var players = database.ref("/players");
var player1 = database.ref("/players/player1");
var player2 = database.ref("/players/player2");
var playerChat = database.ref("/chat");
// Initialize all global variables
var player;
var p1snapshot;
var p2snapshot;
var p1result;
var p2result;
var p1 = null;
var p2 = null;
var wins1 = 0;
var wins2 = 0;
var losses1 = 0;
var losses2 = 0;
var playerNum = 0;

// initial submit form to enter as a player
$("#playerInfo").html(
  "<form><input id=playerName type=text placeholder='Enter your name to begin'><input id=enterPlayer type=submit value=Start></form>"
);

// publishes changes made to the player 1 database
player1.on(
  "value",
  function(snapshot) {
    if (snapshot.val() !== null) {
      p1 = snapshot.val().player;
      wins1 = snapshot.val().wins;
      losses1 = snapshot.val().losses;
      $("#p1name").html("<h2>" + p1 + "</h2>");
      $("#p1stats").html("<p>Wins: " + wins1 + "  Losses: " + losses1 + "</p>");
    } else {
      $("#p1name").html("Waiting for Player 1");
      $("#p1stats").empty();
      // Displays that player disconnected
      if (p1 !== null) {
        playerChat.push({
          player: p1,
          taunt: " has disconnected",
          dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
      }
    }
  },
  function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  }
);

// Publishes changes made to the player 2 database
player2.on(
  "value",
  function(snapshot) {
    if (snapshot.val() !== null) {
      p2 = snapshot.val().player;
      wins2 = snapshot.val().wins;
      losses = snapshot.val().losses;
      $("#p2name").html("<h2>" + p2 + "</h2>");
      $("#p2stats").html("<p>Wins: " + wins2 + "  Losses: " + losses2 + "</p>");
    } else {
      $("#p2name").html("Waiting for Player 2");
      $("#p2stats").empty();
      // Displays that player disconnected
      if (p2 !== null) {
        playerChat.push({
          player: p2,
          taunt: " has disconnected",
          dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
      }
    }
  },
  function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  }
);

// On Submit button, added player depending on who is already in the firebase database by checking if exists
$("#enterPlayer").on("click", function(event) {
  event.preventDefault();
  var regex = /(^([a-zA-Z]{2,})?(\s?[a-zA-Z]{2,}$))/;
  player = $("#playerName")
    .val()
    .trim();
  if (regex.test(player)) {
    player1.once(
      "value",
      function(snapshot) {
        p1snapshot = snapshot;
      },
      function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );
    player2.once(
      "value",
      function(snapshot) {
        p2snapshot = snapshot;
      },
      function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );
    // if there is no player 1
    if (!p1snapshot.exists()) {
      // sets local variable of player number, to know which page to display choices on and who is taunting
      playerNum = 1;
      // if player disconnects, remove them from the database
      player1.onDisconnect().remove();
      // sets a new player 1
      player1.set({
        player: player,
        wins: 0,
        losses: 0
      });
      $("#playerInfo").html("Hi " + player + "! You are Player 1");
      // If there is no player 2
      if (!p2snapshot.exists()) {
        $("#playerTurn").html("Waiting for Player 2 to join...");
      }
      // if there is no player 2
    } else if (!p2snapshot.exists()) {
      // sets local variable of player number, to know which page to display choices on and who is taunting
      playerNum = 2;
      // if player disconnects, remove them from the database
      player2.onDisconnect().remove();
      // sets a new player 2
      player2.set({
        player: player,
        wins: 0,
        losses: 0
      });
      // This starts the game
      playerTurn.update({
        turn: 1
      });
      $("#playerInfo").html("Hi " + player + "! You are Player 2");
      $("#playerTurn").html("Waiting for " + p1 + " to choose.");
      // if both players have already joined, don't let a third join
    } else {
      $("#playerInfo").html("Sorry. Two people are already playing");
    }
  } else {
    alert("Please enter a valid name. Your name can be up to two words.");
    $("#playerName").val("");
  }
});

players.on(
  "value",
  function(snapshot) {
    // If both players leave, everything is deleted from database to reset for next game
    if (snapshot.val() == null) {
      $("#player1").css("border-color", "black");
      $("#player2").css("border-color", "black");
      playerTurn.set({});
    }
  },
  function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  }
);

// Results checker
var rpsResults = function() {
  // once this function is called, grabs both players' data
  player1.once(
    "value",
    function(snapshot) {
      p1result = snapshot;
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );
  player2.once(
    "value",
    function(snapshot) {
      p2result = snapshot;
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );
  