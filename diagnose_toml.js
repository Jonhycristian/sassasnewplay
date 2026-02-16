const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'netlify.toml');

try {
    const buffer = fs.readFileSync(filePath);
    console.log('File size:', buffer.length);
    console.log('First 10 bytes (hex):', buffer.subarray(0, 10).toString('hex'));

    // Check for BOM (EF BB BF)
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        console.log('⚠️ BOM detected! Removing it...');
        const newBuffer = buffer.subarray(3);
        fs.writeFileSync(filePath, newBuffer);
        console.log('✅ BOM removed.');
    } else {
        console.log('✅ No BOM detected.');
    }

    // Check content is readable
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('Content check (first 50 chars):');
    console.log(content.substring(0, 50));

} catch (err) {
    console.error('Error:', err);
}
