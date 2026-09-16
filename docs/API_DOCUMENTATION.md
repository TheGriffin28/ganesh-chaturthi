# Nexora AI Office — API Documentation
## Social Media Campaign & Post Management API

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`  
**Authentication:** Standard Bearer Token / Internal Agent Key (Header: `X-Nexora-Agent-Key`)

---

### Overview of Endpoints

1. `GET /api/campaigns` — Fetch all social media campaigns.
2. `POST /api/campaigns` — Create a new campaign context.
3. `GET /api/posts` — Retrieve list of social media posts (with filtering).
4. `POST /api/posts` — Generate and save a new social media post draft or scheduled item.
5. `GET /api/posts/:id` — Retrieve detailed post information.
6. `PUT /api/posts/:id` — Update post content, schedule, or visual assets.
7. `POST /api/posts/:id/publish` — Trigger immediate publication to platform.
8. `POST /api/assets/upload` — Upload media assets for campaigns.

---

## Endpoints Specification

### 1. Fetch All Campaigns
- **HTTP Method:** `GET`
- **Path:** `/api/campaigns`
- **Description:** Returns a collection of all active and archived social media campaign contexts.
- **Query Parameters:**
  - `status` *(optional, string)*: Filter by campaign status (`active`, `draft`, `completed`).

#### Response `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "cmp_gc_2024",
      "title": "Ganesh Chaturthi Celebration 2024",
      "targetAudience": "Global Community & Tech Enthusiasts",
      "status": "active",
      "createdAt": "2024-09-01T10:00:00.000Z"
    }
  ]
}
```

#### Curl Example
```bash
curl -X GET "http://localhost:5000/api/campaigns?status=active" \
  -H "X-Nexora-Agent-Key: nexora-secret-key"
```

---

### 2. Create Campaign Context
- **HTTP Method:** `POST`
- **Path:** `/api/campaigns`
- **Description:** Creates a new campaign context under which posts are grouped.

#### Request Body Schema
```json
{
  "title": "Ganesh Chaturthi 2024",
  "description": "Atlas and Nova agent social media drive for Ganesh Chaturthi",
  "startDate": "2024-09-07T00:00:00Z",
  "endDate": "2024-09-17T23:59:59Z",
  "tags": ["GaneshChaturthi", "FestiveTech", "NexoraAI"]
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "id": "cmp_9f8e7d6c",
    "title": "Ganesh Chaturthi 2024",
    "status": "active",
    "createdAt": "2024-09-01T10:15:00.000Z"
  }
}
```

#### Curl Example
```bash
curl -X POST "http://localhost:5000/api/campaigns" \
  -H "Content-Type: application/json" \
  -H "X-Nexora-Agent-Key: nexora-secret-key" \
  -d '{
    "title": "Ganesh Chaturthi 2024",
    "description": "Atlas and Nova agent social media drive for Ganesh Chaturthi",
    "startDate": "2024-09-07T00:00:00Z",
    "endDate": "2024-09-17T23:59:59Z",
    "tags": ["GaneshChaturthi", "FestiveTech", "NexoraAI"]
  }'
```

---

### 3. Retrieve Posts
- **HTTP Method:** `GET`
- **Path:** `/api/posts`
- **Description:** Retrieve posts filtered by platform, campaign ID, or publication status.
- **Query Parameters:**
  - `campaignId` *(optional, string)*: Filter by campaign.
  - `platform` *(optional, string)*: `twitter`, `linkedin`, `instagram`, `facebook`.
  - `status` *(optional, string)*: `draft`, `scheduled`, `published`.

#### Response `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "post_101",
      "campaignId": "cmp_gc_2024",
      "platform": "twitter",
      "caption": "Wishing everyone a joyful and prosperous Ganesh Chaturthi! May Lord Ganesha clear all obstacles on your journey. 🌸🙏 #GaneshChaturthi #NexoraAI",
      "assetUrl": "/public/brand-logo.svg",
      "status": "scheduled",
      "scheduledAt": "2024-09-07T09:00:00.000Z"
    }
  ]
}
```

#### Curl Example
```bash
curl -X GET "http://localhost:5000/api/posts?platform=twitter&status=scheduled" \
  -H "X-Nexora-Agent-Key: nexora-secret-key"
```

---

### 4. Generate/Create Social Media Post
- **HTTP Method:** `POST`
- **Path:** `/api/posts`
- **Description:** Saves a post created manually or triggered by Atlas/Nova agents.

#### Request Body Schema
```json
{
  "campaignId": "cmp_gc_2024",
  "requestedBy": "Atlas",
  "generatedBy": "Nova",
  "platform": "linkedin",
  "caption": "As we celebrate Ganesh Chaturthi, Nexora AI honors new beginnings and intelligent innovation. Wishing you peace, prosperity, and success!",
  "mediaAssetId": "ast_550e8400",
  "scheduledAt": "2024-09-07T08:00:00Z"
}
```

#### Response `201 Created`
```json
{
  "success": true,
  "message": "Post generated and queued for scheduling",
  "data": {
    "id": "post_102",
    "campaignId": "cmp_gc_2024",
    "platform": "linkedin",
    "status": "scheduled",
    "scheduledAt": "2024-09-07T08:00:00.000Z"
  }
}
```

#### Curl Example
```bash
curl -X POST "http://localhost:5000/api/posts" \
  -H "Content-Type: application/json" \
  -H "X-Nexora-Agent-Key: nexora-secret-key" \
  -d '{
    "campaignId": "cmp_gc_2024",
    "requestedBy": "Atlas",
    "generatedBy": "Nova",
    "platform": "linkedin",
    "caption": "As we celebrate Ganesh Chaturthi, Nexora AI honors new beginnings...",
    "mediaAssetId": "ast_550e8400",
    "scheduledAt": "2024-09-07T08:00:00Z"
  }'
```

---

### 5. Get Post Details
- **HTTP Method:** `GET`
- **Path:** `/api/posts/:id`
- **Description:** Retrieve details for a specific post record.

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "post_101",
    "campaignId": "cmp_gc_2024",
    "platform": "twitter",
    "caption": "Wishing everyone a joyful and prosperous Ganesh Chaturthi!",
    "assetUrl": "http://localhost:5000/public/brand-logo.svg",
    "status": "draft",
    "metadata": {
      "hashtags": ["#GaneshChaturthi", "#NexoraAI"],
      "characterCount": 124
    },
    "createdAt": "2024-09-01T11:00:00.000Z"
  }
}
```

#### Curl Example
```bash
curl -X GET "http://localhost:5000/api/posts/post_101" \
  -H "X-Nexora-Agent-Key: nexora-secret-key"
```

---

### 6. Update Post
- **HTTP Method:** `PUT`
- **Path:** `/api/posts/:id`
- **Description:** Modifies caption text, image link, or execution schedule.

#### Request Body Schema
```json
{
  "caption": "Updated: Wishing everyone a blessed Ganesh Chaturthi filled with joy and new beginnings! 🐘✨",
  "scheduledAt": "2024-09-07T10:00:00Z"
}
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "id": "post_101",
    "caption": "Updated: Wishing everyone a blessed Ganesh Chaturthi filled with joy and new beginnings! 🐘✨",
    "scheduledAt": "2024-09-07T10:00:00Z",
    "updatedAt": "2024-09-01T12:00:00.000Z"
  }
}
```

#### Curl Example
```bash
curl -X PUT "http://localhost:5000/api/posts/post_101" \
  -H "Content-Type: application/json" \
  -H "X-Nexora-Agent-Key: nexora-secret-key" \
  -d '{
    "caption": "Updated: Wishing everyone a blessed Ganesh Chaturthi filled with joy and new beginnings! 🐘✨",
    "scheduledAt": "2024-09-07T10:00:00Z"
  }'
```

---

### 7. Publish Post Immediately
- **HTTP Method:** `POST`
- **Path:** `/api/posts/:id/publish`
- **Description:** Triggers immediate integration dispatch to target platform APIs.

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Post successfully published to Twitter",
  "data": {
    "id": "post_101",
    "status": "published",
    "publishedAt": "2024-09-01T12:05:00.000Z",
    "platformResponseId": "tw_status_1830592011"
  }
}
```

#### Curl Example
```bash
curl -X POST "http://localhost:5000/api/posts/post_101/publish" \
  -H "X-Nexora-Agent-Key: nexora-secret-key"
```

---

### 8. Upload Media Asset
- **HTTP Method:** `POST`
- **Path:** `/api/assets/upload`
- **Content-Type:** `multipart/form-data`
- **Description:** Upload image or video creative assets to be associated with posts.

#### Form Data Parameters
- `file`: *(binary file, required)* Image (PNG/JPG/SVG) or Video (MP4).
- `campaignId`: *(string, required)* The associated campaign ID.

#### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "assetId": "ast_550e8400",
    "campaignId": "cmp_gc_2024",
    "filename": "ganesh-chaturthi-graphic.png",
    "url": "/uploads/ganesh-chaturthi-graphic.png",
    "mimeType": "image/png"
  }
}
```

#### Curl Example
```bash
curl -X POST "http://localhost:5000/api/assets/upload" \
  -H "X-Nexora-Agent-Key: nexora-secret-key" \
  -F "campaignId=cmp_gc_2024" \
  -F "file=@/path/to/local/ganesh-art.png"
```
