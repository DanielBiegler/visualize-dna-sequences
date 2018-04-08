/* Setting Vars */
var a_dir, a_col = [0, 0, 0, 255],
	t_dir, t_col = [0, 0, 0, 255],
	g_dir, g_col = [0, 0, 0, 255],
	c_dir, c_col = [0, 0, 0, 255],
	x_dir, x_col = [0, 0, 0, 255],
	
	x_start, y_start,

	canvas_w, canvas_h,
	
	dna_seq;


/**
 * Prints all the settings.
 * 
 * For debugging purposes.
 */
function printSettings() {
	console.log(
		'a_dir:', a_dir, ', a_col:', a_col, '\n',
		't_dir:', t_dir, ', t_col:', t_col, '\n',
		'g_dir:', g_dir, ', g_col:', g_col, '\n',
		'c_dir:', c_dir, ', c_col:', c_col, '\n', 
		'x_dir:', x_dir, 'x_col:', x_col, '\n', '\n',

		'x_start:', x_start, ', y_start:', y_start, '\n', 
		
		'canvas_w:', canvas_w, ', canvas_h:', canvas_h, '\n', '\n',

		'dna_seq:', dna_seq
	);
}


/**
 * Converts color hex strings to numbers  
 * 
 * @param {string} hex 
 * 
 * @returns {Array} array holding [R, G, B]
 */
function hexToRGB(hex) {
	let r = parseInt(hex.slice(1, 3), 16),
		g = parseInt(hex.slice(3, 5), 16),
		b = parseInt(hex.slice(5, 7), 16);

	return [r, g, b];
}


/**
 * Takes whats supplied in the inputs and applies it to global variables.
 */
function applySettings() {
	a_dir = document.getElementById('a-dir').value;
	[a_col[0], a_col[1], a_col[2], ] = hexToRGB(document.getElementById('a-col').value);

	t_dir = document.getElementById('t-dir').value;
	[t_col[0], t_col[1], t_col[2], ] = hexToRGB(document.getElementById('t-col').value);

	g_dir = document.getElementById('g-dir').value;
	[g_col[0], g_col[1], g_col[2], ] = hexToRGB(document.getElementById('g-col').value);

	c_dir = document.getElementById('c-dir').value;
	[c_col[0], c_col[1], c_col[2], ] = hexToRGB(document.getElementById('c-col').value);

	x_dir = document.getElementById('x-dir').value;
	[x_col[0], x_col[1], x_col[2], ] = hexToRGB(document.getElementById('x-col').value);

	document.getElementById('canvas-main').width = document.getElementById('canvas-w').value;
	document.getElementById('canvas-main').height = document.getElementById('canvas-h').value;
	
	x_start = parseInt(document.getElementById('x-coord').value);
	y_start = parseInt(document.getElementById('y-coord').value);

	canvas_w = document.getElementById('canvas-main').width;
	canvas_h = document.getElementById('canvas-main').height;

	dna_seq = document.getElementById('dna-seq').value.toUpperCase();
}


/**
 * Moves the cursor X and Y coordinates.
 * 
 * @param {string} direction 
 * In which direction the cursor should move. 
 * Either N, E, S, W or defaults to not moving the cursor.
 * 
 * @param {Object} cursor 
 * The cursor of which you want to change
 * @param {number} cursor.x X coordinate
 * @param {number} cursor.y Y coordinate 
 * 
 */
function moveCursor(direction, cursor) {
	switch (direction) {
		case 'N':
			cursor.y -= 1;
			break;
		case 'E':
			cursor.x += 1;
			break;
		case 'S':
			cursor.y += 1;
			break;
		case 'W':
			cursor.x -= 1;
		default:
			break;
	}
}


/**
 * Draws the DNA sequence.
 * 
 * It uses the global variables, so make sure to call `applySettings()`
 * before you call this unless you know what you're doing.
 */
function draw() {
	const ctx = document.getElementById('canvas-main').getContext('2d');
	let img_data = ctx.createImageData(canvas_w, canvas_h);
	let cursor = {x: x_start, y: y_start};

	for (let index = 0, col = [255, 0, 0, 255]; index < dna_seq.length; index++) {
		switch (dna_seq.charAt(index)) {
			case 'A':
				moveCursor(a_dir, cursor);
				[col[0], col[1], col[2], ] = a_col;
				break;
			case 'T':
				moveCursor(t_dir, cursor);
				[col[0], col[1], col[2], ] = t_col;
				break;
			case 'G':
				moveCursor(g_dir, cursor);
				[col[0], col[1], col[2], ] = g_col;
				break;
			case 'C':
				moveCursor(c_dir, cursor);
				[col[0], col[1], col[2], ] = c_col;
				break;
			default:
				[col[0], col[1], col[2], ] = x_col;
				break;
		}

		const color_indices = getColorIndicesForCoord(cursor.x, cursor.y, canvas_w);
		const [r_index, g_index, b_index, a_index] = color_indices;

		[img_data.data[r_index], img_data.data[g_index], img_data.data[b_index], img_data.data[a_index]] = col;

	}
	
	ctx.putImageData(img_data, 0, 0);
}


function getColorIndicesForCoord(x, y, width) {
	var c = y * (width * 4) + x * 4;
	return [c, c + 1, c + 2, c + 3]; /* r, g, b, a */
}


function start() {
	applySettings();
	draw();
}


document.getElementById('btn-start').addEventListener('click', start);