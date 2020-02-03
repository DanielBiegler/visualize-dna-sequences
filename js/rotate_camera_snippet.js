var plot = document.getElementById('plot'), camera_x = 0, camera_y = 0, camera_z = 0, interval_num = 0, limit = 250, interval = setInterval(() => {

	camera_x = (0 + 0.85 * Math.cos(2 * Math.PI * interval_num / limit));
    camera_y = (0 + 0.85 * Math.sin(2 * Math.PI * interval_num / limit));
	camera_z = camera_y;

Plotly.relayout('plot', {
	"scene.camera.eye.x": camera_x,
	"scene.camera.eye.y": camera_y,
	"scene.camera.eye.z": camera_z,
});

console.log("Interval " + (interval_num + 1) + "/" + limit);
if(interval_num >= limit - 1) {

clearInterval(interval);

} else {

interval_num += 1;

}

}, 33);
