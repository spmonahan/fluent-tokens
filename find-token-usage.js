import { globSync } from 'glob';
import { mkConfig, generateCsv, asString } from "export-to-csv";
import fluentTokens from '@fluentui/tokens';
import { readFileSync, writeFileSync } from 'fs';

const fluentPath = process.argv[2];

const files = globSync(`${fluentPath}/**/*.{ts,tsx}`, { ignore: 'node_modules/**' });

const tokens = new Map();

for (const file of files) {
  if (file.includes('.stories.')) {
    // skip documentation
    continue;
  }

  const contents = readFileSync(file, 'utf8');

  const tokenRegexp = /tokens\.([a-zA-Z0-9]+)/gm;
  let match;
  while ((match = tokenRegexp.exec(contents)) !== null) {
    const token = match[1];
    if (tokens.has(token)) {

      const value = tokens.get(token);
      value.count += 1;
      if (!value.files.includes(file.replace(fluentPath, ''))) {
        value.files.push(file.replace(fluentPath, ''));
      }

      tokens.set(token, value);
    } else {
      tokens.set(token, {
        count: 1,
        files: [file.replace(fluentPath, '')]
      });
    }
  }
}

const csvData = [];
for (const token of tokens) {
  csvData.push({ token: token[0], count: token[1].count, files: token[1].files.join('\n') });
}

csvData.sort((a, b) => {
  if (a.token < b.token) {
    return -1;
  } else if (a.token > b.token) {
    return 1;
  }

  return 0;
});

// Detailed usage
let csvConfig = mkConfig({ useKeysAsHeaders: true });
let csv = generateCsv(csvConfig)(csvData);
let csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
writeFileSync('token-usage-detailed.csv', csvBuffer);

// Summary usage
csvConfig = mkConfig({ columnHeaders: [ 'Num used tokens', 'Total tokens', 'Usage %', ] });
let usageData = [
  {
    'Num used tokens': csvData.length,
    'Total tokens': Object.keys(fluentTokens.tokens).length,
    'Usage %': (csvData.length / Object.keys(fluentTokens.tokens).length) * 100,
  }
];
csv = generateCsv(csvConfig)(usageData);
csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
writeFileSync('token-usage-summary.csv', csvBuffer);

// Unused tokens
const allTokens = Object.keys(fluentTokens.tokens);
const unusedTokens = allTokens.filter(token => !csvData.find(item => item.token === token)).map(token => ({ 'Unused tokens': token }));
csvConfig = mkConfig({ columnHeaders: [ 'Unused tokens' ] });
csv = generateCsv(csvConfig)(unusedTokens);
csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
writeFileSync('token-unused-list.csv', csvBuffer);

// Filtered usage
// Removes palette tokens that are mostly isolated two controls (Avatar and Badge)
const filteredCsvData = csvData.filter(item => {
  return !item.token.includes('Palette');
});

csvConfig = mkConfig({ useKeysAsHeaders: true });
csv = generateCsv(csvConfig)(filteredCsvData);
csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
writeFileSync('token-usage-filtered.csv', csvBuffer);

usageData = [
  {
    'Num used tokens': filteredCsvData.length,
    'Total tokens': Object.keys(fluentTokens.tokens).length,
    'Usage %': (filteredCsvData.length / Object.keys(fluentTokens.tokens).length) * 100,
  }
];
csv = generateCsv(csvConfig)(usageData);
csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
writeFileSync('token-usage-filtered-summary.csv', csvBuffer);