/**
 * Created by nic on 13/09/15.
 */
var chatPage = {
    init : function() {
        this.socket = io();
        this.messages = $('#messages');
        this.messageCenter = $('.message-center');

        this.userInfo = {
            nickname: 'anonymous',
            color: '#A466B0'
        };

        this.setupUser();
        this.handleSendMessage();
        this.handleReceiveMessage();
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

        $(nicknameInput).on('keyup', function() {
            changeUserInfo();
        });
    },

    updateUserInfo : function(userInfo) {
        if (userInfo.hasOwnProperty('nickname')) this.userInfo.nickname = userInfo.nickname;
        if (userInfo.hasOwnProperty('color')) this.userInfo.color = userInfo.color;
    },

    initializeColorSelect : function(selector) {
        $(selector).colorselector();
    },

    handleSendMessage : function() {
        var _this = this;
        $('form').submit(function() {
            var messageInput = $('#m');
            var message = $('<div>').text(messageInput.val()).html();
            if (chatPage.validateMsg(message)) {
                var msgData = _this.createMsg(message);
                chatPage.socket.emit('message', msgData);
            }
            messageInput.val('');
            return false;
        });
    },

    handleReceiveMessage : function() {
        chatPage.socket.on('message', function(msgData) {
            chatPage.messages.append(chatPage.createMessageBox(msgData));
            chatPage.messageCenter.scrollTop(chatPage.messageCenter.prop('scrollHeight'));
        });
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
        messageText.className = 'message-text col-xs-11';
        $(messageText).html('<b>'+msgData.sender+'</b>:&nbsp;'+msgData.text);

        var messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp col-xs-1 pull-right text-sm';
        $(messageTimestamp).html(msgData.timestamp);

        $(messageBox).append(messageText);
        $(messageBox).append(messageTimestamp);

        return messageBox;
    }
};

chatPage.init();

