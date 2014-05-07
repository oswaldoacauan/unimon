var Players = require('./player.js').Players;

function Room(name, id) {
    var _ref = id,
        _players = new Players(),
        _name = name,
        _currentPlayer = 0,
        onPlay = false;


    this.id = function() {
        return _ref;
    };

    this.getPlayers = function() {
        return _players;
    };

    this.getName = function() {
        return _name;
    };

    this.getCurrentPlayer = function() {
        return _currentPlayer;
    };

    this.updateCurrentPlayer = function() {
        _currentPlayer = _currentPlayer == 0 ? 1 : 0;
    };
};

//expose the data only
Room.prototype.export = function() {
    return {
        name: this.getName(),
        currentPlayer: this.getCurrentPlayer(),
        ref: this.id(),
        count: this.count()
    };
};

Room.prototype.exportPlayerInfoRoom = function(player) {
    if (player === null) {
        return null;
    }

    return {
        player: player.export(),
        position: this.getPlayers().getIndexOf(player)
    };
}

Room.prototype.exportOtherPlayerInfoRoom = function(player) {
    return this.exportPlayerInfoRoom(this.other(player));
}

//return all the players
Room.prototype.all=function(){
    return this.getPlayers();
};

//return true whether this payer is in the room
Room.prototype.hasPlayer = function(player) {
    return (this.getPlayers().get(player) === null) ? false : true;
};

Room.prototype.other = function(player) {
    var index = this.getPlayers().getIndexOf(player);
    var otherIndex = (index == 0) ? 1 : 0;
    return this.getPlayers().getByIndex(otherIndex);
};

Room.prototype.add = function(player) {
    var players = this.getPlayers();
    //maximum two players
    if(players.length() < 2) {
        //we are not in yet
        if(this.hasPlayer(player) === false) {
            players.add(player);
            return true;
        }
    }
    else return false;
};

Room.prototype.count = function() {
    return this.getPlayers().length();
};

Room.prototype.check = function (socket, row, column) {
    var target = this.get(socket);
    for (var j = 0; j < target.boats.length; j++) {
        for (var k = 0; k < target.boats[j].cells.length; k++) {
            //touched
            if (target.boats[j].cells[k].row == row && target.boats[j].cells[k].column == column) {
                //reduce health
                target.boats[j].health = target.boats[j].health - 1;
                target.health=target.health-1;
                return { hit:true, boat:target.boats[j]};
            }
        }
    }
    return {hit:false};
}

Room.prototype.update = function() {
    var players = this.getPlayers();

    if(players.length() == 2) {
        this.onPlay=this.other(this.onPlay.socket);
    }
}

Room.prototype.leave = function(player) {
    this.getPlayers().removePlayer(player);
};

function dbSession() {
    var data = [
        new Room('big fight', 1),
        new Room('super fight', 2)
    ];

    //get a proper id (private function)
    function getId(){
        var id = 0;
        for(var i = 0; i<data.length; i++) {
            id = Math.max(id, data[i].id());
        }
        return id + 1;
    }

    //get a reference to a room object
    function getRoom(id){
        for(var i = 0; i < data.length; i++) {
            if(data[i].id() == id) {
                return data[i];
            }
        }
        return null;
    }

    //to be deleted
    this.reference = function(ref){
        return getRoom(ref);
    };

    //return all rooms
    this.all = function(){
        var rooms = [];
        for(var i = 0; i < data.length; i++) {
            rooms.push(data[i].export());
        }
        return rooms;
    };

    //return a given room (serialized for network :not a reference)
    this.room = function(ref){
        var room = getRoom(ref);
        if(room) {
            return room.export();
        }
        else return null;
    };

    //create a room
    this.createRoom = function(name) {
        var id = getId();
        data.push(new Room(name, id));
    };

    //delete a room
    this.deleteRoom = function(id){
        var room = getRoom(id);
        if(room) {
            data.splice(data.indexOf(room), 1);
            return true;
        }
        return false;
    };

    //join
    this.join = function(player, roomid){
        var room = getRoom(roomid);
        if(room && (this.getPlayerRoom(player) === null)) {
            return room.add(player);
        }
        return false;
    };

    //join
    this.leave = function(player, roomid){
        var room = getRoom(roomid);
        if(room) {
            return room.leave(player);
        } else {
            return false;
        }
    };

    this.getPlayerRoom = function(player) {
        for(var i = 0; i < data.length; i++) {
            if (data[i].hasPlayer(player)) {
                return data[i];
            }
        }

        return null;
    }

};

module.exports = new dbSession();
