const path = require('path');
const Utils = require('./utils');
const parseCategory = require('./parseCategory');
const defaultAction = require('./defaultAction');



function generateCode(swagger, params) {

    const categories = parseCategory(swagger.paths, params);
    Object.keys(categories).forEach(function (fileName) {
        const code = params.template(categories[fileName], swagger.definitions, params, fileName);
    })
    if (swagger.definitions) {
        const definitionsPath = path.resolve(params.targetFolder, 'definitions.json');
        // Utils.writeSync(definitionsPath, JSON.stringify(swagger.definitions, null, 2));
        // logger.info('接口类型参考：' + definitionsPath);
    }
    // logger.info('成功生成代码：' + params.targetFolder + ', 数据结构定义目录' + params.difinitionFolder);
}
module.exports = function (params) {
    params = defaultAction.initParams(params);
    if (params.swagger) {
        generateCode(params.swagger, params);
        return;
    }
    if (params.url) {
    axios.get(params.url)
  .then(response => {
    generateCode(response.data, params);
  })
  .catch(error => {
    console.log(error);
  });
    }
}