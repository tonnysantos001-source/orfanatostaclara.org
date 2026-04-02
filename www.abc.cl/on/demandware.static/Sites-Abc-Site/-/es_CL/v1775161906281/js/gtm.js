/** DISCLAIMER
* "Property of OSF Global Services, Inc., (with its brand OSF Commerce). OSF remains the sole owner of all right, title and interest in the software. 
* Do not copy, reverse engineer or otherwise attempt to derive or obtain information about the functioning, manufacture or operation therein."
*/

"use strict";

let liveClick = [];

class GTMController {
    /**
     * function to push data to the dataLayer, and add hash
     * @param {Object} data - data to push
     */
    static hashPush(data) {
        if (data) {
            if (data.eventTypes) {
                delete data.eventTypes;
            }
            if ((location.hash.indexOf(data.event + 'gtm') == -1)) {
                dataLayer.push(data);
            }
        }
    }

    /**
     * Parse the data object into json
     * @param {String} data
     * @returns {Object} jsonObject
     */
    static parseJSON(data) {
        let parsedJson = {};
        try {
            parsedJson = JSON.parse(data);
        } catch (error) {
            parsedJson = JSON.parse(data.replace(/'/gi,'"').replace(/\\"/,"'"));
        }
        if (parsedJson !== null && typeof parsedJson.label !== 'undefined' && parsedJson.label.length == 0) {
            parsedJson.label = window.location.href;
        }
        return parsedJson;
    }
    /**
     * check data type and parse string into JSON
     * @param {Object} data - data to push
     */
    static dataPush(data) {
        if ((typeof(data) === 'string') && (data != "")) {
            if((data != null) || (data != 'null')) {
                data = GTMController.parseJSON(decodeURIComponent(data));
                GTMController.hashPush(data);
            }
        } else {
            GTMController.hashPush(data);
        }
    }

    /**
     * Update the property list_id to product recommendations
     * @param {Object} product - The plain product object
     * @returns {void}
     */
    static replaceProductListIdPlaceholders (product) {
        const $sku = document.getElementsByClassName('sku-code-value');
        const skuValue = $sku.length > 0 ? $sku.item(0).dataset.sku : null;
        const $breadcrumb = document.getElementsByClassName('js-gtm-recommendation-list');
        if ($breadcrumb.length > 0) {
            let listId = $breadcrumb.item(0).getAttribute('data-gtm-recommendation-list');
            listId += (skuValue ? ' > ' + skuValue : '');
            listId += ' > Recomendados';

            if (!listId.startsWith('Inicio >')) {
                listId = 'Inicio > ' + listId;
            }

            product.list_id = listId;
        }
    }

    /**
     * find, parse and add to dataLayer data-gtm from all tags in node
     * @param {Object} node - DOM node, inside which will be search
     */
    static findAllDataDOM(node) {
        let allGTMData = node.querySelectorAll('[data-gtm]'),
            impressionsContainer = [],
            dataCollectionObj = {};

        if (!allGTMData.length) {
            return false;
        }

        for (let i = 0; i < allGTMData.length; i++) {
            let tempNode = allGTMData[i];
            dataCollectionObj = GTMController.parseJSON(tempNode.getAttribute('data-gtm'));

            if (!dataCollectionObj || !dataCollectionObj.eventTypes || !dataCollectionObj.event) {
                break;
            }

            let eventTypes = dataCollectionObj.eventTypes.split(',');

            if (eventTypes.indexOf('show') != -1) {
                if (dataCollectionObj.event.indexOf('show') == -1) {
                    dataCollectionObj.event = 'show' + dataCollectionObj.event;
                }
            if (dataCollectionObj.event == 'showImpressionsUpdate') {
                    // Do not push cloned slides to dataLayer because the data is already pushed from the original slides, if (!tempNode.closest('.slick-cloned'))
                    if (dataCollectionObj.isRecommendation) {
                        GTMController.replaceProductListIdPlaceholders(dataCollectionObj.ecommerce.impressions);
                        delete dataCollectionObj.isRecommendation;
                    }
                    impressionsContainer.push(dataCollectionObj.ecommerce.impressions);
                } else {
                    GTMController.dataPush(dataCollectionObj);
                }
                tempNode.removeAttribute('data-gtm');
            }
        }

        if (impressionsContainer.length > 0) {
            let dataLayerObj = {
                'event' : 'showImpressionsUpdate',
                'ecommerce': {}
            };
            dataLayerObj.ecommerce.impressions = impressionsContainer;
            GTMController.dataPush(dataLayerObj);
        }
    }

    /**
     *  if 'link' option enable, set same 'data-gtm' to all node childNodes,
     *  to have the same event in clickListenerRun and hoverListenerRun
     */
    static handleLinks(node) {
        const allGTMData = node.querySelectorAll('[data-gtm]');

        if (!allGTMData.length) {
            return false;
        }

        function setChildData(childs, data) {
            for (let i = 0; i < childs.length; i++) {
                if (childs[i].nodeType == 1) {
                    childs[i].setAttribute('data-gtm', data);
                    if (childs[i].childNodes.length) {
                        setChildData(childs[i].childNodes, data);
                    }
                }
            }
        }

        for (let i = 0; i < allGTMData.length; i++) {
            let tempNode = allGTMData[i];
            const dataStr = tempNode.getAttribute('data-gtm'),
                  dataObj = GTMController.parseJSON(dataStr);

            if (!dataObj) break;

            if (typeof dataObj.eventTypes !== 'undefined' && dataObj.eventTypes.indexOf('link') != -1) {
                if (tempNode.childNodes.length) {
                    setChildData(tempNode.childNodes, dataStr);
                }
            }

            if (typeof dataObj.eventTypes !== 'undefined' && dataObj.eventTypes.indexOf('add') != -1) {
                let dynamicNodes = document.querySelectorAll(dataObj.selector);
                if (dynamicNodes.length) {
                    for (let j = 0; j < dynamicNodes.length; j++) {
                        let tempDynamicNode = dynamicNodes[j];
                        let dataObj = GTMController.parseJSON(dataStr);
                        let eventTypes = dataObj.eventTypes.split(',');
                        eventTypes.splice(eventTypes.indexOf('add'), 1);
                        dataObj.eventTypes = eventTypes.join(',');
                        tempDynamicNode.setAttribute('data-gtm', JSON.stringify(dataObj));
                    }
                    tempNode.removeAttribute('data-gtm');
                }
            }
        }
    }

    /**
     * run AJAX listener, to find all (gtm_data in JSON) or (gtm-data in HTML) sent via XMLHttpRequest
     */
    static AJAXListenerRun() {
        var listenerSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            var callback = this.onreadystatechange;
            this.onreadystatechange = function() {
                 if (this.readyState == 4 && this.status == 200) {
                     if (this.getAllResponseHeaders().indexOf("application/json") != -1) {
                         var myArr = GTMController.parseJSON(this.responseText);
                         if (myArr.gtm_data) {
                             GTMController.dataPush(myArr.gtm_data);
                         }
                     }

                     if (this.getAllResponseHeaders().indexOf("text/html") != -1) {
                         var container = document.implementation.createHTMLDocument().documentElement;
                         container.innerHTML = this.responseText;
                         GTMController.findAllDataDOM(container);
                     }
                 }
                 if (callback) {
                     callback.apply(this, arguments);
                 }
            }
            listenerSend.apply(this, arguments);
        }
    }

    //run DOM updates listener, to find all gtm-data added to DOM
    static DOMListenerRun() {
        let observer = new MutationObserver(function(mutationsList, observer) {
            var timeout = null;

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(function() {
                GTMController.handleLinks(document);
            }, 1000);
        });
        const targetNode = document.body,
              config     = {childList: true, subtree: true};
        observer.observe(targetNode, config);
    }

    static scrollListenerRun() {
        let scrollGrad = [0, 25, 50, 75, 100],
            currentGrad = 0,
            prevPct = 0;

        function pushScrollData (dir, pct) {
        	if (pct == 0 && dir == 'down') return;
            if (pct == 100 && dir == 'up') return;
            let data = {};
            data.event = 'Scroll';
            data.direction = dir;
            data.percentage = pct;
            GTMController.dataPush(data);
        }

        window.onscroll = function() {
            const rect = document.documentElement.getBoundingClientRect(),
                  percentage = 100 * (Math.abs(rect.top)) / (rect.height - window.innerHeight),
                  pctScrolled = percentage === Infinity ? 0 : Math.round(percentage);

            if (pctScrolled > prevPct) {
                if (pctScrolled >= scrollGrad[currentGrad]) {
                    pushScrollData('down', scrollGrad[currentGrad]);
                    if (currentGrad + 1 < scrollGrad.length) {
                        currentGrad++;
                    }
                }
                prevPct = pctScrolled;
            }

            if (pctScrolled < prevPct) {
                if (pctScrolled <= scrollGrad[currentGrad]) {
                    pushScrollData('up', scrollGrad[currentGrad]);
                    if (currentGrad - 1 >= 0) {
                        currentGrad--;
                    }
                }
                prevPct = pctScrolled;
            }
        }
    }

    static clickListenerRun() {
        let allContainers = document.querySelectorAll('body,.container');
        for (let i = 0; i < allContainers.length; i++) {
            let tempNode = allContainers[i];
            tempNode.addEventListener('click', function(event) {
                if (event && event.target && event.target.getAttribute('data-gtm')) {
                    let node = event.target,
                    data = GTMController.parseJSON(node.getAttribute('data-gtm'));
                    if (data.eventTypes.indexOf('click') != -1) {

                        data.event = 'click' + data.event.charAt(0).toUpperCase() + data.event.slice(1);
                        if (!data.action) {
                            data.action = 'click'
                        }

                        if (liveClick.indexOf(data.event) == -1) {
                            liveClick.push(data.event);
                            setTimeout(function () {
                                liveClick.splice(liveClick.indexOf(data.event), 1);
                            }, 10);
                        } else {
                            return;
                        }

                        if (data.isRecommendation) {
                            data.ecommerce.click.products.forEach(product => {
                                GTMController.replaceProductListIdPlaceholders(product);
                            });
                            delete data.isRecommendation;
                        }
                        GTMController.dataPush(data);
                    }
                }
            });
        }
    }

    static clickListenerTile() {
        let allContainers = document.querySelectorAll('body,.container');
        for (let i = 0; i < allContainers.length; i++) {
            let tempNode = allContainers[i];
            tempNode.addEventListener('click', function(event) {
                if (event && event.target && event.target.closest('.lp-product-tile') && event.target.closest('.lp-product-tile').getAttribute('data-gtm-click')) {
                    let node = event.target.closest('.lp-product-tile'),
                    data = GTMController.parseJSON(node.getAttribute('data-gtm-click'));
                    if (data.eventTypes.indexOf('click') != -1) {
                        data.event = data.event.charAt(0).toUpperCase() + data.event.slice(1);

                        if (!data.action) {
                            data.action = 'click'
                        }

                        if (liveClick.indexOf(data.event) == -1) {
                            liveClick.push(data.event);
                            setTimeout(function () {
                                liveClick.splice(liveClick.indexOf(data.event), 1);
                            }, 10);
                        } else {
                            return;
                        }

                        if (data.isRecommendation) {
                            data.ecommerce.click.products.forEach(product => {
                                GTMController.replaceProductListIdPlaceholders(product);
                            });
                            delete data.isRecommendation;
                        }

                        GTMController.dataPush(data);
                    }
                }
            });
        }
    }

    static changeListenerRun() {
        document.addEventListener('change', function(event) {
            if (event && event.target && event.target.getAttribute('data-gtm')) {
                let node = event.target,
                    data = GTMController.parseJSON(node.getAttribute('data-gtm'));

                if (data.eventTypes.indexOf('change') != -1) {
                    data.event = 'change' + data.event.charAt(0).toUpperCase() + data.event.slice(1);
                    data.action = node.value;
                    if (typeof node.attributes['type'] !== 'undefined' && node.attributes['type']['nodeValue'] == 'checkbox') {
                        data.action = node.checked ? 'checked' : 'unchecked';
                    }
                    if (!data.action) {
                        data.action = 'change'
                    }

                    GTMController.dataPush(data);
                }
            }
        });
    }

    static hoverListenerRun() {
        let timeout = null;
        document.addEventListener('mouseover', function(event) {
            if (event && event.target && event.target.getAttribute('data-gtm')) {
                const hoverDelay = 1000 // delay for hover event (ms)
                let node = event.target,
                    data = GTMController.parseJSON(node.getAttribute('data-gtm')),
                    defaultEventName = data.event;
                if (data.eventTypes && data.eventTypes.indexOf('hover') != -1) {
                    timeout = setTimeout(function () {
                        data.event = 'hover' + defaultEventName.charAt(0).toUpperCase() + defaultEventName.slice(1);
                        if (!data.action) {
                            data.action = 'hover'
                        }
                        GTMController.dataPush(data);
                    }, hoverDelay);
                }
            }
        });

        document.addEventListener('mouseout', function(event) {
            if (event && event.target && event.target.getAttribute('data-gtm')) {
                clearTimeout(timeout);
            }
        });
    }

    static initStaticDataLayer() {
        var staticDataLayer = window.staticDataLayer;
        GTMController.dataPush(staticDataLayer);
    }
}



/**
 * initial gtm-data search and dataLayer push on page
 * AJAX listener run
 */

 document.addEventListener("DOMContentLoaded", function() {
    GTMController.initStaticDataLayer();
    GTMController.findAllDataDOM(document);
    GTMController.AJAXListenerRun();
    GTMController.DOMListenerRun();

    if (gtmSitePreferences.GTM_CLICK) {
        GTMController.clickListenerRun();
        GTMController.clickListenerTile();
        GTMController.changeListenerRun();
    }

    if (gtmSitePreferences.GTM_HOVER) {
        GTMController.hoverListenerRun();
    }

    if (gtmSitePreferences.GTM_SCROLL) {
        GTMController.scrollListenerRun();
    }
});
