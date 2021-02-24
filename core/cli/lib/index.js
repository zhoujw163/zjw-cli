'use strict';

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const commander = require('commander')
const log = require('@zjw-cli/log');
const init = require('@zjw-cli/init');
const exec = require('@zjw-cli/exec');
const pkg = require('../package.json');
const constant = require('./const');

async function core() {
    try {
        await prepare();
        registerCommand();
    } catch (error) {
        log.error(error.message)
    }
}

async function prepare() {
    checkVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkEnv();
    await checkGlobalUpdate();
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
 * @description 检查环境变量
 */
function checkEnv() {
    const dotenvPath = path.resolve(userHome, '.env')
    // 读取 .env 文件中的数据，并配置到环境变量中
    require('dotenv').config({ path: dotenvPath });
    createDefaultConfig();
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

/**
 * @description 检查新版本
 */
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
        .option('-d, --debug', '开启本地调试', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');

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
        .action(init)
        // 动态加载的 init action 是无法获取全局 opts 的，可以通过以下两种方法
        // 方法一：脚手架中通过 program.opts() 来获取全局 opts，再传递给 init action
        // .action((projectName, cmdObj) => {
        //     console.log('projectName, cmdObj: ', projectName, cmdObj, opts);
        //     init(projectName, cmdObj, opts);
        // });

        // 方法二： 通过 on 监听 option，将需要使用的 option值存储在环境变量中，因为参数解析是优先执行的
        // 相同的道理，addCommander 注册的二级命令也是一样的处理方法

    program.on('option:targetPath', (targetPath) => {
        process.env.CLI_TARGET_PATH = targetPath; // 或者通过 program.opts() 获取
    })

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
