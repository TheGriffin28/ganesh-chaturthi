# Technical Architecture & Brief: Ganesh Chaturthi Social Media Campaign

## 1. Executive Summary
This brief establishes the technical specification for generating, managing, and publishing social media posts tailored for cultural events and festive campaigns, specifically starting with the Ganesh Chaturthi campaign request. The architecture provides a scalable PostgreSQL + Express + React framework to author post captions, attach media, schedule publishing, and execute posts across multi-platform integrations (Instagram, LinkedIn, Twitter/X, Facebook).

## 2. Domain & Schema Design

### Entities & Relations
1. **campaigns**: Grouping structure for themed marketing initiatives (e.g., 'Ganesh Chaturthi Special').
   - `id`: UUID (Primary Key)
   - `name`: VARCHAR(255)
   - `festival_event`: VARCHAR(100)
   - `status`: ENUM ('draft', 'active', 'completed')
   - `created_at`: TIMESTAMP

2. **social_posts**: Stores actual copy, platform context, and scheduling details.
   - `id`: UUID (Primary Key)
   - `campaign_id`: FK -> campaigns(id)
   - `platform`: ENUM ('instagram', 'twitter', 'linkedin', 'facebook')
   - `caption`: TEXT
   - `image_url`: TEXT
   - `status`: ENUM ('draft', 'scheduled', 'published', 'failed')
   - `scheduled_at`: TIMESTAMP WITH TIME ZONE
   - `published_at`: TIMESTAMP WITH TIME ZONE
   - `created_at`: TIMESTAMP

3. **media_assets**: Stores attached creative assets (images, banners, videos).
   - `id`: UUID (Primary Key)
   - `post_id`: FK -> social_posts(id)
   - `file_name`: VARCHAR(255)
   - `file_url`: TEXT
   - `media_type`: VARCHAR(50)
   - `file_size`: INT
   - `created_at`: TIMESTAMP

4. **platforms**: Account authentication & connectivity metadata.
   - `id`: UUID (Primary Key)
   - `name`: VARCHAR(50)
   - `account_handle`: VARCHAR(100)
   - `access_token_status`: ENUM ('valid', 'expired', 'disconnected')
   - `updated_at`: TIMESTAMP

## 3. API Contract & Validation Rules
- **Caption Length**: Enforce platform character limits (e.g., 280 chars for Twitter, 2200 chars for Instagram).
- **Media Constraints**: Validate image dimensions (1:1 ratio for standard Instagram feed, 16:9 for Twitter/LinkedIn).
- **Schedule Timing**: `scheduled_at` must be in the future relative to server UTC.

## 4. Operational Considerations & Edge Cases
- **Timezone Precision**: Store all timestamps in UTC ISO-8601 format to ensure accurate execution across global audiences.
- **API Rate Limits**: Implement Exponential Backoff and retry queues for social network graph API invocations.
- **Asset Fallback**: Provide placeholder asset URL validation prior to scheduled dispatch to prevent broken image posts.