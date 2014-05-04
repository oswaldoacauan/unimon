var socket = io.connect('http://127.0.0.1:1337/'),
    Game = new Game(socket);

$(function() {

    // Data-Api Bindings
    // =============
    $(document).on('click', '[data-action]', function(e) {
        e.preventDefault();

        var _self   = $(this),
            _action = _self.data('action'),
            _param  = _self.data('param') || null;

        switch(_action) {
            case 'input-name':
                var playerName = _self.siblings('input[name=name]').val();
                Game.inputPlayerName(playerName);
                break;
                
            case 'new-room':
                var inpt = _self.siblings('input[name=room-name]');
                Game.newRoom(inpt.val());
                inpt.val(null);
                break;
                
            case 'join-room':
                Game.joinRoom(_param);
                break;
                
            case 'refresh-rooms':
                Game.listRooms();
                break;
                
            default:
                break;
        }
    });

    // Socket Events
    // =============
	socket.on("message", function(data) {
        $('#log').append(data.message + '<br/>');
    });
    
    socket.on("roomInfo", function(data) {
        Game.goToStage(data.stage);
        Game.roomInfo(data);
    });
});
