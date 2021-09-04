//////////////////////////////////////////////////////////////////
//
// Brokers for I/O between API operations & DOM objects
//
//////////////////////////////////////////////////////////////////


SCoperator.prototype.tryAutoPlay = function () {
	var self = this;
	if (self.mediaLaunch) {
		setTimeout(function () {
			if (self.mediaCheck(self)) {
				self.actOnMedia(self, $(".sound-tile").length);
			}
		}, self.mediaDelay);
	}
}

SCoperator.prototype.popTrack = function (self, pop) {
	if (pop.streamable) {
		self.tracks++;
		$("#tracks").text(self.tracks);
		$("#carts").text(self.carts);
		var node = document.createElement("DIV");
		node.classList.add("sound-tile");
		node.id = "tile" + self.tracks;
		node.dataset.value = "NONE";
		node.dataset.wave = "NONE";

		node.dataset.page = pop.permalink_url;
		if (self.API == "V1") {
			node.dataset.value = pop.stream_url + "?client_id=" + self.client_id;
			node.dataset.wave = pop.waveform_url;
		} else {
			node.dataset.value = pop.media.transcodings[1].url;
			node.dataset.wave = pop.waveform_url;
		}

		if (pop.artwork_url !== null) {
			node.style.backgroundImage = "url(" + pop.artwork_url + ")";
		} else {
			if (pop.user.avatar_url !== null) {
				node.style.backgroundImage = "url(" + pop.user.avatar_url + ")";
			} else {
				node.style.backgroundImage = "url(" + self.artist_data.avatar + ")";
			}
		}

		var trackblurb = "<b>" + pop.user.username.toUpperCase() + "</b>" + "<BR>" + pop.title;
		node.dataset.blurb = trackblurb + "<br>" + pop.description;
		var popnode = document.createElement("SPAN");
		popnode.classList.add("poptext");
		popnode.innerHTML = trackblurb;
		node.appendChild(popnode);
		document.getElementById("TrackList").appendChild(node);
	}
}


SCoperator.prototype.doTrackFlip = function (self, flipFrom, proceed) {
	var trackTarget = self.corsProxy + flipFrom.getAttribute('data-value') + "?client_id=" + self.client_id;
	self.flipping = $.get(trackTarget)
		.done(function (data) {
			proceed(self, flipFrom, data.url);
		})
		.fail(function (jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC media " + textstatus + " " + errorthrown);
		});
}


SCoperator.prototype.doWaveFlip = function (self, flipFrom, flipTo) {
	self.flipping = $.get(flipFrom)
		.done(function (data) {
			var builtSVG = self.makeWaveSVG(data.width, data.height, data.samples);
			flipTo(builtSVG);
		})
		.fail(function (jqxhr, textstatus, errorthrown) {
			self.stayAlert("SC media " + textstatus + " " + errorthrown);
		});
}


SCoperator.prototype.lightWave = function (waveImage) {
	var self = this;

	var waver = document.getElementById('waver');
	waver.src = waveImage;
	if (waver.getAttribute('src')) {
		waver.style.display = "block";
	} else {
		waver.style.display = "none";
	}

}


SCoperator.prototype.lit_tile = null;
SCoperator.prototype.lightTrack = function (trackElement) {
	var self = this;
	var lightUp = $(trackElement);
	// better to do this with CSS, so px aren't hard coded, and can @media resize?
	if (self.lit_tile) {
		self.lit_tile.css("border", "3px solid white");
	}
	lightUp.css("border", "5px solid red");
	self.lit_tile = lightUp;
	return;
}


SCoperator.prototype.makeWaveSVG = function (xrange, yrange, samples) {
	var svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	// set width and height
	svg1.setAttribute("width", xrange);
	svg1.setAttribute("height", yrange + 8);
	svg1.setAttribute("class", "chart");
	svg1.setAttribute("role", "img");

	var mid = (yrange + 8) / 2;
	var grStyle = "stroke:rgb(19, 84, 54);stroke-width:0.3";
	var dtStyle = "stroke:rgb(255, 203, 61);stroke-width:2";

	for (var x = 0; x < xrange; x++) {

		var gry = (samples[x] / 2);
		var dty = 0.5 + (gry / 2.5);

		var gr = document.createElementNS("http://www.w3.org/2000/svg", "line");
		gr.setAttribute("x1", x);
		gr.setAttribute("y1", mid - gry);
		gr.setAttribute("x2", x);
		gr.setAttribute("y2", mid + gry);
		gr.setAttribute("style", grStyle);
		// attach it to the container
		svg1.appendChild(gr);
		var d1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
		d1.setAttribute("x1", x);
		d1.setAttribute("y1", mid + gry + dty);
		d1.setAttribute("x2", x);
		d1.setAttribute("y2", mid + gry);
		d1.setAttribute("style", dtStyle);
		// attach it to the container
		svg1.appendChild(d1);
		var d2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
		d2.setAttribute("x1", x);
		d2.setAttribute("y1", mid - gry - dty);
		d2.setAttribute("x2", x);
		d2.setAttribute("y2", mid - gry);
		d2.setAttribute("style", dtStyle);
		// attach it to the container
		svg1.appendChild(d2);
	}

	var xml = (new XMLSerializer).serializeToString(svg1);
	var stringified = "data:image/svg+xml;charset=utf-8," + xml;
	//alert(stringified);
	return stringified;
}