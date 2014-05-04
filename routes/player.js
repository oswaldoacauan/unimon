
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

Player.prototype.export = function() {
    return {
        name: this.getName()
    };
}

function Players() {
    var data = [];
    
    this.add = function(player) {
        data.push(player);
    };
    
    this.getIndexOf = function(player) {
        return data.indexOf(player);
    };
    
    this.getByIndex = function(i) {
        if (typeof data[i] == 'undefined') {
            return null;
        }
        return data[i];
    }
    
    this.get = function(player) {
        var index = data.indexOf(player);
        if (index >= 0) {
            return data[index];
        }
        return null;
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
    
    this.length = function() {
        return data.length;
    };
}

exports.Player = Player;
exports.Players = Players;
