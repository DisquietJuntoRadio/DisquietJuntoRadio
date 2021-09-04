# Disquiet Junto 'Radio'

  - Client Side Endless Shuffle Player
  - demo at --> https://disquietjuntoradio.github.io/DisquietJuntoRadio/
  - can filter by playlists, eg:
      ?play=disquiet-junto-project-0504&play=disquiet-junto-project-0503&play=disquiet-junto-project-0502
   
   An example of js/jQuery/HTML access to Soundcloud API features, for track streaming and metadata display.
   The "DisquietJuntoRadio" combines tracks from the Disquiet Junto to create a random playlist.
   When selecting tracks, it animates creator icons and finds track waveforms.
   While playing, it displays the creator track notes and provides a link to the track's Soundcloud page.
   
   The code is broken roughly into modules, along lines of API vs DOM allegiance - allowing a custom artist/play-list to be       configured with minimal(?) edits:
 - to HTML for titles/icons/externalLinks
 - and to main.js for Soundcloud resources
 
   Styling can be adapted in .css, with attention paid to those .js modules with highest DOM dependence. (main, app, features) Essential API support comes from functions.js, with little implication to .css/DOM.
 
   
 -----------------------------------------------------------------------
 
 Fair Use:
 
 -----------------------------------------------------------------------
 
 Before modifying or using this code, consider the Soundcloud API terms of use:
 https://developers.soundcloud.com/docs/api/terms-of-use 
 
 This repository's code is for experimental / proof-of-principle application only.
 
 It does not scrape pages, metadata or CDN's. It does not 'rip' streams.
 It does not allow or apply user authentication and makes no user actions nor account changes.
 
 All code execution and web interactions occur on the end user's computing resources.
 There is no hosted execution, web interaction or data storage.
 
 The author(s) of this repository's code defer responsibility for its application to end users. 
 
 -----------------------------------------------------------------------
 
 Responsible Activity as an API Client: 
 
 -----------------------------------------------------------------------
 
 As an update to original notes below:

 Previously this code used a client ID from an OSS project.
 Currently to work at all, it is forced to use the V2 API.
 A major drawback is the need for CORS-proxy. Open facing CORS-proxy hosts are prone to burnout, 
 can garble returns, may be rate limited, and may cache results. 
 They are intented only for DEV / TEST and PROOF-OF-CONCEPT!

 Soundcloud claim ambition to re-open the V1 API to new developers...
 That would be great!
 (Otherwise, also great, would be a slightly restrictive built-for-purpose CORS-proxy 
 accepting only requests from github.io bound for Soundcloud APIV2. Anyone?)
 
		// All client id's in the wild have been redacted!
		// see: https://developers.soundcloud.com/blog/security-updates-api
		// so this is broken forever:
		self.client_id = "08f79801a998c381762ec5b15e4914d5";
		// July 1st, 2021 by Rahul Rumalla
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
						// Please note that the use of client_id will be deprecated and deleted
            
 -----------------------------------------------------------------------
 
 The Soundcloud API requires a client ID for access.
 
 The code has been tested with Soundcloud's V.1 API and a client ID from publicly available examples and API discussion.
 (The source of the test ID is documented within the code comments.)
 Function of the code in this repository has no connection to any other activities the client ID may be applied to.
 As such, it is understood the client ID may be revoked or otherwise limited at any time.
 In this event, the end user will need to provision a client ID by their own means.
 Interaction with the V.1 API is made according to documentation guidelines. The API is considered stable.
 
 This code can alternatively use the Soundcloud V.2 API.
 It will apply the default public client ID issued by the API for non-authenticated vistors to the Soundcloud website.
 Documentary guidelines do not preclude use of the V.2 API, but use is discouraged due to non-stable features and V.1 incompatibility.
 Client-side use of V.2 API relies on a CORS-proxy. Correct function may fail with implementation changes, or CORS rejection.
 In this event, the code will require revision, or alternative proxy arrangements.
 
 -----------------------------------------------------------------------
