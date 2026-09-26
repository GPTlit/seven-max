create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, full_name text, avatar_url text, phone text,
  created_at timestamptz default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile upd" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile ins" on public.profiles for insert to authenticated with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email,full_name,avatar_url)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'),new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles(user_id,role) values (new.id,'user');
  if lower(new.email) in ('salemmoustapha15@gmail.com','se7enm4x@gmail.com') then
    insert into public.user_roles(user_id,role) values (new.id,'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null, title_ar text, genre text, duration text,
  rating numeric(3,1), age_rating text, poster_url text, trailer_url text,
  description text, description_ar text, cast_list text[] default '{}',
  featured boolean default false, early_booking boolean default false,
  created_at timestamptz default now()
);
create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid references public.movies(id) on delete cascade not null,
  date date not null, time time not null,
  room text default 'Salle 1', price integer not null default 150,
  created_at timestamptz default now()
);
create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null, name_ar text, description text,
  price integer not null, image_url text, category text default 'snack'
);
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null, body text, image_url text, link text,
  kind text default 'banner', active boolean default true,
  created_at timestamptz default now()
);
grant select on public.movies, public.screenings, public.food_items, public.announcements to anon, authenticated;
grant insert, update, delete on public.movies, public.screenings, public.food_items, public.announcements to authenticated;
grant all on public.movies, public.screenings, public.food_items, public.announcements to service_role;
alter table public.movies enable row level security;
alter table public.screenings enable row level security;
alter table public.food_items enable row level security;
alter table public.announcements enable row level security;
create policy "pub read" on public.movies for select using (true);
create policy "adm write" on public.movies for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "pub read" on public.screenings for select using (true);
create policy "adm write" on public.screenings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "pub read" on public.food_items for select using (true);
create policy "adm write" on public.food_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "pub read" on public.announcements for select using (active or public.has_role(auth.uid(),'admin'));
create policy "adm write" on public.announcements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  screening_id uuid references public.screenings(id) on delete cascade not null,
  seats text[] not null,
  quantity integer not null default 1,
  total_amount integer not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled','admitted')),
  payment_method text,
  full_name text, phone text, whatsapp text, receipt_path text,
  booking_ref text unique not null default ('SVX-' || to_char(now(),'YYYYMMDD') || '-' || lpad((floor(random()*100000))::text,5,'0')),
  admitted_at timestamptz,
  created_at timestamptz default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "own read" on public.bookings for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own insert" on public.bookings for insert to authenticated with check (user_id=auth.uid() and status='pending');
create policy "admin update" on public.bookings for update to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.get_occupied_seats(_screening uuid) returns text[] language sql stable security definer set search_path=public as $$
  select coalesce(array_agg(s), '{}') from public.bookings b, unnest(b.seats) s where b.screening_id=_screening and b.status in ('pending','approved','admitted')
$$;
grant execute on function public.get_occupied_seats(uuid) to anon, authenticated;

create or replace function public.check_seats() returns trigger language plpgsql security definer set search_path=public as $$
declare p int;
begin
  if exists (select 1 from public.bookings b, unnest(b.seats) s where b.screening_id=new.screening_id and b.status in ('pending','approved','admitted') and s = any(new.seats)) then
    raise exception 'SEATS_TAKEN';
  end if;
  select sc.price into p from public.screenings sc where sc.id=new.screening_id;
  new.quantity := array_length(new.seats,1);
  new.total_amount := new.quantity * coalesce(p,150);
  return new;
end; $$;
create trigger bookings_check before insert on public.bookings for each row execute procedure public.check_seats();

create table public.food_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  booking_id uuid references public.bookings(id) on delete set null,
  items jsonb not null, seat_info text,
  status text not null default 'preparing' check (status in ('preparing','on_the_way','delivered')),
  total_amount integer not null default 0,
  created_at timestamptz default now()
);
grant select, insert, update on public.food_orders to authenticated;
grant all on public.food_orders to service_role;
alter table public.food_orders enable row level security;
create policy "own read" on public.food_orders for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own insert" on public.food_orders for insert to authenticated with check (user_id=auth.uid() and status='preparing');
create policy "admin update" on public.food_orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique default auth.uid(),
  plan text default 'vip',
  status text not null default 'pending' check (status in ('pending','active','expired','rejected')),
  companion_name text, payment_method text, receipt_path text, phone text,
  valid_until date,
  created_at timestamptz default now()
);
grant select, insert, update on public.memberships to authenticated;
grant all on public.memberships to service_role;
alter table public.memberships enable row level security;
create policy "own read" on public.memberships for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own insert" on public.memberships for insert to authenticated with check (user_id=auth.uid() and status='pending');
create policy "admin update" on public.memberships for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.hall_rentals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null, phone text not null, email text,
  event_type text, event_date date, guests integer, message text,
  status text not null default 'new',
  created_at timestamptz default now()
);
grant select, insert, update on public.hall_rentals to authenticated;
grant insert on public.hall_rentals to anon;
grant all on public.hall_rentals to service_role;
alter table public.hall_rentals enable row level security;
create policy "anyone insert" on public.hall_rentals for insert to anon, authenticated with check (status='new' and (user_id is null or user_id=auth.uid()));
create policy "own read" on public.hall_rentals for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.hall_rentals for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null, body text, read boolean default false,
  created_at timestamptz default now()
);
grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "read own or broadcast" on public.notifications for select to authenticated using (user_id is null or user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin insert" on public.notifications for insert to authenticated with check (public.has_role(auth.uid(),'admin'));

alter publication supabase_realtime add table public.food_orders;
alter publication supabase_realtime add table public.bookings;

create policy "receipts own upload" on storage.objects for insert to authenticated with check (bucket_id='receipts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "receipts read" on storage.objects for select to authenticated using (bucket_id='receipts' and ((storage.foldername(name))[1]=auth.uid()::text or public.has_role(auth.uid(),'admin')));

insert into public.movies (title,title_ar,genre,duration,rating,age_rating,description,description_ar,cast_list,featured,trailer_url,poster_url) values
('Dune: Part Two','كثبان الرمال: الجزء الثاني','Science-Fiction • Action','2h 46min',8.8,'12+','Paul Atréides s''allie avec les Fremen pour mener une guerre contre ceux qui ont détruit sa famille.','يتحالف بول أتريديس مع الفريمن لخوض حرب ضد من دمروا عائلته.','{Timothée Chalamet,Zendaya,Rebecca Ferguson,Austin Butler}',true,'https://www.youtube.com/embed/Way9Dexny3w','/assets/posters/dune.jpg'),
('John Wick: Chapter 4','جون ويك: الفصل 4','Action • Thriller','2h 49min',7.7,'16+','John Wick découvre un chemin pour vaincre la Grande Table.','يكتشف جون ويك طريقاً لهزيمة الطاولة العليا.','{Keanu Reeves,Donnie Yen,Bill Skarsgård}',true,'https://www.youtube.com/embed/qEVUtrk8_B4','/assets/posters/johnwick.jpg'),
('Kung Fu Panda 4','كونغ فو باندا 4','Animation • Comédie','1h 34min',6.9,'Tous','Po doit former un nouveau Guerrier Dragon.','على بو أن يدرّب محارب تنين جديد.','{Jack Black,Awkwafina,Viola Davis}',true,'https://www.youtube.com/embed/_inKs4eeHiI','/assets/posters/panda.jpg'),
('Inside Out 2','قلباً وقالباً 2','Animation • Famille','1h 36min',7.8,'Tous','Riley entre dans l''adolescence et de nouvelles émotions arrivent.','تدخل رايلي مرحلة المراهقة وتظهر مشاعر جديدة.','{Amy Poehler,Maya Hawke}',false,'https://www.youtube.com/embed/LEjhY15eCx0','/assets/posters/insideout.jpg');

insert into public.screenings (movie_id,date,time,room)
select m.id, (current_date + d), t::time, 'Salle ' || (1 + (d % 2))
from public.movies m, generate_series(0,6) d, unnest(array['14:00','17:00','20:00','22:30']) t;

insert into public.food_items (name,name_ar,description,price,category,image_url) values
('Popcorn Caramel','فشار بالكراميل','Grand format',80,'snack','/assets/food/popcorn.jpg'),
('Popcorn Salé','فشار مملح','Grand format',70,'snack','/assets/food/popcorn.jpg'),
('Coca-Cola','كوكا كولا','50cl',40,'drink','/assets/food/soda.jpg'),
('Jus d''orange','عصير برتقال','Frais',50,'drink','/assets/food/juice.jpg'),
('Nachos Fromage','ناتشوز بالجبن','Sauce cheddar',90,'snack','/assets/food/nachos.jpg'),
('Menu Duo','قائمة ثنائية','2 popcorns + 2 boissons',200,'combo','/assets/food/combo.jpg');

insert into public.announcements (title,body,kind) values ('Bienvenue à Seven Max Cinéma','Réservez vos places en ligne et payez via Bankily, Sedad ou Masrivi.','banner');