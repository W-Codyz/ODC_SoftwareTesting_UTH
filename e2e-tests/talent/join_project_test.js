
const assert = require('assert');

const talentEmail =
  process.env.TALENT_EMAIL || 'hoangvane@student.uth.edu.vn';

const talentPassword = process.env.TALENT_PASSWORD;

const apiBaseUrl = '/api';

Feature('FR-TAL-002 - Duyệt và Tham gia dự án');

function loginAsTalent(I) {
  I.amOnPage('/login');
  I.fillField('Tên đăng nhập', talentEmail);
  I.fillField('Mật khẩu', talentPassword);
  I.click('Đăng nhập');
  I.waitForText('Đăng nhập thành công!', 10);
}

// Lấy một dự án đang tuyển mà Talent chưa đăng ký.
async function findJoinableProject(I) {
  const result = await I.executeScript(async (baseUrl) => {
    const token = window.localStorage.getItem('access_token');

    if (!token) {
      return {
        error: 'Không tìm thấy access_token sau khi đăng nhập',
      };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [availableResponse, myProjectsResponse] =
        await Promise.all([
          fetch(
            `${baseUrl}/talent/projects/available?page=0&size=50`,
            { headers }
          ),
          fetch(`${baseUrl}/talent/projects/my-projects`, {
            headers,
          }),
        ]);

      const availableJson = await availableResponse.json();
      const myProjectsJson = await myProjectsResponse.json();

      if (!availableResponse.ok || !myProjectsResponse.ok) {
        return {
          error: 'API trả về HTTP không thành công',
          availableStatus: availableResponse.status,
          myProjectsStatus: myProjectsResponse.status,
          availableResponse: availableJson,
          myProjectsResponse: myProjectsJson,
        };
      }

      const extractList = (json) => {
        const candidates = [
          json?.data,
          json?.data?.content,
          json?.data?.items,
          json?.content,
          json?.items,
        ];

        return candidates.find(Array.isArray) || null;
      };

      const availableProjects = extractList(availableJson);
      const myProjects = extractList(myProjectsJson);

      if (!availableProjects || !myProjects) {
        return {
          error: 'Không xác định được cấu trúc danh sách API',
          availableResponse: availableJson,
          myProjectsResponse: myProjectsJson,
        };
      }

      const joinedIds = new Set(
        myProjects.map((project) => String(project.id))
      );

      const candidate = availableProjects.find(
        (project) =>
          project.status === 'RECRUITING' &&
          !joinedIds.has(String(project.id))
      );

      if (!candidate) {
        return {
          error: 'Không tìm thấy dự án phù hợp',
          availableCount: availableProjects.length,
          myProjectsCount: myProjects.length,
          availableProjects,
          myProjects,
        };
      }

      return {
        id: candidate.id,
        title: candidate.title,
      };
    } catch (error) {
      return {
        error: error.message || String(error),
      };
    }
  }, apiBaseUrl);

  console.log(
    '\n=== FR-TAL-002 API RESPONSE ===\n',
    JSON.stringify(result, null, 2)
  );

  assert.ok(
    result && !result.error,
    JSON.stringify(result, null, 2)
  );

  assert.ok(result.id, 'Dự án được chọn phải có ID');
  assert.ok(result.title, 'Dự án được chọn phải có tên');

  return result;
}

// Tạo XPath an toàn với tên dự án có dấu nháy.
function projectCardXpath(title) {
  const xpathLiteral = (value) => {
    if (!value.includes("'")) {
      return `'${value}'`;
    }

    if (!value.includes('"')) {
      return `"${value}"`;
    }

    return `concat(${value
      .split("'")
      .map((part) => `'${part}'`)
      .join(`, "'", `)})`;
  };

  const literal = xpathLiteral(title);

  return `//div[contains(@class,"ant-card")][.//div[contains(@class,"ant-card-head-title") and normalize-space(.)=${literal}]]`;
}

// Mở hộp thoại xác nhận tham gia dự án.
function openJoinConfirmation(I, projectTitle) {
  const card = projectCardXpath(projectTitle);

  I.waitForElement({ xpath: card }, 10);

  I.click({
    xpath: `${card}//button[normalize-space(.)="Tham gia"]`,
  });

  I.waitForText('Xác nhận tham gia dự án', 10);
  I.see(projectTitle);
  I.see('Bạn có chắc muốn tham gia dự án này không?');
}

// TC-TAL-002-01: Hủy xác nhận tham gia.
Scenario(
  'TC-TAL-002-01 - Hủy xác nhận tham gia dự án',
  async ({ I }) => {
    loginAsTalent(I);

    I.amOnPage('/talent/projects/browse');
    I.waitForText('Tìm kiếm dự án', 10);

    const project = await findJoinableProject(I);

    openJoinConfirmation(I, project.title);

    I.click('Hủy');
    I.dontSee('Xác nhận tham gia dự án');

    // Kiểm tra dự án vẫn chưa được thêm vào danh sách của Talent.
    I.amOnPage('/talent/my-projects');
    I.waitForText('Dự án của tôi', 10);

    I.dontSee(project.title);
  }
);

// TC-TAL-002-02: Gửi yêu cầu tham gia thành công.
Scenario(
  'TC-TAL-002-02 - Gửi yêu cầu tham gia dự án thành công',
  async ({ I }) => {
    loginAsTalent(I);

    I.amOnPage('/talent/projects/browse');
    I.waitForText('Tìm kiếm dự án', 10);

    const project = await findJoinableProject(I);

      openJoinConfirmation(I, project.title);

    // Theo dõi API và nhấn nút gửi trong cùng một thao tác.
    const joinResult = await I.usePlaywrightTo(
      'Gửi yêu cầu và theo dõi phản hồi API',
      async ({ page }) => {
        const [response] = await Promise.all([
          page.waitForResponse(
            (res) =>
              res.url().includes(
                `/api/talent/projects/${project.id}/join`
              ) &&
              res.request().method() === 'POST',
            { timeout: 15000 }
          ),
          page.getByRole('button', {
            name: 'Gửi yêu cầu',
          }).click(),
        ]);

        return {
          status: response.status(),
          body: await response.text(),
        };
      }
    );

    const joinStatus = joinResult.status;
    const responseBody = joinResult.body;

    console.log('\n=== JOIN PROJECT API ===');
    console.log(`Project ID: ${project.id}`);
    console.log(`HTTP Status: ${joinStatus}`);
    console.log(`Response Body: ${responseBody}`);

    if (joinStatus >= 200 && joinStatus < 300) {
      // Trường hợp backend xử lý thành công.
      I.waitForText('Đã gửi yêu cầu tham gia dự án!', 10);

      I.amOnPage('/talent/my-projects');
      I.waitForText('Dự án của tôi', 10);
      I.waitForText(project.title, 10);

      // Yêu cầu tham gia phải ở trạng thái PENDING.
      I.see('Chờ duyệt', {
        xpath: projectCardXpath(project.title),
      });
    } else {
      // Trường hợp backend trả lỗi.
      I.waitForText('Không thể gửi yêu cầu tham gia', 10);

      // Không cho phép test PASS khi API gửi yêu cầu thất bại.
      assert.ok(
        joinStatus >= 200 && joinStatus < 300,
        `Gửi yêu cầu tham gia thất bại.
HTTP Status: ${joinStatus}
Backend Response: ${responseBody}`
      );
    }
  }
);
