"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const TVMazeAPI = 'https://api.tvmaze.com'


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  let ret = [];
  let req = await axios.get('https://api.tvmaze.com/search/shows?q=' + term);
  let shows = req.data;

  for (let show of shows) {
    ret.push( {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image
      } 
    );
  }

  return ret;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let image = show.image;
    let source;

    if (image) {
      source = image.medium;
    } else {
      source = 'https://tinyurl.com/tv-missing';
    }

    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${source} 
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
    
    let $button = $('<button class="btn btn-primary"> Episodes </button>');
    $button.click(getAndDisplayEpisodes);
    $show.append($button);
    $showsList.append($show);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});



/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

async function getEpisodesOfShow(id) {
  let reqString = TVMazeAPI + `/shows/${id}/episodes`;
  let req = await axios.get(reqString);
  let episodes = req.data;
  let ret = []

  for (let episode of episodes) {
    ret.push(
      {
        id: episode.id,
        name: episode.name,
        season: episode.season,
        number: episode.number
      }
    )
  }

  return ret;
}

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }

function populateEpisodes(episodes) {
  $episodesArea.empty();
  let episodeList = document.createElement('ul');

  for (let episode of episodes) {
    let episodeItem = document.createElement('li');
    episodeItem.innerText = `${episode.name} (season ${episode.season}, number ${episode.number})`;
    episodeList.appendChild(episodeItem);
  }

  $episodesArea.show();
  $episodesArea.append(episodeList);
}

async function getAndDisplayEpisodes(e) {
  let showID = e.target.parentElement.dataset.showId;
  let episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
}