#!/usr/bin/env python3
"""Generate test cases for GET /api/mentor/projects from the backend source."""

from datetime import date
from pathlib import Path
import re
import sys


BACKEND = Path(__file__).resolve().parents[1]
JAVA = BACKEND / "src" / "main" / "java" / "com" / "uth" / "labodc"
OUTPUT = BACKEND / "Test_Cases_Mentor_Projects.md"


def read(relative_path: str) -> str:
    path = JAVA / relative_path
    if not path.is_file():
        raise RuntimeError(f"Không tìm thấy source cần đối chiếu: {path}")
    return path.read_text(encoding="utf-8")


def find(pattern: str, text: str, description: str):
    match = re.search(pattern, text, re.MULTILINE | re.DOTALL)
    if not match:
        raise RuntimeError(
            f"Source đã thay đổi: không xác nhận được {description}. "
            "Hãy rà lại test cases trước khi sinh lại tài liệu."
        )
    return match


def inspect_contract():
    controller = read("controller/MentorPortalController.java")
    service = read("service/MentorPortalService.java")
    dto = read("dto/mentor/MentorProjectOptionDTO.java")
    security = read("security/SecurityConfig.java")
    repository = read("repository/ProjectRepository.java")
    handler = read("exception/GlobalExceptionHandler.java")
    filter_source = read("security/JwtAuthenticationFilter.java")
    roles_source = read("model/enums/UserRole.java")
    project_controller = read("controller/ProjectController.java")
    project_data_service = read("service/ProjectDataService.java")
    auth_controller = read("controller/AuthController.java")

    base = find(
        r'@RequestMapping\("([^\"]+)"\)\s*@RequiredArgsConstructor[\s\S]*?'
        r'class\s+MentorPortalController', controller, "base route của MentorPortalController"
    ).group(1)
    endpoint = find(
        r'@GetMapping\("([^\"]+)"\)\s*'
        r'@PreAuthorize\("hasRole\(\'([^\']+)\'\)"\)\s*'
        r'public\s+ResponseEntity<ApiResponse<List<MentorProjectOptionDTO>>>\s+'
        r'projects\(Authentication authentication\)',
        controller, "GET mapping và role của endpoint projects",
    )
    method_path, role = endpoint.group(1), endpoint.group(2)
    service_method = find(
        r'public\s+List<MentorProjectOptionDTO>\s+getProjects\(User user\)\s*'
        r'\{([\s\S]*?)\n\s*\}', service, "service getProjects"
    ).group(1)
    find(r'requireMentor\(user\)', service_method, "kiểm tra hồ sơ Mentor")
    find(r'projectRepository\.findByMentorId\(mentor\.getId\(\)\)', service_method,
         "lọc project theo Mentor hiện tại")
    find(r'List<Project>\s+findByMentorId\(Long mentorId\)', repository,
         "repository findByMentorId")
    fields = re.findall(r'private\s+(\w+)\s+(\w+)\s*;', dto)
    expected_fields = [("Long", "id"), ("String", "title"), ("Integer", "progressPercentage")]
    if fields != expected_fields:
        raise RuntimeError(f"Các field DTO đã đổi: {fields!r}. Hãy rà test case trước khi sinh.")
    find(r'@EnableMethodSecurity', security, "bật method security")
    find(r'\.anyRequest\(\)\.authenticated\(\)', security,
         "yêu cầu xác thực cho request cần bảo vệ")
    find(r'handleResourceNotFound[\s\S]*?status\(HttpStatus\.NOT_FOUND\)', handler,
         "mapping ResourceNotFoundException thành 404")
    for role_name in ("SYSTEM_ADMIN", "LAB_ADMIN", "ENTERPRISE", "TALENT", "MENTOR"):
        find(rf'\b{role_name}\b', roles_source, f"role {role_name}")
    find(r'@RequestMapping\("/api/projects"\)[\s\S]*?@PostMapping[\s\S]*?createProject\(',
         project_controller, "API tạo project trong cùng backend")
    find(r'\.addValue\("mentorId",\s*request\.getMentorId\(\)\)', project_data_service,
         "cho phép tạo project gán mentorId")
    find(r'@RequestMapping\("/api/auth"\)[\s\S]*?@PostMapping\("/login"\)',
         auth_controller, "login của cùng backend")
    properties = (BACKEND / "src" / "main" / "resources" / "application.properties").read_text(encoding="utf-8")
    port = find(r'^server\.port\s*=\s*(\d+)\s*$', properties, "server.port").group(1)
    return {
        "route": f"{base.rstrip('/')}/{method_path.lstrip('/')}",
        "role": role,
        "fields": [name for _, name in fields],
        "has_order": bool(re.search(r'findByMentorIdOrderBy', repository)),
        "base_url": f"http://localhost:{port}",
        "login_route": "/api/auth/login",
        "create_project_route": "/api/projects",
        "jwt_parse_uncaught": bool(re.search(r'jwtService\.extractEmail\(jwt\)', filter_source))
        and not bool(re.search(r'catch\s*\([^)]*(?:Jwt|Runtime|Exception)', filter_source)),
    }


def render(contract):
    route, role, base_url = contract["route"], contract["role"], contract["base_url"]
    fields = contract["fields"]
    field_names = ", ".join(f"`{name}`" for name in fields)
    cases = [
        ("TC-MP-01", "Mentor có một project được gán", "MENTOR hợp lệ", "Mentor có Project A",
         "200; data chứa đúng A và đủ field", "V1, V2, V3"),
        ("TC-MP-02", "Mentor có nhiều project", "MENTOR hợp lệ", "Mentor có A và B",
         "200; data chứa A và B; không kiểm tra thứ tự", "V1, V2, V4"),
        ("TC-MP-03", "Mentor chưa có project", "MENTOR hợp lệ", "Không có project gán cho mentor",
         "200; `data=[]`", "V1, V2, V5"),
        ("TC-MP-04", "Cách ly dữ liệu giữa hai mentor", "MENTOR A hợp lệ", "A có A1; B có B1; gọi bằng token A",
         "200; có A1, không có B1", "V1, V2, V6"),
        ("TC-MP-05", "Kiểm tra các biên progressPercentage", "MENTOR hợp lệ",
         "Chuẩn bị các project có progressPercentage lần lượt 0, 1, 99, 100",
         "200; trả nguyên cả bốn giá trị và field " + field_names, "V1, V2, V7, B1, B2, B3, B4"),
        ("TC-MP-06", "Không gửi token", "Không có", "Không có Authorization",
         "401 Unauthorized", "X1"),
        ("TC-MP-07", "Bearer rỗng", "Bearer không có token", "`Authorization: Bearer`",
         "401 Unauthorized", "X2"),
        ("TC-MP-08", "Thiếu scheme Bearer", "Token hợp lệ nhưng header sai format", "Gửi JWT trực tiếp trong Authorization",
         "401 Unauthorized", "X3"),
        ("TC-MP-09", "JWT sai định dạng", "Token lỗi", "Bearer chuỗi không phải JWT",
         "Kỳ vọng 401; xác nhận thực tế vì JWT filter có thể không bắt lỗi parse", "X4"),
        ("TC-MP-10", "JWT hết hạn", "Token hết hạn", "Bearer JWT đã hết hạn",
         "Kỳ vọng 401; xác nhận thực tế vì JWT filter có thể không bắt lỗi parse", "X5"),
        ("TC-MP-11", "JWT sai chữ ký", "Token chữ ký không hợp lệ", "Bearer JWT ký bằng secret khác",
         "Kỳ vọng 401; xác nhận thực tế vì JWT filter có thể không bắt lỗi parse", "X6"),
        ("TC-MP-12", "Role TALENT", "TALENT hợp lệ", "Token TALENT còn hạn",
         "403 Forbidden", "X7"),
        ("TC-MP-13", "Role ENTERPRISE", "ENTERPRISE hợp lệ", "Token ENTERPRISE còn hạn",
         "403 Forbidden", "X8"),
        ("TC-MP-14", "Role LAB_ADMIN", "LAB_ADMIN hợp lệ", "Token LAB_ADMIN còn hạn",
         "403 Forbidden", "X9"),
        ("TC-MP-15", "Role SYSTEM_ADMIN", "SYSTEM_ADMIN hợp lệ", "Token SYSTEM_ADMIN còn hạn",
         "403 Forbidden", "X10"),
        ("TC-MP-16", "User role MENTOR không có hồ sơ Mentor", "MENTOR hợp lệ", "User không có bản ghi Mentor liên kết",
         "404 Not Found theo exception handler hiện tại", "X11"),
    ]
    positives = sum(case[0] <= "TC-MP-05" for case in cases)
    if len(cases) != 16 or positives != 5:
        raise RuntimeError("Bộ test phải có đúng 16 case, gồm 5 positive và 11 negative.")

    lines = [
        "# Test Cases - Mentor Projects", "",
        "**Người thực hiện:** [Tên của bạn]  ",
        "**Module:** Mentor Portal  ",
        f"**Chức năng:** Danh sách project của Mentor (`GET {route}`)  ",
        f"**Ngày tạo:** {date.today().strftime('%d/%m/%Y')}", "", "---", "",
        "## 1. Căn cứ và phạm vi", "",
        f"- Endpoint được xác nhận từ controller: `GET {route}`, yêu cầu role `{role}`.",
        "- API không nhận query parameter hoặc request body; các phân hoạch đầu vào chính là xác thực, role và trạng thái hồ sơ/dữ liệu liên quan.",
        f"- Service tìm project theo Mentor đang đăng nhập; response item có các field {field_names}.",
        "- Bộ kiểm thử gồm 5 ca positive và 11 ca negative. Đây là test design; script không tự gọi API và không tạo fixture.", "",
        "## 2. Phân hoạch tương đương và điều kiện biên", "",
        "### 2.1 Phân hoạch tương đương (EP)", "",
        "| Điều kiện | Lớp | Tag | Giá trị đại diện |",
        "|---|---|---|---|",
        "| Token hợp lệ, role MENTOR, có hồ sơ | Valid | V1 | Bearer MENTOR có liên kết Mentor |",
        "| Dữ liệu project thuộc mentor hiện tại | Valid | V2 | mentorId khớp Mentor của token |",
        "| Có một project được gán | Valid | V3 | Một project |",
        "| Có nhiều project được gán | Valid | V4 | Hai project trở lên |",
        "| Không có project được gán | Valid | V5 | Danh sách rỗng |",
        "| Project thuộc Mentor khác | Valid / isolation | V6 | mentorId khác |",
        "| `progressPercentage` nằm trong miền nghiệp vụ giả định | Valid | V7 | Các giá trị trong [0,100] |",
        "| Thiếu token / Bearer rỗng / sai header / JWT sai / hết hạn / sai chữ ký | Invalid | X1-X6 | Thiếu hoặc không xác minh được credential |",
        "| Token có role khác MENTOR | Invalid | X7-X10 | TALENT, ENTERPRISE, LAB_ADMIN, SYSTEM_ADMIN |",
        "| Role MENTOR nhưng không có hồ sơ Mentor | Invalid state | X11 | Không tìm thấy hồ sơ theo user |", "",
        "### 2.2 Giá trị biên chuẩn (BVA)", "",
        "| Điều kiện | Loại | Tag | Giá trị đại diện |",
        "|---|---|---|---|",
        "| Biên dưới giả định | Boundary | B1 | progressPercentage = 0 |",
        "| Ngay trên biên dưới | Boundary | B2 | progressPercentage = 1 |",
        "| Ngay dưới biên trên | Boundary | B3 | progressPercentage = 99 |",
        "| Biên trên giả định | Boundary | B4 | progressPercentage = 100 |", "",
        "> Lưu ý: GET này không nhận `progressPercentage` làm đầu vào và source hiện chỉ trả giá trị đã lưu, không kiểm tra miền 0–100. B1–B4 là kiểm tra dữ liệu fixture/response theo giả định nghiệp vụ, không phải BVA đầu vào chuẩn; cần SRS xác nhận giới hạn này.", "",
        "## 3. Test cases", "",
        "| TC ID | Mô tả | Token | Tham số / Dữ liệu | Expected Result | Tags |",
        "|---|---|---|---|---|---|",
    ]
    lines.extend("| " + " | ".join(case) + " |" for case in cases)
    lines += [
        "", "## 4. Bảng kiểm tra độ phủ", "",
        "| Nhóm/điều kiện | Các TC | Độ phủ |",
        "|---|---|---|",
        "| Valid Mentor, hồ sơ và truy vấn project (V1-V5) | TC-MP-01–03 | Đã thiết kế |",
        "| Cách ly project giữa mentor (V6) | TC-MP-04 | Đã thiết kế |",
        "| Field response và progress boundary (V7, B1-B4) | TC-MP-05 | Đã thiết kế; cần fixture và xác nhận miền 0–100 |",
        "| Credential invalid (X1-X6) | TC-MP-06–11 | Đã thiết kế; status JWT lỗi cần chạy xác nhận |",
        "| Sai role (X7-X10) | TC-MP-12–15 | Đã thiết kế |",
        "| Mentor thiếu hồ sơ (X11) | TC-MP-16 | Đã thiết kế |",
        "| Tổng số | TC-MP-01–16 | 16 (5 positive, 11 negative) |", "",
        "## 5. Chuẩn bị và chạy bằng Postman", "",
        f"1. Chạy `labodc-backend`; base URL lấy từ cấu hình hiện tại là `{base_url}`.",
        f"2. Đăng nhập qua `POST {base_url}{contract['login_route']}` trong backend này và lấy token MENTOR có hồ sơ. Không giả định token từ auth-service khác tương thích.",
        f"3. Chuẩn bị projects trong cùng database và gán `mentorId` bằng ID hồ sơ Mentor. Tạo project qua `POST {base_url}{contract['create_project_route']}` nếu cần; dùng đúng payload bắt buộc của endpoint.",
        f"4. Gọi `GET {base_url}{route}` với Bearer token; không gửi body hoặc query params.",
        "5. Tạo thêm fixture riêng cho mentor khác, mentor chưa có project, các role âm tính và các mốc progress. Lưu status/body thực tế rồi đánh dấu pass/fail; không đánh dấu pass chỉ dựa trên expected result.",
        "6. Project tạo ở microservice khác/cổng 8084 có thể nằm ở database khác, không tự xuất hiện trong `labodc-backend`.", "",
        "## 6. Ghi chú rủi ro khi thực thi", "",
        "- Script chỉ kiểm tra một số cấu trúc source và sinh tài liệu; không gọi API, đăng nhập hay tạo dữ liệu.",
        "- Source không khai báo thứ tự trả về; không kiểm tra thứ tự danh sách.",
        "- JWT filter hiện gọi hàm parse token; nếu không bắt lỗi parse thì token hỏng/hết hạn/sai chữ ký có thể không trả 401. Ghi nhận status thực tế cho TC-MP-09–11.",
        "- Thiếu hồ sơ Mentor được ánh xạ thành 404 theo exception handler hiện tại.", "",
        "### Lệnh tạo lại file", "",
        "```powershell", "python scripts\\generate_mentor_projects_test_cases.py", "```", "",
    ]
    return "\n".join(lines)


def main() -> int:
    try:
        contract = inspect_contract()
        with OUTPUT.open("w", encoding="utf-8", newline="\n") as output:
            output.write(render(contract))
    except (OSError, RuntimeError) as exc:
        print(f"Không thể sinh test plan: {exc}", file=sys.stderr)
        return 1
    print(f"Generated: {OUTPUT}")
    print(f"Endpoint: GET {contract['route']} | Role: {contract['role']}")
    print("Test cases: 16 (5 positive, 11 negative)")
    print(f"DTO fields: {', '.join(contract['fields'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
