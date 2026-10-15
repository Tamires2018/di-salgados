-- Execute no SQL Editor do projeto Supabase antes de publicar o frontend.
create extension if not exists pgcrypto with schema extensions;

create table public.store_status (
  id integer primary key check (id = 1),
  manually_closed boolean not null default false
);
insert into public.store_status (id) values (1);
alter table public.store_status enable row level security;
create policy "Public can read store status" on public.store_status
  for select to anon, authenticated using (true);
grant select on public.store_status to anon, authenticated;
revoke insert, update, delete on public.store_status from anon, authenticated;

-- Compatibilidade com o login administrativo atual. Nunca exponha este hash via API.
create table public.store_admin_credentials (
  id integer primary key check (id = 1),
  password_hash text not null
);
alter table public.store_admin_credentials enable row level security;
revoke all on public.store_admin_credentials from anon, authenticated;
insert into public.store_admin_credentials values
  (1, extensions.crypt('202518', extensions.gen_salt('bf')));

create function public.set_store_closed(p_closed boolean, p_password text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_closed is null or p_password is null or not exists (
    select 1 from public.store_admin_credentials
    where id = 1 and password_hash = extensions.crypt(p_password, password_hash)
  ) then
    raise exception 'Senha de administrador incorreta.';
  end if;
  -- Serializa a alteração com a criação de pedidos em andamento.
  perform pg_advisory_xact_lock(741014);
  update public.store_status set manually_closed = p_closed where id = 1;
end;
$$;
revoke all on function public.set_store_closed(boolean, text) from public;
grant execute on function public.set_store_closed(boolean, text) to anon, authenticated;

create function public.check_manual_store_closure()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(741014);
  if exists (select 1 from public.store_status where id = 1 and manually_closed) then
    raise exception 'Estamos temporariamente fechados. Os pedidos estão pausados.';
  end if;
  return new;
end;
$$;
revoke all on function public.check_manual_store_closure() from public;
create trigger check_manual_store_closure before insert on public.orders
  for each row execute function public.check_manual_store_closure();
