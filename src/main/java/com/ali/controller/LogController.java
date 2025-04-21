package com.ali.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/logs")
public class LogController {
    @GetMapping("/article")
    public ResponseEntity<List<String>> getArticleLogs() throws IOException {
        // Adjust this path to your actual log file location
        Path logPath = Paths.get("logs/app.log");
        List<String> allLines = Files.readAllLines(logPath);
        List<String> articleLogs = allLines.stream()
            .filter(line -> line.contains("ArticleServiceImpl") || line.toLowerCase().contains("article"))
            .collect(Collectors.toList());
        int N = 50;
        int fromIndex = Math.max(0, articleLogs.size() - N);
        return ResponseEntity.ok(articleLogs.subList(fromIndex, articleLogs.size()));
    }
} 