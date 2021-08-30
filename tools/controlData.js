
module.exports = {

    getDocumentXML: function (wordFilePath,moduleName,modulePath) {
    
        const StreamZip = require('node-stream-zip');

        (async () => {
            console.log('Loading zip...');
        
            const zip = new StreamZip.async({ file: wordFilePath+moduleName+'.docx' });
        
            console.log(`Done in ${process.uptime()}s.`);
            
            // extractEntry(modulePath).catch(console.error)
            // async function extractEntry(modulePath) {
                await zip.extract('word/document.xml', modulePath +'document.xml');
                   
            await zip.close();
        })().catch(console.error);

        console.log('Extracted');
    },
    readDocument: function (modulePath) {
        // read the xml
        const fs = require('fs');
        const rawXML = fs.readFileSync(modulePath+'document.xml', {encoding: 'utf-8'});

        // convert xml to json
        const parseString = require('xml2js').parseString;
        let resultJSON = {};
        parseString(rawXML, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Word file read')
                resultJSON = result.document;
            }
        });
       
        return resultJSON;
    },
    writeJSON : function(questions,modulePath) {
        // write JSON
        const fs = require('fs');
        let data = JSON.stringify(questions, null, 2);

        fs.writeFileSync(modulePath+'questions.json', data, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });

    },
    readJSON : function (modulePath) {
        // read JSOn
        const fs = require('fs');
        let rawdata = fs.readFileSync(modulePath+'questions.json');
        console.log('JSON file read')
        return JSON.parse(rawdata);
    }
}
