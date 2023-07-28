Logviewer, modified TailStreamer
============

This version is based on TailStreamer and was modified to fit SWM's needs.

For more details see attached asciidoc at [documentation.adoc](src/docs/asciidoc/documentation.adoc).
TailStreamer is a browser-based log viewer. It's `tail -f` for the web. Built on top of the [Spring Framework](https://github.com/spring-projects/spring-framework), it uses [SockJS](https://github.com/sockjs/sockjs-client) to stream log updates in real-time to your browser.

# Requirements
To run TailStreamer, you need:
* a Java Runtime Environment - Java 8 or later.

To build TailStreamer, you need:
* a Java Development Kit - Java 8 or later.
* Node.js.

# Building
1. Download and install Node.js
2. Go to your TailStreamer directory
3. Run `npm install` to download the necessary JavaScript components
4. Start the build by running `./mvn package`.

# Usage
By default, TailStreamer runs on port 8080:

    java -jar logviewer.jar
    
# Configuration
TailStreamer is configured using YAML. Upon startup, it will look for a file called `tailstreamer.yml` and read
configuration properties from there.

For a full reference of available configuration options, see the wiki page at https://github.com/joeattardi/tailstreamer/wiki/YAML-Configuration-Reference.

# Security
By default, TailStreamer is accessible by anyone. You can restrict access by requiring a username and password. 
Authentication is configured in `application.yml`. For security purposes, user passwords are stored hashed. 


# Screenshots UI
![Screenshot](https://raw.github.com/joeattardi/tailstreamer/gh-pages/screenshot.png)
![Screenshot](https://raw.github.com/joeattardi/tailstreamer/gh-pages/screenshot_search.png)
fsdf
