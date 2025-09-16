const fs = require('fs');

// Decode a large number in any base to BigInt
function decodeBigInt(value, base) {
    return BigInt('0x' + BigInt(`0b${parseInt(value, base)}`).toString(16));
}

// Alternative: Use BigInt with native parseInt for bases <=36
function decodeValueBigInt(value, base) {
    return BigInt(parseInt(value, parseInt(base, 10)));
}

// Compute P(0) using Lagrange Interpolation with BigInt
function lagrangeInterpolationBigInt(points) {
    let n = points.length;
    let c = 0n;

    for (let i = 0; i < n; i++) {
        let xi = BigInt(points[i].x);
        let yi = BigInt(points[i].y);
        let numerator = 1n;
        let denominator = 1n;

        for (let j = 0; j < n; j++) {
            if (i !== j) {
                let xj = BigInt(points[j].x);
                numerator *= -xj; // 0 - xj
                denominator *= (xi - xj);
            }
        }
        c += yi * numerator / denominator;
    }

    return c;
}

// Main function
function main() {
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.error("❌ Please provide input JSON file as argument.");
        return;
    }

    let rawData = fs.readFileSync(inputFile);
    let jsonData = JSON.parse(rawData);

    if (!jsonData.keys) {
        console.error("❌ JSON missing 'keys' field.");
        return;
    }

    let n = jsonData.keys.n;
    let k = jsonData.keys.k;

    let points = [];

    for (let key in jsonData) {
        if (key !== 'keys') {
            let item = jsonData[key];
            let x = parseInt(key, 10);
            let y = BigInt(parseInt(item.value, parseInt(item.base, 10)));
            points.push({ x, y });
        }
    }

    if (points.length < k) {
        console.error(`❌ Not enough points to determine the polynomial. Required: ${k}, Provided: ${points.length}`);
        return;
    }

    let selectedPoints = points.slice(0, k);
    let c = lagrangeInterpolationBigInt(selectedPoints);

    console.log(`✅ Constant term c: ${c}`);
}

main();
