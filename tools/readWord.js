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

    
 
    const textArr = document.body[0].p
    .filter(p => p.r)
    .map(p => {
        let obj = [];
        let isInstr = false;
        p.r.forEach(r => {
            if (r.t) {
                r.t.forEach(t => {
                    if (typeof t === 'string') {
                        obj.push(t)
                    };
                    if (typeof t._ === 'string') {
                        obj.push(t._)
                    }
                })
            }
        });
        p.r.forEach(r => {
            if (r.rPr) {
                if (r.rPr[0].color) {
                   if (r.rPr[0].color[0].$.themeColor === 'background1') {
                     isInstr = true;
                   }
                }
            }
        })

        if (isInstr) {
            obj.push('#QInstr#')
        }

        return obj.join('');
    })

    return textArr;

}

function seperateQuestions(textArr) {

    let questionnaire = [];
    
    textArr.forEach((item, index, arr) => { 

        if(item.indexOf('#QInstr#') > 0) {
            let nextIndex = arr.length;
            for (let i=index+1; i<arr.length-1; i++) {
                if (arr[i].indexOf('#QInstr#') > 0) {
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

    for (let i=4; i < questionnaire.length; i++) {
        if (questionnaire[i].length > 2) {
            var question = questionModel(questionnaire[i]);
            questions.push(question);
        }
    }

    return questions;
}

function questionModel(q) {

    let question = {};

    question.routing = q[0];

    question.qname = q[1].split('[')[0].trim();

    let qtype = q[1].match(/\[[A-Za-z]+\]/)

    if (qtype) {
        switch (qtype[0]) {
            case '[S]':
                question.qtype = 'single';
                break;
            case '[M]':
                question.qtype = 'multi';
                break;
            case '[SGRID]':
                question.qtype = 'loop';
                break;
        }
    } else {
        question.qtype = 'info'
    }

    question.qlabel = q[2];

    if (question.qtype === 'info') {
        for (let i=3; i < q.length; i++) {
            question.qlabel += '<br/>' + q[i];
        }
    } else if (question.qtype === 'single' || question.qtype === 'multi') {
        let categories = [];
        for (let i=3; i < q.length; i++) {
            if (q[i].search('Scripter') < 0) {
                let cat = {};
                if (q[i].search(/[0-9]+./) > -1) {                    
                    cat.catLabel = q[i].split(/[0-9]+./)[1].trim();
                    cat.catValue = q[i].match(/[0-9]+/)[0].trim();
                    cat.catName = '_' + q[i].match(/[0-9]+/)[0].trim();
                    categories.push(cat);
                } else {
                    cat.catLabel = q[i];
                    cat.catValue = i;
                    cat.catName = '_' + i;
                    categories.push(cat);
                }
            }         
        }
        question.categories = categories;
    } else if(question.qtype === 'loop') {
        for (let i=3; i < q.length; i++) {
            if (q[i].search('Rows') > -1) {
                let slices = [];
                let j = i + 1;
                let counter = 0;
                while (q[j].search('Columns:') < 0) {
                    let slice = {};
                    counter++;
                    slice.catLabel = q[j].trim();
                    slice.catValue = counter;
                    slice.catName = '_' + counter;
                    slices.push(slice);
                    j++;
                }
                question.slices = slices;
            }
            if (q[i].search('Columns:') > -1) {
                let categories = [];
                let counter = 0;
                for (let j=i+1; j < q.length; j++) {
                    counter++;
                    let category = {};
                    category.catLabel = q[j];
                    category.catValue = counter;
                    category.catName = '_' + counter;
                    categories.push(category);
                }
                question.categories = categories;
            }         
        }
    }

    return question;
}