-- Todo App Schema
-- Run this in Supabase SQL editor to initialize the database

create extension if not exists "uuid-ossp";

-- Tasks
create table if not exists tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  status      text not null default 'active' check (status in ('active','completed','archived')),
  due_date    date,
  priority    int not null default 3 check (priority between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Todos
create table if not exists todos (
  id               uuid primary key default uuid_generate_v4(),
  task_id          uuid references tasks(id) on delete set null,
  title            text not null,
  description      text,
  status           text not null default 'pending' check (status in ('pending','in_progress','done','snoozed')),
  importance       int not null default 3 check (importance between 1 and 5),
  reluctance_score numeric(4,1) not null default 5 check (reluctance_score between 0 and 10),
  avoidance_score  numeric(6,2) not null default 11,  -- importance*2 + reluctance_score + snoozed*0.5
  estimated_minutes int,
  due_date         date,
  source           text not null default 'manual' check (source in ('manual','ai-extracted','memo')),
  snoozed_count    int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_todos_avoidance on todos(avoidance_score desc) where status = 'pending';
create index if not exists idx_todos_task on todos(task_id);

-- Notes
create table if not exists notes (
  id           uuid primary key default uuid_generate_v4(),
  task_id      uuid references tasks(id) on delete set null,
  note_type    text not null default 'memo' check (note_type in ('meeting','idea','memo')),
  raw_content  text not null,  -- 원문 항상 보관
  created_at   timestamptz not null default now()
);

create index if not exists idx_notes_task on notes(task_id);

-- AI Summaries
create table if not exists ai_summaries (
  id                  uuid primary key default uuid_generate_v4(),
  note_id             uuid not null references notes(id) on delete cascade,
  short_summary       text not null,
  key_points          text[] not null default '{}',
  follow_up_questions text[] not null default '{}',
  decision_points     text[] not null default '{}',
  created_at          timestamptz not null default now()
);

-- AI Suggestions
create table if not exists ai_suggestions (
  id              uuid primary key default uuid_generate_v4(),
  note_id         uuid not null references notes(id) on delete cascade,
  suggestion_type text not null check (suggestion_type in ('action_item','todo','follow_up','decision')),
  content         text not null,
  status          text not null default 'pending' check (status in ('pending','approved','rejected','deferred')),
  approved_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_suggestions_status on ai_suggestions(status) where status = 'pending';

-- Suggestion → Todo mapping
create table if not exists suggestion_todos (
  id                         uuid primary key default uuid_generate_v4(),
  suggestion_id              uuid not null references ai_suggestions(id) on delete cascade,
  generated_todo_title       text not null,
  generated_todo_description text,
  approved_yn                boolean not null default false,
  reluctance_score           integer not null default 5 check (reluctance_score between 0 and 10),
  importance                 integer not null default 3 check (importance between 1 and 5),
  estimated_minutes          integer,
  schedule_impact            text,
  urgency_hint               text check (urgency_hint in ('today', 'this_week', 'later'))
);

-- updated_at auto-update trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

create or replace trigger todos_updated_at before update on todos
  for each row execute function update_updated_at();
