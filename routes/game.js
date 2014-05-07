var Players = require('./player.js').Players;

var stages = {
    STAGE_INPUTNAME: 'stage-inputname',
    STAGE_LISTROOMS: 'stage-listrooms',
    STAGE_ROOM: 'stage-room'
};

var CHANCE_CRITICAL = 0.1;
    CHANCE_MISS     = 0.2;

function Game() {
    var _players = new Players();
    var _rooms = null;
    var _io = null;

    this.setSocket = function(io) {
        _io = io;
    }

    this.addPlayer = function(player) {
        _players.add(player);
    }

    this.removePlayer = function(player) {
        var playerRoom = _rooms.getPlayerRoom(player);

        if (playerRoom != null) {
            var other = playerRoom.other(player);

            _rooms.leave(player, playerRoom.id());

            if (other != null) {
                this.sendInfoRoom(other);
            }
        }

        _players.removePlayer(player);
    }

    this.getNumPlayers = function() {
        var asd = _players.getData();

        for (var i in asd) {
            console.log(asd[i].getName());
        }

        return _players.getData().length;
    }

    this.setRooms = function(rooms) {
        _rooms = rooms;
    }

    this.sendInfoRoom = function(player) {
        var room = _rooms.getPlayerRoom(player);

        player.getSocket().emit('roomInfo', {
            stage: stages.STAGE_ROOM,
            room: room.export(),
            players: {
                you: room.exportPlayerInfoRoom(player),
                other: room.exportOtherPlayerInfoRoom(player)
            }
        });
    }

    this.endGame = function() {
        _io.sockets.emit('changeStage', {stage:stages.STAGE_LISTROOMS});
    }

    this.attack = function(player) {
        var atkDmg = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
            msgPrepend = '[ATTACK]  ',
            room = _rooms.getPlayerRoom(player),
            enemy = room.other(player);

        if(Math.random() <= CHANCE_CRITICAL) {
            // pew pew critical on your face
            atkDmg = atkDmg * 2;
            msgPrepend = '[CRITICAL]';
        }

        if(Math.random() <= CHANCE_MISS) {
            _io.sockets.emit('message', {message:"[MISS]     " + player.getName() + " errou o ataque"});
        } else {
            enemy.setHp(enemy.getHp() - atkDmg);

            player.getSocket().emit('message', {message: msgPrepend + " Você atacou com " + atkDmg + " de dano"});
            enemy.getSocket().emit('message', {message: msgPrepend + " Você sofreu " + atkDmg + " de dano"});
        }

        room.updateCurrentPlayer();
        this.sendInfoRoom(player);
        this.sendInfoRoom(enemy);

         if(enemy.getHp() <= 0) {
            player.getSocket().emit('message', {message: "<b>Você venceu " +enemy.getName()+ " nesta batalha!</b>"});
            enemy.getSocket().emit('message', {message: "<b>Você foi derrotado por "+player.getName()+"</b>"});
            room.leave(player);
            room.leave(enemy);
            this.endGame();
        }
    }
}

module.exports = new Game();
