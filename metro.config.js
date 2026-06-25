const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// تبدیل مسیر به file:// URL برای ویندوز
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// اگر با Uniwind مشکل داره، موقتاً غیرفعالش کن
// const { withUniwind } = require('uniwind/metro');
// module.exports = withUniwind(config);

module.exports = config;