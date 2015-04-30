<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta charset="utf-8">
<title>cTV</title>
<link href="assets/img/ico-fav.ico" rel="shortcut icon">
<link rel="stylesheet" href="assets/css/normalize.css">
<link rel="stylesheet" href="assets/css/ctv.css">
<link rel="stylesheet" href="assets/css/responsive.css">
<link rel="stylesheet" href="assets/css/elusive.css">
<link href="http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,700italic,800italic,400,700,600,800&amp;subset=latin,latin-ext" rel="stylesheet" type="text/css">
<!--[if lt IE 9]>
    <script src="assets/js/html5shiv.printshiv.js"></script>
<![endif]-->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script src="assets/js/underscore.min.js"></script>
<script src="assets/js/underscore.observable.js"></script>
<script src="assets/js/jquery.hammer.min.js"></script>
<script src="assets/js/jquery.cookie.js"></script>
<script src="assets/js/typeahead.min.js"></script>
<script src="assets/js/tv.js"></script>
</head>
<body>
    <div class="container">
        <div class="fixed">
            <div class="toolbar">
                <ul>
                    <li class="btn-search"><div><span class="icon-search"></span><p>Search</p></div></li><li class="btn-filter"><div><span class="icon-th-list"></span><p>Filter</p><ul class="toolbar3 menu-item"><li data-days="0">Today</li><li data-days="1">Tomorrow</li><li data-days="0-7">This week</li><li data-days="7-14">Next week</li><li data-days="0-14">Next two weeks</li></ul></div></li><li class="btn-favorites"><div><span class="icon-star"></span><p>Favorites</p></div></li><li class="btn-options"><div><span class="icon-cog"></span><p>Options</p><ul class="menu-item"><li>Edit Favorites</li></ul></div></li>
                </ul>
            </div>
            <div class="toolbar2 menu-item">
                <form>
                    <div class="search"><input type="text"><button type="reset" value="Clear" class="remove icon-remove"></button></div>
                </form>
            </div>
            <div class="heading"><div class="sid"><p>ID</p></div><div class="network"><p>Network</p></div><div class="title"><p>Title</p></div><div class="ep"><p>Ep</p></div></div>
            <div class="currentday"></div>
        </div>
        <div class="contents">
            <div class="loading" style="display: none">
                <img src="assets/img/loading.gif" alt="loading" />
            </div>
        </div>
        <div class="toolbar4">
            <form>
                <div class="addfav"><div><input type="text"><button class="favs-add">Add</button></div><div><select></select><button class="favs-remove">Remove</button></div></div>
            </form>
        </div>
        <div class="overlay"></div>
    </div>
</body>
</html>