/**
 * Test script for the Image Converter API
 * 
 * This script demonstrates how to use the API to convert an image to WebP format.
 * 
 * Usage:
 * 1. Make sure the API server is running
 * 2. Run this script with Node.js: node test-api.js
 * 
 * Note: You need to have an image file named "test-image.jpg" in the same directory
 * as this script for it to work properly.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api/convert';
const IMAGE_PATH = path.join(__dirname, 'test-image.jpg'); // Path to test image
const OUTPUT_PATH = path.join(__dirname, 'converted-image.webp'); // Path to save converted image

// Check if test image exists
if (!fs.existsSync(IMAGE_PATH)) {
  console.error(`Error: Test image not found at ${IMAGE_PATH}`);
  console.log('Please place a test image named "test-image.jpg" in the same directory as this script.');
  process.exit(1);
}

// Create form data
const form = new FormData();
form.append('image', fs.createReadStream(IMAGE_PATH));
form.append('filename', 'converted-image');
form.append('quality', '80');

console.log('Sending request to convert image...');

// Send request to API
axios({
  method: 'post',
  url: API_URL,
  data: form,
  headers: {
    ...form.getHeaders(),
  },
  responseType: 'stream', // Important for receiving binary data
})
  .then(response => {
    // Save the converted image
    const writer = fs.createWriteStream(OUTPUT_PATH);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  })
  .then(() => {
    console.log(`Success! Converted image saved to ${OUTPUT_PATH}`);
    console.log('File size comparison:');
    const originalSize = fs.statSync(IMAGE_PATH).size;
    const convertedSize = fs.statSync(OUTPUT_PATH).size;
    console.log(`Original (${path.basename(IMAGE_PATH)}): ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`Converted (${path.basename(OUTPUT_PATH)}): ${(convertedSize / 1024).toFixed(2)} KB`);
    console.log(`Reduction: ${((1 - convertedSize / originalSize) * 100).toFixed(2)}%`);
  })
  .catch(error => {
    console.error('Error converting image:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data.toString());
    } else {
      console.error(error.message);
    }
  });

console.log('Note: To use this test script, you need to install the required dependencies:');
console.log('npm install axios form-data');