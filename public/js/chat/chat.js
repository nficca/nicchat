/**
 * Created by nic on 13/09/15.
 */
var chatPage = {
    init : function() {
        this.socket = io();
        this.messages = $('#messages');
        this.messageCenter = $('.message-center');

        this.handleSendMessage();
        this.handleReceiveMessage();
    },

    handleSendMessage : function() {
        $('form').submit(function() {
            var messageInput = $('#m');
            var message = $('<div>').text(messageInput.val()).html();
            if (chatPage.validateMessage(message))
                chatPage.socket.emit('message', message);
            messageInput.val('');
            return false;
        });
    },

    handleReceiveMessage : function() {
        chatPage.socket.on('message', function(msgData) {
            chatPage.messages.append($('<li>').append(chatPage.createMessageBox(msgData)));
            chatPage.messageCenter.scrollTop(chatPage.messageCenter.prop('scrollHeight'));
        });
    },

    validateMessage : function(msg) {
        return msg !== '';
    },

    createMessageBox : function(msgData) {
        var messageBox = document.createElement('div');
        messageBox.className = 'message-box';

        var messageText = document.createElement('div');
        messageText.className = 'message-text';
        $(messageText).html(msgData.text);

        var messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp';
        $(messageTimestamp).html(msgData.timestamp);

        $(messageBox).append(messageText);
        $(messageBox).append(messageTimestamp);

        return messageBox;
    }
};

chatPage.init();

