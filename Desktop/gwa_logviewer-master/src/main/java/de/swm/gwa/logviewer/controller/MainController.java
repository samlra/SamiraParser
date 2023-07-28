package de.swm.gwa.logviewer.controller;

import de.swm.gwa.logviewer.FileContentBroadcaster;

import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import de.swm.gwa.logviewer.FileTailService;
import de.swm.gwa.logviewer.LogviewerApplication;


@Controller
public class MainController {

    private Logger logger = LoggerFactory.getLogger(MainController.class);

    /** The maximum filename length before truncation occurs. */
    private static final int MAX_FILENAME_LENGTH = 50;

	@Autowired
	private FileTailService fts;

    @Value("${configuration.folder}")
	private String logFolder;


	public static final char[] ILLEGAL_CHARACTERS = { '/', '\n', '\r', '\t', '\0', '\f', '`', '?', '*', '\\', '<', '>', '|', '\"', ':' };

	@Autowired
	private FileContentBroadcaster broadcaster;

	@RequestMapping("/tenant/{tenant}/logfile/{logfile}")
	public String index(Model model, @PathVariable("tenant") String tenant, @PathVariable("logfile") String logfile) {
		String path = "";
		return this.mainPage(model, path, tenant, logfile);
	}

	@RequestMapping("/")
    public String indexOld(Model model, @RequestParam("path") String path,
			@RequestParam("tenant") String tenant, @RequestParam("logfile") String logfile) {
				return this.mainPage(model, path, tenant, logfile);
			}		


    private String mainPage(Model model, String path, String tenant, String logfile) {

		if (!MainController.isValidPath(path)) {
			logger.error("Path can be either empty or current");
			broadcaster.sendContent(new String[] {"path parameter " + path + " is invalid."}, logfile, tenant);

			return "index";
		}

    	// validate tenant string and logfile string before using it to access file
		//CharSequence seq = CharBuffer.wrap(ILLEGAL_CHARACTERS);
		if (!MainController.isValid(tenant) || !MainController.isValid(logfile)) {
			logger.error("tenant or logfile not valid: tenant [{}], logfile [{}]", tenant, logfile);
			broadcaster.sendContent(new String[] {"tenant parameter " + tenant + " contains invalid characters"}, logfile, tenant);

			return "index";
		}
		path = path.equals("current") ? "/" + path : path;
		
		// set filename to view
		model.addAttribute("file", maybeTruncate(logfile));
		model.addAttribute("filePath", path +"/logs/" + tenant);
		model.addAttribute("version", LogviewerApplication.VERSION);

		// run tail now
		if (logfile != null && tenant != null) {
			fts.tailFile(tenant, Paths.get(logFolder + path +"/logs/" + tenant + "/" + logfile).toAbsolutePath());
		}
		

		logger.debug("active threads: {}", Thread.activeCount());

		return "index";
    }

    private String maybeTruncate(String fileName) {
		if (fileName.length() <= MAX_FILENAME_LENGTH) {
			return fileName;
		} else {
			String extension = fileName.substring(fileName.lastIndexOf('.'));
			return fileName.substring(0, MAX_FILENAME_LENGTH) + "..."
				+ fileName.substring(fileName.length() - extension.length() - 1);
		}
    }

	public static boolean isValidPath(String path) {
		return path.isEmpty() || path.equals("current");
	}

    public static boolean isValid(String str) {
		for (char param : MainController.ILLEGAL_CHARACTERS) {
			if (str.indexOf(param) != -1) {
				return false;
			}
		}
		return true;
	}
}
