package de.swm.gwa.logviewer.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;


@Component
public class WebSocketEventListener {


    private Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @EventListener
    private void handleSessionConnected(SessionConnectEvent event) {
        logger.debug("connect event received" + event.getMessage() + " id: " + event.getMessage().getHeaders().getId());
    }

    @EventListener
    private void handleSessionDisconnect(SessionDisconnectEvent event) {
        logger.debug("disconnect with id: " + (String) event.getMessage().getHeaders().get("simpSessionId"));

    }

    @EventListener
    public void handleSessionSubscribeEvent(SessionSubscribeEvent event) {
        GenericMessage message = (GenericMessage) event.getMessage();
        String simpDestination = (String) message.getHeaders().get("simpDestination");

        logger.debug("Subscription to: " + simpDestination);
        logger.debug("subscirption with id: " + (String) event.getMessage().getHeaders().get("simpSessionId"));

        if (simpDestination.startsWith("/topic/group/1")) {
            // do stuff
        }
    }
}
