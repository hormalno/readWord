module.exports = {
    wordTool : function(wordFilePath,moduleName) {
        const readWord = require('./readWord.js').readWord;
        const writeMDD = require('./writeMDD.js').writeMDD;        
        const getDocumentXML = require('./controlData.js').getDocumentXML;

        const modulePath = "C:/Users/yasen.ivanov/Documents/readWord_v2/readWord/modules/"+moduleName+"/"+moduleName+"_"

        //getDocumentXML(wordFilePath,moduleName,modulePath);
        readWord(modulePath);
        writeMDD(modulePath);

    }
}

