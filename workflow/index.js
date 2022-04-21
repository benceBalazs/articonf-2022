var fs = require("fs");
const csv = require("csvtojson");

let directory = "../3_Car_sharing/";

console.log("-- Welcome to the Articonf-2022 Dataset Analyzer --\n");
console.log("1. Converting .csv to .json");
createFolder("findings");
convertToJSON();

function convertToJSON() {
  fs.readdirSync(directory).forEach(file => {
    if(file != "findings"){
      csv().fromFile(directory + file).then((jsonObj)=>{
        fs.writeFile(
          directory + "/findings/" + file.split(".")[0]+".json",
          JSON.stringify(jsonObj, undefined, 2),
          function (err) {
            if (err) throw err;
            console.log("Saved!");
          }
        );
      });
    }
  });
}

function createFolder(name) {
  if (fs.existsSync(directory + name)) {
    console.log("Directory already exists!");
  } else {
    fs.mkdirSync("../3_Car_sharing/" + name, function (err) {
      if (err) console.log(name + " already exists.");
      console.log("Saved!");
    });
  }
}
