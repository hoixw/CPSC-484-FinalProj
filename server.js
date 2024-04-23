const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

// Secure directory for storing CSV file
const csvDirectory = path.join(__dirname, 'csv_files');
if (!fs.existsSync(csvDirectory)) {
  fs.mkdirSync(csvDirectory);
}

// CSV file path
const csvFilePath = path.join(csvDirectory, 'survey_results.csv');

// Initialize the CSV file with a header row if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Engagement Level\n');
}

// Route for handling form submission
app.post('/submit-survey', (req, res) => {
  console.log("I made it here");
  const { engagement } = req.body;

  // Append the engagement value to the CSV file
  fs.appendFileSync(csvFilePath, `${engagement}\n`);

  res.send('Survey submission saved successfully');
});

// Route for accessing the CSV file
app.get('/survey-results', (req, res) => {
  // Read the CSV file content
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');

  // Set the appropriate content type for CSV files
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="survey_results.csv"');

  // Send the CSV file content as the response
  res.send(csvContent);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});