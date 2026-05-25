// ============================================================
// Postman Test Scripts Reference
// Rental Manager API
// ============================================================
// This file documents all test assertions used in the Postman
// collection for reference and code review purposes.
// The actual test scripts live in the collection JSON.
// ============================================================

// ============================================================
// 1. AUTH
// ============================================================

// --- Get Profile ---
pm.test('Status is 200 or 404', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});

// --- Update Profile ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Profile has address', function () {
    var json = pm.response.json();
    pm.expect(json.address).to.eql('123 Test St');
});

// ============================================================
// 2. GROUPS
// ============================================================

// --- List Groups (before) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Returns an array', function () {
    pm.expect(pm.response.json()).to.be.an('array');
});

// --- Create Group ---
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
pm.test('Group has an id', function () {
    var json = pm.response.json();
    pm.expect(json.id).to.be.a('string');
});
// Saves: pm.environment.set('group_id', json.id);

// --- Update Group ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Name was updated', function () {
    pm.expect(pm.response.json().name).to.eql('Updated Test Group');
});

// --- Upload Group Photo ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});

// --- Delete Group Photo ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Response contains success', function () {
    pm.expect(pm.response.json().success).to.be.true;
});

// ============================================================
// 3. TYPES
// ============================================================

// --- List Types (before) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Returns an array', function () {
    pm.expect(pm.response.json()).to.be.an('array');
});

// --- Create Type ---
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
pm.test('Type has an id', function () {
    var json = pm.response.json();
    pm.expect(json.id).to.be.a('string');
});
// Saves: pm.environment.set('type_id', json.id);

// --- Update Type ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Name was updated', function () {
    pm.expect(pm.response.json().name).to.eql('Updated Test Type');
});

// --- Upload Type Photo ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});

// --- Delete Type Photo ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Response contains success', function () {
    pm.expect(pm.response.json().success).to.be.true;
});

// ============================================================
// 4. ASSETS
// ============================================================

// --- Create Asset ---
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
pm.test('Asset is Available', function () {
    var json = pm.response.json();
    pm.expect(json.status).to.eql('Available');
});
// Saves: pm.environment.set('asset_id_1', json.id);

// --- Batch Create Assets ---
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
pm.test('Created 3 assets', function () {
    var json = pm.response.json();
    pm.expect(json.length).to.eql(3);
});
// Saves: asset_id_2, asset_id_3, asset_id_4

// --- List Assets ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Returns an array', function () {
    pm.expect(pm.response.json()).to.be.an('array');
});
pm.test('At least 4 test assets exist', function () {
    pm.expect(pm.response.json().length).to.be.at.least(4);
});

// --- Filter by Name ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('All results contain Camera', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.name.toLowerCase()).to.include('camera');
    });
});

// --- Filter by Status (Available) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('All results are Available', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.status).to.eql('Available');
    });
});

// --- Filter by Type ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('All results have correct typeId', function () {
    var json = pm.response.json();
    var typeId = pm.environment.get('type_id');
    json.forEach(function (a) {
        pm.expect(a.typeId).to.eql(typeId);
    });
});

// --- Filter by Group ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Returns an array', function () {
    pm.expect(pm.response.json()).to.be.an('array');
});

// --- Update Asset ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Name was updated', function () {
    pm.expect(pm.response.json().name).to.eql('Renamed Camera');
});
pm.test('Description was updated', function () {
    pm.expect(pm.response.json().description).to.eql('Updated by Postman test');
});

// --- Upload Asset Photo ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});

// --- Delete Asset Photo ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Response contains success', function () {
    pm.expect(pm.response.json().success).to.be.true;
});

// ============================================================
// 5. RENTAL WORKFLOW
// ============================================================

// --- Calculate Rental Cost ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Has grandTotal', function () {
    var json = pm.response.json();
    pm.expect(json.grandTotal).to.be.a('number');
});
pm.test('Has items breakdown', function () {
    var json = pm.response.json();
    pm.expect(json.items).to.be.an('array');
});
pm.test('Has days field', function () {
    var json = pm.response.json();
    pm.expect(json.days).to.be.a('number');
});

// --- Request Rental ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Assets are Pending Rental', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.status).to.eql('Pending Rental');
    });
});
pm.test('Assets have rentedByUserId', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.rentedByUserId).to.be.a('string');
    });
});

// --- Approve Rental (to Rented) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Assets are Rented', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.status).to.eql('Rented');
    });
});
pm.test('Assets have rentedAt', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.rentedAt).to.be.a('string');
    });
});

// --- Request Extension ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Extension date is set', function () {
    pm.expect(pm.response.json().extensionRequestedReturnDate).to.eql('2026-06-15');
});

// --- Approve Extension ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Return date updated', function () {
    var a = pm.response.json()[0];
    pm.expect(a.returnDate).to.eql('2026-06-15');
});
pm.test('Extension request cleared', function () {
    var a = pm.response.json()[0];
    pm.expect(a.extensionRequestedReturnDate == null).to.be.true;
});

// --- Request Return (to Pending Return) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Assets are Pending Return', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.status).to.eql('Pending Return');
    });
});

// --- Complete Return (to Available) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Assets are Available again', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.status).to.eql('Available');
    });
});
pm.test('Rental data is cleared', function () {
    var json = pm.response.json();
    json.forEach(function (a) {
        pm.expect(a.rentedByUserId == null).to.be.true;
        pm.expect(a.returnDate == null).to.be.true;
    });
});

// --- Send to Maintenance ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Asset is Maintenance', function () {
    pm.expect(pm.response.json()[0].status).to.eql('Maintenance');
});

// ============================================================
// 6. REPORTS AND HISTORY
// ============================================================

// --- Reports Overview ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Has statusCounts', function () {
    var json = pm.response.json();
    pm.expect(json.statusCounts).to.be.an('object');
});
pm.test('Has topRented', function () {
    var json = pm.response.json();
    pm.expect(json.topRented).to.be.an('array');
});
pm.test('Has totalAssets', function () {
    var json = pm.response.json();
    pm.expect(json.totalAssets).to.be.a('number');
});
pm.test('Has overdueCount', function () {
    var json = pm.response.json();
    pm.expect(json.overdueCount).to.be.a('number');
});

// --- Rental History ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Returns an array', function () {
    pm.expect(pm.response.json()).to.be.an('array');
});
pm.test('Records have required fields', function () {
    var json = pm.response.json();
    if (json.length > 0) {
        var r = json[0];
        pm.expect(r).to.have.property('id');
        pm.expect(r).to.have.property('assetId');
        pm.expect(r).to.have.property('assetName');
        pm.expect(r).to.have.property('finalStatus');
        pm.expect(r).to.have.property('completedAt');
    }
});

// ============================================================
// 7. CLEANUP
// ============================================================

// --- Delete Asset (single) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Response contains success', function () {
    pm.expect(pm.response.json().success).to.be.true;
});

// --- Delete Type (cascade-deletes remaining assets) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Response contains success', function () {
    pm.expect(pm.response.json().success).to.be.true;
});

// --- Delete Group (cascade-deletes remaining types and assets) ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Response contains success', function () {
    pm.expect(pm.response.json().success).to.be.true;
});

// ============================================================
// RESET SEED DATA
// ============================================================

// --- Reset to Seed Data ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
pm.test('Has assets array', function () {
    var json = pm.response.json();
    pm.expect(json.assets).to.be.an('array');
});
pm.test('Has assetTypes array', function () {
    var json = pm.response.json();
    pm.expect(json.assetTypes).to.be.an('array');
});
pm.test('Has productGroups array', function () {
    var json = pm.response.json();
    pm.expect(json.productGroups).to.be.an('array');
});

// ============================================================
// 8. ERROR HANDLING
// ============================================================

// --- Setup: Create test group for error tests ---
// Pre-request: (none - uses collection auth)
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
// Saves: pm.environment.set('err_group_id', pm.response.json().id);

// --- Setup: Create test type for error tests ---
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
// Saves: pm.environment.set('err_type_id', pm.response.json().id);

// --- Setup: Create test asset for error tests ---
pm.test('Status is 201', function () {
    pm.response.to.have.status(201);
});
// Saves: pm.environment.set('err_asset_id', pm.response.json().id);

// --- 400 - Create group without name ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});
pm.test('Error message present', function () {
    pm.expect(pm.response.json().message).to.be.a('string');
});

// --- 400 - Create group with blank name ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Create type without groupId ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Create type without name ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Create asset without typeId ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Create asset without name ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Batch create with empty names array ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Bulk status without ids ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Request rental without items ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Request rental without returnDate ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Extension with date not later than current ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 400 - Extension resolve without pending request ---
pm.test('Status is 400', function () {
    pm.response.to.have.status(400);
});

// --- 401 - Get groups without token ---
// Pre-request: removes Authorization header
//   pm.request.headers.remove('Authorization');
//   pm.request.headers.add({ key: 'Authorization', value: '' });
pm.test('Status is 401', function () {
    pm.response.to.have.status(401);
});
pm.test('Error message present', function () {
    pm.expect(pm.response.json().message).to.be.a('string');
});

// --- 401 - Create group without token ---
// Pre-request: removes Authorization header
pm.test('Status is 401', function () {
    pm.response.to.have.status(401);
});

// --- 401 - Delete group without token ---
// Pre-request: removes Authorization header
pm.test('Status is 401', function () {
    pm.response.to.have.status(401);
});

// --- 401 - Get rental history without token ---
// Pre-request: removes Authorization header
pm.test('Status is 401', function () {
    pm.response.to.have.status(401);
});

// --- 403 - Customer cannot create group ---
// Pre-request: overrides auth with customer_token from environment
//   var customerToken = pm.environment.get('customer_token');
//   pm.request.headers.remove('Authorization');
//   pm.request.headers.add({ key: 'Authorization', value: 'Bearer ' + customerToken });
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});
pm.test('Error message present', function () {
    pm.expect(pm.response.json().message).to.be.a('string');
});

// --- 403 - Customer cannot delete group ---
// Pre-request: overrides auth with customer_token
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});

// --- 403 - Customer cannot create type ---
// Pre-request: overrides auth with customer_token
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});

// --- 403 - Customer cannot create asset ---
// Pre-request: overrides auth with customer_token
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});

// --- 403 - Customer cannot delete asset ---
// Pre-request: overrides auth with customer_token
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});

// --- 403 - Customer cannot set status to Maintenance ---
// Pre-request: overrides auth with customer_token
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});

// --- 403 - Customer cannot resolve extension requests ---
// Pre-request: overrides auth with customer_token
pm.test('Status is 403', function () {
    pm.response.to.have.status(403);
});

// --- 404 - Get non-existent group ---
pm.test('Status is 404', function () {
    pm.response.to.have.status(404);
});
pm.test('Error message present', function () {
    pm.expect(pm.response.json().message).to.be.a('string');
});

// --- 404 - Delete non-existent group ---
pm.test('Status is 404', function () {
    pm.response.to.have.status(404);
});

// --- 404 - Delete non-existent type ---
pm.test('Status is 404', function () {
    pm.response.to.have.status(404);
});

// --- 404 - Delete non-existent asset ---
pm.test('Status is 404', function () {
    pm.response.to.have.status(404);
});

// --- 409 - Request rental with insufficient stock ---
pm.test('Status is 409', function () {
    pm.response.to.have.status(409);
});
pm.test('Error message about availability', function () {
    pm.expect(pm.response.json().message).to.include('available');
});

// --- Cleanup - Delete error test data ---
pm.test('Status is 200', function () {
    pm.response.to.have.status(200);
});
