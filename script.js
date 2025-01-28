class DallEGenerator {
    constructor() {
        this.apiKey = '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'; // Replace with your actual API key
        this.apiUrl = 'https://api.openai.com/v1/images/generations';
        this.setupEventListeners();
    }

    setupEventListeners() {
        const promptInput = document.getElementById('promptInput');
        const generateBtn = document.getElementById('generateBtn');

        // Handle Enter key
        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateImage(promptInput.value);
            }
        });

        // Handle Generate button click
        generateBtn.addEventListener('click', () => {
            this.generateImage(promptInput.value);
        });
    }

    async generateImage(prompt) {
        if (!prompt.trim()) return;

        const systemFeedback = document.getElementById('systemFeedback');
        const feedbackContent = systemFeedback.querySelector('.feedback-content span');
        feedbackContent.textContent = 'Generating your images...';

        // Clear previous images and show placeholders
        const imageBoxes = document.querySelectorAll('.image-box');
        imageBoxes.forEach((box, index) => {
            box.style.background = 'var(--surface-color)';
            const placeholder = box.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
                placeholder.querySelector('.placeholder-text').textContent = `Generating ${index + 1}...`;
            }
        });

        try {
            // Generate 3 images in parallel
            const promises = Array(3).fill().map(() => 
                fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'dall-e-3',
                        prompt: prompt,
                        n: 1,
                        size: '1024x1024'
                    })
                }).then(res => res.json())
            );

            const results = await Promise.all(promises);
            
            results.forEach((data, index) => {
                if (data.data && data.data[0].url) {
                    this.displayImage(data.data[0].url, index);
                }
            });

            feedbackContent.textContent = 'Images generated successfully!';
        } catch (error) {
            feedbackContent.textContent = `Error: ${error.message}`;
        }
    }

    displayImage(imageUrl, index) {
        const imageBox = document.querySelectorAll('.image-box')[index];
        if (imageBox) {
            // Create and load the image first
            const img = new Image();
            img.onload = () => {
                // Hide the placeholder
                const placeholder = imageBox.querySelector('.image-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // Set the background image
                imageBox.style.background = `url(${imageUrl}) center center/cover no-repeat`;
                
                // Show the download button
                const downloadBtn = imageBox.querySelector('.download-btn');
                if (downloadBtn) {
                    downloadBtn.style.opacity = '1';
                    downloadBtn.onclick = () => this.downloadImage(imageUrl, `generated-image-${index + 1}.png`);
                }
            };
            img.src = imageUrl;
        }
    }

    async downloadImage(imageUrl, fileName) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new DallEGenerator();
});