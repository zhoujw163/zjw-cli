'use strict';

const path = require('path');

module.exports = function formatPath(p) {
    if (typeof p === 'string') {
        // path.sep => 路径的分割符 Windows： \ ； macOS： /
        const sep = path.sep;
        if (sep === '/') {
            return p;
        } else {
            return p.replace(/\\/g, '/');
        }
    }
    return p;
};
