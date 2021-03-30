let DIS_WIDTH = 1280;
let DIS_HEIGHT = 720;
let FPS = 24;
let debug = true;
let aesthetics = true;

// Dimensions of the square grid, in number of cells.
// Choose an even number so it aligns with display pixels
// (gets divided by 2 to determine top left start coordinates).
let GRID_SIZE = 98;
// Dimensions of each square cell, in pixels.
// Choose an integer so it aligns with display pixels.
let CELL_SIZE = 5;
let grid = [];
let states = [];
let STATE_RANGE = 4; // Number of colours to use, from beginning.
let MUTATION_RATE = 0.3; // Chance of a cell switching to a random state.
// 'Radius' of square sub-grid which each cell considers before switching state.
// Don't make this too big, or it will take up too much compute.
let OFFSET_BOUND = 5;
// Does a cell switch to the state of the majority or the minority
// within the local sub-grid?
let MAJORITY_RULES = true;

function setup() {
    createCanvas(DIS_WIDTH, DIS_HEIGHT);
    frameRate(FPS);
    states = [
        color('rgba(220, 33, 77, 1)'), // Amaranth
        color('rgba(24, 153, 193, 1)'), // Eastern Blue
        color('rgba(29, 201, 156, 1)'), // Caribbean Green
        color('rgba(255, 200, 69, 1)'), // Bright Sun

    ];
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            row.push(Math.floor(Math.random() * STATE_RANGE));
        }
        grid.push(row);
    }

}

function draw() {
    background(20);
    noStroke();
    display_grid(grid, GRID_SIZE, CELL_SIZE, states);
    grid = update_grid(grid, GRID_SIZE, STATE_RANGE, MUTATION_RATE, OFFSET_BOUND, MAJORITY_RULES);
}

function update_grid(grid, grid_size, state_range, mutation_rate, offset_bound, majority_rules) {
    let updated_grid = deepCopy(grid);
    for (let row = 0; row < grid_size; row++) {
        for (let col = 0; col < grid_size; col++) {
            // For each cell:
            let state_count = [];
            for (let state = 0; state < state_range; state++) {
                state_count.push(0);
            }
            for (let row_off = -offset_bound; row_off <= offset_bound; row_off++) {
                for (let col_off = -offset_bound; col_off <= offset_bound; col_off++) {
                    // For each cell in 3x3 grid around this cell
                    // including this cell itself:
                    if (row + row_off >= 0 && row + row_off < grid_size
                        && col + col_off >= 0 && col + col_off < grid_size) {
                        // If cell is within the main grid:
                        if (Math.random() <= mutation_rate) {
                            state_count[Math.floor(Math.random() * state_range)] += 1;
                        } else {
                            state_count[grid[row + row_off][col + col_off]] += 1;
                        }
                    }
                }
            }
            // Put updated cell in new grid.
            if (majority_rules) {
                updated_grid[row][col] = get_index_of_largest_value(state_count);
            } else {
                updated_grid[row][col] = get_index_of_smallest_non_zero_value(state_count);
            }
        }
    }
    return updated_grid;
}

function display_grid(grid, grid_size, cell_size, colours) {
    noStroke();
    let top_left = [(DIS_WIDTH / 2) - (grid_size * cell_size) / 2, (DIS_HEIGHT / 2) - (grid_size * cell_size) / 2];
    for (let row = 0; row < grid_size; row++) {
        for (let col = 0; col < grid_size; col++) {
            // Fill colour is colour in colours indexed by the value in the grid.
            fill(colours[grid[row][col]]);
            square(top_left[0] + cell_size * col, top_left[1] + cell_size * row, cell_size);
        }
    }
}

// Returns index with the largest value in object.
// If multiple indices have the same value, choose between them randomly.
function get_index_of_largest_value(arr) {
    let indices_of_largest = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == max(arr)) {
            indices_of_largest.push(i);
        }
    }
    return indices_of_largest[Math.floor(Math.random() * indices_of_largest.length)];
}

// Returns index with the smallest non-zero value in object.
// If multiple indices have the same value, choose between them randomly.
function get_index_of_smallest_non_zero_value(arr) {
    // Replace each 0 with Infinity.
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == 0) {
            arr[i] = Infinity;
        }
    }
    // Find indices with the smallest non-zero value.
    let indices_of_smalles_non_zero = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == min(arr)) {
            indices_of_smalles_non_zero.push(i);
        }
    }
    return indices_of_smalles_non_zero[Math.floor(Math.random() * indices_of_smalles_non_zero.length)];
}

const deepCopy = (arr) => {
    let copy = [];
    arr.forEach(elem => {
        if (Array.isArray(elem)) {
            copy.push(deepCopy(elem))
        } else {
            if (typeof elem === 'object') {
                copy.push(deepCopyObject(elem))
            } else {
                copy.push(elem)
            }
        }
    })
    return copy;
}
// Helper function to deal with Objects
const deepCopyObject = (obj) => {
    let tempObj = {};
    for (let [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            tempObj[key] = deepCopy(value);
        } else {
            if (typeof value === 'object') {
                tempObj[key] = deepCopyObject(value);
            } else {
                tempObj[key] = value
            }
        }
    }
    return tempObj;
}

loopBool = true;
function keyPressed() {
    if (key == " ") {
        if (loopBool) {
            noLoop();
            loopBool = !loopBool;
        } else {
            loop();
            loopBool = !loopBool;
        }
    } else if (key == 'd') {
        debug = !debug;
    } else if (key == 'a') {
        aesthetics = !aesthetics;
    }
}
