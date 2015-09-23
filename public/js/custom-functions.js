/**
 * Created by nic on 23/09/15.
 */
var Random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};