init();

function init() {
  if (typeof(W) == "undefined" || !(W instanceof Array)) {W = []} // Variable name 'Worker' is occupied, using 'W' instead; checking if W is defined and if is Array

  try {
    title = $("meta[property='og:title']", doc)[0].content;
  } catch (err) {
    title = undefined;
  }

  title = title ? title : W.length;

  manga[title] = {zip: new JSZip(), source: manga.source, title: title, paused: true, logged: false};
  delete(manga.source);
  
  MangaTownDownload(response, doc, manga[title]);
}
  
function MangaTownDownload(response, doc, mangaObj) {
  if (mangaObj.paused === true) {
    if (!mangaObj.logged) console.log("Manga "+mangaObj.title+" paused at MangaTownDownload(). Retry after 1000 ms");
    mangaObj.logged = true;
    mangaObj.timer=setTimeout(function() {MangaTownDownload(response, doc, mangaObj)}, 1000);
    return;
  } else {mangaObj.logged = false};
  info = $(".article_content", doc);
  mangaObj.title = $(".title-top", doc)[0].textContent;
  mangaObj.zip = mangaObj.zip.folder(fileNameReplacer(mangaObj.title));
  mangaObj.altNames = $("li :contains('Alternative')", info)[0].nextSibling.textContent.split("; ");
  mangaObj.demographics = $("li :contains('Demographic')", info)[0].nextSibling.textContent;
  genre = $("li :contains('Genre')", info)[0];
  mangaObj.genres = [];
  try {
    do {
      mangaObj.genres.push(genre.nextSibling.textContent);
      genre = genre.nextSibling.nextSibling;
    } while (true);
  } catch (err) {
    void(null);
  }
  author = $("li :contains('Author')", info)[0];
  mangaObj.authors = [];
  try {
    do {
      mangaObj.authors.push(author.nextSibling.textContent);
      author = author.nextSibling.nextSibling;
    } while (true);
  } catch (err) {
    void(null);
  }
  artist = $("li :contains('Artist')", info)[0];
  mangaObj.artists = [];
  try {
    do {
      mangaObj.artists.push(artist.nextSibling.textContent);
      artist = artist.nextSibling.nextSibling;
    } while (true);
  } catch (err) {
    void(null);
  }
  mangaObj.coverSrc = $("img:first", info)[0].src;
  simpleRequest(mangaObj.coverSrc, function (response) {
    mangaObj.zip.file("cover.jpg", response.substr(response.indexOf(",") + 1), {base64: true});
  }, false, "POST");
  mangaObj.rate = parseFloat($(".scores", info)[0].innerText);
  mangaObj.votes = parseInt($("#rate", info)[0].lastChild.textContent.replace(/[^0-9]/gi, ""));
  mangaObj.status = $("li :contains('Status')", info)[0].nextSibling.textContent.replace(/ /gi, "");
  mangaObj.generateComment = function () {
    comment = "MANGA: " + this.title;
    comment += "\n\nALTERNATIVE NAME" + (this.altNames.length > 1 ? "S" : "") + ": " + this.altNames.join(", ");
    comment += "\nGENRE" + (this.genres.length > 1 ? "S" : "") + ": " + this.genres.join(", ");
    comment += "\nDEMOGRAPHIC: " + this.demographics;
    comment += "\nAUTHOR" + (this.authors.length > 1 ? "S" : "") + ": " + this.authors.join(", ");
    comment += "\nARTIST" + (this.artists.length > 1 ? "S" : "") + ": " + this.artists.join(", ");
    comment += "\nRATE: " + this.rate + " (" + this.votes + " votes)";
    comment += "\nSTATUS: " + this.status + "\n";
    if (this.chaptersCount)
      comment += "\nCHAPTERS: " + this.chaptersCount + " (" + this.normalChapters + " normal chapter" + (this.normalChapters > 1 ? "s" : "") + " and " + this.bonusChapters + " bonus chapter" + (this.bonusChapters > 1 ? "s" : "") + ")";
    if (this.gStart)
      comment += "\nDOWNLOADED CHAPTERS: " + Math.min(this.chapters[this.gStart].num, this.chapters[this.gStop].num) + "-" + Math.max(this.chapters[this.gStart].num, this.chapters[this.gStop].num) + ", " + (this.asc && this.asc == true ? "ASCENDING" : "DESCENDING" + " (" + this.reqNormalChapters + " normal chapter" + (this.reqNormalChapters > 1 ? "s" : "") + " and " + this.reqBonusChapters + " bonus chapter" + (this.reqBonusChapters > 1 ? "s" : "") + ")");
    comment += "\nSOURCE: " + this.source;
    comment += "\n\n(c) MARCIN PODRAZA aka martin11591";
    return comment;
  }

  mangaObj.zip.file("info.txt", mangaObj.generateComment());

  Object.defineProperty(mangaObj, "pagesCount", {
    get: function () {
      pages = 0;
      for (i in this.chapters) {
        pages += isNaN(this.chapters[i].pagesCount) == false ? parseInt(this.chapters[i].pagesCount) : 0;
      }
      return pages;
    }
  });

  mangaObj.saveZip = function () {
    root = this.zip.root;
    this.zip.root = "";
    saveZip(this.zip, fileNameReplacer(this.title + " (" + Math.min(this.chapters[this.gStart].num, this.chapters[this.gStop].num) + "-" + Math.max(this.chapters[this.gStart].num, this.chapters[this.gStop].num) + ").zip"), this.generateComment());
    this.zip.root = root;
  };

  info = $(".chapter_content .chapter_list li", doc);
  mangaObj.chaptersCount = chLen = info.length;
  chapters = [];
  maxVol = 1;
  inx = chLen;
  for (i in info) {
    try {
      chName = info[i].lastChild.previousSibling.previousSibling.previousSibling.textContent;
      if ($("span", info[i]).length < 2) {
        chName = "";
      }
    } catch (err) {
      break;
    }
    iUrl = $("a[href]", info[i])[0];
    chUrl = iUrl.href;
    chNum = iUrl.textContent.replace(/ {2,}/gi, "");
    chNum = parseFloat(chNum.substr(chNum.lastIndexOf(" ") + 1));
    iVol = $(":contains('Vol')", info[i]);
    try {
      vol = parseInt(iVol[0].textContent.replace(/[^0-9]/gi, ""));
    } catch (err) {
      vol = 1;
    }
    if (vol > maxVol)
      maxVol = vol;
    iTime = $(".time", info[i])[0].textContent;
    chTime = timeStrRepair(iTime);
    chapters.unshift({i: inx--, name: chName, url: chUrl, num: chNum, numStr: Math.lead(Math.floor(chNum), chLen) + (chNum.toString().lastIndexOf(".") != -1 ? chNum.toString().substr(chNum.toString().lastIndexOf(".")) : ""), vol: vol, volStr: Math.lead(vol, maxVol < 10 ? 10 : maxVol), time: chTime});
  }

  mangaObj.chapters = chapters;
  if (!mangaObj.startFrom || mangaObj.startFrom == 0)
    mangaObj.startFrom = chapters[0].num;
  if (!mangaObj.stopAt)
    mangaObj.stopAt = chapters[chapters.length - 1].num;

  gStart = gStop = gChCount = gNormCh = gBonCh = gReqNormCh = gReqBonCh = 0;

  for (i in chapters) {
    if (chapters[i].num < mangaObj.startFrom)
      gStart++;
    if (chapters[i].num >= mangaObj.startFrom && chapters[i].num <= mangaObj.stopAt) {
      gChCount++;
      if (chapters[i].num % 1 > 0) {
        gReqBonCh++;
      } else {
        gReqNormCh++;
      }
      zip = mangaObj.zip.folder("Vol. " + chapters[i].volStr);
      mangaObj.chapters[i].zip = zip.folder("Chapter " + chapters[i].numStr + " " + fileNameReplacer(chapters[i].name));
    }
    if (chapters[i].num < mangaObj.stopAt)
      gStop++;
    if (chapters[i].num % 1 > 0) {
      gBonCh++;
    } else {
      gNormCh++;
    }
  }

  mangaObj.normalChapters = gNormCh;
  mangaObj.bonusChapters = gBonCh;
  mangaObj.reqNormalChapters = gReqNormCh;
  mangaObj.reqBonusChapters = gReqBonCh;

  gStep = 1;

  if (mangaObj.desc == true) {
    gStep = -1;
    gTmp = gStart;
    gStart = gStop;
    gStop = gTmp;
  } else {
    mangaObj.asc = true;
  }

  mangaObj.gStart = gStart;
  mangaObj.gStop = gStop;
  mangaObj.gStep = gStep;
  mangaObj.gI = gStart;
  mangaObj.reqChaptersCount = gChCount;
  gP = -1;

  console.log(gStart + "-" + gStop + " (" + gChCount + ")");

  simpleRequest(chapters[mangaObj.gI].url, gatherMangaTownChapterPages);

  function gatherMangaTownChapterPages(response) {
    if (mangaObj.gI > mangaObj.gStop || (mangaObj.desc && (mangaObj.gI < mangaObj.gStart))) {
      console.log("All chapters downloaded!");
      mangaObj.saveZip();
      return true;
    }
    if (mangaObj.paused === true) {
      if (!mangaObj.logged) console.log("Manga "+mangaObj.title+" paused at gatherMangaTownChapterPages(). Retry after 1000 ms");
      mangaObj.logged = true;
      mangaObj.timer=setTimeout(function() {gatherMangaTownChapterPages(response)}, 1000);
      return;
    } else {mangaObj.logged = false}
    gP++;
    console.log("Gathering chapter " + mangaObj.chapters[mangaObj.gI].numStr + " (" + Math.toFixed(gP * 100 / mangaObj.reqChaptersCount, 2, true) + "%)");
    parser = new DOMParser();
    doc = parser.parseFromString(response, "text/html");
    pages = $(".page_select:first select", doc)[0];
    mangaObj.chapters[mangaObj.gI].pagesCount = pages.length;
    pages = $("option[value]", pages);
    mangaObj.chapters[mangaObj.gI].pages = [];
    for (i = 0; i < pages.length; i++) {
      iUrl = pages[i].value;
      if (iUrl.indexOf("www") != -1) iUrl = iUrl.substr(iUrl.indexOf("www"));
      mangaObj.chapters[mangaObj.gI].pages.push({url: iUrl});
    }
    imgs = $("img", doc);
    try {
      imgSrc = imgs[0].src;
      mangaObj.chapters[mangaObj.gI].pages[0].imgSrc = imgSrc;
      console.log("Gathering page 01 of " + mangaObj.chapters[mangaObj.gI].pagesCount + " (" + Math.toFixed(100 / mangaObj.chapters[mangaObj.gI].pagesCount, 2, true) + "%)");
      simpleRequest(mangaObj.chapters[mangaObj.gI].pages[0].imgSrc, function (response) {
        mangaObj.chapters[mangaObj.gI].zip.file("Ch-" + mangaObj.chapters[mangaObj.gI].numStr + "-Pg-01.jpg", response.substr(response.indexOf(",") + 1), {base64: true});
      }, false, "POST");
    } catch (err) {
      console.log("No more pages!\n\n" + err);
      mangaObj.gI += mangaObj.gStep;
      if (mangaObj.gI > mangaObj.gStop || (mangaObj.desc && (mangaObj.gI < mangaObj.gStart))) {
        console.log("All chapters downloaded!");
        mangaObj.saveZip();
        return true;
      }
      simpleRequest(chapters[mangaObj.gI].url, gatherMangaTownChapterPages);
      return true;
    }
    try {
      imgSrc = imgs[2].src;
      mangaObj.chapters[mangaObj.gI].pages[1].imgSrc = imgSrc;
      console.log("Gathering page 02 of " + mangaObj.chapters[mangaObj.gI].pagesCount + " (" + Math.toFixed(200 / mangaObj.chapters[mangaObj.gI].pagesCount, 2, true) + "%)");
      simpleRequest(mangaObj.chapters[mangaObj.gI].pages[1].imgSrc, function (response) {
        mangaObj.chapters[mangaObj.gI].zip.file("Ch-" + mangaObj.chapters[mangaObj.gI].numStr + "-Pg-02.jpg", response.substr(response.indexOf(",") + 1), {base64: true});
      }, false, "POST");
    } catch (err) {
      console.log("No more pages!\n\n" + err);
      mangaObj.gI += mangaObj.gStep;
      if (mangaObj.gI > mangaObj.gStop || (mangaObj.desc && (mangaObj.gI < mangaObj.gStart))) {
        console.log("All chapters downloaded!");
        mangaObj.saveZip();
        return true;
      }
      simpleRequest(chapters[mangaObj.gI].url, gatherMangaTownChapterPages);
      return true;
    }

    gJ = 2;
    simpleRequest(mangaObj.chapters[mangaObj.gI].pages[gJ].url, gatherMangaTownChapterPagesFurther);

    function gatherMangaTownChapterPagesFurther(response) {
      if (mangaObj.paused === true) {
        if (!mangaObj.logged) console.log("Manga "+mangaObj.title+" paused at gatherMangaTownChapterPagesFurther(). Retry after 1000 ms");
        mangaObj.logged = true;
        mangaObj.timer=setTimeout(function() {gatherMangaTownChapterPagesFurther(response)}, 1000);
        return;
      } else {mangaObj.logged = false}
      parser = new DOMParser();
      doc = parser.parseFromString(response, "text/html");
      imgs = $("img", doc);
      try {
        imgSrc = imgs[0].src;
        mangaObj.chapters[mangaObj.gI].pages[gJ].imgSrc = imgSrc;
        console.log("Gathering page " + Math.lead(gJ + 1, mangaObj.chapters[mangaObj.gI].pagesCount) + " of " + mangaObj.chapters[mangaObj.gI].pagesCount + " (" + Math.toFixed((gJ + 1) * 100 / mangaObj.chapters[mangaObj.gI].pagesCount, 2, true) + "%)");
        simpleRequest(mangaObj.chapters[mangaObj.gI].pages[gJ].imgSrc, function (response) {
          mangaObj.chapters[mangaObj.gI].zip.file("Ch-" + mangaObj.chapters[mangaObj.gI].numStr + "-Pg-" + Math.lead((gJ + 1), (mangaObj.chapters[mangaObj.gI].pagesCount < 10 ? 10 : mangaObj.chapters[mangaObj.gI].pagesCount)) + ".jpg", response.substr(response.indexOf(",") + 1), {base64: true});
        }, false, "POST");
        gJ++;
      } catch (err) {
        console.log("No more pages!\n\n" + err);
        mangaObj.gI++;
        if (mangaObj.gI > mangaObj.gStop || (mangaObj.desc && (mangaObj.gI < mangaObj.gStart))) {
          console.log("All chapters downloaded!");
          mangaObj.saveZip();
          return true;
        }
        simpleRequest(chapters[mangaObj.gI].url, gatherMangaTownChapterPages);
        return true;
      }
      try {
        imgSrc = imgs[2].src;
        mangaObj.chapters[mangaObj.gI].pages[gJ].imgSrc = imgSrc;
        console.log("Gathering page " + Math.lead(gJ + 1, mangaObj.chapters[mangaObj.gI].pagesCount) + " of " + mangaObj.chapters[mangaObj.gI].pagesCount + " (" + Math.toFixed((gJ + 1) * 100 / mangaObj.chapters[mangaObj.gI].pagesCount, 2, true) + "%)");
        simpleRequest(mangaObj.chapters[mangaObj.gI].pages[gJ].imgSrc, function (response) {
          mangaObj.chapters[mangaObj.gI].zip.file("Ch-" + mangaObj.chapters[mangaObj.gI].numStr + "-Pg-" + Math.lead((gJ + 1), (mangaObj.chapters[mangaObj.gI].pagesCount < 10 ? 10 : mangaObj.chapters[mangaObj.gI].pagesCount)) + ".jpg", response.substr(response.indexOf(",") + 1), {base64: true});
        }, false, "POST");
        gJ++;
      } catch (err) {
        console.log("No more pages!\n\n" + err);
        mangaObj.gI += mangaObj.gStep;
        if (mangaObj.gI > mangaObj.gStop || (mangaObj.desc && (mangaObj.gI < mangaObj.gStart))) {
          console.log("All chapters downloaded!");
          mangaObj.saveZip();
          return true;
        }
        simpleRequest(chapters[mangaObj.gI].url, gatherMangaTownChapterPages);
        return true;
      }
      if (gJ < mangaObj.chapters[mangaObj.gI].pagesCount) {
        simpleRequest(mangaObj.chapters[mangaObj.gI].pages[gJ].url, gatherMangaTownChapterPagesFurther);
      } else {
        console.log("No more pages!");
        mangaObj.gI += mangaObj.gStep;
        if (mangaObj.gI > mangaObj.gStop || (mangaObj.desc && (mangaObj.gI < mangaObj.gStart))) {
          console.log("All chapters downloaded!");
          mangaObj.saveZip();
          return true;
        }
        simpleRequest(chapters[mangaObj.gI].url, gatherMangaTownChapterPages);
        return true;
      }
    }
  }
}