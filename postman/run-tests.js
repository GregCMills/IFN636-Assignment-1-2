require('dotenv').config({ path: __dirname + '/.env' });
const newman = require('newman');
const fs = require('fs');
const path = require('path');

const adminToken = process.env.POSTMAN_TOKEN;
if (!adminToken || adminToken === 'PASTE_YOUR_BEARER_TOKEN_HERE') {
  console.error('ERROR: Set your admin bearer token in postman/.env as POSTMAN_TOKEN=...');
  console.error('  Copy the token from Profile -> API Bearer Token (logged in as admin)');
  process.exit(1);
}

const imagePath = process.env.TEST_IMAGE_UPLOAD_PATH;
if (!imagePath || !fs.existsSync(imagePath)) {
  console.error('ERROR: Set TEST_IMAGE_UPLOAD_PATH in postman/.env to a valid image file');
  process.exit(1);
}

var collection = JSON.parse(fs.readFileSync(path.join(__dirname, 'rental-manager-postman-api-tests.json'), 'utf8'));

function injectImageSrc(items) {
  items.forEach(function (item) {
    if (item.item) return injectImageSrc(item.item);
    if (item.request && item.request.body && item.request.body.formdata) {
      item.request.body.formdata.forEach(function (field) {
        if (field.type === 'file' && field.key === 'photo') {
          field.src = imagePath;
        }
      });
    }
  });
}
injectImageSrc(collection.item);

const envPath = path.join(__dirname, 'Admin - Local.postman_environment.json');
const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));

function setEnvVar(key, value) {
  var v = env.values.find(function (e) { return e.key === key; });
  if (v) { v.value = value; }
  else { env.values.push({ key: key, value: value, type: 'secret', enabled: true }); }
}

setEnvVar('admin_token', adminToken);
console.log('Admin token injected.');

var customerToken = process.env.CUSTOMER_TOKEN;
if (customerToken) {
  setEnvVar('customer_token', customerToken);
  console.log('Customer token injected.');
} else {
  console.warn('WARNING: CUSTOMER_TOKEN not set in .env — 403 tests will use any existing env value.');
}

setEnvVar('TEST_IMAGE_UPLOAD_PATH', imagePath);

fs.writeFileSync(envPath, JSON.stringify(env, null, '\t') + '\n');

console.log('Running tests...\n');

newman.run(
  {
    collection: collection,
    environment: env,
    reporters: ['cli'],
    iterationCount: 1,
    timeout: 300000,
    delayRequest: 100,
    abortOnFailure: false,
  },
  function (err, summary) {
    if (err) {
      console.error('\nCollection run failed:', err);
      process.exit(1);
    }

    console.log('\n========================================');
    console.log('  TEST RESULTS SUMMARY');
    console.log('========================================');

    var stats = summary.run.stats;
    console.log('  Total requests:  ' + stats.requests.total);
    console.log('  Passed:          ' + (stats.requests.total - stats.requests.failed));
    console.log('  Failed:          ' + stats.requests.failed);
    console.log('  Assertions:      ' + stats.assertions.total);
    console.log('  Assertions OK:   ' + (stats.assertions.total - stats.assertions.failed));
    console.log('  Assertions FAIL: ' + stats.assertions.failed);

    if (summary.run.failures.length > 0) {
      console.log('\n  FAILURES:');
      summary.run.failures.forEach(function (f, i) {
        var name = (f.item && f.item.name) || (f.source && f.source.name) || 'Unknown';
        var parent = f.item && f.item.name ? name : 'Unknown';
        console.log('  ' + (i + 1) + '. ' + name + ' — ' + f.error.name + ': ' + f.error.message);
      });
    }

    console.log('\n========================================');
    if (stats.assertions.failed > 0) {
      process.exit(1);
    }
    console.log('  ALL TESTS PASSED');
    console.log('========================================\n');
  }
);
