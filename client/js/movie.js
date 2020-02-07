function load() {
    var url = getParameterByName('url');
    var adapter = getParameterByName('adapter');
    var title = getParameterByName('title');

    var headerElement = document.getElementById("movie-name");
    headerElement.innerHTML = title;

    postData('/api/getParts/' + adapter, {url})
        .then(function (seasons) {
            drawSeasons(seasons, adapter);
        });
}

function drawSeasons(seasons, adapter) {
    var seasonsContainer = document.getElementById('seasons-container');
    seasonsContainer.innerHTML = "";
    var content = "";
    for (var i = 0; i < seasons.length; i++) {
        content += drawSeason(seasons[i], adapter, i + 1);
    }

    seasonsContainer.innerHTML = content;

    if (seasons.length > 0) {
        loadLanguages(seasons[0], adapter)
    }
}

function drawSeason(season, adapter, id) {
    return '<div onclick="handleSeasonItemClick(this)" adapter="' + adapter + '" url="' + season.url + '" class="season-item">' + id + '</div>';
}

function handleSeasonItemClick(e) {
    var url = e.attributes.url.value;
    var adapter = e.attributes.adapter.value;

    loadLanguages(url, adapter);
}

function loadLanguages(url, adapter) {
    postData('/api/getLanguage/' + adapter, {url})
        .then(function (languages) {
            drawLanguages(languages, adapter);
        })
}

function drawLanguages(languages, adapter) {
    var languageContainer = document.getElementById('language-container');
    languageContainer.innerHTML = "";
    var content = "";
    for (var i = 0; i < languages.length; i++) {
        content += drawLanguage(languages[i], adapter);
    }

    languageContainer.innerHTML = content;

    if (languages.length > 0) {
        loadSeason(languages[0].url, adapter)
    }
}

function drawLanguage(language, adapter) {
    return '<option class="serie-item" url="' + language.url + '" adapter="' + adapter + '">' + language.language + '</option>';
}

function handleLanguageChange() {
    // get link
    var languageContainer = document.getElementById('language-container');
    var currentLanguage = languageContainer.options[languageContainer.selectedIndex];
    var url = currentLanguage.attributes.url.value;
    var adapter = currentLanguage.attributes.adapter.value;

    loadSeason(url, adapter);
}

function loadSeason(url, adapter) {
    postData('/api/getSubParts/' + adapter, {url})
        .then(drawSeries)
}

function drawSeries(series) {
    var seriesContainer = document.getElementById('series-container');
    seriesContainer.innerHTML = "";
    var content = "";
    for (var i = 0; i < series.length; i++) {
        content += drawSerie(series[i]);
    }

    seriesContainer.innerHTML = content;

    // preload first serie
    handleSerieChange();
}

function drawSerie(serie) {
    return '<option class="serie-item" title="' + serie.title + '" link="' + serie.link + '">' + serie.title + '</option>';
}

function handleSerieChange() {
    // get link
    var seriesContainer = document.getElementById('series-container');
    var currentSerie = seriesContainer.options[seriesContainer.selectedIndex];
    var link = currentSerie.attributes.link.value;
    var title = currentSerie.attributes.title.value;

    // update player
    var player = document.getElementById('player');
    player.pause();
    player.setAttribute("src", link);
    // player.innerHTML = '<source src="' + link + '">';

    // update serie name
    var serieName = document.getElementById('serie-name');
    serieName.innerHTML = title;
}

function handleSerieEnded() {
    // increase selected index
    var seriesContainer = document.getElementById('series-container');
    seriesContainer.selectedIndex = seriesContainer.selectedIndex + 1;

    // call handler to load video
    handleSerieChange();

    // load and play next serie
    var player = document.getElementById('player');
    player.play();

}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}