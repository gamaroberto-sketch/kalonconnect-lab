const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');
const languages = ['en-US', 'es-ES', 'fr-FR'];
const sourceLang = 'pt-BR';

// Load all JSONs
const loadJson = (lang) => {
    try {
        const filePath = path.join(localesDir, `${lang}.json`);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error loading ${lang}:`, e.message);
        process.exit(1);
    }
};

const ptBR = loadJson(sourceLang);
const targets = {};
languages.forEach(lang => {
    targets[lang] = loadJson(lang);
});

// Helper to get all keys recursively for a specific section
const getKeys = (obj, prefix = '') => {
    let keys = [];
    for (const k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            keys = keys.concat(getKeys(obj[k], prefix + k + '.'));
        } else {
            keys.push(prefix + k);
        }
    }
    return keys;
};

// Focus on professionalGuide
console.log('🔍 Starting i18n Audit for "professionalGuide"...');
const section = 'professionalGuide';

if (!ptBR[section]) {
    console.error('❌ Critical: professionalGuide missing in pt-BR source!');
    process.exit(1);
}

const sourceKeys = getKeys(ptBR[section], `${section}.`);
console.log(`ℹ️  Source (pt-BR) has ${sourceKeys.length} keys in ${section}.`);

let hasErrors = false;

languages.forEach(lang => {
    const targetObj = targets[lang];
    if (!targetObj[section]) {
        console.error(`❌ Missing entire "${section}" in ${lang}`);
        hasErrors = true;
        return;
    }

    const targetKeys = new Set(getKeys(targetObj[section], `${section}.`));
    const missing = sourceKeys.filter(k => !targetKeys.has(k));

    if (missing.length > 0) {
        console.error(`\n⚠️  Missing keys in ${lang}:`);
        missing.forEach(k => console.error(`   - ${k}`));
        hasErrors = true;
    } else {
        console.log(`✅ ${lang}: Complete (100% match)`);
    }
});

if (hasErrors) {
    console.error('\n❌ Audit Failed: Missing translations found.');
    process.exit(1);
} else {
    console.log('\n✨ Audit Passed: All languages match pt-BR structure!');
    process.exit(0);
}
