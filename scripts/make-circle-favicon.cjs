const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', 'keyadi-logo.jpg');
const outPath = path.join(__dirname, '..', 'public', 'favicon.svg');

const imgBuffer = fs.readFileSync(imgPath);
const b64 = imgBuffer.toString('base64');

// The gold circular boundary of the Keyadi emblem is at center (512, 512), radius ~463
// We viewBox tightly around this circle (49, 49 to 975, 975 => width 926, height 926)
// and apply a circular clipPath with r="463".
// Any pixel outside r=463 is completely transparent!
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="49 49 926 926" width="128" height="128">
  <defs>
    <clipPath id="circleClip">
      <circle cx="512" cy="512" r="463" />
    </clipPath>
  </defs>
  <circle cx="512" cy="512" r="462" fill="#0c0b09" stroke="#e8a33d" stroke-width="3" />
  <image href="data:image/jpeg;base64,${b64}" x="0" y="0" width="1024" height="1024" clip-path="url(#circleClip)" />
</svg>`;

fs.writeFileSync(outPath, svg);
console.log('Successfully generated public/favicon.svg (perfectly circular emblem)');
