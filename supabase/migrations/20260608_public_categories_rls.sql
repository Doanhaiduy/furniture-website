begin;

-- Grant select to public (anon & authenticated) roles
grant select on table public.product_categories to anon, authenticated;
grant select on table public.product_category_translations to anon, authenticated;
grant select on table public.blog_categories to anon, authenticated;
grant select on table public.blog_category_translations to anon, authenticated;

-- Create public select policies for product categories
create policy product_categories_public_select on public.product_categories
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

create policy product_category_translations_public_select on public.product_category_translations
  for select to anon, authenticated
  using (true);

-- Create public select policies for blog categories
create policy blog_categories_public_select on public.blog_categories
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

create policy blog_category_translations_public_select on public.blog_category_translations
  for select to anon, authenticated
  using (true);

commit;
