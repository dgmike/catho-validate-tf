const fs = require('fs');
const path = require('path');
const readFileSync = require('fs').readFileSync;
const hcltojson = require('hcl-to-json');

const dir = process.argv[2] || '.';

const hcls = fs
  .readdirSync(dir)
  .map(f => path.resolve(dir, f))
  .filter(f => (fs.statSync(f).mode & fs.constants.S_IFREG) == fs.constants.S_IFREG)
  .filter(f => f.match(/\.tf$/))
  .map(file => ({
    file,
    content: readFileSync(file).toString(),
  }))
  .map(e => {
    e.hcl = hcltojson(e.content);
    return e;
  });

const summary = hcls
  .map(item => {
    const { hcl } = item;
    item.resource_errors = Object
      .keys(hcl.resource || [])
      .map(e => {
        x = Object.keys(hcl.resource[e] || [])
          .filter(e => !e.match(/^[a-z0-9]([a-z0-9_]*[a-z0-9]|[a-z0-9]*)$/))
          .map(elm => `resource."${e}"."${elm}"`)
        return x;
      })
      .reduce((accumulator, currentValue) => accumulator.concat(currentValue), [])

    item.errors = item.resource_errors;

    return item;
  });

const errors = summary
  .filter(item => item.errors.length > 0)
  .map(item => {
    return {
      file: item.file,
      errors: item.errors
    };
  });

console.log(JSON.stringify(errors, null, 2));
