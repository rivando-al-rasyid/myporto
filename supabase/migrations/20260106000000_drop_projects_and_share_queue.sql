-- Removes the projects CMS and the social share queue.
-- /projects now lists public GitHub repositories; sharing is manual via the share buttons.

drop trigger if exists enqueue_blog_share on public.blog_posts;
drop function if exists public.enqueue_blog_share();

drop table if exists public.queue_share_posts;
drop table if exists public.queue_share;
drop table if exists public.project_categories;
drop table if exists public.projects cascade;

drop function if exists public.queue_item_has_image(uuid, uuid);
drop function if exists public.reset_queue_platforms(uuid);
drop function if exists public.seed_queue_platforms();
drop function if exists public.sync_queue_posted();
drop function if exists public.queue_is_posted_changed();
drop function if exists public.request_share(uuid, uuid);
