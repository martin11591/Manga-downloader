String.prototype.toFileName=function() {
    return fileNameReplacer(this.toString());
}

Math.lead=function(num,max,asStr,char,spacesAfterLeadChar,leadChar) {
    var num, digits, asStr, char, spacesAfterLeadChar, leadChar;
    if (!char) {char = "0";} else {char = char.charAt(0);}
    if (char == "0") {spacesAfterLeadChar = true;}
    if (!num) {num = 0;} else {num = isNaN(parseFloat(num)) == true ? 0 : parseFloat(num);}
    if (max) {max = isNaN(parseInt(max,10)) == true ? null : parseInt(max,10);}
    if (!max && max != 0) return asStr == true ? num.toString() : num;
    if (num < 0) lNum = "-";
    if (max < 0) lMax = "-";
    if (num >= 0) lNum = leadChar == true ? "+" : "";
    if (max >= 0) lMax = leadChar == true ? "+" : "";
    if (asStr == false) return num;
    num = Math.abs(num).toString();
    max = Math.abs(max).toString();
    if (num.indexOf(".") == -1) {
        r = "";
    } else {
        r = num.substr(num.lastIndexOf("."));
        num = num.substr(0,num.indexOf("."));
    }
    repCnt = (lMax.length+max.length)-(lNum.length+num.length);
    if (repCnt < 0) repCnt = 0;
    rep = char.repeat(repCnt);
    return (spacesAfterLeadChar == true ? lNum + rep + num : rep + lNum + num) + r;
}

Math.toFixed=function(num,digits,asStr,char) {
    var num, digits, asStr, char;
    if (!char) {char = "0";} else {char = char.charAt(0);}
    if (!num) {num = 0;} else {num = isNaN(parseFloat(num)) == true ? 0 : parseFloat(num);}
    if (digits) {digits = isNaN(parseInt(digits,10)) == true ? null : Math.abs(parseInt(digits,10));}
    if (!digits && digits != 0) return asStr == true ? num.toString() : num;
    if (digits == 0) return asStr == true ? Math.round(num).toString() : Math.round(num);
    pow = Math.pow(10,digits);
    num = Math.round(num*pow)/pow;
    if (asStr != true) return num;
    str = num.toString();
    if (str.indexOf(".") == -1) {
        l = parseInt(str,10);
        r = "";
    } else {
        l = parseInt(str.substr(0,str.indexOf(".")),10);
        r = str.substr(str.lastIndexOf(".")+1);
    }
    if (r == "") return l+"."+char.repeat(digits);
    digits = digits-r.length;
    return l+"."+r+char.repeat(digits < 0 ? 0 : digits);
}

function fileNameReplacer(str) {
  try {
    return str.toString().replace(new RegExp("\"","gi"),"").replace(new RegExp("[\/:\*\?\"<>|\\\\]+","gi"),"_").replace(new RegExp("(\\.\\.\\.|\\.)$","gi"),"");
  } catch(err) {
    console.log("Wrong data, can't replace.");
    return str||null;
  };
};

function saveFile(textData,filename) {
  var resultBlob=new Blob([textData.replace(new RegExp("\\n","gi"),"\r\n")],{type: 'text/plain'});
  resultBlobMouseEvent=document.createEvent('MouseEvents');
  resultBlobElement=document.createElement('a');
  resultBlobElement.download=fileNameReplacer(filename)+".txt";
  resultBlobElement.href=window.URL.createObjectURL(resultBlob);
  resultBlobElement.dataset.downloadurl=['text/plain',resultBlobElement.download,resultBlobElement.href].join(':');
  resultBlobMouseEvent.initMouseEvent('click',true,false,window,0,0,0,0,0,false,false,false,false,0,null);
  resultBlobElement.dispatchEvent(resultBlobMouseEvent);
};

function saveZip(myZip, filename, comment) {
    var myZip, filename, comment;
    if (!myZip) {
        console.log("No JSZip resource!");
        return -1;
    }
    filename = fileNameReplacer(filename);
    options = {type: "blob", compression: "DEFLATE", compressionOptions: {level: 9}};
    if (comment) options.comment = comment;
    $("#saveProgressZipFileName").text(filename);
    $("#saveProgressModal").modal("show");
    myZip.generateAsync(options, function updateCallback(metadata) {
        $("#saveProgressCompressedFileName").text(metadata.currentFile);
        $("#saveProgressBar")
        .attr("aria-valuenow", metadata.percent)
        .css({
            width : metadata.percent + "%"
        })
        .text(Math.toFixed(metadata.percent,2,true) + "%");
    })
    .then(function(blob) {
        $("#saveProgressModal").modal("hide");
        saveAs(blob, filename);
    }, function(e) {
        alert("Error when creating archive: "+e);
    });
}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    img.crossOrigin = "anonymous";

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/jpg");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function yql(q,url,xpath,format) {
  if (!format) format="&format=json"; else if (format.toLowerCase().slice(0,4)!="json") format="";
  return "https://query.yahooapis.com/v1/public/yql?q="+encodeURIComponent(q)+(url?encodeURIComponent(" where url='"+url+"'"):"")+(xpath?encodeURIComponent(" and xpath=\""+xpath+"\""):"")+format;
};

function avg(table) {
  tAVG=0;
  for (tI in table) tAVG+=table[tI];
  return tAVG/table.length;
}

requests=[];
requestsHistory={done: [], fail: [], abort: []};

function request(name,url,callback,failCallback,retryNum) {
  try {requestsLimit} catch(err) {requestsLimit=16;};
  try {requestsTimeout} catch(err) {requestsTimeout=1;};
  try {requestRetryLimit} catch(err) {requestRetryLimit=Infinity;};
  try {requestRetryTimeout} catch(err) {requestRetryTimeout=1000;};
  if (!failCallback) var failCallback;
  if (!retryNum) retryNum=0;
  if (retryNum>=requestRetryLimit) {
    console.log("Request named \""+name+"\" reached max "+requestRetryLimit+" retry limit. Request rejected.");
    if (requestsHistory.fail[name]) requestsHistory.fail[name+".Old"]=requestsHistory.fail[name];
    requestsHistory.fail[name]={url: url, callback: callback, failCallback: failCallback, retryNum: retryNum};
    delete(requests[name]);
    if (failCallback) failCallback();
    return -4; // retrying request failed
  }
  requestsLength=0;
  for (rI in requests) requestsLength++;
  if (requestsLength>=requestsLimit) {
    console.log("Request named \""+name+"\" can't be requested, because of limited requests to "+requestsLimit+" at once. Next attempt in "+Math.ceil(requestRetryTimeout/1000)+" seconds.");
    if (requests[name]) requests[name].retry=setTimeout(function(){request(name,url,callback,failCallback,retryNum)},requestRetryTimeout);
    return -2; // exceeded requests limit
  }
  if (requests[name]&&!requests[name].retry) {
    console.log("Request named \""+name+"\" can't be requested, because it already exists. Next attempt in "+Math.ceil(requestRetryTimeout/1000)+" seconds.");
    setTimeout(function(){request(name,url,callback,failCallback,retryNum)},requestRetryTimeout);
    return -3; // request already exists
  }
  requests[name]={url: url, callback: callback, failCallback: failCallback, retryNum: retryNum, ajax: $.ajax({dataType: (url.indexOf("&format=json")!=-1?"json":"xml"), url: url, cache: false})};
    console.log("Waiting for request named \""+name+"\".");
  requests[name].ajax.done(function(requestData) {
    if (requestsHistory.done[name]) requestsHistory.done[name+".Old"]=requestsHistory.done[name];
    returningData=(url.indexOf("&format=json")!=-1?requestData.query.results:requestData);
    requestsHistory.done[name]={url: url, callback: callback, failCallback: failCallback, retryNum: retryNum, result: returningData};
    console.log("Request named \""+name+"\" finished.");
    delete(requests[name]);	
    //callback(returningData);
  });
  requests[name].ajax.fail(function() {
    console.log("Request named \""+name+"\" failed. Next attempt ("+(retryNum+1)+") in "+Math.ceil(requestRetryTimeout/1000)+" seconds.");
    if (requests[name]) requests[name].retry=setTimeout(function(){request(name,url,callback,failCallback,retryNum+1)},requestRetryTimeout);
    return -1; // request failed
  });
}

function abortRequest(name) {
  if (!requests[name]) {
    console.log("Can't abort request named \""+name+"\". Such request not exist.");
    return -1;
  };
  clearTimeout(requests[name].retry);
  if (requestsHistory.abort[name]) requestsHistory.abort[name+".Old"]=requestsHistory.abort[name];
  requestsHistory.abort[name]={url: requests[name].url, callback: requests[name].callback, failCallback: requests[name].failCallback, retryNum: requests[name].retryNum};
  delete(requests[name]);
  console.log("Request named \""+name+"\" aborted.");
  return 0;
}

function resumeRequest(name) {
  if (!requestsHistory.abort[name]) {
    console.log("Can't resume request named \""+name+"\". Such request not exist.");
    return -1;
  };
  requests[name]={url: requestsHistory.abort[name].url, callback: requestsHistory.abort[name].callback, failCallback: requestsHistory.abort[name].failCallback, retryNum: requestsHistory.abort[name].retryNum};
  delete(requestsHistory.abort[name]);
  console.log("Request named \""+name+"\" resumed.");
  requests[name].retry=setTimeout(function(){request(name,requests[name].url,requests[name].callback,requests[name].failCallback,requests[name].retryNum)},requestRetryTimeout);
  return 0;
}

/*
req=$.ajax({dataType: "json", url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%27http%3A%2F%2Fwww.mangatown.com%2Fmanga%2Fyamada_kun_to_7_nin_no_majo%2Fc174%2F19.html%27%20and%20xpath%3D%22%2F%2Fdiv%5B%40id%3D%27viewer%27%5D%2Fa%5B%40href%5D%7C%2F%2Fimg%5B%40alt%5D%5Blast()%5D%22&format=json&diagnostics=true&callback=", cache: false});
req.done(function(msg) {console.log("Request done!\n"+this+"\n"+req.responseText)});
req.fail(function() {alert("Failed! Retry")});
*/

function simpleRequest(url, callback, async, method, autofail) {
  if (!autofail) autofail = false;
  if (autofail) {
    console.log("Autofail enabled!");
    setTimeout(function () {
      simpleRequest(url, callback, async, method, autofail);
    }, 1000);
  }
  if (!method) method = "GET";
  req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.responseText);
    }
  };
  req.onerror = function () {
    console.log("Request error! Retry...");
    simpleRequest(url, callback, async, method);
  };
  req.open(method, "ajax.php?url=" + encodeURIComponent(url), async == false ? false : true);
  req.send();
}

function timeStrRepair(str) {
  str = str.replace(/[^0-9a-z]/gi, "-");
  str = str.substr(-4) + "-" + str.substr(0, 3) + "-" + str.substr(4, 2);
  if (str.substr(-1, 1) == "-")
    str = str.substr(0, 8) + "-0" + str.substr(-2, 1);
  str = monthStrConvert(str);
  return str;
}

function monthStrConvert(str) {
  monObj = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"};
  str = str.replace(/[a-z]{3}/gi, function (x) {
    x = x.toLowerCase();
    return monObj[x];
  });
  return str;
}

function show(element, duration) {
  duration = duration ? duration : 333;
  element.stop(true, true).fadeIn({duration: duration, queue: false}).css('display', 'none').slideDown(duration);
}

function hide(element, duration) {
  duration = duration ? duration : 333;
  element.stop(true, true).fadeOut({duration: duration, queue: false}).slideUp(duration);
}