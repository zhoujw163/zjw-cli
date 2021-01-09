#!/usr/bin/env node

const importLocal = require('import-local');

// 如果本地安装了脚手架，优先使用本地脚手架
if (importLocal(__filename)) {
    require('npmlog').info('cli', '正在使用本地 zjw-cli');
} else {
    require('../lib')(process.argv.slice(2));
}
