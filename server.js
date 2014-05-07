/*************************************
//
// unimon app
//
**************************************/

// express magic
var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    rooms   = require('./routes/room.js'),
    game    = require('./routes/game.js'),
    Player  = require('./routes/player.js').Player;

var runningPortNumber = process.env.PORT;

var stages = {
    STAGE_INPUTNAME: 'stage-inputname',
    STAGE_LISTROOMS: 'stage-listrooms',
    STAGE_ROOM: 'stage-room'
};

app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    // logs every request
    app.use(function(req, res, next){
        console.log({method:req.method, url: req.url});
        next();
    });
});

io.set('origins', '*:*');

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get("/", function(req, res){
	res.render('index', {});
});

app.get('/rooms',function(req, res) {
    res.json(200, rooms.all());
});

app.post('/rooms',function(req, res, next) {
    next();
}, function(req, res) {
    var name = req.body.name || 'dummy';
    rooms.createRoom(name);
    io.sockets.emit('message', {message:"O campo de batalha " + name + " foi criado"});
    res.json(201, rooms.all());
});

// Socket
// ===========================
/*
function leave(socket, room) {
    if(room !== null) {
        room.leave(socket);
        var players = room.all();
        for (var i = 0; i < players.length; i++) {
            players[i].socket.emit('finish', {});
        }
    }
}
*/

game.setSocket(io);
game.setRooms(rooms);

io.sockets.on('connection', function (socket) {
    // Globals
	var _room, _id, _player;

    var player = new Player(socket);
    game.addPlayer(player);

    io.sockets.emit('message', {message:"Jogador " + player.getName() + " entrou no jogo"});

    //leave
    /*socket.on('disconnect', function(data) {
        leave(socket, room);
    });

    socket.on('leave', function(data) {
        console.log(leave);
        leave(socket, room);
    });*/

    socket.on('roundPlayerAttack', function(data) {
        game.attack(_room.getPlayers().getByIndex(_room.getCurrentPlayer()));
    });

    socket.on('inputPlayerName', function(data) {
        player.setName(data.playerName);
        if(data.playerName == player.getName())
            io.sockets.emit('message', {message:"Jogador " + player.getName() + " alterou seu nome para " + data.playerName});
    });

    // When someone try to join a room
    socket.on('join', function(data) {
        if(rooms.join(player, data.roomId)){
            //set "global variable" for closures
            _room = rooms.reference(data.roomId);
            game.sendInfoRoom(player, io.sockets);
            var otherPlayer = _room.other(player);
            if (otherPlayer != null) {
                game.sendInfoRoom(otherPlayer, io.sockets);
            }
            socket.emit('message', {message:'Você entrou no campo de batalha (' + _room.getName() + ')'});
        } else {
            socket.emit('message', {message:'Erro ao entrar no campo de batalha'});
        }
    });

    socket.on('disconnect', function () {
        io.sockets.emit('message', {message:"Jogador " + player.getName() + " saiu do jogo"});
        game.removePlayer(player);
    });

});


server.listen(runningPortNumber);

