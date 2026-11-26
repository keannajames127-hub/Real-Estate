const { readFileSync } = require("node:fs");
const file = process.argv[2];
const names = process.argv.slice(3);
const text = readFileSync(file, "utf8");
for (const name of names) {
  let index = -1;
  while ((index = text.indexOf(name, index + 1)) !== -1) {
    console.log(`--- ${name} @${index}`);
    console.log(text.slice(Math.max(0, index - 260), index + 40).replace(/\s+/g, " "));
  }
}
