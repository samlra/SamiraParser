package de.swm.gwa.logviewer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Handles the broadcasting of messages to connected SockJS clients.
 */
@Component
public class FileContentBroadcaster {
    private Logger logger = LoggerFactory.getLogger(FileContentBroadcaster.class);
    @Autowired
    private SimpMessagingTemplate template;
    
    /**
     * Broadcasts new content to any subscribed clients.
     * @param lines The lines to broadcast
     */
    public void sendContent(String[] lines, String filename, String tenant) {
        String destination = "/topic/log/" + tenant + "/" +  filename;
        template.convertAndSend(destination, lines);
        if (logger.isDebugEnabled()) {
            for (String string : lines) {
                logger.debug("sent to topic " + destination + " following line {}", string);
            }
        }
    }
}
