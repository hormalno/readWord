

module.exports = {
    writeMDD : function(modulePath) {

        const fs = require('fs');

        const controlData = require('./controlData.js');

        const questions = controlData.readJSON(modulePath);

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
        var writeRoutingErrors = fs.createWriteStream(modulePath+'routingErrors.txt', {flags: 'w',encoding: 'utf-8'})
        

        questions.forEach((question,i,questions) => {
            let questionStr = writeQuestionRouting(question,questions);
            if (questionStr.error) {
                writeRouting.write(questionStr.message);
                writeRoutingErrors.write(questionStr.message);
            } else {
                writeRouting.write(questionStr);  
            }
        });
        writeRouting.end() // close string
        writeRoutingErrors.end()

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

function writeQuestionRouting(question,questions) {
    const categoryLetter = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'];
    const questionNames = questions.map(x=>x.qname);

    const errValidation = validateRouting(question,questionNames);
    if (errValidation) {
       
        return {error:true, message:errValidation};
    }

    let routing = question.routing.split('#qstart#')[0].trim();

    if (routing.indexOf('jobcat') > -1) {
        return"'" + question.qname + "\n" + question.qname + '.Ask()\n';
    } else {
        routing = 'if ' + routing.replace(/\s*=\s*/,' * {_') + '} then\n';

        if (routing.indexOf('_check') > -1) {
            var catValue = routing.match(/\{_([\d]+)\}/)[1];
            if (!categoryLetter[catValue-1]) {
                routing = routing.replace('a','b');
            }
            routing = routing.replace(/\{_[\d]+\}/,'{'+ categoryLetter[catValue-1] +'}')       
        }

        return routing + '\t' + question.qname + '.Ask()\nend if\n';
    }
    
}

function validateRouting(question,questionNames) {

    
    let routing = question.routing.split('#qstart#')[0].trim();

    // check if its follwoing the instruction layout
        if (routing.indexOf('=') < 0) {
            return "'to do Incorrect instruction (doesnt have = symbol)\n'" + "if " + routing + " then\n'\t" + question.qname + ".Ask()\n'end if\n"
        }

        if (routing.indexOf('_radio') < 0 && routing.indexOf('_check') < 0 && routing.indexOf('jobcat') < 0) {
            return "'to do Incorrect instruction (the question name is incorrect)\n'" + "if " + routing + " then\n'\t" + question.qname + ".Ask()\n'end if\n"
        }

    // check if question exists
        if (routing.indexOf('jobcat') < 0) {
            if(questionNames.filter((qname) => qname.toLowerCase() === routing.split('=')[0].trim()).length === 0) {
                return "'to do question doesnt exists\n'" + "if " + routing + " then\n'\t" + question.qname + ".Ask()\n'end if\n"
            }
        }

    // check if the answer has value
        if(!question.routing.split('=')[1].trim()) {
            return "'to do check instruction\n'" + "if " + routing + " then\n'\t" + question.qname + ".Ask()\n'end if\n"
        }

    
}

