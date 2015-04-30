/*jslint browser: true, white: true */
    ;(function ($, window, document, undefined) {

        // add method to allow triggering of multiple events
        $.fn.extend({
            triggerAll: function (events, params) {
                var el = this, i, evts = events.split(" ");
                for (i = 0; i < evts.length; i += 1) {
                    el.trigger(evts[i], params);
                }
                return el;
            }
        });

        var ctv = {

            // cache ctv in variable
            base: this,

            // instantiate favorites array
            // ["crossing lines", "burn notice", "breaking bad", "under the dome", "true blood", "dexter", "the killing", "magic city", "continuum"]
            fav_array: [],

            // instantiate xml source object
            xml: {},

            // instantiate shows object
            shows: [],

            // create the current date
            today: new Date(),

            // declare variables to keep track of dates
            current: "",
            currentdate: {},
            date: "",

            // since javascript is lazy, define array to display proper day of the week
            days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],

            // get functionality to load and parse xml from server
            init: function(feed, shows) {

                // show loading animation while xml source is obtained from server
                $(".loading").show();

                if ( $.cookie("favscookie") ) {
                    var cookie = unescape($.cookie("favscookie"));
                    ctv.fav_array = cookie.split(",");
                }
                else {
                    ctv.fav_array = ["crossing lines", "burn notice", "breaking bad", "under the dome", "true blood", "dexter", "the killing", "magic city", "continuum"];
                }

                // make sure favorite show array is initially sorted alphabetically
                ctv.fav_array.sort();

                // get shows xml in json format from server and await response
                $.get(
                    shows,

                    // upon successful get proceed with the following
                    function(data) {

                        for ( var i=0; i<data.country[0].show.length; i++ ) {
                            ctv.shows.push(data.country[0].show[i].showname);
                        }

                        $(".search").children("input").typeahead({
                            name: "showsearch",
                            local: ctv.shows
                        });

                    }
                );

                // get feed xml in json format from server and await response
                $.get(
                    feed,

                    // upon successful get proceed with the following
                    function(data) {

                        // hide the loading animation
                        $(".loading").hide();

                        // parse JSON received from server and store results in instantiated xml object
                        ctv.xml = data;

                        // output xml object for testing purposes
                        //console.log(ctv.xml);

                        // loop through all days in xml object, find a match for the current date and store it
                        for ( var i=0; i < ctv.xml.DAY.length; i++ ) {
                            var d = ctv.xml.DAY[i]["attributes"].attr;
                            d = d.replace(/-/g, "/");
                            ctv.date = new Date(d);
                            if ( ctv.today.getDate() === ctv.date.getDate() && ctv.today.getMonth() === ctv.date.getMonth() && ctv.today.getFullYear() === ctv.date.getFullYear() ) {
                                ctv["current"] = i;
                            }
                        }

                        // get actual date from matched date object
                        var cd = ctv.xml.DAY[ctv["current"]]["attributes"].attr;
                        cd = cd.replace(/-/g, "/");
                        ctv.currentdate = new Date(cd);

                        // generate the view for shows airing today
                        ctv.generatetoday(ctv.xml.DAY[ctv["current"]], ctv.currentdate);

                        // update current date header with proper date when scrolling to new date
                        $(window).on("scroll resize", function() {
                            ctv.updaterow("day");
                            if ( $(window).width() >= 356  && $(window).width() <= 960 ) {
                                $(".toolbar4").css({
                                    "margin-top" : "-" + $(".toolbar4").height()/2 + "px",
                                    "margin-left" : "-" + $(".toolbar4").width()/2 + "px"
                                });
                            }
                        });
                        $(window).trigger("scroll");

                        // prevent inputs from form from submitting
                        $("form").submit(function(e) {
                            e.preventDefault();
                        });

                        // default view is today view so add active class to today button under filter menu
                        $(".toolbar3").children("li:first-child").addClass("active");

                        // populate favorites module select box with initial favorites from cookie setting
                        ctv.populatefavs(ctv.fav_array);

                        // create fake select box for edit favorites module
                        ctv.styleselect(".addfav");

                        // center favorites module in the window
                        $(".toolbar4").css({
                            "margin-top" : "-" + $(".toolbar4").height()/2 + "px",
                            "margin-left" : "-" + $(".toolbar4").width()/2 + "px"
                        });

                        /**************************/
                        /**** EVENT DELEGATION ****/
                        /**************************/

                        // filter show names for user input
                        $(".search").on("keyup", ".tt-query", function() {
                            var str = $(this).val();
                            $(".contents").html();
                            ctv.filter("name", str);
                            $(window).trigger("scroll");
                            if ( str === "" ) {
                                $(".toolbar3").children("li:first-child").addClass("active").siblings("li").removeClass("active");
                            }
                            else {
                                $(".toolbar3").children("li").removeClass("active");
                            }
                        });

                        var showing = 0;

                        // allow user to click a show row to find all occurrences available
                        $(".contents").hammer().on("tap", ".show > p > a", function() {
                            if ( !showing ) {
                                var str = $(this).text();
                                $(".contents").html();
                                ctv.filter("name", str);
                                $(window).trigger("scroll");
                                $(".search").children(".twitter-typeahead").children(".tt-query").val(str).trigger("change");
                                showing = 1;
                            }
                            else {
                                ctv.generatetoday(ctv.xml.DAY[ctv["current"]], ctv.currentdate);
                                $(".search").children(".twitter-typeahead").children(".tt-query").val("").triggerAll("change keyup");
                                showing = 0;
                            }
                        });

                        // handle hiding and showing of remove icon for user input in search field
                        $(".search").on("change", ".tt-query", function() {
                            if ( $(".twitter-typeahead").children(".tt-query").val().length ) {
                                $(".search").children(".remove").show();
                            }
                            else {
                                $(".search").children(".remove").hide();
                            }
                        });

                        // clear user input upon clicking the clear button and apply changes to the view
                        $(".remove").hammer().on("tap", function(e) {
                            e.preventDefault();
                            $(".search").children(".twitter-typeahead").children(".tt-query").val("").triggerAll("change keyup");
                            $(".search").children(".twitter-typeahead").children(".tt-query").typeahead('setQuery', "");
                            $(window).trigger("scroll");
                        });

                        // prevent filter from being applied when clicking a link to an episode
                        $(".ep").hammer().on("tap", "a", function(e) {
                            e.stopPropagation();
                        });

                        $(".toolbar").children("ul").children("li").hammer().on("tap", function() {
                            if ( $(".btn-favorites").children("div").hasClass("active") ) {
                                ctv.generatetoday(ctv.xml.DAY[ctv["current"]], ctv.currentdate);
                                $(".toolbar3").children("li:first-child").addClass("active").siblings("li").removeClass("active");
                            }
                        });

                        // show secondary search toolbar when clicking search button under initial toolbar
                        $(".btn-search").hammer().on("tap", function() {
                            if ( !$(this).children("div").hasClass("active") ) {
                                $(".menu-item").hide();
                                $(".toolbar2").show();
                                $(this).children("div").addClass("active");
                                $(".contents").addClass("down");
                                $(this).siblings("li").children("div").removeClass("active");
                            }
                            else {
                                $(".toolbar2").hide();
                                $(this).children("div").removeClass("active");
                                $(".contents").removeClass("down");
                            }
                        });

                        // show secondary filter toolbar when clicking filter button under initial toolbar
                        $(".btn-filter").hammer().on("tap", function() {
                            if ( !$(this).children("div").hasClass("active") ) {
                                $(".menu-item").hide();
                                $(".toolbar3").show();
                                $(this).children("div").addClass("active");
                                $(this).siblings("li").children("div").removeClass("active");
                                if ( $(".contents").hasClass("down") ) {
                                    $(".contents").removeClass("down");
                                }
                            }
                            else {
                                $(".toolbar3").hide();
                                $(this).children("div").removeClass("active");
                            }
                        });

                        // allow filter buttons to filter content according to user selection
                        $(".toolbar3").children("li").hammer().on("tap", function() {
                            ctv.generatedays($(this).data("days"));
                            $(window).trigger("scroll");
                            $(".search").children(".twitter-typeahead").children(".tt-query").val("").trigger("change");
                            if ( !$(this).hasClass("active") ) {
                                $(this).addClass("active").siblings("li").removeClass("active");
                                $(".toolbar3").hide();
                                $(".btn-filter").children("div").removeClass("active");
                            }
                        });

                        // trigger filter if a typeahead item is selected
                        $(".search").on("typeahead:selected", ".tt-query", function() {
                            $(this).trigger("keyup");
                        });

                        // 
                        $(".btn-favorites").hammer().on("tap", function() {
                            if ( !$(this).children("div").hasClass("active") ) {
                                $(".menu-item").hide();
                                $(this).children("div").addClass("active");
                                $(this).siblings("li").children("div").removeClass("active");
                                if ( $(".contents").hasClass("down") ) {
                                    $(".contents").removeClass("down");
                                }
                                ctv.filter("name", ctv.fav_array);
                                $(window).trigger("scroll");
                            }
                            else {
                                $(this).children("div").removeClass("active");
                            }
                        });

                        // show options dropdown when tapping options button in toolbar
                        $(".btn-options").hammer().on("tap", function() {
                            if ( !$(this).children("div").hasClass("active") ) {
                                $(".menu-item").hide();
                                $(this).children("div").children("ul").show();
                                $(this).children("div").addClass("active");
                                $(this).siblings("li").children("div").removeClass("active");
                                if ( $(".contents").hasClass("down") ) {
                                    $(".contents").removeClass("down");
                                }
                            }
                            else {
                                $(this).children("div").children("ul").hide();
                                $(this).children("div").removeClass("active");
                            }
                        });

                        // show favorites toolbar when clicking edit favorites under options button
                        $(".btn-options").hammer().on("tap", ".menu-item li:first-child", function() {
                            $(".menu-item").hide();
                            $(".toolbar4, .overlay").toggle();
                        });

                        // hide favorites edit window on esc press or overlay click
                        $(".overlay").hammer().on("tap", function() {
                            $(".toolbar4, .overlay").hide();
                        });
                        $(document).keyup(function(e) {
                            if ( e.keyCode === 27 ) {
                                $(".toolbar4, .overlay").hide();
                            }
                        });

                        // watch for changes in the favorite shows array and update favorite shows select 
                        _.observe(ctv.fav_array, function() {
                            ctv.populatefavs(ctv.fav_array);
                            ctv.styleselect(".addfav");
                        });

                        // add typed show name to favorites array on button press
                        $(".favs-add").hammer().on("tap", function() {
                            var addval = $(".addfav").find("input").val();
                            if ( addval.length ) {
                                for ( var i=0; i<ctv.fav_array.length; i++ ) {
                                    if ( ctv.fav_array[i].search(new RegExp(addval, "i")) > -1 ) {
                                        return;
                                    }
                                }
                                ctv.fav_array.push(addval);
                                ctv.fav_array.sort();
                                $.cookie("favscookie", escape(ctv.fav_array.join(",")), { expires: 365, path: "/" });
                                $(".addfav").find("input").val("");
                                $(".addfav").find(".selectbox").children("p").text(addval);
                            }
                        });

                        // remove selected show name from favorites array on button press
                        $(".favs-remove").hammer().on("tap", function() {
                            var remval = $(".addfav").find("select").val();
                            for ( var i=0; i<ctv.fav_array.length; i++ ) {
                                if ( ctv.fav_array[i].search(new RegExp(remval, "i")) > -1 ) {
                                    ctv.fav_array.splice(i,1);
                                }
                            }
                            ctv.fav_array.sort();
                            $.cookie("favscookie", escape(ctv.fav_array.join(",")), { expires: 365, path: "/" });
                        });
                        
                    }
                );
            },

            // functionality to update current date header when scrolling to a different date
            updaterow: function(el) {
                var pos = $(".current"+el).offset();
                var c1 = $(".current"+el).children().text();
                $("."+el).each(function() {
                    var c2 = $(this).children("p").text();
                    if ( $("."+el).length > 1 ) {
                        if ( $(this).is(":last-child") && pos.top+1 >= $(this).offset().top ) {
                            if ( c1 !== c2 ) {
                                $(".current"+el).html("<p>" + $(this).children("p").text() + "</p>");
                                return;
                            }
                        }
                        if (pos.top+1 >= $(this).offset().top && pos.top+1 <= $(this).next().offset().top) {
                            if ( c1 !== c2 ) {
                                $(".current"+el).html("<p>" + $(this).children("p").text() + "</p>");
                                return;
                            }
                        }
                    }
                    else {
                        if (pos.top+1 >= $(this).offset().top) {
                            if ( c1 !== c2 ) {
                                $(".current"+el).html("<p>" + $(this).children("p").text() + "</p>");
                                return;
                            }
                        }
                    }
                });
            },

            // simple filter used to search show names
            filter: function(key, input) {
                el = ctv.xml.DAY;
                var results = [],
                    result;
                if ( !_.isArray(input) ) {
                    var inputt = $.trim(escapeRegExp(input));
                    $(".search").children(".twitter-typeahead").children(".tt-query").trigger("change");
                    if ( input.length ) {
                        for ( var i=0; i < el.length; i++ ) {
                            for ( var j=0; j < el[i]["time"].length; j++ ) {
                                if ( _.isArray(el[i]["time"][j].show) ) {
                                    for ( var k=0; k < el[i]["time"][j].show.length; k++ ) {
                                        var searchkey;
                                        if ( key === "name" ) {
                                            searchkey = el[i]["time"][j].show[k]["attributes"]["name"];
                                        }
                                        else if ( key === "network" ) {
                                            searchkey = el[i]["time"][j].show[k].network;
                                        }
                                        if ( searchkey.search(new RegExp(inputt, "i")) > -1 ) {
                                            result = {};
                                            result.day = el[i]["attributes"]["attr"];
                                            result["time"] = el[i]["time"][j]["attributes"].attr;
                                            result.show = el[i]["time"][j].show[k]["attributes"]["name"];
                                            result.sid = el[i]["time"][j].show[k].sid;
                                            result.network = el[i]["time"][j].show[k].network;
                                            result["title"] = el[i]["time"][j].show[k]["title"];
                                            result.ep = el[i]["time"][j].show[k].ep;
                                            result["link"] = el[i]["time"][j].show[k]["link"];
                                            results.push(result);
                                        }
                                    }
                                }
                                else {
                                    var searchkey;
                                    if ( key === "name" ) {
                                        searchkey = el[i]["time"][j].show["attributes"]["name"];
                                    }
                                    else if ( key === "network" ) {
                                        searchkey = el[i]["time"][j].show.network;
                                    }
                                    if ( searchkey.search(new RegExp(inputt, "i")) > -1 ) {
                                        result = {};
                                        result.day = el[i]["attributes"]["attr"];
                                        result["time"] = el[i]["time"][j]["attributes"].attr;
                                        result.show = el[i]["time"][j].show["attributes"]["name"];
                                        result.sid = el[i]["time"][j].show.sid;
                                        result.network = el[i]["time"][j].show.network;
                                        result["title"] = el[i]["time"][j].show["title"];
                                        result.ep = el[i]["time"][j].show.ep;
                                        result["link"] = el[i]["time"][j].show["link"];
                                        results.push(result);
                                    }
                                }
                            }
                        }

                        ctv.populate(results);
                    }
                    else {
                        // return to today view if nothing is in the search input
                        ctv.generatetoday(ctv.xml.DAY[ctv["current"]], ctv.currentdate);
                    }
                }
                else {
                    for ( var h=0; h<input.length; h++ ) {
                        var inputt = $.trim(escapeRegExp(input[h]));
                        $(".search").children(".twitter-typeahead").children(".tt-query").trigger("change");
                        if ( inputt.length ) {
                            for ( var i=0; i < el.length; i++ ) {
                                for ( var j=0; j < el[i]["time"].length; j++ ) {
                                    if ( _.isArray(el[i]["time"][j].show) ) {
                                        for ( var k=0; k < el[i]["time"][j].show.length; k++ ) {
                                            var searchkey;
                                            if ( key === "name" ) {
                                                searchkey = el[i]["time"][j].show[k]["attributes"]["name"];
                                            }
                                            else if ( key === "network" ) {
                                                searchkey = el[i]["time"][j].show[k].network;
                                            }
                                            if ( searchkey.search(new RegExp(inputt, "i")) > -1 ) {
                                                result = {};
                                                result.day = el[i]["attributes"]["attr"];
                                                result["time"] = el[i]["time"][j]["attributes"].attr;
                                                result.show = el[i]["time"][j].show[k]["attributes"]["name"];
                                                result.sid = el[i]["time"][j].show[k].sid;
                                                result.network = el[i]["time"][j].show[k].network;
                                                result["title"] = el[i]["time"][j].show[k]["title"];
                                                result.ep = el[i]["time"][j].show[k].ep;
                                                result["link"] = el[i]["time"][j].show[k]["link"];
                                                results.push(result);
                                            }
                                        }
                                    }
                                    else {
                                        var searchkey;
                                        if ( key === "name" ) {
                                            searchkey = el[i]["time"][j].show["attributes"]["name"];
                                        }
                                        else if ( key === "network" ) {
                                            searchkey = el[i]["time"][j].show.network;
                                        }
                                        if ( searchkey.search(new RegExp(inputt, "i")) > -1 ) {
                                            result = {};
                                            result.day = el[i]["attributes"]["attr"];
                                            result["time"] = el[i]["time"][j]["attributes"].attr;
                                            result.show = el[i]["time"][j].show["attributes"]["name"];
                                            result.sid = el[i]["time"][j].show.sid;
                                            result.network = el[i]["time"][j].show.network;
                                            result["title"] = el[i]["time"][j].show["title"];
                                            result.ep = el[i]["time"][j].show.ep;
                                            result["link"] = el[i]["time"][j].show["link"];
                                            results.push(result);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    ctv.populate(results);
                }
            },

            // insert object values into view
            populate: function(obj) {
                var day = {},
                    time = {},
                    cresults = {},
                    sresults = {};
                for ( var i=0; i<obj.length; i++ ) {
                    day = cresults[obj[i].day] = cresults[obj[i].day] || {};
                    time = day[obj[i]["time"]] = day[obj[i]["time"]] || {};
                    time[obj[i].show] = {
                        sid: obj[i].sid,
                        network: obj[i].network,
                        title: obj[i]["title"],
                        ep: obj[i].ep,
                        link: obj[i]["link"]
                    };
                }
                var html = "";
                var cdays = _.keys(cresults);
                cdays = ctv.sortdates(cdays, "-");
                var todaystr = ctv.today.getFullYear() + "/" + (ctv.today.getMonth()+1) + "/" + ctv.today.getDate();
                var ctoday = new Date(todaystr);
                if ( cdays.length ) {
                    for ( i=0; i < cdays.length; i++ ) {
                        var ctimes = _.keys(cresults[cdays[i]]);
                        var d = cdays[i];
                        d = d.replace(/-/g, "/");
                        var cdate = new Date(d);
                        if ( cdate >= ctoday ) {
                            html += "<div class='day'><p>" + ctv.days[cdate.getDay()] + ", " + (cdate.getMonth()+1) + "-" + cdate.getDate() + "-" + cdate.getFullYear() + "</p>";
                            for ( var j=0; j<ctimes.length; j++) {
                                var cshows = _.keys(cresults[cdays[i]][ctimes[j]]);
                                html += "<div class='time'><p>" + ctimes[j] + "</p>";
                                for ( var k=0; k<cshows.length; k++ ) {
                                    html += "<div class='show'><p><a href='" + cresults[cdays[i]][ctimes[j]][cshows[k]]["link"] + "'>" + cshows[k] + "</a></p>";
                                        html += "<div class='sid'><p>" + cresults[cdays[i]][ctimes[j]][cshows[k]]["sid"] + "</p></div>";
                                        html += "<div class='network'><p>" + cresults[cdays[i]][ctimes[j]][cshows[k]]["network"] + "</p></div>";
                                        html += "<div class='title'><p>" + cresults[cdays[i]][ctimes[j]][cshows[k]]["title"] + "</p></div>";
                                        html += "<div class='ep'><p><a href='" + cresults[cdays[i]][ctimes[j]][cshows[k]]["link"] + "'>" + cresults[cdays[i]][ctimes[j]][cshows[k]]["ep"] + "</a></p></div>";
                                    html += "</div>";
                                }
                                html += "</div>";
                            }
                            html += "</div>";
                        }
                    }
                    $(".contents").html(html);
                }
                else {
                    $(".contents").html("");
                    $(".currentday").children("p").text("No results.");
                }
            },

            // generate html for the current day's shows and append to contents container
            generatetoday: function(current, currentdate) {
                // begin forming html to insert into view
                var html = "";

                // format and add current date to date header and append to html string
                html += "<div class='day'><p>" + ctv.days[currentdate.getDay()] + ", " + (currentdate.getMonth()+1) + "-" + currentdate.getDate() + "-" + currentdate.getFullYear() + "</p>";

                // append all times and show info for current date to html string if the air time has not yet passed for the current hour
                for ( var i=0; i < current.time.length; i++ ) {
                    var dayhour = +current["time"][i]["attributes"].attr.substr(0, 2);
                    var curhour = ctv.today.getHours();
                    var dayperiod = current["time"][i]["attributes"].attr.substr(6, 2);
                    if ( dayperiod.toLowerCase() === "pm" && dayhour !== 12 ) {
                        dayhour = dayhour + 12;
                    }
                    if ( curhour <= dayhour ) {
                        html += "<div class='time'><p>" + current.time[i]["attributes"].attr + "</p>";
                        if ( _.isArray(current["time"][i].show) ) {
                            for ( var j=0; j < current["time"][i].show.length; j++ ) {
                                html += "<div class='show'><p><a href='" + current["time"][i].show[j]["link"] + "'>" + current["time"][i].show[j]["attributes"]["name"] + "</a></p>";
                                html += "<div class='sid'><p>" + current["time"][i].show[j].sid + "</p></div>";
                                html += "<div class='network'><p>" + current["time"][i].show[j].network + "</p></div>";
                                html += "<div class='title'><p>" + current["time"][i].show[j]["title"] + "</p></div>";
                                html += "<div class='ep'><p><a href='" + current["time"][i].show[j]["link"] + "'>" + current["time"][i].show[j].ep + "</a></p></div>";
                                html += "</div>";
                            }
                        }
                        else {
                            html += "<div class='show'><p><a href='" + current["time"][i].show["link"] + "'>" + current["time"][i].show["attributes"]["name"] + "</a></p>";
                            html += "<div class='sid'><p>" + current["time"][i].show.sid + "</p></div>";
                            html += "<div class='network'><p>" + current["time"][i].show.network + "</p></div>";
                            html += "<div class='title'><p>" + current["time"][i].show["title"] + "</p></div>";
                            html += "<div class='ep'><p><a href='" + current["time"][i].show["link"] + "'>" + current["time"][i].show.ep + "</a></p></div>";
                            html += "</div>";
                        }
                        html += "</div>";
                    }
                }
                html += "</div>";

                // insert html string into view
                $(".contents").html(html);
            },

            // generate html for a specified number of days and append to contents container
            generatedays: function(data) {
                if ( +data === 0 ) {
                    ctv.generatetoday(ctv.xml.DAY[ctv["current"]], ctv.currentdate);
                    return;
                }

                // begin forming html to insert into view
                var html = "",
                    startday,
                    endday;

                if ( data.length ) {
                    data = data.split("-");
                }
                
                if ( data.length === 2 ) {
                    startday = ctv["current"]+parseInt(data[0]);
                    endday = ctv["current"]+parseInt(data[1]);
                }
                else if ( !isNaN(data) ) {
                    startday = ctv["current"]+parseInt(data);
                    endday = startday+1;
                }
                else {
                    return;
                }

                for ( h=startday; h<endday; h++ ) {
                    var current = ctv.xml.DAY[h];
                    var d = current["attributes"]["attr"];
                    d = d.replace(/-/g, "/");
                    var cdate = new Date(d);
                    html += "<div class='day'><p>" + ctv.days[cdate.getDay()] + ", " + (cdate.getMonth()+1) + "-" + cdate.getDate() + "-" + cdate.getFullYear() + "</p>";

                    // append all times and show info for current date to html string if the air time has not yet passed for the current hour
                    for ( var i=0; i < current.time.length; i++ ) {
                        var dayhour = +current["time"][i]["attributes"].attr.substr(0, 2);
                        var curhour = ctv.today.getHours();
                        var dayperiod = current["time"][i]["attributes"].attr.substr(6, 2);
                        if ( dayperiod.toLowerCase() === "pm" && dayhour !== 12 ) {
                            dayhour = dayhour + 12;
                        }
                        if ( curhour <= dayhour ) {
                            html += "<div class='time'><p>" + current.time[i]["attributes"].attr + "</p>";
                            if ( _.isArray(current["time"][i].show) ) {
                                for ( var j=0; j < current["time"][i].show.length; j++ ) {
                                    html += "<div class='show'><p><a href='" + current["time"][i].show[j]["link"] + "'>" + current["time"][i].show[j]["attributes"]["name"] + "</a></p>";
                                    html += "<div class='sid'><p>" + current["time"][i].show[j].sid + "</p></div>";
                                    html += "<div class='network'><p>" + current["time"][i].show[j].network + "</p></div>";
                                    html += "<div class='title'><p>" + current["time"][i].show[j]["title"] + "</p></div>";
                                    html += "<div class='ep'><p><a href='" + current["time"][i].show[j]["link"] + "'>" + current["time"][i].show[j].ep + "</a></p></div>";
                                    html += "</div>";
                                }
                            }
                            else {
                                html += "<div class='show'><p><a href='" + current["time"][i].show["link"] + "'>" + current["time"][i].show["attributes"]["name"] + "</a></p>";
                                html += "<div class='sid'><p>" + current["time"][i].show.sid + "</p></div>";
                                html += "<div class='network'><p>" + current["time"][i].show.network + "</p></div>";
                                html += "<div class='title'><p>" + current["time"][i].show["title"] + "</p></div>";
                                html += "<div class='ep'><p><a href='" + current["time"][i].show["link"] + "'>" + current["time"][i].show.ep + "</a></p></div>";
                                html += "</div>";
                            }
                            html += "</div>";
                        }
                    }
                    html += "</div>";
                }

                // insert html string into view
                $(".contents").html(html);

            },

            // add ability to hide empty result containers
            hideempty: function(selector) {
                $(selector).show();
                $(selector).each(function () {
                    if ( $(this).children("div").is(":hidden") ) {
                        $(this).hide();
                    }
                });
            },

            // add ability to hide columns
            togglecolumn: function(col) {
                if ( !_.isArray(col) ) {
                    $(col).toggle();
                    var viscols = $(".heading").children("div:visible").length;
                    if ( viscols === 3 ) {
                        if ( col === ".sid" ) {
                            $(".network").css("width", "30%");
                            $(".title").css("width", "50%");
                            $(".ep").css("width", "20%");
                        }
                        if ( col === ".network" ) {
                            $(".sid").css("width", "25%");
                            $(".title").css("width", "50%");
                            $(".ep").css("width", "25%");
                        }
                        if ( col === ".title" ) {
                            $(".sid").css("width", "30%");
                            $(".network").css("width", "40%");
                            $(".ep").css("width", "30%");
                        }
                        if ( col === ".ep" ) {
                            $(".sid").css("width", "20%");
                            $(".network").css("width", "30%");
                            $(".title").css("width", "50%");
                        }
                    }
                }
                else {
                    // handle arrays
                }
            },

            // create dates from array of strings and sort
            sortdates: function(dates, separator) {
                var sorteddates = [],
                    datestr =[];
                sorteddates = dates.map(function(val) {
                    val = val.split(separator);
                    var vy = +val[0];
                    var vm = +val[1]-1;
                    var vd = +val[2];
                    return new Date(vy, vm, vd);
                }).sort( function(date1, date2) {
                    if (date1 > date2) return 1;
                    if (date1 < date2) return -1;
                    return 0;
                });
                for ( i=0; i<sorteddates.length; i++ ) {
                    datestr.push(sorteddates[i].getFullYear() + "-" + (sorteddates[i].getMonth()+1) + "-" + sorteddates[i].getDate());
                }
                return datestr;
            },

            styleselect: function(parent) {
                $(parent).hammer().off("tap");
                $(parent).find(".selectbox").children("p").text("");
                var html = "";
                if ( !$(parent).find(".selectbox").length ) {

                    html = "<div class='selectbox'><p></p><div class='arrow icon-chevron-down'></div><ul>";
                    $("select").children().each(function() {
                        html += "<li>" + $(this).text() + "</li>";
                    });
                    html += "</ul></div>";
                    $("select").hide().parent().prepend(html);

                }
                else {
                    $("select").children().each(function() {
                        html += "<li>" + $(this).text() + "</li>";
                    });
                    $("select").hide().siblings(".selectbox").children("ul").html(html);
                }

                $(parent).hammer().on("tap", ".selectbox", function() {
                    $(this).toggleClass("active").children("ul").toggle();
                });
                $(parent).hammer().on("tap", ".selectbox > ul > li", function() {
                    $(parent).find(".selectbox").children("p").text($(this).text());
                    $(parent).find("select").val($(this).text());
                });
            },

            // populate favorites module select box with values from source array
            populatefavs: function(src) {
                if ( _.isArray(src) ) {
                    var html = "";
                    for ( var i=0; i<src.length; i++ ) {
                        html += "<option value='" + src[i] + "'>" + src[i] + "</option>";
                    }
                    $(".addfav").find("select").html(html);
                }
            }

        };

        // call get function when document is loaded
        $(document).ready(function () {
            ctv.init("../feed.json", "../shows.json");
        });

        function escapeRegExp(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

    })( jQuery, window, document );