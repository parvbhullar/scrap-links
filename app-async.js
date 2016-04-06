var http = require("http");
var async = require('async');
var request = require('request');
var file = require("fs");

var baseUrl = "https://www.reddit.com";
var limit = 5;
var firstRun = true;
var urlList = [];

function scrapper(url){
    var self = this;
    self.scrap(url, self.scrapAll);
}

scrapper.prototype.scrap = function(url, next) {
    if(url.indexOf(baseUrl) <= -1){
        console.log(url+" does not contains - "+ baseUrl);
        return;
    }
    var self = this;
    async.waterfall([
        function(url, next){
        var self = this;
        if(limit > 0){
            limit = limit - 1;
            request(url, function(error, response, html){
                if(!error){
                    var urlPattern = new RegExp("(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)([-a-zA-Z0-9:%_\+.~#?&//=]*)", "g");
                    var links = html.match(urlPattern);
                    // console.log(links);
                    if(links !== null){
                        links = links.join("\r\n");
                        self.saveLinks(links, next);
                    } else {
                        console.log("Problem while extracting URL.");
                    }
                } else {
                    console.log("Request failed for url - "+url);
                }
            });
        } else {
            console.log("Exceeds extraction limit. - " + limit);
        }
    }], function(links, next){
        //Bit hackish
        if(firstRun){
            firstRun = false;
            file.writeFile("./urls.csv", links,
                function(error){
                    if(error){
                        console.log("Error while saving file.");
                    } else {
                        next(links);
                    }
                }
            );
        } else {
            file.appendFile("./urls.csv", links,
                function(error){
                    if(error){
                        console.log("Error while saving file.");
                    } else {
                        next(links);
                    }
                }
            );
        }
    });
};

scrapper.prototype.scrapAll = function(links) {
    var self = this;
    limit += 1;
    links = links.split("\r\n");
    async.eachSeries(links, self.scrap, self.scrapAll);
};

scrapper.prototype.stop = function (err) {
    console.log("ISSUE WITH Scrapper \n" + err);
    process.exit(1);
};

new scrapper(baseUrl);