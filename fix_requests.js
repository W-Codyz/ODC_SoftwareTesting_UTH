const fs = require('fs');
const path = require('path');

const base = 'postman/collections/LabODC API Testing';

function writeFile(relPath, content) {
  const fullPath = path.join(base, relPath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Written:', fullPath);
}

// TASK 1: Get All Mentors
writeFile('Mentor Admin/Get All Mentors.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/mentors?page=0&size=10'
method: GET
queryParams:
  - key: page
    value: '0'
  - key: size
    value: '10'
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response has content array', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.content).to.be.an('array');
      });
      pm.test('Total elements is a number', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.totalElements).to.be.a('number');
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 1000
`);

// TASK 1: Get Mentor By ID
writeFile('Mentor Admin/Get Mentor By ID.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/mentors/1'
method: GET
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Mentor data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData).to.not.be.null;
          pm.expect(jsonData.id).to.not.be.null;
      });
      pm.test('Mentor has fullName', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.fullName).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 2000
`);

// TASK 1: Get All Expertise
writeFile('Mentor Admin/Get All Expertise.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/mentors/expertise/all'
method: GET
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response is an array', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData).to.be.an('array');
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 3000
`);

// TASK 1: Update Mentor
writeFile('Mentor Admin/Update Mentor.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/mentors/{{mentor_id}}'
method: PUT
body:
  type: json
  content: |-
    {
      "fullName": "Test API Mentor",
      "title": "Dr.",
      "currentPosition": "Lead Developer",
      "currentCompany": "Tech Corp",
      "yearsOfExperience": 7,
      "bio": "Updated bio",
      "expertise": ["Java", "Spring Boot", "React"],
      "hourlyRate": 75.0,
      "currency": "USD",
      "maxConcurrentProjects": 5,
      "available": true
    }
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Updated mentor data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData).to.not.be.null;
          pm.expect(jsonData.id).to.not.be.null;
      });
      pm.test('Mentor fullName is not null', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.fullName).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 6000
`);

// TASK 1: Delete Mentor
writeFile('Mentor Admin/Delete Mentor.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/mentors/{{mentor_id}}'
method: DELETE
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 7000
`);

// TASK 2: Get All Talents
writeFile('Talent Admin/Get All Talents.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/talents?page=0&size=10'
method: GET
queryParams:
  - key: page
    value: '0'
  - key: size
    value: '10'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response has content array', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.content).to.be.an('array');
      });
      pm.test('Total elements is a number', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.totalElements).to.be.a('number');
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 1000
`);

// TASK 2: Update Talent
writeFile('Talent Admin/Update Talent.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/talents/{{talent_id}}'
method: PUT
body:
  type: json
  content: |-
    {
      "fullName": "Tran Updated Talent",
      "studentId": "TEST001",
      "university": "UTH",
      "major": "Software Engineering",
      "yearOfStudy": 4,
      "bio": "Updated bio"
    }
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Updated talent data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 4000
`);

// TASK 2: Delete Talent
writeFile('Talent Admin/Delete Talent.request.yaml', `$kind: http-request
url: '{{base_url}}/api/lab-admin/talents/{{talent_id}}'
method: DELETE
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 5000
`);

// TASK 3: TL-06 Post Skills
writeFile('Talent/TL-06 Post Skills.request.yaml', `$kind: http-request
url: '{{base_url}}/api/talent/skills'
method: POST
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "skillName": "{{test_skill_name}}",
      "skillCategory": "Programming",
      "proficiencyLevel": "INTERMEDIATE",
      "yearsOfExperience": 1.5
    }
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      // Auto-login as Talent user to get correct role token
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'nguyenvana@student.uth.edu.vn',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
      // Generate unique skill name to avoid duplicate errors
      var skillName = 'Skill_' + Date.now();
      pm.environment.set('test_skill_name', skillName);
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200 or 201', function () {
          pm.expect([200, 201]).to.include(pm.response.code);
      });
      pm.test('Response success is true', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.success).to.eql(true);
      });
      pm.test('Skill name is not null', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.data.skillName).to.not.be.null;
      });
      pm.test('Proficiency level is valid', function () {
          var jsonData = pm.response.json();
          pm.expect(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).to.include(jsonData.data.proficiencyLevel);
      });
      pm.test('Skill ID saved to environment', function () {
          var jsonData = pm.response.json();
          if (jsonData.data && jsonData.data.id) {
              pm.environment.set('skill_id', jsonData.data.id);
          }
          pm.expect(jsonData.data.id).to.not.be.null;
      });
order: 6000
`);

// TASK 4: TR-03 Create Transparency Report
writeFile('Transparency Reports/TR-03 Create Transparency Report.request.yaml', `$kind: http-request
method: POST
url: '{{base_url}}/api/lab-admin/transparency-reports'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{token}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "reportType": "QUARTERLY",
      "period": "Q4 2026",
      "autoGenerate": true
    }
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      // Auto-login as Lab Admin to get correct role token
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200 or 201', function () {
          pm.expect([200, 201]).to.include(pm.response.code);
      });
      pm.test('Response success is true', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.success).to.eql(true);
      });
      pm.test('Report created with ID', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.data).to.not.be.null;
          if (jsonData.data && jsonData.data.reportId) {
              pm.environment.set('report_id', jsonData.data.reportId);
          }
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
`);

// TASK 5: Dashboard - fix test scripts (remove duplicate status tests, keep clean versions)
// These don't have pre-request scripts so just clean up the afterResponse scripts

writeFile('Dashboard/Get Dashboard Stats.request.yaml', `$kind: http-request
url: '{{base_url}}/api/dashboard/stats'
method: GET
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response success is true', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.success).to.eql(true);
      });
      pm.test('Dashboard stats data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.data).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 1000
`);

writeFile('Dashboard/Get Recent Activities.request.yaml', `$kind: http-request
url: '{{base_url}}/api/dashboard/activities?limit=10'
method: GET
queryParams:
  - key: limit
    value: '10'
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response success is true', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.success).to.eql(true);
      });
      pm.test('Activities data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.data).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 2000
`);

writeFile('Dashboard/Get Pending Approvals.request.yaml', `$kind: http-request
url: '{{base_url}}/api/dashboard/approvals?limit=10'
method: GET
queryParams:
  - key: limit
    value: '10'
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response success is true', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.success).to.eql(true);
      });
      pm.test('Approvals data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.data).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 3000
`);

writeFile('Dashboard/Get Revenue Chart.request.yaml', `$kind: http-request
url: '{{base_url}}/api/dashboard/revenue?months=6'
method: GET
queryParams:
  - key: months
    value: '6'
scripts:
  - type: beforeRequest
    language: text/javascript
    code: |-
      var base_url = pm.environment.get('base_url');
      pm.sendRequest({
          url: base_url + '/api/auth/login',
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: {
              mode: 'raw',
              raw: JSON.stringify({
                  email: 'labadmin1@labodc.com',
                  password: '123123'
              })
          }
      }, function(err, res) {
          if (!err && res.code === 200) {
              var jsonData = res.json();
              var token = jsonData.token || (jsonData.data && jsonData.data.token);
              if (token) {
                  pm.environment.set('token', token);
              }
          }
      });
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test('Status code is 200', function () {
          pm.response.to.have.status(200);
      });
      pm.test('Response success is true', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.success).to.eql(true);
      });
      pm.test('Revenue chart data exists', function () {
          var jsonData = pm.response.json();
          pm.expect(jsonData.data).to.not.be.null;
      });
      pm.test('Response time is under 2000ms', function () {
          pm.expect(pm.response.responseTime).to.be.below(2000);
      });
settings: {}
order: 4000
`);

console.log('All files written successfully!');
