const pwd = process.cwd();
const path = require('path');

const defaultTemplate = require('./template');

const cammelCase = (id,flag) => {
    const parts = id.split(flag);
    return parts.reduce((total, part) => {
        if (part === '') {
            return total;
        }
        total.push(part[0].toUpperCase() + part.substring(1));
        return total;
    }, []).join('');
}

function defaultGetAPIFileName(name) {
    if (!name) {
        return 'Default';
    }
    return cammelCase(name , ' ');
}
function defaultGetRequestFunctionName(definition) {
    return definition.operationId.replace(/Using(POST|GET|DELETE|PUT|HEAD|TRACE|PATCH|OPTIONS|CONNECT).*$/i, '');
}

module.exports.initParams = function (params) {
    const swaggerValid = Object.prototype.toString.call(params.swagger) === '[object Object]';
    const urlValid = typeof params.url === 'string';
    if (!swaggerValid && !urlValid) {
        throw new Error('需提供合法的参数swagger或url');
    }
    if (swaggerValid && urlValid) {
        throw new Error('参数swagger与url只能提供一个');
    }
    if (!params.targetFolder) {
        params.targetFolder = 'service';
    }
    if (!params.difinitionFolder) {
        params.difinitionFolder = 'typedef';
    }
    if (!params.tsType) {
        params.tsType = 'types';
    }
    if (!params.tsControler) {
        params.tsControler = 'ts';
    }
    if (!params.httpBase) {
        params.httpBase = 'axios';
    }
    params.tsType = path.resolve(pwd, params.tsType);
    if (params.commonType) {
        params.commonType = path.resolve(pwd, params.commonType);
    }
    params.commonTypeName = params.commonTypeName || 'Response';
    params.tsControler = path.resolve(pwd, params.tsControler);
    params.targetFolder = path.resolve(pwd, params.targetFolder);
    params.difinitionFolder = path.resolve(pwd, params.difinitionFolder);

    params.template = defaultTemplate;
    if (typeof params.getRequestFunctionName !== 'function') {
        params.getRequestFunctionName = defaultGetRequestFunctionName;
    }
    if (typeof params.getAPIFileName !== 'function') {
        params.getAPIFileName = defaultGetAPIFileName;
    }
    return params;
}
module.exports.defaultGetRequestFunctionName = defaultGetRequestFunctionName;

module.exports.defaultGetAPIFileName = defaultGetAPIFileName;