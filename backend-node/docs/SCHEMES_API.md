# Government Schemes API

Internal API for crop- and region-specific government schemes. No external government APIs; data is curated and stored in an internal file-based store.

## Endpoints

### GET /api/schemes/eligible

Returns schemes that match the given filters (deterministic, rule-based).

**Query parameters**

| Parameter     | Type   | Required | Description                                                    |
|--------------|--------|----------|----------------------------------------------------------------|
| state        | string | Yes      | State name (e.g. Karnataka)                                    |
| district     | string | No       | District (optional)                                           |
| crop         | string | No       | Crop name — optional refinement to narrow state schemes        |
| season       | string | No       | Kharif / Rabi / Zaid — optional refinement                     |
| farmer_type  | string | No       | Small / Marginal / Large — optional refinement                  |

**Response**

```json
{
  "schemes": [
    {
      "scheme": {
        "id": "1",
        "name": "...",
        "name_hi": "...",
        "description": "...",
        "benefits": "...",
        "eligibility_text": "...",
        "application_process": "...",
        "application_mode": "Online,CSC",
        "start_date": "...",
        "end_date": null,
        "deadline": null,
        "source_url": "",
        "last_verified_date": "..."
      },
      "eligibility_reason": "Crop \"Wheat\" and season \"Rabi\" match scheme crops. Region (state: Karnataka) is covered. Farmer type \"Small\" is eligible.",
      "eligibility_reason_hi": "...",
      "application_mode": ["Online", "CSC"]
    }
  ]
}
```

**Eligibility rules (deterministic)**

- **Base eligibility (minimum):** User’s state (and district if given) must match `scheme_regions`. Scheme must be active and within date range.
- **Optional refinement:** If `crop` is provided, the scheme must support that crop in `scheme_crops` (and season if provided). If `season` is provided, scheme must match. If `farmer_type` is provided, scheme must list that type in `scheme_farmer_types`.
- When only state is selected, all active schemes applicable to that state are returned. Crop/season/farmer_type act as refinements, not requirements. No empty result solely because crop is omitted.
- No fuzzy logic or AI; all matching is rule-based.

---

### GET /api/schemes

Returns schemes for listing. By default returns only **active** schemes. For admin (view all, including inactive), use `?all=true`.

**Query parameters**

| Parameter | Type   | Required | Description                                  |
|-----------|--------|----------|----------------------------------------------|
| all       | string | No       | `true` or `1` to return all schemes (admin)  |

**Response**

```json
{
  "schemes": [
    {
      "id": "1",
      "name": "...",
      "is_active": true,
      ...
    }
  ]
}
```

---

### GET /api/schemes/:id

Returns a single scheme with its crops, regions, and farmer types.

**Response**

```json
{
  "scheme": {
    "id": "1",
    "name": "...",
    "crops": [{ "scheme_id": "1", "crop_name": "Wheat", "season": "Rabi" }],
    "regions": [{ "scheme_id": "1", "state": "Karnataka", "district": null }],
    "farmer_types": [{ "scheme_id": "1", "farmer_type": "Small" }],
    ...
  }
}
```

---

### POST /api/schemes (Admin, auth required)

Creates a new scheme. Requires `Authorization: Bearer <firebase_id_token>`.

**Body**

- `name`, `name_hi`, `description`, `description_hi`, `benefits`, `benefits_hi`
- `eligibility_text`, `eligibility_text_hi`, `application_process`, `application_process_hi`
- `application_mode` (e.g. `"Online,CSC,Bank"`)
- `start_date`, `end_date`, `deadline`, `source_url`, `last_verified_date`
- `is_active` (default true)
- `crops`: `[{ crop_name, season }]`
- `regions`: `[{ state, district? }]`
- `farmer_types`: `["Small", "Marginal", "Large"]`

---

### PUT /api/schemes/:id (Admin, auth required)

Updates a scheme. Same body shape as POST. Replaces crops, regions, and farmer_types if provided.

---

### DELETE /api/schemes/:id (Admin, auth required)

Deactivates a scheme (`is_active = false`). Returns the updated scheme.

---

## Data store

- File: `backend-node/src/data/schemes-store.json`
- Normalized structure: `schemes`, `scheme_crops`, `scheme_regions`, `scheme_farmer_types`
- All data is editable via admin panel; no auto-sync from external sites.

**Scheme fields (optional on scheme object):**
- `scheme_level`: `"Central"` or `"State"`
- `benefit_tags`: comma-separated high-level tags (e.g. `"income support"`, `"crop insurance"`, `"irrigation support"`, `"input subsidy"`, `"market access"`)
- `needs_admin_review`: boolean; when true, content should be verified by admin

**Central schemes (pan-India):** Use a single row in `scheme_regions` with `state: "All India"`. Such schemes are returned for any user-selected state. State-level schemes use specific state names in `scheme_regions`.
