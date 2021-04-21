'use strict'

const request = require('@zjw-cli/request');

module.exports = function () {
    return request({
        url: '/project/template'
    });
};
