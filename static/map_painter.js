const form = document.querySelector("#map-form");
const map = document.querySelector("#map");

const tilePalette = document.querySelector("#selected-tile");
const solveButton = document.querySelector("#solve-button");

let selectedTile = 'grass';
let grid = [];
let tileElements = [];

const Tiles = Object.freeze({
    HORSE: 0,
    GRASS: 1,
    WATER: 2,
    GOAL: 3,
    CHERRIES: 4,
    GAPPLE: 5,
    BEES: 6
});

tilePalette.addEventListener("click", function(event) {
    selectedTile = event.target.value;
});

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const rows = Number(data.rows) + 2;
    const cols = Number(data.cols) + 2;

    // Reset the previous map
    grid = [];
    tileElements = [];
    map.innerHTML = '';

    map.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

    for (let row = 0; row < rows; row++) {
        grid.push([]);
        tileElements.push([]);

        for (let col = 0; col < cols; col++) {

            // Check edge cases and initialise
            if (
                row === 0 ||
                row === rows - 1 ||
                col === 0 ||
                col === cols - 1
            ) {
                grid[row].push(Tiles.GOAL);
            }
            else {
                grid[row].push(Tiles.GRASS);
            }

            // Create HTML element for each tile
            const tile = document.createElement("div");

            tileElements[row].push(tile);

            tile.classList.add("tile");

            const tileClass = Object.keys(Tiles)
                .find(key => Tiles[key] === grid[row][col])
                .toLowerCase();

            tile.classList.add(tileClass);

            tile.addEventListener("click", function() {

                if (selectedTile === 'horse') {

                    // Find the existing horse
                    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
                        for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {

                            if (grid[rowIndex][colIndex] === Tiles.HORSE) {

                                grid[rowIndex][colIndex] = Tiles.GRASS;

                                const oldHorse =
                                    tileElements[rowIndex][colIndex];

                                oldHorse.className = '';
                                oldHorse.classList.add("tile");
                                oldHorse.classList.add("grass");
                            }
                        }
                    }
                }

                tile.className = '';
                tile.classList.add("tile");
                tile.classList.add(selectedTile);

                grid[row][col] = Tiles[selectedTile.toUpperCase()];
            });

            map.appendChild(tile);
        }
    }
});

solveButton.addEventListener("click", function() {

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch("/solve", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            grid: grid,
            wallBudget: Number(data["wall-budget"])
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        window.lastResult = data;

        // Show walls
        data.walls.forEach(([row, col]) => {
            const tile = tileElements[row][col];

            tile.className = '';
            tile.classList.add("tile");
            tile.classList.add("wall");
        });

        // Build quick lookup sets for free and wall tiles
        const freeSet = new Set(data.free.map(([r, c]) => `${r},${c}`));
        const wallSet = new Set(data.walls.map(([r, c]) => `${r},${c}`));

        // Show enclosed tiles: every non-water tile that's neither free nor a wall
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {

                if (grid[row][col] === Tiles.WATER) continue;

                const key = `${row},${col}`;

                if (!freeSet.has(key) && !wallSet.has(key)) {
                    const tile = tileElements[row][col];
                    tile.classList.add("enclosed");
                }
            }
        }
    });
});