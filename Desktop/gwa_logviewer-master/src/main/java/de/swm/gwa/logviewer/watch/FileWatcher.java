package de.swm.gwa.logviewer.watch;

import java.nio.file.Path;

public interface FileWatcher {
    public void watchFile(Path file);
    public void removeFileListener(FileListener listener);
    public void addFileListener(FileListener listener);
    public void stop();
}
