-- ===========================================================================
-- Danish Home Properties — seed data
-- ===========================================================================
-- Populates the site with an initial editorial catalogue so the storefront is
-- never empty. Every row here is ordinary database content: edit or delete it
-- from the admin dashboard at any time.
--
-- Photography: the URLs below point at the local image endpoint that ships with
-- this workspace. Replace them with your own photography (or upload through
-- Admin -> Properties) before going live.
--
-- Safe to re-run: existing slugs, agents and images are left untouched.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------
update public.site_settings
set business_name    = 'Danish Home Properties',
    tagline          = 'Exceptional homes across California''s most coveted addresses.',
    contact_email    = 'hello@danishhomeproperties.com',
    contact_phone    = '+1 (581) 238-7344',
    office_address   = '1234 Maple Street, Garden Grove, CA 92840, United States',
    about_text       = 'Danish Home Properties is a boutique brokerage built on a simple belief: extraordinary homes deserve extraordinary representation. We guide discerning buyers and sellers through California''s most architecturally significant properties — from Orange County estates to coastal retreats — with discretion, market intelligence and an unwavering standard of service.',
    hero_headline    = 'Discover Exceptional Properties',
    hero_subheadline = 'A curated collection of California''s finest homes, presented with discretion and care.',
    footer_note      = 'Danish Home Properties is an Equal Housing Opportunity brokerage.',
    social_links     = jsonb_build_object(
                         'instagram', 'https://instagram.com/danishhomeproperties',
                         'facebook',  'https://facebook.com/danishhomeproperties',
                         'linkedin',  'https://linkedin.com/company/danishhomeproperties',
                         'youtube',   'https://youtube.com/@danishhomeproperties'
                       ),
    updated_at       = now()
where id = 1;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function pg_temp.img(prompt text, size text default 'landscape_4_3')
returns text
language sql
immutable
as $$
  select '/api/ide/v1/text_to_image?prompt='
      || replace(replace(replace(replace(replace(replace(replace(replace(prompt,
           ' ', '%20'), ',', '%2C'), '&', '%26'), '?', '%3F'), '#', '%23'), '+', '%2B'), '/', '%2F'), '"', '%22')
      || '&image_size=' || size;
$$;

-- ---------------------------------------------------------------------------
-- Agents
-- ---------------------------------------------------------------------------
insert into public.agents (name, title, bio, email, phone, photo_url, license_number, specialties, sort_order)
select * from (values
  ('Sarah Danish', 'Founder & Principal Broker',
   'Sarah founded the firm in 2004 after a decade in architectural preservation. She has personally closed more than $1.4 billion in residential sales across California''s most distinguished neighborhoods, and is known for matching houses with the families who will love them longest.',
   'sarah@danishhomeproperties.com', '+1 (581) 238-7344',
   pg_temp.img('Professional editorial portrait photograph of an elegant confident woman in her early fifties, tailored ivory blazer, warm natural window light, neutral gray studio background, luxury real estate broker headshot, shallow depth of field', 'portrait_4_3'),
   'CA-0189420', array['Historic estates','Bel Air','Malibu','Off-market'], 1),

  ('Marcus Whitfield', 'Senior Global Advisor',
   'Marcus represents buyers relocating to California from London, New York and Hong Kong. Fluent in three languages and relentless about detail, he has built his practice on the belief that a move should feel like an arrival, not a transaction.',
   'marcus@danishhomeproperties.com', '+1 (581) 238-7344',
   pg_temp.img('Professional editorial portrait photograph of a distinguished Black man in his forties wearing a navy suit with no tie, confident relaxed expression, soft daylight, charcoal background, luxury real estate advisor headshot', 'portrait_4_3'),
   'CA-0211704', array['International buyers','Relocation','Penthouses'], 2),

  ('Elena Rose Bennett', 'Luxury Property Specialist',
   'Elena grew up in Pasadena and knows every tree-lined street across the Los Angeles basin. She specialises in architecturally significant homes — Craftsman, Georgian and mid-century — and the quiet restoration work that keeps them alive.',
   'elena@danishhomeproperties.com', '+1 (581) 238-7344',
   pg_temp.img('Professional editorial portrait photograph of a poised woman in her late thirties with dark wavy hair, cream silk blouse, soft warm lighting, pale gray background, luxury realtor headshot, elegant', 'portrait_4_3'),
   'CA-0162053', array['Historic homes','Pasadena','Santa Monica','Renovation'], 3),

  ('Daniel Okafor', 'Director, New Developments',
   'Daniel advises developers and buyers on California''s newest luxury towers and mixed-use communities. He has led the marketing and sell-out of eleven projects, and negotiates contract terms with an engineer''s precision.',
   'daniel@danishhomeproperties.com', '+1 (581) 238-7344',
   pg_temp.img('Professional editorial portrait photograph of a Black man in his early forties with short cropped hair and glasses, charcoal knit polo, natural studio lighting, dark neutral background, luxury real estate director headshot', 'portrait_4_3'),
   'CA-0183011', array['New construction','Condominiums','Investment'], 4)
) as t(name, title, bio, email, phone, photo_url, license_number, specialties, sort_order)
where not exists (select 1 from public.agents where public.agents.name = t.name);

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------
-- The enum columns are cast explicitly: a VALUES list types its columns as text,
-- and there is no implicit cast from text to an enum.
insert into public.properties (
  slug, title, description, price, price_period, street_address, city, state, zip_code,
  neighborhood, latitude, longitude, property_type, listing_status, bedrooms, bathrooms,
  square_feet, lot_size, lot_size_unit, year_built, amenities, is_featured, is_published, created_at
)
select
  t.slug, t.title, t.description, t.price, t.price_period, t.street_address, t.city,
  t.state, t.zip_code, t.neighborhood, t.latitude, t.longitude,
  t.property_type::public.property_type,
  t.listing_status::public.listing_status,
  t.bedrooms, t.bathrooms, t.square_feet, t.lot_size, t.lot_size_unit, t.year_built,
  t.amenities, t.is_featured, t.is_published, t.created_at
from (values
  (
    'tuxedo-park-estate', 'Bel Air Estate',
    'A 1928 Georgian estate reimagined for modern life. Twelve-foot ceilings, hand-carved limestone fireplaces and a slate-roofed loggia overlook nearly two acres of terraced gardens, a heated pool and a detached guest cottage. The kitchen was rebuilt in 2021 with a La Cornue range and a scullery that opens to the garden.',
    8450000, 'total', '1200 Stone Canyon Road', 'Los Angeles', 'CA', '90077',
    'Bel Air', 34.0900, -118.4600, 'estate', 'for_sale', 6, 7.5,
    11200, 1.82, 'acres', 1928,
    array['Heated pool','Guest cottage','Wine cellar','Elevator','Smart home','Terraced gardens','3-car garage','Whole-house generator','Gym','Screened porch'],
    true, true, now() - interval '9 days'
  ),
  (
    'buckhead-penthouse-the-charles', 'West Hollywood Penthouse',
    'A full-floor penthouse with 270-degree views from the Hollywood Hills to the Pacific. A private elevator opens directly into a gallery hall clad in honed Calacatta. The primary suite occupies its own wing, with a spa bath, dual dressing rooms and a morning terrace facing east.',
    4200000, 'total', '9200 Sunset Boulevard, Penthouse 41', 'West Hollywood', 'CA', '90069',
    'West Hollywood', 34.0900, -118.3700, 'penthouse', 'for_sale', 3, 3.5,
    4180, null, 'sqft', 2019,
    array['Private elevator','Concierge','Rooftop terrace','Floor-to-ceiling windows','Wine room','2 parking spaces','Spa bath','City views','Fitness centre','Valet'],
    true, true, now() - interval '14 days'
  ),
  (
    'sea-island-oceanfront-retreat', 'Malibu Oceanfront Retreat',
    'An oceanfront compound of cedar and stone, sited to catch the prevailing breeze through nine-foot sliding walls. Steps lead from the screened porch directly to the sand. The residence is offered largely furnished, with a guest wing that sleeps ten.',
    12900000, 'total', '21400 Pacific Coast Highway', 'Malibu', 'CA', '90265',
    'Malibu', 34.0200, -118.7800, 'villa', 'for_sale', 5, 6.5,
    8900, 1.24, 'acres', 2006,
    array['Oceanfront','Private boardwalk','Infinity pool','Guest wing','Summer kitchen','Outdoor shower','Elevator','Whole-house generator','3-car garage','Golf cart bay'],
    true, true, now() - interval '21 days'
  ),
  (
    'cashiers-mountain-lodge', 'Lake Tahoe Mountain Lodge',
    'Timber, stone and glass in equal measure, this lodge sits above the north shore with long views of the lake. A forty-foot great room window frames the water; the lower level holds a wine room, a bunk suite and a media lounge that walks out to a fire terrace and hot tub.',
    5750000, 'total', '880 North Lake Boulevard', 'Tahoe City', 'CA', '96145',
    'Lake Tahoe', 39.1900, -120.1400, 'villa', 'for_sale', 5, 5.5,
    7400, 4.61, 'acres', 2012,
    array['Mountain views','Hot tub','Wine room','Fire terrace','Trout stream','Bunk suite','Heated garage','Generator','Home theatre','Hiking trails'],
    false, true, now() - interval '27 days'
  ),
  (
    'historic-charleston-single-house', 'Santa Barbara Historic Estate',
    'A beautifully preserved 1840 hacienda-style estate on one of the Riviera''s most photographed streets. Heart-pine floors, twelve-over-twelve windows and three stacked verandas catch the ocean breeze. A walled garden with a fountain and a carriage house completes the property.',
    3650000, 'total', '1840 Alameda Padre Serra', 'Santa Barbara', 'CA', '93103',
    'The Riviera', 34.4300, -119.7000, 'townhouse', 'for_sale', 4, 3.5,
    3900, 0.21, 'acres', 1840,
    array['Historic district','Carriage house','Walled garden','Heart-pine floors','Stacked piazzas','Fountain','Original millwork','Guest suite','Off-street parking'],
    false, true, now() - interval '33 days'
  ),
  (
    'highlands-lakefront-compound', 'Lake Arrowhead Lakefront Compound',
    'Four lakefront acres with 320 feet of shoreline, a deep-water dock and a west-facing sunset porch. The main residence is a study in restraint — white oak, soapstone and hand-plastered walls — with a separate boathouse studio and a two-bedroom guest cabin.',
    6900000, 'total', '450 Willow Creek Road', 'Lake Arrowhead', 'CA', '92352',
    'Lake Arrowhead', 34.2400, -117.1800, 'estate', 'for_sale', 6, 7,
    9800, 4.10, 'acres', 2015,
    array['Lakefront','Deep-water dock','Boathouse studio','Guest cabin','Sunset porch','Stone fireplace','Wine cellar','Greenhouse','Chef kitchen','Generator'],
    true, true, now() - interval '6 days'
  ),
  (
    'alpharetta-golf-course-manor', 'Newport Beach Golf Course Manor',
    'Set on the eleventh fairway of a private club, this European-inspired manor offers a main-floor primary suite, a paneled study and a chef''s kitchen with a butler''s pantry. The terrace level holds a golf simulator, a wine room and a covered outdoor kitchen beside the saltwater pool.',
    2975000, 'total', '1720 Pacific Ridge Drive', 'Newport Beach', 'CA', '92660',
    'Newport Beach', 33.6200, -117.9300, 'house', 'for_sale', 5, 5.5,
    6200, 0.78, 'acres', 2004,
    array['Golf course frontage','Saltwater pool','Golf simulator','Outdoor kitchen','Wine room','Main-floor primary','3-car garage','Study','Fire pit','Smart home'],
    false, true, now() - interval '40 days'
  ),
  (
    'savannah-riverfront-townhome', 'San Diego Harborfront Townhome',
    'A four-storey townhome on the harbor with water views from every level. Ironwork balconies, exposed brick and a rooftop terrace give it the feel of a private club. Two deeded parking spaces are included in the sale.',
    2150000, 'total', '900 Harbor Drive', 'San Diego', 'CA', '92101',
    'Harbor District', 32.7100, -117.1700, 'townhouse', 'for_sale', 3, 3.5,
    3150, null, 'sqft', 1875,
    array['River views','Rooftop terrace','Deeded parking','Exposed brick','Iron balconies','Historic district','Elevator','Wet bar','Guest suite'],
    false, true, now() - interval '48 days'
  ),
  (
    'ansley-park-classic', 'Pasadena Classic Estate',
    'A 1910 classic brought forward with a two-storey addition housing a vaulted family room and a primary suite with a marble bath and private balcony. Original leaded glass and quarter-sawn oak remain throughout the front of the house. Steps from the Arroyo Seco.',
    2395000, 'total', '72 Bellefontaine Street', 'Pasadena', 'CA', '91101',
    'Pasadena', 34.1400, -118.1400, 'house', 'pending', 4, 4.5,
    4650, 0.41, 'acres', 1910,
    array['Leaded glass','Quarter-sawn oak','Private balcony','Winn Park','Two-storey addition','Fireplace','Irrigated garden','Driveway gate','Basement storage'],
    false, true, now() - interval '52 days'
  ),
  (
    'virginia-highland-modern', 'Culver City Modern',
    'A crisp 2019 build on a quiet street two blocks from the shops and dining of downtown. Open-plan living opens through steel-and-glass doors to a level lawn; the studio above the garage is plumbed for a guest suite and currently works beautifully as an office.',
    1895000, 'total', '1042 Lindblade Drive', 'Culver City', 'CA', '90230',
    'Culver City', 34.0200, -118.3900, 'house', 'pending', 4, 3.5,
    3400, 0.19, 'acres', 2019,
    array['Open plan','Steel and glass doors','Garage studio','Fenced lawn','Solar panels','Tankless water','Walk to restaurants','EV charger'],
    false, true, now() - interval '58 days'
  ),
  (
    'morningside-garden-home', 'Garden Grove Garden Home',
    'A renovated garden home with a south-facing screened porch and a lawn that ends at a stone wall. Three bedrooms on one level, a finished terrace level with a wine closet, and a two-car garage behind the gate.',
    1425000, 'total', '1234 Maple Street', 'Garden Grove', 'CA', '92840',
    'Garden Grove', 33.7700, -117.9500, 'house', 'sold', 3, 2.5,
    2850, 0.24, 'acres', 1941,
    array['Screened porch','Finished terrace level','Wine closet','Two-car garage','Renovated kitchen','Stone wall','Mature garden'],
    false, true, now() - interval '70 days'
  ),
  (
    'roswell-equestrian-estate', 'Temecula Equestrian Estate',
    'Twelve fenced acres with a five-stall barn, a riding arena and a two-acre spring-fed pond. The residence pairs a timber great room with a glass-walled kitchen; a separate cottage near the barn is ideal for a trainer or guests. Offered fully furnished on a twelve-month lease.',
    18500, 'month', '3900 Rancho California Road', 'Temecula', 'CA', '92592',
    'Temecula', 33.4800, -117.1200, 'estate', 'for_rent', 5, 4.5,
    7100, 12.00, 'acres', 1998,
    array['Equestrian','5-stall barn','Riding arena','Spring-fed pond','Timber great room','Caretaker cottage','Fully furnished','Fenced pasture','Furnished lease'],
    false, true, now() - interval '5 days'
  )
) as t(
  slug, title, description, price, price_period, street_address, city, state, zip_code,
  neighborhood, latitude, longitude, property_type, listing_status, bedrooms, bathrooms,
  square_feet, lot_size, lot_size_unit, year_built, amenities, is_featured, is_published, created_at
)
where not exists (select 1 from public.properties p where p.slug = t.slug);

-- ---------------------------------------------------------------------------
-- Property photography (4 images per listing)
-- ---------------------------------------------------------------------------
with shots(slug, prompts) as (
  values
    ('tuxedo-park-estate', array[
      'Grand Georgian brick mansion exterior at dusk, symmetrical facade, limestone trim, slate roof, long circular drive, manicured boxwood hedges, warm light glowing from tall windows, architectural photography',
      'Elegant formal living room in a historic estate, twelve foot coffered ceiling, carved limestone fireplace, silk drapes, antique rug, grand piano, soft afternoon light, interior design photography',
      'Chef kitchen with La Cornue range, honed marble counters, hand painted cabinetry, butler pantry through a wide arch, brass fixtures, natural daylight, luxury interior photography',
      'Primary bedroom suite with upholstered canopy bed, French doors to a private terrace, pale linen bedding, crystal sconces, garden view, serene morning light, editorial interior photography'
    ]),
    ('buckhead-penthouse-the-charles', array[
      'Luxury penthouse living room at twilight with floor to ceiling glass walls, panoramic city skyline view, low profile designer furniture, marble floor, warm ambient lighting, high rise interior photography',
      'Modern primary bathroom in a luxury penthouse, book-matched Calacatta marble, freestanding soaking tub beside a window with skyline view, brass fixtures, soft daylight, architectural interior photography',
      'Chef kitchen in a contemporary penthouse, matte black cabinetry, waterfall marble island, integrated appliances, wine wall, city views through glass, evening interior photography',
      'Private rooftop terrace of a luxury penthouse at sunset, outdoor lounge seating, fire feature, planters, panoramic Los Angeles skyline, warm golden light, architectural photography'
    ]),
    ('sea-island-oceanfront-retreat', array[
      'Oceanfront luxury beach house exterior, cedar shingle and tabby stone facade, marsh grass and dunes, boardwalk to the beach, blue sky, golden hour, coastal architectural photography',
      'Airy coastal living room with nine foot sliding glass walls opening to the ocean, pale linen sofas, driftwood coffee table, vaulted white ceiling, sea breeze, bright natural light, interior photography',
      'Screened porch facing the Atlantic ocean, cypress ceiling, wicker lounge chairs, porch swing, ceiling fans, ocean breeze, soft late afternoon light, coastal interior photography',
      'Infinity pool overlooking the Atlantic ocean at sunset, travertine terrace, teak loungers, summer kitchen, palmettos, warm golden reflections, luxury exterior photography'
    ]),
    ('cashiers-mountain-lodge', array[
      'Mountain lodge exterior in the Blue Ridge mountains, timber and stone facade, tall windows, stone chimney, gravel drive, rhododendron, autumn foliage, misty peaks behind, architectural photography',
      'Great room of a mountain lodge with forty foot window wall framing forested peaks, timber trusses, stone fireplace, leather sofas, wool rug, warm interior lighting, editorial interior photography',
      'Rustic luxury kitchen with soapstone counters, reclaimed wood cabinetry, exposed beams, farmhouse sink, mountain view window, copper pendants, warm daylight, interior photography',
      'Covered mountain terrace with stone outdoor fireplace, hot tub, lounge seating, long range Blue Ridge mountain view, layered ridges, clear evening sky, architectural exterior photography'
    ]),
    ('historic-charleston-single-house', array[
      'Historic California hacienda exterior, stucco facade, three stacked verandas with ironwork railings, black shutters, palm trees, cobblestone street, morning light, architectural photography',
      'Historic estate interior with heart pine floors, twelve over twelve windows, tall ceilings, antique furnishings, fireplace with marble surround, soft filtered light, interior design photography',
      'Walled Mediterranean garden with trickle fountain, brick pathway, camellias, cast iron bistro table, ivy covered wall, dappled sunlight, garden photography',
      'Bright historic kitchen with soapstone counters, exposed brick, integrated modern appliances, open shelving, farmhouse sink under a garden window, natural daylight, interior photography'
    ]),
    ('highlands-lakefront-compound', array[
      'Lakefront mountain home exterior at dusk, white oak and stone facade, glass gables, private dock on a still lake, forested shoreline, warm interior glow, reflections on the water, architectural photography',
      'Great room of a lakefront home with white oak floors, hand plastered walls, stone fireplace, walls of glass facing the lake, linen sofas, soft daylight, editorial interior photography',
      'Boathouse studio on a mountain lake, sliding doors opening to a covered dock, kayaks, plank floors, ceiling fan, still water reflections, architectural photography',
      'West facing sunset porch overlooking a mountain lake, rocking chairs, stone fireplace, timber posts, golden sunset reflections on the water, ridge silhouettes, lifestyle exterior photography'
    ]),
    ('alpharetta-golf-course-manor', array[
      'European inspired luxury manor exterior on a golf course, stucco and stone facade, arched windows, slate roof, motor court, manicured lawn, deep green fairway behind, late afternoon light, architectural photography',
      'Paneled home office with walnut bookcases, coffered ceiling, leather club chair, brass library lamp, fireplace, golf course view window, warm interior photography',
      'Primary suite with tray ceiling, upholstered bed, sitting area, French doors to a terrace with golf course view, soft neutral palette, natural daylight, interior photography',
      'Backyard saltwater pool and covered outdoor kitchen at dusk, stone terrace, fire pit, lounge seating, golf course beyond, string lights, warm evening light, architectural exterior photography'
    ]),
    ('savannah-riverfront-townhome', array[
      'Historic California harborfront townhome exterior, exposed brick, ironwork balconies, four storeys, cobblestone street, harbor beyond, palm trees, warm late afternoon light, architectural photography',
      'Rooftop terrace overlooking a California harbor, outdoor lounge seating, string lights, planters, boats in the distance, sunset sky, lifestyle exterior photography',
      'Historic townhome living room with exposed brick walls, ironwork windows, heart pine floors, tan leather sofa, walnut shelving, river light, interior design photography',
      'Modern historic kitchen with exposed brick, quartz counters, brass faucet, open shelving, island with stools, tall arched window, natural daylight, interior photography'
    ]),
    ('ansley-park-classic', array[
      'Craftsman influenced 1910 house exterior in Pasadena California, deep front porch, brick and shingle facade, leaded glass windows, mature trees, brick walkway, dappled morning light, architectural photography',
      'Vaulted family room of a renovated historic California home, exposed beams, walls of windows to the garden, stone fireplace, sectional sofa, oak floor, bright natural light, interior photography',
      'Marble primary bathroom in a renovated historic home, freestanding tub, walk in glass shower, double vanity, brass fixtures, marble tile, garden window, soft daylight, interior photography',
      'Private balcony off a primary bedroom, wrought iron railing, cafe table, tree canopy view, wisteria, soft afternoon light, lifestyle exterior photography'
    ]),
    ('virginia-highland-modern', array[
      'Contemporary infill house exterior in Culver City California, charcoal brick and dark metal clad facade, steel and glass entry, level lawn, young trees, blue sky, crisp architectural photography',
      'Open plan modern living and dining space, white oak floors, blackened steel doors open to the lawn, minimalist furniture, linear fireplace, recessed lighting, bright daylight, interior photography',
      'Minimalist modern kitchen with matte cabinetry, quartz island, integrated appliances, brass tapware, skylight, dining nook, natural daylight, interior design photography',
      'Detached garage studio converted to a home office, white oak floors, built in desk, bookshelves, large window overlooking the garden, minimal styling, bright daylight, interior photography'
    ]),
    ('morningside-garden-home', array[
      'Charming renovated brick garden home exterior in Garden Grove California, arched portico, black shutters, stone wall, mature azaleas, brick path, warm morning light, architectural photography',
      'Screened porch with beadboard ceiling, wicker furniture, ceiling fan, ferns, view to a green lawn, soft natural light, lifestyle interior photography',
      'Renovated kitchen with shaker cabinetry, marble counters, farmhouse sink, open shelving, breakfast nook with banquette, garden window, bright daylight, interior photography',
      'Finished terrace level lounge with built in wine closet, sectional sofa, shiplap walls, wool rug, warm lamps, walk out to the garden, cozy interior photography'
    ]),
    ('roswell-equestrian-estate', array[
      'Equestrian estate exterior at golden hour, timber and stone residence, fenced white board pastures, five stall barn, riding arena, two acre pond, mature hardwoods, architectural photography',
      'Timber great room of an equestrian estate, vaulted ceiling with trusses, wall of windows to the paddocks, stone fireplace, leather sofas, warm interior lighting, interior photography',
      'Glass walled kitchen overlooking fenced pastures, professional range, stone counters, large island, pendant lights, wide plank floors, natural daylight, interior photography',
      'Row of horses looking over a white board fence at a riding arena, barn in the background, green pasture, early morning mist, warm golden light, equestrian lifestyle photography'
    ])
)
insert into public.property_images (property_id, url, alt_text, sort_order, is_cover)
select
  p.id,
  pg_temp.img(s.prompt),
  p.title || ' — view ' || s.ord,
  s.ord - 1,
  s.ord = 1
from shots sh
join public.properties p on p.slug = sh.slug
cross join lateral unnest(sh.prompts) with ordinality as s(prompt, ord)
where not exists (
  select 1 from public.property_images pi where pi.property_id = p.id
);

-- Main image for cards / open-graph
update public.properties p
set hero_image_url = pi.url
from public.property_images pi
where pi.property_id = p.id
  and pi.is_cover
  and p.hero_image_url is null;

-- ---------------------------------------------------------------------------
-- A couple of sample enquiries so the Leads workspace is not empty
-- ---------------------------------------------------------------------------
insert into public.enquiries (
  property_id, property_title_snapshot, full_name, email, phone,
  enquiry_type, preferred_contact_method, message, status, source_page, created_at
)
select
  p.id, p.title, v.full_name, v.email, v.phone,
  v.enquiry_type::public.enquiry_type, v.preferred_contact_method::public.contact_method,
  v.message, v.status::public.enquiry_status, v.source_page, v.created_at
from (values
  ('tuxedo-park-estate', 'Margaret Ellison', 'margaret.ellison@example.com', '+1 (581) 238-0121',
   'private_viewing', 'phone',
   'We are relocating from out of state in the spring and would like to see the Bel Air estate on a Saturday morning. Is the guest cottage included in the sale?',
   'new', '/properties/tuxedo-park-estate', now() - interval '2 days'),
  ('sea-island-oceanfront-retreat', 'James Whitlock', 'j.whitlock@example.com', '+1 (581) 238-0198',
   'more_information', 'email',
   'Could you send the survey, the flood elevation certificate and the last three years of insurance premiums? Also interested to know whether the furnishings convey.',
   'contacted', '/properties/sea-island-oceanfront-retreat', now() - interval '5 days'),
  ('buckhead-penthouse-the-charles', 'Priya Raghunathan', 'priya.r@example.com', null,
   'property_enquiry', 'email',
   'Is a second parking space still available for purchase, and what are the monthly HOA dues? Thank you.',
   'in_progress', '/properties/buckhead-penthouse-the-charles', now() - interval '8 days'),
  (null, 'Thomas Bergman', 'thomas.bergman@example.com', '+1 (581) 238-0173',
   'general', 'either',
   'I own a 1960s ranch in Garden Grove and I am considering a sale next year. Would you be able to give me an honest read on timing and price?',
   'new', '/contact', now() - interval '1 day')
) as v(property_slug, full_name, email, phone, enquiry_type, preferred_contact_method, message, status, source_page, created_at)
left join public.properties p on p.slug = v.property_slug
where not exists (select 1 from public.enquiries e where e.email = v.email and e.message = v.message);
