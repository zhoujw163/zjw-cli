'use strict';

const path = require('path');
const Package = require('@zjw-cli/package');
const log = require('@zjw-cli/log');

// 手动维护一张配置表，根据命令获取 package name，也可以在服务端配置通过接口请求方式获取。
const SETTINGS = {
    // init: '@zjw-cli/init'
    init:'@imooc-cli/init'
}

const CACHE_DIR = 'dependencies/';

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
        // 生成缓存路径
        targetPath = path.resolve(homePath, CACHE_DIR);
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath);
        log.verbose('storeDir', storeDir);

        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });
    
        // 本地存在 init package
        if (pkg.exists()) {
            // 更新 package
        } else {
            // 安装 init package
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
    const rootFilePath = pkg.getRootFilePath()
    // 使用 apply 方法将 arguments 转换成参数列表形式
    if (rootFilePath) {
        require(rootFilePath).apply(null, arguments);
    }
}

module.exports = exec;
