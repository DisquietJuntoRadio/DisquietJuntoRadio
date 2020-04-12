var SCrunning;

$(function ()
{
   SCrunning = null;
   SCrunning = new SCoperator();
   SCrunning.configAPI("V1");

   var base = document.querySelector('#TrackList'); // the container for the variable content
   var selector = '.sound-tile'; // any css selector for children

   base.addEventListener('click', function (event)
   {
      // find the closest parent of the event target that
      // matches the selector
      var closest = event.target.closest(selector);
      if (closest && base.contains(closest))
      {
         SCrunning.playTrack(closest);
      }
   });

   $("audio").on("ended", function ()
   {
      SCrunning.actOnMedia(SCrunning);
   });

   SCrunning.getClient(function (self)
   {
      self.artist = "disquiet";
      self.resolveArtistTracks(self.rackTracks);
   });

});


function SCoperator()
{

   this.configAPI("V1");
   this.noDebug = true; // if false, run limited case for debugging, otherwise run wide open
   this.mediaCheck = function (self)
   { // set limit for debugging case
      return (self.carts > 4);
   };

   this.artist = "";
   this.client_id = "";
   this.artist_id = "";
   this.artist_data = {};
   this.gotTracks = null;

   this.tracks = 0;
   this.carts = 0;
   this.litTile = null;

   this.auto_paginate = null;
};

SCoperator.prototype.configAPI = function (API)
{
   this.API = API;

   if (this.API == "V1")
   {
      this.mainAPI = "https://api.soundcloud.com/";
   }
   else
   {
      this.mainAPI = "https://api-v2.soundcloud.com/";
   }

   if (this.API == "V1")
   {
      this.corsProxy = "";
   }
   else
   {
      this.corsProxy = "https://cors-anywhere.herokuapp.com/";
   }

   this.resolver = this.mainAPI + "resolve?url=";
}


SCoperator.prototype.resolveArtistTracks = function (thendo)
{
   SCrunning.resolve("https://soundcloud.com/" + SCrunning.artist, function (self, resolved)
   {
      self.artist_id = resolved.id;
      self.artist_data = {
         avatar: resolved.avatar_url
      };
      SCrunning.getThings("tracks", thendo);
      self.carts++;
      $("#carts").text(self.carts);
      SCrunning.getThings("playlists", function (self, data)
      {
         for (var i = 0; i < data.length; i++)
         {
            self.carts++;
            $("#carts").text(self.carts);
            self.rackTracks(self, data[i].tracks);
         }
      });
   });
};


SCoperator.prototype.playTrack = function (trackElement)
{
   var self = this;

   if (trackElement == null)
   {
      return;
   }
   if (trackElement.getAttribute('data-value') == "NONE")
   {
      return;
   }

   var sourceURL = trackElement.getAttribute('data-value');
   if (sourceURL == "undefined")
   {
      return;
   }

   var audio = document.getElementById('audio');
   var source = document.getElementById('audioSource');
   source.src = sourceURL;
   audio.load();
   audio.play(); //call this to play the song right away

   $("#blurb").html(trackElement.getAttribute('data-blurb'));
   $("#track-link").attr("href", trackElement.getAttribute('data-page'));
   $("#link-button").css("display", "block");

   if (self.API == "V1")
   {
      self.lightWave(trackElement.getAttribute('data-wave'));
   }
   else
   {
      self.doWaveFlip(self, self.corsProxy + trackElement.getAttribute('data-wave') + "?client_id=" + self.client_id, self.lightWave);
   }

   self.lightTrack(trackElement);

}


SCoperator.prototype.lightWave = function (waveImage)
{
   var self = this;

   var waver = document.getElementById('waver');
   waver.src = waveImage;
   if (waver.getAttribute('src'))
   {
      waver.style.display = "block";
   }
   else
   {
      waver.style.display = "none";
   }

}

SCoperator.prototype.lightTrack = function (trackElement)
{
   var self = this;
   var lightUp = $(trackElement);
   // better to do this with CSS, so px aren't hard coded, and can @media resize?
   if (self.litTile)
   {
      self.litTile.css("border", "3px solid white");
   }
   lightUp.css("border", "5px solid red");
   self.litTile = lightUp;
   return;
}

SCoperator.prototype.actOnMedia = function (self)
{
   livePlayer = $("#audio");
   if (livePlayer
      //&& (livePlayer.prop("readyState") > 0) 
      &&
      (livePlayer.prop("currentSrc") || (livePlayer.prop("readyState") > 0)) &&
      !livePlayer.prop("ended"))
   {
      return self.noDebug;
   }

   var chooseFrom = $(".sound-tile").length;
   var chosen = Math.floor(Math.random() * chooseFrom);
   var chosentile = $(".sound-tile:eq(" + chosen + ")");
   if (chosentile.position() == null)
   {
      return self.noDebug;
   }

   self.playTrack(chosentile[0]);
   $("#TrackList").animate(
   {
      scrollTop: $("#TrackList").scrollTop() + chosentile.position().top - ($("#TrackList").height() / 2) - (chosentile.height() * 3.5)
   }, 4000);

   return self.noDebug;
}

SCoperator.prototype.getThings = function (things, dowith)
{
   var self = this;
   var thingsToGet;
   if (self.mediaCheck(self))
   {
      if (!self.actOnMedia(self))
      {
         return;
      }
   }
   if (self.auto_paginate !== null)
   {
      thingsToGet = self.auto_paginate;
   }
   else
   {
      thingsToGet = self.mainAPI + "users/" + self.artist_id + "/" + things + "?client_id=" + self.client_id + "&linked_partitioning=1&limit=5";
   }
   self.thingGetting = $.get(
         self.corsProxy + thingsToGet,
         {}
      )
      .done(function (data)
      {
         dowith(self, data.collection);
         if ("next_href" in data)
         {
            self.auto_paginate = data.next_href + "&client_id=" + self.client_id;
            self.getThings(things, dowith);
         }
         self.auto_paginate = null;
      })
      .fail(function (jqxhr, textstatus, errorthrown)
      {
         self.stayAlert("SC " + things + " " + textstatus + " " + errorthrown);
      });
};


SCoperator.prototype.rackTracks = function (self, data)
{
   self.gotTracks = data;
   //console.log(self.gotTracks);
   for (var i = 0; i < self.gotTracks.length; i++)
   {
      if (self.gotTracks[i].streamable)
      {
         self.tracks++;
         $("#tracks").text(self.tracks);
         var node = document.createElement("DIV");
         node.classList.add("sound-tile");
         node.id = "tile" + self.tracks;
         node.dataset.value = "NONE";
         node.dataset.wave = "NONE";
         if (self.gotTracks[i].artwork_url !== null)
         {
            node.style.backgroundImage = "url(" + self.gotTracks[i].artwork_url + ")";
         }
         else
         {
            if (self.gotTracks[i].user.avatar_url !== null)
            {
               node.style.backgroundImage = "url(" + self.gotTracks[i].user.avatar_url + ")";
            }
            else
            {
               node.style.backgroundImage = "url(" + self.artist_data.avatar + ")";
            }
         }
         node.dataset.page = self.gotTracks[i].permalink_url;
         if (self.API == "V1")
         {
            node.dataset.value = self.gotTracks[i].stream_url + "?client_id=" + self.client_id;
            node.dataset.wave = self.gotTracks[i].waveform_url;
         }
         else
         {
            node.dataset.value = self.doTrackFlip(self, self.corsProxy + self.gotTracks[i].media.transcodings[1].url + "?client_id=" + self.client_id, node);
            node.dataset.wave = self.gotTracks[i].waveform_url;
         }
         var trackblurb = "<b>" + self.gotTracks[i].user.username.toUpperCase() + "</b>" + "<BR>" + self.gotTracks[i].title;
         node.dataset.blurb = trackblurb + "<br>" + self.gotTracks[i].description;
         var popnode = document.createElement("SPAN");
         popnode.classList.add("poptext");
         popnode.innerHTML = trackblurb;
         node.appendChild(popnode);
         document.getElementById("TrackList").appendChild(node);
      }
   }
}


SCoperator.prototype.doTrackFlip = function (self, flipFrom, flipTo)
{
   self.flipping = $.get(flipFrom)
      .done(function (data)
      {
         $(flipTo)[0].dataset.value = data.url;
      })
      .fail(function (jqxhr, textstatus, errorthrown)
      {
         self.stayAlert("SC media " + textstatus + " " + errorthrown);
      });
}


SCoperator.prototype.doWaveFlip = function (self, flipFrom, flipTo)
{
   self.flipping = $.get(flipFrom)
      .done(function (data)
      {
         var builtSVG = self.makeWaveSVG(data.width, data.height, data.samples);
         flipTo(builtSVG);
      })
      .fail(function (jqxhr, textstatus, errorthrown)
      {
         self.stayAlert("SC media " + textstatus + " " + errorthrown);
      });
}


SCoperator.prototype.makeWaveSVG = function (xrange, yrange, samples)
{
   var svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");

   // set width and height
   svg1.setAttribute("width", xrange);
   svg1.setAttribute("height", yrange + 8);
   svg1.setAttribute("class", "chart");
   svg1.setAttribute("role", "img");

   var mid = (yrange + 8) / 2;
   var grStyle = "stroke:rgb(19, 84, 54);stroke-width:0.3";
   var dtStyle = "stroke:rgb(255, 203, 61);stroke-width:2";

   for (var x = 0; x < xrange; x++)
   {

      var gry = (samples[x] / 2);
      var dty = gry / 2.5;

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


SCoperator.prototype.resolve = function (resource, dowith)
{
   var self = this;
   var toResolve = self.resolver + resource + "&client_id=" + self.client_id;
   self.resolved = null;

   self.resolving = $.get(
         self.corsProxy + toResolve,
         {}
      )
      .done(function (data)
      {
         dowith(self, data);
      })
      .fail(function (jqxhr, textstatus, errorthrown)
      {
         self.stayAlert("SC cant resolve " + textstatus + " " + errorthrown);
      });
};


SCoperator.prototype.getClient = function (clientaction)
{
   var self = this;
   if (self.API == "V1")
   {
      // V.1 von https://jsbin.com/fixabomefe/edit?html,console
      // The client ID used there is used in the test environment for an OSS Soundcloud library
      // It is ugly.
      self.client_id = "08f79801a998c381762ec5b15e4914d5";
      clientaction(self);
   }
   else
   {
      // We could get a new/fresh each time, but then need to use API2 per below
      // V.2 is 'public' but it needs CORS proxy :(
      self.initialising = $.get(
            "https://a-v2.sndcdn.com/assets/48-2160c10a-3.js",
            {}
         )
         .done(function (data)
         {
            got_id = data.match(new RegExp("client_application_id:.....,client_id:(.*),env:"))[1];
            got_id = got_id.replace(/"/g, "");
            self.client_id = got_id;
            clientaction(self);
         })
         .fail(function (jqXHR, textStatus, errorThrown)
         {
            self.stayAlert("SC client request " + textStatus + " " + errorThrown);
         });
   }
};


SCoperator.prototype.stayAlert = function (why)
{
   var self = this;
   alert(why);
};