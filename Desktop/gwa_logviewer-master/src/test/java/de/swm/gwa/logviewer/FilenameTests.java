package de.swm.gwa.logviewer;

import de.swm.gwa.logviewer.controller.MainController;
import org.junit.jupiter.api.Test;
import org.springframework.util.Assert;


class FilenameTests {

    @Test
    void testCheckRegex() {
        Assert.isTrue(MainController.isValid("bla"), "should be valid but was not");
        Assert.isTrue(!MainController.isValid("/"), "/ not allowed and not found");
        Assert.isTrue(!MainController.isValid("../folder/log.log"), "../folder/log.log not allowed and not found");
        Assert.isTrue(!MainController.isValid("./../bla"), "./../bla not allowed and not found");
    }

    @Test
    void testValidPath() {
        Assert.isTrue(MainController.isValidPath(""), "path can be empty");
        Assert.isTrue(MainController.isValidPath("current"), "path can be current");
        Assert.isTrue(!MainController.isValidPath("/test"), "only empty or current is allowed.");
    }
}
