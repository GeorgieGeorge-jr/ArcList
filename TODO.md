- [ ] Implement planner timetable + recurrence support per selection (auto-add recurring tasks on load)
- [ ] Add backend logic to expand recurring tasks into day_plan_tasks for selected plan date
- [ ] Ensure lock semantics: only allow removal of tasks added after lock; recurring auto-added tasks should probably mark added_after_lock=false unless generated during unlock
- [ ] Update planner UI to visually differentiate timetable mode (e.g., sort by planned_start and display timeline)
- [ ] Ensure plannerMode change/save persists and reload behaves correctly
- [ ] Syntax check (node -c) and quick endpoint smoke tests

