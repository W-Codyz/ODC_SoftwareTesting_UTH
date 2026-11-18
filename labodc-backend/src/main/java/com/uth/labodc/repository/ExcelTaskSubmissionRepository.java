package com.uth.labodc.repository;

import com.uth.labodc.model.entity.ExcelTaskSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExcelTaskSubmissionRepository extends JpaRepository<ExcelTaskSubmission, Long> {
    List<ExcelTaskSubmission> findByTaskIdOrderBySubmittedAtDesc(Long taskId);
}
