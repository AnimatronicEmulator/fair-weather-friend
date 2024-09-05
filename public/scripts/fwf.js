const currentTimeout = 900000;
const extendedTimeout = 3.6e6;

function getCookie(name) {
    const decoded_cookie = decodeURIComponent(document.cookie);
    const cookie_array = decoded_cookie.split("; ");
    let result = null;

    cookie_array.forEach((cookie) => {
        if (cookie.indexOf(name) == 0) {
            result = cookie.substring(name.length + 1)
        }
    })

    return result;
}

async function getRainbow(endpoint) {
    const geodata = JSON.parse(getCookie("geodata"));

    if (!geodata || !geodata.lat || !geodata.lon) { return; }

    const url = new URL(`https://www.rainbowrest.xyz/wx/${endpoint}`);
    url.search = new URLSearchParams({lat: geodata.lat, lon: geodata.lon});

    try {
        let response = await axios(url.toString());
        return response.data;
    } catch (error) {
        console.error(`ERROR: ${error}`);
    }
}

function wxTabs(elmnt) {
    document.querySelectorAll(".fwf-tab").forEach((tab) => {
        if (elmnt.id == tab.id) {
            document.getElementById(tab.id).setAttribute("aria-selected", "true");
            document.getElementById(tab.id.replace("-tab", "")).classList.remove("inactive");
        } else {
            document.getElementById(tab.id).setAttribute("aria-selected", "false");
            document.getElementById(tab.id.replace("-tab", "")).classList.add("inactive");
        }
    })
}

function fwfDateTime() {
    const geodata = JSON.parse(getCookie("geodata"));
    const today = new Date();

    if (geodata != null && geodata.tz != null) {
        let localTime = today.toLocaleTimeString("en-US", {
            "timeZone": geodata.tz, "timeStyle": "long"
        });

        let localDate = today.toLocaleString("en-US", {
            "timeZone": geodata.tz, "weekday": "short",
            "month": "short", "day": "2-digit"
        }).replace(",", "").toUpperCase();

        for (x of document.getElementsByClassName("program-clock")) {
            x.innerHTML = localTime;
        }

        for (x of document.getElementsByClassName("program-date")) {
            x.innerHTML = localDate;
        }

        setTimeout(fwfDateTime, 1000);
    }
}

function fwfLocation() {
    const geodata = JSON.parse(getCookie("geodata"));

    if (geodata != null && geodata.loc != null) {
        for (x of document.getElementsByClassName("location-display")) {
            x.innerHTML = geodata.loc;
        }
    }
}

async function current() {
    let data = await getRainbow("current");
    const endpointError = !data;

    const vars = [
        "t", "rh", "dew", "wind", "vis", "p", 
        "ceil", "heat", "chill", "wx", "icon"
    ]

    if (endpointError) {
        console.log("ERROR: /wx/current endpoint request/response failed")
    }

    for (const v in vars) {
        const elmnt = document.getElementById(`current-${v}`);
        const container = document.getElementById(elmnt.id + "-container");

        if (endpointError) {
            if (container) {
                container.classList.add("inactive")
            } else {
                elmnt.innerHTML = "ERR";
            }
        } else if (data[v] != null) {
            elmnt.innerHTML = data[v]
        } else if (container != null) {
            container.classList.add("inactive")
        } else {
            elmnt.innerHTML = "N/A"
        }
    }

    setTimeout(current, currentTimeout)
}

async function extended() {
    let data = await getRainbow("forecast");
    const endpointError = !data;

    const cards = ["a", "b", "c"];
    const vars = ["hi", "lo", "wx", "icon", "wday"];

    if (endpointError) {
        console.log("ERROR: /wx/forecast endpoint request/response failed")
    }

    for (const card of cards) {
        for (const v of vars) {
            const elmnt = document.getElementById(`extended-${v}-${card}`);

            if (endpointError) {
                elmnt.innerHTML = "ERR"
            } else if (data[v]) {
                elmnt.innerHTML = data[v]
            } else {
                elmnt.innerHTML = "ERR";
                 console.log(`ERROR: /wx/forecast response didn't include ${v}`);
            }
        }
    }

    setTimeout(extended, extendedTimeout)
}

async function almanac() {
    let data = await getRainbow("almanac");
    const endpointError = !data;

    const solarCards = ["a", "b"];
    const lunarCards = ["a", "b", "c", "d"];

    const solarVars = ["wday", "rise", "set"];
    const lunarVars = ["phase", "date", "icon"];

    if (endpointError) {
        console.log("ERROR: /wx/almanac endpoint request/response failed")
    }

    for (const c of solarCards.length) {
        for (const v of solarVars) {
            const elmnt = document.getElementById(`almanac-${v}-${solarCards[c]}`);

            if (endpointError) {
                elmnt.innerHTML = "ERR"
            } else if (data.solar[c][v]) {
                elmnt.innerHTML = data.solar[c][v]
            } else {
                elmnt.innerHTML = "ERR";
                console.log(`ERROR: /wx/almanac response didn't include solar-${v}`)
            }
        }
    }

    for (const c of lunarCards.length) {
        for (const v of lunarVars) {
            const elmnt = document.getElementById(`almanac-${v}-${lunarCards[c]}`);

            if (endpointError) {
                elmnt.innerHTML = "ERR"
            } else if (data.solar[c][v]) {
                elmnt.innerHTML = data.lunar[c][v]
            } else {
                elmnt.innerHTML = "ERR";
                console.log(`ERROR: /wx/almanac response didn't include lunar-${v}`)
            }
        }
    }

    const geodata = JSON.parse(getCookie("geodata"));
    let opts = {hourCycle: "h24"};

    if (geodata && geodata.tz) {opts.timeZone = geodata.tz}

    const now = new Date().toLocaleTimeString("en-US", opts).split(":");
    const tOut = 8.64e7 - ((3.6e6 * now[0]) + (60000 * now[1]) + (1000 * now[2]));

    setTimeout(almanac, tOut);
}

async function alerts() {
    let data = await getRainbow("alerts");
    const endpointError = !data;
    let alertsInner = "";

    if (endpointError) {
        alertsInner.concat("", "<pre class='alert-entry'>&#10; Error retrieving weather alerts</pre>");
        console.log("ERROR: /wx/alerts endpoint request/response failed");
    } else {
        for (const alert in data.alerts) {
            alertsInner.concat("", `${alert}<hr>`);
        }
    }

    const alertsDiv = document.querySelector("#alerts .data");
    alertsDiv.innerHTML = alertsInner;

    setTimeout(alerts, 900000);
}

function tabClicks() {
    const tabs = document.querySelectorAll(".fwf-tab");
    tabs.forEach((t) => { t.addEventListener("click", () => { wxTabs(t) }) })
}

function runFWF() {
    fwfDateTime();
    fwfLocation();
    current();
    // extended();
    // almanac();
    // alerts();
}

document.addEventListener("DOMContentLoaded", function() {
    tabClicks();
    runFWF();
})