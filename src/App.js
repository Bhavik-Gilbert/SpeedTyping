import {useState, useEffect, useRef} from 'react';
import randomWords from 'random-words';

import './App.css';

const NUMBER_OF_WORDS = 200; //Number of words in list
let SECONDS = 15; //Initial timer

/*
 * Is string all alphabetical characters

 * @param {String} string  test input string
 * @return {bool}   true if alphabetical
*/  
function isAlpha(string){
  return /^[A-Z]$/i.test(string);
}


function App() {
  const [words, setWords] = useState([]); //Word list
  const [countDown, setCountDown] = useState(SECONDS); //Timer count
  const [currentInput, setCurrentInput] = useState(""); //User text input
  const [currentWordIndex, setCurrentWordIndex] = useState(0); //Index of word in word list
  const [currentCharIndex, setCurrentCharIndex] = useState(-1); //Index of character in word 
  const [currentChar, setCurrentChar] = useState(""); //Current character
  const [correctChar, setCorrectChar] = useState(0); //Correct character count
  const [maxCorrectWords, setMaxCorrectWords] = useState(0); //Maximum correct words reached
  const [correctWords, setCorrectWords] = useState(0); //Correct word count
  const [incorrectWords, setIncorrectWords] = useState(0); //Incorrect word count
  const [status, setStatus] = useState("waiting"); //Game status
  const textInput = useRef(null); //Text input field

  /*
   * Sets word list
  */
  useEffect(() => {
    setWords(generateWords());
  }, []);

  /*
   * Sets focus on textInput
  */
  useEffect(()  => {
    if(status === "started") {
      textInput.current.focus();
    }
  }, [status])

  /*
   * Generates random word list
   * @return {String[]} Array of random words
  */
  function generateWords() {
    return new Array(NUMBER_OF_WORDS).fill(null).map(() => randomWords());
  }

  /*
   * Starts Game
  */
  function startCountDown() {
    //Resets all values
    if(status === "finished") {
      setWords(generateWords());
      setCurrentWordIndex(0);
      setCorrectWords(0);
      setMaxCorrectWords(0);
      setIncorrectWords(0);
      setCorrectChar(0);
      setCurrentCharIndex(-1);
      setCurrentChar("");
    }

    if(status !== "started") {
      //Sets timer to inputted/valid value
      let timerElem = document.getElementById("time").value;
      if(timerElem !== '' && timerElem >= 5 && timerElem <= 60) SECONDS = timerElem;
      setCountDown(SECONDS);

      //Begins game
      setStatus("started");

      //Starts timer
      let interval = setInterval(() => {
        setCountDown((prevCountDown) => {
          if(prevCountDown === 0) {
            //Stops timer
            setCurrentInput("");
            setStatus("finished");
            clearInterval(interval);
            return 0;
          }
          else return prevCountDown - 1;
        });
      } , 1000)
    }
  }

  /*
   * Manages key inputs 

   * @param {int} keyCode   Keycode value of key pressed
   * @param {event} key     Key event press
  */
  function handleKeyDown({keyCode, key}) {
    if(keyCode === 20 ) return; //Ignore capslock

    //Checks word on enter or space press
    if(keyCode === 32 || keyCode === 13) {
      if(checkMatch()) setCurrentWordIndex(currentWordIndex + 1); //Increase word index if correct
      
      //Reset input field
      setCurrentCharIndex(-1);
      setCurrentInput("");
    }
    //Removes character on backspace press
    else if(keyCode === 8) {
      if(currentCharIndex !== -1) setCurrentCharIndex(currentCharIndex - 1);
    }
    //Increases character index and updates most recent character
    else {
      setCurrentCharIndex(currentCharIndex + 1);
      setCurrentChar(key)
    }
  }
  
/*
 * Checks if the input matches the word

 * @return {bool}   true if matches
*/
  function checkMatch() {
    const wordToCompare = words[currentWordIndex];
    const match = wordToCompare === currentInput.trim(); //Compares words

    if (match) {
      //Goes to next word if correct
      setCorrectWords(correctWords + 1);
      setCorrectChar(correctChar + currentCharIndex + 1);

      if(Math.round((correctWords*60)/(SECONDS - countDown)) > maxCorrectWords) setMaxCorrectWords(Math.round((correctWords*60)/(SECONDS - countDown))); //Updates maximum word count if higher
    }
    else setIncorrectWords(incorrectWords + 1); //Increments incorrect words if incorrect

    return match;
  }

  /*
   * Gets the class for a given word
   * Return current string to current word being tested
   * 
   * @param {int} wordIndex   Index of word in list to be checked
   * @return {String}   State of word
  */
  function getWordClass(wordIndex) {
    if(wordIndex === currentWordIndex) return 'current'

    return '';
  }

  /*
   * Gets the class for a given character
   * Returns over string for words too long
   * Returns success string for correct characters
   * Returns upper string for uppercase characters
   * Returns failiure string for incorrect characters
   * 
   * @param {int} wordIndex   Index of word in list to be checked
   * @param {int} charIndex   Index of character in word to be checked
   * @param {char} char   Current character to be checked against
   * @return {String}   State of character
  */
  function getCharClass(wordIndex, charIndex, char)
  {
    if(wordIndex === currentWordIndex && currentChar && status !== "finished")
    {
      if(words[currentWordIndex].length < currentInput.trim().length) return 'over';
      
      for(let i = 0; i <= currentCharIndex; i++) {
        if(words[currentWordIndex][i] ===  currentInput.trim()[charIndex] && charIndex === i) return 'success';
      }
      if(isAlpha(currentInput[charIndex]) && currentInput[charIndex].toUpperCase() === currentInput[charIndex]) return 'upper';
      if(charIndex <= currentCharIndex) return 'failiure';
    }

    return '';
  }

  return (
    <>
      <div align="center">
        <h1>Typing Speed Test</h1>

        <div className="information">
          <h2>Controls</h2>
            <li>Pressing Start Begins the timer</li>
            <li>Press ENTER or SPACE to check a word</li>
            <li>If a word is correct when checked, you'll move onto the next word</li>
            <li><div class="inline"><div className="success">Green</div></div> means the character is correct</li>
            <li><div class="inline"><div className="failiure">Red</div></div> means a mistake has been made</li>
            <li><div class="inline"><div className="over">Yellow</div></div> means too many characters have been entered</li>
            <li><div class="inline"><div className="upper">Orange</div></div> means your character is uppercase</li>
            <li>Your scores are available below the text field, and will stay there until you start another round</li>
            <li>They are updated after each word check and per second (for per minute counts)</li>
        </div>

        {status !== "started" && (
          <div className="information">
          <h3>How Long Do You Want To Type For?</h3>
          <h4>5s - 60s</h4>
            <input type="number" id="time" min="5" max="60" placeholder={SECONDS}/>
          </div>
        )}
        {status === "started" && (
          <>
          <div className="timer">{countDown}</div>
          <input ref={textInput} disabled={status !== "started"} type="text" className="input" onKeyDown={handleKeyDown} value={currentInput} onChange={(e) => setCurrentInput(e.target.value)}/>
          </>
        )}
        <button className="startbutton" onClick={startCountDown}>Start</button>

        {status === "started" && (
          <div className="words">
            {words.map((word, i) => (
             <> 
              <span className={getWordClass(i)} key={i}>
              <span>
                {word.split("").map((char, index) => (
                  <span className={getCharClass(i, index, char)} key={index}>{char}</span>
                ))} 
              </span>
              </span>
              <span> </span>
              </>
            ))}
          </div>
        )}

        <div className="information">
          <div className="card">
          <h2>Words Per Minute</h2>
          {SECONDS - countDown !== 0 && (
            <p>{Math.round((correctWords*60)/(SECONDS - countDown))}</p>
          )}
          {SECONDS - countDown === 0 && (
            <p>0</p>
          )}
          </div>

          <div className="card">
          <h2>Maximum Words Per Minute</h2>
            <p>{maxCorrectWords}</p>
          </div>

          <div className="card">
          <h2>Characters Per Minute</h2>
          {SECONDS - countDown !== 0 && (
            <p>{Math.round((correctChar*60)/(SECONDS - countDown))}</p>
          )}
          {SECONDS - countDown === 0 && (
            <p>0</p>
          )}
          </div>

          <div className="card">
          <h2>Accuracy</h2>
          {correctWords+incorrectWords !== 0 && (
            <p>{Math.round(correctWords/(correctWords + incorrectWords) * 100)}%</p>
          )}
          {correctWords+incorrectWords === 0 && (
            <p>100%</p>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
