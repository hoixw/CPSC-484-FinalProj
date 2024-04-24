# CPSC 484 Final Project

## Members

Alec Buffi - ajb268,
Manaka Ogura - mo588,
Mandy Zhang - mwz8,
Sachin Thakrar - sbt29

## Interactive Map Application

This interactive map application allows users to select tables, assign colors, and choose vibes for their selected table on an SVG map. The application consists of six main files that serve various functions in the project, from rendering the user interface to handling user interactions.

## Files Description

- `index.html`: Serves as the entry point of the application. It provides the initial user interface and loads the interactive SVG map.
- `color-tables.html`: A modal page for displaying color options for the user to select for a particular table.
- `confirmation.html`: A modal page that acts as a default confirmation page, where users can confirm their selections (used for both table selection and color confirmation).
- `vibe.html`: Provides options for users to select a vibe for their chosen table. The vibe options influence the appearance of the table on the map.
- `survey-check.html`: A modal page that confirms whether the user would like to do the end-of-flow survey
- `survey.html`: The modal page used for all of the end-of-flow survey questions. The question element is swapped out depending on the question, though the responses are the same across questions (1-5).
- `script.js`: Contains the JavaScript code that adds interactivity to the SVG map, handles event listeners, and manages user interactions through modal dialogs.
- `cursor.js`: Contains the JavaScript code that controls the Kinect cursor.

## `script.js` Overview

The `script.js` file is the core of the application's functionality. Here's a brief overview of its components and what they do:

### Event Listeners

- Initializes event listeners on DOM content load.
- Adds listeners for table selection and hover effects on the SVG map.
- Removes event listeners and overlap detectors as needed, to stop memory leaks and unintended actions. 

### Table Interaction

- Allows users to hover over tables to see a visual indication of their selection.
- Handles table selection and assigns selected tables with specific colors and vibes based on user input.

### Modal Dialogs

- Dynamically loads content into modal dialogs for color selection, confirmation, and vibe selection.
- Uses promises to manage asynchronous operations, such as fetching HTML content for the modals.

### Local Storage

- Saves and retrieves the state of table selections (including colors and vibes) using the browser's local storage. This ensures that the user's choices persist across sessions.

### Update Loop

- Periodically updates the SVG map to reflect any changes in table status, including color and vibe assignments.

## How to Run

1. To run the website locally, a basic webserver is needed. This can be done by running `python3 -m http.server` in the main directory.
2. Once this server is ran, open the provided localhost link. This server is needed to manage HTTP requests, but is _not_ a backend.
3. Items can be selected through cursor hovering. The hover is currently set to 1.5 seconds, but may be adjusted.

## Bugs
1. Sessions do not expire at the moment. The current session will last until the user refreshes their browser.
2. The kinect cursor can be unpredictable, but this is (largely) due to the data provided to the site.
