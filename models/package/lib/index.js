'use strict';

const path = require('path');
const pkgDir = require('pkg-dir').sync;

const npminstall = require('npminstall');
const { isObject } = require('@zjw-cli/utils');
const formatPath = require('@zjw-cli/format-path');
const { getRegistry } = require('@zjw-cli/get-npm-info')

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的options参数不能为空！')
        }
        if (!isObject(options)) {
            throw new Error('Package类的options参数必须为对象！')
        }
        // package 的目标路径
        this.targetPath = options.targetPath;
        // package的存储路径（package 缓存到本地的路径）
        this.storeDir = options.storeDir;
        // package 的 name
        this.packageName = options.packageName;
        // package version
        this.packageVersion = options.packageVersion;
    }

    // 判断 package 是否存在
    exists() {
        
    }

    // 安装 package
    install() {
        // npminstall 返回一个 promise
        return npminstall({
            root: this.targetPath, // 模块路径
            storeDir: this.storeDir, // storeDir = path.resolve(root, 'node_modules') 
            registry: getRegistry(),
            pkgs: [{ name: this.packageName, version: this.packageVersion }]
        })
    }

    // 更新 package
    update() {}

    // 获取文件路口路径
    getRootFilePath() {
        // 1. 获取 package.json 所在目录 - 通过 pkg-dir 库获取
        const dir = pkgDir(this.targetPath);
        if (dir) {
            // 2. 读取 package.json - require()
            const pkgFile = require(path.resolve(dir, 'package.json'));
            // 3. 查找 main / lib 属性的路径 -> path
            if (pkgFile && pkgFile.main) {
                // 4. 路径兼容（windows/macOS）
                return formatPath(path.resolve(dir, pkgFile.main));
            }
        }
        return null;
        
    }
}

module.exports = Package;
