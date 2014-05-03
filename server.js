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
    
    socket.on('inputPlayerName', function(data) {        
        io.sockets.emit('message', {message:"Jogador " + player.getName() + " alterou seu nome para " + data.playerName});
        
        player.setName(data.playerName);
    });

    // When someone try to join a room
    socket.on('join', function(data) {              
        if(rooms.join(socket, data.roomId)){
            //set "global variable" for closures
            _room = rooms.reference(data.roomId);
            _player = _room.get(socket);
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

