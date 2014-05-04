var Players = require('./player.js').Players;

var stages = {
    STAGE_INPUTNAME: 'stage-inputname',
    STAGE_LISTROOMS: 'stage-listrooms',
    STAGE_ROOM: 'stage-room'
};

function Game() {
    var _players = new Players();
    var _rooms = null;
    
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
}

module.exports = new Game();
