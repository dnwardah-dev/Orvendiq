package com.orvendiq.backend.system;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of(
            "application", "Orvendiq",
            "service", "Financial Intelligence Backend",
            "version", "1.0.0",
            "status", "OPERATIONAL",
            "timestamp", Instant.now().toString()
        );
    }
}
