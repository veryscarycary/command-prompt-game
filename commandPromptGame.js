
function StoryTree(script, aftermath, fail = false) {
  this.script = script;
  this.response = '';
  this.fail = fail;
  if (!!aftermath) {
    this.aftermath = aftermath;
  }
}

var story =
  new StoryTree('Wake up, Neo... Are you awake?', {
    yes: new StoryTree('Good. I have a very important task for you. Are you in?'),
     // {
    //   new StoryTree('I need you to go outside and steal a car. Still with me?(Go outside?)', {
    //     yes: new StoryTree("You see a red mustang parked across the street from a liquor store. There are two men standing beside it smoking cigarettes. What do you do? (distract them) or (face them head on)?", {
    //       distract them: new StoryTree("You throw a rock to the right of them. They get flustered and move over to the side of the liquor store to check it out. What now?(take the car) or (assasinate the men)", {
    //
    //       });
    //       face them head on: new StoryTree("You run up to the two men, punch the one closest to the driver's seat, and proceed to open the driver's door. The second man takes out a pistol and shoots you in the throat. You bleed out in 20 seconds. :(",false, true)
    //     })
    //     no: new StoryTree("What a wuss. Cars aren't even hard to steal.", false, true)
    //   });
    // })
    no: new StoryTree('Well, why even bother. Go back to sleep.', false, true)
  }
);




var defaultComputerResponse = "Don't get smart with me, wise ass. Just answer the question.";
var currentStorySection;

document.body.addEventListener("click", function(event) {
  event.preventDefault();
  var input = document.getElementsByTagName('input')[0];
  input.focus();
});

var addClass = function (el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
};

function computerTellsStory(storyTree) {
  currentStorySection = storyTree;
  var container = document.createElement('div');
  var span = document.createElement('span');
  container.appendChild(span);
  console.log(span);
  document.getElementsByClassName('command-prompt-window')[0].appendChild(container);
  span.innerHTML = storyTree.script ? storyTree.script : defaultComputerResponse;
  addClass(container, 'typewriter-container');
  addClass(span, 'typewriter');

  promptUser();
}

function promptUser() {
  function setEnterEvent(el) {
    el.addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        saveUserResponse(currentStorySection, event.target.value);
        checkUserResponse(currentStorySection);
        clearCommandPrompt();
        if (!storyFinished()) {
          computerTellsStory(currentStorySection);
        } else {
          printGameOver();
        }
      }
    });
  }

  var input = document.createElement('input');
  document.getElementsByClassName('command-prompt-window')[0].appendChild(input);
  addClass(input, 'user-input');
  input.focus();

  setEnterEvent(input);
}

function saveUserResponse(currentStorySection, userResponse) {
  currentStorySection.response = userResponse;
}

function checkUserResponse(currentStorySection) {
  var userResponse = currentStorySection.response.toLowerCase();
  if(currentStorySection.aftermath.hasOwnProperty(userResponse)) {
    currentStorySection = currentStorySection.aftermath[userResponse];
  }
}

function clearCommandPrompt() {
  var cmd = document.getElementsByClassName('command-prompt-window')[0];
  var children = cmd.children;
  var childrenLength = children.length;
  // console.log('children',children);
  // console.log('children.length',children.length);
  if (childrenLength) {
    for (var i = childrenLength - 1; i >= 0; i--) {
      cmd.removeChild(children[i]);
    }
  }
}

function storyFinished() {
  var storyFinished = false;

  if (!currentStorySection.aftermath) {
    storyFinished = true;
  }

  return storyFinished;
}

function printGameOver() {
  console.log('game over');
  var cmd = document.getElementsByClassName('command-prompt-window')[0];
  var container = document.createElement('div');
  var span = document.createElement('span');
  span.innerHTML = 'GAME OVER';
  container.appendChild(span);
  cmd.appendChild(container);
  addClass(container, 'game-over-container');
  addClass(span, 'game-over-text');

  container.onclick = function() {
    console.log('test');
    clearCommandPrompt();
    currentStoryIndex = 0;
    computerTellsStory(currentStoryIndex);
  };
}


computerTellsStory(story);
