function handleSubmit() {
    const engagementValue = document.getElementById('engagement-range').value;
  
    // Send the form data to the server-side script
    fetch('/path/to/server-side-script.php', {
      method: 'POST',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `engagement=${engagementValue}`
    })
    .then(response => response.blob()) // Get the response as a Blob
    .then(blob => {
      // Create a temporary URL for the Blob object
      const url = window.URL.createObjectURL(blob);
  
      // Create a link element to initiate the file download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_results.xlsx'; // Set the desired file name
      document.body.appendChild(a);
      a.click();
  
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      // Handle any errors
      console.error('Error:', error);
    });
  }