package com.uth.labodc.repository;

import com.uth.labodc.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdAndTaskIdIn(Long projectId, Collection<String> taskIds);
}
