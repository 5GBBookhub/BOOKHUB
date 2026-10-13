create extension if not exists pgcrypto;

create table if not exists public.books (
  id text primary key,
  title text not null,
  author text,
  category text,
  isbn text,
  year integer,
  copies integer default 1,
  available integer default 1,
  borrowed integer default 0,
  tone text,
  created_at timestamp with time zone default now()
);

create table if not exists public.borrowers (
  id text primary key,
  name text not null,
  email text not null unique,
  course text,
  joined date,
  status text default 'Active',
  borrowed integer default 0,
  account_type text default 'student',
  password_hash text,
  password_salt text,
  created_at timestamp with time zone default now()
);

create table if not exists public.staff (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null,
  status text default 'Active',
  password_hash text,
  password_salt text,
  created_at timestamp with time zone default now()
);

create table if not exists public.transactions (
  id text primary key,
  borrower_id text references public.borrowers(id) on delete set null,
  borrower text,
  book_id text references public.books(id),
  title text,
  issued date,
  due date,
  returned date,
  status text default 'Borrowed',
  fine numeric default 0,
  requested_at timestamp with time zone default now(),
  claim_expires_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancellation_reason text
);

-- Keep transaction history if a borrower profile is deleted. The borrower name
-- is stored on each transaction, so the historical record remains readable.
alter table public.transactions
  drop constraint if exists transactions_borrower_id_fkey;
alter table public.transactions
  add constraint transactions_borrower_id_fkey
  foreign key (borrower_id) references public.borrowers(id) on delete set null;

create table if not exists public.notifications (
  id text primary key,
  message text not null,
  audience text not null default 'staff',
  created_at timestamp with time zone default now(),
  read_by text[] default '{}'
);

create table if not exists public.library_settings (
  id integer primary key default 1,
  library_name text default 'BookHub Library',
  email text default 'library@edu.ph',
  loan_days integer default 14,
  max_books integer default 3,
  fine_rate numeric default 5,
  renewals integer default 1,
  due_reminders boolean default true,
  overdue_alerts boolean default true,
  new_arrivals boolean default false,
  two_factor boolean default true,
  session_timeout integer default 30
);

alter table public.books add column if not exists cover_url text;
alter table public.borrowers add column if not exists password_hash text;
alter table public.borrowers add column if not exists password_salt text;
alter table public.staff add column if not exists password_hash text;
alter table public.staff add column if not exists password_salt text;

update public.books
set cover_url = case title
  when 'Deep Work' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/deep%20work.jpg'
  when 'Ikigai' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/ikigai.jpg'
  when 'Little Women' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/little%20women.jpg'
  when 'Sapiens' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/sapiens.jpg'
  when 'The Alchemist' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/the%20alchemist.jpg'
  when 'The Song of Achilles' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/TheSongofAchilles.jpg'
  when 'Thinking, Fast and Slow' then 'https://nclnscahjfhwaywelnvd.supabase.co/storage/v1/object/public/book_cover/thinking%2C%20fast%20and%20slow.jpg'
end
where cover_url is null
  and title in (
    'Deep Work',
    'Ikigai',
    'Little Women',
    'Sapiens',
    'The Alchemist',
    'The Song of Achilles',
    'Thinking, Fast and Slow'
  );

insert into public.library_settings (id, library_name, email, loan_days, max_books, fine_rate, renewals, due_reminders, overdue_alerts, new_arrivals, two_factor, session_timeout)
values (1, 'BookHub Library', 'library@edu.ph', 14, 3, 5, 1, true, true, false, true, 30)
on conflict (id) do nothing;

-- Drop functions first because CREATE OR REPLACE cannot change an existing
-- function's return type.
drop function if exists public.expire_pending();
drop function if exists public.mark_overdue();
drop function if exists public.request_borrow(text, text, date, date);
drop function if exists public.staff_checkout(text, text, date, date);
drop function if exists public.confirm_borrow(text);
drop function if exists public.return_book(text);
drop function if exists public.cancel_request(text);
drop function if exists public.cancel_request(text, text);

create or replace function public.expire_pending()
returns integer
language plpgsql
security definer
set search_path = public
as $$
  begin
    update public.transactions
    set status = 'Expired', cancelled_at = now(), cancellation_reason = 'Request expired'
    where status = 'Pending' and claim_expires_at is not null and claim_expires_at <= now();
    return 1;
  end;
$$;

create or replace function public.mark_overdue()
returns void
language plpgsql
security definer
set search_path = public
as $$
  begin
    update public.transactions
    set status = 'Overdue'
    where status in ('Borrowed', 'Pending')
      and due is not null
      and due < current_date;
  end;
$$;

create or replace function public.request_borrow(
  p_borrower text,
  p_book text,
  p_issued date,
  p_due date
)
returns text
language plpgsql
security definer
set search_path = public
as $$
  declare
    v_id text;
  begin
    if not exists (
      select 1 from public.borrowers
      where id = p_borrower and status = 'Active'
    ) then
      raise exception 'This member account is not active.';
    end if;

    if not exists (
      select 1 from public.books
      where id = p_book and available > 0
    ) then
      raise exception 'This book is no longer available.';
    end if;

    if exists (
      select 1 from public.transactions
      where borrower_id = p_borrower
        and book_id = p_book
        and status in ('Pending', 'Borrowed', 'Overdue')
    ) then
      raise exception 'This member already has an active request or loan for this book.';
    end if;

    insert into public.transactions (
      id,
      borrower_id,
      borrower,
      book_id,
      title,
      issued,
      due,
      status,
      requested_at,
      claim_expires_at
    )
    select
      'TRX-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || floor(random() * 10000)::int,
      p_borrower,
      br.name,
      p_book,
      b.title,
      p_issued,
      p_due,
      'Pending',
      now(),
      now() + interval '30 minutes'
    from public.books b
    cross join public.borrowers br
    where b.id = p_book
      and br.id = p_borrower
    returning id into v_id;

    return v_id;
  end;
$$;

create or replace function public.staff_checkout(
  p_borrower text,
  p_book text,
  p_issued date,
  p_due date
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_max_books integer;
  v_active_loans integer;
begin
  if not exists (
    select 1 from public.borrowers
    where id = p_borrower and status = 'Active'
  ) then
    raise exception 'This member account is not active.';
  end if;

  if exists (
    select 1 from public.transactions
    where borrower_id = p_borrower
      and book_id = p_book
      and status in ('Borrowed', 'Overdue')
  ) then
    raise exception 'This member already has this book checked out.';
  end if;

  select coalesce(max_books, 3)
  into v_max_books
  from public.library_settings
  where id = 1;

  select count(*)::integer
  into v_active_loans
  from public.transactions
  where borrower_id = p_borrower
    and status in ('Borrowed', 'Overdue');

  if v_active_loans >= v_max_books then
    raise exception 'This member has reached the %-book limit.', v_max_books;
  end if;

  -- Reserve the copy atomically so two staff actions cannot check out
  -- the same last available copy.
  update public.books
  set available = available - 1, borrowed = borrowed + 1
  where id = p_book and available > 0;

  if not found then
    raise exception 'This book is no longer available.';
  end if;

  insert into public.transactions (
    id, borrower_id, borrower, book_id, title, issued, due, status, requested_at
  )
  select
    'TRX-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || floor(random() * 10000)::int,
    p_borrower, br.name, p_book, b.title, p_issued, p_due, 'Borrowed', now()
  from public.borrowers br
  cross join public.books b
  where br.id = p_borrower and b.id = p_book
  returning id into v_id;

  update public.borrowers
  set borrowed = coalesce(borrowed, 0) + 1
  where id = p_borrower;

  return v_id;
end;
$$;

create or replace function public.confirm_borrow(p_tx text)
returns void
language plpgsql
security definer
set search_path = public
as $$
  begin
    update public.books b
    set available = b.available - 1,
        borrowed = b.borrowed + 1
    from public.transactions t
    where t.id = p_tx
      and t.book_id = b.id
      and t.status = 'Pending'
      and b.available > 0;

    if not found then
      raise exception 'This book is no longer available.';
    end if;

    update public.transactions
    set status = 'Borrowed', claim_expires_at = null
    where id = p_tx;

    update public.borrowers br
    set borrowed = coalesce(br.borrowed, 0) + 1
    from public.transactions t
    where t.id = p_tx and t.borrower_id = br.id;
  end;
$$;

create or replace function public.return_book(p_tx text)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
  declare
    v_fine numeric;
  begin
    update public.transactions
    set status = 'Returned', returned = current_date,
        fine = coalesce(fine, 0) + greatest(0, (current_date - due) * 5)
    where id = p_tx
    returning fine into v_fine;

    update public.books b
    set available = b.available + 1,
        borrowed = greatest(0, b.borrowed - 1)
    from public.transactions t
    where t.id = p_tx and t.book_id = b.id and t.status = 'Returned';

    return coalesce(v_fine, 0);
  end;
$$;

create or replace function public.cancel_request(p_tx text)
returns void
language plpgsql
security definer
set search_path = public
as $$
  begin
    update public.transactions
    set status = 'Cancelled', cancelled_at = now()
    where id = p_tx and status = 'Pending';
  end;
$$;

grant execute on function public.expire_pending() to anon, authenticated;
grant execute on function public.mark_overdue() to anon, authenticated;
grant execute on function public.request_borrow(text, text, date, date) to anon, authenticated;
grant execute on function public.staff_checkout(text, text, date, date) to anon, authenticated;
grant execute on function public.confirm_borrow(text) to anon, authenticated;
grant execute on function public.return_book(text) to anon, authenticated;
grant execute on function public.cancel_request(text) to anon, authenticated;

-- BOOKHUB currently uses its own application-level login, so browser requests
-- use the Supabase anon role. These policies allow the app to persist records.
-- Replace these with user-scoped policies before exposing the app publicly.
alter table public.books enable row level security;
alter table public.borrowers enable row level security;
alter table public.staff enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.library_settings enable row level security;

drop policy if exists "bookhub anon books" on public.books;
create policy "bookhub anon books" on public.books for all to anon, authenticated using (true) with check (true);

drop policy if exists "bookhub anon borrowers" on public.borrowers;
create policy "bookhub anon borrowers" on public.borrowers for all to anon, authenticated using (true) with check (true);

drop policy if exists "bookhub anon staff" on public.staff;
create policy "bookhub anon staff" on public.staff for all to anon, authenticated using (true) with check (true);

drop policy if exists "bookhub anon transactions" on public.transactions;
create policy "bookhub anon transactions" on public.transactions for all to anon, authenticated using (true) with check (true);

drop policy if exists "bookhub anon notifications" on public.notifications;
create policy "bookhub anon notifications" on public.notifications for all to anon, authenticated using (true) with check (true);

drop policy if exists "bookhub anon library settings" on public.library_settings;
create policy "bookhub anon library settings" on public.library_settings for all to anon, authenticated using (true) with check (true);
