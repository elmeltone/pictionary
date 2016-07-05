$(function() {
    var socket = io({
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 5000,
        'reconnectionAttempts': 2
    });

    var $guess = $('#guess');
    var $word = $('#word');
    var $guesses = $('.guesses');
    var message;

    var pictionary = function() {
        var canvas, context;

        var newGame = function(gameObj) {
            if (gameObj.isDrawing) {
                $guess.hide();
                $word.show();
                $word.text('Draw: '+gameObj.word);
            } else {
                $word.hide();
                $guess.show();
            };
        };

        var isGuessing = function() {
        };

        var draw = function(position) {
            context.beginPath();
            context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
            context.fill();
        };

        var guess = function(message) {
            $guesses.append('<div class="message-box">'+message+'</div>');
            $guesses[0].scrollTop = $guesses[0].scrollHeight;
        };

        var onKeyDown = function(event) {
            if (event.keyCode != 13) { // Enter
                return;
            }

            message = guessBox.val();
            console.log(guessBox.val());
            socket.emit('guess', message);
            guessBox.val('');
        };

        var drawing = false;
        var guessBox;

        socket.emit('newUser');
        canvas = $('canvas');
        context = canvas[0].getContext('2d');
        canvas[0].width = canvas[0].offsetWidth;
        canvas[0].height = canvas[0].offsetHeight;
        canvas.on('mousedown', function(event) {
            drawing = true;
        }).on('mousemove', function(event) {
            if (drawing) {
                var offset = canvas.offset();
                var position = {x: event.pageX - offset.left,
                                y: event.pageY - offset.top};
                draw(position);
                socket.emit('draw', position);
            };
        }).on('mouseup', function(event) {
            drawing = false;
        }).on('mouseleave', function() {
            canvas.mouseup();
        });

        socket.on('newGame', newGame);
        socket.on('draw', function(position) {
            draw(position);
        });

        guessBox = $('#guess input');
        guessBox.on('keydown', onKeyDown);
        socket.on('guess', function(message) {
            guess(message);
        });
    };

    pictionary();
});
