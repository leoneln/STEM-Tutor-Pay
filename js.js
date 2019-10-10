//Function to JSONize csv
function csvJSON(csv) {
  var lines = csv.split("\r\n");
  var result = [];
  var headers = lines[0].split(",");
  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return JSON.stringify(result);
}
//Write Buttons
function WriteButtons(data) {
  var step = "step1";
  var element = document.getElementById(step);
  for (var i = 0; i < data.length; i++) {
    if (i >= 4) {
      step = "step2";
      element = document.getElementById(step);
    }
    if (i >= 7) {
      step = "step3";
      element = document.getElementById(step);
    }
    element.innerHTML += '<label class="btn btn-secondary btn-sm m-2" id="' + data[i].Value + '">'
      + '<input type="radio" id="' + data[i] + '" name="' + step + '" class="btn btn-secondary" onchange="fetchPayRate()">' + data[i]
      + '</label><br />';
  }
}
function buttonCreator(data, step, element) {
  for (var i = 0; i < data.length; i++) {
    element.innerHTML += '<label class="btn btn-secondary btn-sm m-2" id="' + data[i].Value + '">'
      + '<input type="radio" id="' + data[i] + '" name="' + step + '" class="btn btn-secondary" onchange="fetchPayRate()">' + data[i]
      + '</label><br />';
  }
}
//Declare urls that will be used. 
let gsheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwlUFekIfqsyJoZHBo-uRMkWK7AR1L5iq59UrRslAN9ExoYhcZJH36pn2aCMYtJd-YwuhtnEXhIPfT/pub?";
let sortedSheet = 'gid=91226759&single=true&output=csv';//Sheet with sorters
//First for step 1, fetch to get the buttons names and render them with the for loop
fetch(gsheet + sortedSheet).then(function (response) {
  return response.text();
}).then(function (data) {
  var data = JSON.parse(csvJSON(data));
  data = data.sort(function (a, b) {
    return a.Cral_Sort - b.Cral_Sort;
  });
  let crla = [];
  for (var a = 0; a < data.length; a++) {
    crla.push(data[a].Crla);
  }
  data = data.sort(function (a, b) {
    return a.Degree_Sort - b.Degree_Sort;
  })
  let degBtns = [];
  for (var e = 0; e < data.length; e++) {
    degBtns.push(data[e].Degree);
  }
  degBtns = [...new Set(degBtns.map(x => x))];
  crla = [...new Set(crla.map(x => x))];
  var element = document.getElementById("step1");
  buttonCreator(crla, "step1", element);
  element = document.getElementById("step2");
  buttonCreator(degBtns, "step2", element);
});
//Create a function that will be called onChange. Notice the on change property on each input type above. 
function fetchPayRate() {
  let x = document.getElementById('form');
  let radOn = new Array;
  for (let i = 0; i < x.length; i++) {
    if (x.elements[i].checked === true) {
      //radOn.push(x.elements[i].id);
      let stepGroup = x.elements[i].name;
      radOn[stepGroup] = x.elements[i].id;
    }
  }
  //declare paramets that will be used in fetch... Notice that this is ternary conditional declaration
  let crla = radOn["step1"] === undefined ? 1 : radOn["step1"];
  let degree = radOn["step2"] === undefined ? 1 : radOn["step2"];
  let years = radOn["step3"] === undefined ? 1 : radOn["step3"];
  //Construct URL and then fecth.. The fetch will write to spans with the min and max ids. 
  //let payUrl = "https://apex.oracle.com/pls/apex/leonelrest/stempay/raterange/" + crla + "/" + degree + "/" + years;
  fetch(gsheet + sortedSheet).then(function (response) {
    return response.text();
  }).then(function (data) {
    var payData = JSON.parse(csvJSON(data));
    //console.log(crla, degree, years);
    payData = payData.filter(val => { return val.Crla === crla });
    if (degree !== 1) {
      payData = payData.filter(val => { return val.Degree === degree });
    }
    if (years !== 1) {
      payData = payData.filter(val => { return val.Years === years });
    }
    //Write Step 3
    let step3 = payData.sort(function (a, b) {
      return a.Years_Sort - b.Years_Sort;
    })
    let yearsButtons = [];
    for (var c = 0; c < step3.length; c++) {
      yearsButtons.push(step3[c].Years);
    }
    yearsButtons = [...new Set(yearsButtons.map(x => x))];
    var step3El = document.getElementById("step3");
    step3El.innerHTML = '';
    buttonCreator(yearsButtons, "step3", step3El);
    let max = payData.length - 1;
    let amnts = new Array();
    for (var z = 0; z < payData.length; z++) {
      amnts.push(parseFloat(payData[z]["PayRate"]));
    }
    let maxPay = Math.max.apply(null, amnts);
    let minPay = Math.min.apply(null, amnts);
    //console.log(payData);
    //Write on to document
    if (maxPay === minPay) {
      document.getElementById("middle").innerHTML = '$' + payData[0]["PayRate"];
      document.getElementById("label").children[1].classList.remove("label");
      document.getElementById("label").children[0].classList.add("label");
      document.getElementById("label").children[2].classList.add("label");
    } else {
      document.getElementById("min").innerHTML = '$' + minPay;
      document.getElementById("max").innerHTML = '$' + maxPay;
      document.getElementById("label").children[0].classList.remove("label");
      document.getElementById("label").children[2].classList.remove("label");
      document.getElementById("label").children[1].classList.add("label");
    }
    //Remove "In Progress" from step 2
    if (crla === "III") {
      document.getElementById("step2").children[0].classList.add("label");
      document.getElementById("cert3").classList.remove("label");
    }
  })
}