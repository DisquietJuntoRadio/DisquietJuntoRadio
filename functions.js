//////////////////////////////////////////////////////////////////
//
// Base system for API operations, DOM agnostic
//
//////////////////////////////////////////////////////////////////

function SCoperator() {
	this.configAPI("V2");

	this.artist = "";
	this.client_id = "";
	this.artist_id = "";
	this.artist_data = {};
	this.matchPlaylists = null;

	this.tracks = 0;
	this.carts = 0;

	this.pageSize = 8;
	this.mediaLaunch = true;
	this.mediaDelay = 3000; // set time for delaying media launch
	this.mediaCheck = function (self) { // set limit for delaying media launch
		return (self.tracks > 1);
	};
	this.rolling = false;
};


SCoperator.prototype.configAPI = function (API) {
	this.API = API;

	if (this.API == "V1") {
		this.mainAPI = "https://api.soundcloud.com/";
	} else {
		this.mainAPI = "https://api-v2.soundcloud.com/";
	}

	if (this.API == "V1") {
		this.corsProxy = "";
	} else {
		// NOTE: public facing proxies are OK for dev/test
		// but quickly burn up ... a serious application
		// would offer it's own proxy, soley for V2 API connection

		// this.corsProxy = "https://cors-anywhere.herokuapp.com/";		
		this.corsProxy = "https://api.allorigins.win/raw?url=";
	}

	this.resolver = this.mainAPI + "resolve?url=";
}

SCoperator.prototype.spinURL = function (url) {
	return url = (this.API == "V1") ? url : encodeURIComponent(url);
}

SCoperator.prototype.desiredThings = function () {
	return {
		things: "",
		from: "",
		filter: "",
		paged: true,
		auto_paginate: null,
		thendo: null
	}
}


SCoperator.prototype.getThings = function (requestedThings) {
	var self = this;
	var thingsToGet;

	if (requestedThings.auto_paginate !== null) {
		thingsToGet = requestedThings.auto_paginate;
		console.log(
			"chasing more pages of "
			+ requestedThings.from + " : " + requestedThings.things
			+ " for " + requestedThings.thendo.name
		);
	} else {
		console.log(
			this.getThings.caller.name + " is getting "
			+ requestedThings.things
			+ (requestedThings.from ? " from " + requestedThings.from : "")
			+ (requestedThings.paged ? " with paging" : "")
			+ " for " + requestedThings.thendo.name
		);
		thingsToGet = self.mainAPI;
		if (requestedThings.from !== "") {
			thingsToGet += requestedThings.from + "/";
		}
		thingsToGet += requestedThings.things + "?client_id=" + self.client_id;
		if (requestedThings.paged) {
			thingsToGet += "&linked_partitioning=1&limit=" + self.pageSize;
		}
		if (requestedThings.filter !== "") {
			thingsToGet += "&" + requestedThings.filter;
		} //settings;
	}
	self.thingGetting = $.get(
		self.corsProxy + self.spinURL(thingsToGet), {}
	)
		.done(function (data) {
			requestedThings.thendo(self, data);
			if (requestedThings.paged) {
				if (!("next_href" in data) && (data.collection.length >= self.pageSize)) {
					offset = requestedThings.auto_paginate.match(/\&offset\=[0-9]*/g).pop();
					console.log("Paging is manual from " + offset);
					requestedThings.auto_paginate = requestedThings.auto_paginate.replace(offset, "");
					numeric = parseInt(offset.match(/[0-9]{1,}/g).pop());
					numeric = numeric + self.pageSize;
					requestedThings.auto_paginate += "&offset=" + numeric;

				} else {
					console.log("Ending paging of " + requestedThings.things);
					requestedThings.auto_paginate = null;
				}
				if (("next_href" in data) && data.next_href) {
					console.log("Paging is explicit");
					requestedThings.auto_paginate = self.corsProxy + self.spinURL(data.next_href + "&client_id=" + self.client_id);
				}
				if (requestedThings.auto_paginate) {
					self.getThings(requestedThings);
				}
			}
		})
		.fail(function (jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC " + requestedThings.things + " " + textstatus + " " + errorthrown);
		});
};


SCoperator.prototype.getArtist = function coregetter(actionArtist) {
	var self = this;
	var actionFor = self.artist;
	self.resolve("https://soundcloud.com/" + actionFor, function (self, resolved) {
		self.artist_id = resolved.id;
		self.artist_data = {
			avatar: resolved.avatar_url
		};
		actionArtist(actionFor);
	});
}


SCoperator.prototype.searchExternals = function (artistSite) {
	var self = this;
	var queryString = window.location.search;
	var external = queryString.match(/(?:\?|\&)(?:playlist)\=([^&]+)/g);
	if (external) {
		external = external.pop().match(/\=.*/g).pop().replace("=", "");
		self.matchPlaylists = (self.matchPlaylists == null) ? [] : self.matchPlaylists;
		self.matchPlaylists.push("https://soundcloud.com/" + artistSite + "/sets/" + external);
		return true;
	}
	return false;
}

///////////////////////////
// Will push forward into "sendTo()" all tracks by artist
///////////////////////////
SCoperator.prototype.rackArtist = function sitegetter(sendTo) {
	var self = this;
	var toGet;
	toGet = self.desiredThings();
	toGet.from = "users/" + self.artist_id;
	toGet.things = "tracks";
	toGet.thendo = function artistscart(self, data) {
		sendTo(self, data.collection, self.popTrack);
		self.tryAutoPlay();
	};
	self.carts++;
	SCrunning.getThings(toGet);
}

///////////////////////////
// Will push forward into "sendTo()" all tracks of all playlists by artist, 
// prone to self.matchPlaylists as filter
///////////////////////////
SCoperator.prototype.rackCarts = function cartmaker(sendTo) {
	var self = this;
	var toGet;
	toGet = self.desiredThings();
	toGet.from = "users/" + self.artist_id;
	toGet.things = "playlists";
	toGet.filter = "representation=id";
	toGet.thendo = function listedcart(self, data) {
		var playlists = data.collection;
		for (var i = 0; i < playlists.length; i++) {
			if ((self.matchPlaylists == null) || (self.matchPlaylists.indexOf(playlists[i].permalink_url) > -1)) {
				self.carts++;
				sendTo(self, playlists[i].tracks, self.popTrack);
				self.tryAutoPlay();
			}
		}
	};
	SCrunning.getThings(toGet);
}

///////////////////////////
// Will push forward into "addit()" all meta of tracks, 
// individually from list of track ids in "data"
// via auto paging requests through the id list
///////////////////////////
SCoperator.prototype.rackTracks = function trackracker(self, data, addit) {
	var gotTracks = data;
	var idSet;
	var idCount = 0;
	var toGet;

	if (gotTracks.length == 0) {
		return;
	}

	while (idCount < gotTracks.length) {
		idSet = gotTracks[idCount].id;
		idCount++;
		for (var i = idCount;
			((i < gotTracks.length) && (i - idCount < (self.pageSize - 1))); i++) {
			idSet += "%2C" + gotTracks[i].id;
		}
		idCount = i;
		toGet = self.desiredThings();
		toGet.things = "tracks";
		toGet.filter = "ids=" + idSet;
		toGet.paged = false;
		toGet.thendo = function trackaction(self, data) {
			for (var j = 0; j < data.length; j++) {
				addit(self, data[j]);
			}
		};
		SCrunning.getThings(toGet);
	}
}


SCoperator.prototype.resolve = function (resource, dowith) {
	var self = this;
	var toResolve = self.resolver + resource + "&client_id=" + self.client_id;
	self.resolved = null;

	self.resolving = $.get(
		self.corsProxy + self.spinURL(toResolve), {}
	)
		.done(function (data) {
			dowith(self, data);
		})
		.fail(function (jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC cant resolve " + textstatus + " " + errorthrown);
		});
};


SCoperator.prototype.getClient = function (clientaction) {
	var self = this;
	if (self.API == "V1") {
		// July 1st, 2021 by Rahul Rumalla
		// All client id's in the wild have been redacted!
		// so this is broken forever:
		self.client_id = "08f79801a998c381762ec5b15e4914d5";
		// see: https://developers.soundcloud.com/blog/security-updates-api
			// As part of our continuous effort toward making improvements to our API 
			// with the hope that we can relaunch API access to all developers, 
			// we’re making some critical security improvements.
				// 		Use Client Credentials Grant for Server-Side Integrations
						// Currently, to access the public resources of the platform, server-side integrations 
						// with our API only require a client_id in the URL’s query parameter. 
						// We’ll be strengthening our authorization here by making all public resources on the API 
						// only accessible to apps that have been authorized with the client_credentials grant. 
						// This will enable the app to capture both the access_token and the refresh_token 
						// to then fetch the resources from the API. 
						// Please note that the use of client_id will be deprecated and deleted soon (from July 2021). 
						// Developers should provide the Authentication header for all their requests to the 
						// SoundCloud API going forward.
						// Here’s an example of getting an access token via the client_credentials grant type:
						// curl --request POST \
						// --url https://api.soundcloud.com/oauth2/token \
						// --header 'Content-Type: application/x-www-form-urlencoded' \
						// --data client_id=CLIENT_ID \
						// --data client_secret=CLIENT_SECRET \
						// --data grant_type=client_credentials
		clientaction(self);
	} else {
		// We can get a new/fresh each time, by using API2 per below
		// This sidesteps formal auth. (we are anonymous just like any SoundCloud site visitor is)
		// Except ... now we look like we are coming from the wrong domain!
		// ie: V.2 is 'public' but it needs CORS proxy :(
		self.initialising = $.get(
			//"https://a-v2.sndcdn.com/assets/48-2160c10a-3.js", {}
			// "https://a-v2.sndcdn.com/assets/46-285b9963-3.js", {}
			"https://a-v2.sndcdn.com/assets/2-2b91e95d.js", {}
		)
			.done(function (data) {
				got_id = data.match(new RegExp("web-auth\\?client_id\=(.*)&device_id"))[1];
				got_id = got_id.replace(/"/g, "");
				self.client_id = got_id; //+"app_version=1630571747&app_locale=en";
				console.log("Adopted: " + self.client_id);
				clientaction(self);
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				self.stayAlert("SC client request " + textStatus + " " + errorThrown);
			});
	}
};


SCoperator.prototype.stayAlert = function (why) {
	var self = this;
	console.log(why);
};