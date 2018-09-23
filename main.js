/* Setting Vars */
let a_dir, a_col = [0, 0, 0, 255],
	t_dir, t_col = [0, 0, 0, 255],
	g_dir, g_col = [0, 0, 0, 255],
	c_dir, c_col = [0, 0, 0, 255],
	x_dir, x_col = [0, 0, 0, 255],
	
	x_start, y_start,

	canvas_w, canvas_h,
	
	point_offset;


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

	point_offset = parseInt(document.getElementById('offset').value);
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


function start() {
	applySettings();
	cropCanvas(20);
	draw();
}


document.getElementById('btn-start').addEventListener('click', start);


/**
 * Returns an array holding the sequential data.
 * Ignores lines that start with `>` (comments)
 * 
 * @param {string} data
 */
function parseFASTAformat(data) {
	const fasta = [];
	const lines = data.toUpperCase().split('\n');

	for (let i = 0; i < lines.length; i++) {
		// ignore comment lines
		if(lines[i][0] !== '>') {
			for(let j = 0; j < lines[i].length; j++) {
				fasta.push(lines[i][j]);
			}
		}
	}

	return fasta;
}


/**
 * Applies settings, scrolls, hides help text and draws the sequence.
 * @param {File} file 
 */
async function plotFASTAfile(file) {
	applySettings();
	document.getElementById('progress-text').scrollIntoView(true);
	// hide help text
	$('#unplotted-text').addClass('d-none');
	const progress = $('#progress-text>span');
	progress.removeClass('text-success text-danger').addClass('text-info');


	let chunk_size = 1024*1024*4; // 4MB
	let chunk_index = 1;
	let total_chunks = Math.ceil((file.size/chunk_size), chunk_size);
	console.log("There will be", total_chunks, "chunk/s.")

	const scatter_x = [], scatter_y = [];
	const cursor = { x: 0, y: 0 };
	const file_reader = new FileReader();
	let offset = 0;
	let last_point = 0;
	let datarevision = 0;
	while (chunk_index <= total_chunks) {
		console.log('----------------------');
		
		offset = (chunk_index - 1) * chunk_size;
		console.log('Slicing from', offset, 'to', offset + chunk_size);
		let blob = file.slice(offset, (offset + chunk_size));
		const data = await new Promise((resolve, reject) => {
			file_reader.onloadend = (event) => {
				const target = (event.target);
				if (target.error === null) {
					offset += target.result.length;
					resolve(target.result);
				}
				else {
					reject(target.error);
				}
			};
			file_reader.readAsText(blob);
		});
		const fasta_data = parseFASTAformat(data);
		
		for (let i = 0; i < fasta_data.length; i++) {
			switch ( fasta_data[i] ) {
				case 'A':
					moveCursor(a_dir, cursor);
				break;
				case 'T':
					moveCursor(t_dir, cursor);
				break;
				case 'G':
					moveCursor(g_dir, cursor);
				break;
				case 'C':
					moveCursor(c_dir, cursor);
				break;
				default:
					moveCursor(x_dir, cursor);
				break;
			}

			if(last_point % point_offset === 0) {
				// console.log('Added point', cursor);
				scatter_x.push(cursor.x);
				scatter_y.push(cursor.y);
			}

			last_point++;
		}
		
		const plotly_data = [
			{
				type: "scattergl",
				mode: "markers",
				marker: {
					size: 3,
					color: 'rgb(170, 0, 0)',
					// line: {
					// 	width: 1,
					// 	color: 'rgb(0,0,0)'}
				},
				x: scatter_x,
				y: scatter_y
			}
		];

		datarevision += 1;
		const plotly_layout = {
			datarevision: datarevision
		}
		

		Plotly.react('plot', plotly_data, plotly_layout);
		let percentage = ((offset/file.size)*100).toFixed(1) + '%';
		progress.html(percentage);
		document.getElementById('progress-bar').style.width = percentage;
		chunk_index++;
	}
	
	progress.removeClass('text-info').addClass('text-success').html('100%');

	const plot = document.getElementById('plot');
	console.log('----------------------------\nDone plotting. Report:');
	console.log('- The plot holds: (', plot.data[0].x.length, ',', plot.data[0].y.length, ') points.');
	console.log('- Offset:', point_offset,
	',\n- Chunk size:', chunk_size,
	',\n- Chunks:', chunk_index - 1,
	',\n- Total calculated points:', last_point);
}


$('#file').change(() => {
	const file = document.getElementById('file').files[0];
	plotFASTAfile(file);
});

