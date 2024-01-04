/*
SmartMirror Javascript to get content and display in the document.
Define following variables in a separate smart_config.js file
var mEndpoint = ...
var mSecurity = ...
var mHASKey = ...
var mHASEndpoint = ...
*/

var mMonthNames = [ "Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni",
		"Juli", "August", "September", "Oktober", "November", "Dezember" ];
var mWeekNames = [ "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", 
		"Freitag", "Samstag" ];

function initialize() {
	shortloop();
	longloop();
	
	// Setup short refresh loop for 5 seconds
	setInterval(shortloop, 1000 * 5);
	// Setup short refresh loop for 5 minutes
	setInterval(longloop, 1000 * 60 * 5);
}

function shortloop() {
	refreshDate();
	refreshMusic();
	refreshSwitches();
}

function longloop() {
	refreshWeather();
}

function refreshWeather() {
	var response = httpGet(mEndpoint + '/information/info?key=weather&' + mSecurity);
	var temperature = document.getElementById('temperature');
	var icon = document.getElementById('weather_img');
	temperature.innerHTML = Math.round(response.celsius) + '&deg;';
	var icon_text = '<img src="img/';
	var icon_name = '';
	// Respect sunrise-sunset
	if (response.day_night == 'Day')
		icon_name = 'sun';
	else
		icon_name = 'moon';
	// Respect clouds
	if (response.clouds >= 90)
		icon_name = 'cloud';
	else if (response.clouds > 50)
		icon_name += '_cloud';
	else if (response.clouds > 10)
	  icon_name += '_cloud_less';
	// Respect rain and snow
	if (response.rain != null && response.rain)
		icon_name += '_rain';
	else if (response.snow != null && response.snow)
		icon_name += '_snow';
	icon_text += icon_name + '.png"/>';
	icon.innerHTML = icon_text;
}

function refreshSwitches() {
	var response = httpGet(mEndpoint + '/switch/list?' + mSecurity);
	var hasStates = getHASStates();
	var container = document.getElementById('container_switches');
	var sunContainer = document.getElementById('sun_power');
	var content = '<table class="bottom">';
	response.sort(function(a, b){return a.name.localeCompare(b.name)});
	for (var i = 0; i < response.length; i++) {
		var s = response[i];
		if (s.state == "ON") {
			content += '<tr><td><img src="img/lamp.png"></td><td>';
			content += s.name;
			content += '</td></tr>';
		}
	}
	for (var i = 0; i < hasStates.length; i++) {
		var s = hasStates[i];
		if (s.entity_id == "sensor.garage_door") {
			if (s.state == "closed"){
				content += '<tr><td><img src="img/cover_closed.png"></td><td>';
				content += "Garage geschlossen";
				content += '</td></tr>';
			}else{
				content += '<tr><td><img src="img/cover_open.png"></td><td>';
				content += "Garage offen";
				content += '</td></tr>';
			}
		}
		if (s.entity_id == "sensor.rct_power_storage_generator_a_energy_production_day") {
			var sunContent = Math.round(s.state / 100) / 10 + " kWh";
			sunContainer.innerHTML = sunContent;
		}
	}
	content += '</table>';
	container.innerHTML = content;
}

function refreshMusic() {
	var response = httpGet(mEndpoint + '/mediaserver/list?' + mSecurity);
	var artist = document.getElementById('artist');
	var song = document.getElementById('song');
	var container_music = document.getElementById('container_music');
	if (artist != null && song != null && container_music != null) {
		var playing = response[0].current_playing;
		artist.innerHTML = '';
		song.innerHTML = '';
		if (playing != null) {
			container_music.style.visibility = 'visible';
			if (playing.artist != null)
				artist.innerHTML = playing.artist;
			
			if (playing.title != null){
				if (playing.title.length > 30)
					song.innerHTML = playing.title.substring(0,
							30)
							+ "...";
				else
					song.innerHTML = playing.title;
			}

			if (playing.artist == null && playing.title == null && playing.file != null){
				song.innerHTML = playing.file;
			}
		} else {
			container_music.style.visibility = 'hidden';
		}
	}
}

function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.send(null);
	var response = xmlHttp.responseText;
	return JSON.parse(response);
}

function getHASStates(){
	var theUrl = mHASEndpoint + '/api/states';
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.setRequestHeader('Authorization','Bearer ' + mHASKey);
	xmlHttp.send(null);
	var response = xmlHttp.responseText;
	return JSON.parse(response);
}

function refreshDate() {
	var now = new Date();
	var time = document.getElementById('time');
	if (time != null) {
		var text = now.getHours() + ':' + now.getMinutes();
		if (now.getMinutes() < 10)
			text = now.getHours() + ':0' + now.getMinutes();
		time.innerHTML = text;
	}
	var date = document.getElementById('date');
	if (date != null) {
		date.innerHTML = mWeekNames[now.getDay()] + ', ' + now.getDate() + '. '
				+ mMonthNames[now.getMonth()];
	}
}
