package com.uth.labodc.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundDistributionApprovalRequest {
    private String action; // APPROVE or REJECT
    private String reason;
}
