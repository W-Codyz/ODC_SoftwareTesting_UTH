package com.uth.labodc.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorInvitationListDTO {
    private List<MentorInvitationDTO> invitations;
    private MentorInvitationPaginationDTO pagination;
}
