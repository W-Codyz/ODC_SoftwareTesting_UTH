#!/usr/bin/env python3
"""Generate a source-checked test plan for GET /api/mentor/invitations."""

from datetime import date
from pathlib import Path
import re
import sys


BACKEND = Path(__file__).resolve().parents[1]
JAVA = BACKEND / "src" / "main" / "java" / "com" / "uth" / "labodc"
OUTPUT = BACKEND / "Test_Cases_Mentor_Invitations.md"


def read(relative_path: str) -> str:
    path = JAVA / relative_path
    if not path.is_file():
        raise RuntimeError(f"Không tìm thấy source cần đối chiếu: {path}")
    return path.read_text(encoding="utf-8")


def require(pattern: str, source: str, description: str):
    if not re.search(pattern, source, re.MULTILINE | re.DOTALL):
        raise RuntimeError(f"Source đã thay đổi: không xác nhận được {description}; hãy rà test cases.")


def inspect_contract():
    controller = read("controller/MentorPortalController.java")
    service = read("service/MentorPortalService.java")
    repository = read("repository/MentorInvitationRepository.java")
    dto = read("dto/mentor/MentorInvitationDTO.java")
    security = read("security/SecurityConfig.java")
    handler = read("exception/GlobalExceptionHandler.java")
    roles = read("model/enums/UserRole.java")

    require(r'@RequestMapping\("/api/mentor"\)', controller, "base route")
    require(r'@GetMapping\("/invitations"\)\s*@PreAuthorize\("hasRole\(\'MENTOR\'\)"\)',
            controller, "GET route và role MENTOR")
    method = re.search(r'public\s+List<MentorInvitationDTO>\s+getInvitations\(User user\)\s*\{([\s\S]*?)\n\s*\}', service)
    if not method:
        raise RuntimeError("Không tìm thấy MentorPortalService.getInvitations(User).")
    body = method.group(1)
    require(r'requireMentor\(user\)', body, "xác minh hồ sơ Mentor")
    require(r'findPendingByMentorIdOrderByReceivedDateDesc\(mentor\.getId\(\)\)', body,
            "lọc invitation PENDING theo mentor và sắp xếp ngày nhận giảm dần")
    require(r"lower\(cast\(mi\.status as text\)\) = 'pending'.*order by mi\.received_date desc",
            repository, "điều kiện query PENDING và thứ tự ngày")
    names = re.findall(r'private\s+\w+(?:<[^;]+>)?\s+(\w+)\s*;', dto)
    expected = ["id", "projectName", "groupName", "studentCount", "description", "deadline",
                "skills", "receivedDate", "priority"]
    if names != expected:
        raise RuntimeError(f"Field DTO đã thay đổi: {names!r}; hãy cập nhật test plan.")
    require(r'@EnableMethodSecurity', security, "method security")
    require(r'\.anyRequest\(\)\.authenticated\(\)', security, "xác thực request")
    require(r'handleResourceNotFound[\s\S]*?status\(HttpStatus\.NOT_FOUND\)', handler,
            "mapping hồ sơ không tồn tại thành 404")
    for role in ("SYSTEM_ADMIN", "LAB_ADMIN", "ENTERPRISE", "TALENT", "MENTOR"):
        require(rf'\b{role}\b', roles, f"role {role}")
    props = (BACKEND / "src/main/resources/application.properties").read_text(encoding="utf-8")
    port_match = re.search(r'^server\.port\s*=\s*(\d+)\s*$', props, re.MULTILINE)
    if not port_match:
        raise RuntimeError("Không xác định được server.port trong application.properties.")
    return {"route": "/api/mentor/invitations", "role": "MENTOR", "fields": names,
            "base_url": f"http://localhost:{port_match.group(1)}"}


def load_execution_results():
    """Keep manually recorded runtime outcomes when regenerating the test plan."""
    results = {}
    if not OUTPUT.is_file():
        return results
    for line in OUTPUT.read_text(encoding="utf-8").splitlines():
        match = re.match(r"\|\s*\d+\s*\|\s*\*\*(TC-MI-\d+)\*\*\s*\|", line)
        if not match:
            continue
        columns = [column.strip() for column in line.strip().strip("|").split("|")]
        if len(columns) == 8 and "chưa có response" in columns[5].lower():
            # Never carry a manually mislabeled placeholder forward as a test failure.
            continue
        if len(columns) == 8 and columns[6] in ("**PASS**", "**FAIL**"):
            results[match.group(1)] = (columns[5], columns[6], columns[7])
    return results


def render(contract, execution_results=None):
    execution_results = execution_results or {}
    route, base_url = contract["route"], contract["base_url"]
    fields = ", ".join(f"`{name}`" for name in contract["fields"])
    cases = [
        ("TC-MI-01", "Mentor có một lời mời đang chờ", "MENTOR hợp lệ", "Một invitation status=PENDING của mentor",
         "200; data có đúng lời mời", "V1, V2"),
        ("TC-MI-02", "Mentor có nhiều lời mời đang chờ", "MENTOR hợp lệ", "Nhiều invitation PENDING",
         "200; trả đủ lời mời theo `receivedDate` giảm dần", "V1, V3"),
        ("TC-MI-03", "Mentor không có lời mời đang chờ", "MENTOR hợp lệ", "Không có invitation PENDING",
         "200; `data=[]`", "V1, V4"),
        ("TC-MI-04", "Chỉ lấy lời mời của mentor đang đăng nhập", "MENTOR A hợp lệ",
         "PENDING của A và B; gọi bằng token A", "200; chỉ có invitation thuộc A", "V1, V5"),
        ("TC-MI-05", "Kiểm tra mapping và chuẩn hóa field", "MENTOR hợp lệ",
         "PENDING có project hợp lệ; description/deadline null, skills rỗng, priority không hỗ trợ",
         "200; item có " + fields + "; projectName khớp project liên kết, description rỗng, deadline fallback từ expiresAt, skills=[], priority chuẩn hóa thành `medium`",
         "V1, V6"),
        ("TC-MI-06", "Không gửi token", "Không có", "Không có Authorization", "401 Unauthorized", "X1"),
        ("TC-MI-07", "Bearer rỗng", "Token rỗng", "`Authorization: Bearer`", "401 Unauthorized", "X2"),
        ("TC-MI-08", "Thiếu scheme Bearer", "Header sai format", "Gửi JWT trực tiếp trong Authorization",
         "401 Unauthorized", "X3"),
        ("TC-MI-09", "JWT sai định dạng", "Token lỗi", "Bearer chuỗi không phải JWT",
         "Kỳ vọng 401; cần ghi nhận status thực tế", "X4"),
        ("TC-MI-10", "JWT hết hạn", "Token hết hạn", "Bearer JWT đã hết hạn",
         "Kỳ vọng 401; cần ghi nhận status thực tế", "X5"),
        ("TC-MI-11", "JWT sai chữ ký", "Token sai chữ ký", "JWT ký bằng secret khác",
         "Kỳ vọng 401; cần ghi nhận status thực tế", "X6"),
        ("TC-MI-12", "Role TALENT", "TALENT hợp lệ", "Token TALENT còn hạn", "403 Forbidden", "X7"),
        ("TC-MI-13", "Role ENTERPRISE", "ENTERPRISE hợp lệ", "Token ENTERPRISE còn hạn", "403 Forbidden", "X8"),
        ("TC-MI-14", "Role LAB_ADMIN", "LAB_ADMIN hợp lệ", "Token LAB_ADMIN còn hạn", "403 Forbidden", "X9"),
        ("TC-MI-15", "Role SYSTEM_ADMIN", "SYSTEM_ADMIN hợp lệ", "Token SYSTEM_ADMIN còn hạn", "403 Forbidden", "X10"),
        ("TC-MI-16", "User MENTOR không có hồ sơ Mentor", "MENTOR hợp lệ",
         "User không có bản ghi Mentor liên kết", "404 Not Found theo exception handler hiện tại", "X11"),
    ]
    if len(cases) != 16:
        raise RuntimeError("Bộ test cần có đúng 16 case.")
    lines = [
        "# Test Cases - Mentor Invitations", "",
        "**Người thực hiện:** [Tên của bạn]  ", "**Module:** Mentor Portal  ",
        f"**Chức năng:** Danh sách lời mời Mentor (`GET {route}`)  ",
        f"**Ngày tạo:** {date.today().strftime('%d/%m/%Y')}", "", "---", "",
        "## 1. Căn cứ và phạm vi", "",
        f"- Controller xác nhận endpoint `GET {route}`, chỉ role `MENTOR` được gọi.",
        "- Service lấy lời mời `PENDING` theo mentor đang đăng nhập, sắp xếp `receivedDate` giảm dần.",
        f"- Mỗi item có các field {fields}.",
        "- API không nhận query parameter/body; vì vậy BVA đầu vào không áp dụng. Bộ này gồm 5 ca positive và 11 ca negative về dữ liệu, xác thực và phân quyền.", "",
        "## 2. Phân hoạch tương đương", "",
        "| Điều kiện | Loại | Tag | Giá trị đại diện |", "|---|---|---|---|",
        "| Bearer hợp lệ, role MENTOR và có hồ sơ | Valid | V1 | Mentor đã đăng nhập |",
        "| Có một invitation PENDING của mentor | Valid | V2 | Một bản ghi phù hợp |",
        "| Có nhiều invitation PENDING | Valid | V3 | Nhiều bản ghi; kiểm tra thứ tự mới nhất trước |",
        "| Không có invitation PENDING | Valid | V4 | Không có bản ghi phù hợp |",
        "| Có invitation của mentor khác | Valid / isolation | V5 | mentor_id khác |",
        "| DTO và fallback/chuẩn hóa field | Valid | V6 | Project thiếu, description/skills/priority có giá trị biên null/blank |",
        "| Không có token, Bearer rỗng, header sai hoặc JWT lỗi | Invalid | X1-X6 | Credential thiếu/không xác minh được |",
        "| Token role không phải MENTOR | Invalid | X7-X10 | TALENT, ENTERPRISE, LAB_ADMIN, SYSTEM_ADMIN |",
        "| Role MENTOR nhưng không có hồ sơ | Invalid state | X11 | Không tìm thấy hồ sơ Mentor |", "",
        "> Không lập BVA số học vì endpoint không nhận input có miền min/max. Giá trị null/blank trong response thuộc kiểm tra mapping/EP theo logic hiện có, không phải BVA request.", "",
        "## 3. Test cases", "", "| STT | TC ID | Tên test case | Input / Dữ liệu | Expected Result | Actual Result | Trạng thái | Ghi chú |",
        "|---:|---|---|---|---|---|:---:|---|",
    ]
    for index, (tc_id, name, token, data, expected, tags) in enumerate(cases, 1):
        actual, state, note = execution_results.get(
            tc_id,
            ("Chưa chạy — chưa có response thực tế", "**CHƯA CHẠY**",
             f"Tags: {tags}; ghi response/status sau khi chạy"),
        )
        lines.append("| " + " | ".join((str(index), f"**{tc_id}**", name,
            f"Token: {token}<br>{data}", expected, actual, state, note)) + " |")
    pass_count = sum(1 for _, state, _ in execution_results.values() if state == "**PASS**")
    fail_count = sum(1 for _, state, _ in execution_results.values() if state == "**FAIL**")
    not_run_count = len(cases) - pass_count - fail_count
    lines += [
        "", f"**Kết quả thực thi hiện tại:** {pass_count} PASS, {fail_count} FAIL, {not_run_count} CHƯA CHẠY (trên {len(cases)} case).", "",
        "", "## 4. Bảng kiểm tra độ phủ", "", "| Điều kiện | Test case | Trạng thái thiết kế |",
        "|---|---|---|", "| V1-V4: mentor, invitation pending, nhiều/rỗng | TC-MI-01–03 | Đã có case |",
        "| V5: cách ly mentor | TC-MI-04 | Đã có case |", "| V6: DTO/fallback | TC-MI-05 | Đã có case |",
        "| X1-X6: credential | TC-MI-06–11 | JWT lỗi cần xác nhận status thực tế |",
        "| X7-X10: role không phù hợp | TC-MI-12–15 | Đã có case |", "| X11: thiếu hồ sơ | TC-MI-16 | Đã có case |",
        "| Tổng | TC-MI-01–16 | 16 (5 positive, 11 negative) |", "",
        "## 5. Chuẩn bị và chạy bằng Postman", "",
        f"1. Chạy `labodc-backend`; base URL hiện cấu hình là `{base_url}`.",
        f"2. Đăng nhập trong cùng backend, lấy Bearer token MENTOR có hồ sơ; gọi `GET {base_url}{route}`.",
        "3. Chuẩn bị dữ liệu `mentor_invitations` cho mentor đó: PENDING, trạng thái khác PENDING, ngày nhận khác nhau và bản ghi thuộc mentor khác.",
        "4. So sánh status, body, thứ tự và quyền nhìn thấy dữ liệu với expected result. Ghi response thực tế trước khi đánh dấu pass/fail.",
        "5. Test credential lỗi và role khác bằng token tương ứng; không dùng token từ service khác nếu khác secret/cấu hình.", "",
        "## 6. Ghi chú thực thi", "",
        "- Script kiểm tra contract trong source rồi sinh Markdown; không gọi API hoặc tạo fixture. Kết quả chạy API đã ghi được giữ lại khi sinh lại tài liệu.",
        "- Sau khi gọi API, ghi status HTTP và nội dung response vào Actual Result. Đánh dấu PASS khi khớp Expected Result; đánh dấu FAIL khi không khớp; giữ CHƯA CHẠY nếu chưa thực thi.",
        "- Service chỉ lấy trạng thái PENDING. Các invitation trạng thái khác không nên xuất hiện.",
        "- Với project hợp lệ, `description` null thành chuỗi rỗng, `deadline` null dùng ngày từ `expiresAt`, `skills` được parse JSON list và priority không hợp lệ thành `medium`. Fallback tên `Project #<id>` không thể tạo bằng fixture thông thường vì khóa ngoại bắt buộc project tồn tại.",
        "- Với JWT lỗi, hãy ghi nhận status thực tế từ filter; không suy đoán test đã pass.", "",
        "### Sinh lại file", "", "```powershell", "python scripts\\generate_mentor_invitations_test_cases.py", "```", "",
    ]
    return "\n".join(lines)


def main() -> int:
    try:
        contract = inspect_contract()
        execution_results = load_execution_results()
        with OUTPUT.open("w", encoding="utf-8", newline="\n") as output:
            output.write(render(contract, execution_results))
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
