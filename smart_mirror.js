var mEndpoint = 'http://192.168.2.11:5061';
var mWeather = 'http://api.openweathermap.org/data/2.5/weather?q=Parsberg,de&appid=';

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
	var response = httpGet(mWeather + mOpenWeatherKey);
	var temperature = document.getElementById('temperature');
	var icon = document.getElementById('weather_img');
	var celsius = Math.round(response.main.temp - 274);
	var now = Math.floor(new Date().getTime()/1000);
	temperature.innerHTML = celsius + '&deg;';
	var icon_text = '<img src="img/';
	var icon_name = '';
	// Respect sunrise-sunset
	if (now > response.sys.sunrise && now < response.sys.sunset)
		icon_name = 'sun';
	else
		icon_name = 'moon';
	// Respect clouds
	if (response.clouds.all >= 90)
		icon_name = 'cloud';
	else if (response.clouds.all > 50)
		icon_name += '_cloud';
	else if (response.clouds.all > 10)
	  icon_name += '_cloud_less';
	// Respect rain and snow
	var weather_id = "";
  if (response.weather != null && response.weather.length > 0 &&
			response.weather[0].id != null)
		weather_id = response.weather[0].id + "";
	if (response.rain != null || weather_id.startsWith('5'))
		icon_name += '_rain';
	else if (response.snow != null || weather_id.startsWith('6'))
		icon_name += '_snow';
	icon_text += icon_name + '.png"/>';
	icon.innerHTML = icon_text;
}

function refreshSwitches() {
	var response = httpGet(mEndpoint + '/switch/list?' + mSecurity);
	var container = document.getElementById('container_switches');
	var content = '<table class="switch">';
	response.sort(function(a, b){return a.name.localeCompare(b.name)});
	for (var i = 0; i < response.length; i++) {
		var s = response[i];
		if (s.state == "ON") {
			content += '<tr><td><img src="img/lamp.png"></td><td>';
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
