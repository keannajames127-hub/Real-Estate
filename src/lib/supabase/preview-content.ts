/**
 * Public content bundle compiled into the deployed website.
 *
 * The live site has no database attached, so this snapshot is what the
 * storefront serves instead: the listings, photographs, advisors and site
 * settings as they stand in `supabase/seed.sql` plus the office's own edits.
 *
 * It holds no private data — enquiries and administrator accounts are not
 * included, and writes are refused in production, so the deployed site simply
 * displays this content.
 *
 * Regenerate with `.local-data/build-content.cjs` after editing content
 * locally, then commit and push.
 */

export interface BundledContent {
  properties: Array<Record<string, unknown>>;
  property_images: Array<Record<string, unknown>>;
  agents: Array<Record<string, unknown>>;
  site_settings: Array<Record<string, unknown>>;
}

export const BUNDLED_CONTENT: BundledContent = {
  "properties": [
    {
      "id": "3b12cd89-887d-477e-a4f4-e02050fb44cc",
      "slug": "bel-air-contemporary-estate",
      "title": "Bel Air Contemporary Estate",
      "description": "A gated contemporary residence with canyon-to-ocean views, an infinity pool and a private screening room.",
      "price": 12450000,
      "currency": "USD",
      "price_period": "total",
      "street_address": "1120 Stradella Road",
      "city": "Los Angeles",
      "state": "CA",
      "zip_code": "90077",
      "neighborhood": "Bel Air",
      "country": "United States",
      "latitude": 34.0928,
      "longitude": -118.4527,
      "property_type": "estate",
      "listing_status": "for_sale",
      "bedrooms": 6,
      "bathrooms": 8,
      "square_feet": 11200,
      "lot_size": 1.4,
      "lot_size_unit": "acres",
      "year_built": 2021,
      "amenities": [
        "Infinity pool",
        "Home cinema",
        "Wine cellar",
        "Guest house",
        "Smart home"
      ],
      "hero_image_url": "/bel-air-estate.jpg",
      "is_featured": true,
      "is_published": true,
      "published_at": "2026-11-26T06:34:30.443Z",
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-11-11T06:34:30.446Z",
      "updated_at": "2026-11-26T06:34:30.443Z"
    },
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "slug": "los-angeles-mobile-home",
      "title": "Los Angeles Mobile Home",
      "description": "A quiet, green oasis between Glendale and Pasadena. Enjoy unique local businesses, historic Route 66 sites, excellent schools and clubs for kids, and family recreation centers.",
      "price": 95000,
      "currency": "USD",
      "price_period": "total",
      "street_address": "5051 Argus Dr Space 16",
      "city": "Los Angeles",
      "state": "CA",
      "zip_code": "90041",
      "neighborhood": null,
      "country": "United States",
      "latitude": 34.0928,
      "longitude": -118.4527,
      "property_type": "house",
      "listing_status": "for_sale",
      "bedrooms": 1,
      "bathrooms": 1,
      "square_feet": null,
      "lot_size": 520,
      "lot_size_unit": "sqft",
      "year_built": 2019,
      "amenities": [
        "Infinity pool",
        "Home cinema",
        "Wine cellar",
        "Guest house",
        "Smart home",
        "3-car garage",
        "Spa bath",
        "Screened porch",
        "Terraced gardens",
        "Outdoor kitchen"
      ],
      "hero_image_url": "/preview/property-1.jpg",
      "is_featured": true,
      "is_published": true,
      "published_at": "2026-11-21T14:15:01.654Z",
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-11-07T14:15:01.654Z",
      "updated_at": "2026-11-23T17:47:08.169Z",
      "property_images": [
        {
          "storage_path": "4ab45c48-8ca2-4c5d-b752-7e32388ec1d8.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 0,
          "is_cover": true,
          "created_at": "2026-11-23T17:47:08.178Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/4ab45c48-8ca2-4c5d-b752-7e32388ec1d8.jpg",
          "id": "6a3e6ed3-bbb0-4d67-9ee8-faf78489b63d"
        },
        {
          "storage_path": "8b60587e-f278-4d55-a71b-c75665768dcd.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 1,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/8b60587e-f278-4d55-a71b-c75665768dcd.jpg",
          "id": "fab86c11-b21c-41ab-8ff8-0746f07a94cf"
        },
        {
          "storage_path": "128a565b-7355-4b85-9b84-148672ce10e3.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 2,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/128a565b-7355-4b85-9b84-148672ce10e3.jpg",
          "id": "69f43a27-197a-4b6d-930b-32c2192ce916"
        },
        {
          "storage_path": "42153b88-4290-4ccf-8f7d-531598772544.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 3,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/42153b88-4290-4ccf-8f7d-531598772544.jpg",
          "id": "6746168b-5a6d-4590-863e-2b0e0c2a8c0d"
        },
        {
          "storage_path": "3f4c00b4-1164-47d1-a159-4fdaa00e2616.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 4,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/3f4c00b4-1164-47d1-a159-4fdaa00e2616.jpg",
          "id": "3008da4f-061f-4dfb-952e-d851a4976f5b"
        },
        {
          "storage_path": "1de311cb-a9cb-45a3-bfce-43005616e8ae.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 5,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/1de311cb-a9cb-45a3-bfce-43005616e8ae.jpg",
          "id": "dec4e9d2-c4ec-4077-a8a8-8e3871c4502e"
        },
        {
          "storage_path": "79556823-19f3-4270-9e29-9813afdcac19.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 6,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/79556823-19f3-4270-9e29-9813afdcac19.jpg",
          "id": "182b068f-a60f-475a-95df-378db393da16"
        },
        {
          "storage_path": "6f63653b-a6d8-4154-9aad-55780951210a.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 7,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/6f63653b-a6d8-4154-9aad-55780951210a.jpg",
          "id": "1b888ed5-865d-468a-9281-565e24f2cde4"
        },
        {
          "storage_path": "548b5d73-a4b6-42aa-b46c-cfd44ea0f374.jpg",
          "alt_text": "Los Angeles Mobile Home",
          "sort_order": 8,
          "is_cover": false,
          "created_at": "2026-11-23T17:47:08.179Z",
          "property_id": "11111111-1111-4111-8111-111111111111",
          "url": "/uploads/548b5d73-a4b6-42aa-b46c-cfd44ea0f374.jpg",
          "id": "815a55cc-7806-463c-ba68-33814ccf1e5a"
        }
      ]
    },
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "slug": "newport-beach-harbour-villa",
      "title": "Newport Beach Harbour Villa",
      "description": "Beautiful single-level home tucked away on one of the few quiet cul-de-sacs in highly desirable Newport Heights. Situated on an expansive approximately 7,800-square-foot lot, this home offers privacy, spacious living, and an unbeatable Newport Beach location.",
      "price": 6000,
      "currency": "USD",
      "price_period": "month",
      "street_address": "2306 Laurel Pl",
      "city": "Newport Beach",
      "state": "CA",
      "zip_code": "92663",
      "neighborhood": null,
      "country": "United States",
      "latitude": 33.606,
      "longitude": -117.896,
      "property_type": "villa",
      "listing_status": "for_rent",
      "bedrooms": 3,
      "bathrooms": 2,
      "square_feet": null,
      "lot_size": 7800,
      "lot_size_unit": "sqft",
      "year_built": 1996,
      "amenities": [
        "Private dock",
        "Boat slip",
        "Outdoor kitchen",
        "Elevator",
        "Whole-house generator",
        "Smart home",
        "Terraced gardens",
        "Guest house",
        "Wine room",
        "Spa bath"
      ],
      "hero_image_url": "/preview/property-2.jpg",
      "is_featured": true,
      "is_published": true,
      "published_at": "2026-11-19T14:15:01.654Z",
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-11-05T14:15:01.654Z",
      "updated_at": "2026-11-23T03:16:09.697Z",
      "property_images": [
        {
          "storage_path": "7cbfb156-b1c3-4049-8466-ef4d3996730c.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 0,
          "is_cover": true,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/7cbfb156-b1c3-4049-8466-ef4d3996730c.jpg",
          "id": "cd89cecc-4776-4d72-a22b-1b789fb48d17"
        },
        {
          "storage_path": "2e68393b-34c3-457e-ae80-33fec6e20ed5.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 1,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/2e68393b-34c3-457e-ae80-33fec6e20ed5.jpg",
          "id": "db54660e-bb8c-4faf-95d5-6f991bf4e173"
        },
        {
          "storage_path": "b44c8adc-04cd-41d5-b3a7-e5a0903c73d1.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 2,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/b44c8adc-04cd-41d5-b3a7-e5a0903c73d1.jpg",
          "id": "dc28678c-8a30-4ab5-989f-eb483f507a99"
        },
        {
          "storage_path": "541dca80-464b-411e-980d-2441b61f0a56.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 3,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/541dca80-464b-411e-980d-2441b61f0a56.jpg",
          "id": "663fada4-341a-42e5-bcf9-36cf5f32d96a"
        },
        {
          "storage_path": "91dc74a8-7488-4e63-9905-c8f2f50dcaf5.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 4,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/91dc74a8-7488-4e63-9905-c8f2f50dcaf5.jpg",
          "id": "f3e931ea-ab1b-47a5-97f2-cdcf8cdc7fcb"
        },
        {
          "storage_path": "b0a4942d-a87f-4b7d-8c3d-e51c369503fb.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 5,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/b0a4942d-a87f-4b7d-8c3d-e51c369503fb.jpg",
          "id": "1d0c0b1a-b19b-4faf-b2fc-1513fd2404f9"
        },
        {
          "storage_path": "cf08ab91-c524-4bec-b03f-149c5c458631.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 6,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/cf08ab91-c524-4bec-b03f-149c5c458631.jpg",
          "id": "62c0f42d-2422-461d-9bc2-fbbdba365ab0"
        },
        {
          "storage_path": "90d82c7d-aea3-47a4-9938-6608ab6c307a.jpg",
          "alt_text": "Newport Beach Harbour Villa",
          "sort_order": 7,
          "is_cover": false,
          "created_at": "2026-11-23T03:16:09.740Z",
          "property_id": "22222222-2222-4222-8222-222222222222",
          "url": "/uploads/90d82c7d-aea3-47a4-9938-6608ab6c307a.jpg",
          "id": "d3219103-83d8-4591-8f89-4121acbf9347"
        }
      ]
    },
    {
      "id": "33333333-3333-4333-8333-333333333333",
      "slug": "grass-valey-lands",
      "title": "Grass Valey Land/Property",
      "description": "Two 4000 sqft engineered, permitted greenhouses (Canopy area 2500 sqft each, with one greenhouse having rolling benches and concrete floors), automated light dep systems, Link4 panel, supplemental LED lighting, propane heat and wet wall cooling. This system allows for year round farming, producing the highest quality product.  1400 sqft permitted processing facility with three climate controlled rooms; dryroom with hangers, clone/propagation room fitted with 16 racks and LED lighting, plus additional room.  600 Amps of PG&E power. Backup system with 100kw and 40kw propane generators, 4000 gal propane tanks for the greenhouses and 500 gal for the house.",
      "price": 650000,
      "currency": "USD",
      "price_period": "total",
      "street_address": "70 Harbor Drive",
      "city": "Grass Valey",
      "state": "CA",
      "zip_code": "95945",
      "neighborhood": null,
      "country": "United States",
      "latitude": 32.709,
      "longitude": -117.171,
      "property_type": "land",
      "listing_status": "sold",
      "bedrooms": 4,
      "bathrooms": 4,
      "square_feet": 4150,
      "lot_size": 20000,
      "lot_size_unit": "sqft",
      "year_built": 2020,
      "amenities": [
        "Wraparound terrace",
        "Concierge",
        "Gym",
        "Valet parking",
        "Whole-house generator",
        "Fire pit",
        "3-car garage",
        "Golf course frontage",
        "Spa bath",
        "Wine cellar",
        "Mountain views"
      ],
      "hero_image_url": "/preview/property-3.jpg",
      "is_featured": false,
      "is_published": true,
      "published_at": "2026-11-16T14:15:01.654Z",
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-11-02T14:15:01.654Z",
      "updated_at": "2026-11-23T04:00:30.034Z",
      "property_images": [
        {
          "storage_path": "eca60420-137c-43db-aa55-8027e2f0f391.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 0,
          "is_cover": true,
          "created_at": "2026-11-23T04:00:30.096Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/eca60420-137c-43db-aa55-8027e2f0f391.jpg",
          "id": "201363c0-70d0-44d6-8a3d-55bfed9d21e4"
        },
        {
          "storage_path": "94de07f1-d618-47d5-9fd9-6689fa49a109.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 1,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.096Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/94de07f1-d618-47d5-9fd9-6689fa49a109.jpg",
          "id": "e9ef5f11-4f3c-41ad-b09f-a1d6d94b0ede"
        },
        {
          "storage_path": "5148700c-9d15-4f3a-b3f9-a25956e07d1f.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 2,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.097Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/5148700c-9d15-4f3a-b3f9-a25956e07d1f.jpg",
          "id": "40af7502-1050-4c65-9330-2f98a94237d8"
        },
        {
          "storage_path": "e284f56c-1a76-4aaa-9b27-5624e2e5f2d0.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 3,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.100Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/e284f56c-1a76-4aaa-9b27-5624e2e5f2d0.jpg",
          "id": "04ba6e7e-b74c-48e7-aacc-48a68cefdda4"
        },
        {
          "storage_path": "d41bdd8e-b166-46c7-9cdb-1f1802234d8d.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 4,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.100Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/d41bdd8e-b166-46c7-9cdb-1f1802234d8d.jpg",
          "id": "0c1b6c24-bea0-432e-ab6c-2ec4f40851fe"
        },
        {
          "storage_path": "115a3081-7a05-4a9d-bb11-860a31aa1b70.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 5,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.100Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/115a3081-7a05-4a9d-bb11-860a31aa1b70.jpg",
          "id": "905584e6-fe93-4161-95f4-227b710f37fc"
        },
        {
          "storage_path": "626eb9ca-b46b-4fbf-8531-b8d955a17c80.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 6,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.100Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/626eb9ca-b46b-4fbf-8531-b8d955a17c80.jpg",
          "id": "554f0869-2067-4e87-b8ab-b52eb8d89252"
        },
        {
          "storage_path": "29c3437e-64e4-4872-8e23-7216aba38a39.jpg",
          "alt_text": "Nevada County High Tech Farm on 20 Acres.",
          "sort_order": 7,
          "is_cover": false,
          "created_at": "2026-11-23T04:00:30.100Z",
          "property_id": "33333333-3333-4333-8333-333333333333",
          "url": "/uploads/29c3437e-64e4-4872-8e23-7216aba38a39.jpg",
          "id": "cd2af712-4b6a-412d-8157-e7964ff0c9f6"
        }
      ]
    },
    {
      "id": "44444444-4444-4444-8444-444444444444",
      "slug": "pasadena-townhouse",
      "title": "Pasadena Townhouse",
      "description": "Gated condominium complex with year-round heated swimming pool, jacuzzi, club room, and sauna.\r\nFully remodeled, in impeccable condition, fresh paint and brand new carpeting upstairs, with keyless entry, central air-conditioning, and heating. Two side-by-side assigned parking spaces in a secured subterranean garage.",
      "price": 4000,
      "currency": "USD",
      "price_period": "month",
      "street_address": "999 San Pasqual St",
      "city": "Pasadena",
      "state": "CA",
      "zip_code": "91106",
      "neighborhood": null,
      "country": "United States",
      "latitude": 34.142,
      "longitude": -118.151,
      "property_type": "townhouse",
      "listing_status": "for_rent",
      "bedrooms": 2,
      "bathrooms": 3,
      "square_feet": 2640,
      "lot_size": 1123,
      "lot_size_unit": "sqft",
      "year_built": 1912,
      "amenities": [
        "Private garden",
        "Original millwork",
        "Two-car garage",
        "3-car garage",
        "Heated pool"
      ],
      "hero_image_url": "/preview/property-1.jpg",
      "is_featured": true,
      "is_published": true,
      "published_at": "2026-11-13T14:15:01.654Z",
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-10-30T14:15:01.654Z",
      "updated_at": "2026-11-23T04:16:54.186Z",
      "property_images": [
        {
          "storage_path": "a9839ee4-8a65-4cf1-a432-a19d3da86d83.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 0,
          "is_cover": false,
          "created_at": "2026-11-23T04:16:54.224Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/a9839ee4-8a65-4cf1-a432-a19d3da86d83.jpg",
          "id": "11544131-8ab2-4b55-b7cf-e24501712f51"
        },
        {
          "storage_path": "53c9942b-531b-4d39-a264-6bf8f18f4a51.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 1,
          "is_cover": false,
          "created_at": "2026-11-23T04:16:54.225Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/53c9942b-531b-4d39-a264-6bf8f18f4a51.jpg",
          "id": "36265e42-bbbb-45a8-a8c5-698f52d95bac"
        },
        {
          "storage_path": "00d312ef-0b0a-4c2a-837c-3028fc1015a8.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 2,
          "is_cover": false,
          "created_at": "2026-11-23T04:16:54.225Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/00d312ef-0b0a-4c2a-837c-3028fc1015a8.jpg",
          "id": "05698643-c222-41e6-baea-22bd80ee2637"
        },
        {
          "storage_path": "912dd762-d736-41b7-9cc5-cd676a2613eb.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 3,
          "is_cover": false,
          "created_at": "2026-11-23T04:16:54.225Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/912dd762-d736-41b7-9cc5-cd676a2613eb.jpg",
          "id": "2744f63b-102d-48c8-a654-75fd3a091d6b"
        },
        {
          "storage_path": "35a74337-2214-47cf-b2e4-8ac72259200c.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 4,
          "is_cover": false,
          "created_at": "2026-11-23T04:16:54.225Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/35a74337-2214-47cf-b2e4-8ac72259200c.jpg",
          "id": "a5f6abd6-ec27-49e8-af54-6b89e7f0e527"
        },
        {
          "storage_path": "27a57143-c03c-49db-95bc-4a03d05bd67e.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 5,
          "is_cover": false,
          "created_at": "2026-11-23T04:16:54.225Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/27a57143-c03c-49db-95bc-4a03d05bd67e.jpg",
          "id": "e7743330-9843-48cc-9eb2-4080240dae6c"
        },
        {
          "storage_path": "bb2904c1-8dd0-4530-a863-e6b38597d324.jpg",
          "alt_text": "Pasadena Townhouse",
          "sort_order": 6,
          "is_cover": true,
          "created_at": "2026-11-23T04:16:54.225Z",
          "property_id": "44444444-4444-4444-8444-444444444444",
          "url": "/uploads/bb2904c1-8dd0-4530-a863-e6b38597d324.jpg",
          "id": "8bee1c9e-3805-465d-afe6-765861b26525"
        }
      ]
    },
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "slug": "malibu-cliffside-residence",
      "title": "Malibu Cliffside Residence",
      "description": "2+2 Unobstructed Ocean Views from your extra large private balcony. Showstopping Pacific Ocean views from the moment you walk into your private peaceful oasis in the sky. Also comes with 2 side by side covered carport spots.",
      "price": 5000,
      "currency": "USD",
      "price_period": "month",
      "street_address": "18203 Coastline Dr",
      "city": "Malibu",
      "state": "CA",
      "zip_code": "90265",
      "neighborhood": null,
      "country": "United States",
      "latitude": 34.03,
      "longitude": -118.69,
      "property_type": "apartment",
      "listing_status": "for_rent",
      "bedrooms": 2,
      "bathrooms": 2,
      "square_feet": null,
      "lot_size": 1179,
      "lot_size_unit": "sqft",
      "year_built": 2016,
      "amenities": [
        "Private beach stair",
        "Ocean terrace",
        "Solar",
        "Wine room",
        "3-car garage",
        "EV charger",
        "Heated pool",
        "Spa bath",
        "Covered terrace",
        "Outdoor kitchen",
        "Gym",
        "Saltwater pool",
        "Fire pit",
        "Oceanfront"
      ],
      "hero_image_url": "/preview/property-2.jpg",
      "is_featured": true,
      "is_published": true,
      "published_at": "2026-11-01T14:15:01.654Z",
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-10-18T14:15:01.654Z",
      "updated_at": "2026-11-23T03:32:11.807Z",
      "property_images": [
        {
          "storage_path": "de89e856-eaf7-40c7-a44c-7873c233ccad.jpg",
          "alt_text": "Malibu Cliffside Residence",
          "sort_order": 0,
          "is_cover": true,
          "created_at": "2026-11-23T03:32:11.851Z",
          "property_id": "55555555-5555-4555-8555-555555555555",
          "url": "/uploads/de89e856-eaf7-40c7-a44c-7873c233ccad.jpg",
          "id": "ca9e2b3c-16f7-4a6e-92d0-c07c51d53069"
        },
        {
          "storage_path": "a514e583-97a2-4268-934f-c2c180aba391.jpg",
          "alt_text": "Malibu Cliffside Residence",
          "sort_order": 1,
          "is_cover": false,
          "created_at": "2026-11-23T03:32:11.851Z",
          "property_id": "55555555-5555-4555-8555-555555555555",
          "url": "/uploads/a514e583-97a2-4268-934f-c2c180aba391.jpg",
          "id": "03aa135c-7c73-4a7f-acd7-f237bacfa37f"
        },
        {
          "storage_path": "b05d885f-ffa3-4011-9d4d-f10c0b554282.jpg",
          "alt_text": "Malibu Cliffside Residence",
          "sort_order": 2,
          "is_cover": false,
          "created_at": "2026-11-23T03:32:11.851Z",
          "property_id": "55555555-5555-4555-8555-555555555555",
          "url": "/uploads/b05d885f-ffa3-4011-9d4d-f10c0b554282.jpg",
          "id": "68b58c89-4645-4612-9e07-7abf1987bc63"
        },
        {
          "storage_path": "4c086957-494d-4d34-b4d1-1bc2b4e7bd83.jpg",
          "alt_text": "Malibu Cliffside Residence",
          "sort_order": 3,
          "is_cover": false,
          "created_at": "2026-11-23T03:32:11.851Z",
          "property_id": "55555555-5555-4555-8555-555555555555",
          "url": "/uploads/4c086957-494d-4d34-b4d1-1bc2b4e7bd83.jpg",
          "id": "343f432c-ac13-4a45-b7be-23949c9ad8ed"
        },
        {
          "storage_path": "ab43bb7a-5ae4-46c7-826f-3bd267415b90.jpg",
          "alt_text": "Malibu Cliffside Residence",
          "sort_order": 4,
          "is_cover": false,
          "created_at": "2026-11-23T03:32:11.851Z",
          "property_id": "55555555-5555-4555-8555-555555555555",
          "url": "/uploads/ab43bb7a-5ae4-46c7-826f-3bd267415b90.jpg",
          "id": "4b447a1c-a915-482a-bb1a-b4fd802f0b45"
        }
      ]
    },
    {
      "id": "66666666-6666-4666-8666-666666666666",
      "slug": "garden-grove-family-home",
      "title": "Garden Grove Family Home",
      "description": "Draft listing. A single-storey family home with a detached studio and mature citrus garden.",
      "price": 3500,
      "currency": "USD",
      "price_period": "month",
      "street_address": "13134 Stanrich Pl",
      "city": "Garden Grove",
      "state": "CA",
      "zip_code": "92843",
      "neighborhood": null,
      "country": "United States",
      "latitude": 33.7739,
      "longitude": -118.003,
      "property_type": "house",
      "listing_status": "for_rent",
      "bedrooms": 3,
      "bathrooms": 2,
      "square_feet": 2050,
      "lot_size": 1185,
      "lot_size_unit": "sqft",
      "year_built": 1982,
      "amenities": [
        "Detached studio",
        "Citrus garden",
        "RV parking",
        "Chef kitchen",
        "3-car garage"
      ],
      "hero_image_url": "/preview/property-3.jpg",
      "is_featured": true,
      "is_published": true,
      "published_at": null,
      "created_by": "00000000-0000-4000-8000-000000000001",
      "created_at": "2026-11-06T14:15:01.654Z",
      "updated_at": "2026-11-23T02:45:58.004Z",
      "property_images": [
        {
          "storage_path": "227cf299-6090-43c6-b647-ef60fc1578d2.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 0,
          "is_cover": true,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/227cf299-6090-43c6-b647-ef60fc1578d2.jpg",
          "id": "77f3637c-0903-4358-b8d7-edb50868fb5a"
        },
        {
          "storage_path": "852263c8-d6e9-4a83-81c9-9f6f0e123dfd.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 1,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/852263c8-d6e9-4a83-81c9-9f6f0e123dfd.jpg",
          "id": "29832cb5-1d46-4268-90dc-231b7541ce49"
        },
        {
          "storage_path": "59346369-4a14-404e-a86e-a81b6804d67a.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 2,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/59346369-4a14-404e-a86e-a81b6804d67a.jpg",
          "id": "c09eb83f-75ed-4f7b-a40a-23d8830580f8"
        },
        {
          "storage_path": "d6b8e9ea-9eab-4f45-bf93-779e2c8ebeb2.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 3,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/d6b8e9ea-9eab-4f45-bf93-779e2c8ebeb2.jpg",
          "id": "754b9679-b36f-4141-8ea1-04458dad9fa3"
        },
        {
          "storage_path": "c0b092cb-11dc-4a56-8a96-41b8b66eaee0.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 4,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/c0b092cb-11dc-4a56-8a96-41b8b66eaee0.jpg",
          "id": "039a388f-0225-4b3c-bf2b-bdd2f2189fda"
        },
        {
          "storage_path": "c1d8ae0d-456f-4ee6-91e1-a5d422a79a6d.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 5,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/c1d8ae0d-456f-4ee6-91e1-a5d422a79a6d.jpg",
          "id": "4765a7b8-3db8-44b0-8490-2857b38f4474"
        },
        {
          "storage_path": "0f3e6f02-2522-4b83-a13b-57d59d7e24f3.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 6,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/0f3e6f02-2522-4b83-a13b-57d59d7e24f3.jpg",
          "id": "e21580e5-62ea-4fb4-b211-30b5c13602a8"
        },
        {
          "storage_path": "46bb4267-58ca-49eb-a842-33b29ba7251e.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 7,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/46bb4267-58ca-49eb-a842-33b29ba7251e.jpg",
          "id": "519241b9-4e06-4e36-a485-ea36a40e51f0"
        },
        {
          "storage_path": "da194711-bcd0-485f-a776-6c2d03a589d6.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 8,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/da194711-bcd0-485f-a776-6c2d03a589d6.jpg",
          "id": "848cfacb-7327-4085-b1f2-05c759c57e49"
        },
        {
          "storage_path": "580c8387-0733-4897-a407-05182a10a1b3.jpg",
          "alt_text": "Garden Grove Family Home",
          "sort_order": 9,
          "is_cover": false,
          "created_at": "2026-11-23T02:45:58.067Z",
          "property_id": "66666666-6666-4666-8666-666666666666",
          "url": "/uploads/580c8387-0733-4897-a407-05182a10a1b3.jpg",
          "id": "01fe3965-3cd3-4817-b280-68312877d3fc"
        }
      ]
    }
  ],
  "property_images": [
    {
      "id": "e0edfecd-da68-4cae-be82-896707dc73f7",
      "property_id": "3b12cd89-887d-477e-a4f4-e02050fb44cc",
      "url": "/bel-air-estate.jpg",
      "storage_path": null,
      "alt_text": "Bel Air Contemporary Estate",
      "sort_order": 0,
      "is_cover": true,
      "created_at": "2026-11-11T06:34:30.446Z"
    },
    {
      "storage_path": "227cf299-6090-43c6-b647-ef60fc1578d2.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 0,
      "is_cover": true,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/227cf299-6090-43c6-b647-ef60fc1578d2.jpg",
      "id": "77f3637c-0903-4358-b8d7-edb50868fb5a"
    },
    {
      "storage_path": "852263c8-d6e9-4a83-81c9-9f6f0e123dfd.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 1,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/852263c8-d6e9-4a83-81c9-9f6f0e123dfd.jpg",
      "id": "29832cb5-1d46-4268-90dc-231b7541ce49"
    },
    {
      "storage_path": "59346369-4a14-404e-a86e-a81b6804d67a.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 2,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/59346369-4a14-404e-a86e-a81b6804d67a.jpg",
      "id": "c09eb83f-75ed-4f7b-a40a-23d8830580f8"
    },
    {
      "storage_path": "d6b8e9ea-9eab-4f45-bf93-779e2c8ebeb2.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 3,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/d6b8e9ea-9eab-4f45-bf93-779e2c8ebeb2.jpg",
      "id": "754b9679-b36f-4141-8ea1-04458dad9fa3"
    },
    {
      "storage_path": "c0b092cb-11dc-4a56-8a96-41b8b66eaee0.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 4,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/c0b092cb-11dc-4a56-8a96-41b8b66eaee0.jpg",
      "id": "039a388f-0225-4b3c-bf2b-bdd2f2189fda"
    },
    {
      "storage_path": "c1d8ae0d-456f-4ee6-91e1-a5d422a79a6d.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 5,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/c1d8ae0d-456f-4ee6-91e1-a5d422a79a6d.jpg",
      "id": "4765a7b8-3db8-44b0-8490-2857b38f4474"
    },
    {
      "storage_path": "0f3e6f02-2522-4b83-a13b-57d59d7e24f3.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 6,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/0f3e6f02-2522-4b83-a13b-57d59d7e24f3.jpg",
      "id": "e21580e5-62ea-4fb4-b211-30b5c13602a8"
    },
    {
      "storage_path": "46bb4267-58ca-49eb-a842-33b29ba7251e.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 7,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/46bb4267-58ca-49eb-a842-33b29ba7251e.jpg",
      "id": "519241b9-4e06-4e36-a485-ea36a40e51f0"
    },
    {
      "storage_path": "da194711-bcd0-485f-a776-6c2d03a589d6.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 8,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/da194711-bcd0-485f-a776-6c2d03a589d6.jpg",
      "id": "848cfacb-7327-4085-b1f2-05c759c57e49"
    },
    {
      "storage_path": "580c8387-0733-4897-a407-05182a10a1b3.jpg",
      "alt_text": "Garden Grove Family Home",
      "sort_order": 9,
      "is_cover": false,
      "created_at": "2026-11-23T02:45:58.067Z",
      "property_id": "66666666-6666-4666-8666-666666666666",
      "url": "/uploads/580c8387-0733-4897-a407-05182a10a1b3.jpg",
      "id": "01fe3965-3cd3-4817-b280-68312877d3fc"
    },
    {
      "storage_path": "7cbfb156-b1c3-4049-8466-ef4d3996730c.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 0,
      "is_cover": true,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/7cbfb156-b1c3-4049-8466-ef4d3996730c.jpg",
      "id": "cd89cecc-4776-4d72-a22b-1b789fb48d17"
    },
    {
      "storage_path": "2e68393b-34c3-457e-ae80-33fec6e20ed5.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 1,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/2e68393b-34c3-457e-ae80-33fec6e20ed5.jpg",
      "id": "db54660e-bb8c-4faf-95d5-6f991bf4e173"
    },
    {
      "storage_path": "b44c8adc-04cd-41d5-b3a7-e5a0903c73d1.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 2,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/b44c8adc-04cd-41d5-b3a7-e5a0903c73d1.jpg",
      "id": "dc28678c-8a30-4ab5-989f-eb483f507a99"
    },
    {
      "storage_path": "541dca80-464b-411e-980d-2441b61f0a56.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 3,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/541dca80-464b-411e-980d-2441b61f0a56.jpg",
      "id": "663fada4-341a-42e5-bcf9-36cf5f32d96a"
    },
    {
      "storage_path": "91dc74a8-7488-4e63-9905-c8f2f50dcaf5.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 4,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/91dc74a8-7488-4e63-9905-c8f2f50dcaf5.jpg",
      "id": "f3e931ea-ab1b-47a5-97f2-cdcf8cdc7fcb"
    },
    {
      "storage_path": "b0a4942d-a87f-4b7d-8c3d-e51c369503fb.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 5,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/b0a4942d-a87f-4b7d-8c3d-e51c369503fb.jpg",
      "id": "1d0c0b1a-b19b-4faf-b2fc-1513fd2404f9"
    },
    {
      "storage_path": "cf08ab91-c524-4bec-b03f-149c5c458631.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 6,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/cf08ab91-c524-4bec-b03f-149c5c458631.jpg",
      "id": "62c0f42d-2422-461d-9bc2-fbbdba365ab0"
    },
    {
      "storage_path": "90d82c7d-aea3-47a4-9938-6608ab6c307a.jpg",
      "alt_text": "Newport Beach Harbour Villa",
      "sort_order": 7,
      "is_cover": false,
      "created_at": "2026-11-23T03:16:09.740Z",
      "property_id": "22222222-2222-4222-8222-222222222222",
      "url": "/uploads/90d82c7d-aea3-47a4-9938-6608ab6c307a.jpg",
      "id": "d3219103-83d8-4591-8f89-4121acbf9347"
    },
    {
      "storage_path": "de89e856-eaf7-40c7-a44c-7873c233ccad.jpg",
      "alt_text": "Malibu Cliffside Residence",
      "sort_order": 0,
      "is_cover": true,
      "created_at": "2026-11-23T03:32:11.851Z",
      "property_id": "55555555-5555-4555-8555-555555555555",
      "url": "/uploads/de89e856-eaf7-40c7-a44c-7873c233ccad.jpg",
      "id": "ca9e2b3c-16f7-4a6e-92d0-c07c51d53069"
    },
    {
      "storage_path": "a514e583-97a2-4268-934f-c2c180aba391.jpg",
      "alt_text": "Malibu Cliffside Residence",
      "sort_order": 1,
      "is_cover": false,
      "created_at": "2026-11-23T03:32:11.851Z",
      "property_id": "55555555-5555-4555-8555-555555555555",
      "url": "/uploads/a514e583-97a2-4268-934f-c2c180aba391.jpg",
      "id": "03aa135c-7c73-4a7f-acd7-f237bacfa37f"
    },
    {
      "storage_path": "b05d885f-ffa3-4011-9d4d-f10c0b554282.jpg",
      "alt_text": "Malibu Cliffside Residence",
      "sort_order": 2,
      "is_cover": false,
      "created_at": "2026-11-23T03:32:11.851Z",
      "property_id": "55555555-5555-4555-8555-555555555555",
      "url": "/uploads/b05d885f-ffa3-4011-9d4d-f10c0b554282.jpg",
      "id": "68b58c89-4645-4612-9e07-7abf1987bc63"
    },
    {
      "storage_path": "4c086957-494d-4d34-b4d1-1bc2b4e7bd83.jpg",
      "alt_text": "Malibu Cliffside Residence",
      "sort_order": 3,
      "is_cover": false,
      "created_at": "2026-11-23T03:32:11.851Z",
      "property_id": "55555555-5555-4555-8555-555555555555",
      "url": "/uploads/4c086957-494d-4d34-b4d1-1bc2b4e7bd83.jpg",
      "id": "343f432c-ac13-4a45-b7be-23949c9ad8ed"
    },
    {
      "storage_path": "ab43bb7a-5ae4-46c7-826f-3bd267415b90.jpg",
      "alt_text": "Malibu Cliffside Residence",
      "sort_order": 4,
      "is_cover": false,
      "created_at": "2026-11-23T03:32:11.851Z",
      "property_id": "55555555-5555-4555-8555-555555555555",
      "url": "/uploads/ab43bb7a-5ae4-46c7-826f-3bd267415b90.jpg",
      "id": "4b447a1c-a915-482a-bb1a-b4fd802f0b45"
    },
    {
      "storage_path": "eca60420-137c-43db-aa55-8027e2f0f391.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 0,
      "is_cover": true,
      "created_at": "2026-11-23T04:00:30.096Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/eca60420-137c-43db-aa55-8027e2f0f391.jpg",
      "id": "201363c0-70d0-44d6-8a3d-55bfed9d21e4"
    },
    {
      "storage_path": "94de07f1-d618-47d5-9fd9-6689fa49a109.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 1,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.096Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/94de07f1-d618-47d5-9fd9-6689fa49a109.jpg",
      "id": "e9ef5f11-4f3c-41ad-b09f-a1d6d94b0ede"
    },
    {
      "storage_path": "5148700c-9d15-4f3a-b3f9-a25956e07d1f.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 2,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.097Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/5148700c-9d15-4f3a-b3f9-a25956e07d1f.jpg",
      "id": "40af7502-1050-4c65-9330-2f98a94237d8"
    },
    {
      "storage_path": "e284f56c-1a76-4aaa-9b27-5624e2e5f2d0.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 3,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.100Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/e284f56c-1a76-4aaa-9b27-5624e2e5f2d0.jpg",
      "id": "04ba6e7e-b74c-48e7-aacc-48a68cefdda4"
    },
    {
      "storage_path": "d41bdd8e-b166-46c7-9cdb-1f1802234d8d.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 4,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.100Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/d41bdd8e-b166-46c7-9cdb-1f1802234d8d.jpg",
      "id": "0c1b6c24-bea0-432e-ab6c-2ec4f40851fe"
    },
    {
      "storage_path": "115a3081-7a05-4a9d-bb11-860a31aa1b70.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 5,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.100Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/115a3081-7a05-4a9d-bb11-860a31aa1b70.jpg",
      "id": "905584e6-fe93-4161-95f4-227b710f37fc"
    },
    {
      "storage_path": "626eb9ca-b46b-4fbf-8531-b8d955a17c80.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 6,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.100Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/626eb9ca-b46b-4fbf-8531-b8d955a17c80.jpg",
      "id": "554f0869-2067-4e87-b8ab-b52eb8d89252"
    },
    {
      "storage_path": "29c3437e-64e4-4872-8e23-7216aba38a39.jpg",
      "alt_text": "Nevada County High Tech Farm on 20 Acres.",
      "sort_order": 7,
      "is_cover": false,
      "created_at": "2026-11-23T04:00:30.100Z",
      "property_id": "33333333-3333-4333-8333-333333333333",
      "url": "/uploads/29c3437e-64e4-4872-8e23-7216aba38a39.jpg",
      "id": "cd2af712-4b6a-412d-8157-e7964ff0c9f6"
    },
    {
      "storage_path": "a9839ee4-8a65-4cf1-a432-a19d3da86d83.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 0,
      "is_cover": false,
      "created_at": "2026-11-23T04:16:54.224Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/a9839ee4-8a65-4cf1-a432-a19d3da86d83.jpg",
      "id": "11544131-8ab2-4b55-b7cf-e24501712f51"
    },
    {
      "storage_path": "53c9942b-531b-4d39-a264-6bf8f18f4a51.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 1,
      "is_cover": false,
      "created_at": "2026-11-23T04:16:54.225Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/53c9942b-531b-4d39-a264-6bf8f18f4a51.jpg",
      "id": "36265e42-bbbb-45a8-a8c5-698f52d95bac"
    },
    {
      "storage_path": "00d312ef-0b0a-4c2a-837c-3028fc1015a8.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 2,
      "is_cover": false,
      "created_at": "2026-11-23T04:16:54.225Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/00d312ef-0b0a-4c2a-837c-3028fc1015a8.jpg",
      "id": "05698643-c222-41e6-baea-22bd80ee2637"
    },
    {
      "storage_path": "912dd762-d736-41b7-9cc5-cd676a2613eb.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 3,
      "is_cover": false,
      "created_at": "2026-11-23T04:16:54.225Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/912dd762-d736-41b7-9cc5-cd676a2613eb.jpg",
      "id": "2744f63b-102d-48c8-a654-75fd3a091d6b"
    },
    {
      "storage_path": "35a74337-2214-47cf-b2e4-8ac72259200c.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 4,
      "is_cover": false,
      "created_at": "2026-11-23T04:16:54.225Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/35a74337-2214-47cf-b2e4-8ac72259200c.jpg",
      "id": "a5f6abd6-ec27-49e8-af54-6b89e7f0e527"
    },
    {
      "storage_path": "27a57143-c03c-49db-95bc-4a03d05bd67e.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 5,
      "is_cover": false,
      "created_at": "2026-11-23T04:16:54.225Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/27a57143-c03c-49db-95bc-4a03d05bd67e.jpg",
      "id": "e7743330-9843-48cc-9eb2-4080240dae6c"
    },
    {
      "storage_path": "bb2904c1-8dd0-4530-a863-e6b38597d324.jpg",
      "alt_text": "Pasadena Townhouse",
      "sort_order": 6,
      "is_cover": true,
      "created_at": "2026-11-23T04:16:54.225Z",
      "property_id": "44444444-4444-4444-8444-444444444444",
      "url": "/uploads/bb2904c1-8dd0-4530-a863-e6b38597d324.jpg",
      "id": "8bee1c9e-3805-465d-afe6-765861b26525"
    },
    {
      "storage_path": "4ab45c48-8ca2-4c5d-b752-7e32388ec1d8.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 0,
      "is_cover": true,
      "created_at": "2026-11-23T17:47:08.178Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/4ab45c48-8ca2-4c5d-b752-7e32388ec1d8.jpg",
      "id": "6a3e6ed3-bbb0-4d67-9ee8-faf78489b63d"
    },
    {
      "storage_path": "8b60587e-f278-4d55-a71b-c75665768dcd.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 1,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/8b60587e-f278-4d55-a71b-c75665768dcd.jpg",
      "id": "fab86c11-b21c-41ab-8ff8-0746f07a94cf"
    },
    {
      "storage_path": "128a565b-7355-4b85-9b84-148672ce10e3.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 2,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/128a565b-7355-4b85-9b84-148672ce10e3.jpg",
      "id": "69f43a27-197a-4b6d-930b-32c2192ce916"
    },
    {
      "storage_path": "42153b88-4290-4ccf-8f7d-531598772544.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 3,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/42153b88-4290-4ccf-8f7d-531598772544.jpg",
      "id": "6746168b-5a6d-4590-863e-2b0e0c2a8c0d"
    },
    {
      "storage_path": "3f4c00b4-1164-47d1-a159-4fdaa00e2616.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 4,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/3f4c00b4-1164-47d1-a159-4fdaa00e2616.jpg",
      "id": "3008da4f-061f-4dfb-952e-d851a4976f5b"
    },
    {
      "storage_path": "1de311cb-a9cb-45a3-bfce-43005616e8ae.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 5,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/1de311cb-a9cb-45a3-bfce-43005616e8ae.jpg",
      "id": "dec4e9d2-c4ec-4077-a8a8-8e3871c4502e"
    },
    {
      "storage_path": "79556823-19f3-4270-9e29-9813afdcac19.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 6,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/79556823-19f3-4270-9e29-9813afdcac19.jpg",
      "id": "182b068f-a60f-475a-95df-378db393da16"
    },
    {
      "storage_path": "6f63653b-a6d8-4154-9aad-55780951210a.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 7,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/6f63653b-a6d8-4154-9aad-55780951210a.jpg",
      "id": "1b888ed5-865d-468a-9281-565e24f2cde4"
    },
    {
      "storage_path": "548b5d73-a4b6-42aa-b46c-cfd44ea0f374.jpg",
      "alt_text": "Los Angeles Mobile Home",
      "sort_order": 8,
      "is_cover": false,
      "created_at": "2026-11-23T17:47:08.179Z",
      "property_id": "11111111-1111-4111-8111-111111111111",
      "url": "/uploads/548b5d73-a4b6-42aa-b46c-cfd44ea0f374.jpg",
      "id": "815a55cc-7806-463c-ba68-33814ccf1e5a"
    }
  ],
  "agents": [
    {
      "id": "bbbbbbbb-0001-4000-8000-000000000001",
      "name": "Daniel S. Hansen",
      "title": "Founder & Principal Broker",
      "bio": "Twenty-two years placing exceptional California homes with private clients.",
      "email": "daniel@danishhomeproperties.com",
      "phone": null,
      "photo_url": "/uploads/e8037fe0-d815-4841-a91f-3c1357a55406.jpg",
      "license_number": "DRE #01987654",
      "specialties": [
        "Bel Air & Westside",
        "Architectural estates",
        "Off-market"
      ],
      "sort_order": 1,
      "is_active": true,
      "created_at": "2026-07-25T14:15:01.654Z",
      "updated_at": "2026-11-26T05:49:59.846Z"
    },
    {
      "id": "bbbbbbbb-0002-4000-8000-000000000002",
      "name": "Sarah Contreras",
      "title": "Co-Founder & Principal Broker",
      "bio": "Specialist in Newport Beach, Corona del Mar and Laguna waterfront property.",
      "email": "sarah@danishhomeproperties.com",
      "phone": null,
      "photo_url": "/uploads/09b548e3-47e3-4740-8ac1-f0b0e4effd89.jpg",
      "license_number": "DRE #02123456",
      "specialties": [
        "Coastal Orange County",
        "Waterfront",
        "New development"
      ],
      "sort_order": 2,
      "is_active": true,
      "created_at": "2026-08-18T14:15:01.654Z",
      "updated_at": "2026-11-26T05:50:24.092Z"
    }
  ],
  "site_settings": [
    {
      "id": 1,
      "business_name": "Danish Home Properties",
      "tagline": "Exceptional homes across California's most coveted addresses.",
      "contact_email": "hello@danishhomeproperties.com",
      "contact_phone": "+1 (581) 238-7344",
      "office_address": "1234 Maple Street, Garden Grove, CA 92840, United States",
      "about_text": "Danish Home Properties represents a small number of exceptional California homes each year.",
      "social_links": {},
      "hero_headline": "Discover Exceptional Properties",
      "hero_subheadline": "A curated collection of California's finest homes, presented with discretion and care.",
      "hero_image_url": null,
      "footer_note": null,
      "updated_at": "2026-11-22T14:39:49.384Z"
    }
  ]
};
