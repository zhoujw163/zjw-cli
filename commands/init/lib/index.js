'use strict';

function init(projectName, cmdObj) {
    console.log(projectName, 'cmdObj: ', cmdObj, process.env.CLI_TARGET_PATH);
}

module.exports = init;
