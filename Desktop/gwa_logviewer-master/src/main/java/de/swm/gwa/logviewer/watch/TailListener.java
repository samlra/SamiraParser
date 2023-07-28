package de.swm.gwa.logviewer.watch;

import org.apache.commons.io.input.TailerListenerAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import de.swm.gwa.logviewer.FileContentBroadcaster;

public class TailListener extends TailerListenerAdapter {

    private Logger logger = LoggerFactory.getLogger(TailListener.class);

    private FileContentBroadcaster broadcaster;

    private String filename;
    private String tenant;

    public TailListener(String tenant, String filename, FileContentBroadcaster broadcaster) {
        this.filename = filename;
        this.broadcaster = broadcaster;
        this.tenant = tenant;
    }

    @Override
    public void handle(String line) {
        this.broadcaster.sendContent(new String[]{line}, this.filename, this.tenant);
        logger.debug(line);
    }
}
