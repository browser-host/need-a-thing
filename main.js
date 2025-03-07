document.addEventListener("DOMContentLoaded", () => mainSetup() );

function mainSetup(){
  createLinksList();
  setupClock();
  setupNotepad();
  setupSearchBar();
  setupToDos();
  setupTools();
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

  const linksData = JSON.parse(localStorage.getItem('links-data'));

  Object.keys(linksData).forEach((group) => {
    linksContent += `
      <div class="link-group">
        <div class="header">${group}</div>
    `;
    
    linksData[group].forEach((link) => {
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
const toDoLocationString = "todo-data";

// setup
function setupToDos(){
  var input = document.getElementById('new-task-input');
  renderTasks();

  // setup input for new tasks
  input.onkeyup = (e) => {
    if(e.key === 'Enter'){
      var todoData = JSON.parse(localStorage.getItem(toDoLocationString));
      var newTask = {
        parent: 'tasks-start',
        title: input.value,
        complete: false,
        extras: ''
      }

      const key = Date.now() - 980838000000;
      if(todoData && todoData['tasks']){
        todoData['tasks'][Date.now() - 980838000000] = newTask;
      } else {
        todoData = {
          tasks: {
            [key] : newTask
          }
        }
      }

      localStorage.setItem(toDoLocationString, JSON.stringify(todoData));

      input.value = "";
    }
    renderTasks();
  }
}

// loading tasks from localstorage
function renderTasks(){
  const taskLocations = ['tasks-start', 'tasks-doing', 'tasks-review'];
  const todoData = JSON.parse(localStorage.getItem(toDoLocationString));
  
  if(todoData && todoData['tasks']){
    taskLocations.forEach(location => {
      var newTaskHtml = "";

      // create tasks
      Object.keys(todoData['tasks']).forEach((key) => {
        task = todoData['tasks'][key];
        if(task.parent === location){
          var newTask = createTask(key, task.title, task.completem, task.extras);
          newTaskHtml += newTask;
        }
      });

      document.getElementById(location).innerHTML = newTaskHtml;
    });

    // drag events
    document.querySelectorAll('.task').forEach((task) => {
        task.addEventListener('dragstart', (e) => {
          document.getElementById(e.target.id).classList.add('dragging');
          e.dataTransfer.setData('text/plain', e.target.id);
      });
    })
    
    // drop events
    document.querySelectorAll('.drop-location').forEach((container) => {
      container.addEventListener('drop', (event) => {
        container.classList.remove('dragged-over');

        if(event.target == event.currentTarget){
          event.preventDefault();
          const taskId = event.dataTransfer.getData('text/plain');
          document.getElementById(taskId).classList.remove('dragging');

          // drops on garbage
          if(event.target.id == 'to-do-garbage'){
            delete todoData['tasks'][taskId];
          } else {
            // move the element
            const dragTask = document.getElementById(taskId);
            event.target.appendChild(dragTask);
            todoData['tasks'][taskId].parent = event.target.id;
          }

          localStorage.setItem(toDoLocationString, JSON.stringify(todoData));
          renderTasks();
        }
      });

      container.addEventListener('dragover', (event) => {
        event.preventDefault();
        container.classList.add('dragged-over');
      });

      container.addEventListener('dragleave', (event) => {
        event.preventDefault();
        container.classList.remove('dragged-over');
      });
    })

    // mark as complete
    document.querySelectorAll('.task-icon-container').forEach((checkmark) => {
      checkmark.addEventListener('click', (event) => {
        const icon = event.target;
        if(icon.classList.contains('incomplete')){
          todoData['tasks'][icon.parentElement.id].complete = true;
          icon.classList.replace('incomplete', 'complete');
        } else {
          todoData['tasks'][icon.parentElement.id].complete = false;
          icon.classList.replace('complete', 'incomplete');
        }
        localStorage.setItem(toDoLocationString, JSON.stringify(todoData));
      });
    })

    // edit extras
    document.querySelectorAll('.task-extra').forEach((editButton) => {
      const parentId = editButton.parentElement.id;
      editButton.addEventListener('click', (e) => {
        document.getElementById('extras-modal').style.display = "block";
        var taskEdit = document.getElementById('task-extra-edit');
        taskEdit.dataset.taskId = editButton.parentElement.id;
        taskEdit.value = todoData['tasks'][parentId].extras;
        document.getElementById('task-title-edit').value = todoData['tasks'][parentId].title;
      });
    })
  }
}

function createTask(id, inputTitle, complete, extra ){
  return `
    <div id="${id}" class="task" draggable="true">
      <span class="task-icon-container ${complete ? "complete" : "incomplete"}"></span>
      <span class="task-title">${inputTitle}</span>
      <span class="task-extra edit">${extra == "" ? "Add" : "Edit"}</span>
    </div>
  `
}

function saveExtras(){
  const todoData = JSON.parse(localStorage.getItem(toDoLocationString));

  const taskEdit = document.getElementById('task-extra-edit');
  const titleEdit = document.getElementById('task-title-edit');
  const extraString = taskEdit.value;
  const titleString = titleEdit.value;
  const taskId = taskEdit.dataset.taskId;
  
  todoData['tasks'][taskId].extras = extraString;
  todoData['tasks'][taskId].title = titleString;
  localStorage.setItem(toDoLocationString, JSON.stringify(todoData));
  renderTasks();
  closeModal();
}

function closeModal(){
  document.getElementById('extras-modal').style.display = "none";
}


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
