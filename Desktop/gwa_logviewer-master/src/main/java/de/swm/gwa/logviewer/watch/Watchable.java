package de.swm.gwa.logviewer.watch;

import java.util.concurrent.CompletableFuture;

import org.apache.commons.io.input.Tailer;


public class Watchable {

    private CompletableFuture<Tailer> tailer;

    public CompletableFuture<Tailer> getTailer() {
        return tailer;
    }

    public void setTailer(CompletableFuture<Tailer> tailer) {
        this.tailer = tailer;
    }

    public String getSimpSessionId() {
        return simpSessionId;
    }

    public void setSimpSessionId(String simpSessionId) {
        this.simpSessionId = simpSessionId;
    }

    private String simpSessionId;
    
    public Watchable(CompletableFuture<Tailer> tailer, String simpSessionId) {
        this.tailer = tailer;
        this.simpSessionId = simpSessionId;
    }
}
