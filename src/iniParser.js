const fs = require("fs");

module.exports = {
  parseIniFile: (file) => {
    console.log("Trying to read ", file);
    const data = fs.readFileSync(file, "utf-8");
    if (data === "") {
      console.error("Couldn't read ", file);
      throw file + " file not found";
    }

    const regex = {
      section: /^\s*\[\s*([^\]]*)\s*]\s*$/,
      param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
      comment: /^\s*;.*$/
    };

    let resultObj = {};
    const lines = data.split(/[\r\n]+/);
    let section = null;

    lines.forEach(function (line) {
      if (regex.comment.test(line)) {
        // Nothing to do here
      }
      else if (regex.param.test(line)) {
        const match = line.match(regex.param);
        if (section) {
          resultObj[section][match[1]] = match[2];
        } else {
          resultObj[match[1]] = match[2];
        }
      }
      else if (regex.section.test(line)) {
        const match = line.match(regex.section);
        resultObj[match[1]] = {};
        section = match[1];
      }
      else if (line.length === 0 && section) {
        section = null;
      }
    });
    return resultObj;
  }
};