const baseURL = "https://www.rainbowrest.xyz"

async function getApiData(endpoint, params) {
    params = new URLSearchParams(params).toString();
    let url = `${baseURL}/${endpoint}?${params}`;

    try {
        let response = (await fetch(url));
        if (response.status == 200) {return response.json()} 
        return response.status
    } catch (error) {
        console.log(`Error: ${error}`)
    }
}

async function setGeoCookie(e) {
    e.preventDefault();
    let params = {address: document.getElementById("userLoc").value};
    let data = await getApiData("geo/forward", params)

    const loc_label = document.querySelector("label");

    if (typeof(data) != "number") {
        loc_label.innerText = "Where are you?";
        document.cookie = `geodata=${JSON.stringify(data)}; path=/`;
    } else {
        loc_label.innerText = "That location isn't available, please try again!"
    }
}