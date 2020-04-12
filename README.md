# DisquietRadio

  - Client Side Endless Shuffle Player
  - demo at --> https://disquietjuntoradio.github.io/DisquietJuntoRadio/
   
   An example of js/jQuery/HTML access to Soundcloud API features for track streaming and metadata display.
   The "DisquietRadio" combines tracks from the Disquiet Junto to create a random playlist.
   When selecting tracks, it animates creator icons and finds track waveforms.
   While playing, it displays the creator track notes and provides a link to tracks' Soundcloud page.
   
 -----------------------------------------------------------------------
 
 Fair Use:
 
 -----------------------------------------------------------------------
 
 Before modifying or using this code, consider the Soundcloud API terms of use:
 https://developers.soundcloud.com/docs/api/terms-of-use 
 
 This repository's code is for experimental / proof-of-principle application only.
 All code execution and web interactions occur on the end user's computing resources.
 There is no hosted execution, web interaction or data storage.
 The author(s) of this repository's code do not take responsibility for its application by end users. 
 
 -----------------------------------------------------------------------
 
 API Client:
 
 -----------------------------------------------------------------------
 
 This repository's code requires a Soundcloud client ID for API access.
 
 It has been tested with Soundcloud's V.1 API and a client ID from publicly available example code and API discussions.
 The source of the test ID is documented within the code comments.
 Function of the code in this repository has no connection to any other activities the client ID may be applied to.
 As such, it is understood the client ID may be revoked or otherwise limited at any time.
 In this event, the end user will need to provision a client ID by their own means.
 Interaction with the V.1 API is made according to documentation guidelines, and the API is stable.
 
 This code can alternatively use the Soundcloud V.2 API.
 It will apply the default public client ID issued by the API for non-authenticated vistors to the Soundcloud website.
 Documentary guidelines do not preclude use of the V.2 API, but use is discouraged due to non-stable features and V.1 incompatibility.
 Correct function of the V.2 API may fail at any time of implementation changes.
 In this event, the code will require revision.
 
 -----------------------------------------------------------------------
