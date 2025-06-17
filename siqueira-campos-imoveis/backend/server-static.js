const express = require('express');
const path = require('path');

const app = express();
const port = 3004; // Use a different port than frontend dev server

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For all other routes, serve index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log("Static server running on http://localhost:" + port);
});
