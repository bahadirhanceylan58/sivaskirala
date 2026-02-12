-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS (Items)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  category text not null, -- 'organizasyon', 'elektronik', 'giyim', etc.
  price_per_day decimal(10,2) not null,
  deposit_amount decimal(10,2) default 0,
  images text[] default '{}',
  location text default 'Sivas Merkez',
  status text default 'active' check (status in ('active', 'rented', 'maintenance')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BOOKINGS (Reservations)
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) not null,
  renter_id uuid references public.profiles(id) not null,
  start_date date not null,
  end_date date not null,
  total_price decimal(10,2) not null,
  commission_fee decimal(10,2) default 0, -- Platform fee
  status text default 'pending' check (status in ('pending', 'approved', 'paid', 'completed', 'cancelled')),
  payment_method text check (payment_method in ('online', 'cash_on_delivery')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Security)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.bookings enable row level security;

-- Policies (Simplified for start)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Users can insert their own products" on public.products for insert with check (auth.uid() = owner_id);
create policy "Owners can update own products" on public.products for update using (auth.uid() = owner_id);
