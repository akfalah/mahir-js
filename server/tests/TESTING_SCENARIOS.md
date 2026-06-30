# Backend Testing Scenarios

This refactored suite focuses on scenarios that reflect realistic success, light failure, critical failure, authentication, authorization, and AGS/TDD feedback flows.

## Auth
- Sign up succeeds with valid data.
- Duplicate email, invalid email, short name, and weak password fail.
- Sign in succeeds with valid credentials.
- Wrong password and unknown email fail.
- Profile endpoints require token.
- Invalid token fails.
- Profile update succeeds.
- Duplicate profile email and invalid profile payload fail.
- Password update succeeds and allows sign in with the new password.
- Password update fails with wrong current password and weak new password.
- Deleted user referenced by a valid token returns 404.

## User Management
- Only admin can list, create, show, update, and delete users.
- Student receives 403 and guest receives 401.
- Pagination, search, sorting, and role filter work.
- Invalid page, limit, and role fail.
- Create user hashes password and does not expose password.
- Duplicate email, invalid email, short name, weak password, and invalid role fail.
- Update user supports profile fields, role, and password.
- Delete user succeeds and subsequent access returns 404.

## Content Models
- Concept, material, study case, and test case CRUD are covered.
- Published content is visible to guest/student.
- Unpublished content is hidden from guest/student but visible to admin.
- Admin can filter unpublished content.
- Student/guest cannot write content.
- Duplicate slug/order and missing parent records fail.
- `sortBy=order` requires parent filters for material, study case, and test case.
- Material content is sanitized and empty sanitized content fails.
- Study case syntax rules, function name, parameter names, and hint are persisted.
- Test case input/expected JSON is persisted and invalid shape fails.

## Submission and AGS
- Run test requires authentication.
- Valid code returns PASSED.
- Wrong logic returns FAILED with expected/received output.
- Syntax errors return ERROR.
- Syntax rule violations return ERROR.
- Student cannot run or submit unpublished study cases.
- Queued submission endpoint creates PENDING submission and adds job to queue.
- Admin cannot create student submission.
- Student sees only own submissions.
- Admin can filter submissions by user, status, and study case.
- Submission detail includes test results.
- Student cannot view another student's submission.

## Progress
- Progress endpoints require authentication.
- Progress list endpoints return existing records.
- Material and study case progress filters are covered.
- Passing study cases updates study case progress.
- Completing all study cases in a material completes material progress.
- Completing all materials in a concept completes concept progress.

## Executor
- Body-only code is wrapped and executed.
- Full function declaration is executed.
- Arrow function is executed.
- Wrong logic returns FAILED with expected/received.
- Missing required syntax returns ERROR.
- Forbidden syntax returns ERROR.
- JavaScript syntax error returns ERROR.
- Dangerous `require` modules and `process` access are blocked.
