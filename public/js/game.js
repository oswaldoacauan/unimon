
function Game(socket) {
    var _io     = socket,
        _room   = null,
        _stage  = this.STAGE_INPUTNAME;

    var $roomList = $('#roomList');

    this.listRooms = function() {
        $.get('/rooms', function(data) {
            var pattern = '<tr><td>%s</td><td>%s</td><td>%s</td><td><button data-action="join-room" data-param="%s" type="button" class="btn btn-default btn-xs">Entrar</button></td></tr>',
                newContent = '';
            if(data.length > 0) {
                $.each(data, function(i, row) {
                    var rowStr = pattern
                        .replace('%s', row.ref)
                        .replace('%s', row.name)
                        .replace('%s', row.count)
                        .replace('%s', row.ref);
                    newContent += rowStr;
                });
            } else {
                newContent = '<tr><td colspan="3">Nenhum campo disponível</td></tr>';
            }

            $roomList.html(newContent);
        });
    }

    this.newRoom = function(name) {
        $.post('/rooms', {name: name}, this.listRooms);
    }

    this.joinRoom = function(id) {
        _io.emit('join', {roomId: id});
        this.listRooms();
        Game.goToStage(this.STAGE_ROOM);
    }
    
    this.inputPlayerName = function(name) {
        _io.emit('inputPlayerName', {playerName: name});
        Game.listRooms();
        Game.goToStage(this.STAGE_LISTROOMS);
    }
    
    this.goToStage = function(stageName) {
        $('.game-stage').hide();
        $('#' + stageName).show();
    }
    
    this.goToStage(_stage);
}

Game.prototype.STAGE_INPUTNAME = 'stage-inputname';
Game.prototype.STAGE_LISTROOMS = 'stage-listrooms';
Game.prototype.STAGE_ROOM = 'stage-room';

