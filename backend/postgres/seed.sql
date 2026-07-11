-- Optional: seed with your existing MySQL data, converted to Postgres.
-- Run AFTER schema.sql. Skip this file entirely if you'd rather start fresh
-- (registration will create new users/tasks normally either way).

INSERT INTO users (id, display_name, username, email, password_hash, avatar_url, bio, favourite_hobby, theme_name, install_prompt_dismissed, install_prompt_installed, login_count, created_at, updated_at, theme, default_planning_mode, default_task_duration, profile_photo_url, notification_enabled, daily_review_reminder, collaboration_notifications, privacy_profile_visibility, allow_friend_requests, allow_collaboration, preferred_planning_mode, notifications_enabled, reminder_notifications, daily_review_notifications, profile_visibility) VALUES
(1,'George Jnr','george','georgejnr31@gmail.com','$2b$12$ICt9Qx5M6qxoinS5qM5nl.A32X2mS0WtszIkMqOLcuSOL9TG9XlsK','https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_incoming&w=740&q=80',NULL,NULL,'Summer Raspberry',FALSE,FALSE,6,'2026-04-04 23:08:24','2026-04-07 15:45:43','forest-velvet','timetable',30,NULL,TRUE,TRUE,TRUE,'friends',TRUE,TRUE,'todo',TRUE,TRUE,TRUE,'friends'),
(2,'Potato','daraandy','daramfon.andy2@gmail.com','$2b$12$JsUM.T7E7P.aDCtt7VF6o.nWJ9O/KRBjU0ZZtUFmujBM4zWRg62He',NULL,NULL,NULL,'Summer Raspberry',FALSE,FALSE,3,'2026-04-05 00:18:53','2026-04-07 11:24:21','midnight-indigo','todo',30,NULL,TRUE,TRUE,TRUE,'friends',TRUE,TRUE,'todo',TRUE,TRUE,TRUE,'friends');
SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));

INSERT INTO task_tags (id, user_id, name, color, created_at) VALUES
(1,2,'Growth','#8B1E3F','2026-04-05 00:28:31'),
(2,2,'Learning','#5C2E91','2026-04-05 00:28:31'),
(3,2,'Creative','#C15F3C','2026-04-05 00:28:31'),
(4,2,'Fitness','#2C8C6B','2026-04-05 00:28:31'),
(5,2,'Language','#3F6ED8','2026-04-05 00:28:31'),
(6,2,'Reading','#8C6A2C','2026-04-05 00:28:31'),
(7,2,'Research','#6B7280','2026-04-05 00:28:31');
SELECT setval(pg_get_serial_sequence('task_tags','id'), (SELECT MAX(id) FROM task_tags));

INSERT INTO tasks (id, user_id, title, description, priority, status, planning_mode, difficulty_level, estimated_minutes, due_date, reminder_at, is_recurring, recurrence_pattern, tag_id, created_at, updated_at, completed_at) VALUES
(1,2,'Spend 30 minutes on personal growth','Starter self-development task','medium','pending','todo',3,30,NULL,NULL,FALSE,NULL,1,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(2,2,'Learn something outside my course','Explore knowledge beyond formal coursework','medium','completed','todo',3,45,NULL,NULL,FALSE,NULL,2,'2026-04-05 00:28:31','2026-04-05 01:18:52','2026-04-05 02:18:52'),
(3,2,'Explore one tech topic','Read or watch something related to technology','medium','pending','todo',3,45,NULL,NULL,FALSE,NULL,2,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(4,2,'Practice a new language','Vocabulary, listening, or speaking practice','medium','pending','todo',3,30,NULL,NULL,FALSE,NULL,5,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(5,2,'Improve speaking through practice','Speaking drills or presentation-style practice','medium','pending','todo',3,20,NULL,NULL,FALSE,NULL,5,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(6,2,'Do a physical fitness session','General body movement or workout','high','completed','todo',4,40,NULL,NULL,FALSE,NULL,4,'2026-04-05 00:28:31','2026-04-05 01:22:12','2026-04-05 02:22:13'),
(7,2,'Practice calisthenics','Bodyweight training session','high','pending','todo',4,35,NULL,NULL,FALSE,NULL,4,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(8,2,'Work on crocheting','Spend time developing crocheting skill','low','pending','todo',2,45,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(9,2,'Practice drawing','Sketching or drawing improvement session','medium','pending','todo',3,40,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(10,2,'Practice painting','Painting session for improvement or expression','medium','pending','todo',3,45,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(11,2,'Read fiction','Read fiction for learning or enjoyment','low','pending','todo',2,30,NULL,NULL,FALSE,NULL,6,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(12,2,'Read non-fiction','Read educational or reflective material','medium','pending','todo',3,30,NULL,NULL,FALSE,NULL,6,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(13,2,'Write fiction','Creative writing practice','medium','pending','todo',3,40,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(14,2,'Journal for the day','Reflect and write daily thoughts','medium','pending','todo',2,15,NULL,NULL,FALSE,NULL,1,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(15,2,'Practice singing','Voice or song practice','low','pending','todo',2,25,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(16,2,'Learn a constellation','Study one constellation and its features','low','pending','todo',2,20,NULL,NULL,FALSE,NULL,2,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(17,2,'Memorize 5 countries','Learn and retain names or locations of countries','low','pending','todo',2,15,NULL,NULL,FALSE,NULL,2,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(18,2,'Write or study a poem this week','Weekly poetry engagement','medium','pending','todo',3,25,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(19,2,'Identify a plant','Study and recognize a plant','low','pending','todo',2,15,NULL,NULL,FALSE,NULL,7,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(20,2,'Research a controversial topic','Explore a complex topic from multiple angles','medium','pending','todo',4,45,NULL,NULL,FALSE,NULL,7,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(21,2,'Study the history of a famous person','Read about someone influential','low','pending','todo',2,25,NULL,NULL,FALSE,NULL,7,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(22,2,'Practice acrylic painting','Acrylic-specific painting session','medium','pending','todo',3,45,NULL,NULL,FALSE,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),
(23,1,'Coding','Finish Todo list site','medium','completed','todo',4,40,'2026-04-07 08:10:00','2026-04-07 08:11:00',FALSE,NULL,NULL,'2026-04-07 07:05:02','2026-04-07 10:09:54','2026-04-07 11:09:54'),
(24,1,'Assignment','Finish modelling assignments','medium','completed','todo',3,NULL,'2026-04-06 08:10:00',NULL,FALSE,NULL,NULL,'2026-04-07 07:14:33','2026-04-07 10:19:33','2026-04-07 11:19:34'),
(25,1,'Practice Drawing','Use hb pencils','low','pending','todo',3,15,'2026-04-07 12:23:00','2026-04-07 12:22:00',FALSE,NULL,NULL,'2026-04-07 10:20:47','2026-04-07 10:20:47',NULL);
SELECT setval(pg_get_serial_sequence('tasks','id'), (SELECT MAX(id) FROM tasks));

INSERT INTO day_plans (id, user_id, plan_date, planning_mode, notes, is_locked, locked_at, created_at, updated_at) VALUES
(1,2,'2026-04-05','todo','',TRUE,'2026-04-05 01:59:07','2026-04-05 00:57:23','2026-04-05 01:20:32'),
(2,1,'2026-04-05','todo',NULL,FALSE,NULL,'2026-04-05 13:23:55','2026-04-05 13:23:55'),
(3,1,'2026-04-07','todo','',TRUE,'2026-04-07 08:05:31','2026-04-07 07:01:57','2026-04-07 07:15:53'),
(4,2,'2026-04-07','todo',NULL,FALSE,NULL,'2026-04-07 08:40:50','2026-04-07 08:40:50');
SELECT setval(pg_get_serial_sequence('day_plans','id'), (SELECT MAX(id) FROM day_plans));

INSERT INTO day_plan_tasks (id, day_plan_id, task_id, sort_order, planned_start, planned_end, added_after_lock, completed_in_plan, created_at) VALUES
(1,1,6,0,'2026-04-05 02:01:00','2026-04-05 02:02:00',FALSE,FALSE,'2026-04-05 00:58:57'),
(2,1,4,0,'2026-04-05 02:21:00','2026-04-05 02:22:00',TRUE,FALSE,'2026-04-05 01:20:13'),
(3,3,23,0,NULL,NULL,FALSE,FALSE,'2026-04-07 07:05:16'),
(4,3,24,0,NULL,NULL,TRUE,FALSE,'2026-04-07 07:15:07'),
(5,3,25,0,NULL,NULL,TRUE,FALSE,'2026-04-07 10:21:03');
SELECT setval(pg_get_serial_sequence('day_plan_tasks','id'), (SELECT MAX(id) FROM day_plan_tasks));

INSERT INTO daily_evaluations (id, user_id, plan_date, completion_percentage, completed_tasks_count, pending_tasks_count, overdue_tasks_count, strongest_category, most_skipped_category, total_estimated_minutes_completed, consistency_score, summary_note, created_at, updated_at) VALUES
(1,2,'2026-04-05',50.00,1,1,0,'Fitness','Language',40,65.00,'Completed 1 tasks • 50% completion • strongest category: Fitness','2026-04-05 01:16:33','2026-04-05 01:21:09'),
(4,1,'2026-04-05',0.00,0,0,0,NULL,NULL,0,0.00,'Completed 0 tasks • 0% completion','2026-04-05 13:12:40','2026-04-05 13:12:40'),
(5,1,'2026-04-07',100.00,1,0,0,'Uncategorized',NULL,40,100.00,'Completed 1 tasks • 100% completion • strongest category: Uncategorized','2026-04-07 07:11:48','2026-04-07 07:11:48');
SELECT setval(pg_get_serial_sequence('daily_evaluations','id'), (SELECT MAX(id) FROM daily_evaluations));

INSERT INTO friend_requests (id, sender_id, receiver_id, status, created_at, updated_at) VALUES
(1,1,2,'accepted','2026-04-07 10:46:19','2026-04-07 10:46:59');
SELECT setval(pg_get_serial_sequence('friend_requests','id'), (SELECT MAX(id) FROM friend_requests));

INSERT INTO friends (id, user_id, friend_id, created_at) VALUES
(1,1,2,'2026-04-07 10:46:59'),
(2,2,1,'2026-04-07 10:46:59');
SELECT setval(pg_get_serial_sequence('friends','id'), (SELECT MAX(id) FROM friends));

INSERT INTO messages (id, sender_id, receiver_id, body, is_read, created_at) VALUES
(1,1,2,'Heyy Dara',TRUE,'2026-04-07 11:23:55'),
(2,1,2,'What''s good?',TRUE,'2026-04-07 11:24:08'),
(3,2,1,'I''m Alright, Message testing successful',TRUE,'2026-04-07 11:24:59'),
(4,1,2,'Wonderful',FALSE,'2026-04-07 11:35:54');
SELECT setval(pg_get_serial_sequence('messages','id'), (SELECT MAX(id) FROM messages));

INSERT INTO notifications (id, user_id, type, title, message, related_task_id, scheduled_for, is_read, is_sent, created_at, updated_at, related_request_id) VALUES
(1,1,'overdue_alert','Task overdue','"Assignment" is overdue. Try to reschedule it or clear it today.',24,'2026-04-06 08:10:00',FALSE,FALSE,'2026-04-07 08:05:21','2026-04-07 08:05:21',NULL),
(2,1,'daily_review','Daily review','You still have 1 unfinished task. Review your day and close it out well.',NULL,'2026-04-07 09:05:21',FALSE,FALSE,'2026-04-07 08:05:21','2026-04-07 08:05:21',NULL),
(3,1,'task_reminder','Task reminder','Your task "Coding" is due for attention now.',23,'2026-04-07 08:11:00',FALSE,FALSE,'2026-04-07 08:05:53','2026-04-07 08:05:53',NULL),
(5,1,'overdue_alert','Task overdue','"Coding" is overdue. Try to reschedule it or clear it today.',23,'2026-04-07 08:10:00',TRUE,FALSE,'2026-04-07 08:05:53','2026-04-07 10:35:43',NULL),
(7,2,'daily_review','Daily review','You still have 20 unfinished tasks. Review your day and close it out well.',NULL,'2026-04-07 09:40:41',FALSE,FALSE,'2026-04-07 08:40:41','2026-04-07 08:40:41',NULL),
(9,2,'system','New friend request','Someone sent you a friend request.',NULL,'2026-04-07 11:46:20',FALSE,FALSE,'2026-04-07 10:46:19','2026-04-07 10:46:19',NULL),
(10,1,'system','Friend request accepted','Your friend request was accepted.',NULL,'2026-04-07 11:46:59',TRUE,FALSE,'2026-04-07 10:46:59','2026-04-07 11:01:55',NULL),
(11,1,'task_reminder','Task reminder','Your task "Practice Drawing" is due for attention now.',25,'2026-04-07 12:22:00',FALSE,FALSE,'2026-04-07 11:23:40','2026-04-07 11:23:40',NULL),
(12,1,'overdue_alert','Task overdue','"Practice Drawing" is overdue. Try to reschedule it or clear it today.',25,'2026-04-07 12:23:00',FALSE,FALSE,'2026-04-07 11:23:40','2026-04-07 11:23:40',NULL),
(13,2,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:23:55',FALSE,FALSE,'2026-04-07 11:23:55','2026-04-07 11:23:55',NULL),
(14,2,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:24:09',FALSE,FALSE,'2026-04-07 11:24:08','2026-04-07 11:24:08',NULL),
(15,1,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:24:59',FALSE,FALSE,'2026-04-07 11:24:59','2026-04-07 11:24:59',NULL),
(16,2,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:35:54',FALSE,FALSE,'2026-04-07 11:35:54','2026-04-07 11:35:54',NULL);
SELECT setval(pg_get_serial_sequence('notifications','id'), (SELECT MAX(id) FROM notifications));
