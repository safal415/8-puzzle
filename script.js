// ------- CONFIG -------
const SIZE = 3;                 // 3x3 puzzle
const USE_IMAGES = true;        // set to true to use assets/tile1.png..tile8.png if available

// ------- STATE -------
let tiles = [];                 // numbers 0..8 (8 = blank)
let emptyIndex = 8;
let moves = 0;
let timerId = null;
let seconds = 0;
let paused = false;

// ------- LIFECYCLE -------
function startGame() {
  // screens
  qs("#start-screen").classList.add("hidden");
  qs("#win-screen").classList.add("hidden");
  qs("#game-screen").classList.remove("hidden");
  qsi("#pause-overlay", true);

  // reset state
  tiles = Array.from({ length: SIZE * SIZE }, (_, i) => i);
  shuffle(tiles);
  emptyIndex = tiles.indexOf(SIZE * SIZE - 1); // 8 in 3x3
  moves = 0; seconds = 0; paused = false;

  // UI reset
  qst("#moves", moves);
  qst("#time", formatTime(seconds));
  qst("#pause-label", "Pause");

  // render board
  renderBoard();

  // start timer
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (!paused) {
      seconds++;
      qst("#time", formatTime(seconds));
    }
  }, 1000);
}

function resetGame() {
  startGame();
}

function pauseResume() {
  paused = !paused;
  qst("#pause-label", paused ? "Resume" : "Pause");
  qsi("#pause-overlay", !paused);
}

// ------- RENDER -------
function renderBoard() {
  const board = qs("#puzzle-board");
  board.innerHTML = "";

  tiles.forEach((tile, index) => {
    const div = document.createElement("div");
    div.className = "tile";
    div.setAttribute("data-label", tile + 1); // numeric fallback

    if (tile !== SIZE * SIZE - 1) {
      // optional image if provided
      if (USE_IMAGES) {
        div.style.backgroundImage = `url(assets/tile${tile + 1}.png)`;
      }
      div.addEventListener("click", () => moveTile(index));
    } else {
      div.classList.add("empty");
    }

    board.appendChild(div);
  });
}

// ------- GAME LOGIC -------
function moveTile(index) {
  if (paused) return;

  if (!areAdjacent(index, emptyIndex)) return;

  // swap
  [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
  emptyIndex = index;

  moves++;
  qst("#moves", moves);

  renderBoard();
  checkWin();
}

function checkWin() {
  const solved = tiles.every((v, i) => v === i);
  if (!solved) return;

  // stop timer
  if (timerId) clearInterval(timerId);

  // show win screen
  qst("#final-moves", moves);
  qst("#final-time", formatTime(seconds));
  qs("#game-screen").classList.add("hidden");
  qs("#win-screen").classList.remove("hidden");
}

// adjacency with row/col check to avoid wrap
function areAdjacent(a, b) {
  const ar = Math.floor(a / SIZE), ac = a % SIZE;
  const br = Math.floor(b / SIZE), bc = b % SIZE;
  return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
}

// Fisher–Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // (Optional) If you care about guaranteed solvable configurations,
  // add a parity check here and swap any two non-empty tiles when parity is odd.
}

// ------- UTILS -------
const qs = (sel) => document.querySelector(sel);
const qst = (sel, text) => (qs(sel).textContent = text);
const qsi = (sel, hidden) => qs(sel).classList[hidden ? "add" : "remove"]("hidden");

function formatTime(s) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

// expose for HTML buttons
window.startGame = startGame;
window.resetGame = resetGame;
window.pauseResume = pauseResume;