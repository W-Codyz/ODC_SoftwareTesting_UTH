# Báo cáo Run Test Case: FR-TL-001 - Quản lý Phân phối Quỹ

**Module:** Talent Leader Dashboard
**Chức năng:** Tạo phân phối quỹ team
**Người thực hiện:** Đặng Thành Đình Phát
**Ngày thực hiện:** 05/11/2026
**Tài liệu test case:** `TC_TL_FundDistribution.md`

---

## 1. Tổng quan kết quả

| Trạng thái | Số lượng | Tỷ lệ |
|---|---:|---:|
| PASS | 0 | 0% |
| FAIL | 28 | 100% |
| BLOCKED | 0 | 100% |
| **Tổng** | **28** | **100%** |

**Lý do FAIL:** Toàn bộ 28 test case bị fail vì endpoint `POST /api/talent-leader/projects/{projectId}/fund-distribution` chưa được implement trong hệ thống hiện tại. Chức năng FR-TL-001 (Talent Leader phân phối quỹ) chưa tồn tại - chỉ có endpoint Lab Admin với logic khác biệt so với SRS.

---

## 2. Chi tiết kết quả từng test case

| STT | TC ID | Tên test case | Kết quả | Ghi chú |
|---:|---|---|---|---|
| 1 | TC-FUND-01 | Tạo distribution thành công - happy path | FAIL | Endpoint chưa tồn tại |
| 2 | TC-FUND-02 | Tạo distribution - biên dưới percentage (5%) | FAIL | Endpoint chưa tồn tại |
| 3 | TC-FUND-03 | Không gửi token (single fault) | FAIL | Endpoint chưa tồn tại |
| 4 | TC-FUND-04 | Token hết hạn / sai format (single fault) | FAIL | Endpoint chưa tồn tại |
| 5 | TC-FUND-05 | Role MENTOR - sai quyền (single fault) | FAIL | Endpoint chưa tồn tại |
| 6 | TC-FUND-06 | Talent thường - không phải leader (single fault) | FAIL | Endpoint chưa tồn tại |
| 7 | TC-FUND-07 | Project không tồn tại (single fault) | FAIL | Endpoint chưa tồn tại |
| 8 | TC-FUND-08 | Project ID không phải số (single fault) | FAIL | Endpoint chưa tồn tại |
| 9 | TC-FUND-09 | Project ID = 0 - edge case | FAIL | Endpoint chưa tồn tại |
| 10 | TC-FUND-10 | Project ID âm - edge case | FAIL | Endpoint chưa tồn tại |
| 11 | TC-FUND-11 | Distributions rỗng (single fault) | FAIL | Endpoint chưa tồn tại |
| 12 | TC-FUND-12 | Distributions null (single fault) | FAIL | Endpoint chưa tồn tại |
| 13 | TC-FUND-13 | Thiếu thành viên (single fault) | FAIL | Endpoint chưa tồn tại |
| 14 | TC-FUND-14 | Trùng talentId (single fault) | FAIL | Endpoint chưa tồn tại |
| 15 | TC-FUND-15 | TalentId không tồn tại (single fault) | FAIL | Endpoint chưa tồn tại |
| 16 | TC-FUND-16 | TalentId thuộc project khác (single fault) | FAIL | Endpoint chưa tồn tại |
| 17 | TC-FUND-17 | Tổng percentage < 100% (single fault) | FAIL | Endpoint chưa tồn tại |
| 18 | TC-FUND-18 | Tổng percentage > 100% (single fault) | FAIL | Endpoint chưa tồn tại |
| 19 | TC-FUND-19 | Percentage dưới min 5% (single fault) | FAIL | Endpoint chưa tồn tại |
| 20 | TC-FUND-20 | Percentage = 0 (single fault) | FAIL | Endpoint chưa tồn tại |
| 21 | TC-FUND-21 | Percentage âm (single fault) | FAIL | Endpoint chưa tồn tại |
| 22 | TC-FUND-22 | Tổng = 99% - biên dưới (single fault) | FAIL | Endpoint chưa tồn tại |
| 23 | TC-FUND-23 | Tổng = 101% - biên trên (single fault) | FAIL | Endpoint chưa tồn tại |
| 24 | TC-FUND-24 | Percentage = 6% - ngay trên min (biên) | FAIL | Endpoint chưa tồn tại |
| 25 | TC-FUND-25 | Reason rỗng (single fault) | FAIL | Endpoint chưa tồn tại |
| 26 | TC-FUND-26 | Tạo khi đã có PENDING (state transition) | FAIL | Endpoint chưa tồn tại |
| 27 | TC-FUND-27 | Tạo khi đã có APPROVED (state transition) | FAIL | Endpoint chưa tồn tại |
| 28 | TC-FUND-28 | Resubmit sau khi REJECTED (state transition) | FAIL | Endpoint chưa tồn tại |

---

## 3. Phân tích nguyên nhân

### 3.1 Gap giữa SRS và Implementation

Qua phân tích source code, phát hiện 8 điểm khác biệt chính giữa SRS và code hiện tại (chi tiết tại mục 8 của file test case):

1. Endpoint Talent Leader (`/api/talent-leader/...`) chưa tồn tại, chỉ có endpoint Lab Admin (`/api/lab-admin/...`)
2. Role truy cập sai - code chỉ cho phép Lab Admin và System Admin, không có Talent Leader
3. Request body dùng `amount` (số tiền) thay vì `percentage` (phần trăm)
4. Status flow bị bỏ qua - code set thẳng DISBURSED, không qua Mentor approval
5. Thiếu validation tổng percentage = 100%
6. Thiếu validation bao gồm tất cả thành viên
7. Thiếu reason per member - code dùng chung note
8. Thiếu validation ở application layer cho percentage (chỉ có DB constraint)

### 3.2 Quyết định

Giữ nguyên test case theo SRS. Môn học tập trung vào kiểm thử phần mềm, không phải phát triển phần mềm. Việc implement module FR-TL-001 đầy đủ bao gồm endpoint mới, role mới, validation logic và approval flow - vượt quá khuôn khổ thời gian của môn học.

Kết quả FAIL 28/28 là hợp lệ trong kiểm thử: thể hiện gap giữa yêu cầu (SRS) và hiện trạng code thực tế. Cần cập nhật SRS để ghi nhận các điểm khác biệt.

---

## 4. Đề xuất

- Cập nhật SRS: Thêm ghi chú vào FR-TL-001 về trạng thái implementation hiện tại (xem task LABODC-85 trên Jira)
- Nếu có thời gian trong tương lai: implement endpoint Talent Leader theo SRS để chạy lại 28 test case
- Tham chiếu chéo: Huỳnh Cao Đức (FR-LAB-003: Fund Allocation 70/20/10) test endpoint Lab Admin hiện có