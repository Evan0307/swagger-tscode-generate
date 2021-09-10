Generate typescript codes once user visit online swagger(2.x) docs.

### Step1 Add settings in webpack or custom node server. 

`swagger-tscode-generate` support `swagger json  url` or  `swagger json  file` ;

```js
// ts-code-gen.js
  const  settingParams = [
  {
    // swagger json data  url
    url:'https://petstore.swagger.io/v2/swagger.json',
    swagger:'',
    codegen:{
       // generated Folders
    tsType:'src/codegen/types',
    tsControler: 'src/codegen/service',
  
  
    // Custom Request Tool
    httpBase:'~/utils/fetch',
  
     // rename file name more friendly
     // Sample --> SampleController
    getAPIFileName:  function transformFileName(name){
      return name.indexOf('API')?  `${name.replace(/[ ]/g,'')}Controller`:name;
    },
  
    // is only Create types file 
    onlyCreateTypes:true,
    }
  }

 ]

```



### Step2 Visit Swagger Online Docs

* set setting url  `https://petstore.swagger.io/v2/swagger.json`
*  node ts-code-gen

3.2. View codes generated in folder `src/codegen/service`
```
my-app
├── config-override.js
├── node_modules
├── public
│   ├ index.html
│   └── favicon.ico
├── utils
│   └── fetch.ts
└── src
    ├── pages
    ├── components
    └── codegen
        └── service
            ├── commonType.ts
            └── business
                ├── ts
                │   └── SampleController.ts
                └── types
                    └── IMenuBo.ts
```

```js
// src/codegen/service/business/ts/SampleController.ts

import { Response } from '../commonType';
import { IMenuBo } from '../types/IMenuBo';

import http from '~/utils/fetch';

/**
 * Delete Sample
 */
export const deleteSample = function(
  {
      id: number,
  },
  params?: {
    sample?: object;
  },
  config?: { [key: string]: any }
): Promise<Response<string>> {
  return http(`/sample/${id}`, {
    method: 'GET',
    params,
    ...config,
  });
};

/**
 * Get User Menu Permissions
 */
export const getMenu = function(config?: { [key: string]: any }): Promise<Response<Array<IMenuBo>>> {
  return http(`/menus`, {
     method: 'GET',
    ...config,
  });
};

```

```js
// src/codegen/service/business/types/IMenuBo.ts

export interface IMenuBo {
  code?: string;

  title?: string;

  name?: string;
}
```
### Options

options is type of `Array<Settings>`.

`SettingsParams` attributes as below:

* `url`: `string`, Swagger Online Json Docs

* `codegen`: `CodeGen` params for code generation.

* `prettyCmd`: `Optional` pretty code command executed after code generate finished.

* `swaggerSavePath`: `Optional` file path if you want to save original swagger difinitions content.


`CodeGen` attributes as below:

* `tsType`: `string`  folder for generated typescript type definitions.

* `tsControler`: `string`  folder for generated typescript api codes.

* `httpBase`: `string`  Promise based HTTP client. for example: `axios`.

* `responseWrapperPath`: `Optional` `string`, custom response wrapper file path

* `responseWrapperName`: `Optional` `string`, exported name from custom response wrapper file path

* `transformFileName`: `Optional` `function`, transform file name more friendly.

* `onlyCreateTypes`: `Optional` `boolean` , 





