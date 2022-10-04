function handleSearch() {
    var searchInput = document.getElementById('search-input');

    postData('/api/search?query=' + searchInput.value, {})
        .then(drawSearchResults);
}

function drawSearchResults(response) {
    var searchInput = document.getElementById('search-result-container');
    searchInput.innerHTML = "";
    var content = "";
    for (var i = 0; i < response.length; i++) {
        content += constructItem(response[i]);
    }
    searchInput.innerHTML = content;
}

function constructItem(item) {
    return '<div class="search-result-item" is_yohoho="' + (item.isYohoho || '') + '" url="' + item.url + '" adapter="' + item.adapter + '" title="' + item.title + '">' +
        '<div onclick="handleSearchItemClick(this)" class="search-result-item-image" style="background: url(' + item.cover + ') no-repeat center center;"></div>' +
        '<div onclick="handleSearchItemClick(this)" class="search-result-item-adapter">' + item.adapter + '</div>' +
        '<div onclick="handleSearchItemClick(this)" class="search-result-item-link">' + item.title + '</div>' +
        '</div>';
}

function handleSearchItemClick(e) {
    var isYohoho = e.parentElement.attributes.is_yohoho.value;
    var url = e.parentElement.attributes.url.value;
    var adapter = e.parentElement.attributes.adapter.value;
    var title = e.parentElement.attributes.title.value;

    if (isYohoho) {
        window.location = url;
    } else {
        window.location = 'movie.html?url=' + url + '&adapter=' + adapter + '&title=' + title;
    }
}
