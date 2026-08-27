from enum import Enum
import pulp

# Day 241 Map
grid = [[3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        [3,2,2,1,2,1,2,2,2,1,1,1,2,3],
        [3,2,2,1,4,1,2,2,2,1,2,1,2,3],
        [3,1,1,1,1,1,1,1,1,1,1,4,1,3],
        [3,1,2,2,2,1,1,2,2,1,2,2,2,3],
        [3,1,2,2,2,1,1,1,1,1,2,2,2,3],
        [3,1,2,2,2,1,1,0,1,1,2,2,2,3],
        [3,1,1,1,1,1,1,1,1,1,1,1,1,3],
        [3,1,2,4,2,2,1,2,2,2,1,1,2,3],
        [3,1,1,1,2,2,1,2,2,2,1,1,2,3],
        [3,2,2,2,1,1,1,2,2,2,1,1,1,3],
        [3,2,2,2,1,1,1,1,1,1,4,2,2,3],
        [3,2,2,2,1,2,2,2,1,1,1,2,2,3],
        [3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        ]
WALL_BUDGET = 9

class Tiles(Enum):
    HORSE = 0
    GRASS = 1
    WATER = 2
    GOAL = 3
    CHERRIES = 4
    GAPPLES = 5
    BEES = 6

prob = pulp.LpProblem("EncloseHorse", pulp.LpMaximize)

objective_terms = []

rows = len(grid)
cols = len(grid[0])

wall = {}
free = {}
horse_pos = None

# Loop 1 - Create variables
for r in range(rows):
    for c in range(cols):
        if grid[r][c] != Tiles.WATER.value:
            wall[(r, c)] = pulp.LpVariable(f"wall_{r}_{c}", cat="Binary")
            free[(r, c)] = pulp.LpVariable(f"free_{r}_{c}", cat="Binary")
            if grid[r][c] == Tiles.HORSE.value:
                horse_pos = (r, c)

# Loop 2 - Add constraints
for r in range(rows):
    for c in range(cols):
        
        if grid[r][c] == Tiles.WATER.value:
            continue
        
        # Horse must be enclosed
        if grid[r][c] == Tiles.HORSE.value:
            prob += free[(r, c)] == 0
        
        # Goal is free
        if grid[r][c] == Tiles.GOAL.value:
            prob += free[(r, c)] == 1
        
        # Only grass can have walls
        if grid[r][c] != Tiles.GRASS.value:
            prob += wall[(r, c)] == 0
        
        # Wall and free cannot both be true + scoring
        if grid[r][c] == Tiles.GRASS.value:
            prob += free[(r, c)] + wall[(r, c)] <= 1
            
            # Grass gives 1 point when enclosed
            objective_terms.append(
                1 - free[(r, c)] - wall[(r, c)]
            )
        
        # Horse gives 1 point
        if grid[r][c] == Tiles.HORSE.value:
            objective_terms.append(1)
        
        # Cherries give 3 bonus points when enclosed
        if grid[r][c] == Tiles.CHERRIES.value:
            prob += wall[(r, c)] == 0
            
            objective_terms.append(
                3 * (1 - free[(r, c)])
            )
        
        # Golden apples give 10 bonus points when enclosed
        if grid[r][c] == Tiles.GAPPLES.value:
            prob += wall[(r, c)] == 0
            
            objective_terms.append(
                10 * (1 - free[(r, c)])
            )
        
        # Bees lose 5 points when enclosed
        if grid[r][c] == Tiles.BEES.value:
            prob += wall[(r, c)] == 0
            
            objective_terms.append(
                -5 * (1 - free[(r, c)])
            )

# Loop 3 - Adjacency
for r in range(rows):
    for c in range(cols):
        
        if grid[r][c] == Tiles.WATER.value:
            continue
        
        for dr, dc in [(0, 1), (1, 0)]:
            
            nr = r + dr
            nc = c + dc
            
            if nr >= rows or nc >= cols:
                continue
            
            if grid[nr][nc] == Tiles.WATER.value:
                continue
            
            # Adjacent tiles must have the same free value unless there is a wall
            prob += (free[(r, c)] >= free[(nr, nc)] - wall[(r, c)] - wall[(nr, nc)])
            prob += (free[(nr, nc)] >= free[(r, c)] - wall[(r, c)] - wall[(nr, nc)])

# Set the maximum number of walls
prob += pulp.lpSum(wall.values()) <= WALL_BUDGET

# Maximise the total score
prob += pulp.lpSum(objective_terms)

prob.solve()

print("Status:", pulp.LpStatus[prob.status])
print("Score:", pulp.value(prob.objective))

for (r, c), var in wall.items():
    if pulp.value(var) == 1:
        print("Wall:", r, c)