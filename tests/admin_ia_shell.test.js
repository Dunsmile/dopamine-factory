const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'fe/public/admin/index.html'), 'utf8');
const adminJs = fs.readFileSync(path.join(root, 'fe/public/admin/js/admin.js'), 'utf8');
const builderJs = fs.readFileSync(path.join(root, 'fe/public/admin/js/builder.js'), 'utf8');

assert(html.includes('data-page="home"'), 'expected home page nav item');
assert(html.includes('data-page="services"'), 'expected services page nav item');
assert(html.includes('data-page="analytics"'), 'expected analytics page nav item');
assert(!html.includes('운영 도구'), 'header operations shortcut should be removed from the primary shell');
assert(!html.includes('홈 보기'), 'header home shortcut should be removed from the primary shell');
assert(!html.includes('data-page="dashboard"'), 'dashboard should not remain a top-level nav item');
assert(!html.includes('data-page="sponsor"'), 'sponsor should not remain a top-level nav item');
assert(!html.includes('data-page="settings"'), 'settings should not remain a top-level nav item');

assert(adminJs.includes('home:'), 'expected home route in admin page map');
assert(adminJs.includes('services:'), 'expected services route in admin page map');
assert(adminJs.includes('analytics:'), 'expected analytics route in admin page map');
assert(!adminJs.includes('dashboard:'), 'dashboard route should be removed from page map');
assert(!adminJs.includes('sponsor:'), 'sponsor route should be removed from page map');
assert(!adminJs.includes('settings:'), 'settings route should be removed from page map');
assert(!builderJs.includes("_navigate('builder')"), 'builder flow should no longer navigate to a standalone builder page');
assert(builderJs.includes("_navigate('services', { tab: 'create' })"), 'builder flow should enter through the services create tab');
assert(adminJs.includes('서비스 검색'), 'services page should expose a search field');
assert(adminJs.includes('카테고리 필터'), 'services page should expose a category filter');
assert(adminJs.includes('서비스 인벤토리'), 'services page should frame the inventory surface');
assert(adminJs.includes('검색 결과가 없습니다'), 'services page should define an empty-search state');
assert(adminJs.includes('홈 섹션 프리뷰'), 'home page should include section previews');
assert(adminJs.includes('전체 보기'), 'home section management should keep the default all-services section');
assert(adminJs.includes('__admAddCategory'), 'home section management should allow adding categories');
assert(adminJs.includes('__admDeleteCategory'), 'home section management should allow deleting categories');
assert(adminJs.includes('sectionAssignments'), 'home section management should persist explicit section assignments');
assert(adminJs.includes('홈 관리에서 보기'), 'service detail should offer a jump back to home management');
assert(adminJs.includes('선택한 서비스'), 'home page should show focused service context');
assert(adminJs.includes('서비스 관리 다시 열기'), 'focused home context should offer a quick return to service management');
assert(adminJs.includes('푸터 브랜드 설명'), 'home footer management should expose footer copy controls');
assert(adminJs.includes('지원 이메일'), 'home footer management should expose contact controls');
assert(adminJs.includes('__admSaveHomeFooter'), 'home footer management should save through a dedicated action');
assert(adminJs.includes('프로모션 추천'), 'analytics page should include promotion recommendations');
assert(adminJs.includes('홈 섹션에서 보기'), 'analytics recommendations should jump into the home management context');
assert(!adminJs.includes('실제 홈 새 탭으로 열기'), 'banner view should remove the redundant home shortcut');
assert(!adminJs.includes('HTML 미리보기'), 'fallback tools should remove the unused preview shortcut');
assert(!adminJs.includes('애드센스 현황'), 'analytics page should not keep the old adsense block');

console.log('admin ia shell ok');
