var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var users = [];
var drawer = null;

var magicWord = '';
var words = ["duck", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "pig", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "cow", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "space"];

function newWord() {
  var index = Math.floor(Math.random()*(words.length - 1));
  return words[index];
};

io.on('connection', function (socket) {
  socket.on('newUser', function() {
    if (!(users.indexOf(socket.id) > -1)) {
      users.push(socket.id);
    };
    if (users[0] === socket.id) {
      drawer = socket.id;
      magicWord = newWord();
      var gameObj = {isDrawing: true, word: magicWord};
      socket.emit('newGame', gameObj)
    } else {
      var gameObj = {isDrawing: false, word: null};
      socket.emit('newGame', gameObj)
    };
  });
  socket.on('draw', function (position) {
    socket.broadcast.emit('draw', position);
  });
  socket.on('guess', function (message) {
    if (message === magicWord) {
      var index = users.indexOf(socket.id);
      if (index > -1) {
        users.splice(index, 1);
      };
      users.unshift(socket.id);
      io.emit('startOver', magicWord);
      io.emit('guessedRight');
    } else {
      io.emit('guess', message);
    };
  });
  socket.on('disconnect', function() {
    if (users != []) {
      var index = users.indexOf(socket.id);
      if (index > -1) {
        users.splice(index, 1);
      };
      console.log('Client '+socket.id+' disconnected.');
      };
    if (drawer != users[0]) {
      socket.broadcast.emit('startOver');
    };
  })
});


server.listen((process.env.PORT || 8080));
