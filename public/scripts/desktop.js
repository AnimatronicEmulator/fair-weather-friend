function desktopClock() {
    const today = new Date();
    let today_fstring = today.toLocaleTimeString("en-US", {"timeStyle": "short"});
    document.getElementById("clock").innerHTML = today_fstring;

    setTimeout(desktopClock, 1000)
}

function shortcutClicks() {
    const scuts = document.getElementsByClassName("shortcut-button");
    const timeout = 500;
    let is_dbl_click = false;

    for (const s of scuts) {
        s.addEventListener("dblclick", (event) => {
            event.preventDefault();
            is_dbl_click = true;
            openProgram(s.id.split("-")[0]);
            setTimeout(() => { is_dbl_click = false }, timeout)
        })

        s.addEventListener("click", (event) => {
            event.preventDefault();
            setTimeout(() => {
                if (!is_dbl_click) { return }
            }, timeout)
        })
    }
}

function sendToTop(program_id) {
    const taskbar = document.getElementById("taskbar");
    const program = document.getElementById(`${program_id}-program`);
    const tb_button = document.getElementById(`${program_id}-tb-button`);
    const other_programs = document.querySelectorAll(`iframe:not(#${program_id}-program)`);
    const other_tb_buttons = document.querySelectorAll(`#taskbar button:not(#${program_id}-tb-button)`);

    let minZ = 0;
    for (const p of other_programs) {
        if (parseInt(p.style.zIndex) > minZ) { minZ = parseInt(p.style.zIndex) }
    }

    other_tb_buttons.forEach((b) => b.classList.remove("active"));
    tb_button.classList.add("active");

    program.style.zIndex = minZ + 1;
    taskbar.style.zIndex = minZ + 2;
}

function openProgram(program_id) {
    const desktop = document.getElementById("programs");

    if (!document.getElementById(`${program_id}-program`)) {
        let new_program = document.createElement("iframe");
        new_program.setAttribute("id", `${program_id}-program`);
        new_program.setAttribute("src", `/html/${program_id}.html`);
        new_program.setAttribute("style", "visibility:visible;")

        desktop.appendChild(new_program);
        renderTaskbarShortcut(program_id);
        sendToTop(program_id);

        new_program = document.getElementById(`${program_id}-program`);
        new_program.addEventListener("load", () => { 
            titleBarButtons(program_id);
            draggableProgram(program_id);
            handleNewLocation(program_id);
        })
    }
}

function draggableProgram(program_id) {
    const program = document.getElementById(`${program_id}-program`);

    const titlebar = program.contentDocument.querySelector(".title-bar");

    function dragElmnt({ movementX, movementY }) {
        const program_style = window.getComputedStyle(program);
        program.style.left = `${parseInt(program_style.left) + movementX}px`;
        program.style.top = `${parseInt(program_style.top) + movementY}px`;
    }

    function stopDrag() {
        titlebar.removeEventListener("mousemove", dragElmnt)
    }

    titlebar.addEventListener("mousedown", () => {
        titlebar.addEventListener("mouseleave", stopDrag);
        titlebar.addEventListener("mouseup", stopDrag);

        titlebar.addEventListener("mousemove", dragElmnt);
    })
}

function renderTaskbarShortcut(program_id) {
    const taskbar = document.querySelector("#taskbar #left");
    const tb_templates = document.querySelector("#tb-buttons").content.children;

    if (!document.getElementById(`${program_id}-tb-button`)) {
        let new_tb_button;
        for (const b of tb_templates) {
            if (b.id == `${program_id}-tb-button`) { new_tb_button = b.cloneNode(true) }
        }

        taskbar.appendChild(new_tb_button);

        new_tb_button = document.getElementById(`${program_id}-tb-button`);
        new_tb_button.addEventListener("click", () => { minimizeProgram(program_id) })
    }
}

function titleBarButtons(program_id) {
    const program = document.getElementById(`${program_id}-program`).contentDocument;
    const min_button = program.getElementById(`${program_id}-min`);
    const close_button = program.getElementById(`${program_id}-close`);

    min_button.addEventListener("click", () => { minimizeProgram(program_id) })
    close_button.addEventListener("click", () => { closeProgram(program_id) })
}

function minimizeProgram(program_id) {
    const program = document.getElementById(`${program_id}-program`);
    const tb_button = document.getElementById(`${program_id}-tb-button`);

    const p_is_vis = program.style.visibility == "visible";
    const p_is_active = tb_button.classList.contains("active");

    if (!p_is_vis || !p_is_active) {
        program.style.visibility = "visible";
        sendToTop(program_id);
    } else {
        program.style.visibility = "hidden";
        tb_button.classList.remove("active");
    }
}

function closeProgram(program_id) {
    const program = document.getElementById(`${program_id}-program`);
    const program_tb_button = document.getElementById(`${program_id}-tb-button`);

    program.remove();
    program_tb_button.remove();
}

function handleNewLocation(program_id) {
    if (!(program_id == "location")) { return }
    const loc = document.getElementById(`${program_id}-program`).contentDocument;
    const submit_button = loc.querySelector("input[type=submit]");

    submit_button.addEventListener("click", () => {
        minimizeProgram(program_id);
        const fwf = document.getElementById("fwf-program");
        if (fwf) {
            if (fwf.style.visibility == "hidden") { minimizeProgram("fwf") }
        } else { openProgram("fwf") }
    })
}

function startUp() {
    const decoded_cookie = decodeURIComponent(document.cookie);
    const target = (decoded_cookie.includes("geodata")) ? "fwf" : "location";

    openProgram(target)
    desktopClock();
    shortcutClicks();
}

document.addEventListener("DOMContentLoaded", () => { startUp(); })