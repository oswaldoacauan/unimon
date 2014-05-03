var Players = require('./player.js').Players;

function Game() {
    var _players = new Players();
    
    this.addPlayer = function(player) {
        _players.add(player);
    }
    
    this.removePlayer = function(player) {
        _players.removePlayer(player);
    }
    
    this.getNumPlayers = function() {
        var asd = _players.getData();
        
        for (var i in asd) {
            console.log(asd[i].getName());
        }
        
        return _players.getData().length;
    }
}

module.exports = new Game();
