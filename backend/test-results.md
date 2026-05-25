# Test Case Results

**Total:** 189 | **Passed:** 189 | **Failed:** 0

---

## ClerkAuthAdapter (unit)

27 tests (27 passed, 0 failed)

| Test Case ID | Description | Expected Output | Actual Output |
|---|---|---|---|
| TC-CAA-01 | maps all fields from a complete Clerk user | {"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"} | {"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"} |
| TC-CAA-02 | returns empty string for email when emailAddresses is empty |  |  |
| TC-CAA-03 | returns empty string for email when emailAddress is missing |  |  |
| TC-CAA-04 | returns null for name when both first and last are null | null | null |
| TC-CAA-05 | returns firstName alone when lastName is missing | Alice | Alice |
| TC-CAA-06 | returns lastName alone when firstName is missing | Smith | Smith |
| TC-CAA-07 | filters out empty-string name parts (filter(Boolean)) | Smith | Smith |
| TC-CAA-08 | returns null for role when publicMetadata is missing | null | null |
| TC-CAA-09 | returns null for role when publicMetadata has no role field | null | null |
| TC-CAA-10 | preserves the original Clerk user id | user_custom | user_custom |
| TC-CAA-11 | handles Clerk v2 style — req.auth as function returning object | user_v2 | user_v2 |
| TC-CAA-12 | returns undefined when req.auth() returns null (v2, logged out) | undefined | undefined |
| TC-CAA-13 | handles Clerk v1 style — req.auth as a plain object | user_v1 | user_v1 |
| TC-CAA-14 | returns undefined when req.auth is an object without userId | undefined | undefined |
| TC-CAA-15 | returns a normalised user for a valid ID | {"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"} | {"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"} |
| TC-CAA-16 | calls clerkClient.users.getUser with the correct ID |  | Pass |
| TC-CAA-17 | returns empty object for an empty array | {} | {} |
| TC-CAA-18 | returns empty object for null | {} | {} |
| TC-CAA-19 | returns empty object for undefined | {} | {} |
| TC-CAA-20 | returns a map keyed by user ID for valid IDs | {"user_2abc123":{"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"}}, {"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"} | {"user_2abc123":{"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"}}, {"id":"user_2abc123","email":"alice@example.com","name":"Alice Smith","role":"admin"} |
| TC-CAA-21 | returns empty object when clerkClient throws | {} | {} |
| TC-CAA-22 | calls getUserList with the provided userIds |  | Pass |
| TC-CAA-23 | calls next() when user role is admin | true, false | true, false |
| TC-CAA-24 | responds 403 when user role is not admin | true, true, false | true, true, false |
| TC-CAA-25 | responds 403 when getUser throws | true, false | true, false |
| TC-CAA-26 | returns a function (middleware) | [Function] | [Function] |
| TC-CAA-27 | returns a function (middleware) | [Function] | [Function] |

---

## Asset Management API

70 tests (70 passed, 0 failed)

| Test Case ID | Description | Expected Output | Actual Output |
|---|---|---|---|
| TC-AMA-01 | returns an empty array when no groups exist | 200, [] | 200, [] |
| TC-AMA-02 | returns groups sorted alphabetically by name | 200, ["Laptops","Projectors"] | 200, ["Laptops","Projectors"] |
| TC-AMA-03 | returns 401 when unauthenticated | 401 | 401 |
| TC-AMA-04 | creates a group and returns it with an id | 201, Cameras, {"name":"Cameras","description":"","id":"6a13f24d5a5636b343b45513"}, 1 | 201, Cameras, {"name":"Cameras","description":"","id":"6a13f24d5a5636b343b45513"}, 1 |
| TC-AMA-05 | trims whitespace from the name | 201, Audio | 201, Audio |
| TC-AMA-06 | returns 400 when name is missing | 400 | 400 |
| TC-AMA-07 | returns 400 when name is blank whitespace | 400 | 400 |
| TC-AMA-08 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-09 | returns 401 when unauthenticated | 401 | 401 |
| TC-AMA-10 | deletes a group that has no children | 200, true, 0 | 200, true, 0 |
| TC-AMA-11 | cascade-deletes child types and their assets | 200, 0, 0, 0 | 200, 0, 0, 0 |
| TC-AMA-12 | only removes children belonging to the deleted group | 1, 1, 1 | 1, 1, 1 |
| TC-AMA-13 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-14 | returns 401 when unauthenticated | 401 | 401 |
| TC-AMA-15 | returns an empty array when no types exist | 200, [] | 200, [] |
| TC-AMA-16 | returns types sorted alphabetically | ["Dell XPS","MacBook Pro"] | ["Dell XPS","MacBook Pro"] |
| TC-AMA-17 | creates a type and returns it with id and groupId | 201, Projector X, 6a13f24f5a5636b343b455b9, {"groupId":"6a13f24f5a5636b343b455b9","name":"Projector X","description":"","pricePerDay":0,"id":"6a13f24f5a5636b343b455... | 201, Projector X, 6a13f24f5a5636b343b455b9, {"groupId":"6a13f24f5a5636b343b455b9","name":"Projector X","description":"","pricePerDay":0,"id":"6a13f24f5a5636b343b455... |
| TC-AMA-18 | returns 400 when groupId is missing | 400 | 400 |
| TC-AMA-19 | returns 400 when name is missing | 400 | 400 |
| TC-AMA-20 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-21 | deletes a type with no assets | 200, 0 | 200, 0 |
| TC-AMA-22 | cascade-deletes all assets belonging to the type | 200, 0 | 200, 0 |
| TC-AMA-23 | only removes assets belonging to the deleted type | 1, 1 | 1, 1 |
| TC-AMA-24 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-25 | returns an empty array when no assets exist | 200, [] | 200, [] |
| TC-AMA-26 | returns all assets | [{"typeId":"6a13f2505a5636b343b45639","name":"Unit 001","description":"","status":"Available","id":"6a13f2505a5636b343b4..., 2 | [{"typeId":"6a13f2505a5636b343b45639","name":"Unit 001","description":"","status":"Available","id":"6a13f2505a5636b343b4..., 2 |
| TC-AMA-27 | creates an asset with status Available by default | 201, Unit 001, Available, 6a13f2515a5636b343b4564a | 201, Unit 001, Available, 6a13f2515a5636b343b4564a |
| TC-AMA-28 | returns 400 when typeId is missing | 400 | 400 |
| TC-AMA-29 | returns 400 when name is missing | 400 | 400 |
| TC-AMA-30 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-31 | creates multiple assets in one request | 201, [{"typeId":"6a13f2515a5636b343b45678","name":"MAC 001","description":"","status":"Available","id":"6a13f2515a5636b343b45..., 3, ["MAC 001","MAC 002","MAC 003"], 3 | 201, [{"typeId":"6a13f2515a5636b343b45678","name":"MAC 001","description":"","status":"Available","id":"6a13f2515a5636b343b45..., 3, ["MAC 001","MAC 002","MAC 003"], 3 |
| TC-AMA-32 | all batch-created assets are Available and belong to the correct type | true, true | true, true |
| TC-AMA-33 | returns 400 when names array is empty | 400 | 400 |
| TC-AMA-34 | returns 400 when typeId is missing | 400 | 400 |
| TC-AMA-35 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-36 | deletes an asset | 200, 0 | 200, 0 |
| TC-AMA-37 | returns 403 when user is not admin | 403 | 403 |
| TC-AMA-38 | admin can update status for multiple assets at once | 200, true, true | 200, true, true |
| TC-AMA-39 | clears rentedByUserId and returnDate when clearRentalData is true | Available, undefined, undefined, undefined | Available, undefined, undefined, undefined |
| TC-AMA-40 | preserves rental data when clearRentalData is false | test_user_id, 2026-04-10T09:30:00.000Z, 2026-04-15 | test_user_id, 2026-04-10T09:30:00.000Z, 2026-04-15 |
| TC-AMA-41 | clears rental data by default when state machine says so (no clearRentalData flag) | 200, Available, undefined, undefined, undefined | 200, Available, undefined, undefined, undefined |
| TC-AMA-42 | returns 400 when ids array is missing | 400 | 400 |
| TC-AMA-43 | customer can transition their own asset Rented → Pending Return | 200 | 200 |
| TC-AMA-44 | customer cannot set status to Maintenance | 403 | 403 |
| TC-AMA-45 | customer cannot update assets they do not own | 403 | 403 |
| TC-AMA-46 | admin can approve a return — asset transitions to Available and rental data is cleared | 200, Available, undefined, undefined | 200, Available, undefined, undefined |
| TC-AMA-47 | admin can send a returned asset to Maintenance — rental data is cleared | 200, Maintenance, undefined, undefined | 200, Maintenance, undefined, undefined |
| TC-AMA-48 | admin can deny a return — asset goes back to Rented and rental data is preserved | 200, Rented, test_user_id, 2026-04-12T10:00:00.000Z, 2026-04-20 | 200, Rented, test_user_id, 2026-04-12T10:00:00.000Z, 2026-04-20 |
| TC-AMA-49 | admin can approve multiple Pending Return assets in a single request | 200, true, true, true | 200, true, true, true |
| TC-AMA-50 | customer can cancel their own Pending Return (back to Rented) | 200, Rented | 200, Rented |
| TC-AMA-51 | customer cannot approve or deny a Pending Return (admin-only transition to Available) | 403 | 403 |
| TC-AMA-52 | customer cannot send a Pending Return to Maintenance | 403 | 403 |
| TC-AMA-53 | marks available assets as Pending Rental for the requesting customer | 200, [{"typeId":"6a13f2565a5636b343b457e4","name":"Unit 001","description":"","status":"Pending Rental","rentedByUserId":"tes..., 2, true, true, true | 200, [{"typeId":"6a13f2565a5636b343b457e4","name":"Unit 001","description":"","status":"Pending Rental","rentedByUserId":"tes..., 2, true, true, true |
| TC-AMA-54 | returns 409 when not enough units are available | 409 | 409 |
| TC-AMA-55 | only picks up Available assets (not Rented, Maintenance, etc.) | 409 | 409 |
| TC-AMA-56 | returns 400 when items array is missing | 400 | 400 |
| TC-AMA-57 | returns 400 when returnDate is missing | 400 | 400 |
| TC-AMA-58 | customer can request an extension for their own rented asset | 200, 2026-05-25, 2026-05-25 | 200, 2026-05-25, 2026-05-25 |
| TC-AMA-59 | rejects extension requests that are not later than the current return date | 400 | 400 |
| TC-AMA-60 | customer cannot request extension for another user's rental | 403 | 403 |
| TC-AMA-61 | prevents duplicate pending extension requests for the same asset | 400 | 400 |
| TC-AMA-62 | admin can approve extension requests and update returnDate | 200, 2026-05-27, undefined | 200, 2026-05-27, undefined |
| TC-AMA-63 | admin can deny extension requests and keep existing returnDate | 200, 2026-05-20, undefined | 200, 2026-05-20, undefined |
| TC-AMA-64 | rejects non-admin attempts to resolve extension requests | 403 | 403 |
| TC-AMA-65 | rejects decisions for assets without pending extension requests | 400 | 400 |
| TC-AMA-66 | returns an empty array when no history exists | 200, [] | 200, [] |
| TC-AMA-67 | returns 401 when unauthenticated | 401 | 401 |
| TC-AMA-68 | records a history entry when an asset is approved for return (Pending Return → Available) | 200, [{"assetId":"6a13f2585a5636b343b458c2","typeId":"6a13f2585a5636b343b458c0","assetName":"Unit 001","assetTypeName":"MacBo..., 1, 6a13f2585a5636b343b458c2, Unit 001, MacBook Pro, test_user_id, 2026-05-01, 2026-05-15, Available | 200, [{"assetId":"6a13f2585a5636b343b458c2","typeId":"6a13f2585a5636b343b458c0","assetName":"Unit 001","assetTypeName":"MacBo..., 1, 6a13f2585a5636b343b458c2, Unit 001, MacBook Pro, test_user_id, 2026-05-01, 2026-05-15, Available |
| TC-AMA-69 | records a history entry when an asset is approved for return with Maintenance status | 200, [{"assetId":"6a13f2585a5636b343b458d7","typeId":"6a13f2585a5636b343b458d5","assetName":"Unit 002","assetTypeName":"Proje..., 1, 2026-05-02, Maintenance | 200, [{"assetId":"6a13f2585a5636b343b458d7","typeId":"6a13f2585a5636b343b458d5","assetName":"Unit 002","assetTypeName":"Proje..., 1, 2026-05-02, Maintenance |
| TC-AMA-70 | does not record a history entry when a return is denied (Pending Return → Pending Rental) | 200, [], 0 | 200, [], 0 |

---

## Profile Routes

5 tests (5 passed, 0 failed)

| Test Case ID | Description | Expected Output | Actual Output |
|---|---|---|---|
| TC-PR-01 | should return 401 when no Clerk session is present | 401 | 401 |
| TC-PR-02 | should return 404 when the authenticated user has no profile in the database | 404, Profile not found | 404, Profile not found |
| TC-PR-03 | should return the profile for an authenticated user | 200, {"address":"123 Main St","phone":"0400000000"} | 200, {"address":"123 Main St","phone":"0400000000"} |
| TC-PR-04 | should return 401 when no Clerk session is present | 401 | 401 |
| TC-PR-05 | should update and return the profile for an authenticated user | 200, {"address":"456 New St","phone":"0411111111"} | 200, {"address":"456 New St","phone":"0411111111"} |

---

## InventoryComponent Composite

15 tests (15 passed, 0 failed)

| Test Case ID | Description | Expected Output | Actual Output |
|---|---|---|---|
| TC-ICC-01 | builds a tree with the correct parent-child relationships | Laptops, [{"doc":{"groupId":"6a13f2595a5636b343b458f6","name":"MacBook Pro","description":"","pricePerDay":0,"id":"6a13f2595a5636..., 1, [{"doc":{"typeId":"6a13f2595a5636b343b458f8","name":"Unit 001","description":"","status":"Available","id":"6a13f2595a563..., 2 | Laptops, [{"doc":{"groupId":"6a13f2595a5636b343b458f6","name":"MacBook Pro","description":"","pricePerDay":0,"id":"6a13f2595a5636..., 1, [{"doc":{"typeId":"6a13f2595a5636b343b458f8","name":"Unit 001","description":"","status":"Available","id":"6a13f2595a563..., 2 |
| TC-ICC-02 | returns null for a non-existent group | null | null |
| TC-ICC-03 | builds a tree where group delete cascades to all descendants | 0, 0, 0 | 0, 0, 0 |
| TC-ICC-04 | only removes children belonging to the deleted group | 1, 1, 1 | 1, 1, 1 |
| TC-ICC-05 | builds a tree with the correct child count | MacBook Pro, [{"doc":{"typeId":"6a13f25a5a5636b343b45937","name":"Unit 001","description":"","status":"Available","id":"6a13f25a5a563..., 2 | MacBook Pro, [{"doc":{"typeId":"6a13f25a5a5636b343b45937","name":"Unit 001","description":"","status":"Available","id":"6a13f25a5a563..., 2 |
| TC-ICC-06 | returns null for a non-existent type | null | null |
| TC-ICC-07 | cascade-deletes all assets belonging to the type | 0, 0 | 0, 0 |
| TC-ICC-08 | only removes assets belonging to the deleted type | 1, 1 | 1, 1 |
| TC-ICC-09 | builds a leaf node with no children | Unit 001, [], [] | Unit 001, [], [] |
| TC-ICC-10 | returns null for a non-existent asset | null | null |
| TC-ICC-11 | deletes the asset | 0 | 0 |
| TC-ICC-12 | returns an empty array when no photo fields are set | [], [] | [], [] |
| TC-ICC-13 | collects photo paths from all levels of the tree | ["groups/test.jpg","types/thumb.jpg","assets/img.jpg"], ["groups/test.jpg","types/thumb.jpg","assets/img.jpg"], ["groups/test.jpg","types/thumb.jpg","assets/img.jpg"] | ["groups/test.jpg","types/thumb.jpg","assets/img.jpg"], ["groups/test.jpg","types/thumb.jpg","assets/img.jpg"], ["groups/test.jpg","types/thumb.jpg","assets/img.jpg"] |
| TC-ICC-14 | calls storageStrategy.delete for each photo | ["a.jpg","t.jpg","g.jpg","gt.jpg"], 4, ["a.jpg","t.jpg","g.jpg","gt.jpg"], ["a.jpg","t.jpg","g.jpg","gt.jpg"], ["a.jpg","t.jpg","g.jpg","gt.jpg"], ["a.jpg","t.jpg","g.jpg","gt.jpg"] | ["a.jpg","t.jpg","g.jpg","gt.jpg"], 4, ["a.jpg","t.jpg","g.jpg","gt.jpg"], ["a.jpg","t.jpg","g.jpg","gt.jpg"], ["a.jpg","t.jpg","g.jpg","gt.jpg"], ["a.jpg","t.jpg","g.jpg","gt.jpg"] |
| TC-ICC-15 | skips photo deletion when storageStrategy is null | 0, 0, 0 | 0, 0, 0 |

---

## Photo Upload API

34 tests (34 passed, 0 failed)

| Test Case ID | Description | Expected Output | Actual Output |
|---|---|---|---|
| TC-PUA-01 | uploads a photo for a group and sets imageUrl/thumbnailUrl | 200, /uploads/groups/6a13f25c5a5636b343b459c2.jpg, /uploads/groups/6a13f25c5a5636b343b459c2_thumb.jpg, /uploads/groups/6a13f25c5a5636b343b459c2.jpg, /uploads/groups/6a13f25c5a5636b343b459c2_thumb.jpg, true, true | 200, /uploads/groups/6a13f25c5a5636b343b459c2.jpg, /uploads/groups/6a13f25c5a5636b343b459c2_thumb.jpg, /uploads/groups/6a13f25c5a5636b343b459c2.jpg, /uploads/groups/6a13f25c5a5636b343b459c2_thumb.jpg, true, true |
| TC-PUA-02 | replaces an existing photo (old files deleted, new ones saved) | 200, 200, /uploads/groups/6a13f25d5a5636b343b459ca.jpg, true, /uploads/groups/6a13f25d5a5636b343b459ca.jpg | 200, 200, /uploads/groups/6a13f25d5a5636b343b459ca.jpg, true, /uploads/groups/6a13f25d5a5636b343b459ca.jpg |
| TC-PUA-03 | returns 400 when no file is attached | 400 | 400 |
| TC-PUA-04 | returns 400 for invalid file type | 400, Invalid file type: text/plain. Allowed types: image/jpeg, image/png, image/webp | 400, Invalid file type: text/plain. Allowed types: image/jpeg, image/png, image/webp |
| TC-PUA-05 | returns 403 when user is not admin | 403 | 403 |
| TC-PUA-06 | returns 401 when unauthenticated | 401 | 401 |
| TC-PUA-07 | deletes a photo and clears DB fields | 200, 200, true, null, null, false, false | 200, 200, true, null, null, false, false |
| TC-PUA-08 | succeeds silently when no photo exists | 200, true | 200, true |
| TC-PUA-09 | returns 403 when user is not admin | 403 | 403 |
| TC-PUA-10 | uploads a photo for an asset type | 200, /uploads/types/6a13f25d5a5636b343b45a00.jpg, /uploads/types/6a13f25d5a5636b343b45a00_thumb.jpg, /uploads/types/6a13f25d5a5636b343b45a00.jpg | 200, /uploads/types/6a13f25d5a5636b343b45a00.jpg, /uploads/types/6a13f25d5a5636b343b45a00_thumb.jpg, /uploads/types/6a13f25d5a5636b343b45a00.jpg |
| TC-PUA-11 | returns 400 for invalid file type on types | 400 | 400 |
| TC-PUA-12 | deletes a photo from an asset type | 200, null | 200, null |
| TC-PUA-13 | uploads a photo for an asset | 200, /uploads/assets/6a13f25e5a5636b343b45a1f.jpg, /uploads/assets/6a13f25e5a5636b343b45a1f_thumb.jpg, /uploads/assets/6a13f25e5a5636b343b45a1f.jpg | 200, /uploads/assets/6a13f25e5a5636b343b45a1f.jpg, /uploads/assets/6a13f25e5a5636b343b45a1f_thumb.jpg, /uploads/assets/6a13f25e5a5636b343b45a1f.jpg |
| TC-PUA-14 | returns 400 for invalid file type on assets | 400 | 400 |
| TC-PUA-15 | deletes a photo from an asset | 200, null | 200, null |
| TC-PUA-16 | deletes photo files when a group with photos is deleted | 200, 200, false, false | 200, 200, false, false |
| TC-PUA-17 | deletes photo files when a type with photos is deleted | 200, 200, false | 200, 200, false |
| TC-PUA-18 | deletes photo files when an asset with photos is deleted | 200, 200, false | 200, 200, false |
| TC-PUA-19 | cascades photo deletion when deleting a group with child type and asset photos | 200, 200, 200, 200, false, false, false | 200, 200, 200, 200, false, false, false |
| TC-PUA-20 | updates a group name and description | 200, Updated Name, A new description, Updated Name, A new description | 200, Updated Name, A new description, Updated Name, A new description |
| TC-PUA-21 | updates only the description (name unchanged) | 200, Keep This Name, Only description changed | 200, Keep This Name, Only description changed |
| TC-PUA-22 | updates only the name (description unchanged) | 200, New Name, Existing desc | 200, New Name, Existing desc |
| TC-PUA-23 | returns 400 for empty name | 400, Name cannot be empty | 400, Name cannot be empty |
| TC-PUA-24 | returns 404 for non-existent ID | 404 | 404 |
| TC-PUA-25 | returns 401 when unauthenticated | 401 | 401 |
| TC-PUA-26 | returns 403 when non-admin | 403 | 403 |
| TC-PUA-27 | works for types | 200, New Type, Type desc | 200, New Type, Type desc |
| TC-PUA-28 | works for assets | 200, New Asset, Asset desc | 200, New Asset, Asset desc |
| TC-PUA-29 | description field appears in GET responses | 200, {"name":"Desc Group","description":"test description","id":"6a13f2605a5636b343b45ab4"}, test description | 200, {"name":"Desc Group","description":"test description","id":"6a13f2605a5636b343b45ab4"}, test description |
| TC-PUA-30 | returns no description field when not set | 200, {"name":"No Desc","description":"","id":"6a13f2605a5636b343b45aba"},  | 200, {"name":"No Desc","description":"","id":"6a13f2605a5636b343b45aba"},  |
| TC-PUA-31 | updates pricePerDay for a type | 200, 25, 25 | 200, 25, 25 |
| TC-PUA-32 | updates pricePerDay to 0 for a type | 200, 0 | 200, 0 |
| TC-PUA-33 | ignores pricePerDay for a group | 200, undefined | 200, undefined |
| TC-PUA-34 | ignores pricePerDay for an asset | 200, undefined | 200, undefined |

---

## AssetStateMachine (State pattern)

38 tests (38 passed, 0 failed)

| Test Case ID | Description | Expected Output | Actual Output |
|---|---|---|---|
| TC-ASM-01 | can transition to Pending Rental | true | true |
| TC-ASM-02 | can transition to Maintenance | true | true |
| TC-ASM-03 | cannot transition directly to Rented (must go through Pending Rental) | false | false |
| TC-ASM-04 | cannot transition to Pending Return | false | false |
| TC-ASM-05 | returns correct valid transitions | ["Pending Rental","Maintenance"] | ["Pending Rental","Maintenance"] |
| TC-ASM-06 | should not clear rental data on any transition (no rental data to clear) | false, false | false, false |
| TC-ASM-07 | can transition to Rented (approve) | true | true |
| TC-ASM-08 | can transition to Available (deny) | true | true |
| TC-ASM-09 | should clear rental data when returning to Available (denying request) | true | true |
| TC-ASM-10 | should preserve rental data when transitioning to Rented (approving) | false | false |
| TC-ASM-11 | can transition to Pending Return | true | true |
| TC-ASM-12 | can transition to Maintenance | true | true |
| TC-ASM-13 | cannot transition directly to Available (must go through Pending Return) | false | false |
| TC-ASM-14 | cannot transition to Pending Rental (already rented) | false | false |
| TC-ASM-15 | can transition to Available (approve return) | true | true |
| TC-ASM-16 | can transition to Rented (deny return) | true | true |
| TC-ASM-17 | can transition to Maintenance | true | true |
| TC-ASM-18 | should clear rental data when transitioning to Available | true | true |
| TC-ASM-19 | should clear rental data when transitioning to Maintenance | true | true |
| TC-ASM-20 | should preserve rental data when transitioning back to Rented (deny) | false | false |
| TC-ASM-21 | returns correct valid transitions | ["Available","Rented","Maintenance"] | ["Available","Rented","Maintenance"] |
| TC-ASM-22 | can only transition to Available | true, false, false, false | true, false, false, false |
| TC-ASM-23 | returns correct valid transitions | ["Available"] | ["Available"] |
| TC-ASM-24 | allows any transition (admin has no status-based restrictions) | true, true, true | true, true, true |
| TC-ASM-25 | admin always passes ownership check | true, true, true | true, true, true |
| TC-ASM-26 | allows Rented and Pending Return (customer-facing statuses) | true, true | true, true |
| TC-ASM-27 | blocks Available (customers cannot put items into inventory) | false | false |
| TC-ASM-28 | blocks Maintenance (customers cannot put items into service) | false | false |
| TC-ASM-29 | blocks Pending Rental (customers cannot request rentals via status change) | false | false |
| TC-ASM-30 | passes ownership check when user owns the asset | true | true |
| TC-ASM-31 | fails ownership check when user does not own the asset | false | false |
| TC-ASM-32 | fails ownership check when asset has no rentedByUserId | false | false |
| TC-ASM-33 | rejects structurally valid but unauthorised transition (customer → Maintenance) | false | false |
| TC-ASM-34 | rejects structurally invalid but authorised transition (admin → Available→Rented) | false | false |
| TC-ASM-35 | allows structurally valid AND authorised transition (customer Rented→Pending Return) | true | true |
| TC-ASM-36 | throws on unknown status string | [Function], null | [Function], Error: Unknown asset status: "Unknown" |
| TC-ASM-37 | throws on empty status string | [Function], null | [Function], Error: Unknown asset status: "" |
| TC-ASM-38 | getCurrentStatus() returns the correct state name | Available, Maintenance | Available, Maintenance |

---

