const   generateSwaggerCode =  require('../index');
const  swaggerJson=require('./swagger.json');


const  settingParams = [
    {
      // swagger json data or url
      swagger:swaggerJson,
      // url:'https://petstore.swagger.io/v2/swagger.json',
  
      // swagger,
      codegen:{
         // generated Folders
      tsType:'example/codegen/types',
      tsControler: 'example/codegen/service',


     // Response Wrapper
      responseWrapperPath: 'example/commonType',
      responseWrapperName: 'Response',
    
    
      // Custom Request Tool
      httpBase:'@/utils/fetch',
    
       // rename file name more friendly
       // Sample --> SampleController
      getAPIFileName:  function transformFileName(name){
        return name.indexOf('API')?  `${name.replace(/[ ]/g,'')}Controller`:name;
      },
    
      // is only Create types file 
    //   onlyCreateTypes:true,
      }
    }
  
   ]
  


   generateSwaggerCode(settingParams)