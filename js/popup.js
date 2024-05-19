"use strict";

window.addEventListener("load", event => {
    getStorage().get(storageKeys.settings, storage => {
        let settings = initializeSettings(storage?.settings);

        const checkboxList = document.querySelectorAll("input[type=checkbox]");
        checkboxList.forEach(checkboxElement => {
            let shouldBeChecked = settings[checkboxElement.name];
            if (shouldBeChecked == null) {
                shouldBeChecked = true;
            }
            checkboxElement.checked = shouldBeChecked;
            checkboxElement.addEventListener("change", event => {
                getStorage().get(storageKeys.settings, storage => {
                    let settings = storage.settings;
                    settings[checkboxElement.name] = checkboxElement.checked;

                    let storageUpdate = {};
                    storageUpdate[storageKeys.settings] = settings;
                    getStorage().set(storageUpdate);

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
            getStorage().remove(storageKeys.lastSeries);
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
