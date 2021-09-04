//////////////////////////////////////////////////////////////////
//
// Models for page activity of DOM objects
//
//////////////////////////////////////////////////////////////////


SCoperator.prototype.isPlayable = function (trackElement) {
	if (trackElement == null) {
		return false;
	}
	if ((trackElement.getAttribute('data-value') == "NONE") ||
		(trackElement.getAttribute('data-wave') == "NONE")) {
		return false;
	}
	if (trackElement.getAttribute('data-value') == "undefined") {
		return false;
	}
	return true;
}

SCoperator.prototype.spoolTrack = function (trackElement) {
	var self = this;
	var audio = document.getElementById('audio');
	var source = document.getElementById('audioSource');

	if (self.API == "V1") {
		source.src = trackElement.getAttribute('data-value');
		audio.load();
		self.playTrack(self, trackElement);
	} else {
		self.doTrackFlip(self, trackElement, function (self, trackElement, stream) {
			source.src = stream;
			audio.load();
			self.playTrack(self, trackElement);
		});
	}

}


SCoperator.prototype.playTrack = function (self, trackElement) {
	var audio = document.getElementById('audio');
	audio.play(); //call this to play the song right away

	$("#blurb").html(trackElement.getAttribute('data-blurb'));
	$("#track-link").attr("href", trackElement.getAttribute('data-page'));
	$("#link-button").css("display", "block");

	if (self.API == "V1") {
		self.lightWave(trackElement.getAttribute('data-wave'));
	} else {
		self.doWaveFlip(self, self.corsProxy + trackElement.getAttribute('data-wave') + "?client_id=" + self.client_id, self.lightWave);
	}

	self.lightTrack(trackElement);

}


SCoperator.prototype.actOnMedia = function (self, chooseFrom) {
	livePlayer = $("#audio");
	if (livePlayer
		//&& (livePlayer.prop("readyState") > 0) 
		&&
		(livePlayer.prop("currentSrc") || (livePlayer.prop("readyState") > 0) || self.rolling == true) &&
		!livePlayer.prop("ended")) {
		return false;
	}

	var chosen = Math.floor(Math.random() * chooseFrom);
	var chosentile = $(".sound-tile:eq(" + chosen + ")");
	self.rolling = false;
	if (chosentile.position() == null) {
		return false;
	}

	if (self.isPlayable(chosentile[0])) {
		self.spoolTrack(chosentile[0]);
		$("#TrackList").animate({
			scrollTop: $("#TrackList").scrollTop() + chosentile.position().top - ($("#TrackList").height() / 2) - (chosentile.height() * 3.5)
		}, 4000);
		self.rolling = true;
		return true;
	} else {
		setTimeout(function () {
			var flipBack;
			if (chooseFrom > self.pageSize) {
				flipBack = (chooseFrom / 2);
			} else {
				flipBack = self.pageSize;
			}
			self.actOnMedia(self, flipBack);
		}, self.mediaDelay);
	}
}