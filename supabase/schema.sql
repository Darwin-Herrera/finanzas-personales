-- =========================================================
-- MIS FINANZAS - ESQUEMA SUPABASE
-- Ejecutar completo en: Supabase > SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bank text,
  last4 text,
  credit_limit numeric(14,2),
  currency text not null default 'HNL' check (currency in ('HNL','USD')),
  closing_day integer check (closing_day between 1 and 31),
  payment_day integer check (payment_day between 1 and 31),
  created_at timestamptz not null default now()
);

create table if not exists public.fixed_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Servicios',
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'HNL' check (currency in ('HNL','USD')),
  exchange_rate numeric(14,4) not null default 1 check (exchange_rate > 0),
  due_day integer not null default 1 check (due_day between 1 and 28),
  card_id uuid references public.cards(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  category text,
  movement_type text not null default 'expense'
    check (movement_type in ('income','expense','cash_withdrawal','fixed_payment','card_payment')),
  transaction_date date not null default current_date,
  currency text not null default 'HNL' check (currency in ('HNL','USD')),
  amount numeric(14,2) not null check (amount > 0),
  exchange_rate numeric(14,4) not null default 1 check (exchange_rate > 0),
  amount_hnl numeric(14,2) not null check (amount_hnl >= 0),
  card_id uuid references public.cards(id) on delete set null,
  fixed_payment_id uuid references public.fixed_payments(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- Si ya habías ejecutado una versión anterior del proyecto,
-- actualizamos la restricción para permitir también INGRESOS.
alter table public.transactions
  drop constraint if exists transactions_movement_type_check;

alter table public.transactions
  add constraint transactions_movement_type_check
  check (movement_type in ('income','expense','cash_withdrawal','fixed_payment','card_payment'));

create index if not exists idx_transactions_user_date
on public.transactions(user_id, transaction_date desc);

create index if not exists idx_cards_user
on public.cards(user_id);

create index if not exists idx_fixed_user
on public.fixed_payments(user_id);

-- ==========================
-- ROW LEVEL SECURITY (RLS)
-- ==========================

alter table public.cards enable row level security;
alter table public.fixed_payments enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "cards_select_own" on public.cards;
drop policy if exists "cards_insert_own" on public.cards;
drop policy if exists "cards_update_own" on public.cards;
drop policy if exists "cards_delete_own" on public.cards;

create policy "cards_select_own"
on public.cards for select
using (auth.uid() = user_id);

create policy "cards_insert_own"
on public.cards for insert
with check (auth.uid() = user_id);

create policy "cards_update_own"
on public.cards for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "cards_delete_own"
on public.cards for delete
using (auth.uid() = user_id);

drop policy if exists "fixed_select_own" on public.fixed_payments;
drop policy if exists "fixed_insert_own" on public.fixed_payments;
drop policy if exists "fixed_update_own" on public.fixed_payments;
drop policy if exists "fixed_delete_own" on public.fixed_payments;

create policy "fixed_select_own"
on public.fixed_payments for select
using (auth.uid() = user_id);

create policy "fixed_insert_own"
on public.fixed_payments for insert
with check (auth.uid() = user_id);

create policy "fixed_update_own"
on public.fixed_payments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "fixed_delete_own"
on public.fixed_payments for delete
using (auth.uid() = user_id);

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "transactions_select_own"
on public.transactions for select
using (auth.uid() = user_id);

create policy "transactions_insert_own"
on public.transactions for insert
with check (auth.uid() = user_id);

create policy "transactions_update_own"
on public.transactions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transactions_delete_own"
on public.transactions for delete
using (auth.uid() = user_id);
