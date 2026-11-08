# BÁO CÁO TỔNG HỢP KIỂM THỬ TUẦN 6
## DỰ ÁN: ODC SOFTWARE TESTING (LabODC)

> **Họ và tên sinh viên:** Nguyễn Minh Hiển  
> **Nhiệm vụ phân công:** 
> 1. `FR-TL-002: Nộp Báo cáo Nhóm (Submit Team Report)`
> 2. `FR-MEN-003: Đánh giá Talent (Evaluate Talents)`
> **Yêu cầu hoàn thành:**
> - [x] Black-box Test Cases Design (Áp dụng Phân hoạch tương đương EP + Phân tích giá trị biên BVA)
> - [x] Bảng chuyển đổi trạng thái (State Transition Table & Diagram - Chuẩn Slide Chương IV)
> - [x] Bảng quyết định (Decision Table - Đầy đủ & Rút gọn - Chuẩn Slide Chương IV)
> - [x] Test Execution Report (Kết quả kiểm thử Postman API / Localhost)

---

## MỤC LỤC TÀI LIỆU CHI TIẾT

```
test-cases/MinhHien/
├── BAO_CAO_TONG_HOP_TUAN_6.md                 <-- (File tổng hợp này)
├── FR-TL-002_Nop_Bao_Cao_Nhom/
│   ├── 01_Design_TestCases_FR-TL-002.md       (Thiết kế TC hộp đen, BVA, EP)
│   ├── design_testcase_FR-TL-002.csv          (File Excel/CSV nộp thi GK)
│   ├── 02_Bang_Chuyen_Doi_Trang_Thai_FR-TL-002.md (BCĐTT & Sơ đồ trạng thái)
│   ├── 03_Bang_Quyet_Dinh_FR-TL-002.md        (BQĐ đầy đủ + BQĐ rút gọn)
│   ├── 04_Test_Report_FR-TL-002.md            (Báo cáo thực thi kiểm thử)
│   └── report_run_testcase_FR-TL-002.csv      (File Excel/CSV kết quả thực thi)
└── FR-MEN-003_Danh_Gia_Talent/
    ├── 01_Design_TestCases_FR-MEN-003.md      (Thiết kế TC hộp đen, BVA, EP)
    ├── design_testcase_FR-MEN-003.csv         (File Excel/CSV nộp thi GK)
    ├── 02_Bang_Chuyen_Doi_Trang_Thai_FR-MEN-003.md (BCĐTT & Sơ đồ trạng thái)
    ├── 03_Bang_Quyet_Dinh_FR-MEN-003.md       (BQĐ đầy đủ + BQĐ rút gọn)
    ├── 04_Test_Report_FR-MEN-003.md           (Báo cáo thực thi kiểm thử)
    └── report_run_testcase_FR-MEN-003.csv     (File Excel/CSV kết quả thực thi)
```

---

## PHẦN 1: TÓM TẮT MODULE FR-TL-002: NỘP BÁO CÁO NHÓM

* **Tác nhân:** Trưởng nhóm sinh viên (`TALENT_LEADER`).
* **Endpoint chính:** `POST /api/talent-leader/projects/{projectId}/reports`
* **Số lượng Test Case:** 15 Test Cases (bao phủ đầy đủ biến tiến độ `overallProgress`, loại báo cáo `reportType`, kỳ báo cáo `reportingPeriod`, và ma trận phân quyền).
* **Bảng chuyển đổi trạng thái:** 10 ca chuyển trạng thái từ `Non-Existent` -> `DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` / `NEEDS_REVISION`, kèm các ca kiểm thử chuyển trạng thái không hợp lệ (Invalid transitions).
* **Bảng quyết định:** 5 Conditions, 6 Actions; rút gọn thành 6 Rules tối ưu theo giáo trình slide trang 46.
* **Tỷ lệ kiểm thử:** 15/15 PASS (100%).

---

## PHẦN 2: TÓM TẮT MODULE FR-MEN-003: ĐÁNH GIÁ TALENT

* **Tác nhân:** Người hướng dẫn (`ASSIGNED_MENTOR`).
* **Endpoint chính:** `POST /api/mentor/projects/{projectId}/evaluations`
* **Số lượng Test Case:** 16 Test Cases (bao phủ thang điểm `[0.0, 10.0]`, các tiêu chí con, kiểm tra sinh viên trong dự án, ràng buộc trùng kỳ đánh giá và phân quyền).
* **Bảng chuyển đổi trạng thái:** 8 ca chuyển trạng thái từ `NOT_EVALUATED` -> `DRAFT_EVALUATION` -> `COMPLETED` -> `MODIFIED` -> `LOCKED`, kèm các ca kiểm tra cố ý sửa khi đã khóa.
* **Bảng quyết định:** 4 Conditions, 5 Actions; rút gọn thành 5 Rules tối ưu.
* **Tỷ lệ kiểm thử:** 16/16 PASS (100%).

---

## KẾT LUẬN & ĐÁNH GIÁ
Toàn bộ các tài liệu kiểm thử đã tuân thủ 100% chuẩn quy định:
- Đầy đủ format bảng phân hoạch tương đương (Tag V, X) và phân tích giá trị biên (Tag B) theo Slide Chương IV trang 32.
- Đầy đủ format bảng test case và báo cáo thực thi dạng CSV / Markdown chuẩn quy cách kiểm thử phần mềm.
- Đầy đủ sơ đồ và bảng chuyển đổi trạng thái (Slide 36 - 40).
- Đầy đủ bảng quyết định phân tích logic nghiệp vụ (Slide 41 - 46).