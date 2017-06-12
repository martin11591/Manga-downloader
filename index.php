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
    <style type="text/css">
      ul.nav a, ul.pager a { transition: 0.333s; border-radius: 5px; }
      div#selectWebsite div[class*='col-'] { padding: 1px; }
    </style>
  </head>
  <body>
    <div class="container-fluid">
      <ul class="nav nav-pills nav-justified">
        <li class="active"><a data-toggle="pill" href="#selectWebsite">Select</a></li>
        <li><a data-toggle="pill" href="#fromUrl">URL</a></li>
      </ul>
      <div class="tab-content">
        <div id="selectWebsite" class="tab-pane fade in active">
          <div class="container-fluid">
            <div class="row">
              <div class="col-xs-12 col-sm-3 col-md-2 col-lg-1">
                <div class="list-group">
                  <a href="#" class="list-group-item">MangaTown</a>
                  <a href="#" class="list-group-item">MangaTown</a>
                </div>
              </div>
              <div class="col-xs-12 col-sm-3">
                <div class="list-group">
                  <a href="#" class="list-group-item">MangaTown</a>
                  <a href="#" class="list-group-item">MangaTown</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="fromUrl" class="tab-pane fade">
          <form>
            <div class="input-group">
              <span class="input-group-addon">URL</span>
              <input id="url" type="text" class="form-control" name="url" placeholder="Manga URL">
              <div class="input-group-btn">
                <button class="btn btn-primary" type="submit">
                    <!-- <i class="glyphicon glyphicon-search"></i> -->
                  GRAB!
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div id="log"></div>

    <div class="container-fluid">
      <ul class="pager">
        <li class="previous"><a href="#">PREVIOUS</a></li>
        <li class="next"><a href="#">NEXT</a></li>
      </ul>
    </div>

    <!-- Save ZIP modal dialog -->
    <div class="container">
      <div class="modal fade" id="saveProgressModal" role="dialog">
        <div class="modal-dialog">
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

    <div class="progress" id="prg" draggable="true">
      <div class="progress-bar progress-bar-striped active" id="prgBar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
        0%
      </div>
    </div>

    <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script type="text/javascript" src="/MangaDownloader/js/functions.js"></script>
    <script type="text/javascript" src="/MangaDownloader/js/info.js"></script>
    <script type="text/javascript" src="/MangaDownloader/js/main.js"></script>
  </body>
</html>
