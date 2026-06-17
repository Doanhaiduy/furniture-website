SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict b7329e76fz1hOlhcW1HulQrf415aAuQ5pGlqcQSA3RCTrdIXUc9Ah4HgAI8dNfX

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'author@phuongdong.vn', '$2a$06$RTgQQ9GV7L0Zn3EoAFxAF.ze7I/jSfojyHPZ06VShQIqqKWtfL1Xm', '2026-06-14 08:09:45.539508+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Tác Giả Demo"}', NULL, NULL, NULL, NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "full_name", "role", "is_active", "last_login_at", "created_at", "updated_at", "deleted_at") VALUES
	('00000000-0000-0000-0000-000000000001', 'author@phuongdong.vn', 'Tác Giả Demo', 'editor', true, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: ai_drafts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."blog_categories" ("id", "status", "sort_order", "created_by", "updated_by", "published_at", "created_at", "updated_at", "deleted_at") VALUES
	('a060d24c-756a-46de-9cd7-1c2123191da2', 'published', 10, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."media_assets" ("id", "storage_provider", "bucket", "object_path", "cloudinary_public_id", "public_url", "resource_type", "mime_type", "format", "size_bytes", "width", "height", "duration_seconds", "owner_context", "status", "uploaded_by", "created_at", "updated_at", "deleted_at") VALUES
	('00000000-0000-0000-0000-000000000101', 'cloudinary', NULL, NULL, 'showroom/hero', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1234567890/showroom/hero.jpg', 'image', 'image/jpeg', 'jpg', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000102', 'cloudinary', NULL, NULL, 'showroom/showroom', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424086/showroom/showroom.jpg', 'image', 'image/jpeg', 'jpg', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000103', 'cloudinary', NULL, NULL, 'showroom/woodWall', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424088/showroom/woodWall.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000104', 'cloudinary', NULL, NULL, 'showroom/sofa', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424089/showroom/sofa.jpg', 'image', 'image/jpeg', 'jpg', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000105', 'cloudinary', NULL, NULL, 'showroom/texture', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424090/showroom/texture.jpg', 'image', 'image/jpeg', 'jpg', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000106', 'cloudinary', NULL, NULL, 'showroom/room', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424091/showroom/room.jpg', 'image', 'image/jpeg', 'jpg', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000107', 'cloudinary', NULL, NULL, 'showroom/table', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424092/showroom/table.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000108', 'cloudinary', NULL, NULL, 'showroom/chair', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424093/showroom/chair.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000109', 'cloudinary', NULL, NULL, 'showroom/cabinet', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424095/showroom/cabinet.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000110', 'cloudinary', NULL, NULL, 'showroom/aboutHero', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424096/showroom/aboutHero.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000111', 'cloudinary', NULL, NULL, 'showroom/factory', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424097/showroom/factory.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000112', 'cloudinary', NULL, NULL, 'showroom/blog1', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424098/showroom/blog1.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000113', 'cloudinary', NULL, NULL, 'showroom/blog2', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424100/showroom/blog2.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('00000000-0000-0000-0000-000000000114', 'cloudinary', NULL, NULL, 'showroom/showroom2', 'https://res.cloudinary.com/dcmhbxcgq/image/upload/v1781424101/showroom/showroom2.png', 'image', 'image/png', 'png', 102400, NULL, NULL, NULL, NULL, 'active', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: blog_category_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."blog_category_translations" ("id", "category_id", "locale", "slug", "name", "description", "seo_title", "seo_description", "og_image_media_id", "created_at", "updated_at") VALUES
	('30ec58e0-bd33-4ecc-8c03-455657b4cbaa', 'a060d24c-756a-46de-9cd7-1c2123191da2', 'vi', 'kien-thuc-do-go', 'Kiến thức đồ gỗ', 'Các bài viết tư vấn kỹ thuật chọn gỗ.', NULL, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('0e07eb9f-0a3c-4ac7-aa06-f405ab7df2a3', 'a060d24c-756a-46de-9cd7-1c2123191da2', 'en', 'wood-knowledge', 'Wood knowledge', 'Articles on wood material selection and tips.', NULL, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."blog_posts" ("id", "category_id", "author_id", "cover_media_id", "status", "featured", "published_at", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES
	('8bda60fe-b8b0-4ce4-b3ad-92ee047643c7', 'a060d24c-756a-46de-9cd7-1c2123191da2', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000112', 'published', true, '2026-06-14 08:09:45.539508+00', NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('d0c24db9-ede4-4fc7-a10c-b722dea3fcea', 'a060d24c-756a-46de-9cd7-1c2123191da2', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000113', 'published', false, '2026-06-13 08:09:45.539508+00', NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('9e947c36-ba95-4ac2-a20e-357a5ddd8cfe', 'a060d24c-756a-46de-9cd7-1c2123191da2', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000105', 'published', false, '2026-06-12 08:09:45.539508+00', NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: blog_post_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."blog_post_translations" ("id", "post_id", "locale", "slug", "title", "excerpt", "body_json", "seo_title", "seo_description", "og_image_media_id", "search_text", "created_at", "updated_at") VALUES
	('05ec46e7-6c5c-4272-a9b8-aadbb351873c', '8bda60fe-b8b0-4ce4-b3ad-92ee047643c7', 'vi', 'bi-quyet-chon-go-oc-cho', 'Bí quyết chọn gỗ óc chó cho nội thất bền vững', 'Nhận biết vân gỗ, độ ẩm và quy trình xử lý bề mặt trước khi đầu tư.', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Gỗ óc chó cao cấp luôn là lựa chọn hàng đầu...", "type": "text"}]}]}', 'Bí quyết chọn gỗ óc chó', 'Bí quyết chọn gỗ óc chó cho nội thất', NULL, '''am'':17 ''be'':23 ''ben'':10 ''bi'':1,29,35 ''biet'':13 ''cho'':6,7,34,40,41 ''chon'':3,31,37 ''dau'':27 ''do'':16 ''go'':4,15,32,38 ''khi'':26 ''ly'':22 ''mat'':24 ''nhan'':12 ''noi'':8,42 ''oc'':5,33,39 ''quy'':19 ''quyet'':2,30,36 ''that'':9,43 ''trinh'':20 ''truoc'':25 ''tu'':28 ''va'':18 ''van'':14 ''vung'':11 ''xu'':21', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('ec273a10-cd5d-4412-ab98-28f1f23f060d', '8bda60fe-b8b0-4ce4-b3ad-92ee047643c7', 'en', 'bi-quyet-chon-go-oc-cho', 'How to choose walnut wood for lasting interiors', 'Understand grain, moisture and finishing process before investing.', '{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "Premium walnut wood is always a top choice...", "type": "text"}]}]}', 'How to choose walnut wood', 'How to choose walnut wood for interiors', NULL, '''and'':12 ''before'':15 ''choose'':3,19,24 ''finishing'':13 ''for'':6,27 ''grain'':10 ''how'':1,17,22 ''interiors'':8,28 ''investing'':16 ''lasting'':7 ''moisture'':11 ''process'':14 ''to'':2,18,23 ''understand'':9 ''walnut'':4,20,25 ''wood'':5,21,26', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('d43e89ff-07de-4d03-be24-5047139a1022', 'd0c24db9-ede4-4fc7-a10c-b722dea3fcea', 'vi', 'xu-huong-phong-tam-2026', 'Xu hướng phòng tắm khách sạn trong nhà ở hiện đại', 'Các lớp vật liệu, ánh sáng và phụ kiện giúp phòng tắm trở thành nghỉ dưỡng.', '{"type": "doc", "content": []}', 'Xu hướng phòng tắm khách sạn', 'Xu hướng phòng tắm khách sạn 2026', NULL, '''2026'':40 ''anh'':16 ''cac'':12 ''dai'':11 ''duong'':27 ''giup'':21 ''hien'':10 ''huong'':2,29,35 ''khach'':5,32,38 ''kien'':20 ''lieu'':15 ''lop'':13 ''nghi'':26 ''nha'':8 ''o'':9 ''phong'':3,22,30,36 ''phu'':19 ''san'':6,33,39 ''sang'':17 ''tam'':4,23,31,37 ''thanh'':25 ''tro'':24 ''trong'':7 ''va'':18 ''vat'':14 ''xu'':1,28,34', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('cb7f11cc-1a27-49db-9347-bedf1b27b32b', 'd0c24db9-ede4-4fc7-a10c-b722dea3fcea', 'en', 'xu-huong-phong-tam-2026', 'Hotel-inspired bathroom trends for modern homes', 'Material layers, lighting and accessories that turn bathrooms into wellness spaces.', '{"type": "doc", "content": []}', 'Hotel-inspired bathroom trends', 'Hotel-inspired bathroom trends', NULL, '''accessories'':13 ''and'':12 ''bathroom'':4,23,28 ''bathrooms'':16 ''for'':6 ''homes'':8 ''hotel'':2,21,26 ''hotel-inspired'':1,20,25 ''inspired'':3,22,27 ''into'':17 ''layers'':10 ''lighting'':11 ''material'':9 ''modern'':7 ''spaces'':19 ''that'':14 ''trends'':5,24,29 ''turn'':15 ''wellness'':18', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('846682ba-5b83-41a4-9cf2-c4c601e749bf', '9e947c36-ba95-4ac2-a20e-357a5ddd8cfe', 'vi', 'phoi-gach-go-va-da', 'Phối gạch, gỗ và đá để không gian có chiều sâu', 'Cách cân bằng bề mặt lạnh và ấm để không gian sang trọng nhưng vẫn gần gũi.', '{"type": "doc", "content": []}', 'Phối gạch gỗ và đá', 'Phối gạch gỗ và đá', NULL, '''am'':19 ''bang'':14 ''be'':15 ''cach'':12 ''can'':13 ''chieu'':10 ''co'':9 ''da'':5,33,38 ''de'':6,20 ''gach'':2,30,35 ''gan'':27 ''gian'':8,22 ''go'':3,31,36 ''gui'':28 ''khong'':7,21 ''lanh'':17 ''mat'':16 ''nhung'':25 ''phoi'':1,29,34 ''sang'':23 ''sau'':11 ''trong'':24 ''va'':4,18,32,37 ''van'':26', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('99fe445e-4ac6-4c05-8f75-bb5e21734d33', '9e947c36-ba95-4ac2-a20e-357a5ddd8cfe', 'en', 'phoi-gach-go-va-da', 'Combining tile, wood and stone for visual depth', 'Balance cool and warm surfaces to keep spaces premium yet welcoming.', '{"type": "doc", "content": []}', 'Combining tile wood and stone', 'Combining tile wood and stone', NULL, '''and'':4,11,23,28 ''balance'':9 ''combining'':1,20,25 ''cool'':10 ''depth'':8 ''for'':6 ''keep'':15 ''premium'':17 ''spaces'':16 ''stone'':5,24,29 ''surfaces'':13 ''tile'':2,21,26 ''to'':14 ''visual'':7 ''warm'':12 ''welcoming'':19 ''wood'':3,22,27 ''yet'':18', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: brand_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: content_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."content_pages" ("id", "key", "status", "published_at", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES
	('5f3ed2b9-1d25-467c-b57d-f156e30fed3f', 'home', 'published', '2026-06-14 08:09:45.539508+00', NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('8d6946f5-94be-437c-8720-7e99f1fa75b3', 'about', 'published', '2026-06-14 08:09:45.539508+00', NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: content_page_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."content_page_translations" ("id", "page_id", "locale", "slug", "title", "lead", "body_json", "seo_title", "seo_description", "og_image_media_id", "created_at", "updated_at") VALUES
	('706ab01b-5e1f-4f01-88f9-9fdf902df640', '5f3ed2b9-1d25-467c-b57d-f156e30fed3f', 'vi', 'trang-chu', 'Showroom Nội Thất Phương Đông', 'Nội thất gỗ và thiết bị vệ sinh cho nhà ở và công trình.', '{}', 'Showroom Nội Thất Phương Đông', 'Trang demo local cho showroom nội thất và thiết bị vệ sinh.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('dc0de38f-7365-4083-9283-53ca8d3a91bb', '5f3ed2b9-1d25-467c-b57d-f156e30fed3f', 'en', 'home', 'Phuong Dong Interior Showroom', 'Wooden furniture and sanitary equipment for homes and projects.', '{}', 'Phuong Dong Interior Showroom', 'Local demo homepage for furniture and sanitary equipment.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('a628fb85-79e1-4f40-a4d7-cf32a0755b3b', '8d6946f5-94be-437c-8720-7e99f1fa75b3', 'vi', 'gioi-thieu', 'Giới thiệu', 'Nội dung demo về tầm nhìn, sứ mệnh và năng lực.', '{}', 'Giới thiệu', 'Thông tin demo về showroom.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('b581e332-81c3-4ae8-9472-eda4115dbfb6', '8d6946f5-94be-437c-8720-7e99f1fa75b3', 'en', 'about', 'About', 'Demo content for vision, mission and capabilities.', '{}', 'About', 'Demo showroom information.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: integration_secrets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: media_asset_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page_media; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: page_section_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_attribute_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_attribute_definition_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_attribute_options; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_attribute_option_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_categories" ("id", "parent_id", "group_key", "image_media_id", "status", "sort_order", "created_by", "updated_by", "published_at", "created_at", "updated_at", "deleted_at") VALUES
	('9d052655-f047-422c-9c53-9f4ffab1c336', NULL, 'wooden_furniture', '00000000-0000-0000-0000-000000000103', 'published', 10, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('049139aa-bd88-4eb1-879f-0ec2792b8d80', NULL, 'sanitary_equipment', '00000000-0000-0000-0000-000000000106', 'published', 20, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "category_id", "reference_code", "status", "price_min", "price_max", "currency", "width", "depth", "height", "dimension_unit", "brand_series", "featured", "sort_order", "created_by", "updated_by", "published_at", "archived_at", "created_at", "updated_at", "deleted_at", "promo_price_min", "promo_price_max", "brand_id") VALUES
	('e1e9a74f-0283-4d2f-ab3c-10b4d0c29d40', '9d052655-f047-422c-9c53-9f4ffab1c336', 'PD-S2401', 'published', 45000000.00, 52000000.00, 'VND', NULL, NULL, NULL, 'mm', 'Heritage Collection', true, 10, NULL, NULL, '2026-06-14 08:09:45.539508+00', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL, NULL, NULL, NULL),
	('cd98287c-8229-4af8-a7d7-1c5e20e33125', '9d052655-f047-422c-9c53-9f4ffab1c336', 'PD-T2402', 'published', 12500000.00, 12500000.00, 'VND', NULL, NULL, NULL, 'mm', 'Atelier Series', true, 20, NULL, NULL, '2026-06-14 08:09:45.539508+00', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL, NULL, NULL, NULL),
	('1a1f9f6c-1c89-4ab4-8e3a-6476b0217048', '9d052655-f047-422c-9c53-9f4ffab1c336', 'PD-K2404', 'published', 22000000.00, 22000000.00, 'VND', NULL, NULL, NULL, 'mm', 'Atelier Series', false, 30, NULL, NULL, '2026-06-14 08:09:45.539508+00', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL, NULL, NULL, NULL),
	('9a12ee09-5919-42ad-bfae-72836059dbcb', '049139aa-bd88-4eb1-879f-0ec2792b8d80', 'PD-B2405', 'published', 12500000.00, 12500000.00, 'VND', NULL, NULL, NULL, 'mm', 'Wellness Collection', true, 40, NULL, NULL, '2026-06-14 08:09:45.539508+00', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL, NULL, NULL, NULL);


--
-- Data for Name: product_attribute_values; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_category_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_category_translations" ("id", "category_id", "locale", "slug", "name", "description", "seo_title", "seo_description", "og_image_media_id", "created_at", "updated_at") VALUES
	('d16b9dee-a63a-49e3-90ad-671ce9cc853f', '9d052655-f047-422c-9c53-9f4ffab1c336', 'vi', 'do-go-noi-that', 'Đồ gỗ nội thất', 'Nhóm sản phẩm đồ gỗ nội thất chất lượng cao.', 'Đồ gỗ nội thất', 'Danh mục đồ gỗ nội thất cao cấp Phương Đông.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('9fef30c9-054a-4327-8b86-e3916823b7b6', '9d052655-f047-422c-9c53-9f4ffab1c336', 'en', 'wooden-furniture', 'Wooden furniture', 'Premium wooden furniture collection.', 'Wooden furniture', 'Premium wooden furniture category by Phuong Dong.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('e8e8cde4-e44e-4ed6-a18b-1d7308154505', '049139aa-bd88-4eb1-879f-0ec2792b8d80', 'vi', 'thiet-bi-ve-sinh', 'Thiết bị vệ sinh', 'Nhóm sản phẩm thiết bị vệ sinh nhập khẩu cao cấp.', 'Thiết bị vệ sinh', 'Danh mục thiết bị vệ sinh showroom Phương Đông.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('4fd20f3f-a619-4a10-b151-9b89f98d72a3', '049139aa-bd88-4eb1-879f-0ec2792b8d80', 'en', 'sanitary-equipment', 'Sanitary equipment', 'Imported sanitary equipment collection.', 'Sanitary equipment', 'Premium sanitary equipment category by Phuong Dong.', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: product_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_media" ("id", "product_id", "media_id", "context", "is_primary", "sort_order", "created_at", "updated_at") VALUES
	('a23270d0-29bf-4961-b2d2-1e1113a1cb02', 'e1e9a74f-0283-4d2f-ab3c-10b4d0c29d40', '00000000-0000-0000-0000-000000000104', 'gallery', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('4e63215c-09e4-4dc5-b9a8-b3ee8a796a7b', 'e1e9a74f-0283-4d2f-ab3c-10b4d0c29d40', '00000000-0000-0000-0000-000000000105', 'gallery', false, 2, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('c319c5f7-5846-4b80-a1cd-b23dac2745e4', 'e1e9a74f-0283-4d2f-ab3c-10b4d0c29d40', '00000000-0000-0000-0000-000000000106', 'gallery', false, 3, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('4fd052d9-23dd-4d32-9665-c611f34d7b33', 'cd98287c-8229-4af8-a7d7-1c5e20e33125', '00000000-0000-0000-0000-000000000107', 'gallery', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('6acf7350-b799-4982-801f-c5622d20af7e', 'cd98287c-8229-4af8-a7d7-1c5e20e33125', '00000000-0000-0000-0000-000000000106', 'gallery', false, 2, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('9de164d8-e8db-4de5-99a2-a6afb092f3bc', '1a1f9f6c-1c89-4ab4-8e3a-6476b0217048', '00000000-0000-0000-0000-000000000109', 'gallery', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('d95ac1b1-4027-4d5b-9714-64e94f604b5a', '9a12ee09-5919-42ad-bfae-72836059dbcb', '00000000-0000-0000-0000-000000000106', 'gallery', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."promotions" ("id", "code", "discount_percentage", "status", "start_at", "end_at", "created_by", "updated_by", "created_at", "updated_at", "deleted_at", "cover_media_id", "combo_price", "original_price", "metadata_jsonb") VALUES
	('11111111-1111-1111-1111-111111111111', 'heritage-walnut-combo', 15.00, 'published', NULL, NULL, NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00', NULL, NULL, 68000000.00, 79500000.00, '{"color": "from-amber-500/20 to-orange-500/5", "tag_en": "Exclusive Package", "tag_vi": "Combo Độc Quyền", "items_en": ["Premium Velour upholstered Sofa Curve", "Luxurious Marble Round Calacatta Coffee Table", "Warm Minimalist Wood TV Cabinet in walnut veneer"], "items_vi": ["Sofa Curve Velour bọc vải cao cấp", "Bàn Trà Marble Round Calacatta cao cấp", "Kệ Tivi Minimalist Wood gỗ veneer óc chó trầm ấm"], "badgeColor": "bg-amber-500 text-black"}'),
	('22222222-2222-2222-2222-222222222222', 'wellness-bath-set', 18.00, 'published', NULL, NULL, NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00', NULL, NULL, 34500000.00, 42000000.00, '{"color": "from-emerald-500/20 to-teal-500/5", "tag_en": "Wellness Package", "tag_vi": "Gói Sức Khỏe", "items_en": ["24K Gold Plated Shower Set with thermostatic valve", "5-star hotel style American Freestanding Bathtub", "Minimalist Kohler Basin with anti-scale finish"], "items_vi": ["Sen Tắm Mạ Vàng 24K với van điều nhiệt cao cấp", "Bồn tắm American phong cách khách sạn 5 sao", "Lavabo Kohler tối giản chống bám bẩn vượt trội"], "badgeColor": "bg-emerald-500 text-white"}'),
	('33333333-3333-3333-3333-333333333333', 'porcelain-surface-pack', 20.00, 'published', NULL, NULL, NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00', NULL, NULL, 1200000.00, 1500000.00, '{"color": "from-blue-500/20 to-indigo-500/5", "tag_en": "Finishing Deal", "tag_vi": "Ưu Đãi Hoàn Thiện", "items_en": ["Large format Calacatta Marble look tiles 1200x2400 mm", "Heavy duty, scratch-resistant Porcelain tiles", "Free material coordination consultancy by architects"], "items_vi": ["Gạch Calacatta Marble khổ lớn 1200x2400 mm", "Gạch Porcelain chịu lực, chống trầy xước", "Tư vấn phối ghép vật liệu miễn phí từ KTS"], "badgeColor": "bg-blue-600 text-white"}');


--
-- Data for Name: product_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."product_translations" ("id", "product_id", "locale", "slug", "name", "summary", "description_json", "material", "price_display_text", "dimension_display_text", "seo_title", "seo_description", "og_image_media_id", "search_text", "created_at", "updated_at") VALUES
	('53bdc974-46d3-463f-a7d6-c5e9eb8d1571', 'e1e9a74f-0283-4d2f-ab3c-10b4d0c29d40', 'vi', 'sofa-curve-velour', 'Sofa Curve Velour', 'Sofa cao cấp bọc vải Velour với đường cong tinh tế.', '{"type": "doc", "content": []}', 'Gỗ sồi tự nhiên', '45,000,000 VND', '2400 x 950 x 850 mm', 'Sofa Curve Velour', 'Sofa cao cấp bọc vải Velour', NULL, '''000'':20,21 ''2400'':23 ''45'':19 ''850'':27 ''950'':25 ''boc'':7 ''cao'':5 ''cap'':6 ''cong'':12 ''curve'':2 ''duong'':11 ''go'':15 ''mm'':28 ''nhien'':18 ''sofa'':1,4 ''soi'':16 ''te'':14 ''tinh'':13 ''tu'':17 ''vai'':8 ''velour'':3,9 ''vnd'':22 ''voi'':10 ''x'':24,26', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('53da9b70-a42a-465c-89e7-a05f910ff6a3', 'e1e9a74f-0283-4d2f-ab3c-10b4d0c29d40', 'en', 'sofa-curve-velour', 'Sofa Curve Velour', 'Premium velour sofa with a soft curved silhouette.', '{"type": "doc", "content": []}', 'Natural oak', '45,000,000 VND', '2400 x 950 x 850 mm', 'Sofa Curve Velour', 'Premium velour sofa', NULL, '''000'':15,16 ''2400'':18 ''45'':14 ''850'':22 ''950'':20 ''a'':8 ''curve'':2 ''curved'':10 ''mm'':23 ''natural'':12 ''oak'':13 ''premium'':4 ''silhouette'':11 ''sofa'':1,6 ''soft'':9 ''velour'':3,5 ''vnd'':17 ''with'':7 ''x'':19,21', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('dd68fe50-88a4-442a-8b59-cfd5f128652f', 'cd98287c-8229-4af8-a7d7-1c5e20e33125', 'vi', 'ban-tra-marble-round', 'Bàn Trà Marble Round', 'Mặt đá marble Calacatta, chân gỗ walnut.', '{"type": "doc", "content": []}', 'Đá marble', '12,500,000 VND', 'Đường kính 900 mm', 'Bàn Trà Marble Round', 'Bàn Trà Marble Round', NULL, '''000'':16 ''12'':14 ''500'':15 ''900'':20 ''ban'':1 ''calacatta'':8 ''chan'':9 ''da'':6,12 ''duong'':18 ''go'':10 ''kinh'':19 ''marble'':3,7,13 ''mat'':5 ''mm'':21 ''round'':4 ''tra'':2 ''vnd'':17 ''walnut'':11', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('12447592-fe1d-4c0c-a666-a248eb9f167e', 'cd98287c-8229-4af8-a7d7-1c5e20e33125', 'en', 'ban-tra-marble-round', 'Marble Round Coffee Table', 'Calacatta marble top and walnut base.', '{"type": "doc", "content": []}', 'Marble', '12,500,000 VND', 'Diameter 900 mm', 'Marble Round Coffee Table', 'Marble Round Coffee Table', NULL, '''000'':14 ''12'':12 ''500'':13 ''900'':17 ''and'':8 ''base'':10 ''calacatta'':5 ''coffee'':3 ''diameter'':16 ''marble'':1,6,11 ''mm'':18 ''round'':2 ''table'':4 ''top'':7 ''vnd'':15 ''walnut'':9', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('b8ead5dd-f2ae-457a-8482-f3550192c484', '1a1f9f6c-1c89-4ab4-8e3a-6476b0217048', 'vi', 'ke-tivi-minimalist-wood', 'Kệ Tivi Minimalist Wood', 'Kệ tivi gỗ veneer tối màu với ngăn kéo giảm chấn.', '{"type": "doc", "content": []}', 'Veneer', '22,000,000 VND', '2200 mm', 'Kệ Tivi Minimalist Wood', 'Kệ Tivi Minimalist Wood', NULL, '''000'':18,19 ''22'':17 ''2200'':21 ''chan'':15 ''giam'':14 ''go'':7 ''ke'':1,5 ''keo'':13 ''mau'':10 ''minimalist'':3 ''mm'':22 ''ngan'':12 ''tivi'':2,6 ''toi'':9 ''veneer'':8,16 ''vnd'':20 ''voi'':11 ''wood'':4', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('fe99889d-e96f-4705-add6-9bd638ac3cd6', '1a1f9f6c-1c89-4ab4-8e3a-6476b0217048', 'en', 'ke-tivi-minimalist-wood', 'Minimalist Wood TV Cabinet', 'Dark veneer TV cabinet with soft-close drawers.', '{"type": "doc", "content": []}', 'Veneer', '22,000,000 VND', '2200 mm', 'Minimalist Wood TV Cabinet', 'Minimalist Wood TV Cabinet', NULL, '''000'':16,17 ''22'':15 ''2200'':19 ''cabinet'':4,8 ''close'':12 ''dark'':5 ''drawers'':13 ''minimalist'':1 ''mm'':20 ''soft'':11 ''soft-close'':10 ''tv'':3,7 ''veneer'':6,14 ''vnd'':18 ''with'':9 ''wood'':2', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('59f1ea0d-d474-42fd-b453-d03b040c802c', '9a12ee09-5919-42ad-bfae-72836059dbcb', 'vi', 'sen-tam-ma-vang-24k', 'Sen Tắm Mạ Vàng 24K', 'Bộ sen tắm mạ vàng với van điều nhiệt.', '{"type": "doc", "content": []}', 'Đồng thau', '12,500,000 VND', 'Tiêu chuẩn', 'Sen Tắm Mạ Vàng 24K', 'Sen Tắm Mạ Vàng 24K', NULL, '''000'':19 ''12'':17 ''24k'':5 ''500'':18 ''bo'':6 ''chuan'':22 ''dieu'':13 ''dong'':15 ''ma'':3,9 ''nhiet'':14 ''sen'':1,7 ''tam'':2,8 ''thau'':16 ''tieu'':21 ''van'':12 ''vang'':4,10 ''vnd'':20 ''voi'':11', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('7812f219-fc74-484c-afc2-9b73c5010173', '9a12ee09-5919-42ad-bfae-72836059dbcb', 'en', 'sen-tam-ma-vang-24k', '24K Gold Plated Shower Set', 'Gold plated shower set with thermostatic valve.', '{"type": "doc", "content": []}', 'Brass', '12,500,000 VND', 'Standard', '24K Gold Plated Shower Set', '24K Gold Plated Shower Set', NULL, '''000'':16 ''12'':14 ''24k'':1 ''500'':15 ''brass'':13 ''gold'':2,6 ''plated'':3,7 ''set'':5,9 ''shower'':4,8 ''standard'':18 ''thermostatic'':11 ''valve'':12 ''vnd'':17 ''with'':10', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: promotion_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: promotion_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."promotion_translations" ("id", "promotion_id", "locale", "title", "description", "seo_title", "seo_description", "created_at", "updated_at") VALUES
	('89e2c817-8b61-47a8-8717-e6a02f3de66a', '11111111-1111-1111-1111-111111111111', 'vi', 'Không Gian Phòng Khách Walnut Heritage', 'Tinh tuyển gỗ óc chó tự nhiên cho căn hộ cao cấp', NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00'),
	('be0478b0-011d-416d-8278-12ba687ab2a4', '11111111-1111-1111-1111-111111111111', 'en', 'Heritage Walnut Living Room Package', 'Curated natural walnut for premium apartments', NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00'),
	('a12d96b2-1370-4713-8f43-774338d5be86', '22222222-2222-2222-2222-222222222222', 'vi', 'Trọn Bộ Thiết Bị Phòng Tắm Wellness', 'Không gian spa thư giãn nhập khẩu chính hãng tiêu chuẩn Châu Âu', NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00'),
	('b0f0bf70-8327-4d99-a014-680c362be82e', '22222222-2222-2222-2222-222222222222', 'en', 'Wellness Master Bathroom Suite', 'Relaxing spa suite with European standards', NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00'),
	('20737f56-434e-4962-9c9a-66e05053c97e', '33333333-3333-3333-3333-333333333333', 'vi', 'Gói Gạch Ốp Lát Toàn Diện Grand Surface', 'Vật liệu cao cấp hoàn thiện bề mặt sang trọng, bền vững', NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00'),
	('98435bda-c010-46e8-8d01-c8204a9efe85', '33333333-3333-3333-3333-333333333333', 'en', 'Grand Surface Porcelain Tile Package', 'Premium materials for luxury and durable surfaces', NULL, NULL, '2026-06-14 08:09:45.635225+00', '2026-06-14 08:09:45.635225+00');


--
-- Data for Name: quote_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: quote_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."site_settings" ("id", "singleton_key", "logo_media_id", "favicon_media_id", "default_og_image_media_id", "contact_phone", "contact_email", "quote_sender_email", "updated_by", "created_at", "updated_at") VALUES
	('90b08a64-69e3-4d7c-ab12-cd6690b542ca', 'default', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '+84 000 000 000', 'hello@example.test', 'quotes@example.test', NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: quote_recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."quote_recipients" ("id", "site_settings_id", "email", "label", "is_active", "created_by", "created_at", "updated_at") VALUES
	('8643acc6-22c0-4731-9199-03bbbff0818d', '90b08a64-69e3-4d7c-ab12-cd6690b542ca', 'quotes@example.test', 'Local quote inbox', true, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: quote_request_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: quote_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: quote_status_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: showrooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."showrooms" ("id", "code", "hotline", "google_maps_embed_url", "google_maps_fallback_url", "latitude", "longitude", "status", "sort_order", "created_by", "updated_by", "published_at", "created_at", "updated_at", "deleted_at") VALUES
	('df8fb5ed-874f-4dc6-be46-03b689d69854', 'HN', '1900 1234', 'https://www.google.com/maps/embed?pb=hanoi', 'https://www.google.com/maps', NULL, NULL, 'published', 10, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('266b6faf-66bb-460b-afa6-79425d38257c', 'HCM', '1900 5678', 'https://www.google.com/maps/embed?pb=hcm', 'https://www.google.com/maps', NULL, NULL, 'published', 20, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL),
	('da0e77b5-03d8-40ca-9ba4-b7d7f74f167b', 'DN', '1900 8888', 'https://www.google.com/maps/embed?pb=danang', 'https://www.google.com/maps', NULL, NULL, 'published', 30, NULL, NULL, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00', NULL);


--
-- Data for Name: showroom_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."showroom_media" ("id", "showroom_id", "media_id", "is_primary", "sort_order", "created_at", "updated_at") VALUES
	('dc315f32-d1b3-4c8d-b9bd-8769e12f5c01', 'df8fb5ed-874f-4dc6-be46-03b689d69854', '00000000-0000-0000-0000-000000000102', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('d47cd7aa-4a19-4bac-a4b3-404c0cb9148a', '266b6faf-66bb-460b-afa6-79425d38257c', '00000000-0000-0000-0000-000000000114', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('5f11d8bf-12eb-4cfa-a33d-0de571771c15', 'da0e77b5-03d8-40ca-9ba4-b7d7f74f167b', '00000000-0000-0000-0000-000000000106', true, 1, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: showroom_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."showroom_translations" ("id", "showroom_id", "locale", "name", "address", "opening_hours", "created_at", "updated_at") VALUES
	('69a5b7b4-bcae-4e3e-b227-d038ac39e3bb', 'df8fb5ed-874f-4dc6-be46-03b689d69854', 'vi', 'Hà Nội - Flagship Store', '123 Trần Duy Hưng, Cầu Giấy, Hà Nội', '08:00 - 20:00 hằng ngày', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('a7646be9-106d-4fb4-9ffd-717cd445acb1', 'df8fb5ed-874f-4dc6-be46-03b689d69854', 'en', 'Hanoi Flagship Store', '123 Tran Duy Hung, Cau Giay, Hanoi', '08:00 - 20:00 daily', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('e5de8b78-8bd1-489a-b304-57b7417474b4', '266b6faf-66bb-460b-afa6-79425d38257c', 'vi', 'TP. Hồ Chí Minh', '456 Nguyễn Thị Minh Khai, Quận 1, TP. HCM', '08:30 - 19:30 hằng ngày', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('2937d4e7-cc7e-4086-bb1a-b094bbbf9535', '266b6faf-66bb-460b-afa6-79425d38257c', 'en', 'Ho Chi Minh City', '456 Nguyen Thi Minh Khai, District 1, HCMC', '08:30 - 19:30 daily', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('1df3948a-2b5a-4d48-a6c7-7e80d65959f3', 'da0e77b5-03d8-40ca-9ba4-b7d7f74f167b', 'vi', 'Đà Nẵng Experience Studio', '88 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', '09:00 - 18:00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('d72abb5b-8541-4055-aa92-1fd6ddaad546', 'da0e77b5-03d8-40ca-9ba4-b7d7f74f167b', 'en', 'Da Nang Experience Studio', '88 Nguyen Van Linh, Hai Chau, Da Nang', '09:00 - 18:00', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: site_setting_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."site_setting_translations" ("id", "site_settings_id", "locale", "brand_name", "contact_address", "seo_default_title", "seo_default_description", "created_at", "updated_at") VALUES
	('0811b209-94d6-4eb0-996c-ff6fafc8fa89', '90b08a64-69e3-4d7c-ab12-cd6690b542ca', 'vi', 'Showroom Nội Thất Phương Đông', 'Địa chỉ demo cho phát triển local', 'Showroom Nội Thất Phương Đông', 'Nội thất gỗ và thiết bị vệ sinh cho không gian sống.', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00'),
	('f077064f-7aad-4bfb-b6d2-f5fa4755a85e', '90b08a64-69e3-4d7c-ab12-cd6690b542ca', 'en', 'Phuong Dong Interior Showroom', 'Local development demo address', 'Phuong Dong Interior Showroom', 'Wooden furniture and sanitary equipment for homes and projects.', '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."social_links" ("id", "site_settings_id", "platform", "label", "url", "is_enabled", "share_enabled", "sort_order", "created_at", "updated_at") VALUES
	('4fe6a176-09c1-4b85-954d-c6fa277c0fd4', '90b08a64-69e3-4d7c-ab12-cd6690b542ca', 'facebook', 'Facebook', 'https://example.test/facebook', true, true, 10, '2026-06-14 08:09:45.539508+00', '2026-06-14 08:09:45.539508+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict b7329e76fz1hOlhcW1HulQrf415aAuQ5pGlqcQSA3RCTrdIXUc9Ah4HgAI8dNfX

RESET ALL;
