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
            color: 'purple'
        };

        this.setupUser();
        this.handleSendMessage();
        this.handleReceiveMessage();
    },

    setupUser : function() {
        var _this = this;
        var colorSelector = $('#colorselector');

        _this.initializeColorSelect(colorSelector);

        $('#setUserInfoBtn').on('click', function() {
            var selectedColor = $(colorSelector).find(':selected').data('color');
            var nickname = $('<div>').text($('#nickname').val()).html();

            if (_this.validateText(nickname)) {
                _this.updateUserInfo({nickname:nickname, color:selectedColor});
            }
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
            if (chatPage.validateText(message))
                var msgData = _this.createMsg(message);
                chatPage.socket.emit('message', msgData);
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

    validateText : function(msg) {
        return msg !== '';
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
        $(messageBox).css('background-color', shadeBlendConvert(0.9, msgData.color));

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

