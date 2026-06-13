1) Friend request actions may still fail in some cases (contract mismatch risk)
Frontend shows Accept/Decline only when:
notification.related_request_id is truthy
notification.title === "New friend request"
Backend creates friend request notification with:
title: "New friend request" ✅
(fixed) now includes relatedRequestId: request.id ✅
Remaining risk: if any existing notifications in DB were created before the fix (they have related_request_id = NULL), the UI still won’t show actions until a new notification is generated.
Status: fixed for newly created notifications; old DB rows may remain “missing actions”.

2) Notifications regenerate on every page load + every 30s (performance + duplication risk)
Backend: notificationController calls generateTaskNotificationsForUser(userId) inside:
GET /api/notifications
GET /api/notifications/summary
Frontend:
notifications.js calls loadNotifications() every 30s
also calls it after mark/read/generate-now
This will cause:

heavy DB load (queries + inserts)
risk of many extra scheduled rows if NOT EXISTS logic fails for edge cases
Not a “break” but can feel broken due to lag / spam.

3) /api/messages may not align with friend messaging UI expectations
Backend message models/service/controller exist, but from what we’ve inspected:

messageService creates a notification of type "system" with title "New message"
it does not link to related_task_id/related_request_id (frontend likely doesn’t need it)
but there’s no guarantee the frontend messaging page expects specific fields (last_message_body, etc.) unless we validate messages UI pages fully.
Status: not proven broken yet—needs an actual endpoint/UI smoke check.

B) DB schema vs code contract issues (or missing normalization)
4) users settings column naming is inconsistent across backend code vs SQL dump
In arclist.sql, users table uses columns like:

theme (varchar)
default_planning_mode
default_task_duration
notifications_enabled
reminder_notifications
daily_review_notifications
collaboration_notifications
profile_visibility
allow_friend_requests
allow_collaboration
But users table also has other similarly-named columns:

notification_enabled, daily_review_reminder, privacy_profile_visibility, etc.
Backend userSettingsModel selects/updates a specific set; if your DB isn’t exactly what the model expects, settings endpoints could behave inconsistently.

Status: likely works given model matches those newer columns (since they exist in dump), but the table has extra legacy columns. Improvement: remove unused columns or standardize.

5) Task priority/status enums mismatch across code vs SQL (risk)
arclist.sql:

tasks.status enum: pending, in_progress, completed, archived
tasks.priority enum: low, medium, high, urgent
Frontend tasks UI checks:

task.status.replace("_", " ")
uses status to decide button text (completed vs not)
Backend taskService toggles only between:

"completed" and "pending" ✅
If UI ever displays in_progress or archived, toggle behavior won’t handle them logically.

Improvement: toggle should probably cycle:

pending → in_progress → completed (or explicit transitions)
6) Notification model / notificationService “locked plan tasks cannot be removed” etc. is not reflected in reminders
Some services rely on planner/task-lock semantics, but notification generation uses only tasks.reminder_at and tasks.due_date—it doesn’t consider whether tasks are archived, locked plan tasks, or planned completion semantics (day_plan_tasks.completed_in_plan).

Status: behavior may be semantically “wrong” rather than broken.

C) API contract mismatches (backend route vs frontend usage)
7) Endpoint base path depends on hostname logic (deployment fragility)
Frontend frontend/js/config.js:


window.location.hostname === "localhost"
  ? "http://localhost:5050/api"
  : "https://arclist-production.up.railway.app/api";
This hardcodes production domain. If you self-host or use staging, it breaks.

Improvement: use relative /api with a proxy/rewrite, or store config in window.__ENV.

8) Inconsistent naming between frontend and backend in some APIs (needs verification)
Examples spotted by searching:

frontend calls .../evaluations/generate
backend might expose /api/evaluations/generate or /api/evaluations/generate—not validated here end-to-end.
We didn’t fully smoke-test all endpoints, so this is an audit item.

D) Security / correctness issues
9) authMiddleware: JWT uses Bearer token, but session storage assumes localStorage (XSS risk)
session.js stores JWT + user in localStorage.
if you ever have XSS injection, tokens are exposed.
Improvement: use httpOnly cookies.

10) No rate limiting on auth/friend/actions (brute force risk)
login/register/friend search should have throttling.
E) Code quality / maintainability problems
11) Duplicate/unused fields in SQL dump (legacy columns)
The users table has multiple columns that appear unused by current code:

notification_enabled, daily_review_reminder, privacy_profile_visibility, profile_photo_url, etc.
This makes it hard to reason about “source of truth”.

Improvement: clean schema; create migrations.

12) Notification “is_sent” never used
notifications table has:

is_sent tinyint
But in notification generation:

you insert notifications continuously (or rely on NOT EXISTS)
no logic references is_sent.
Improvement: either remove the field or use it for “already sent to client” vs “created”.

13) messages unread logic may be okay but is not symmetrical at notification generation
read/unread is based on messages.is_read
but notifications for messages don’t respect whether the user is active.
Not broken, but semantically could be improved:

only notify if receiver is offline
or if browser permission granted and page not active
F) UX/incompleteness items
14) Missing automation/cron for notifications
Currently notifications are generated when:

user loads notifications page
or summary page is hit
or every 30s while on notifications page
Improvement: generate periodically server-side (cron / queue), and only fetch on client.

