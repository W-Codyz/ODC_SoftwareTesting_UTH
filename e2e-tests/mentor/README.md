# Mentor Task Breakdown UI E2E

This is a separate UI suite. It leaves the API-only suite under `e2e-tests/mentor` unchanged.

Run from `ODC_SoftwareTesting_UTH/`:

```powershell
npm run test:manh-e2e:ui
```

Chromium is shown while each test logs in and uses the Mentor task or Excel screens. Tests assert the corresponding API response and continue to the next case after a failure. The suite does not save screenshots; the JSON report is written to `manh_e2e_json_ui/result.json`.

<!-- The backend (`localhost:8080`), frontend (`localhost:3000`), and seeded Mentor account must be available. Set `MANH_E2E_MENTOR_EMAIL` and `MANH_E2E_MENTOR_PASSWORD` to override the default credentials. -->
