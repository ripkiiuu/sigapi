const fs = require('fs');
let content = fs.readFileSync('script.js');
let text = content.toString('utf8');
if (text.includes('\u0000')) {
    text = content.toString('utf16le');
}

// Find the bad syntax
const badSyntax = "\\<p>\\</p><p><em>(Berita ini diunggah dari Dashboard Admin)</em></p>\\";
const goodSyntax = "`<p>${newsData.content}</p><p><em>(Berita ini diunggah dari Dashboard Admin)</em></p>`";

text = text.replace(badSyntax, goodSyntax);
text = text.replace("`\\<p>\\</p><p><em>(Berita ini diunggah dari Dashboard Admin)</em></p>\\`", goodSyntax);

fs.writeFileSync('script.js', text, 'utf8');
console.log('Fixed script.js encoding and syntax');
