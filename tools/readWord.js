

module.exports = {
    readWord : function(modulePath) {

        const controlData = require('./controlData.js');

        const document = controlData.readDocument(modulePath);
        
        const textArr = extractText(document);
        
        const questionnaire = seperateQuestions(textArr);
        
        const questions = createQuestions(questionnaire)

        controlData.writeJSON(questions,modulePath);

    }

}

function extractText(document) {

    const textArr = document.body[0].p.filter(p => p.r)
    .map(p => {

        if (p.pPr) {
            if (p.pPr[0].pStyle) {
                if (p.pPr[0].pStyle[0].$.val === 'QDisplayLogic') {
                    let logicObj = p.r;
                    logicObj.push({isInstruction:true})
                    return logicObj;
                }
            }
        }
        return p.r;
    })
    .map(r => {
        let obj = [];

        r.forEach(r => {
            if (r.isInstruction) {
                obj.push('#QSTART#')
            }
            if (r.t) {
                r.t.forEach( text => {
                    if (typeof text === 'string') {
                        obj.push(text)
                    } else {
                        obj.push(text._)
                    }
                })

            }
        })

        return obj;
    })
    .map(text => {

        var result = text.join('');

        if (result.indexOf('#QSTART#') > 0 ) {
            return result.toLowerCase().split('if ').splice(-1)[0];
        } else {
            return result;
        }

    }).slice(0,-1);

    return textArr;

}

function seperateQuestions(textArr) {

    let questionnaire = [];
    
    textArr.forEach((item, index, arr) => { 

    
        if(item.indexOf('#qstart#') > 0) {
            let nextIndex = arr.length;
            for (let i=index+1; i<arr.length-1; i++) {
                if (arr[i].indexOf('#qstart#') > 0) {
                    nextIndex = i;
                    break;
                }
            }
            questionnaire.push(arr.slice(index,nextIndex))
        }

    })

    return questionnaire;
}

function createQuestions(questionnaire) {

    const questions = [];

    questionnaire.forEach(q => {

        var question = questionModel(q);

        questions.push(question);

    })

    return questions;
}

function questionModel(q) {

    let question = {};

    question.routing = q[0];

    question.qname = q[1].split(' ')[1];

    if (question.qname.toLowerCase().indexOf('radio') > 0) {
        question.qtype = 'single'
    } else {
        question.qtype = 'multi'
    }

    question.qlabel = q[1];

    // set categories
    let categories = [];

    q.slice(2,q.length).forEach((item,index) => {

        let cat = {}
        if (item) {
            // category label
            if (item.search(/\s+Exclusive\s+\([\d]+\)/) > 0) {
                cat.catLabel = item.split(/\s+Exclusive\s+\([\d]+/)[0];
                cat.isExclusive = true;
            } else if (item.search(/\s+\[Freetext\]\s+\([\d]+/) > 0) {
                cat.catLabel = item.split(/\s+\[Freetext\]\s+\([\d]+/)[0];
                cat.isOther = true;
            } else {
                cat.catLabel = item.split(/\s+\([\d]+/)[0];
            }

            // category value
            if (question.qname === 'AIRT_RADIO_1G1') {
                // check with research
            } else {
                cat.catValue = item.match(/\s+\([\d]+\)/g)[0].match(/[\d]+/)[0];
            }

            // category name
            if (question.qtype === 'single') {
                cat.catName = '_' + cat.catValue;
            } else {
                cat.catName = item.split(' ')[0].slice(-1);
            }

            categories.push(cat);
        }
    })

    question.categories = categories;

    return question;
}