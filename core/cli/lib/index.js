'use strict';

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const commander = require('commander')
const log = require('@zjw-cli/log');

const pkg = require('../package.json');
const constant = require('./const');

async function core() {
    try {
        checkVersion();
        checkNodeVersion();
        checkRoot();
        checkUserHome();
        // checkInputArgs();
        // log.verbose('debug', 'test debug modal');
        checkEnv();
        await checkGlobalUpdate();
        registerCommand();
    } catch (error) {
        log.error(error.message)
    }
}

/**
 * @description 检查版本号，提示用户升级
 */
function checkVersion() {
    log.notice('cli', pkg.version);
}

/**
 * @description 检查 node 版本，处理低版本 node 不兼容，提示用户升级 node
 */
function checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`当前 node 版本：${currentVersion}，最低 node 版本：${lowestVersion}，请升级 node`));
    }
}

/**
 * @description 检查 root 账号并自动降级
 */
function checkRoot() {
    const rootCheck = require('root-check');
    rootCheck()
}

/**
 * @description 检查用户主目录，主目录不存在会影响后续缓存
 */
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error('当前登录用户主目录不存在')
    }
}

/**
 * @description 检查入参
 */
function checkInputArgs() {
    const args = require('minimist')(process.argv.slice(2));
    checkArgs(args)
}

/**
 * @description 更加入参动态修改 log level，开启 debug 模式
 * @param {Object} args 
 */
function checkArgs(args) {
    log.level = args.debug ? 'verbose' : 'info';
}

function checkEnv() {
    const dotenvPath = path.resolve(userHome, '.env')
    // 读取 .env 文件中的数据，并配置到环境变量中
    require('dotenv').config({ path: dotenvPath });
    createDefaultConfig();
    log.verbose('环境变量缓存文件路径', process.env.CLI_HOME_PATH)
}

/**
 * @description 创建环境变量缓存文件路径
 */
function createDefaultConfig() {
    const cliConfig = {};
    cliConfig.cliHomePath = process.env.CLI_HOME
        ? path.join(userHome, process.env.CLI_HOME)
        : path.join(userHome, constant.DEFAULT_CLI_HOME);
    process.env.CLI_HOME_PATH = cliConfig.cliHomePath;
}

async function checkGlobalUpdate() {
    const { getNpmSemverVersion } = require('@zjw-cli/get-npm-info');
    const lastVersion = await getNpmSemverVersion(pkg.version, pkg.name);
    if (lastVersion && semver.gt(lastVersion, pkg.version)) {
        throw new Error(colors.red(`请升级版本，最新版本：${lastVersion}，升级命令：npm i ${pkg.name} -g`));
    }

}

function registerCommand() {
    const program = new commander.Command();
    // 获取命令行 option
    const opts = program.opts();

    program
        .name(Object.keys(pkg.bin)[0])
        .version(pkg.version)
        .usage('<command> [option]')
        .option('-d, --debug', '开启本地调试', false);

    // 开启 debug 模式
    program.on('option:debug', () => {
        process.env.LOG_LEVEL = opts.debug ? 'verbose' : 'info';
        log.level = process.env.LOG_LEVEL;
        log.verbose('start debug modal')
    });

    // 注册 init 命令
    program
        .command('init [projectName]')
        .description('创建项目')
        .option('-f, --force', '是否强制创建项目', false)
        .action((projectName, cmdObj) => {
            console.log(projectName, cmdObj)
        });

    // 监听未知命令
    program.on('command:*', (obj) => {
        const availableCommands = program.commands.map(cmd => cmd.name());
        log.info(colors.red(`未知命令：${obj[0]}`));
        availableCommands.length && log.info(colors.green(`可用命令：${availableCommands.join(', ')}`));
    })

    program.parse(process.argv);

    if (program.args && program.args.length < 1) {
        program.outputHelp();
        console.log();
    }
}

module.exports = core;
