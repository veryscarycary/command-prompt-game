
function StoryTree(script, aftermath, fail = false) {
  this.script = script;
  this.response = '';
  this.fail = fail;
  if (!!aftermath) {
    this.aftermath = aftermath;
  }
}

const west = new StoryTree("A barren desert unfolds before you. It's hot and dry. Your engine starts acting up and soon enough, you find yourself on the side of the road with steam billowing out from under your hood.", {

});
const east = new StoryTree("You encounter a group of traffic signs that indicate your heading into dense civilization. You can go to the (big city) or the (small town).", {
  'big city': new StoryTree(""),
  'small town': new StoryTree("")
});

const stealCarSafe = new StoryTree("You hop in the car, quickly hotwire it, and are well on your way. On your way down the road, you hit a fork. Go (west) or (east)?", {
  'west': west,
  'east': east
})

var story =
  new StoryTree('Wake up, Neo... Are you awake?', {
    'yes, ya, yeah, yeah': new StoryTree('Good. I have a very important task for you. Are you in?', {
      'yes, ya, yeah, yeah': new StoryTree('I need you to go outside and steal a car. Still with me? (Go outside?)', {
        'yes, ya, yeah, yeah, go outside': new StoryTree("You see a red mustang parked across the street from a liquor store. There are two men standing beside it smoking cigarettes. What do you do? (distract them) or (face them head on)?", {
          'distract them': new StoryTree("You throw a rock to the right of them. They get flustered and move over to the side of the liquor store to check it out. What now?(take the car) or (assassinate the men)", {
            'take the car': new StoryTree("You run to the car as fast as you can and jump into the driver seat. You lock the door quickly. The men run at you and bash on the side of your car as you start the engine and speed down the street. Where do you go from here? (down the road) or (go back)", {
              'down the road': new StoryTree("You see a fork in the road. Go (west) or (east)?", {
                'west': west,
                'east': east
              }),
              'go back': new StoryTree("The men immediately see you coming down the road and unload on your front windshield with a tommy gun. You never even make it within 50 yards of them.", false, true)
            }),
            'assassinate the men': new StoryTree("You see a coil of wires lying near the road. When the men aren't looking, you swiftly wrap each of their heads in wires and pull as hard as you can. The men drop to the ground lifeless. What now? (loot their bodies) or (steal the car)", {
              'loot their bodies': new StoryTree("You find a handgun and 5 bullets. What now? (steal the car)", {
                'steal the car': stealCarSafe
              }),
              'steal the car': stealCarSafe
            })
          }),
          'face them head on': new StoryTree("You run up to the two men, punch the one closest to the driver's seat, and proceed to open the driver's door. The second man takes out a pistol and shoots you in the throat. You bleed out in 20 seconds. :(",false, true)
        }),
        'no, nah, nope': new StoryTree("What a wuss. Cars aren't even hard to steal.", false, true)
      }),
      'no, nah, nope': new StoryTree('Well, why even bother. Go back to sleep.', false, true)
    }),
    'no, nah, nope': new StoryTree('Well, why even bother? Go back to sleep.', false, true)
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

function computerTellsStory(storyTree, prompt=true, callback) {
  if (storyTree.fail) {
    createStoryDiv(storyTree.script);
    printGameOver();
    return;
  }

  if (prompt) {
    callback = function prompt() {
        currentStorySection = storyTree;
        promptUser();
    }
  }

  function insertAfter (el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
  }

  function createStoryDiv (script, callback) {
    const typewritingSpeed = 900;

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
      }, typewritingSpeed);
    } else {
        // addClass(span, 'last-line');
      span.innerHTML = script;


      // allows the text to wrap when the screen size adjusts
      // waits for previous text to post
      setTimeout(function() {
        const elements = document.getElementsByClassName('typewriter');
        Array.prototype.forEach.call(elements, function(element) {
          element.style.whiteSpace = 'normal';
        });
        // place input field for user
        if (callback) {
          callback();
        }
      }, typewritingSpeed + 200);
    }

  }

  createStoryDiv(storyTree.script, callback);
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
  var keySelected;

  var checkStoryKeys = function() {
    var isValidUserResponseFound = false;

    Object.keys(currentStorySection.aftermath).forEach(function(key) {
      var result = _.some(key.split(', '), function(response) {
        return response === userResponse;
      });

      if (result) {
        isValidUserResponseFound = true;
        keySelected = key;
      }
    });

    return isValidUserResponseFound;
  };

  // if matching response
  if(currentStorySection.aftermath && checkStoryKeys()) {
    console.log('match!!!');
    console.log(userResponse);
    currentStorySection = currentStorySection.aftermath[keySelected];
    clearCommandPrompt();
    computerTellsStory(currentStorySection);
    console.log('nextStory =>'+ JSON.stringify(currentStorySection));
  } else { // nonmatching response
    clearCommandPrompt();
    printDefaultResponse();
  }
}

function printDefaultResponse() {
  computerTellsStory(new StoryTree(defaultComputerResponse), false, function() {
    clearCommandPrompt();
    computerTellsStory(currentStorySection);
  });
  // setTimeout(function() {
  //   clearCommandPrompt();
  //   computerTellsStory(currentStorySection);
  // }, 3000);
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
