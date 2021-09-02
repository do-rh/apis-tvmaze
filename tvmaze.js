"use strict";

const $API_SHOW_SEARCH_URL = "http://api.tvmaze.com/search/shows?"
const API_EPISODE_SEARCH_URL = "http://api.tvmaze.com/shows/"
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const ALTERNATE_IMAGE_URL = `https://static.toiimg.com/thumb/msid-67586673,
                             width-800,height-600,resizemode-75,imgsize-3918697,
                             pt-32,y_pad-40/67586673.jpg`

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  const showSearchResults = await axios.get($API_SHOW_SEARCH_URL,
    { params: { q: term } });
  const allShows = showSearchResults.data;
  let allShowsInfo = [];

  for (let showInd = 0; showInd < allShows.length; showInd++) {
    let showData = allShows[showInd].show;
    let showDataObj = {
      id: showData.id,
      name: showData.name,
      summary: showData.summary,
      image: showData.image.medium || ALTERNATE_IMAGE_URL
    }
    allShowsInfo.push(showDataObj);
  }
  return allShowsInfo;
}

/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src= ${show.image}
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);

  $(".Show-getEpisodes").on("click", getAndShowEpisodes)
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodeIDSearchURL = `${API_EPISODE_SEARCH_URL}${id}/episodes`;
  const episodes = await axios.get(episodeIDSearchURL);
  const episodesInfo = episodes.data.map(function (episode) {
    let episodeInfo = {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
    return episodeInfo;
  });
  return episodesInfo;
}

/** Accepts an array of episode information and puts it into the DOM */

function populateEpisodes(episodes) {
  const $episodeUL = $("#episodesList");
  for (let episode of episodes) {
    const episodeString = `${episode.name}, (Season: ${episode.season}, 
              Episode: ${episode.number})`;
    let $episodeLi = $("<li/>");
    $episodeLi.text(episodeString)
      .addClass("episode")
    $episodeUL.append($episodeLi);
  }
  $("#episodesArea").css("display", "block");
}

/** Handle clicking "Episodes": get show ID and add a list of 
 * all episodes to the DOM
 */

async function getAndShowEpisodes(evt) {
  console.log("getAndShowEpisode is running")
  const showID = $(evt.target).closest("[data-show-id]").data().showId;
  const episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
}

