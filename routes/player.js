
function Player(socket) {
    var _socket = socket,
        _name = 'guest';
    
    this.getSocket = function() {
        return _socket;
    };
    
    this.getName = function() {
        return _name;
    }
    
    this.setName = function(name) {
        _name = name;
    }
}

function Players() {
    var data = [];
    
    this.add = function(player) {
        data.push(player);
    };
    
    this.getBySocket = function(socket) {
        for(var i = 0; i < data.length; i++) {
            if(data[i].getSocket() == socket) {
                return data[i];
            }
        }
        return null;
    };
    
    this.removePlayer = function (player) {
        var index   = data.indexOf(player);
        if(index >= 0) {
            data.splice(index, 1);
        }
    };
    
    this.removePlayerBySocket = function(socket) {
        var player  = this.getBySocket(socket);
        this.removePlayer(player);
    };
    
    this.getData = function() {
        return data;
    };
}

exports.Player = Player;
exports.Players = Players;
