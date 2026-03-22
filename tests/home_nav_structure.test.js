const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'fe/public/index.html'), 'utf8');
const homeDataJs = fs.readFileSync(path.join(root, 'fe/public/js/home.data.js'), 'utf8');
const netflixUiJs = fs.readFileSync(path.join(root, 'fe/public/js/netflix-ui.js'), 'utf8');
const navBlock = html.slice(html.indexOf('id="nflx-nav-links"'), html.indexOf('</ul>', html.indexOf('id="nflx-nav-links"')));

assert(html.includes('id="nflx-nav-links"'), 'home nav should expose a dynamic nav links container');
assert(html.includes('id="nflx-footer-service-links"'), 'home footer should expose a dynamic service links container');
assert(html.includes('id="nflx-footer-brand-copy"'), 'home footer should expose a dynamic brand copy container');
assert(!navBlock.includes('/category/fortune/'), 'home nav should not keep hardcoded category links');
assert(homeDataJs.includes('sectionAssignments'), 'home data should understand home section assignments');
assert(homeDataJs.includes('getHomeSections'), 'home data should expose derived home section metadata');
assert(netflixUiJs.includes('loadSiteSettings'), 'home ui should load site settings for dynamic nav');
assert(netflixUiJs.includes('renderNavLinks'), 'home ui should render nav links dynamically');
assert(netflixUiJs.includes('renderFooterContent'), 'home ui should render footer content dynamically');
assert(netflixUiJs.includes('전체 보기'), 'home ui should include the default all-services nav item');

console.log('home nav structure ok');
