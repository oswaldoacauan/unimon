var Players = require('./player.js').Players;

function Game() {
    var _players = new Players();
    var _rooms = null;
    
    this.addPlayer = function(player) {
        _players.add(player);
    }
    
    this.removePlayer = function(player) {
        var playerRoom = _rooms.getPlayerRoom(player);
        
        if (playerRoom != null) {
            _rooms.leave(player, playerRoom.id());
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
}

module.exports = new Game();
