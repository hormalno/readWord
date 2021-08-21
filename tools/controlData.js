
module.exports = {

    readDocument: function (modulePath) {
        // read the xml
        const fs = require('fs');
        const rawXML = fs.readFileSync(modulePath+'document.xml', {encoding: 'utf-8'});

        // convert xml to json
        const parseString = require('xml2js').parseString;
        let resultJSON = {};
        parseString(rawXML, function (err, result) {
            resultJSON = result.document;
        });
        console.log('Word file read')
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
