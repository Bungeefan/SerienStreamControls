"use strict";

const lastSeriesKey = "lastSeries";

function getStorage() {
    return chrome.storage.sync;
}

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

    if (settings['enabled']) {
        try {
            let pathArray = window.location.pathname.split('/');
            if (pathArray.length >= 3 && window.location.pathname.indexOf("serie") !== -1) {
                let control_previous = createControl(false);
                let control_next = createControl(true);

                addKeyListener(control_next, control_previous);

                let previousDiv = document.createElement("div");
                previousDiv.classList.add("ss-btn-container", "previous-ss-btn-container");
                previousDiv.append(control_previous);

                let middleDiv = document.createElement("div");
                middleDiv.classList.add("container", "middle-ss-btn-container");

                let nextDiv = document.createElement("div");
                nextDiv.classList.add("ss-btn-container", "next-ss-btn-container");
                nextDiv.append(control_next);

                let parentBtnDiv = document.createElement("div");
                parentBtnDiv.classList.add("ss-bt-parent-container");
                parentBtnDiv.append(previousDiv);
                parentBtnDiv.append(middleDiv);
                parentBtnDiv.append(nextDiv);

                document.body.append(parentBtnDiv);

                processPlayer(settings);
            }
            addLastWatchedSeries();
        } catch (e) {
            console.error(e);
        }
    }
});

function addKeyListener(control_next, control_previous) {
    document.body.addEventListener("keypress", evt => {
        //Arrow keys are only triggered by onkeydown, not onkeypress.
        if (evt.defaultPrevented) {
            return;
        }
        if (evt.key === "n") {
            control_next.click();
        } else if (evt.key === "b") {
            control_previous.click();
        }
    });
}

function processPlayer(settings) {
    if (settings['automatic_play']) {
        let playerView = document.querySelector(".inSiteWebStream");
        if (playerView) {
            playerView.scrollIntoView({behavior: "smooth", block: "center"});

            //Doesn't work on iframes
            // playerView.querySelector("iframe").addEventListener("load", evt => {
            //     playerView.dispatchEvent(new MouseEvent("click", {
            //         bubbles: true,
            //         cancelable: true,
            //         view: window,
            //         clientX: playerView.getBoundingClientRect().x, //event handler checks for >0
            //         clientY: playerView.getBoundingClientRect().y
            //     }));
            //     playerView.dispatchEvent(new KeyboardEvent("keydown", {
            //         bubbles: true,
            //         cancelable: true,
            //         view: window,
            //         keyCode: 70 //F
            //     }));
            // });
        }
    }
}

function addLastWatchedSeries() {
    getStorage().get(lastSeriesKey, storage => {
        let lastWatchedSeries = storage[lastSeriesKey];
        if (lastWatchedSeries) {
            let seriesName = lastWatchedSeries.split("/")[3].replaceAll("-", " ").toUpperCase();

            let primaryListItem = createLastWatchedListItem(lastWatchedSeries, seriesName);
            primaryListItem.classList.add("primary");

            let primaryNav = document.querySelector(".primary-navigation > ul");
            if (primaryNav) {
                primaryNav.insertBefore(primaryListItem, primaryNav.lastElementChild);
            }

            let secondaryListItem = createLastWatchedListItem(lastWatchedSeries, seriesName);
            secondaryListItem.classList.add("secondary");

            let secondaryNav = document.querySelector(".primary-navigation > ul > li > ul");
            if (secondaryNav) {
                secondaryNav.insertBefore(secondaryListItem, secondaryNav.firstChild);
            }
        }
    });
}

function createLastWatchedListItem(lastWatchedSeries, seriesName) {
    let lastWatchedSeriesLi = document.createElement("li");
    lastWatchedSeriesLi.classList.add("ss-last-series-link");

    let lastWatchedSeriesA = document.createElement("a");
    lastWatchedSeriesA.href = lastWatchedSeries;
    lastWatchedSeriesA.title = "Letzte Serie fortsetzen";
    lastWatchedSeriesA.innerText = " fortsetzen";
    lastWatchedSeriesLi.append(lastWatchedSeriesA);

    let lastWatchedSeriesName = document.createElement("span");
    lastWatchedSeriesName.innerText = seriesName;
    lastWatchedSeriesName.classList.add("ss-last-series-name");
    lastWatchedSeriesA.prepend(lastWatchedSeriesName);

    let lastWatchedSeriesIcon = document.createElement("i");
    lastWatchedSeriesIcon.classList.add("fas", "fa-chevron-right");
    lastWatchedSeriesA.insertBefore(lastWatchedSeriesIcon, lastWatchedSeriesA.firstChild);
    return lastWatchedSeriesLi;
}

function createControl(next) {
    let control = document.createElement("a");
    let controlDetails = getControlDetails(next);
    if (controlDetails.href) {
        control.href = controlDetails.href;
        if (next) {
            //Save next button url for continue link
            let pathArray = window.location.pathname.split('/');
            if (pathArray.length >= 6 && window.location.pathname.indexOf("serie") !== -1) {
                //If we are currently in the episode view
                let obj = {};
                obj[lastSeriesKey] = new URL(control.href).pathname;
                getStorage().set(obj);
            } else {
                //Otherwise only save if there is nothing to overwrite
                getStorage().get(lastSeriesKey, storage => {
                    if (!storage[lastSeriesKey]) {
                        let obj = {};
                        obj[lastSeriesKey] = new URL(control.href).pathname;
                        getStorage().set(obj);
                    }
                });
            }
        }
    } else {
        control.href = "#";
        control.style.visibility = "hidden";
    }
    if (controlDetails.terminus) {
        control.title = `${next ? "Nächste" : "Vorherige"} ${controlDetails.terminus} (${next ? "N" : "B"})`;
    }
    control.id = "ss-control-" + (next ? "next" : "previous");
    control.classList.add("ss-control");
    return control;
}

function getControlDetails(next) {
    let seasonsArray = Array.from(getSeasons(false));
    let episodesArray = Array.from(getEpisodes(false));

    let terminus;
    let href;
    let activeEpisodeIndex = episodesArray.indexOf(getEpisodes(true));

    if (next) {
        activeEpisodeIndex++;
    } else {
        activeEpisodeIndex--;
    }
    if (activeEpisodeIndex >= 0
        && activeEpisodeIndex < episodesArray.length
        && episodesArray[activeEpisodeIndex]
        && !episodesArray[activeEpisodeIndex].classList.contains("disabled")) {
        terminus = "Folge";
        href = episodesArray[activeEpisodeIndex].href;
    } else {
        terminus = "Staffel";
        href = getSeasonLink(next, seasonsArray);
    }
    return {terminus, href};
}

function getSeasonLink(next, seasonsArray) {
    let href;
    let activeSeasonIndex = seasonsArray.indexOf(getSeasons(true));

    if (next) {
        activeSeasonIndex++;
    } else {
        activeSeasonIndex--;
    }

    if (activeSeasonIndex >= 0
        && activeSeasonIndex < seasonsArray.length
        && seasonsArray[activeSeasonIndex]
        && !seasonsArray[activeSeasonIndex].classList.contains("disabled")) {
        href = seasonsArray[activeSeasonIndex].href;
    }
    return href;
}

function getSeasons(currentActiveOnly) {
    return get("1", currentActiveOnly);
}

function getEpisodes(currentActiveOnly) {
    return get("2", currentActiveOnly);
}

function get(selector, onlyActive, additionalSelector) {
    let selectorString = `#stream > ul:nth-of-type(${selector}) > li > a${onlyActive ? ".active" : ""}` + (additionalSelector ? " " + additionalSelector : "");
    if (onlyActive) {
        return document.querySelector(selectorString);
    } else {
        return document.querySelectorAll(selectorString);
    }
}
