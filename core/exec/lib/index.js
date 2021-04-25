'use strict';

const path = require('path');
const Package = require('@zjw-cli/package');
const log = require('@zjw-cli/log');
const { exec: spawn } = require('@zjw-cli/utils');

// 手动维护一张配置表，根据命令获取 package name，也可以在服务端配置通过接口请求方式获取。
const SETTINGS = {
    init: '@zjw-cli/init'
};

const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = '';
    let pkg;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    // 在 init 命令的 action 回调函数中会传递数据，可以通过 argument 获取
    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath);
        log.verbose('storeDir', storeDir);
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });
        if (await pkg.exists()) {
            // 更新package
            await pkg.update();
        } else {
            // 安装package
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });
    }

    // 获取 init 模块的入口路径，然后加载模块进行执行
    const rootFile = pkg.getRootFilePath();
    
    // 使用 apply 方法将 arguments 转换成参数列表形式
    if (rootFile) {
        try {
            // require(rootFile).call(null, Array.from(arguments));
            // 在node子进程中调用
            const args = Array.from(arguments);
            // 数组最后一项是 命令对象
            const cmd = args[args.length - 1];
            const o = Object.create(null);
            // 过滤 带_属性以及 parent
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                    o[key] = cmd[key];
                }
            });
            // 重新赋值 cmd
            args[args.length - 1] = o;
            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
            const child = spawn('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit'
            });
            child.on('error', e => {
                log.error(e.message);
                process.exit(1);
            });
            child.on('exit', e => {
                log.verbose('命令执行成功:' + e);
                process.exit(e);
            });
        } catch (err) {
            log.error(err.message);
        }
    }
}

module.exports = exec;
