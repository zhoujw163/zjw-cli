/**
 * @description 自定义 npmlog
 */

'use strict';

const log = require('npmlog');

// 设置 log 的等级，以便支持 debug 模式
log.level = process.env.LOG_LEVEL || 'info'

// 扩展 log 方法
log.addLevel('success', 2000, { fg: 'green', bold: true });

// 添加前缀及设置前缀样式
log.heading = 'zjw'
// log.headingStyle = { fg: 'red', bg: 'white' }

module.exports = log;
