$(function() {
    var socket = io({
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 5000,
        'reconnectionAttempts': 2
    });

    var here = false;
    var $guess = $('#guess');
    var $word = $('#word');
    var $guesses = $('.guesses');
    var message;



    var welcome = function() {
        if (!here) {
            $('.welcome').delay(300).slideDown('slow').delay('1500').slideUp('slow');
            here = true;
        };
    };

    var startOver = function(magicWord) {
        $('#guessed').text('');
        $('#guessed').text(magicWord);
        socket.emit('newUser');
    };

    var count = function(users) {
        $('#mid-count').text('');
        $('#mid-count').text(users);
        $('.connect').delay(3800).slideDown('slow').delay('2500').slideUp('slow');
    };

    var guessedRight = function() {
        $('.end-notify').delay(300).slideDown('slow').delay('2500').slideUp('slow');
    };

    var pictionary = function() {
        var canvas, context;

        var newGame = function(gameObj) {
            $('.guesses').empty();
            canvas = $('canvas');
            canvas.width = 312;
            canvas.height = 312;
            context = canvas[0].getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas[0].width = canvas[0].offsetWidth;
            canvas[0].height = canvas[0].offsetHeight;
            if (gameObj.isDrawing) {
                $(canvas).css('cursor', 'url("http://i.imgur.com/eU9euoe.png"), auto');
                $guess.hide();
                $word.show();
                $word.text('Draw: '+gameObj.word);
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
                canvas.on('touchstart', function(event) {
                    event.preventDefault();
                    drawing = true;
                }).on('touchmove', function(event) {
                    event.preventDefault();
                    if (drawing) {
                        var offset = canvas.offset();
                        var position = {x: event.pageX - offset.left,
                                        y: event.pageY - offset.top};
                        draw(position);
                        socket.emit('draw', position);
                    };
                }).on('touchend', function(event) {
                    event.preventDefault();
                    drawing = false;
                }).on('touchleave', function() {
                    event.preventDefault();
                    canvas.mouseup();
                });
            } else {
                $(canvas).css('cursor', 'url("http://i.imgur.com/APQAtOQ.png"), auto');
                canvas.on('mousedown', function(event) {
                    drawing = false;
                });
                $word.hide();
                $guess.show();
                $('.guess-place').focus();
            };
        };

        var isGuessing = function() {
        };

        var draw = function(position) {
            context.beginPath();
            context.arc(position.x, position.y,
                         3, 0, 2 * Math.PI);
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
        socket.on('newGame', newGame);
        socket.on('welcome', welcome);
        socket.on('count', count);
        socket.on('draw', function(position) {
            draw(position);
        });

        guessBox = $('#guess input');
        guessBox.on('keydown', onKeyDown);
        socket.on('guess', function(message) {
            guess(message);
        });
        socket.on('startOver', startOver);
        socket.on('guessedRight', guessedRight);
    };

    pictionary();
});
