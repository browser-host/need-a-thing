document.addEventListener("DOMContentLoaded", () => mainSetup() );

function mainSetup(){
  createLinksList();
  setupClock();
  setupNotepad();
  setupSearchBar();
}



// * * * * * * * * * * * * *
//          Search
// * * * * * * * * * * * * *

const searchEngineData = [
  {
    title: 'ask the librarian',
    name: 'google',
    link: 'https://www.google.com/search?q='
  },
  {
    title: 'consult the oracle',
    name: 'chatgpt',
    link: 'https://chatgpt.com?q='
  }
];

function setupSearchBar(){
  // set initial text
  const title = document.getElementById('search-bar-title');
  const searchBar = document.getElementById('searchBarInput');
  var engineIndex = 0;
  title.innerHTML = searchEngineData[engineIndex].title;

  // set listeners
  document.onkeyup = (event) => {
    if(event.key === " " && event.ctrlKey){
      searchBar.focus();
    }
  }

  searchBar.onkeyup = (event) => {
    if(event.key === " " && event.ctrlKey){
      title.click();
    }
    if( event.key === "Enter" ){
      search(event.ctrlKey);
    }
  }

  title.onclick = () => {
    // increment/loop
    engineIndex++;
    if(engineIndex > searchEngineData.length - 1){
      engineIndex = 0;
    }

    // update data
    title.dataset.engineIndex = engineIndex;
    title.innerHTML = searchEngineData[engineIndex].title;
  }
}

// search bar callback
const search = (newTab) => {
  // get searchword
  const searchWord = document.getElementById('searchBarInput').value;

  if ( !(searchWord == "" || searchWord == null) ){
    // get selected search engine
    const title = document.getElementById("search-bar-title");
    const searchEngine = title.dataset.engineIndex;

    // get url
    const targetUrl = getTargetUrl(searchWord, searchEngine);

    // navigate to new search
    window.open(targetUrl, newTab ? "_blank" : "_self").focus();
  }
}

function getTargetUrl(value, engine){
  // check to see if input is already a valid URL
  if (isWebUrl(value)) return value
  // check for a custom shortform input
  if (lookup[value]) return lookup[value]
  // else search it on engine -> google default
  return searchEngineData[engine].link + value
}

// search functionality
const isWebUrl = value => {
  try {
    // attempt to make new url with the input
    // if this fails its not a url
    const url = new URL(value)
    // return a check to seet if the protocol is one of the two:
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

// custom shortform searches
const lookup = {"imdb":"/","deepl":"https://deepl.com/","reddit":"https://reddit.com/","maps":"https://maps.google.com/"}



// * * * * * * * * * * * * *
//          Links
// * * * * * * * * * * * * *

function createLinksList(){
  var linksContent = "";
  var tabIndexCounter = 2;

  Object.keys(BookMarkLinksObj).forEach((group) => {
    linksContent += `
      <div class="link-group">
        <div class="header">${group}</div>
    `;
    
    BookMarkLinksObj[group].forEach((link) => {
      linksContent += `<a class="link" href="${link.href}" tabindex=${tabIndexCounter}>${link.title}</a>`;
      tabIndexCounter++;
    });

    linksContent += '</div>';
  });

  document.querySelector('#links-list-container').insertAdjacentHTML("beforeend", linksContent);
}



// * * * * * * * * * * * * *
//          Clock
// * * * * * * * * * * * * *

function setupClock(){
  const dateTimeLocation = document.querySelector('#dateTime');
  dateTimeLocation.insertAdjacentHTML("beforeend", curDateTimeHtml());
  setInterval(() => {
    dateTimeLocation.innerHTML = curDateTimeHtml();
  }, 1000);
}

function curDateTimeHtml(){
  // get cur time
  const now = new Date();
  
  // construct html
  const day = now.toLocaleDateString('en-us', {weekday: 'long'});
  const month = now.toLocaleDateString('en-us', {month: 'long'});
  const dd = now.getDate();
  
  let hours = (now.getHours() % 12).toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  let seconds = now.getSeconds().toString().padStart(2, '0');
  
  var nowHtml = `
    <div id="date"> <div class="day">${day}</div><div class="month">${month}</div><div class="dd">${dd}</div> </div>  
    <div id="time"> <div class="hours">${hours}</div><div class="minutes">${minutes}</div><div class="seconds">${seconds}</div> </div>
  `;

  return nowHtml;
}



// * * * * * * * * * * * * *
//          Notepad
// * * * * * * * * * * * * *

function setupNotepad(){
  const notepadLocationString = 'notepad-data';
  // init
  const quill = new Quill("#notepad-editor");

  // load data
  const initial = localStorage.getItem(notepadLocationString);
  quill.setContents(JSON.parse(initial));

  // set listeners
  quill.on('text-change', debounce(() => {
    const delta = quill.getContents();
    localStorage.setItem(notepadLocationString, JSON.stringify(delta));
  }, 750));

  document.querySelector('#garbage-logo-container').addEventListener('click', () => {
    quill.setContents([]);
  });
}



// * * * * * * * * * * * * *
//          To Dos
// * * * * * * * * * * * * *




// * * * * * * * * * * * * *
//          Util
// * * * * * * * * * * * * *

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}