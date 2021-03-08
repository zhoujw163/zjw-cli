'use strict';

const Command = require('@zjw-cli/command');

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._argv[1].force;
        console.log(this.projectName, this.force, this._argv);
    }

    exec() {
        console.log('init 业务逻辑');
    }
}

function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
