// http://www.mangatown.com/directory/0-0-0-0-0-0/1.htm?name.az

function mangaTownList() {
  this.MangaTown = [];
  this.MangaTown.export = function (min) {
    if (min) {
      saveFile(JSON.stringify(MangaTown), "MangaTown-min.json");
    } else {
      saveFile(JSON.stringify(MangaTown, null, "\t"), "MangaTown.json");
    }
  }
  searchUrl = "http://www.mangatown.com/search.php?name_method=cw&name=&author_method=cw&author=&artist_method=cw&artist=&type=&demographic=&genres[4%20koma]=0&genres[action]=0&genres[adventure]=0&genres[comedy]=0&genres[cooking]=0&genres[doujinshi]=0&genres[drama]=0&genres[ecchi]=0&genres[fantasy]=0&genres[gender%20bender]=0&genres[harem]=0&genres[historical]=0&genres[horror]=0&genres[martial%20arts]=0&genres[mature]=0&genres[mecha]=0&genres[music]=0&genres[mystery]=0&genres[one%20shot]=0&genres[psychological]=0&genres[reverse%20harem]=0&genres[romance]=0&genres[school%20life]=0&genres[sci%20fi]=0&genres[slice%20of%20life]=0&genres[sports]=0&genres[supernatural]=0&genres[suspense]=0&genres[tragedy]=0&genres[vampire]=0&genres[webtoons]=0&genres[youkai]=0&released_method=eq&released=&rating_method=eq&rating=&is_completed=&advopts=1&page=";
  i = 1;
  max = 0;
  simpleRequest(searchUrl + i, resultPage);

  function resultPage(response) {
    if (max != 0 && (i > max)) {
      console.log("All pages checked.");
      return true;
    }
    parser = new DOMParser();
    doc = parser.parseFromString(response, "text/html");
    test = $(".manga_text_content.search_result:contains('Sorry you have just searched, please try 5 seconds later.')", doc);
    if (test.length != 0) {
      console.log("Error from site: \"Sorry you have just searched, please try 5 seconds later.\"");
      setTimeout(function () {
        simpleRequest(searchUrl + i, resultPage)
      }, 5500);
      return -1;
    }
    mangasOnPage = $(".manga_pic_list li", doc);
    console.log(mangasOnPage);
    if (i == 1) {
      this.MangaTown.searchNumPerPage = mangasOnPage.length;
      this.MangaTown.searchNumOfPages = max = parseInt($(".next-page a:eq(-2)", doc).text());
      this.MangaTown.searchNumTotal = this.MangaTown.searchNumPerPage * this.MangaTown.searchNumOfPages;
      console.log(this.MangaTown.searchNumOfPages + " pages of search result, " + this.MangaTown.searchNumPerPage + " per page, " + this.MangaTown.searchNumTotal + " total.");
    }
    for (j in mangasOnPage) {
      if (isNaN(j))
        break;
      manga = {coverSrc: $(".manga_cover img", mangasOnPage[j])[0].src};
      title = $(".title a", mangasOnPage[j])[0];
      manga.url = title.href;
      manga.title = title.title;
      genres = [];
      genre = $(".keyWord a", mangasOnPage[j]);
      for (k in genre) {
        if (genre[k].textContent == undefined)
          break;
        genres.push(genre[k].textContent);
      }
      manga.genres = genres;
      rest = $(".view", mangasOnPage[j]);
      try {
        manga.author = rest[0].firstElementChild.textContent;
      } catch (err) {
        manga.author = rest[0].textContent;
      }
      manga.status = rest[1].textContent.replace(/ /g, "");
      manga.status = manga.status.substr(7);  //indexOf("Status:")+7; => 0 + 7 = 7
      MangaTown.push(manga);
    }
    i++;
    setTimeout(function () {
      simpleRequest(searchUrl + i, resultPage)
    }, 5500);
    return true;
  }
}