const readWord = require('./tools/readWord.js').readWord;
const writeMDD = require('./tools/writeMDD.js').writeMDD;

const moduleName = "MECH"

const modulePath = "C:/Users/yasen.ivanov/Documents/readWord_v2/readWord/modules/"+moduleName+"/"+moduleName+"_"

readWord(modulePath);
writeMDD(modulePath);