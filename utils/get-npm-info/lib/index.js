'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

// 优先调用淘宝源
function getRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org/';
}

function getNpmInfo(npmName, registry) {
    if (!npmName) return null;
    const targetRegistry = registry || getRegistry();
    const url = urlJoin(targetRegistry, npmName);
    return axios.get(url).then(res => {
        if (res.status === 200) {
            return res.data;
        } else {
            return {}
        }
    }).catch(err => Promise.reject(err))
}

async function getVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    return data.versions ? Object.keys(data.versions) : []
}

function getSemverVersions(baseVersion, versions) {
    return versions
        .filter(version => semver.satisfies(version, `>${baseVersion}`))
        .sort((a, b) => semver.gt(b, a) ? 1 : -1);
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getVersions(npmName, registry);
    const newVersions = getSemverVersions(baseVersion, versions);
    return newVersions[0];
}

module.exports = {
    getNpmInfo,
    getVersions,
    getSemverVersions,
    getNpmSemverVersion,
    getRegistry
};
