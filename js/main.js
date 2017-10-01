// response - For getting responses and calling functions which can call next chain function
// doc - For getting raw HTML as text and then to parse it as HTML Document for jQuery, which can search by CSS selectors

var response, doc;

// Testing modules

window.onload = function () {
  if (!window.jQuery) {
    tmp = document.createElement("script");
    tmp.setAttribute("type", "text/javascript");
    tmp.setAttribute("src", "js/jquery-3.2.1.min.js");
    document.body.appendChild(tmp);
  }
  if (typeof ($.fn.modal) === 'undefined') {
    tmp = document.createElement("script");
    tmp.setAttribute("type", "text/javascript");
    tmp.setAttribute("src", "js/bootstrap-3.3.7.min.js");
    document.body.appendChild(tmp);
  }
  if (!window.JSZip) {
    tmp = document.createElement("script");
    tmp.setAttribute("type", "text/javascript");
    tmp.setAttribute("src", "js/jszip-3.1.3.3.min.js");
    document.body.appendChild(tmp);
  }
  if (!window.saveAs) {
    tmp = document.createElement("script");
    tmp.setAttribute("type", "text/javascript");
    tmp.setAttribute("src", "js/FileSaver.min.js");
    document.body.appendChild(tmp);
  }
  $(document).ready(function () {
    var bodyColor = $('body').css("color");
    if (bodyColor != 'rgb(51, 51, 51)') {
      $("head").prepend("<link rel='stylesheet' href='css/bootstrap-3.3.7.min.css' type='text/css' media='screen'>");
    }
  });
  //req=request("test","ajax.php?url="+encodeURIComponent("http://www.mangatown.com/manga/fairy_tail/",function(){alert("Success!\n\n"+req)},function(){alert("Fail!")},3));
  this.manga = {};
  this.manga.startFrom = 110;
  simpleRequest("http://www.mangatown.com/manga/kissxsis/",gather);
}

function gather(response) {
  // HTML raw text response to HTML Document
  parser = new DOMParser();
  doc = parser.parseFromString(response, "text/html");
  try {
    website = $("meta[property='og:site_name']", doc)[0].content;
  } catch (err) {
    website = "undefined";
  }
  manga.source = website;
  website = website.toLowerCase().replace(/ /g, "");
  switch (website) {
    case "mangatown":
      try {
        init();
      } catch(err) {
        tmp = document.createElement("script");
        tmp.setAttribute("type", "text/javascript");
        tmp.setAttribute("src", "js/MangaTownDownload.js");
        document.body.appendChild(tmp);
      }
      break;
    default:
      alert("Source website not supported!");
  }
}

var isDragged = false;

function dragAnim(event) {
  if (event.buttons % 2 != 1)
    isDragged = false;
  if (isDragged != true)
    return false;
  percent = event.pageX * 100 / window.innerWidth;
  if (percent < 0)
    percent = 0;
  if (percent > 100)
    percent = 100;
  $("#prgBar")
          .attr("aria-valuenow", percent)
          .css({
            width: percent + "%"
          })
          .text(Math.toFixed(percent, 2, true) + "%");
  return false;
}

$("#prg")
        .on("mousedown", function (event) {
          isDragged = true;
          event.preventDefault();
          $(document).on("mousemove", dragAnim);
        });