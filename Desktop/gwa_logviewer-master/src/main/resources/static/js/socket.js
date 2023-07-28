/**
 * WebSocket communications layer module
 */
'use strict';

var SockJS = require('sockjs-client');
var Stomp = require('@stomp/stompjs');
var ee = require('event-emitter');

var EVENT_CONNECTION_STATE_CHANGE = 'connectionstatechange';
var EVENT_LOG_MESSAGE_RECEIVE = 'logmessagereceive';

var SOCKJS_ENDPOINT = './tail';
var STOMP_TOPIC = '/topic/log';

var ConnectionState = {
    DISCONNECTED: 0,
    FAILED: 1,
    CONNECTING: 2,
    CONNECTED: 3
};
/** sockJS CLient */
var socket;


/** The currently active STOMP client. */
var stompClient;

/** The current connection state. */
var currentState = ConnectionState.DISCONNECTED;

var emitter = ee({});

/**
 * Initiates the STOMP over SockJS connection.
 */
function connect() {
    const urlParams = new URLSearchParams(window.location.search);

    stompClient = new Stomp.Client({
        brokerURL: SOCKJS_ENDPOINT,
        debug: function (str) {
            console.log("stomp connect debug: " + str);
        },
        onStompError: function (frame) {
            // Will be invoked in case of error encountered at Broker
            // Bad login/passcode typically will cause an error
            // Complaint brokers will set `message` header with a brief message. Body may contain details.
            // Compliant brokers will terminate the connection after any error
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        },
        onConnect: function (frame) {
            console.log("onConnect");
            emitter.emit(EVENT_CONNECTION_STATE_CHANGE, ConnectionState.CONNECTED);
            

            stompClient.subscribe(STOMP_TOPIC + "/" + urlParams.get('tenant') + "/" + urlParams.get('logfile'), onMessage);
        },
        onWebSocketClose: function (evt) {
            console.log("websocket got closed. Event: " + evt);
            emitter.emit(EVENT_CONNECTION_STATE_CHANGE, ConnectionState.DISCONNECTED);
        }
    });

    stompClient.webSocketFactory = function () {
        socket = new SockJS(SOCKJS_ENDPOINT);
        // stomp.js has to perform cleanup on close, but we need to listen too
        socket.onclose = function() {
            console.log("onclose in factory");
            closeConnection(this.onclose);
            stompClient.close();
        };
        return socket;
    };

    emitter.emit(EVENT_CONNECTION_STATE_CHANGE, ConnectionState.CONNECTING);


    stompClient.activate();
}

/**
 * Handles an incoming STOMP message.
 * @param content the message content as a string
 */
function onMessage(content) {
    JSON.parse(content.body).forEach(function(message) {
        emitter.emit(EVENT_LOG_MESSAGE_RECEIVE, message);
    });
}

/**
 * Updates the connection status, then calls the SockJS cleanup code.
 * @param onclose the original socket.onclose function.
 */
function closeConnection(onclose) {
    console.log("closeConnection function called");
    if (currentState === ConnectionState.CONNECTING) {
        emitter.emit(EVENT_CONNECTION_STATE_CHANGE, ConnectionState.FAILED);
    } else {
        emitter.emit(EVENT_CONNECTION_STATE_CHANGE, ConnectionState.DISCONNECTED);
    }
    onclose();
}

/**
 * Adds a listener for the EVENT_CONNECTION_STATE_CHANGE event.
 * @param listener the listener function
 */
function onConnectionStateChange(listener) {
    emitter.on(EVENT_CONNECTION_STATE_CHANGE, listener);
}

/**
 * Adds a listener for the EVENT_LOG_MESSAGE_RECEIVE event.
 * @param listener the listener function
 */
function onLogMessage(listener) {
    emitter.on(EVENT_LOG_MESSAGE_RECEIVE, listener);
}

exports.connect = connect;
exports.onConnectionStateChange = onConnectionStateChange;
exports.onLogMessage = onLogMessage;
exports.ConnectionState = ConnectionState;
