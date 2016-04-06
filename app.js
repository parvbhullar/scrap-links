var http = require("http");
// var cheerio = require('cheerio');
var request = require('request');
var file = require("fs");

var baseUrl = "https://www.reddit.com";
var limit = 5;
var firstRun = true;
var urlList = [];


var scrap = function(url, next) {
    // if(limit > 0){
        limit = limit - 1;
        request(url, function(error, response, html){
            if(!error){
                var urlPattern = new RegExp("(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)([-a-zA-Z0-9:%_\+.~#?&//=]*)", "g");
                var links = html.match(urlPattern);
                // console.log(links);
                if(links !== null){
                    links = links.join("\r\n");
                    saveLinks(links, next);
                } else {
                    console.log("Problem while extracting URL.");
                }
            } else {
                console.log("Request failed for url - "+url);
            }
        });
    // } else {
    //     console.log("Exceeds extraction limit. - " + limit);
    // }
};

var saveLinks = function(links, next){
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
};

var scrapAll = function(links) {
    limit += 1;
    links = links.split("\r\n");
    links.forEach(function(element, i) {
        // if(urlList.indexOf(element) == 0){
            if(element.indexOf(baseUrl) > -1){
                // urlList.push(element);
                scrap(element, scrapAll);
            } else {
                console.log(element+" does not contains - "+ baseUrl);
            }
        // } else {
        //     console.log("Url already scrapped - "+ urlList);
        // }
    }, this);
};

scrap(baseUrl, scrapAll);