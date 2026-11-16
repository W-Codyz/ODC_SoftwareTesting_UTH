package com.uth.labodc.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorInvitationPaginationDTO {
    private int currentPage;
    private int totalPages;
    private long totalInvitations;
}
