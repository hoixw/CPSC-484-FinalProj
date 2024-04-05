document.getElementById("map").addEventListener('load', function () {
    const tableSelect = document.getElementById('table-select');
    const seatSelect = document.getElementById('seat-select');
    const colorInput = document.getElementById('color-input');
    const vibeTableSelect = document.getElementById('table-select-vibe');
    const vibeSelect = document.getElementById('vibe-select');
    const mapDoc = document.getElementById('map').contentDocument;

    function fillSeat() {
        const tableNum = tableSelect.value;
        const seatNum = seatSelect.value;
        const color = colorInput.value;

        const seat = mapDoc.querySelector(`[data-table="${tableNum}"][data-seat="${seatNum}"]`);
        if (seat) {
            seat.style.fill = color;
            // Store the table, seat, and color in local storage with a 30-second expiry
            const expiryTime = new Date().getTime() + (30 * 1000);
            localStorage.setItem(`table-${tableNum}-seat-${seatNum}`, `${color}|${expiryTime}`);
        } else {
            console.log(`No seat found for table ${tableNum} and seat ${seatNum}`);
        }
    }

    function setVibe() {
        const tableNum = vibeTableSelect.value;
        const vibe = vibeSelect.value;
        const teapot = mapDoc.querySelector(`[data-table="${tableNum}"][data-vibe="teapot"]`);
        const timer = mapDoc.querySelector(`[data-table="${tableNum}"][data-vibe="timer"]`);

        if (teapot && timer) {
            teapot.style.opacity = vibe === "Teapot" ? "1" : "0";
            timer.style.opacity = vibe === "Timer" ? "1" : "0";
            // Currently 30 seconds expiry — will be upped to 90 minutes in prod 
            const expiryTime = new Date().getTime() + (30 * 1000);
            localStorage.setItem(`table-${tableNum}-vibe`, `${vibe}|${expiryTime}`);
        } else {
            console.log(`No vibes found for table ${tableNum}`);
        }
    }

    function updateSeatOptions() {
        const tableNum = parseInt(tableSelect.value);
        const numSeats = tableNum <= 2 ? 5 : 4;

        seatSelect.innerHTML = '';
        for (let i = 1; i <= numSeats; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = i;
            seatSelect.add(option);
        }
    }

    function applyStoredData() {
        const now = new Date().getTime();
        for (let i = 1; i <= 5; i++) {
            const seatDataKey = `table-${i}-seat-1`;
            const vibeDataKey = `table-${i}-vibe`;

            for (let j = 1; j <= (i <= 2 ? 5 : 4); j++) {
                const seatKey = `table-${i}-seat-${j}`;
                const seatData = localStorage.getItem(seatKey);
                if (seatData) {
                    const [color, expiryTime] = seatData.split('|');
                    if (expiryTime > now) {
                        const seat = mapDoc.querySelector(`[data-table="${i}"][data-seat="${j}"]`);
                        if (seat) {
                            seat.style.fill = color;
                        }
                    } else {
                        localStorage.removeItem(seatKey);
                    }
                }
            }

            const vibeData = localStorage.getItem(vibeDataKey);
            if (vibeData) {
                const [vibe, expiryTime] = vibeData.split('|');
                if (expiryTime > now) {
                    const teapot = mapDoc.querySelector(`[data-table="${i}"][data-vibe="teapot"]`);
                    const timer = mapDoc.querySelector(`[data-table="${i}"][data-vibe="timer"]`);
                    if (teapot && timer) {
                        teapot.style.opacity = vibe === "Teapot" ? "1" : "0";
                        timer.style.opacity = vibe === "Timer" ? "1" : "0";
                    }
                } else {
                    localStorage.removeItem(vibeDataKey);
                }
            }
        }
    }

    document.getElementById('fillButton').addEventListener('click', fillSeat);
    document.getElementById('vibeButton').addEventListener('click', setVibe);

    tableSelect.addEventListener('change', updateSeatOptions);
    updateSeatOptions();
    applyStoredData();

    // Check every 10 seconds
    setInterval(function () {
        applyStoredData();

        // Reset default values for expired data (both seat colours and vibes)
        for (let i = 1; i <= 5; i++) {
            const numSeats = i <= 2 ? 5 : 4;
            for (let j = 1; j <= numSeats; j++) {
                const seatKey = `table-${i}-seat-${j}`;
                const seatData = localStorage.getItem(seatKey);
                if (!seatData) {
                    const seat = mapDoc.querySelector(`[data-table="${i}"][data-seat="${j}"]`);
                    if (seat) {
                        seat.style.fill = "#8E8E8E";
                    }
                }
            }

            const vibeDataKey = `table-${i}-vibe`;
            const vibeData = localStorage.getItem(vibeDataKey);
            if (!vibeData) {
                const teapot = mapDoc.querySelector(`[data-table="${i}"][data-vibe="teapot"]`);
                const timer = mapDoc.querySelector(`[data-table="${i}"][data-vibe="timer"]`);
                if (teapot && timer) {
                    teapot.style.opacity = "0";
                    timer.style.opacity = "0";
                }
            }
        }
    }, 10000);
});