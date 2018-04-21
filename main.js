/* Setting Vars */
let a_dir, a_col = [0, 0, 0, 255],
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

	dna_seq = document.getElementById('dna-seq').value.toUpperCase();
}

/**
 * Uses the `dna_seq` to determine a canvas size that fits the sequence.
 * 
 * It has to run through the `dna_seq` once.
 * 
 * After the calculations are done, the canvas gets set to a fitting size.
 * 
 * @param {Number} offset For making the canvas a bit bigger for aesthetics
 */
function cropCanvas(offset) {
	// cursor here means the currently active position and its height/width
	let cursor_height = cursor_width = 0;
	let height_up = height_down = width_left = width_right = 0; 

	/**
	 * Helper function for setting the cursor_[height/width] properly
	 */
	function setCursor(direction) {
		switch (direction) {
			case 'N':
				cursor_height += 1;
				break;
			case 'NE':
				cursor_height += 1;
				cursor_width += 1;
				break;
			case 'NW':
				cursor_height += 1;
				cursor_width  -= 1;
				break;
			case 'E':
				cursor_width += 1;
				break;
			case 'S':
				cursor_height -= 1;
				break;
			case 'SE':
				cursor_height -= 1;
				cursor_width  += 1;
				break;
			case 'SW':
				cursor_height -= 1;
				cursor_width  -= 1;
				break;
			case 'W':
				cursor_width -= 1;
			default:
				break;
		}
	}

	for(let i = 0; i < dna_seq.length; i++) {
		switch (dna_seq.charAt(i)) {
			case 'A':
				setCursor(a_dir);
				break;
			case 'T':
				setCursor(t_dir);
				break;
			case 'G':
				setCursor(g_dir);
				break;
			case 'C':
				setCursor(c_dir);
				break;
			default:
				setCursor(x_dir);
				break;
		}

		// check with 2 seperate ifs because diagonal direction is possible
		if(cursor_height > height_up) {
			height_up = cursor_height;
		}
		else if(cursor_height < height_down) {
			height_down = cursor_height;
		}
		
		if(cursor_width > width_right) {
			width_right = cursor_width;
		}
		else if(cursor_width < width_left) {
			width_left = cursor_width;
		}

	}
	
	// height_down and width_left are either zero or negative now
	let min_height = height_up + Math.abs(height_down);
	let min_width = width_right + Math.abs(width_left);

	// now crop canvas and set global variables
	document.getElementById('canvas-main').width  = canvas_w = min_width + offset * 2;
	document.getElementById('canvas-main').height = canvas_h = min_height + offset * 2;
	x_start = Math.abs(width_left) + offset;
	y_start = min_height + height_down + offset;
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
			break;
		case 'NE':
			cursor.x += 1;
			cursor.y -= 1;
			break;
		case 'NW':
			cursor.x -= 1;
			cursor.y -= 1;
			break;
		case 'SE':
			cursor.x += 1;
			cursor.y += 1;
			break;
		case 'SW':
			cursor.x -= 1;
			cursor.y += 1;
			break;
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
				moveCursor(x_dir, cursor);
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
	let c = y * (width * 4) + x * 4;
	return [c, c + 1, c + 2, c + 3]; /* r, g, b, a */
}


function start() {
	applySettings();
	cropCanvas(20);
	draw();
}


document.getElementById('btn-start').addEventListener('click', start);


/**
 * 
 * @param {*} file The file from an HTML Input type=file.
 * @param {number} chunk_size How big one read block is in bytes.
 * @param {function} callback Gets called per read block. The callback gets the read block passed into, use it.
 */
function parseFile(file, chunk_size, callback) {
	let offset = 0;

	/**
	 * Initializes the FileReader, which will call our handler after reading/failing.
	 */
	const read_block = () => {
		let reader = new FileReader();
		let blob = file.slice(offset, chunk_size + offset);
		reader.onload = read_block_handler;
		reader.readAsText(blob);
	}
	
	const progress = $('#progress>span');
	progress.removeClass('text-success text-danger').addClass('text-info');
	
	/**
	 * Passes the now read block to the callback for processing.
	 * 
	 * Afterwards updates the progress bar.
	 * 
	 * After that, the reader is available for reading again, which we call.
	 * 
	 * @param {*} event 
	 */
	const read_block_handler = (event) => {
		if(event.target.error == null) {
			offset += event.target.result.length;
			callback(event.target.result); // callback for handling read chunk
			progress.html(((offset/file.size)*100).toFixed(1) + '%');
		} 
		else {
			progress.removeClass('text-info').addClass('text-danger').html('ERROR!');
			console.log("Read error: " + event.target.error);
			return;
		}
		if(offset >= file.size) {			
			progress.removeClass('text-info').addClass('text-success').html('100%');
			console.log("Done reading");
			return;
		}
		
		// next chunk
		read_block(offset, chunk_size);
	}
	
	// warning: "recursive"! read_block => handler => read_block => ...
	read_block();
}


$('#file').change(() => {
	const file = document.getElementById('file').files[0];
	const chunk_size = 2048 * 1024;
	parseFile(file, chunk_size, (data_chunk) => {
		console.log("Chunk read!");
		// console.log(data_chunk);
	});

});

