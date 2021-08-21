

module.exports = {
    writeMDD : function(modulePath) {

        const fs = require('fs');

        const controlData = require('./controlData.js');

        var questions = controlData.readJSON(modulePath);

        //write metadata of the module
        var writeMetadata = fs.createWriteStream(modulePath+'metadata.txt', {flags: 'w',encoding: 'utf-8'})
        writeMetadata.write('Questions count: ' + questions.length.toString() + '\n')
        questions.forEach(question => {
            let questionStr = writeQuestionMetadata(question);
            writeMetadata.write(questionStr)
        });
        writeMetadata.end() // close string

        // write routing of the module
        var writeRouting = fs.createWriteStream(modulePath+'routing.txt', {flags: 'w', encoding: 'utf-8'})

        questions.forEach(question => {
            let questionStr = writeQuestionRouting(question);
            writeRouting.write(questionStr)
        });
        writeRouting.end() // close string

        console.log('This is after the read call');

    }
}

function writeQuestionMetadata(question) {

    let result = question.qname + ' "' + question.qlabel + '"' + '\n';

    if (question.qtype === 'single') {
        result += 'categorical [1..1]\n{\n'
    } else {
        result += 'categorical [1..]\n{\n'
    }

    let resultCat = '';
    question.categories.forEach((cat,index,arr) => {

        resultCat += '\t' + cat.catName + ' "' + cat.catLabel + '"' + ' [Value=' + cat.catValue + ']'

        if (cat.isOther) {
            resultCat += ' other (FREETEXT "" text;)'
        }

        if (cat.isExclusive) {
            resultCat += ' exclusive'
        }
        if (index !== arr.length - 1) {
            resultCat += ','
        }
        resultCat += '\n'
    })
    
    result += resultCat;
    result += '}\n';
    return result;
}

function writeQuestionRouting(question) {

    let result = 'if ' + question.routing.split('#qstart#')[0] + ' then\n';
    result += '\t' + question.qname + '.Ask()\n'
    result += 'end if\n';
    return result;
}

