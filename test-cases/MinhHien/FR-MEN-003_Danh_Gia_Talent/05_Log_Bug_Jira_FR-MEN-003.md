# BÁO CÁO BUG PHÁT HIỆN TỪ KIỂM THỬ THỰC TẾ
## MODULE: FR-MEN-003 — ĐÁNH GIÁ TALENT (EVALUATE TALENTS)

> **Người phát hiện:** Nguyễn Minh Hiển  
> **Thời gian:** 07/11/2026  
> **Công cụ:** Kiểm thử Black-box BVA & Code Review `MentorPortalService.java`  

---

### 🐞 NỘI DUNG LOG BUG LÊN JIRA (SẴN SÀNG COPY & PASTE)

#### BUG JIRA 2: Hệ thống không validate điểm số hợp lệ [0..10], tự ý làm tròn sai quy tắc nghiệp vụ
* **Issue Type:** `Bug`
* **Summary:** `[backend] normalizeScore in MentorPortalService suppresses invalid score instead of throwing 400 Bad Request`
* **Component:** `Backend / Mentor Portal`
* **Severity / Priority:** `Medium`
* **File liên quan:** `labodc-backend/src/main/java/com/uth/labodc/service/MentorPortalService.java` (dòng 520 - 523)

* **Steps to Reproduce:**
1. Đăng nhập với tài khoản MENTOR đang phụ trách dự án ID: 1.
2. Gửi request `POST /api/mentor/projects/1/evaluations` với dữ liệu điểm không hợp lệ (ngoài biên BVA):
   ```json
   {
     "talentId": 456,
     "evaluationPeriod": "2026-02",
     "overallScore": -5.0,
     "technicalSkills": {
       "score": 15.0,
       "comment": "Test điểm vượt quá thang 10"
     }
   }
   ```
3. Quan sát phản hồi của server và dữ liệu lưu trong database.

* **Expected Result (theo đặc tả SRS FR-MEN-003):**
Server phải phát hiện điểm số không hợp lệ (nhỏ hơn 0.0 hoặc lớn hơn 10.0) và trả về lỗi **`HTTP 400 Bad Request`** thông báo *"overallScore và các điểm tiêu chí phải nằm trong khoảng từ 0.0 đến 10.0"*.

* **Actual Result:**
Server vẫn trả về **`HTTP 200 OK`**. Điểm `-5.0` bị âm thầm ép thành `0.0` qua hàm:
```java
Double normalizeScore(Double score) {
    if (score == null) return null;
    return Math.max(0.0, Math.min(10.0, score)); // Tự ý sửa data của người dùng
}
```
Đồng thời, điểm tiêu chí `technicalSkills.score = 15.0` bị lưu nguyên vào database dưới dạng JSONB mà không có bất kỳ bước kiểm tra hợp lệ nào.

* **Đề xuất khắc phục (Expected Fix):**
Thay vì âm thầm ép giá trị trong `normalizeScore`, cần ném ra `IllegalArgumentException`:
```java
if (score != null && (score < 0.0 || score > 10.0)) {
    throw new IllegalArgumentException("overallScore must be between 0.0 and 10.0");
}
```
