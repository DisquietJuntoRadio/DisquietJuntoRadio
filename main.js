//////////////////////////////////////////////////////////////////
//
// Shuffle player launch point
//
// for single project "?play=disquiet-junto-project-0483"
//
//////////////////////////////////////////////////////////////////

var SCrunning;

// jQuery main()
$(function () {
	SCrunning = null;
	SCrunning = new SCoperator();
	SCrunning.configAPI("V2");


	////////////////////////////////////////////////////////////////
	// SoundCloud operator

	SCrunning.artist = "disquiet";

	var queryString = window.location.search;
	var tracklist = queryString.match(/(?:\?|\&)(?:play)\=([^&]+)/g);
	var urls = [];

	if (tracklist) {
		tracklist.forEach(function (external) {
			external = external.match(/\=.*/g).pop().replace("=", "");
			urls.push("https://soundcloud.com/disquiet/sets/" + external);
			return true;
		});
	}

	if (urls.length > 0) {
		SCrunning.matchPlaylists = urls;
	}

	SCrunning.getClient(function () {
		SCrunning.getArtist(function getItems(artist) {
			if (urls.length == 0) {
				// get all artist 'TRACK' entries:
				SCrunning.rackArtist(SCrunning.rackTracks);
			}
			// get optionally filtered playlists:
			SCrunning.rackCarts(SCrunning.rackTracks);
		});
	});


	////////////////////////////////////////////////////////////////
	// tiles

	var base = document.querySelector('#TrackList'); // the container for the variable content
	var selector = '.sound-tile'; // any css selector for children

	base.addEventListener('click', function (event) {
		// find the closest match of the event target
		var closest = event.target.closest(selector);
		if (closest && base.contains(closest) && SCrunning.isPlayable(closest)) {
			SCrunning.spoolTrack(closest);
		}
	});

	////////////////////////////////////////////////////////////////
	// play bar

	$("audio").on("ended", function () {
		SCrunning.actOnMedia(SCrunning, $(".sound-tile").length);
	});

});