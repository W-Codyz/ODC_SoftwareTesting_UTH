package com.uth.labodc.dto.talent;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.uth.labodc.model.entity.TalentSkill.SkillLevel;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TalentSkillDTO {
    private Long id;

    @JsonAlias({"name", "skillName"})
    @NotBlank(message = "Tên kỹ năng không được để trống")
    @Size(min = 1, max = 100, message = "Tên kỹ năng tối đa 100 ký tự")
    private String skillName;

    private String skillCategory;

    @JsonAlias({"level", "proficiencyLevel"})
    private SkillLevel proficiencyLevel;

    @DecimalMin(value = "0.0", message = "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0.0")
    @DecimalMax(value = "50.0", message = "Số năm kinh nghiệm tối đa là 50.0")
    private Double yearsOfExperience;
    
    // Helper getters for frontend
    public String getLevel() {
        return proficiencyLevel != null ? proficiencyLevel.name() : null;
    }

    public String getName() {
        return skillName;
    }
}