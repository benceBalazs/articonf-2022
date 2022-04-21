import fs from "fs";
import csv from "csvtojson";
import fetch from 'node-fetch';

let directory = "../3_Car_sharing/";

console.log("-- Welcome to the Articonf-2022 Dataset Analyzer --\n");
console.log("1. Converting .csv to .json");

// createFolder("findings");
// convertToJSON();

console.log("2. Adjust .json to include states calculated by lat and long");

// addFormatUsers();
// addLocation();

console.log("3. Adjust .json regarding csv compatibility");

adjustSuggestions();

function adjustSuggestions() {
  let tempTravelFile = JSON.parse(fs.readFileSync(directory+"findings/Travel_ext.json").toString());
  suggestions(tempTravelFile);
}

function addLocation() {
  let tempTravelFile = JSON.parse(fs.readFileSync(directory+"findings/Travel_ext.json").toString());
  asyncLoopEndLocations(tempTravelFile);
}

function suggestions(tempTravelFile){
  tempTravelFile.forEach((travelInstance)=>{
    let saveSuggestionStart = travelInstance.startedBy;
    let saveSuggestionEnd = travelInstance.suggestedEndPlaces;
    travelInstance.startedBy = {};
    travelInstance.suggestedEndPlaces = {};
    JSON.parse(saveSuggestionStart).forEach((start, index)=>{
      // travelInstance.startedBy["coordinate"+index] = {"latitude": start.coordinate.latitude, "longitude": start.coordinate.longitude};
      // travelInstance.startedBy["moment"] = start.moment;
      tempTravelFile.push({startPlace: {"latitude": start.coordinate.latitude, "longitude": start.coordinate.longitude, "startTime" : start.moment, "kmTraveled": travelInstance.kmTraveled, "totalPrice" : travelInstance.totalPrice}});
    });
    JSON.parse(saveSuggestionEnd).forEach((end)=>{
      tempTravelFile.push({ endPlace: {"latitude": end.endPlace.latitude, "longitude": end.endPlace.longitude}});
      // travelInstance.suggestedEndPlaces[end.suggestedBy] = {"latitude": end.endPlace.latitude, "longitude": end.endPlace.longitude};
    });
  });
  fs.writeFile(
    directory + "/findings/" + "Travel_ext.json",
    JSON.stringify(tempTravelFile, undefined, 2),
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

async function asyncLoopStartLocations(travelInstance){
  let counter = travelInstance.length;
  for (let index = 0; index < travelInstance.length; index++) {
    const response = await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+travelInstance[index].startPlace.latitude+'&lon='+travelInstance[index].startPlace.longitude);
    let requestedLocation = await response.json();
    console.log("Requested information: "+ counter-- +" instances left...");
    Object.assign(travelInstance[index].startPlace, {"country": requestedLocation.address.country});
    // travelInstance.startPlace.country = requestedLocation.address.country;
    await sleep(3000); // in accordance to the api
  }
  fs.writeFile(
    directory + "/findings/" + "Travel_ext.json",
    JSON.stringify(travelInstance, undefined, 2),
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

async function asyncLoopEndLocations(travelInstance){
  let counter = travelInstance.length;
  for (let index = 0; index < travelInstance.length; index++) {
    const response = await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+travelInstance[index].endPlace.latitude+'&lon='+travelInstance[index].endPlace.longitude);
    let requestedLocation = await response.json();
    console.log("Requested information: "+ counter-- +" instances left...");
    Object.assign(travelInstance[index].endPlace, {"country": requestedLocation.address.country});
    // travelInstance.startPlace.country = requestedLocation.address.country;
    await sleep(3000); // in accordance to the api
  }
  fs.writeFile(
    directory + "/findings/" + "Travel_ext.json",
    JSON.stringify(travelInstance, undefined, 2),
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function addFormatUsers() {
  let tempTravelFile = JSON.parse(fs.readFileSync(directory+"findings/Travel.json").toString());
  tempTravelFile.forEach((travelInstance)=>{
    travelInstance["users_formatted"] = {};
    JSON.parse(travelInstance.users).forEach((user)=>{
      travelInstance["users_formatted"][user.userId] = {"passengers": user.passengers};
    });
  });
  fs.writeFile(
    directory + "/findings/" + "Travel_ext.json",
    JSON.stringify(tempTravelFile, undefined, 2),
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

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
