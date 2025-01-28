class DallEGenerator {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY; // Access environment variable
        this.apiUrl = 'https://api.openai.com/v1/images/generations';
        
        // Get all form elements
        this.stylePreset = document.getElementById('stylePreset');
        this.setting = document.getElementById('setting');
        this.doctorGender = document.getElementById('doctorGender');
        this.doctorEthnicity = document.getElementById('doctorEthnicity');
        this.patientGender = document.getElementById('patientGender');
        this.patientEthnicity = document.getElementById('patientEthnicity');
        this.patientAge = document.getElementById('patientAge');
        this.sceneMood = document.getElementById('sceneMood');
        this.customElements = document.getElementById('customElements');
        this.promptPreview = document.getElementById('promptPreview');
        this.editPrompt = document.getElementById('editPrompt');
        this.generateBtn = document.getElementById('generateBtn');
        this.customStyle = document.getElementById('customStyle');
        this.sceneBuilder = document.querySelector('.scene-builder');
        this.customPromptInput = document.createElement('div');
        this.customPromptInput.className = 'custom-prompt-input';
        this.customPromptInput.innerHTML = `
            <textarea id="customPromptText" placeholder="Enter your custom prompt here..."></textarea>
        `;
        this.sceneBuilder.parentNode.insertBefore(this.customPromptInput, this.sceneBuilder.nextSibling);
        this.customPromptText = document.getElementById('customPromptText');
        this.medicalAction = document.getElementById('medicalAction');
        this.medicalDetails = document.getElementById('medicalDetails');
        
        this.setupEventListeners();
        this.updatePrompt(); // Initialize prompt
        
        // Initialize Feather icons
        feather.replace();
        
        this.setupAnimations();
    }

    setupEventListeners() {
        // Add event listeners to all form elements
        const formElements = [
            this.stylePreset, this.setting, this.doctorGender, this.doctorEthnicity,
            this.patientGender, this.patientEthnicity, this.patientAge, this.sceneMood,
            this.customElements
        ];

        formElements.forEach(element => {
            element.addEventListener('change', () => this.updatePrompt());
        });

        // Make prompt editable when edit button is clicked
        this.editPrompt.addEventListener('click', () => {
            this.promptPreview.contentEditable = true;
            this.promptPreview.focus();
            this.promptPreview.style.backgroundColor = '#ffffff';
            this.promptPreview.style.border = '2px solid var(--primary-color)';
        });

        // Handle Generate button click
        this.generateBtn.addEventListener('click', () => this.generateImages());

        // Add to setupEventListeners
        this.stylePreset.addEventListener('change', () => {
            const isCustom = this.stylePreset.value === 'custom';
            this.sceneBuilder.style.display = isCustom ? 'none' : 'block';
            this.customPromptInput.style.display = isCustom ? 'block' : 'none';
            this.updatePrompt();
        });
        
        this.customPromptText.addEventListener('input', () => {
            if (this.stylePreset.value === 'custom') {
                this.promptPreview.innerHTML = `<p>${this.customPromptText.value}</p>`;
            }
        });

        this.medicalAction.addEventListener('change', () => this.updatePrompt());
        this.medicalDetails.addEventListener('input', () => this.updatePrompt());
    }

    setupAnimations() {
        // Add smooth transitions for form elements
        const formElements = document.querySelectorAll('select, input, textarea');
        formElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.transform = 'scale(1.02)';
            });
            
            element.addEventListener('blur', () => {
                element.style.transform = 'scale(1)';
            });
        });
    }

    updatePrompt() {
        if (this.stylePreset.value === 'custom') {
            this.promptPreview.innerHTML = `<p>${this.customPromptText.value}</p>`;
            return;
        }

        let style = this.stylePreset.value === 'pixar' ? 'Pixar-style 3D animated' : this.stylePreset.value;
        const settingDesc = this.getSettingDescription(this.setting.value);
        const doctorDesc = this.getCharacterDescription('doctor');
        const patientDesc = this.getCharacterDescription('patient');
        const moodDesc = this.getMoodDescription();
        const medicalContext = this.getMedicalContext();
        const additional = this.customElements.value.trim();

        const prompt = `A ${style} scene set in ${settingDesc}. ${doctorDesc} ${patientDesc}. ${medicalContext} ${moodDesc}${additional ? '. ' + additional : ''}.`;

        this.promptPreview.innerHTML = `<p>${prompt}</p>`;
    }

    getSettingDescription(settingValue) {
        const descriptions = {
            'medical-office': 'a warm and brightly lit medical office',
            'hospital-room': 'a modern, well-equipped hospital room',
            'research-facility': 'a state-of-the-art research facility',
            'custom': this.setting.value
        };
        return descriptions[settingValue];
    }

    getCharacterDescription(type) {
        if (type === 'doctor') {
            return `A ${this.doctorEthnicity.value} ${this.doctorGender.value} healthcare professional wearing a white coat with`;
        } else {
            return `A ${this.patientEthnicity.value} ${this.patientGender.value} patient${this.patientAge.value ? ' ' + this.getAgeRange(this.patientAge.value) : ''}`;
        }
    }

    getMoodDescription() {
        const moods = {
            'positive': 'The scene conveys a hopeful and optimistic atmosphere',
            'professional': 'The interaction appears professional and focused',
            'caring': 'The scene demonstrates a caring and supportive environment'
        };
        return moods[this.sceneMood.value];
    }

    getAgeRange(age) {
        age = parseInt(age);
        if (age < 13) return 'as a young child';
        if (age < 20) return 'as a teenager';
        if (age < 25) return 'in their early twenties';
        if (age < 30) return 'in their late twenties';
        if (age < 40) return 'in their thirties';
        if (age < 50) return 'in their forties';
        if (age < 60) return 'in their fifties';
        if (age < 70) return 'in their sixties';
        if (age < 80) return 'in their seventies';
        return 'in their eighties or older years';
    }

    getMedicalContext() {
        const action = this.medicalAction.value;
        const details = this.medicalDetails.value.trim();
        
        if (!details) {
            const defaultActions = {
                'consultation': 'They are having a general medical consultation',
                'examination': 'The doctor is performing a physical examination',
                'discussion': 'They are discussing treatment options',
                'procedure': 'The doctor is performing a medical procedure',
                'custom': ''
            };
            return defaultActions[action] || '';
        }
        
        return details;
    }

    async generateImages() {
        const systemFeedback = document.getElementById('systemFeedback');
        const prompt = this.promptPreview.textContent;
        const imageBoxes = document.querySelectorAll('.image-box');

        // Show loading state
        document.querySelector('.image-grid').style.display = 'grid'; // Force grid to stay visible
        imageBoxes.forEach(box => {
            box.style.display = 'block'; // Ensure boxes stay visible
            const placeholder = box.querySelector('.image-placeholder');
            const img = box.querySelector('.generated-image');
            placeholder.style.display = 'flex';
            img.style.display = 'none';
            placeholder.innerHTML = '<div class="loader"></div>';
        });

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            
            // Update images
            imageBoxes.forEach((box, index) => {
                const placeholder = box.querySelector('.image-placeholder');
                const img = box.querySelector('.generated-image');
                
                if (data.images && data.images[index]) {
                    img.src = data.images[index];
                    img.style.display = 'block';
                    placeholder.style.display = 'none';
                }
            });

            // Enhanced success feedback
            systemFeedback.innerHTML = `
                <div class="feedback-content">
                    <i data-feather="check-circle" class="success-checkmark"></i>
                    <span>Images generated successfully</span>
                    <small style="color: var(--secondary-text)">Ready for download</small>
                </div>
            `;
            feather.replace();
        } catch (error) {
            console.error('Error:', error);
            // Show error state but keep grid visible
            imageBoxes.forEach(box => {
                const placeholder = box.querySelector('.image-placeholder');
                placeholder.innerHTML = 'Generation failed';
            });
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
    // Ensure the grid is visible initially
    document.querySelector('.image-grid').style.display = 'grid';
});