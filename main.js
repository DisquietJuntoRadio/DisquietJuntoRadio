

var SCrunning;

$(function(){
	SCrunning=null;
    SCrunning = new SCoperator();
	SCrunning.getClient();
	
			SCrunning.artist = "disquiet";
			SCrunning.resolveArtistTracks(SCrunning.rackTracks); 

				
		var base = document.querySelector('#TrackList'); // the container for the variable content
		var selector = '.sound-tile'; // any css selector for children

		base.addEventListener('click', function(event) {
		  // find the closest parent of the event target that
		  // matches the selector
		  var closest = event.target.closest(selector);
		  if (closest && base.contains(closest)) {
			SCrunning.playTrack(closest);
		  }
				});	

		$("audio").on("ended", function() { SCrunning.actOnMedia(SCrunning); } );				
		
		});
		
		
function SCoperator() {
	this.artist = "";
	this.client_id = "";
	this.artist_id = "";
	this.artist_data = {};
	this.gotTracks = null;
	
	this.mediaCheck = function(self) { return (self.carts > 0); };
	
	this.tracks = 0;
	this.carts = 0;
	this.litTile = null;
	
	this.mainAPI = "https://api.soundcloud.com/"; //"https://api-v2.soundcloud.com/";
	this.resolver = this.mainAPI + "resolve?url=https://soundcloud.com/"; 
	this.lastResolved = null;
	this.corsProxy = ""; //"https://cors-anywhere.herokuapp.com/";
	this.auto_paginate = null;
	};


SCoperator.prototype.resolveArtistTracks = function(thendo) {
			SCrunning.resolve(SCrunning.artist, function(self, resolved){ 
				self.artist_id = resolved.id;
				self.artist_data = {
					avatar: resolved.avatar_url
				};
				SCrunning.getThings("tracks", thendo);	
				self.carts++;
						$("#carts").text(self.carts);			
				SCrunning.getThings("playlists", function(self, data) {					
					for (var i = 0; i < data.length; i++) {
					self.carts++;
						$("#carts").text(self.carts);
						self.rackTracks(self, data[i].tracks);
						}
						});
				});
};



SCoperator.prototype.playTrack = function(trackElement) {
		if(trackElement == null) { return; }
		  var audio = document.getElementById('audio');
		  var source = document.getElementById('audioSource');
		  source.src = trackElement.getAttribute('data-value');
		  audio.load();  
		  audio.play(); //call this to play the song right away
		  var waver = document.getElementById('waver');
		  waver.src = trackElement.getAttribute('data-wave');
		  $("#blurb").html(trackElement.getAttribute('data-blurb'));
		  $("#track-link").attr("href", trackElement.getAttribute('data-page'));
		  $("#link-button").css("display","block");
		  waver.style.display = "block";
		  this.lightTrack(trackElement);
		  }

SCoperator.prototype.lightTrack = function(trackElement) {
	var self = this;
	var lightUp = $(trackElement);
	if (self.litTile) { self.litTile.css("border","3px solid white"); }
	lightUp.css("border","5px solid red");
	self.litTile = lightUp;
	return;
}

SCoperator.prototype.actOnMedia = function(self) {
	livePlayer = $("#audio");	
	if ( livePlayer && (livePlayer.prop("readyState") > 0) && !livePlayer.prop("ended") ) { return true; }
	
	var chooseFrom = $(".sound-tile").length;
	var chosen = Math.floor(Math.random() * chooseFrom);
	var chosentile = $(".sound-tile:eq("+chosen+")");
	if (chosentile.position() == null) { return true; }
	self.playTrack(chosentile[0]);	
	$("#TrackList").animate({
        scrollTop: $("#TrackList").scrollTop() + chosentile.position().top - ($("#TrackList").height() / 2 ) - (chosentile.height() * 3.5 )
    }, 4000);
	
	return true;
	}

SCoperator.prototype.getThings = function(things, dowith) {
	var self = this;
	var thingsToGet;
	if ( self.mediaCheck(self) ) { if(!self.actOnMedia(self)) { return; } }
	if (self.auto_paginate !== null) {
		thingsToGet = self.auto_paginate;
			} else {
			thingsToGet = self.mainAPI + "users/" + self.artist_id + "/" + things + "?client_id=" + self.client_id + "&linked_partitioning=1";
			}	
	self.thingGetting = $.get(
		self.corsProxy + thingsToGet,{}
		)
		.done(function(data) {
			dowith(self, data.collection);
			if("next_href" in data) {
				self.auto_paginate = data.next_href;
				self.getThings(things, dowith);
					}
				self.auto_paginate = null;
			})
		.fail(function(jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC " + things + " " + textstatus + " " + errorthrown);
			});	
};


SCoperator.prototype.rackTracks = function(self, data) {
			self.gotTracks = data;
				//console.log(self.gotTracks);
				for (var i = 0; i < self.gotTracks.length; i++) {
				if (self.gotTracks[i].streamable) {
				self.tracks++;
				$("#tracks").text(self.tracks);
				var node = document.createElement("DIV");
					node.classList.add("sound-tile");
					node.id = "tile" + self.tracks;
					if (self.gotTracks[i].artwork_url !== null) {
						node.style.backgroundImage = "url(" + self.gotTracks[i].artwork_url + ")";
						} else {
						if (self.gotTracks[i].user.avatar_url !== null ) { 
						node.style.backgroundImage = "url(" + self.gotTracks[i].user.avatar_url + ")";
						} else {
						node.style.backgroundImage = "url(" + self.artist_data.avatar + ")";
						}
						}
					node.dataset.value = self.gotTracks[i].stream_url	+ "?client_id=" + self.client_id;
					node.dataset.wave = self.gotTracks[i].waveform_url;
					var trackblurb = "<b>"+self.gotTracks[i].user.username.toUpperCase()+"</b>" + "<BR>" + self.gotTracks[i].title;
					node.dataset.blurb = trackblurb + "<br>" + self.gotTracks[i].description;
					node.dataset.page = self.gotTracks[i].permalink_url;
				var popnode = document.createElement("SPAN");
					popnode.classList.add("poptext");
					popnode.innerHTML = trackblurb;
					node.appendChild(popnode);
				  document.getElementById("TrackList").appendChild(node);
					} 
					}
}


SCoperator.prototype.resolve = function(resource, dowith) {
    var self = this;
	var toResolve = self.resolver + resource + "&client_id=" + self.client_id;
	self.resolved = null;

	self.resolving = $.get(
		self.corsProxy + toResolve,{}
		)
		.done(function(data) {
			self.lastResolved = data;
			dowith(self, data);
			})
		.fail(function(jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC cant resolve " + textstatus + " " + errorthrown);
			});		 
};


SCoperator.prototype.getClient = function() {
    var self = this;
	// V.1 von https://jsbin.com/fixabomefe/edit?html,console
	// The client ID used there is used in the test environment for an OSS Soundcloud library
	// It is ugly, but these keys are all over the world?
	// We could get a new/fresh each time, but then need to use API2 and deal with CORS, per below
		   self.client_id =  "08f79801a998c381762ec5b15e4914d5";
		   return;
	/*
	// V.2 is 'public' but it needs CORS proxy :(
    self.initialising = $.get(
		"https://a-v2.sndcdn.com/assets/48-2160c10a-3.js",{}
		)
		.done(function(data) {
			got_id = data.match(new RegExp("client_id:" + "(.*)" + ",env"))[1];
			got_id = got_id.replace(/"/g,"");
		   self.client_id =  got_id;
			})
		.fail(function(jqXHR, textStatus, errorThrown) {
			self.stayAlert("SC client request " + textStatus + " " + errorThrown);
			});
			*/
		   
};


SCoperator.prototype.stayAlert = function(why) {
    var self = this;
	alert(why);
};
