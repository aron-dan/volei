-- Vôlei 1.0.1-alpha — banco de dados completo (Supabase / Postgres)
-- Rode este arquivo inteiro uma única vez, no SQL Editor de um projeto NOVO.
-- Acesso totalmente aberto de propósito (grupo de amigos). Ver "Segurança" na documentação.

-- 1) jogadores -------------------------------------------------------------
create table players (
  id uuid primary key default gen_random_uuid(),
  nome text,
  vulgo text,
  caracteristica text,
  foto_url text,
  vai_jogar boolean default false,
  created_at timestamptz default now()
);

-- 2) avaliações (um jogador avalia outro, notas de 1 a 5) -------------------
create table ratings (
  id uuid primary key default gen_random_uuid(),
  avaliador_id uuid references players(id) on delete cascade,
  avaliado_id uuid references players(id) on delete cascade,
  ataque int check (ataque between 1 and 5),
  recepcao int check (recepcao between 1 and 5),
  levantamento int check (levantamento between 1 and 5),
  saque int check (saque between 1 and 5),
  mobilidade int check (mobilidade between 1 and 5),
  unique (avaliador_id, avaliado_id)
);

-- 3) partida publicada (sempre uma única linha, id = 1) ---------------------
create table partida (
  id int primary key default 1 check (id = 1),
  times jsonb not null default '[]',
  atualizado timestamptz default now()
);
insert into partida (id) values (1);

-- 4) PIN de entrada (1.0.1-alpha) -------------------------------------------
-- Tabela separada de "players" para o PIN não aparecer na visão player_stats.
-- definido = false: o jogador ainda vai criar o PIN dele no próximo acesso.
create table pins (
  player_id uuid primary key references players(id) on delete cascade,
  pin text not null default '0000',
  definido boolean not null default false
);

-- 5) visão com as médias das notas (nota sem avaliação vale 3) --------------
-- Atenção: p.* é expandido na criação. Se criar coluna nova em players, recrie a visão.
create view player_stats with (security_invoker = true) as
select p.*,
  round(coalesce(avg(r.ataque), 3), 1) as ataque,
  round(coalesce(avg(r.recepcao), 3), 1) as recepcao,
  round(coalesce(avg(r.levantamento), 3), 1) as levantamento,
  round(coalesce(avg(r.saque), 3), 1) as saque,
  round(coalesce(avg(r.mobilidade), 3), 1) as mobilidade,
  round(
    coalesce(avg(r.ataque), 3) + coalesce(avg(r.recepcao), 3) + coalesce(avg(r.levantamento), 3)
    + coalesce(avg(r.saque), 3) + coalesce(avg(r.mobilidade), 3), 1) as total,
  count(r.id) as avaliacoes
from players p left join ratings r on r.avaliado_id = p.id
group by p.id;

-- 6) acesso aberto (sem login) ----------------------------------------------
alter table players enable row level security;
alter table ratings enable row level security;
alter table partida enable row level security;
alter table pins enable row level security;
create policy "aberto" on players for all using (true) with check (true);
create policy "aberto" on ratings for all using (true) with check (true);
create policy "aberto" on partida for all using (true) with check (true);
create policy "aberto" on pins for all using (true) with check (true);

-- 7) fotos (bucket público para leitura) ------------------------------------
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true);
create policy "fotos leitura" on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos envio" on storage.objects for insert with check (bucket_id = 'fotos');
create policy "fotos troca" on storage.objects for update using (bucket_id = 'fotos');
create policy "fotos apagar" on storage.objects for delete using (bucket_id = 'fotos');

-- ---------------------------------------------------------------------------
-- OPCIONAL — começar uma nova temporada (não rode junto com o resto!)
-- Zera avaliações, fotos, presença e a partida publicada. Depois apague os
-- arquivos de foto no painel Storage (o SQL não consegue apagá-los).
--
-- delete from ratings;
-- update players set foto_url = null, vai_jogar = false;
-- update partida set times = '[]', atualizado = now() where id = 1;
--
-- OPCIONAL — mandar todo mundo criar o PIN de novo:
-- update pins set pin = '0000', definido = false;
-- ---------------------------------------------------------------------------
