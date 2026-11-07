# BÁO CÁO THỰC THI KIỂM THỬ THỰC TẾ & LOG BUG
## MODULE: FR-TL-002 — NỘP BÁO CÁO NHÓM (SUBMIT TEAM REPORT)

> **Người thực hiện:** Nguyễn Minh Hiển  
> **Thời gian:** 07/11/2026  
> **Môi trường:** Postman API Testing (`http://localhost:8080`)  
> **Tham chiếu chỉ đạo nhóm:** *"phần nhỏ trong module chưa code thì làm bth nhé ae, log bug lên là dc"*  

---

### I. KẾT QUẢ THỰC THI TRÊN POSTMAN THỰC TẾ

Khi chạy thử nghiệm các request thuộc `FR-TL-002` theo thiết kế SRS lên Backend thực tế:
* **Endpoint gọi:** `POST http://localhost:8080/api/talent-leader/projects/1/reports`
* **Kết quả thực tế (Actual Result):** Trả về mã lỗi **`404 Not Found`** hoặc `403 Forbidden` do Backend chưa cài đặt Router / Controller xử lý cho tiền tố `/api/talent-leader/**`.

| STT | TestCaseID | Tên Test Case | Endpoint & Method | Kết Quả Mong Đợi (SRS) | Kết Quả Thực Tế (Postman) | Trạng Thái | Đánh Giá & Hành Động |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | **TC-TL002-01** | Báo cáo tiến độ 50% (Nominal) | `POST /api/talent-leader/projects/1/reports` | 201 Created | 404 Not Found | **FAIL (BUG)** | Chưa code Controller -> **Log Bug lên Jira** |
| 2 | **TC-TL002-02** | Xem danh sách báo cáo nhóm | `GET /api/talent-leader/projects/1/reports` | 200 OK | 404 Not Found | **FAIL (BUG)** | Chưa code Controller -> **Log Bug lên Jira** |
| 3 | **TC-TL002-03** | overallProgress âm (-1) | `POST /api/talent-leader/projects/1/reports` | 400 Bad Request | 404 Not Found | **FAIL (BUG)** | Chưa có validator -> Đi theo Bug thiếu API |

---

### II. NỘI DUNG LOG BUG LÊN JIRA (SẴN SÀNG COPY & PASTE)

#### 🐞 BUG JIRA 1: Thiếu Endpoint API nộp báo cáo nhóm cho Talent Leader
* **Issue Type:** `Bug`
* **Summary:** `[backend] Endpoint POST /api/talent-leader/projects/{projectId}/reports returns 404 Not Found - Feature not implemented`
* **Component:** `Backend / Talent Leader Portal`
* **Severity / Priority:** `High`
* **Description:**
```markdown
### Tool:
Postman API Testing

### Endpoint:
POST /api/talent-leader/projects/{projectId}/reports
GET /api/talent-leader/projects/{projectId}/reports

### Steps to Reproduce:
1. Đăng nhập với tài khoản TALENT (giữ vai trò Team Leader của dự án).
2. Lấy Bearer Token và gửi request POST đến:
   {{base_url}}/api/talent-leader/projects/1/reports
   Body:
   {
     "reportType": "MONTHLY",
     "reportingPeriod": "2026-02",
     "overallProgress": 50,
     "tasksCompleted": []
   }
3. Quan sát mã phản hồi HTTP từ server.

### Expected Result (theo đặc tả SRS FR-TL-002):
Server tiếp nhận và lưu báo cáo tiến độ, trả về mã HTTP 201 Created kèm dữ liệu báo cáo vừa tạo.

### Actual Result:
Server trả về mã HTTP 404 Not Found:
{
  "timestamp": "2026-11-07T15:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/api/talent-leader/projects/1/reports"
}

### Nguyên nhân:
Trong mã nguồn backend chưa tạo Controller và Service xử lý tiền tố '/api/talent-leader/**' theo đặc tả SRS FR-TL-002.
```
