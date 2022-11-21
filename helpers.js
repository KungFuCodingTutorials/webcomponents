const fsPromises = require('fs/promises');

const helpers = {};



helpers.settings = {
    'components' : true,
}


helpers.interpolate =  async function(str,data){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    for (let key in data){
        if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
            let replace = data[key];
            let find = '{'+key+'}';
            str = str.replace(find,replace);
        }
    }
    
    if(helpers.settings.components){


        // Build the components object
        let componentDir = __dirname+'/components/';
        let componentsList = await fsPromises.readdir(componentDir);
        let componentsArray = [];
        for(let i=0;i<componentsList.length;i++){
            if(componentsList[i].indexOf('.json') == -1 ){
            let componentFiles = await fsPromises.readdir(componentDir+componentsList[i]);
            let componentsData = await fsPromises.readFile(componentDir+componentsList[i]+'/'+componentFiles[0]);
            let stringData = Buffer.from(componentsData,'utf-8').toString('utf-8');
            stringData = stringData.replace(/<!--(.*?)-->|\s\B/gm,'');
            let styleData = stringData.match(/<style>(.*?)<\/style>/g).toString();
            styleData = styleData.replace(/[\.](?=[a-z])/gm,' .');
            styleData = styleData.replaceAll(/[\#]/gm,' #');
            styleData = styleData.replace('<style>','');
            styleData = styleData.replace('</style>','');
            let htmlData = stringData.replace(/<style>(.*?)<\/style>/g,'');
            let componentName = componentsList[i];
            let componentObject = {
                "componentName" : componentName,
                "html" : htmlData,
                "css" : styleData,
            }
            componentsArray.push(componentObject);
            }
    
        }
  
        //Open the file for writing
        let fileDescriptor = await fsPromises.open(componentDir+'components.json','w+');
        await fileDescriptor.truncate();
        if(fileDescriptor){
            let stringData = JSON.stringify(componentsArray)
            await fsPromises.writeFile(fileDescriptor,stringData);
            await fileDescriptor?.close();
        } 
  
        // For every object inside the components.json check if it's present inside the template
        let components = await fsPromises.readFile(componentDir+'components.json','utf-8');
        let componentsLayout = helpers.parseJsonToObject(components);
        let matchedComponentsStyle = '';
        let newStr;
    
        // Select all inside every blocks of --- ---;
        let tripleTildeBlocks = str.match(/---([\S\s]*?)---/gm);
        let finalObject = [];
        tripleTildeBlocks = typeof(tripleTildeBlocks) == 'object' && tripleTildeBlocks !== null && tripleTildeBlocks !== undefined ? tripleTildeBlocks : false;
        if(tripleTildeBlocks){
            for(let j=0;j<tripleTildeBlocks.length;j++){
            let cleanedComponent = tripleTildeBlocks[j].replaceAll('---','').trim();
            if(cleanedComponent.length > 2){
                let componentObject = helpers.parseJsonToObject(cleanedComponent);
                for(let i=0;i<componentsLayout.length;i++){
                    if(componentObject.componentName == componentsLayout[i].componentName){
                        if(Object.keys(componentObject).length == 1){
                            let uncompiledObject = {
                                "componentName" : componentsLayout[i].componentName,
                                "html" : componentsLayout[i].html,
                                "css" : componentsLayout[i].css,
                            }
                            finalObject.push(uncompiledObject);
                            } else {
                                let originalHtml = componentsLayout[i].html;
                                delete componentObject.componentName;
                            for(key in componentObject){
                                if(componentObject.hasOwnProperty(key) && typeof(componentObject[key] == 'string')){
                                let replace = componentObject[key];
                                let find = '{'+key+'}';
                                originalHtml = originalHtml.replace(find,replace);
                                }
                            }
                            let compiledObject = {
                                "componentName" : componentsLayout[i].componentName,
                                "html" : originalHtml,
                                "css" : componentsLayout[i].css,
                            }
                            finalObject.push(compiledObject);
                            }
                        }
                    }
                }
            }
            // Clean the html from the blocks
            let cleanedHtml = str.replaceAll(/---([\S\s]*?)---/gm,'');
            for(let i=0;i<finalObject.length;i++){
    
            let replace = finalObject[i].html;
            let find = '{'+finalObject[i].componentName+'}';
            if(newStr == null || newStr == undefined){
                newStr = cleanedHtml.replace(find,replace);
            } else{
                newStr = newStr.replace(find,replace);
            }
    
            if(newStr.length !== cleanedHtml.length){
                if(matchedComponentsStyle.indexOf(finalObject[i].css) == -1){
                matchedComponentsStyle += finalObject[i].css;
                }
            }
            }
        }
        if(newStr){
            if(matchedComponentsStyle.length > 0){
            
            newStr = newStr.replace('{componentsStyle}','<style>'+matchedComponentsStyle+'</style>');
            } else {
            newStr = newStr.replace('{componentsStyle}','');
            }
        } else{
            newStr = str.replace('{componentsStyle}','');
        }
        return newStr;
    }
  
    str = str.replaceAll(/---([\S\s]*?)---/gm,'');
    return str;
    
};


helpers.parseJsonToObject = function(str){
    try{
        let obj = JSON.parse(str);
        return obj;
    } catch(e){
        return{};
    }
}
  

module.exports = helpers;