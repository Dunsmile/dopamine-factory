const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const categoryUiJs = fs.readFileSync(path.join(root, 'fe/public/js/category-ui.js'), 'utf8');

assert(categoryUiJs.includes('loadSiteSettings'), 'category page should load site settings');
assert(categoryUiJs.includes('siteSettings.categories'), 'category page should prefer admin-managed category metadata');
assert(categoryUiJs.includes('meta.summary'), 'category page should still expose summary text');

console.log('category meta sync ok');
