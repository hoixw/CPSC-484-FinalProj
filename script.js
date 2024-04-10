document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("map").addEventListener("load", function () {

        const hoverSelectionTime = 1000;
        const mapObject = document.getElementById("map").contentDocument;
        let hoverTimers = {};

        processSVGMap();
        enableMapEventListeners();


        function addTableOutline(tableNum) {
            const tableOutline = mapObject.querySelector(`[data-outline="${tableNum}"]`);
            if (tableOutline) {
                tableOutline.style.strokeWidth = "4";
                tableOutline.style.fill = "#B7C9E2";
            }
        }


        function enableMapEventListeners() {
            const tableHovers = mapObject.querySelectorAll("[data-hover]");
            tableHovers.forEach(hover => {
                hover.addEventListener("mouseenter", handleTableHover);
                hover.addEventListener("mouseleave", handleTableUnhover);
            });
        }


        function enableColorSelectionEventListeners(resolve) {
            const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'exit'];

            colors.forEach(colorId => {
                const color = document.getElementById(colorId);

                color.addEventListener('mouseenter', () => {
                    if (hoverTimers[colorId]) {
                        clearTimeout(hoverTimers[colorId]);
                    }

                    hoverTimers[colorId] = setTimeout(() => {
                        resolve(colorId);
                    }, hoverSelectionTime);
                });

                color.addEventListener('mouseleave', () => {
                    if (hoverTimers[colorId]) {
                        clearTimeout(hoverTimers[colorId]);
                        hoverTimers[colorId] = null;
                    }
                });
            });
        }


        function enableConfirmationEventListeners(resolve) {
            const buttons = ['yes', 'no', 'exit'];

            buttons.forEach(buttonId => {
                const button = document.getElementById(buttonId);

                button.addEventListener('mouseenter', () => {
                    if (hoverTimers[buttonId]) {
                        clearTimeout(hoverTimers[buttonId]);
                    }

                    hoverTimers[buttonId] = setTimeout(() => {
                        resolve(buttonId);
                    }, hoverSelectionTime);
                });

                button.addEventListener('mouseleave', () => {
                    if (hoverTimers[buttonId]) {
                        clearTimeout(hoverTimers[buttonId]);
                        hoverTimers[buttonId] = null;
                    }
                });
            });
        }


        function enableVibeSelectionEventListeners(resolve) {
            const vibe = ['relaxed', 'focused', 'exit'];

            vibe.forEach(vibeId => {
                const vibe = document.getElementById(vibeId);

                vibe.addEventListener('mouseenter', () => {
                    if (hoverTimers[vibeId]) {
                        clearTimeout(hoverTimers[vibeId]);
                    }

                    hoverTimers[vibeId] = setTimeout(() => {
                        resolve(vibeId);
                    }, hoverSelectionTime);
                });

                vibe.addEventListener('mouseleave', () => {
                    if (hoverTimers[vibeId]) {
                        clearTimeout(hoverTimers[vibeId]);
                        hoverTimers[vibeId] = null;
                    }
                });
            });
        }


        function getTableMapFromLocalStorage() {
            const tableMapString = localStorage.getItem('tableMap');
            return tableMapString ? JSON.parse(tableMapString) : {};
        }


        function handleTableHover(event) {
            const tableNum = event.target.getAttribute("data-hover");
            if (tableNum) {
                addTableOutline(tableNum);
                tableSelectionStartTimer(tableNum);
            }
        }


        function handleTableUnhover(event) {
            clearTimeout(hoverTimer);
            const tableNum = event.target.getAttribute("data-hover");
            if (tableNum) {
                removeTableOutline(tableNum);
            }
        }


        async function handleTableSelect(tableNum) {
            if (tableNum) {
                const tableMap = getTableMapFromLocalStorage();

                const tableInfo = tableMap[tableNum];

                if (tableInfo) {
                    const seat = tableInfo.seats.find(seat => !seat.isOccupied);

                    if (seat) {
                        const tableSelectionResponse = await showConfirmation("Table:", tableNum);

                        if (tableSelectionResponse === 'yes') {
                            seat.isOccupied = true;
                            tableInfo.numFilledSeats++;
                        }
                        else {
                            console.log("No or exit selected");
                            hideModal();
                            return
                        }

                        hideModal();

                        let vibeSelectionResponse = null;

                        if (tableInfo.numFilledSeats === 1) {
                            vibeSelectionResponse = await showVibeSelection();

                            if (vibeSelectionResponse === 'exit') {
                                console.log("Exit selected");
                                hideModal();
                                return
                            }
                        }

                        tableInfo.vibe = vibeSelectionResponse;

                        hideModal();

                        const responseFromColorSelection = await showColorSelection();

                        if (responseFromColorSelection === 'exit') {
                            console.log("Exit selected");
                            hideModal();
                            return
                        }

                        hideModal();

                        const colorSelectionResponse = await showConfirmation("Color:", responseFromColorSelection);

                        if (colorSelectionResponse === 'yes') {
                            seat.color = responseFromColorSelection;
                        }
                        else {
                            console.log("No or exit selected");
                            hideModal();
                            return
                        }

                        hideModal();
                        storeTableMapInLocalStorage(tableMap);
                        updateSVGMap();
                    }
                    else {
                        console.log("No available seats");
                    }
                }
            }
        }


        function hideModal() {
            document.getElementById('modal').classList.add('hidden');
        }


        function processSVGMap() {
            let tableMap = {};

            const circles = mapObject.querySelectorAll('circle');
            const tableSeatInfo = {};

            circles.forEach(circle => {
                const table = circle.getAttribute('data-table');
                const seat = circle.getAttribute('data-seat');

                if (table && seat) {
                    if (table && seat) {
                        if (!tableSeatInfo[table]) {
                            tableSeatInfo[table] = [{ seat, isOccupied: false }];
                        } else if (!tableSeatInfo[table].some(obj => obj.seat === seat)) {
                            tableSeatInfo[table].push({ seat, isOccupied: false, color: null });
                        }
                    }
                }
            });

            for (const table in tableSeatInfo) {
                tableMap[table] = {
                    numTotalSeats: tableSeatInfo[table].length,
                    numFilledSeats: 0,
                    seats: tableSeatInfo[table].sort(),
                    vibe: null
                };
            }

            storeTableMapInLocalStorage(tableMap);
        }


        function removeTableOutline(tableNum) {
            const tableOutline = mapObject.querySelector(`[data-outline="${tableNum}"]`);
            if (tableOutline) {
                tableOutline.style.strokeWidth = "2";
                tableOutline.style.fill = "white";
            }
        }


        function showColorSelection() {
            return new Promise((resolve, reject) => {
                fetch('/color-tables.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;

                        enableColorSelectionEventListeners(resolve);

                        document.getElementById('modal').classList.remove('hidden');
                    });
            });
        }


        function showConfirmation(prompt, confirmData) {
            return new Promise((resolve, reject) => {
                fetch('/confirmation.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;
                        document.getElementById('table-number').textContent = `${prompt} ${confirmData}`;

                        enableConfirmationEventListeners(resolve);

                        document.getElementById('modal').classList.remove('hidden');
                    });
            });
        }


        function showVibeSelection() {
            return new Promise((resolve, reject) => {
                fetch('/vibe.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;

                        enableVibeSelectionEventListeners(resolve);

                        document.getElementById('modal').classList.remove('hidden');
                    });
            });
        }


        function storeTableMapInLocalStorage(tableMap) {
            localStorage.setItem('tableMap', JSON.stringify(tableMap));
        }


        function tableSelectionStartTimer(tableNum) {
            if (tableNum) {
                hoverTimer = setTimeout(function () {
                    handleTableSelect(tableNum);
                }, hoverSelectionTime);
            }
        }


        function updateSVGMap() {
            tableMap = getTableMapFromLocalStorage();

            for (const tableID in tableMap) {
                const tableData = tableMap[tableID];

                if (tableData.vibe) {
                    const teapot = mapObject.querySelector(`[data-table="${tableID}"][data-vibe="teapot"]`);
                    const timer = mapObject.querySelector(`[data-table="${tableID}"][data-vibe="timer"]`);

                    if (teapot && timer) {
                        teapot.style.opacity = tableData.vibe === "relaxed" ? "1" : "0";
                        timer.style.opacity = tableData.vibe === "focused" ? "1" : "0";
                    }
                }

                for (let seat of tableData.seats) {
                    if (seat.isOccupied) {
                        const seatElement = mapObject.querySelector(`[data-table="${tableID}"][data-seat="${seat.seat}"]`);
                        if (seatElement) {
                            seatElement.style.fill = seat.color;
                        }
                    }
                }
            }

        }


        setInterval(updateSVGMap, 5000);
    });

});