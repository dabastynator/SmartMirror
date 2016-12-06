var mEndpoint = 'http://192.168.2.11:5061';
var mWeather = 'http://api.openweathermap.org/data/2.5/weather?q=Parsberg,de&appid=';

var mMonthNames = [ "Januar", "Februar", "März", "April", "Mai", "Juni",
		"Juli", "August", "September", "Oktober", "November", "Dezember" ];
var mWeekNames = [ "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag",
		"Samstag", "Sonntag" ];

function initialize() {
	shortloop();
	longloop();
	
	// Setup short refresh loop for 2 seconds
	setInterval(shortloop, 1000 * 2);
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
	var response = httpGet(mWeather + mOpenWeatherKey);
	var temperature = document.getElementById('temperature');
	var icon = document.getElementById('weather_img');
	var celsius = Math.round(response.main.temp - 274);
	var now = Math.floor(new Date().getTime()/1000);
	temperature.innerHTML = celsius + '&deg;';
	var icon_text = '<img width="128px" src="img/';
	var icon_name = '';
	// Respect sunrise-sunset
	if (now > response.sys.sunrise && now < response.sys.sunset)
		icon_name = 'sun';
	else
		icon_name = 'moon';
	// Respect clouds
	if (response.clouds.all > 80)
		icon_name = 'cloud';
	else if (response.clouds.all > 30)
		icon_name += '_cloud';
	// Respect rain and snow
	if (response.rain != null)
		icon_name += '_rain';
	else if (response.snow != null)
		icon_name += '_snow';
	icon_text += icon_name + '.png"/>';
	icon.innerHTML = icon_text;
}

function refreshSwitches() {
	var response = httpGet(mEndpoint + '/switch/list?' + mSecurity);
	var container = document.getElementById('container_switches');
	var content = '<table class="switch">';
	for (var i = 0; i < response.length; i++) {
		var s = response[i];
		if (s.state == "ON") {
			content += '<tr><td><img src="img/lamp.png" width="64px"></td><td>';
			content += s.name;
			content += '</td></tr>';
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
		if (response[0].current_playing != null) {
			container_music.style.visibility = 'visible';
			artist.innerHTML = response[0].current_playing.artist;
			if (response[0].current_playing.title.length > 30)
				song.innerHTML = response[0].current_playing.title.substring(0,
						30)
						+ "...";
			else
				song.innerHTML = response[0].current_playing.title;
			song.innerHTML = response[0].current_playing.title;
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
