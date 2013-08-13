
/*
 * GET home page.
 */

var sites = require("../sites");
var winston = require("winston");
var util = require("util");

var siteLogger = new winston.Logger({
	transports: [
		new winston.transports.File({filename: "shortcuts.log", json: false})
	]
});

function showSite(siteID, req, res){
	var site = sites.sitesByID[siteID];
	if(site){
		var url = site.url;
		siteLogger.info(siteID + " " + site.shortcuts[0] + " " + (req.headers["x-real-ip"] || req.connection.remoteAddress));
		res.redirect(url);
		return true;
	}else{
		siteLogger.warn("no site: " + siteID);
		return false;
	}
}

function showHorse(siteID, req, res){
	var site = sites.sitesByID[siteID];
	if(site){
		console.log(site.horse);
		var twitterHandle = site.horse;
		siteLogger.info(siteID + " " + site.shortcuts[0] + " " + (req.headers["x-real-ip"] || req.connection.remoteAddress));
		res.redirect("http://twitter.com/"+ twitterHandle);
		return true;
	}else{
		siteLogger.warn("no horse defined: " + siteID);
		return false;
	}
}

exports.setup = function(app) {
	app.get("/sites.json", function(req, res){
		res.contentType("application/json");
		res.send(sites.sitesJSON);
	});

	app.get("/", function(req, res){
		var host = req.headers.host;
		var hostMatches = host.match(/(.*)\.devcenter.(dev|me)/);
		if(hostMatches && hostMatches.length > 1){
			var siteID = hostMatches[1].toLowerCase();
			if(showSite(siteID, req, res)){
				return;
			}		
		}

		res.render('index', { title: 'Dev Centers', sites: sites.sitesList });
	});

	app.get("/:site_id", function(req, res){
		var siteID = req.params.site_id.toLowerCase();
		if(!showSite(siteID, req, res)){
			res.redirect('/');
		}
	});
	app.get("/:site_id/horse", function(req, res){
		var siteID = req.params.site_id.toLowerCase();
		if(!showHorse(siteID, req, res)){
			res.redirect('/');
		}
	});
};
