document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("map").addEventListener("load", function () {
    
        const hoverSelectionTime = 1500;
        const kinectCursorRefreshTime = 100;
        const mapObject = document.getElementById("map").contentDocument;
        const cursor = document.querySelector('.cursor');
        let ENABLEKINECT = true;
        let intervals = [];
        let hoverTimers = {};

        processSVGMap();
        enableMapEventListeners();

        function isOverlapping(rect1, rect2) {
            return !(
                rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
            );
        }

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

                // Code for mouse (to keep compatibility)
                hover.addEventListener("mouseenter", handleTableHover);
                hover.addEventListener("mouseleave", handleTableUnhover);
                
                // For Kinect Cursor compatibility
                setInterval(() => {
                    if (document.getElementById('modal').classList.contains('hidden')) {
                        const cursorRect = cursor.getBoundingClientRect();
                        const hoverRect = hover.getBoundingClientRect();

                        if (isOverlapping(cursorRect, hoverRect)) {
                            if (!hover.classList.contains('hover')) {
                                hover.classList.add('hover');
                                handleTableHover({ target: hover });
                            }
                        } else {
                            if (hover.classList.contains('hover')) {
                                hover.classList.remove('hover');
                                handleTableUnhover({ target: hover });
                            }
                        }
                    }
                }, kinectCursorRefreshTime);

            });
        }


        function enableEventListeners(elementIds, resolve) {
            elementIds.forEach(elementId => {
                const element = document.getElementById(elementId);
        
                // Code for mouse (to keep compatibility)
                element.addEventListener('mouseenter', () => {
                    if (hoverTimers[elementId]) {
                        clearTimeout(hoverTimers[elementId]);
                    }
        
                    hoverTimers[elementId] = setTimeout(() => {
                        resolve(elementId);
                    }, hoverSelectionTime);
                });
        
                element.addEventListener('mouseleave', () => {
                    if (hoverTimers[elementId]) {
                        clearTimeout(hoverTimers[elementId]);
                        hoverTimers[elementId] = null;
                    }
                });
        
                if (ENABLEKINECT) {
                    const intervalId = setInterval(() => {
                        const cursorRect = cursor.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();
            
                        if (isOverlapping(cursorRect, elementRect)) {
                            if (!element.classList.contains('hover')) {
                                element.classList.add('hover');
                                if (hoverTimers[elementId]) {
                                    clearTimeout(hoverTimers[elementId]);
                                }
                                hoverTimers[elementId] = setTimeout(() => {
                                    resolve(elementId);
                                }, hoverSelectionTime);
                            }
                        } else {
                            if (element.classList.contains('hover')) {
                                element.classList.remove('hover');
                                if (hoverTimers[elementId]) {
                                    clearTimeout(hoverTimers[elementId]);
                                    hoverTimers[elementId] = null;
                                }
                            }
                        }
                    }, kinectCursorRefreshTime);
                    intervals.push(intervalId);
                }
            });
        }
        
        function enableColorSelectionEventListeners(resolve) {
            const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'exit'];
            enableEventListeners(colors, resolve);
        }
        
        function enableConfirmationEventListeners(resolve) {
            const buttons = ['yes', 'no', 'exit'];
            enableEventListeners(buttons, resolve);
        }
        
        function enableVibeSelectionEventListeners(resolve) {
            const vibes = ['relaxed', 'focused', 'exit'];
            enableEventListeners(vibes, resolve);
        }

        function enableSurveyCheckEventListeners(resolve) {
            const buttons = ['yes', 'no', 'exit'];
            enableEventListeners(buttons, resolve);
        }

        function enableSurveyOneEventListeners(resolve) {
            const answers = ['not-motivated', 'neutral', 'motivated', 'exit', 'skip'];
            enableEventListeners(answers, resolve);
        }

        function enableSurveyTwoEventListeners(resolve) {
            const answers = ['never', 'sometimes', 'always', 'exit', 'skip'];
            enableEventListeners(answers, resolve);
        }

        function enableSurveyCheckEventListeners(resolve) {
            const buttons = ['yes', 'no', 'exit'];
            enableEventListeners(buttons, resolve);
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

                        let responseFromColorSelection = null;
                        let colorSelectionResponse = null;

                        while (colorSelectionResponse !== 'yes') {
                            hideModal();
                            responseFromColorSelection = await showColorSelection();

                            if (responseFromColorSelection === 'exit') {
                                console.log("Exit selected");
                                hideModal();
                                return;
                            }
                            
                            hideModal();
                            colorSelectionResponse = await showConfirmation("Color:", (responseFromColorSelection.charAt(0).toUpperCase() + responseFromColorSelection.slice(1)));

                            if (colorSelectionResponse === 'no') {
                                console.log("Color not confirmed, prompting again");
                            } else if (colorSelectionResponse === 'exit') {
                                console.log("Exit selected");
                                hideModal();
                                return;
                            }
                        }

                        seat.color = responseFromColorSelection;
                        hideModal();
                        storeTableMapInLocalStorage(tableMap);
                        updateSVGMap();

                        const surveyCheckResponse = await showSurveyCheck();
                        if (surveyCheckResponse !== 'yes') {
                            console.log("Survey Not Chosen");
                            hideModal();
                            return;
                        }

                        hideModal();

                        // After the user is done selecting a seat then we will initiate the survey
                        questionOneResponse = await showSurveyQuestionOne();

                        if (questionOneResponse === 'exit') {
                            console.log("Exit selected");
                            hideModal();
                            return
                        }
                        else {
                            console.log("Survey question one answered");
                            hideModal();
                        }

                        questionTwoResponse = await showSurveyQuestionTwo();

                        if (questionTwoResponse === 'exit') {
                            console.log("Exit selected");
                            hideModal();
                            return
                        }
                        else {
                            console.log("Survey question two answered");
                            hideModal();
                        }

                        const surveyData = {
                            "Time": new Date().toLocaleString(),
                            "Question 1": questionOneResponse,
                            "Question 2": questionTwoResponse
                        };

                        fetch('https://api.sheetmonkey.io/form/jNZkAkg7RgYWtZWzv1JVEY', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(surveyData),
                        })

                    }
                    else {
                        console.log("No available seats");
                    }
                }
            }
        }


        function hideModal() {
            document.getElementById('modal').classList.add('hidden');
            intervals.forEach(intervalId => {
                clearInterval(intervalId);
            });
            intervals = [];
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
                fetch('/colors.html')
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

        function showSurveyCheck() {
            return new Promise((resolve, reject) => {
                fetch('/survey-check.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;

                        enableSurveyCheckEventListeners(resolve);

                        document.getElementById('modal').classList.remove('hidden');
                    });
            });
        }

        
        function showSurveyQuestionOne() {
            return new Promise((resolve, reject) => {
                fetch('/survey-one.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;

                        enableSurveyOneEventListeners(resolve);

                        document.getElementById('modal').classList.remove('hidden');
                    });
            });
        }

        function showSurveyQuestionTwo() {
            return new Promise((resolve, reject) => {
                fetch('/survey-two.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;

                        enableSurveyTwoEventListeners(resolve);

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

        function showSurveyCheck() {
            return new Promise((resolve, reject) => {
                fetch('/survey-check.html')
                    .then(response => response.text())
                    .then(html => {
                        document.getElementById('modal-content').innerHTML = html;

                        enableSurveyCheckEventListeners(resolve);

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