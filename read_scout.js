const fs = require('fs');
const content = fs.readFileSync('scout_output_v2.txt', 'utf16le');
console.log(content);
