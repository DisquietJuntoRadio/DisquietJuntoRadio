//////////////////////////////////////////////////////////////////
//
// Shuffle player launch point
//
//////////////////////////////////////////////////////////////////

var SCrunning;

// jQuery main()
$(function () {
	SCrunning = null;
	SCrunning = new SCoperator();
	SCrunning.configAPI("V1");


	////////////////////////////////////////////////////////////////
	// SoundCloud operator

	SCrunning.artist = "disquiet";

	SCrunning.getClient(function () {
		SCrunning.getArtist(function getItems(artist) {
			// get all artist 'TRACK' entries:
			SCrunning.rackArtist(SCrunning.rackTracks);
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