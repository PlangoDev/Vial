# Image to 3D Model Website

This project demonstrates a website that converts an image into a textured 3D model using Three.js. The uploaded image becomes both a height map and the color texture for the resulting mesh. You can download the mesh as an OBJ file along with a texture image – no external APIs required.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3000` in your browser and upload an image to visualize the generated 3D model. Use the mouse to rotate the view. When satisfied, click **Download OBJ** to save the model and texture.
