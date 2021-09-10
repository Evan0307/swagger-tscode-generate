const mountPath = '/__swagger__escode__codegen__/save';
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const compile = require('./lib/javascript');
const { exec } = require('child_process');
const axios = require('axios');

const isSwaggerLike = (value) => value && value.swagger && value.paths;

const isObject = function (val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}
const isArray = function (val) {
    return Object.prototype.toString.call(val) === '[object Array]';
}
const isNotEmpty = function (val) { return val !== null && val != undefined; };

const isString = function (val) {
    return Object.prototype.toString.call(val) === '[object String]';
}

const isFunction = function (val) {
    return Object.prototype.toString.call(val) === '[object Function]';
}

const notEmptyNotString = function (val) {
    return isNotEmpty(val) && !isString(val);
}
const urlPattern = /^((https?:)?\/\/([^/:]*))/;

const throwError = function (msg) {
    console.error(chalk.red(msg));
    throw new Error(msg);
}
const checkSettings = function (settings) {
    const { prettyCmd, swaggerSavePath, codegen, url, swagger } = settings;

    if(url&&swagger){
        throwError('url or swagger only one has  value ');
    }

    if ( notEmptyNotString(url)&&!swagger) {
        throwError('url and swagger Either of the two has a value ');
    }

    if ( url&& !urlPattern.test(url)) {
     throwError(`homePage [${ui}] is not valid http[s] url`);
    }
 

    if (!isObject(codegen)) {
        throwError('codegen type should be object');
    }

    const { tsType, tsControler, httpBase, responseWrapperName, responseWrapperPath, transformFileName } = codegen;

    if (!isString(tsType)) {
        throwError('tsType type should be string');
    }

    if (!isString(tsControler)) {
        throwError('tsControler type should be string');
    }

    if (!isString(httpBase)) {
        throwError('httpBase type should be string');
    }

    if (notEmptyNotString(responseWrapperPath)) {
        throwError('responseWrapperPath type should be string or null');
    }

    if (notEmptyNotString(responseWrapperName)) {
        throwError('responseWrapperName type should be string or null');
    }


    if (isNotEmpty(transformFileName) && !isFunction(transformFileName)) {
        throwError('transformFileName type should be function or null');
    }

    if (notEmptyNotString(swaggerSavePath)) {
        throwError('swaggerSavePath type should be string or null');
    }

    if (notEmptyNotString(prettyCmd)) {
        throwError('prettyCmd type should be string or null');
    }
}

const checkParams = function (params) {
    if (!isArray(params)) {
        throwError('params type should be Array<object>');
    }
    params.forEach(checkSettings);
}
module.exports =  async function (params) {
    checkParams(params);
    const { prettyCmd, swaggerSavePath, codegen, url,swagger } = params[0];
    const { tsType,
        tsControler,
        httpBase,
        responseWrapperPath,
        responseWrapperName,
        transformFileName,
        onlyCreateTypes
     } = codegen;
        let _swagger=swagger;

        if (url) {
        const  response = await  axios.get(url);
         _swagger= response.data;
        }

    try {
        if (swaggerSavePath) {
            fs.writeFileSync(path.resolve(process.cwd(), swaggerSavePath), JSON.stringify(swagger, null, 2));
        }

        compile({
            swagger:_swagger,
            tsType,
            tsControler,
            httpBase,
            // targetFolder: 'src/codegen/service/temp/api',
            // difinitionFolder: 'src/codegen/service/temp/typedef',
            commonType: responseWrapperPath,
            commonTypeName: responseWrapperName,
            getAPIFileName: transformFileName,
            importStar: false,
            onlyCreateTypes,
        });
    } catch (e) {
        console.error(e);
    }

    if (prettyCmd) {
        exec(prettyCmd, { cwd: process.cwd() }, (error, stdout, stderr) => {

            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        });
    }

   

    
}