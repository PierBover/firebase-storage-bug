const fs = require('fs');
const https = require('https');
const path = require('path');

const files = JSON.parse(fs.readFileSync('files.json'));
let currentFileIndex = 0;

function downloadNext(){
	const currentFile = files[currentFileIndex];

	console.log('downloading', currentFile.fileName);

	const request = https.get(currentFile.url);
	request.shouldKeepAlive = false;
	request.setTimeout(10000, () => {
		console.log('Request timeout!', currentFile);
	});

	request.on('response', (response) => {
		const totalBytes = response.headers['content-length'];
		let downloadedBytes = 0;

		if (response.statusCode !== 200) {
			console.log(response.statusCode);
			return;
		}

		response.on('data', (chunk) => {
			downloadedBytes += chunk.length;
			console.log(currentFile.fileName, downloadedBytes / totalBytes);
		});

		response.on('end', () => {
			console.log('end', currentFile.fileName);
			currentFileIndex ++;
			if (currentFileIndex <= files.length) downloadNext();
			else console.log('Done!');
		});

		// uncomment this to save to disk
		// const pathStream = path.join(__dirname, currentFile.fileName);
		// response.pipe(fs.createWriteStream(pathStream));
	});

	request.on('error', (error) => {
		console.log('request error', error);
	});
}

downloadNext();