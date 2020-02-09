function load() {
    var url = getParameterByName('url');
    var adapter = getParameterByName('adapter');
    var title = getParameterByName('title');

    var headerElement = document.getElementById("part-name");
    headerElement.innerHTML = title;

    loadParts(url, adapter);
}

function loadParts(url, adapter) {
    postData('/api/getParts/' + adapter, {url})
        .then(function (parts) {
            drawParts(parts, adapter);
        });
}

function drawParts(parts, adapter) {
    if (parts.length === 1 && parts[0].iframe) {
        // hide all parts/variants/subParts/player
        var player = document.getElementById('player');
        var partsContainer = document.getElementById('parts-container');
        var variantsContainer = document.getElementById('variants-container');
        var subPartsContainer = document.getElementById('subParts-container');
        var optionsHeader = document.getElementById('options-header');

        [player, partsContainer, variantsContainer, subPartsContainer, optionsHeader].forEach(function (controller) {
            controller.style.display = 'none';
        });

        var iframeContainer = document.getElementById('iframe-container');
        iframeContainer.innerHTML = parts[0].iframeHtml;

        return;
    }

    var partsContainer = document.getElementById('parts-container');
    partsContainer.innerHTML = "";
    var content = "";
    for (var i = 0; i < parts.length; i++) {
        content += drawPart(parts[i], adapter, i + 1);
    }

    partsContainer.innerHTML = content;

    if (parts.length > 0) {
        loadVariants(parts[0], adapter)
    }
}

function drawPart(part, adapter, id) {
    return '<option adapter="' + adapter + '" url="' + part.url + '">' + id + '</option>';
}

function handlePartChange() {
    var partsContainer = document.getElementById('parts-container');
    var currentPart = partsContainer.options[partsContainer.selectedIndex];
    var url = currentPart.attributes.url.value;
    var adapter = currentPart.attributes.adapter.value;

    loadVariants(url, adapter);
}

function loadVariants(url, adapter) {
    postData('/api/getVariants/' + adapter, {url})
        .then(function (variants) {
            drawVariants(variants, adapter);
        })
}

function drawVariants(variants, adapter) {
    var variantsContainer = document.getElementById('variants-container');
    variantsContainer.innerHTML = "";
    var content = "";
    for (var i = 0; i < variants.length; i++) {
        content += drawVariant(variants[i], adapter);
    }

    variantsContainer.innerHTML = content;

    if (variants.length > 0) {
        loadSubParts(variants[0].url, adapter)
    }
}

function drawVariant(variant, adapter) {
    return '<option url="' + variant.url + '" adapter="' + adapter + '">' + variant.name + '</option>';
}

function handleVariantChange() {
    // get link
    var variantsContainer = document.getElementById('variants-container');
    var currentVariant = variantsContainer.options[variantsContainer.selectedIndex];
    var url = currentVariant.attributes.url.value;
    var adapter = currentVariant.attributes.adapter.value;

    loadSubParts(url, adapter);
}

function loadSubParts(url, adapter) {
    postData('/api/getSubParts/' + adapter, {url})
        .then(drawSubParts)
}

function drawSubParts(subParts) {
    var subPartsContainer = document.getElementById('subParts-container');
    subPartsContainer.innerHTML = "";
    var content = "";
    for (var i = 0; i < subParts.length; i++) {
        content += drawSubPart(subParts[i]);
    }

    subPartsContainer.innerHTML = content;

    // preload first sub part
    handleSubPartChange();
}

function drawSubPart(subPart) {
    return '<option title="' + subPart.title + '" link="' + subPart.link + '">' + subPart.title + '</option>';
}

function handleSubPartChange() {
    // get link
    var subPartContainer = document.getElementById('subParts-container');
    var currentSubPart = subPartContainer.options[subPartContainer.selectedIndex];

    // handle no parts selected case
    if (currentSubPart == null) {
        return;
    }

    var link = currentSubPart.attributes.link.value;
    var title = currentSubPart.attributes.title.value;

    // update player
    var player = document.getElementById('player');
    player.pause();
    player.setAttribute("src", link);

    // update sub part name name
    var subPartName = document.getElementById('subPart-name');
    subPartName.innerHTML = title;
}

function handleSubPartEnded() {
    // increase selected index
    var subPartContainer = document.getElementById('subParts-container');
    subPartContainer.selectedIndex = subPartContainer.selectedIndex + 1;

    // call handler to load video
    handleSubPartChange();

    // load and play next sub part
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

function handleBack() {
    window.location = '/';
}