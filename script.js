document.getElementById("map").addEventListener("load", function () {
    const vibeTableSelect = document.getElementById("table-select-vibe");
    const vibeSelect = document.getElementById("vibe-select");
    const mapDoc = document.getElementById("map").contentDocument;

    let hoverTimeout;

    function fillSeat(tableNum) {
        const color = `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`;

        const numSeats = tableNum <= 2 ? 5 : 4;
        let seatFilled = false;

        for (let i = 1; i <= numSeats; i++) {
            const seat = mapDoc.querySelector(`[data-table="${tableNum}"][data-seat="${i}"]`);
            if (seat && (seat.style.fill === "#8E8E8E") || (seat.style.fill === "rgb(142, 142, 142)")) {
                seat.style.fill = color;
                // Store the table, seat, and color in local storage with a 30-second expiry
                const expiryTime = new Date().getTime() + (30 * 1000);
                localStorage.setItem(`table-${tableNum}-seat-${i}`, `${color}|${expiryTime}`);
                seatFilled = true;
                break;
            }
        }

        if (!seatFilled) {
            console.log(`All seats for table ${tableNum} are full.`);
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

    function applyStoredData() {
        const now = new Date().getTime();
        for (let i = 1; i <= 5; i++) {
            const numSeats = i <= 2 ? 5 : 4;
            for (let j = 1; j <= numSeats; j++) {
                const seatKey = `table-${i}-seat-${j}`;
                const seatData = localStorage.getItem(seatKey);
                if (seatData) {
                    const [color, expiryTime] = seatData.split("|");
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

            const vibeDataKey = `table-${i}-vibe`;
            const vibeData = localStorage.getItem(vibeDataKey);
            if (vibeData) {
                const [vibe, expiryTime] = vibeData.split("|");
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

    function handleTableClick(event) {
        const tableNum = event.target.getAttribute("data-hover");
        if (tableNum) {
          fillSeat(tableNum);
        }
      }

    function handleTableHover(event) {
        const tableNum = event.target.getAttribute("data-hover");
        if (tableNum) {
          hoverTimeout = setTimeout(function () {
            const tableOutline = mapDoc.querySelector(`[data-outline="${tableNum}"]`);
            if (tableOutline) {
              tableOutline.style.strokeWidth = "4";
              tableOutline.style.fill = "#B7C9E2";
            }
          }, 1500);
    
          clickTimeout = setTimeout(function () {
            handleTableClick(event);
          }, 3000);
        }
      }
    
    function handleTableLeave(event) {
        const tableNum = event.target.getAttribute("data-hover");
        if (tableNum) {
          clearTimeout(hoverTimeout);
          clearTimeout(clickTimeout);
          const tableOutline = mapDoc.querySelector(`[data-outline="${tableNum}"]`);
          if (tableOutline) {
            tableOutline.style.strokeWidth = "2";
            tableOutline.style.fill = "white";
          }
        }
      }

    document.getElementById("vibeButton").addEventListener("click", setVibe);
    const tableHovers = mapDoc.querySelectorAll("[data-hover]");
    tableHovers.forEach(hover => {
        hover.addEventListener("mouseenter", handleTableHover);
        hover.addEventListener("mouseleave", handleTableLeave);
    });

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