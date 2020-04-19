//////////////////////////////////////////////////////////////////
//
// Base system for API operations, DOM agnostic
//
//////////////////////////////////////////////////////////////////

function SCoperator() {
	this.configAPI("V1");

	this.artist = "";
	this.client_id = "";
	this.artist_id = "";
	this.artist_data = {};
	this.matchPlaylists = null;

	this.tracks = 0;
	this.carts = 0;

	this.pageSize = 45;
	this.mediaDelay = 3000; // set time for delaying media launch
	this.mediaCheck = function (self) { // set limit for delaying media launch
		return (self.tracks > 1);
	};
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
		this.corsProxy = "https://cors-anywhere.herokuapp.com/";
	}

	this.resolver = this.mainAPI + "resolve?url=";
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
	} else {
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
			self.corsProxy + thingsToGet, {}
		)
		.done(function (data) {
			requestedThings.thendo(self, data);
			if (("next_href" in data) && data.next_href && requestedThings.paged) {
				requestedThings.auto_paginate = self.corsProxy + data.next_href + "&client_id=" + self.client_id;
				self.getThings(requestedThings);
			}
			requestedThings.auto_paginate = null;
		})
		.fail(function (jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC " + requestedThings.things + " " + textstatus + " " + errorthrown);
		});
};


SCoperator.prototype.rackArtist = function (sendTo) {
	var self = this;
	var toGet;
	toGet = self.desiredThings();
	toGet.from = "users/" + self.artist_id;
	toGet.things = "tracks";
	toGet.thendo = function (self, data) {
		self.carts++;
		sendTo(self, data.collection, self.popTrack);
		self.tryAutoPlay();
	};
	SCrunning.getThings(toGet);
}

SCoperator.prototype.rackCarts = function (sendTo) {
	var self = this;
	var toGet;
	toGet = self.desiredThings();
	toGet.from = "users/" + self.artist_id;
	toGet.things = "playlists";
	toGet.filter = "representation=id";
	toGet.thendo = function (self, data) {
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

SCoperator.prototype.rackTracks = function (self, data, addit) {
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
		toGet.thendo = function (self, data) {
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
			self.corsProxy + toResolve, {}
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
		// V.1 von https://jsbin.com/fixabomefe/edit?html,console
		// The client ID used there is used in the test environment for an OSS Soundcloud library
		// It is ugly.
		self.client_id = "08f79801a998c381762ec5b15e4914d5";
		clientaction(self);
	} else {
		// We could get a new/fresh each time, but then need to use API2 per below
		// V.2 is 'public' but it needs CORS proxy :(
		self.initialising = $.get(
				"https://a-v2.sndcdn.com/assets/48-2160c10a-3.js", {}
			)
			.done(function (data) {
				got_id = data.match(new RegExp("client_application_id:.....,client_id:(.*),env:"))[1];
				got_id = got_id.replace(/"/g, "");
				self.client_id = got_id;
				clientaction();
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