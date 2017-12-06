
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
    yes: new StoryTree('Good. I have a very important task for you. Are you in?', {
      yes: new StoryTree('I need you to go outside and steal a car. Still with me? (Go outside?)', {
        yes: new StoryTree("You see a red mustang parked across the street from a liquor store. There are two men standing beside it smoking cigarettes. What do you do? (distract them) or (face them head on)?", {
          'distract them': new StoryTree("You throw a rock to the right of them. They get flustered and move over to the side of the liquor store to check it out. What now?(take the car) or (assasinate the men)"),
          'face them head on': new StoryTree("You run up to the two men, punch the one closest to the driver's seat, and proceed to open the driver's door. The second man takes out a pistol and shoots you in the throat. You bleed out in 20 seconds. :(",false, true)
        }),
        no: new StoryTree("What a wuss. Cars aren't even hard to steal.", false, true)
      }),
      no: new StoryTree('Well, why even bother. Go back to sleep.', false, true)
    }),
    no: new StoryTree('Well, why even bother? Go back to sleep.', false, true)
  });




var defaultComputerResponse = "Don't get smart with me, wise ass. Just answer the question.";
var currentStorySection;
var gameOver = false;

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

function computerTellsStory(storyTree, prompt=true) {
  if (storyTree.fail) {
    printGameOver();
    return;
  }

  const insertAfter = function (el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
  }

  const createStoryDiv = function (script, callback) {
    console.log(script,script.length, 'beginning of createstorydiv')
    var container = document.createElement('div');
    var span = document.createElement('span');
    addClass(container, 'typewriter-container');
    addClass(span, 'typewriter');
    container.appendChild(span);

    const typewriterContainers = document.getElementsByClassName('typewriter-container');
    if (typewriterContainers.length) {
      const breakElement = document.createElement('br');
      insertAfter(breakElement, typewriterContainers[typewriterContainers.length - 1]);
      insertAfter(container, breakElement);
    } else {
      document.getElementsByClassName('command-prompt-window')[0].appendChild(container);
    }

    //43 pixels is roughly 1 character
    const widthOfViewport = window.innerWidth/43;
    const indexOfSpaceBreak = script.indexOf(' ', widthOfViewport);
    console.log(window.innerWidth/43, 'width of viewport in cahracters');

    // if script is longer than the length of the screen and includes a space to break
    if (script.length > widthOfViewport && indexOfSpaceBreak !== -1) {
      span.innerHTML = script.slice(0, indexOfSpaceBreak);

      setTimeout(function() {
        createStoryDiv(script.slice(indexOfSpaceBreak), callback);
      }, 1100);
    } else {
        // addClass(span, 'last-line');
      span.innerHTML = script ? script : defaultComputerResponse;

      // place input field for user
      callback();

      // allows the text to wrap when the screen size adjusts
      // waits for previous text to post
      setTimeout(function() {
        const elements = document.getElementsByClassName('typewriter');
        Array.prototype.forEach.call(elements, function(element) {
          element.style.whiteSpace = 'normal';
        });
      }, 1200);
    }
  }

  createStoryDiv(storyTree.script, function prompt() {
    if (prompt) {
      currentStorySection = storyTree;
      promptUser();
    }
  });
}

function promptUser() {
  function setEnterEvent(el) {
    el.addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        if (!storyFinished()) {
          saveUserResponse(event.target.value);
          checkUserResponse();
          console.log('nextStory =>'+ JSON.stringify(currentStorySection));
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

function saveUserResponse(userResponse) {
  currentStorySection.response = userResponse;
}

function checkUserResponse() {
  var userResponse = currentStorySection.response.toLowerCase();
  // if correct response
  if(currentStorySection.aftermath && currentStorySection.aftermath.hasOwnProperty(userResponse)) {
    console.log('match!!!');
    console.log(userResponse);
    currentStorySection = currentStorySection.aftermath[userResponse];
    clearCommandPrompt();
    computerTellsStory(currentStorySection);
    console.log('nextStory =>'+ JSON.stringify(currentStorySection));
  } else {
    clearCommandPrompt();
    printDefaultResponse();
  }
}

function printDefaultResponse() {
  computerTellsStory(new StoryTree(defaultComputerResponse), false);
  setTimeout(function() {
    clearCommandPrompt();
    computerTellsStory(currentStorySection);
  }, 2000);
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

const resetGameWithEnter = function(event) {
  event = event || window.event;
  console.log(event.keyCode, 'pressing enter');
  if (event.keyCode === 13) {
    resetGame();
  }
};

function resetGame() {
  clearCommandPrompt();
  computerTellsStory(story);
  document.removeEventListener('keyup', resetGameWithEnter);
}

function printGameOver() {
  gameOver = true;
  console.log('game over');
  var cmd = document.getElementsByClassName('command-prompt-window')[0];
  var container = document.createElement('div');
  var span = document.createElement('span');
  span.innerHTML = 'GAME OVER';
  container.appendChild(span);
  cmd.appendChild(container);
  addClass(container, 'game-over-container');
  addClass(span, 'game-over-text');

  container.onclick = function(event) {
    event.stopPropagation();
    resetGame();
  };

  // after a tiny bit of time, allow user to reset game with enter
  setTimeout(function() {
    document.addEventListener('keyup', resetGameWithEnter);
  }, 200);
}


computerTellsStory(story);
