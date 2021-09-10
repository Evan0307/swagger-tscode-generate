const Utils = require('./utils');
const path = require('path');
const defaultAction = require('./defaultAction');
// Swagger 2.x Spec: https://swagger.io/docs/specification/2-0/basic-structure/
// Swagger 3.x Spec: https://swagger.io/specification/#specification
// TS Check: https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html
// Typescript-specific: https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#import-types
// https://code.visualstudio.com/docs/languages/javascript#_js-doc-support

/**
 * 将Swagger后端使用的类型转换为JsDoc中能识别的类型
 * @param {boolean|string|integer|file|array|object|number} type Swagger后端使用的类型
 */
const transformType = function (type) {
  switch (type) {
    case 'integer':
      return 'number';
    case 'file':
      return 'File';
    case 'object':
      return 'Object';
    default:
      return type;
  }
};

/**
 * 生成JsDoc注释
 * @example
 * // retun ` * @param {number|string}` [age=18] 年龄
 * getComment('@param', 'age', '年龄', ['number', 'string'], false, '18')
 * // retun ` * @return {number}` 年龄
 * getComment('@return', null, 年龄', ['number'])
 * @param {string} annotation JsDoc注释类型
 * @param {string} [name] 名称
 * @param {string} [description] 描述信息
 * @param {string|Array.<string>} [type=*] 参数类型
 * @param {boolean} [required] 是否必填项
 * @param {string} [defaultValue] 默认值
 */
const getComment = function (annotation, name, description, type, required, defaultValue) {
  if (annotation === '@deprecated') {
    return ` * ${annotation} ${description ? description : ''}`;
  }
  const isTypeArray = Object.prototype.toString.call(type) === '[object Array]';
  const hasDefault = defaultValue !== undefined;
  const nameMsg = name ? (hasDefault ? `${name}="${defaultValue}"` : name) : '';
  const comments = [' *'];
  comments.push(annotation ? `${annotation}` : '');
  comments.push(`{${isTypeArray ? type.join('|') : type ? type : '*'}}`);
  if (annotation !== '@return') {
    comments.push(`${required ? nameMsg : `[${nameMsg}]`}`);
  }
  comments.push(description);
  return comments.join(' ');
};

const getAnnotationType = function (param, typeDefDependencies) {
  const basicType = getSchmaType(param);
  if (basicType) {
    return basicType;
  }
  const schemaType = getSchmaType(param.schema);
  if (schemaType) {
    typeDefDependencies[schemaType] = true;
  }
  return schemaType;
  // param.type === 'array' && param.items
  //   ? `Array.<${transformType(param.items.type)}>`
  //   : transformType(param.type);
};

/**
 * https://github.com/Microsoft/TypeScript/issues/24746
 * JsDoc 解构
 */
const attrs = {};
const pa = {};

/**
 * 过滤数组中元素
 * @param {*} v 数组中元素
 */
const filterEmpty = function (v) {
  return v;
};

const firstLetterLower = function (name) {
  return name[0].toLowerCase() + name.substring(1);
};
const firstLetterUpper = function (name) {
  return name[0].toUpperCase() + name.substring(1);
};
/**
 * 将Http Header转换为驼峰变量名
 * @example
 * // return xUserId
 * transformNameToCammelCase(':X-User-Id')
 * @param {*} name Http Header Name
 */
const transformNameToCammelCase = function (name) {
  const res = name
    .split(/[-_:]/)
    .filter(filterEmpty)
    .map(function (key) {
      return key[0].toUpperCase() + key.substring(1);
    })
    .join('');
  return firstLetterLower(res);
};

const generateParaAnnotation = function (params, holderName, description, typeDefDependencies) {
  if (!params || !params.length) {
    return '';
  }
  const isRequired = params.find(function (p) {
    return p.required;
  });
  return params.reduce(
    function (comments, param) {
      const type = getAnnotationType(param, typeDefDependencies);
      comments.push(
        getComment('@param', `${holderName}${param.nameTransformed ? `['${param.originalName}']` : `.${param.name}`}`, param.description, type, param.required, param.default)
      );
      return comments;
    },
    [getComment('@param', holderName, description, 'Object', isRequired)]
  );
};
/**
 * 格式化生成的代码时，采用的空白字符，使用空字符还是Tab
 * @param {number} amount 空白字符的数量，当使用Tab时，每2个空白字符转换为1个Tab
 * @param {boolean} [isTab] 是否使用Tab分割，默认为空字符
 */
const getBlank = function (amount, isTab) {
  if (!amount) {
    amount = 1;
  }
  if (isTab) {
    amount = amount / 2;
  }
  const blanks = [];
  while (amount--) {
    blanks.push(isTab ? '\t' : ' ');
  }
  return blanks.join('');
};
const spreadArg = function (params) {
  return params.length
    ? params.length > 1
      ? `{
      ${
      params
        .map(function (p) {
          return p.name;
        })
        .join(', ')
      }
    } = {}`
      : params[0].name
    : '';
};

/**
 * 将Swagger URL转换为JS能识别的字符串模板
 * @example
 * // return `/ v1 / credit - review - orders / ${ creditReviewOrderId } / related - loans`
 * getUrl('/v1/credit-review-orders/{creditReviewOrderId}/related-loans')
 */
 
const getUrl = function (url) {
  return `\`${url.replace(/{([^{}]+)}/g,  function(target){
      const _target=transformNameToCammelCase(target);
           return  `$${_target}`
  })}\``;
};

// const generateConfigs = function (attr, params) {
//   return `${getBlank(2)}${attr}: {\n${getBlank(6)}${params
//     .map(function (p) {
//       return p.name;
//     })
//     .join(`,\n${getBlank(6)}`)}\n${getBlank(4)}},`;
// };

const transformInitialsUpperCase=(str)=>{
  const _str=String(str);
  return `${_str[0].toUpperCase()}${_str.slice(1)}`
}

const getDefinitionName = function (name) {
  console.log(name);
  const valids = name.replace(/#\/definitions\//, '').split(' ');
  return (valids && valids.length ? valids.map(i=>transformInitialsUpperCase(i)).join('') : transformInitialsUpperCase(name));
};

const getRequestSchmaType = (prop, typeDefDependencies) => {
  if (prop.type === 'array') {
    return `Array<${getRequestSchmaType(prop.items)}>`;
  }
  let core;
  if (prop.schema) {
    let schemaName;
    if (prop.schema.$ref) {
      core = getDefinitionName(prop.schema.$ref);
      schemaName = core;
    } else if (prop.schema.type === 'array') {
      if (prop.schema.items.$ref) {
        core = getDefinitionName(prop.schema.items.$ref);
        schemaName = `Array<${core}>`;
      } else {
        schemaName = `Array<${transformType(prop.schema.items.type)}>`;
      }
    } else {
      schemaName = transformType(prop.schema.type);
      // console.error('未考虑的schema');
    }
    if (core && typeDefDependencies) {
      typeDefDependencies[core] = true;
    }
    return schemaName;
  }
  return transformType(prop.type);
}
const getSchmaType = function (prop, isTS) {
  if (prop.type === 'array') {
    return `Array${isTS ? '' : '.'}<${getSchmaType(prop.items)}>`;
  }
  if (prop.$ref) {
    return getDefinitionName(prop.$ref);
  }
  return transformType(prop.type);
};
const tsByDefinition = function (name, definition) {

  const inerfaceName = getDefinitionName(name);
  if (definition.type === 'object') {
    let properties = definition.properties;
    const requireds = definition.required || [];
    if (!definition.properties) {
      // console.log('definition.properties empty', name);
      return `export  type ${inerfaceName}= Record<string, any>`
    }

    const attrs = [];
    const enumDefinitions = [];
    const namescope = {};
    const duplates = {};

    Object.keys(properties).forEach(function (prop) {
      const isRequired = requireds.indexOf(prop) !== -1;
      const isEnum = properties[prop].enum !== undefined;
      const description = properties[prop].description && properties[prop].description !== prop ? `/** ${properties[prop].description} */\n  ` : '\n  ';
      let enumName;
      if (isEnum) {
        enumName = Utils.getUniqueId(prop.toUpperCase(), namescope, duplates);
        enumDefinitions.push(`export type ${enumName} = ${properties[prop].enum.map(e => `'${e}'`).join(' | ')};\n`);
      }

      const propType = properties[prop].additionalProperties ? `{ [key: string]: ${getSchmaType(properties[prop].additionalProperties, true)} }` : getSchmaType(properties[prop], true);
      attrs.push(`${description}${prop}${isRequired ? '' : '?'}: ${isEnum ? enumName : propType};`)
      // attrs.push(
      //   ` * @property {${getSchmaType(properties[prop])}${isRequired ? '' : '='}} ${prop}${
      //   isEnum ? '=' + properties[prop].enum.join('|') : ''
      //   }${properties[prop].description ? ' - ' + properties[prop].description : ''}`
      // );
    });

    return `${enumDefinitions.length ? enumDefinitions.join('\n') : ''}${definition.description ? `// ${definition.description}` : ''}
export interface ${inerfaceName} {
  ${attrs.join('\n  ')}
}
  `
  }

};
const codgenByDefinition = function (name, definition) {
  const attrs = [];

  if (definition.type === 'object') {
    let properties = definition.properties;
    const requireds = definition.required || [];
    if (!definition.properties) {
      properties = Object.keys(definition).filter(function (key) {
        return key !== 'type';
      });
    }
    properties &&
      Object.keys(properties).forEach(function (prop) {
        const isRequired = requireds.indexOf(prop) !== -1;
        const isEnum = properties[prop].enum !== undefined;
        attrs.push(
          ` * @property {${getSchmaType(properties[prop])}${isRequired ? '' : '='}} ${prop}${
          isEnum ? '=' + properties[prop].enum.join('|') : ''
          }${properties[prop].description ? ' - ' + properties[prop].description : ''}`
        );
      });
  }
  return `/**
 * @typedef {${transformType(definition.type)}} ${getDefinitionName(name)}${
    definition.description ? ' - ' + definition.description : ''
    }
${attrs.join('\n')}
 */`;
};
const generateTypeof = function (userParams, name, definitions, dependentVos, affectedMapping) {
  const message = [];
  const subVos = [];
  const tsImports = [];

  const ownName = getDefinitionName(name);

 

  if (dependentVos && dependentVos.length) {
    const importsState = dependentVos.map(function (dep) {
      // if (affectedMapping[dep] && affectedMapping[dep].length == 1) {
      //   const subVo = dep.replace('#/definitions/', '');
      //   subVos.push(codgenByDefinition(subVo, definitions[subVo]));
      //   return '';
      // }
      const structureName = getDefinitionName(dep);

      // console.log('structureName',structureName);
      if (ownName !== structureName) {
        tsImports.push(`import { ${structureName} } from './${structureName}';`);
      }
      return ` * @typedef { import("./${structureName}.js") }`;
    });
    const importRes = importsState.filter(filterEmpty);
    if (importRes && importRes.length) {
      message.push(`/**\n${importRes.join('\n')} \n */\n`);
    }
  }
  if (subVos.length) {
    message.push(subVos.join('\n\n'));
    message.push('');
  }
  message.push(codgenByDefinition(name, definitions[name]));
  const tsBody = tsByDefinition(name, definitions[name]);
   
  // Utils.writeSync(path.resolve(userParams.difinitionFolder, ownName + '.js'), message.join('\n'));
  const validImports = tsImports.filter(filterEmpty);

  Utils.writeSync(path.resolve(userParams.tsType, ownName + '.ts'), (validImports && validImports.length ? validImports.join('\n') + '\n' : '') + tsBody);
};


const parseDefiniations = function (definitions, userParams) {

  const dependGraph = Utils.getImportDependencies(definitions);
  const mappings = dependGraph.mappings;
  const finalMapping = dependGraph.finalMapping;

  const dependencyMapping = Object.keys(mappings).reduce(function (mapInfo, vo) {
    const effectedVos = mappings[vo];
    if (effectedVos) {
      effectedVos.forEach(function (effected) {
        if (!mapInfo[effected]) {
          mapInfo[effected] = [];
        }
        mapInfo[effected].push(vo);
      });
    }
    return mapInfo;
  }, {});



  Object.keys(definitions).forEach(function (vo) {
    return generateTypeof(userParams, vo, definitions, dependencyMapping[`#/definitions/${vo}`] || [], finalMapping);
  });
};


const friendlyName = function (name, method) {
  const match = name.match(/^(POST|GET|DELETE|PUT|HEAD|TRACE|PATCH|OPTIONS|CONNECT)/i);
  if (match) {
    if (match[1].toLowerCase() !== method.toLowerCase()) {
      return name.replace(/^(POST|GET|DELETE|PUT|HEAD|TRACE|PATCH|OPTIONS|CONNECT)/i, method);
    }
    return `${firstLetterLower(name)}Using${firstLetterUpper(method)}`;
  } else {
    return `${firstLetterLower(method)}${firstLetterUpper(name)}`;
  }
}
const nameAddNumber = function (name) {
  const match = name.match(/_(\d+)$/);
  if (match) {
    return name.replace(/(\d+)$/, parseInt(match[1]) + 1);
  }
  return `${name}_1`;
}
const uniqueMethod = function (apis) {
  const names = {};
  const originalNames = {};
  apis.forEach((api, index) => {
    if (!names[api.definition.operationId]) {
      originalNames[index] = api.definition.operationId;
      names[originalNames[index]] = true;
    } else {
      originalNames[index] = friendlyName(api.definition.operationId, api.method);
      while (names[originalNames[index]]) {
        originalNames[index] = nameAddNumber(originalNames[index]);
      }
      names[originalNames[index]] = true;
    }
  }, {});
  return originalNames;
}
module.exports = function (apis, definitions, userParams, fileName) {
  parseDefiniations(definitions, userParams);
  const typedefBase = path.relative(userParams.tsControler, userParams.tsType);
  const uniqueNames = uniqueMethod(apis);
 


  const typeDefDependencies = {};
  const nameScope = {};
  const duplicateKeys = {};

  const AllResponseDep = {};

  const codeBody = apis
    .map((api, apiIndex) => {
      const paramCategory = {
        path: [],
        query: [],
        body: [],
        formData: [],
        header: [],
      };

      const finalParamOptional = {};

      Object.keys(api.comment.params).forEach(key => {
        const param = api.comment.params[key];
        if (!paramCategory[param.in]) {
          paramCategory[param.in] = [];
        }
        if (!finalParamOptional[param.in] && param.required) {
          finalParamOptional[param.in] = param.required;
        }
        paramCategory[param.in].push({
          name: param.name,
          description: param.description,
          required: param.required,
          type: param.enum ? (param.enum.map(e => `'${e}'`).join(' | ').length > 80 ? '\n' + param.enum.map(e => `      | '${e}'`).join('\n') : ' ' + param.enum.map(e => `'${e}'`).join(' | ')) : ' ' + getRequestSchmaType(param, typeDefDependencies),
          
        });

      });

      const generateType = items => `${items.length ? items.map(({ name, description, required, type }) => {
        return `${description !== name ? `  /** ${description} */\n  ` : ''}  ${transformNameToCammelCase(name)}${required ? '' : '?'}:${type};`;
      }).join('\n  ') : ''}`
      const paramTypes = {
        path: generateType(paramCategory.path),
        query: generateType(paramCategory.query),
        body: generateType(paramCategory.body.concat(paramCategory.formData)),
        header: generateType(paramCategory.header),
      };

      //  console.log('paramTypes',paramTypes);

      const url = getUrl(api.url);
      const queryParams = paramCategory['query'];
      const formDataParams = paramCategory['formData'];
      const bodyParams = paramCategory['body'];
      const headerParams = paramCategory['header'];
      const bodyAndFormParams = bodyParams.concat(formDataParams);


      const configParam = [];
      
      configParam.push(`${getBlank(2)}method: '${api.method.toUpperCase()}',`);
      if (queryParams.length) {
        // configParam.push(generateConfigs('params', queryParams));
        configParam.push(`${getBlank(2)}params,`);
      }
      if (bodyAndFormParams.length) {
        // configParam.push(generateConfigs('data', bodyAndFormParams));
        configParam.push(`${getBlank(2)}data,`);
      }
      const headersWithValidNameParams = headerParams.map(function (p) {
        const hName = p.name;
        const transformed = transformNameToCammelCase(hName);
        return Object.assign({}, p, {
          name: transformed,
        });
      });
      if (headerParams.length) {
        // configParam.push(generateConfigs('headers', headersParams));
        configParam.push(`${getBlank(2)}headers,`);
      }
      configParam.push(`${getBlank(2)}...config,`);
      if (configParam.length) {
        configParam.unshift('{');
        configParam.push('}');
      }
      const configParamState = configParam.length ? configParam.join(`\n${getBlank(2)}`) : '';
      const returns = `  return http(${[url, configParamState]
        .filter(filterEmpty)
        .join(', ')});`;

      const summary = api.comment.summary;
      const description = api.definition.description;
      const deprecated = api.definition.deprecated ? '@deprecated' : '';

      const commentLine = [deprecated, summary, description].filter(filterEmpty);
      const comment = commentLine.length ? `\n\n/**\n${commentLine.map(line => ` * ${line}`).join('\n')}\n */\n\n` : '';

      const firstBody = bodyAndFormParams && bodyAndFormParams[0];
      const argsStatement = [
        paramCategory['path'].length ? `{\n${paramCategory.path.map(p => `    ${p.name},`).join('\n')}\n  }: {\n  ${paramTypes.path}\n  }` : '',
        // 
        queryParams.length ? `params${finalParamOptional.query ? '' : '?'}: {\n  ${paramTypes.query}\n  }` : '', // spreadArg(pathAndQueryParams),
        bodyAndFormParams.length ? (bodyAndFormParams.length === 1 ? (`${firstBody.description !== firstBody.name ? `  /** ${firstBody.description} */\n  ` : ''}data${firstBody.required ? '' : '?'}: ${firstBody.type}`) : `data${(finalParamOptional.body || finalParamOptional.formData) ? '' : '?'}: {\n  ${paramTypes.body}\n  }`) : '',// spreadArg(bodyAndFormParams),
        headersWithValidNameParams.length ? `headers?: { [key: string]: any }` : '',// spreadArg(headersWithValidNameParams),
        `config?: { [key: string]: any }`,
      ].filter(filterEmpty);

      // const lastElement = argsStatement.pop();
      // const argeStatements = lastElement && argsStatement.length ? argsStatement
      //   .join(',\n  ') + ',\n  ' + lastElement : lastElement + ',\n  ';
      const argeStatements = argsStatement
        .join(',\n  ');
      let methodName = Utils.getUniqueId(api.definition.operationId, nameScope, duplicateKeys);
      if (methodName !== api.definition.operationId) {
        methodName = Utils.getUniqueId(friendlyName(api.definition.operationId, api.method), nameScope, duplicateKeys);
      }

      const ResponseSchemaMap = {};
      Object.keys(api.definition.responses).forEach(code => {
        const response = api.definition.responses[code];
        const respSchema = getRequestSchmaType(response, typeDefDependencies);
        if (respSchema) {
          ResponseSchemaMap[code] = respSchema;
        }
      });
      const keys = Object.keys(ResponseSchemaMap);
      if (keys.length > 1) {
        console.log(`[${ResponseSchema.length}] ${api.method} ${api.url}`);
      }

      let withDataType;
      if (userParams.commonTypeName && userParams.commonType) {

        if (keys[0]) {
          withDataType = `${userParams.commonTypeName}<${ResponseSchemaMap[keys[0]]}>`;
        } else {
          withDataType = `${userParams.commonTypeName}<undefined | null>`;
        }
      } else { 
        withDataType = ResponseSchemaMap[keys[0]];
      }
      return `${comment}export const ${methodName} = function(\n  ${argeStatements}\n): ${`Promise<${withDataType}>`} {${[returns].filter(filterEmpty).join('\n')}};`;
    })
    .join('');
  const typeDefs = Object.keys(typeDefDependencies);

  const currentFilePath = path.resolve(userParams.tsControler, fileName + '.ts');
  let commonTypeImport;
  if (userParams.commonType) {
    const commonTypeRelativePath = path.relative(userParams.tsControler, userParams.commonType);
    commonTypeImport = `import { ${userParams.commonTypeName} } from '${commonTypeRelativePath}';\n`;
  }
  const tsImports = [];

  if (commonTypeImport) {
    tsImports.push(commonTypeImport);
  }

  if (typeDefs.length) {
    typeDefs.forEach(name => {
      tsImports.push(`import { ${name} } from '${typedefBase}/${name}';\n`);
    });
  }



  const typeDefCode = typeDefs.length ? typeDefs.reduce((typeDefStatements, name) => {
    typeDefStatements.push(` * @typedef { import("${typedefBase}/${name}.js") }`)
    return typeDefStatements;
  }, []).join('\n') : '';
  const statements = `
${typeDefCode ? `/**\n${typeDefCode}\n */\n` : ''}import * as http from '${userParams.httpBase}';
${codeBody}
`;

  const tsCode = `${tsImports.length ? `${tsImports.join('')}\n` : ''}import${userParams.importStar ? ' * as' : ''} http from '${userParams.httpBase}';\n${codeBody}`;
 if(!userParams.onlyCreateTypes){
   Utils.writeSync(currentFilePath, tsCode);
 }
  return statements;
};
