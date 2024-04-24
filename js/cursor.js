document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("map").addEventListener("load", function () {
        var host = "cpsc484-01.stdusr.yale.internal:8888";
        $(document).ready(function () {
            frames.start();
        });

        const cursor = document.querySelector(".cursor");

        var frames = {
            socket: null,

            start: function () {
                var url = "ws://" + host + "/frames";
                frames.socket = new WebSocket(url);
                frames.socket.onmessage = function (event) {
                    var data = JSON.parse(event.data);
                    var command = frames.get_right_wrist_command(data);
                    if (command !== null) {
                        frames.update_cursor(command);
                    }
                };
            },

            get_right_wrist_command: function (frame) {
                let person = frame.people[0];

                // Kinect observed values
                const minX = -60,
                    maxX = 200;
                const minY = 0,
                    maxY = 250;

                // Screen resolution
                const targetMinX = 0,
                    targetMaxX = 1920;
                const targetMinY = -1080,
                    targetMaxY = 0;

                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;

                
                if (frame.people.length < 1) {
                    return null;
                } else if (frame.people.length > 1) {
                    let minDistance = Infinity;
                    for (let i = 0; i < frame.people.length; i++) {
                        const curPerson = frame.people[i];
                        const pelvis = curPerson.joints[0];

                        if (pelvis.valid) {
                            const distanceX = pelvis.pixel.x - centerX;
                            const distanceY = pelvis.pixel.y - centerY;
                            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                            if (distance < minDistance) {
                                minDistance = distance;
                                person = curPerson;
                            }
                        }
                    }
                }

                // Normalize by subtracting the root (pelvis) joint coordinates
                var pelvis = person.joints[0];
                var right_wrist = person.joints[14];

                if (right_wrist.valid && pelvis.valid) {
                    // Normalise coordinates
                    var normalizedX =
                        ((pelvis.pixel.x - right_wrist.pixel.x - minX) *
                            (targetMaxX - targetMinX)) /
                            (maxX - minX) +
                        targetMinX;
                    var normalizedY =
                        ((pelvis.pixel.y - right_wrist.pixel.y - minY) *
                            (targetMaxY - targetMinY)) /
                            (maxY - minY) +
                        targetMinY;

                    // Ensure the normalised values are not outside bounds
                    normalizedX = Math.max(
                        targetMinX,
                        Math.min(normalizedX, targetMaxX),
                    );
                    normalizedY = Math.max(
                        targetMinY,
                        Math.min(normalizedY, targetMaxY),
                    );

                    return {
                        x: normalizedX,
                        y: normalizedY,
                    };
                }

                return null;
            },

            // Updates cursor position
            update_cursor: function (result) {
                cursor.style.bottom = `${result.y}px`;
                cursor.style.left = `${result.x}px`;
            },
        };
    });
});
