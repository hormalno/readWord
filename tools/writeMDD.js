

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
            resultCat += ' other (FREETEXT "" text)'
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
    result += '};\n';
    return result;
}

function writeQuestionRouting(question) {
    let categoryLetter = ['A','B','C','D','E','F','G','H','I','J','K','L'];

    if (question.routing.indexOf('jobcat') > -1) {
        let heading = "'" + question.qname + "\n"
        heading += question.qname + '.Ask()\n'
        return heading;
    } else {
        let routing = 'if ' + question.routing.split('#qstart#')[0].trim().replace(/\s*=\s*/,' * {_') + '} then\n';

        if (routing.indexOf('_check') > -1) {
            var catValue = routing.match(/\{_([\d])+\}/)[1];
            routing = routing.replace(/\{_[\d]+\}/,'{'+ categoryLetter[catValue-1] +'}')
            
        }

        routing += '\t' + question.qname + '.Ask()\n'
        routing += 'end if\n';
        return routing;
    }
}

