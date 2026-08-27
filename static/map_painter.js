const form = document.querySelector("#map-form");
const map = document.querySelector("#map");

const tilePalette = document.querySelector("#selected-tile");

let selectedTile = 'grass'

tilePalette.addEventListener("click", function(event) {
    selectedTile = event.target.value
})

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    map.style.gridTemplateColumns = `repeat(${data.cols}, 40px)`;

    console.log(data)
    
    const Tiles = Object.freeze({
        HORSE: 0,
        GRASS: 1,
        WATER: 2,
        GOAL: 3,
        CHERRIES: 4,
        GAPPLE: 5,
        BEES: 6
    })

    let grid = [];
    let tileElements = [];

    for (let row = 0; row < data.rows; row++) {
        grid.push([]);
        tileElements.push([]);
        for (let col = 0; col < data.cols; col++) {
            // Check edge cases and init
            if (row === 0 || row === data.rows - 1 || col === 0 || col === data.cols - 1) {
                grid[row].push(Tiles.GOAL)
            }
            else
            {
                grid[row].push(Tiles.GRASS)
            }

            // Create a html element for each tile
            const tile = document.createElement("div");
            tileElements[row].push(tile);
            tile.classList.add("tile")
            const tileClass = Object.keys(Tiles).find(key => Tiles[key] === grid[row][col]).toLowerCase();
            tile.classList.add(tileClass)

            tile.addEventListener("click", function() {

                if (selectedTile === 'horse') {
                    // Find the existing horse
                    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
                        for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
                            if (grid[rowIndex][colIndex] === Tiles.HORSE) {

                                grid[rowIndex][colIndex] = Tiles.GRASS;

                                const oldHorse = tileElements[rowIndex][colIndex];

                                oldHorse.className = '';
                                oldHorse.classList.add("tile");
                                oldHorse.classList.add("grass");
                            }
                        }
                    }
                }

                tile.className = '';
                tile.classList.add("tile")
                tile.classList.add(selectedTile)
                grid[row][col] = Tiles[selectedTile.toUpperCase()];
            })

            map.appendChild(tile);
        }
    }

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
    });
})

