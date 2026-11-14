package com.uth.labodc.dto.talent;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TalentProfileDTO {
    private Long id;
    private String fullName;
    private String studentId;
    private String faculty;
    private String major;
    private Integer yearOfStudy;
    private String email;

    // 👉 Đặt annotation ngay trên biến phone:
    @Pattern(regexp = "^$|^0\\d{9}$", message = "Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0")
    private String phone;

    private String avatarUrl;
    private String cvUrl;

    // 👉 Đặt annotation ngay trên biến portfolioUrl:
    @Size(max = 500, message = "Portfolio URL không được vượt quá 500 ký tự")
    @Pattern(regexp = "^$|^https?://\\S+$", message = "Portfolio URL phải bắt đầu bằng http:// hoặc https:// và không chứa khoảng trắng")
    private String portfolioUrl;

    private String githubUrl;
    private String linkedinUrl;
    private String bio;
    private BigDecimal gpa;
    private LocalDate dateOfBirth;
    private LocalDate expectedGraduation;
    private Boolean availableForProjects;
    private String workAvailability;
    private Integer hoursPerWeek;
    private List<TalentSkillDTO> skills;
    private List<TalentCertificationDTO> certifications;
    private Integer projectsCompleted;
    private BigDecimal averageRating;
    private String status;
}