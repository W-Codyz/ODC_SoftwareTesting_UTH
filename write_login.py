import re

ADMIN_PRE_REQUEST_NEW = (
    b'  - type: beforeRequest\r\n'
    b'    code: |-\r\n'
    b'      var base_url = pm.environment.get("base_url");\r\n'
    b'      pm.sendRequest({\r\n'
    b'          url: base_url + "/api/auth/login",\r\n'
    b'          method: "POST",\r\n'
    b'          header: { "Content-Type": "application/json" },\r\n'
    b'          body: {\r\n'
    b'              mode: "raw",\r\n'
    b'              raw: JSON.stringify({\r\n'
    b'                  email: "labadmin2@labodc.com",\r\n'
    b'                  password: "123123"\r\n'
    b'              })\r\n'
    b'          }\r\n'
    b'      }, function(err, res) {\r\n'
    b'          if (!err && res.code === 200) {\r\n'
    b'              var jsonData = res.json();\r\n'
    b'              var token = jsonData.token || (jsonData.data && jsonData.data.token);\r\n'
    b'              if (token) {\r\n'
    b'                  pm.environment.set("token", token);\r\n'
    b'              }\r\n'
    b'          }\r\n'
    b'      });\r\n'
    b'    language: text/javascript'
)

# Files that need admin pre-request fix
admin_files = [
    'postman/collections/LabODC API Testing/Mentor Admin/Get All Mentors.request.yaml',
    'postman/collections/LabODC API Testing/Mentor Admin/Create Mentor.request.yaml',
    'postman/collections/LabODC API Testing/Mentor Admin/Update Mentor.request.yaml',
    'postman/collections/LabODC API Testing/Talent Admin/Create Talent.request.yaml',
    'postman/collections/LabODC API Testing/Talent Admin/Delete Talent.request.yaml',
    'postman/collections/LabODC API Testing/Talent Admin/Update Talent.request.yaml',
]

# The actual bytes ending the old beforeRequest block:
# ...pm.environment.set(\"token\", data.data.token);\r\n\r\n      \\    }\r\n\r\n      });"
# Let's use a simpler approach: find the beforeRequest block start and end, replace it entirely

for fpath in admin_files:
    with open(fpath, 'rb') as f:
        content = f.read()
    
    # Find the beforeRequest block
    start_marker = b'  - type: beforeRequest\r\n    code: "'
    end_marker = b'"\r\n    language: text/javascript'
    
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print(f'No beforeRequest found: {fpath}')
        continue
    
    # Find the end of the code block - it ends with "})" followed by end_marker
    # Search for end_marker after start_idx
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        print(f'No end marker found: {fpath}')
        continue
    
    end_idx_full = end_idx + len(end_marker)
    
    # Check if this is the old-style (contains data.data.token)
    block = content[start_idx:end_idx_full]
    if b'data.data.token' not in block:
        print(f'Block does not contain data.data.token: {fpath}')
        continue
    
    new_content = content[:start_idx] + ADMIN_PRE_REQUEST_NEW + content[end_idx_full:]
    
    with open(fpath, 'wb') as f:
        f.write(new_content)
    print(f'Fixed: {fpath}')

print('Done')



