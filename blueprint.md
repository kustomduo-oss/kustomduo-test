# Face Blender AI - Blueprint

## 1. Project Overview

Face Blender AI is a web-based application that allows users to create unique character images. It features a two-stage process:
1.  **Face Blending**: Users can upload two face images and blend them together with a slider to create a unique base face.
2.  **Pose & Clothing Application**: The blended face is then combined with a user-provided pose reference and clothing reference to generate a final character image using a generative AI model.

The application is built with modern, framework-less web technologies, using Web Components for a modular and maintainable structure.

## 2. Design and Features (Planned Implementation)

### Aesthetics & Styling:
- **Layout**: A clean, intuitive, multi-step layout that guides the user through the creation process.
- **Color Palette**: A modern and clean palette, primarily using slate and blue tones to create a professional and user-friendly interface.
- **Components**: The UI will be composed of custom web components for each logical part of the application, such as image uploaders, sliders, and step containers.

### Core Functional Flow:

**Phase 1: Face Blending (Step 1)**
- The user is presented with two large upload areas, one for "Person 1" and one for "Person 2".
- A "Paste from Clipboard" option will be available for convenience.
- A slider allows the user to define the blending percentage between the two faces (e.g., 70% P1, 30% P2).
- Additional options for the generation model, resolution, aspect ratio, and quantity will be provided.
- A "Blend Faces" button initiates the creation of the base face. The result of this step will be the input for Phase 2.

**Phase 2: Pose & Clothing Application (Step 2)**
- This step displays the base face identity generated in the previous phase.
- The user is prompted to upload two new images:
    1.  **Pose Reference (Structure)**: Determines the body pose, background, and camera angle.
    2.  **Clothing Reference (Attire)**: Determines the outfit the character will wear.
- A "Generate Result" button triggers the final image generation by the AI model, combining the base face, pose, and clothing references.
- A "Back" button allows the user to return to the face blending step.

## 3. Implementation Plan

To achieve the new design, the following refactoring and development will be undertaken:

1.  **Update `ImageUpload.js`**: Modify the component to match the new design seen in the screenshots, including the icon, text, and layout. Add a "Paste" button feature.
2.  **Rewrite `StepOne.js`**: Completely overhaul the component to implement the Face Blending UI. This includes adding two image uploaders, a blending slider, configuration dropdowns, and a "Blend Faces" button.
3.  **Rewrite `StepTwo.js`**: Rebuild the component to match the Pose & Clothing reference upload UI. This includes updating the text, labels, and button layout.
4.  **Refactor `AppContainer.js`**: Update the central state management logic to accommodate the new two-phase flow. This involves handling the state of the two uploaded faces, the blend ratio, the resulting blended face, and passing the correct data between the steps.
5.  **Update AI Service**: The `GenerativeAi.js` service will be updated to handle two distinct types of requests: one for blending faces and another for generating the final character.
