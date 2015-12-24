$(document).ready(function(){
    var _slide = 1;
    var socket = io.connect('http://192.168.1.119:8000');

    $(window).resize(function(evt){
        setPosition(_slide);
    });

    var setPosition = function(slide){
        $(window).scrollTop($('#' + slide).offset().top);
    };

    var changeSlide = function(direction){
        socket.emit('changeSlide', { direction: direction });
    };

    var showSockets = function(){
        var $socketContainer = $('#sockets-container');

        if($socketContainer.hasClass('hidden')){
            $socketContainer.removeClass('hidden');
        }
        else{
            $socketContainer.addClass('hidden');
        }
    };

    var wireUpSocketClick = function(id){
        var selector = id === null ? '.socket' : '#' + id;

        $(selector).click(function(evt){
            var socketId = $(evt.target).attr('id');
            var $listItem = $('#' + socketId);
            var isPresenter = $listItem.hasClass('presenter');

            if(isPresenter === true){
                $listItem.removeClass('presenter');
                socket.emit('change-presenters', { type: 'remove', id: socketId });
            }
            else{
                $listItem.addClass('presenter');
                socket.emit('change-presenters', { type: 'add', id: socketId });
            }
        });
    };

    $(document).keydown(function(evt){
        var key = evt.keyCode;
        if(key === 40 || key === 39){
            evt.preventDefault();
            changeSlide('next');
        }
        else if(key === 38 || key === 37){
            evt.preventDefault();
            changeSlide('prev');
        }
        else if(key === 79){
            showSockets();
        }
    });

    socket.on('render', function(data){
        if(data){
            _slide = data.slide;
            setPosition(data.slide);
        }
        else{
            console.log("Something went wrong: " + data);
        }
    });

    socket.on('message', function(data){
        var $message = $('#message');
        $message.html(data.message);
        $message.removeClass('hidden');

        setTimeout(function(){ $message.addClass('hidden'); }, 3000);
    });

    socket.on('updateSockets', function(data){
        var $socketList = $('#socket-list');
        var html = '';
        var presenterClass = '';

        for(var i=0; i<Object.keys(data).length; i++){
            presenterClass = data[Object.keys(data)[i]].isPresenter === true ? 'presenter' : '';
            html += '<li id="' + Object.keys(data)[i] + '" class="list-group-item socket ' + presenterClass + '">' + data[Object.keys(data)[i]].address + '</li>';
        }

        $socketList.html(html);
        wireUpSocketClick(null);
    });

    socket.on('client-connect', function(data){
        $('#socket-list').append('<li id="' + data.id + '" class="list-group-item socket">' + data.id + '</li>');
        wireUpSocketClick(data.id);
    });
 });