<?php require_once 'ajax.php' ?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Get images from web pages</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" type="text/css" media="screen">
        <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->
    </head>
    <body>
        <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
        <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
        <script type="text/javascript" src="https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js"></script>
        <script type="text/javascript" src="/getHTML/js/ajax.js"></script>
        <script type="text/javascript">
            var response, doc;
            window.onload = function() {
                if (!window.jQuery) {
                    tmp=document.createElement("script");
                    tmp.setAttribute("type","text/javascript");
                    tmp.setAttribute("src","/getHTML/js/jquery-3.2.1.min.js");
                    document.body.appendChild(tmp);
                }
                if (typeof($.fn.modal) === 'undefined') {
                    tmp=document.createElement("script");
                    tmp.setAttribute("type","text/javascript");
                    tmp.setAttribute("src","/getHTML/js/bootstrap-3.3.7.min.js");
                    document.body.appendChild(tmp);
                }
                if (!window.JSZip) {
                    tmp=document.createElement("script");
                    tmp.setAttribute("type","text/javascript");
                    tmp.setAttribute("src","/getHTML/js/jszip-3.1.3.3.min.js");
                    document.body.appendChild(tmp);
                }
                if (!window.saveAs) {
                    tmp=document.createElement("script");
                    tmp.setAttribute("type","text/javascript");
                    tmp.setAttribute("src","/getHTML/js/FileSaver.min.js");
                    document.body.appendChild(tmp);
                }
                $(document).ready(function() {
                    var bodyColor = $('body').css("color");
                    if (bodyColor != 'rgb(51, 51, 51)') {
                        $("head").prepend("<link rel='stylesheet' href='css/bootstrap-3.3.7.min.css' type='text/css' media='screen'>");
                    }
                });
                //req=request("test","ajax.php?url="+encodeURIComponent("http://www.mangatown.com/manga/fairy_tail/",function(){alert("Success!\n\n"+req)},function(){alert("Fail!")},3));
                this.manga = {zip: new JSZip()};
                this.manga.startFrom = 48;
                simpleRequest("http://www.mangatown.com/manga/trinity_seven/",gather);
            }
            
            function gather(response) {
                parser = new DOMParser();
                doc = parser.parseFromString(response,"text/html");
                try {
                    website = $("meta[property='og:site_name']",doc)[0].content;
                } catch(err) {website = "undefined"};
                this.manga.source = website;
                website = website.toLowerCase().replace(/ /g,"");
                switch (website) {
                    case "mangatown":
                        gatherMangaTown(response,doc);
                        break;
                    default:
                        alert("Source website not supported!");
                }
            }
            function gatherMangaTown(response,doc) {
                info = $(".article_content",doc);
                this.manga.title = $(".title-top",doc)[0].textContent;
                this.manga.zip = this.manga.zip.folder(fileNameReplacer(this.manga.title));
                this.manga.altNames = $("li :contains('Alternative')",info)[0].nextSibling.textContent.split("; ");
                this.manga.demographics = $("li :contains('Demographic')",info)[0].nextSibling.textContent;
                genre = $("li :contains('Genre')",info)[0];
                this.manga.genres = [];
                try {
                    do {
                        this.manga.genres.push(genre.nextSibling.textContent);
                        genre = genre.nextSibling.nextSibling;
                    } while (true);
                } catch(err) {
                    void(null);
                }
                author = $("li :contains('Author')",info)[0];
                this.manga.authors = [];
                try {
                    do {
                        this.manga.authors.push(author.nextSibling.textContent);
                        author = author.nextSibling.nextSibling;
                    } while (true);
                } catch(err) {
                    void(null);
                }
                artist = $("li :contains('Artist')",info)[0];
                this.manga.artists = [];
                try {
                    do {
                        this.manga.artists.push(artist.nextSibling.textContent);
                        artist = artist.nextSibling.nextSibling;
                    } while (true);
                } catch(err) {
                    void(null);
                }
                this.manga.coverSrc = $("img:first",info)[0].src;
                simpleRequest(this.manga.coverSrc,function(response){
                    this.manga.zip.file("cover.jpg",response.substr(response.indexOf(",")+1),{base64: true});
                },false,"POST");
                this.manga.rate = parseFloat($(".scores",info)[0].innerText);
                this.manga.votes = parseInt($("#rate",info)[0].lastChild.textContent.replace(/[^0-9]/gi,""));
                this.manga.status = $("li :contains('Status')",info)[0].nextSibling.textContent.replace(/ /gi,"");
                this.manga.generateComment = function() {
                    comment = "MANGA: "+this.title;
                    comment += "\n\nALTERNATIVE NAME"+(this.altNames.length > 1 ? "S" : "")+": "+this.altNames.join(", ");
                    comment += "\nGENRE"+(this.genres.length > 1 ? "S" : "")+": "+this.genres.join(", ");
                    comment += "\nDEMOGRAPHIC: "+this.demographics;
                    comment += "\nAUTHOR"+(this.authors.length > 1 ? "S" : "")+": "+this.authors.join(", ");
                    comment += "\nARTIST"+(this.artists.length > 1 ? "S" : "")+": "+this.artists.join(", ");
                    comment += "\nRATE: "+this.rate+" ("+this.votes+" votes)";
                    comment += "\nSTATUS: "+this.status+"\n";
                    if (this.chaptersCount) comment += "\nCHAPTERS: "+this.chaptersCount+" ("+this.normalChapters+" normal chapter"+(this.normalChapters > 1 ? "s" : "")+" and "+this.bonusChapters+" bonus chapter"+(this.bonusChapters > 1 ? "s" : "")+")";
                    if (this.gStart) comment += "\nDOWNLOADED CHAPTERS: "+Math.min(this.chapters[this.gStart].num,this.chapters[this.gStop].num)+"-"+Math.max(this.chapters[this.gStart].num,this.chapters[this.gStop].num)+", "+(this.asc && this.asc == true ? "ASCENDING":"DESCENDING"+" ("+this.reqNormalChapters+" normal chapter"+(this.reqNormalChapters > 1 ? "s" : "")+" and "+this.reqBonusChapters+" bonus chapter"+(this.reqBonusChapters > 1 ? "s" : "")+")");
                    comment += "\nSOURCE: "+this.source;
                    comment += "\n\n(c) MARCIN PODRAZA aka martin11591";
                    return comment;
                }
                
                this.manga.zip.file("info.txt",this.manga.generateComment());
                
                Object.defineProperty(this.manga, "pagesCount", {
                    get: function() {
                        pages = 0;
                        for (i in this.chapters) {
                            pages += isNaN(this.chapters[i].pagesCount) == false ? parseInt(this.chapters[i].pagesCount) : 0;
                        }
                        return pages;
                    }
                });
                
                this.manga.saveZip = function() {
                    root = this.zip.root;
                    this.zip.root = "";
                    saveZip(this.zip,fileNameReplacer(this.title+" ("+Math.min(this.chapters[this.gStart].num,this.chapters[this.gStop].num)+"-"+Math.max(this.chapters[this.gStart].num,this.chapters[this.gStop].num)+").zip"),this.generateComment());
                    this.zip.root = root;
                };
                                
                info = $(".chapter_content .chapter_list li",doc);
                this.manga.chaptersCount = chLen = info.length;
                chapters = [];
                maxVol = 1;
                inx = chLen;
                for (i in info) {
                    try {
                        chName = info[i].lastChild.previousSibling.previousSibling.previousSibling.textContent;
                        if ($("span",info[i]).length < 2) {chName = "";}
                    } catch(err) {break;}
                    iUrl = $("a[href]",info[i])[0];
                    chUrl = iUrl.href;
                    chNum = iUrl.textContent.replace(/ {2,}/gi,"");
                    chNum = parseFloat(chNum.substr(chNum.lastIndexOf(" ")+1));
                    iVol = $(":contains('Vol')",info[i]);
                    try {
                        vol = parseInt(iVol[0].textContent.replace(/[^0-9]/gi,""));
                    } catch(err) {vol = 1;}
                    if (vol > maxVol) maxVol = vol;
                    iTime = $(".time",info[i])[0].textContent;
                    chTime = timeStrRepair(iTime);
                    chapters.unshift({i: inx--, name: chName, url: chUrl, num: chNum, numStr: Math.lead(Math.floor(chNum), chLen) + (chNum.toString().lastIndexOf(".") != -1 ? chNum.toString().substr(chNum.toString().lastIndexOf(".")) : ""), vol: vol, volStr: Math.lead(vol, maxVol < 10 ? 10 : maxVol), time: chTime});
                }
                
                this.manga.chapters = chapters;
                if (!this.manga.startFrom || this.manga.startFrom == 0) this.manga.startFrom = chapters[0].num;
                if (!this.manga.stopAt) this.manga.stopAt = chapters[chapters.length-1].num;
                
                gStart = gStop = gChCount = gNormCh = gBonCh = gReqNormCh = gReqBonCh = 0;
                
                for (i in chapters) {
                    if (chapters[i].num < this.manga.startFrom) gStart++;
                    if (chapters[i].num >= this.manga.startFrom && chapters[i].num <= this.manga.stopAt) {
                        gChCount++;                        
                        if (chapters[i].num % 1 > 0) {gReqBonCh++;} else {gReqNormCh++;}
                        zip = this.manga.zip.folder("Vol. "+chapters[i].volStr);
                        this.manga.chapters[i].zip = zip.folder("Chapter "+chapters[i].numStr+" "+fileNameReplacer(chapters[i].name));
                    }
                    if (chapters[i].num < this.manga.stopAt) gStop++;
                    if (chapters[i].num % 1 > 0) {gBonCh++;} else {gNormCh++;}
                }
                
                this.manga.normalChapters = gNormCh;
                this.manga.bonusChapters = gBonCh;
                this.manga.reqNormalChapters = gReqNormCh;
                this.manga.reqBonusChapters = gReqBonCh;
                
                gStep = 1;
                
                if (this.manga.desc == true) {
                    gStep = -1;
                    gTmp = gStart;
                    gStart = gStop;
                    gStop = gTmp;
                } else {this.manga.asc = true;}
                
                this.manga.gStart = gStart;
                this.manga.gStop = gStop;
                this.manga.gStep = gStep;
                this.manga.gI = gStart;
                this.manga.reqChaptersCount = gChCount;
                gP = -1;
                
                console.log(gStart+"-"+gStop+" ("+gChCount+")");
                
                simpleRequest(chapters[this.manga.gI].url,gatherMangaTownChapterPages);
                
                function gatherMangaTownChapterPages(response) {
                    if (this.manga.gI > this.manga.gStop || (this.manga.desc && (this.manga.gI < this.manga.gStart))) {
                        console.log("All chapters downloaded!");
                        this.manga.saveZip();
                        return true;
                    }
                    gP++;
                    console.log("Gathering chapter "+this.manga.chapters[this.manga.gI].numStr+" ("+Math.toFixed(gP*100/this.manga.reqChaptersCount,2,true)+"%)");
                    parser = new DOMParser();
                    doc = parser.parseFromString(response,"text/html");
                    pages = $(".page_select:first select",doc)[0];
                    this.manga.chapters[this.manga.gI].pagesCount = pages.length;
                    pages = $("option[value]",pages);
                    this.manga.chapters[this.manga.gI].pages = [];
                    for (i = 0; i < pages.length; i++) {
                        this.manga.chapters[this.manga.gI].pages.push({url: pages[i].value});
                    }
                    imgs = $("img",doc);
                    try {
                        imgSrc = imgs[0].src;
                        this.manga.chapters[this.manga.gI].pages[0].imgSrc = imgSrc;
                        console.log("Gathering page 01 of "+this.manga.chapters[this.manga.gI].pagesCount+" ("+Math.toFixed(200/this.manga.chapters[this.manga.gI].pagesCount,2,true)+"%)");
                        simpleRequest(this.manga.chapters[this.manga.gI].pages[0].imgSrc,function(response){
                            this.manga.chapters[this.manga.gI].zip.file("Ch-"+this.manga.chapters[this.manga.gI].numStr+"-Pg-01.jpg",response.substr(response.indexOf(",")+1),{base64: true});
                        },false,"POST");
                    } catch(err) {
                        console.log("No more pages!\n\n"+err);
                        this.manga.gI += this.manga.gStep;
                        if (this.manga.gI > this.manga.gStop || (this.manga.desc && (this.manga.gI < this.manga.gStart))) {
                            console.log("All chapters downloaded!");
                            this.manga.saveZip();
                            return true;
                        }
                        simpleRequest(chapters[this.manga.gI].url,gatherMangaTownChapterPages);
                        return true;
                    }
                    try {
                        imgSrc = imgs[2].src;
                        this.manga.chapters[this.manga.gI].pages[1].imgSrc = imgSrc;
                        console.log("Gathering page 02 of "+this.manga.chapters[this.manga.gI].pagesCount+" ("+Math.toFixed(102/this.manga.chapters[this.manga.gI].pagesCount,2,true)+"%)");
                        simpleRequest(this.manga.chapters[this.manga.gI].pages[1].imgSrc,function(response){
                            this.manga.chapters[this.manga.gI].zip.file("Ch-"+this.manga.chapters[this.manga.gI].numStr+"-Pg-02.jpg",response.substr(response.indexOf(",")+1),{base64: true});
                        },false,"POST");
                    } catch(err) {
                        console.log("No more pages!");
                        this.manga.gI += this.manga.gStep;
                        if (this.manga.gI > this.manga.gStop || (this.manga.desc && (this.manga.gI < this.manga.gStart))) {
                            console.log("All chapters downloaded!");
                            this.manga.saveZip();
                            return true;
                        }
                        simpleRequest(chapters[this.manga.gI].url,gatherMangaTownChapterPages);
                        return true;
                    }
                    
                    gJ = 2;
                    simpleRequest(this.manga.chapters[this.manga.gI].pages[gJ].url,gatherMangaTownChapterPagesFurther);
                    
                    function gatherMangaTownChapterPagesFurther(response) {
                        parser = new DOMParser();
                        doc = parser.parseFromString(response,"text/html");
                        imgs = $("img",doc);
                        try {
                            imgSrc = imgs[0].src;
                            this.manga.chapters[this.manga.gI].pages[gJ].imgSrc = imgSrc;
                            console.log("Gathering page "+Math.lead(gJ+1,this.manga.chapters[this.manga.gI].pagesCount)+" of "+this.manga.chapters[this.manga.gI].pagesCount+" ("+Math.toFixed((gJ+1)*100/this.manga.chapters[this.manga.gI].pagesCount,2,true)+"%)");
                            simpleRequest(this.manga.chapters[this.manga.gI].pages[gJ].imgSrc,function(response){
                                this.manga.chapters[this.manga.gI].zip.file("Ch-"+this.manga.chapters[this.manga.gI].numStr+"-Pg-"+Math.lead((gJ+1),(this.manga.chapters[this.manga.gI].pagesCount<10?10:this.manga.chapters[this.manga.gI].pagesCount))+".jpg",response.substr(response.indexOf(",")+1),{base64: true});
                            },false,"POST");
                            gJ++;
                        } catch(err) {
                            console.log("No more pages!");
                            this.manga.gI++;
                            if (this.manga.gI > this.manga.gStop || (this.manga.desc && (this.manga.gI < this.manga.gStart))) {
                                console.log("All chapters downloaded!");
                                this.manga.saveZip();
                                return true;
                            }
                            simpleRequest(chapters[this.manga.gI].url,gatherMangaTownChapterPages);
                            return true;
                        }
                        try {
                            imgSrc = imgs[2].src;
                            this.manga.chapters[this.manga.gI].pages[gJ].imgSrc = imgSrc;
                            console.log("Gathering page "+Math.lead(gJ+1,this.manga.chapters[this.manga.gI].pagesCount)+" of "+this.manga.chapters[this.manga.gI].pagesCount+" ("+Math.toFixed((gJ+1)*100/this.manga.chapters[this.manga.gI].pagesCount,2,true)+"%)");
                            simpleRequest(this.manga.chapters[this.manga.gI].pages[gJ].imgSrc,function(response){
                                this.manga.chapters[this.manga.gI].zip.file("Ch-"+this.manga.chapters[this.manga.gI].numStr+"-Pg-"+Math.lead((gJ+1),(this.manga.chapters[this.manga.gI].pagesCount<10?10:this.manga.chapters[this.manga.gI].pagesCount))+".jpg",response.substr(response.indexOf(",")+1),{base64: true});
                            },false,"POST");
                            gJ++;
                        } catch(err) {
                            console.log("No more pages!");
                            this.manga.gI += this.manga.gStep;
                            if (this.manga.gI > this.manga.gStop || (this.manga.desc && (this.manga.gI < this.manga.gStart))) {
                                console.log("All chapters downloaded!");
                                this.manga.saveZip();
                                return true;
                            }
                            simpleRequest(chapters[this.manga.gI].url,gatherMangaTownChapterPages);
                            return true;
                        }
                        if (gJ < this.manga.chapters[this.manga.gI].pagesCount) {simpleRequest(this.manga.chapters[this.manga.gI].pages[gJ].url,gatherMangaTownChapterPagesFurther);} else {
                            console.log("No more pages!");
                            this.manga.gI += this.manga.gStep;
                            if (this.manga.gI > this.manga.gStop || (this.manga.desc && (this.manga.gI < this.manga.gStart))) {
                                console.log("All chapters downloaded!");
                                this.manga.saveZip();
                                return true;
                            }
                            simpleRequest(chapters[this.manga.gI].url,gatherMangaTownChapterPages);
                            return true;
                        }
                    }
                }
            }
            
            function timeStrRepair(str) {
                str = str.replace(/[^0-9a-z]/gi,"-");
                str = str.substr(-4)+"-"+str.substr(0,3)+"-"+str.substr(4,2);
                if (str.substr(-1,1) == "-") str=str.substr(0,8)+"-0"+str.substr(-2,1);
                str = monthStrConvert(str);
                return str;
            }
            function monthStrConvert(str) {
                monObj = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"};
                str = str.replace(/[a-z]{3}/gi,function(x) {
                    x = x.toLowerCase();
                    return monObj[x];
                });
                return str;
            }
        </script>
        <div class="row">
            <div class="col-md-12">COL1</div>
        </div>
        <div class="row">
            <div class="col-md-6">COL1</div>
            <div class="col-md-6">COL2</div>
        </div>
        <div class="row">
            <div class="col-md-12">COL1</div>
        </div>
        <div class="container">
            <!-- Modal -->
            <div class="modal fade" id="saveProgressModal" role="dialog">
                <div class="modal-dialog">

                    <!-- Modal content-->
                    <div class="modal-content panel panel-primary">
                        <div class="modal-header panel-heading">
                            <h1 class="panel-title" style="text-align: center">Generating <i><span id="saveProgressZipFileName">ZIP</span></i> file...</h1>
                        </div>
                        <div class="modal-body panel-body" style="padding:40px 50px;">
                            <p>Compressing file:</p>
                            <div class="well">
                                <p id="saveProgressCompressedFileName"></p>
                            </div>
                            <p>Overall progress:</p>
                            <div class="progress">
                                <div class="progress-bar progress-bar-striped active" id="saveProgressBar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
                                    0%
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div> 
        </div>
    </body>
</html>
