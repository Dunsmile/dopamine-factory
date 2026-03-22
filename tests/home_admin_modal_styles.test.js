const fs = require('fs');
const path = require('path');
const assert = require('assert');

const css = fs.readFileSync(path.join(__dirname, '..', 'fe/public/assets/css/home.css'), 'utf8');

assert(css.includes('.nflx-admin-modal {'), 'expected admin modal root styles in home.css');
assert(css.includes('.nflx-admin-modal__box {'), 'expected admin modal box styles in home.css');
assert(css.includes('.nflx-admin-modal__submit {'), 'expected admin modal submit styles in home.css');

console.log('home admin modal styles ok');
