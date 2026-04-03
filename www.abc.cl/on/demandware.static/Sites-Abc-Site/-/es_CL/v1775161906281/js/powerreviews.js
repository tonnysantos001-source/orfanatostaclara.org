(function () {
    const interval = 1000;
    const maxAttempts = 30;
    var apiLoadAttempts = 0;
    var intervalPR;
    var tilesRendered = [];
    var render = function (foo) {
        var tiles = document.querySelectorAll('[data-pwr-itemid]');
        var prStruct = [];
        var tile;
        var i;
        var pageIdValue;
        var uniqueId;
        var reviewObj;

        var mergeObjects = function mergeObjects() {
            var resObj = {};
            var j;
            var obj;
            var keys;

            for (var x = 0; x < arguments.length; x += 1) {
                obj = arguments[x];
                keys = Object.keys(obj);

                for (j = 0; j < keys.length; j += 1) {
                    resObj[keys[j]] = obj[keys[j]];
                }
            }
            return resObj;
        };

        for (i = 0; i < tiles.length; i++) {
            tile = tiles[i];
            var shouldDisplayProductRating = tile.attributes['data-pwr-display-ratings'] ? tile.attributes['data-pwr-display-ratings'].value : "true";

            if (tilesRendered.indexOf(tile) !== -1) {
                continue; // eslint-disable-line
            }
            pageIdValue = tile.attributes['data-pwr-itemid'].value;
            uniqueId = 'category-snippet-'.concat(Math.random().toString(36).substr(2, 16));
            tile.attributes.id.value = uniqueId;

            if (shouldDisplayProductRating != "false" && tile.attributes['data-pwr-itemid'] && tile.attributes['data-pwr-itemid'].value) {
                reviewObj = mergeObjects({}, window.POWER_REVIEWS_CONFIG, {
                    page_id: pageIdValue,
                    components: {
                        CategorySnippet: uniqueId
                    }
                });
                if (tile.className.indexOf('pwr-pdp') !== -1) {
                    reviewObj.components = {
                        ReviewSnippet: uniqueId
                    };
                }
                prStruct.push(reviewObj);
            }
            tilesRendered.push(tile);
        }

        /* global POWERREVIEWS */
        POWERREVIEWS.display.render(prStruct);
    };

    var debounce = function (func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            var later = function () {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Check if Power Reviews is already loaded before try to initialize it
     */
    function checkIfApiIsLoaded() {
        apiLoadAttempts++;
        if (window.POWERREVIEWS) {
            clearInterval(intervalPR);
            render();
            window.PWR_RENDER = debounce(render, 50);
        } else if (apiLoadAttempts > maxAttempts) {
            clearInterval(intervalPR);
        }
    }

    intervalPR = setInterval(checkIfApiIsLoaded, interval);
}());






