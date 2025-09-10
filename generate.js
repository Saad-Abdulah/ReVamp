const fs = require('fs');
const { readFileSync, writeFileSync } = require('fs');
const { generate } = require('@pdfme/generator');

const [,, templatePath, fieldsJson, dataJson, outputPath] = process.argv;

(async () => {
  const templatePdf = readFileSync(templatePath);
  const template = {
    basePdf: templatePdf,
    schemas: JSON.parse(fieldsJson),
  };
  const data = [JSON.parse(dataJson)];
  const pdf = await generate({ template, inputs: data });
  writeFileSync(outputPath, pdf);
  process.exit(0);
})(); 