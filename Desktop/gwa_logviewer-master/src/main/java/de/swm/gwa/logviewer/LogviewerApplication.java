package de.swm.gwa.logviewer;

import java.util.concurrent.Executor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@SpringBootApplication
@EnableAsync
public class LogviewerApplication {
    public static final String VERSION = "1.0";

    public static void main(String[] args) {

		SpringApplication.run(LogviewerApplication.class, args);

    }

    @Bean("threadPoolTaskExecutor")
    public Executor asyncExecutor() {
	ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
	executor.setCorePoolSize(10);
	executor.setMaxPoolSize(10);
	executor.setQueueCapacity(20);
	executor.setThreadNamePrefix("logviewertail-");
	executor.initialize();
	return executor;
    }

}
