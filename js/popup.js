"use strict";

const lastSeriesKey = "lastSeries";

function getStorage() {
    return chrome.storage.sync;
}

window.addEventListener("load", event => {
    getStorage().get('settings', storage => {
        let settings = storage?.settings;
        let changed = false;

        if (settings === undefined) {
            settings = {};
            changed = true;
        }
        if (settings['enabled'] === undefined) {
            changed = true;
            settings['enabled'] = true;
        }
        if (settings['automatic_play'] === undefined) {
            changed = true;
            settings['automatic_play'] = true;
        }

        if (changed) {
            getStorage().set({'settings': settings});
        }

        const checkboxList = document.querySelectorAll("input[type=checkbox]");
        checkboxList.forEach(checkboxElement => {
            let shouldBeChecked = settings[checkboxElement.name];
            if (shouldBeChecked == null) {
                shouldBeChecked = true;
            }
            checkboxElement.checked = shouldBeChecked;
            checkboxElement.addEventListener("change", event => {

                getStorage().get('settings', storage => {
                    let settings = storage.settings;
                    settings[checkboxElement.name] = checkboxElement.checked;
                    getStorage().set({'settings': settings});

                    if (event.target.name === 'enabled' && event.target.checked === false) {
                        let element = document.querySelector("input[name=automatic_play]");
                        element.checked = false;
                        activateEvent(element, 'change');
                    }
                });
            });
        });

        const resetLastWatchedSeries = document.querySelector("#resetLastWatchedSeries");
        resetLastWatchedSeries.addEventListener("click", event => {
            getStorage().remove(lastSeriesKey);
            document.querySelector("h4")?.remove();
            let htmlSpanElement = document.createElement("h4");
            htmlSpanElement.style.color = "green";
            htmlSpanElement.style.margin = "0.25em";
            htmlSpanElement.innerText = "Cleared";
            resetLastWatchedSeries.parentElement.appendChild(htmlSpanElement);
        })
    });
});

function activateEvent(item, actionShortName) {
    if (document.createEventObject) {
        item.fireEvent("on" + actionShortName);
    } else {
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent(actionShortName, true, true); // event type, bubbling, cancelable
        item.dispatchEvent(evt);
    }
}
