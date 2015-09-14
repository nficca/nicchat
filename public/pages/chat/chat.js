/**
 * Created by nic on 13/09/15.
 */
var chatPage = {
    init : function() {
        this.socket = io();
        this.messages = $('#messages');

        this.handleSendMessage();
        this.handleReceiveMessage();
    },

    handleSendMessage : function() {
        $('form').submit(function() {
            var message = $('#m');
            chatPage.socket.emit('message', message.val());
            message.val('');
            return false;
        });
    },

    handleReceiveMessage : function() {
        chatPage.socket.on('message', function(msg) {
            chatPage.messages.append($('<li>').text(msg));
        });
    }
};

chatPage.init();

