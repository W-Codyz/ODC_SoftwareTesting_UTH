package com.uth.labodc.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DatabaseSequenceInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        log.info("==> [Fix Bug FR_TAL_001] Synchronizing database sequences...");
        String[] tables = {
            "talent_skills", 
            "talent_certifications", 
            "users", 
            "talents", 
            "projects",
            "mentor_reports"
        };
        
        for (String table : tables) {
            try {
                String sql = String.format(
                    "SELECT setval('%s_id_seq', COALESCE((SELECT MAX(id) FROM %s), 0) + 1, false)", 
                    table, table
                );
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                log.warn("Could not sync sequence for table {}: {}", table, e.getMessage());
            }
        }
        log.info("==> [Fix Bug FR_TAL_001] Database sequences synchronized successfully!");
    }
}