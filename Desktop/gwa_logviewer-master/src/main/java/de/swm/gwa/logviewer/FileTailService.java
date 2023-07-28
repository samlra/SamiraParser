package de.swm.gwa.logviewer;

import java.io.File;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import de.swm.gwa.logviewer.watch.TailListener;
import de.swm.gwa.logviewer.watch.Watchable;

/**
 * A service that coordinates the file tail operation. The service runs
 * asynchronously, and
 * maintains a FileWatcher and FileContentReader for the specified file.
 */
@Service
public class FileTailService {
    private Logger logger = LoggerFactory.getLogger(FileTailService.class);

    private HashMap<String, Watchable> watchables = new HashMap<>();

    @Autowired
    private FileContentBroadcaster broadcaster;


    @Async("threadPoolTaskExecutor")
    public void tailFile(String tenant, Path file) {
        if (!watchables.containsKey(file.toString())) {

            logger.info("Tailing " + file);

            TailerListener listener = new TailListener(tenant, file.getFileName().toString(), broadcaster);
            Tailer tailer = Tailer.create(new File(file.toString()), listener, 500, true);
            CompletableFuture<Tailer> cf = CompletableFuture.completedFuture(tailer);
            Watchable wtble = new Watchable(cf, null);
            watchables.put (file.toString(), wtble);       
        }
    }

    public void stopWatching(Path file) {
        logger.info("stopping to watch {}, closing reader", file.toString());
        if (watchables.containsKey(file.toString())) {
            Watchable wtbl = watchables.get(file.toString());
            wtbl.getTailer().cancel(true);
            logger.info("stopped watching " + file);
            watchables.remove(file.toString());
        }
    }
}
