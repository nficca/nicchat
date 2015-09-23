/**
 * Created by nic on 13/09/15.
 */
var chatPage = {
    init : function() {
        this.socket = io();
        this.messages = $('#messages');
        this.messageCenter = $('.message-center');
        this.colors = [];

        this.userInfo = {
            nickname: 'anonymous',
            color: '#A466B0'
        };

        this.setupUser();
        this.handleSendMessage();
        this.handleReceiveMessage();
        this.setupColors();
    },

    setupUser : function() {
        var _this = this;
        var colorSelector = $('#colorselector');
        var nicknameInput = $('#nickname');

        $(nicknameInput).val('anonymous');

        _this.initializeColorSelect(colorSelector);

        function changeUserInfo() {
            var selectedColor = $(colorSelector).find(':selected').data('color');
            var nickname = $('<div>').text($(nicknameInput).val()).html();

            var changedInfo = {
                nickname: _this.validateName(nickname) ? nickname : _this.userInfo.nickname,
                color:selectedColor
            };

            _this.updateUserInfo(changedInfo);
        }

        $(colorSelector).on('change', function() {
            changeUserInfo();
        });

        $(nicknameInput).on('focusout', function() {
            changeUserInfo();
        });
    },

    printName : function(userInfo) {
        return '<span style="font-weight: bold;color:'+userInfo.color+'">'+userInfo.nickname+'</span>';
    },

    updateUserInfo : function(userInfo) {
        var change = false;
        var original = {nickname:this.userInfo.nickname, color:this.userInfo.color};

        if (userInfo.hasOwnProperty('nickname')) {
            change = true;
            this.userInfo.nickname = userInfo.nickname;
        }
        if (userInfo.hasOwnProperty('color')) {
            change = true;
            this.userInfo.color = userInfo.color;
        }

        if (change && !(original.nickname == userInfo.nickname && original.color == userInfo.color)) {
            var msgData = {type: 'server', sender:'console'};
            msgData.text = chatPage.printName(original)+' is now '+chatPage.printName(userInfo)+'.';
            chatPage.socket.emit('message', msgData);
        }
    },

    initializeColorSelect : function(selector) {
        $(selector).colorselector();
    },

    handleSendMessage : function() {
        var _this = this;
        $('form').submit(function() {
            var messageInput = $('#m');
            var message = $('<div>').text(messageInput.val()).html();
            if (message.indexOf('/') === 0) {
                chatPage.processCommand(message);
            } else if(chatPage.validateMsg(message)) {
                var msgData = _this.createMsg(message);
                chatPage.socket.emit('message', msgData);
            }
            messageInput.val('');
            return false;
        });
    },

    handleReceiveMessage : function() {
        chatPage.socket.on('message', function(msgData) {
            chatPage.printMsg(msgData);
        });
    },

    printMsg : function(msgData) {
        chatPage.messages.append(msgData.type == 'client' ? chatPage.createMessageBox(msgData) : chatPage.createServerMessage(msgData));
        chatPage.messageCenter.scrollTop(chatPage.messageCenter.prop('scrollHeight'));
    },

    validateMsg : function(msg) {
        return msg !== '';
    },

    validateName : function(name) {
        return /^[a-zA-Z0-9][a-zA-Z0-9_]{2,16}$/.test(name)
    },

    createMsg : function(msg) {
        var _this = this;
        return {
            type: 'client',
            sender: _this.userInfo.nickname,
            text: msg,
            color: _this.userInfo.color
        };
    },

    createMessageBox : function(msgData) {
        var messageBox = document.createElement('div');
        messageBox.className = 'message-box col-xs-12';
        $(messageBox).css('color', msgData.color);
        $(messageBox).css('background-color', shadeBlendConvert(0.8, msgData.color));

        var messageText = document.createElement('div');
        messageText.className = 'message-text col-xs-10 col-sm-11';
        $(messageText).html('<b>'+msgData.sender+'</b>:&nbsp;'+msgData.text);

        var messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp col-xs-2 col-sm-1 pull-right text-sm';
        $(messageTimestamp).html(msgData.timestamp);

        $(messageBox).append(messageText);
        $(messageBox).append(messageTimestamp);

        return messageBox;
    },

    createServerMessage : function(msgData) {
        var messageBox = document.createElement('div');
        messageBox.className = 'message-box col-xs-12';
        $(messageBox).css('color', '#737373');
        $(messageBox).css('background-color', '#FFFFFF');

        var messageText = document.createElement('div');
        messageText.className =  'message-text col-xs-11';
        $(messageText).html('<i>'+msgData.text+'</i>');

        $(messageBox).append(messageText);

        return messageBox;
    },

    processCommand : function(msg) {
        var command = msg.substring(1, msg.length).split(' ');
        var emit = false;
        var msgData = {sender:'console', type:'server'};

        switch(command[0]) {

            // /help
            case 'help': msgData.text =
                'commands:<br>' +
                '/nick [newnick] (Changes nickname)<br>' +
                '/color [color] (Changes color)<br>' +
                '/roll (Rolls a number between 1 and 100)<br>' +
                '/nicchat (Displays credits)<br>' +
                '/help (Displays this)';
                break;

            // /nick
            case 'nick':
                if (command.length < 2) {
                    msgData.text =
                        'command: Change nickname to [newnick]<br>' +
                        'usage: /nick [newnick]';

                } else if (chatPage.validateName(command[1])) {
                    chatPage.updateUserInfo({nickname:command[1], color:chatPage.userInfo.color});
                    $('#nickname').val(command[1]);
                    msgData.text = 'Nickname successfully changed to '+command[1]+'.';

                } else {
                    msgData.text = 'Invalid nickname. Nickname remains unchanged.';
                }
                break;

            // /color
            case ('color' || 'colour'):
                if (command.length < 2) {

                    var possibleColors = chatPage.colors.map(function(a) {return '<span style="color:'+a.hex+'">'+a.name+'</span>';}).join(' | ');

                    msgData.text =
                        'command: Change color to [newcol]<br>' +
                        'usage: /color [newcol]<br>' +
                        'where [newcol] is : '+ possibleColors;

                } else if (chatPage.translateColor(command[1])) {
                    var newCol = command[1];
                    if (newCol.substring(0,1) !== '#') newCol = chatPage.translateColor(newCol);

                    chatPage.updateUserInfo({nickname:chatPage.userInfo.nickname, color:newCol});
                    $('#colorselector').colorselector('setColor', newCol);

                    msgData.text = 'Color successfully changed to '+command[1];

                } else {
                    msgData.text = 'Invalid color. Type /color to see a list of possible colors.';
                }
                break;

            // /roll
            case 'roll':
                emit = true;
                msgData.text = chatPage.printName(chatPage.userInfo)+' rolled <b>'+Random(1,100)+'</b>!';
                break;
            // /nicchat
            case 'nicchat':
                msgData.text = 'nicchat is an application built by Nic Ficca with nodejs and expressjs.<br>' +
                    'This project is <a href="http://github.com/nficca/nicchat" target="_blank">open-source.</a><br>' +
                    'You can contact me via <a href="mailto:nicficca@gmail.com">nicficca@gmail.com</a>';
                break;

            // default
            default: msgData.text = 'Type /help for a list of commands'; break;
        }

        if (emit) {
            chatPage.socket.emit('message',msgData);
        } else {
            chatPage.printMsg(msgData);
        }
    },

    setupColors : function() {
        var colors = $('#colorselector').find('option');
        for (var c = 0; c < colors.length; c++) {
            chatPage.colors.push(
                {
                    name: $(colors[c]).html(),
                    hex:  $(colors[c]).data('color')
                }
            );
        }
    },

    translateColor : function(color) {
        var colors = chatPage.colors;
        for (var c in colors) {
            if (colors[c].hex.toLowerCase() == color.toLowerCase()) return colors[c].name;
            else if (colors[c].name.toLowerCase() == color.toLowerCase()) return colors[c].hex;
        }
        return false;
    }
};

chatPage.init();

