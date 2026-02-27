import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// This function now robustly handles both File/Blob objects and data URL strings.
async function fileToGenerativePart(fileOrUrl) {
    let file;
    // If the input is a data URL string, convert it to a Blob
    if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:')) {
        const response = await fetch(fileOrUrl);
        const blob = await response.blob();
        // The Gemini API works with Blobs, but creating a File gives us a standardized object.
        file = new File([blob], "uploaded_image.png", { type: blob.type });
    } else {
        file = fileOrUrl;
    }

    // Ensure we have a Blob or File object before proceeding
    if (!(file instanceof Blob)) {
        console.error("Invalid input to fileToGenerativePart:", file);
        throw new TypeError("The provided input must be a File, Blob, or a data URL string.");
    }

    const base64EncodedData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                // remove the data:image/png;base64, prefix
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("File could not be read."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
}

class GenerativeAi {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("API key is required.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        const imageGenConfig = { responseModalities: ['TEXT', 'IMAGE'] };
        this.flashModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-image", generationConfig: imageGenConfig });
        this.proModel = this.genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview", generationConfig: imageGenConfig });
    }

    async _generateWithRetry(model, prompt, imageParts) {
        try {
            const result = await model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const parts = response.candidates[0].content.parts;
            const imagePart = parts.find(p => p.inlineData);
            if (!imagePart) throw new Error("No image was returned by the model.");
            return { status: 'SUCCESS', data: `data:image/png;base64,${imagePart.inlineData.data}` };
        } catch (error) {
            console.error("Error during AI generation:", error.message);

            if (error.message && (error.message.includes('429') || error.message.toLowerCase().includes('quota'))) {
                const retryMatch = error.message.match(/retryDelay\":\"(\d+)s/) || error.message.match(/Please retry in (\d+\.?\d*)s/);
                let retrySeconds = 60;

                if (retryMatch && retryMatch[1]) {
                     retrySeconds = Math.ceil(parseFloat(retryMatch[1]));
                }
                
                return { status: 'RATE_LIMIT', retryAfter: retrySeconds };
            }
            
            return { status: 'ERROR', error: "The AI model failed to generate an image." };
        }
    }

    async generateBlendedFace(person1File, person2File, blendRatio, aspectRatio, modelType = 'flash') {
        const model = modelType === 'pro' ? this.proModel : this.flashModel;
        const imageParts = [
            await fileToGenerativePart(person1File),
            await fileToGenerativePart(person2File)
        ];
        const prompt = `Blend the facial features of the two provided people. The blend ratio should be ${100 - blendRatio}% of the first person and ${blendRatio}% of the second. Generate a realistic passport-style portrait: upper body, front-facing, neutral expression, plain light background. The result will be used as a face reference, so prioritize facial clarity and a ${aspectRatio} aspect ratio.`;

        return this._generateWithRetry(model, prompt, imageParts);
    }

    async generateFinalImage(faceFile, poseFile, clothingFile, aspectRatio, modelType = 'flash') {
        const model = modelType === 'pro' ? this.proModel : this.flashModel;
        const imageParts = [
            await fileToGenerativePart(faceFile),
            await fileToGenerativePart(poseFile),
            await fileToGenerativePart(clothingFile)
        ];
        const prompt = `You are given three reference images in order:
1. Face reference: a portrait of a person whose face should be used.
2. Pose reference: a photo showing the body pose and composition to replicate.
3. Clothing reference: a photo of an outfit that should be worn.

Generate a single photorealistic image of the person from image 1 (face), placed in the exact pose from image 2 (pose), wearing the exact outfit from image 3 (clothing). Preserve the face identity, match the pose precisely, and accurately reproduce the clothing style. Use a ${aspectRatio} aspect ratio.`;
        
        return this._generateWithRetry(model, prompt, imageParts);
    }
}

export default GenerativeAi;
