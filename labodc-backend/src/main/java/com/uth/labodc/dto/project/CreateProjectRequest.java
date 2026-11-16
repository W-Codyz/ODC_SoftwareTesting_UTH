package com.uth.labodc.dto.project;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateProjectRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String description;

    private List<String> objectives = new ArrayList<>();

    private String requirements;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @Min(value = 1, message = "Budget phải lớn hơn 0")
    private Double budget;

    @NotNull
    @Min(value = 1, message = "Số lượng talent phải ít nhất là 1")
    private Integer requiredTalents;

    private List<String> technologies = new ArrayList<>();

    private List<String> requiredSkills = new ArrayList<>();

    private Long mentorId;

    private Long enterpriseId;

    private Boolean allowApplications;
}
