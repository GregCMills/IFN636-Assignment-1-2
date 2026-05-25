## Test Case Results

**Total:** 185 | **Passed:** 185 | **Failed:** 0

| Test Case ID | Expected Output | Actual Output |
|---|---|---|
| TC-CAA-01 | maps all fields from a complete Clerk user | Pass |
| TC-CAA-02 | returns empty string for email when emailAddresses is empty | Pass |
| TC-CAA-03 | returns empty string for email when emailAddress is missing | Pass |
| TC-CAA-04 | returns null for name when both first and last are null | Pass |
| TC-CAA-05 | returns firstName alone when lastName is missing | Pass |
| TC-CAA-06 | returns lastName alone when firstName is missing | Pass |
| TC-CAA-07 | filters out empty-string name parts (filter(Boolean)) | Pass |
| TC-CAA-08 | returns null for role when publicMetadata is missing | Pass |
| TC-CAA-09 | returns null for role when publicMetadata has no role field | Pass |
| TC-CAA-10 | preserves the original Clerk user id | Pass |
| TC-CAA-11 | handles Clerk v2 style — req.auth as function returning object | Pass |
| TC-CAA-12 | returns undefined when req.auth() returns null (v2, logged out) | Pass |
| TC-CAA-13 | handles Clerk v1 style — req.auth as a plain object | Pass |
| TC-CAA-14 | returns undefined when req.auth is an object without userId | Pass |
| TC-CAA-15 | returns a normalised user for a valid ID | Pass |
| TC-CAA-16 | calls clerkClient.users.getUser with the correct ID | Pass |
| TC-CAA-17 | returns empty object for an empty array | Pass |
| TC-CAA-18 | returns empty object for null | Pass |
| TC-CAA-19 | returns empty object for undefined | Pass |
| TC-CAA-20 | returns a map keyed by user ID for valid IDs | Pass |
| TC-CAA-21 | returns empty object when clerkClient throws | Pass |
| TC-CAA-22 | calls getUserList with the provided userIds | Pass |
| TC-CAA-23 | calls next() when user role is admin | Pass |
| TC-CAA-24 | responds 403 when user role is not admin | Pass |
| TC-CAA-25 | responds 403 when getUser throws | Pass |
| TC-CAA-26 | returns a function (middleware) | Pass |
| TC-CAA-27 | returns a function (middleware) | Pass |
| TC-AMA-01 | returns an empty array when no groups exist | Pass |
| TC-AMA-02 | returns groups sorted alphabetically by name | Pass |
| TC-AMA-03 | returns 401 when unauthenticated | Pass |
| TC-AMA-04 | creates a group and returns it with an id | Pass |
| TC-AMA-05 | trims whitespace from the name | Pass |
| TC-AMA-06 | returns 400 when name is missing | Pass |
| TC-AMA-07 | returns 400 when name is blank whitespace | Pass |
| TC-AMA-08 | returns 403 when user is not admin | Pass |
| TC-AMA-09 | returns 401 when unauthenticated | Pass |
| TC-AMA-10 | deletes a group that has no children | Pass |
| TC-AMA-11 | cascade-deletes child types and their assets | Pass |
| TC-AMA-12 | only removes children belonging to the deleted group | Pass |
| TC-AMA-13 | returns 403 when user is not admin | Pass |
| TC-AMA-14 | returns 401 when unauthenticated | Pass |
| TC-AMA-15 | returns an empty array when no types exist | Pass |
| TC-AMA-16 | returns types sorted alphabetically | Pass |
| TC-AMA-17 | creates a type and returns it with id and groupId | Pass |
| TC-AMA-18 | returns 400 when groupId is missing | Pass |
| TC-AMA-19 | returns 400 when name is missing | Pass |
| TC-AMA-20 | returns 403 when user is not admin | Pass |
| TC-AMA-21 | deletes a type with no assets | Pass |
| TC-AMA-22 | cascade-deletes all assets belonging to the type | Pass |
| TC-AMA-23 | only removes assets belonging to the deleted type | Pass |
| TC-AMA-24 | returns 403 when user is not admin | Pass |
| TC-AMA-25 | returns an empty array when no assets exist | Pass |
| TC-AMA-26 | returns all assets | Pass |
| TC-AMA-27 | creates an asset with status Available by default | Pass |
| TC-AMA-28 | returns 400 when typeId is missing | Pass |
| TC-AMA-29 | returns 400 when name is missing | Pass |
| TC-AMA-30 | returns 403 when user is not admin | Pass |
| TC-AMA-31 | creates multiple assets in one request | Pass |
| TC-AMA-32 | all batch-created assets are Available and belong to the correct type | Pass |
| TC-AMA-33 | returns 400 when names array is empty | Pass |
| TC-AMA-34 | returns 400 when typeId is missing | Pass |
| TC-AMA-35 | returns 403 when user is not admin | Pass |
| TC-AMA-36 | deletes an asset | Pass |
| TC-AMA-37 | returns 403 when user is not admin | Pass |
| TC-AMA-38 | admin can update status for multiple assets at once | Pass |
| TC-AMA-39 | clears rentedByUserId and returnDate when clearRentalData is true | Pass |
| TC-AMA-40 | preserves rental data when clearRentalData is false | Pass |
| TC-AMA-41 | clears rental data by default when state machine says so (no clearRentalData flag) | Pass |
| TC-AMA-42 | returns 400 when ids array is missing | Pass |
| TC-AMA-43 | customer can transition their own asset Rented → Pending Return | Pass |
| TC-AMA-44 | customer cannot set status to Maintenance | Pass |
| TC-AMA-45 | customer cannot update assets they do not own | Pass |
| TC-AMA-46 | admin can approve a return — asset transitions to Available and rental data is cleared | Pass |
| TC-AMA-47 | admin can send a returned asset to Maintenance — rental data is cleared | Pass |
| TC-AMA-48 | admin can deny a return — asset goes back to Rented and rental data is preserved | Pass |
| TC-AMA-49 | admin can approve multiple Pending Return assets in a single request | Pass |
| TC-AMA-50 | customer can cancel their own Pending Return (back to Rented) | Pass |
| TC-AMA-51 | customer cannot approve or deny a Pending Return (admin-only transition to Available) | Pass |
| TC-AMA-52 | customer cannot send a Pending Return to Maintenance | Pass |
| TC-AMA-53 | marks available assets as Pending Rental for the requesting customer | Pass |
| TC-AMA-54 | returns 409 when not enough units are available | Pass |
| TC-AMA-55 | only picks up Available assets (not Rented, Maintenance, etc.) | Pass |
| TC-AMA-56 | returns 400 when items array is missing | Pass |
| TC-AMA-57 | returns 400 when returnDate is missing | Pass |
| TC-AMA-58 | customer can request an extension for their own rented asset | Pass |
| TC-AMA-59 | rejects extension requests that are not later than the current return date | Pass |
| TC-AMA-60 | customer cannot request extension for another user's rental | Pass |
| TC-AMA-61 | prevents duplicate pending extension requests for the same asset | Pass |
| TC-AMA-62 | admin can approve extension requests and update returnDate | Pass |
| TC-AMA-63 | admin can deny extension requests and keep existing returnDate | Pass |
| TC-AMA-64 | rejects non-admin attempts to resolve extension requests | Pass |
| TC-AMA-65 | rejects decisions for assets without pending extension requests | Pass |
| TC-AMA-66 | returns an empty array when no history exists | Pass |
| TC-AMA-67 | returns 401 when unauthenticated | Pass |
| TC-AMA-68 | records a history entry when an asset is approved for return (Pending Return → Available) | Pass |
| TC-AMA-69 | records a history entry when an asset is approved for return with Maintenance status | Pass |
| TC-AMA-70 | does not record a history entry when a return is denied (Pending Return → Pending Rental) | Pass |
| TC-PR-01 | should return 401 when no Clerk session is present | Pass |
| TC-PR-02 | should return 404 when the authenticated user has no profile in the database | Pass |
| TC-PR-03 | should return the profile for an authenticated user | Pass |
| TC-PR-04 | should return 401 when no Clerk session is present | Pass |
| TC-PR-05 | should update and return the profile for an authenticated user | Pass |
| TC-ICC-01 | builds a tree with the correct parent-child relationships | Pass |
| TC-ICC-02 | returns null for a non-existent group | Pass |
| TC-ICC-03 | builds a tree where group delete cascades to all descendants | Pass |
| TC-ICC-04 | only removes children belonging to the deleted group | Pass |
| TC-ICC-05 | builds a tree with the correct child count | Pass |
| TC-ICC-06 | returns null for a non-existent type | Pass |
| TC-ICC-07 | cascade-deletes all assets belonging to the type | Pass |
| TC-ICC-08 | only removes assets belonging to the deleted type | Pass |
| TC-ICC-09 | builds a leaf node with no children | Pass |
| TC-ICC-10 | returns null for a non-existent asset | Pass |
| TC-ICC-11 | deletes the asset | Pass |
| TC-ICC-12 | returns an empty array when no photo fields are set | Pass |
| TC-ICC-13 | collects photo paths from all levels of the tree | Pass |
| TC-ICC-14 | calls storageStrategy.delete for each photo | Pass |
| TC-ICC-15 | skips photo deletion when storageStrategy is null | Pass |
| TC-PUA-01 | uploads a photo for a group and sets imageUrl/thumbnailUrl | Pass |
| TC-PUA-02 | replaces an existing photo (old files deleted, new ones saved) | Pass |
| TC-PUA-03 | returns 400 when no file is attached | Pass |
| TC-PUA-04 | returns 400 for invalid file type | Pass |
| TC-PUA-05 | returns 403 when user is not admin | Pass |
| TC-PUA-06 | returns 401 when unauthenticated | Pass |
| TC-PUA-07 | deletes a photo and clears DB fields | Pass |
| TC-PUA-08 | succeeds silently when no photo exists | Pass |
| TC-PUA-09 | returns 403 when user is not admin | Pass |
| TC-PUA-10 | uploads a photo for an asset type | Pass |
| TC-PUA-11 | returns 400 for invalid file type on types | Pass |
| TC-PUA-12 | deletes a photo from an asset type | Pass |
| TC-PUA-13 | uploads a photo for an asset | Pass |
| TC-PUA-14 | returns 400 for invalid file type on assets | Pass |
| TC-PUA-15 | deletes a photo from an asset | Pass |
| TC-PUA-16 | deletes photo files when a group with photos is deleted | Pass |
| TC-PUA-17 | deletes photo files when a type with photos is deleted | Pass |
| TC-PUA-18 | deletes photo files when an asset with photos is deleted | Pass |
| TC-PUA-19 | cascades photo deletion when deleting a group with child type and asset photos | Pass |
| TC-PUA-20 | updates a group name and description | Pass |
| TC-PUA-21 | updates only the description (name unchanged) | Pass |
| TC-PUA-22 | updates only the name (description unchanged) | Pass |
| TC-PUA-23 | returns 400 for empty name | Pass |
| TC-PUA-24 | returns 404 for non-existent ID | Pass |
| TC-PUA-25 | returns 401 when unauthenticated | Pass |
| TC-PUA-26 | returns 403 when non-admin | Pass |
| TC-PUA-27 | works for types | Pass |
| TC-PUA-28 | works for assets | Pass |
| TC-PUA-29 | description field appears in GET responses | Pass |
| TC-PUA-30 | returns no description field when not set | Pass |
| TC-ASM-01 | can transition to Pending Rental | Pass |
| TC-ASM-02 | can transition to Maintenance | Pass |
| TC-ASM-03 | cannot transition directly to Rented (must go through Pending Rental) | Pass |
| TC-ASM-04 | cannot transition to Pending Return | Pass |
| TC-ASM-05 | returns correct valid transitions | Pass |
| TC-ASM-06 | should not clear rental data on any transition (no rental data to clear) | Pass |
| TC-ASM-07 | can transition to Rented (approve) | Pass |
| TC-ASM-08 | can transition to Available (deny) | Pass |
| TC-ASM-09 | should clear rental data when returning to Available (denying request) | Pass |
| TC-ASM-10 | should preserve rental data when transitioning to Rented (approving) | Pass |
| TC-ASM-11 | can transition to Pending Return | Pass |
| TC-ASM-12 | can transition to Maintenance | Pass |
| TC-ASM-13 | cannot transition directly to Available (must go through Pending Return) | Pass |
| TC-ASM-14 | cannot transition to Pending Rental (already rented) | Pass |
| TC-ASM-15 | can transition to Available (approve return) | Pass |
| TC-ASM-16 | can transition to Rented (deny return) | Pass |
| TC-ASM-17 | can transition to Maintenance | Pass |
| TC-ASM-18 | should clear rental data when transitioning to Available | Pass |
| TC-ASM-19 | should clear rental data when transitioning to Maintenance | Pass |
| TC-ASM-20 | should preserve rental data when transitioning back to Rented (deny) | Pass |
| TC-ASM-21 | returns correct valid transitions | Pass |
| TC-ASM-22 | can only transition to Available | Pass |
| TC-ASM-23 | returns correct valid transitions | Pass |
| TC-ASM-24 | allows any transition (admin has no status-based restrictions) | Pass |
| TC-ASM-25 | admin always passes ownership check | Pass |
| TC-ASM-26 | allows Rented and Pending Return (customer-facing statuses) | Pass |
| TC-ASM-27 | blocks Available (customers cannot put items into inventory) | Pass |
| TC-ASM-28 | blocks Maintenance (customers cannot put items into service) | Pass |
| TC-ASM-29 | blocks Pending Rental (customers cannot request rentals via status change) | Pass |
| TC-ASM-30 | passes ownership check when user owns the asset | Pass |
| TC-ASM-31 | fails ownership check when user does not own the asset | Pass |
| TC-ASM-32 | fails ownership check when asset has no rentedByUserId | Pass |
| TC-ASM-33 | rejects structurally valid but unauthorised transition (customer → Maintenance) | Pass |
| TC-ASM-34 | rejects structurally invalid but authorised transition (admin → Available→Rented) | Pass |
| TC-ASM-35 | allows structurally valid AND authorised transition (customer Rented→Pending Return) | Pass |
| TC-ASM-36 | throws on unknown status string | Pass |
| TC-ASM-37 | throws on empty status string | Pass |
| TC-ASM-38 | getCurrentStatus() returns the correct state name | Pass |

