HintBot – AI Coding Hints Extension

HintBot is a Chrome extension that provides intelligent, progressive hints for coding problems using AI, designed to help you think and solve more effectively.
Features

    AI-Powered Hints – Get smart, step-by-step hints for coding problems

    Problem Detection – Automatically detects problems on LeetCode

    Smart Analysis – Understands problem difficulty, tags, and patterns

    Progressive Hints – Three levels of hints to gradually build understanding

    Modern Interface – Clean, responsive design with smooth animations

Setup Instructions
1. Clone the Repository

git clone https://github.com/yourusername/hintbot-extension.git
cd hintbot-extension

2. Configure the API Key

    Copy the example config file:

cp config.example.js config.js

Get your API key from https://api.together.xyz/

Open config.js and replace the placeholder with your actual API key:

    const config = {
      apiKey: "your_actual_api_key_here"
    };

3. Install the Extension in Chrome

    Open Chrome and go to chrome://extensions/

    Enable Developer mode (top right)

    Click Load unpacked and select the extension folder

    The extension should now be active

4. How to Use

    Navigate to any LeetCode problem page (e.g., leetcode.com/problems/two-sum/)

    Click the HintBot extension icon in your toolbar

    Press the Scan button to detect the problem

    Click Get AI Hints to receive step-by-step help

    Reveal hints one at a time as needed

Supported Platforms

    LeetCode (fully supported)

Project Structure

hintbot-extension/
├── manifest.json          // Extension manifest
├── popup.html             // Extension UI
├── popup.js               // UI logic
├── content.js             // Content script for detection
├── config.js              // API key (local only)
├── config.example.js      // Sample config file
├── icon.png               // Extension icon
├── .gitignore             // Git ignore settings
└── README.md              // Documentation

Development Tips
Making Changes

    Modify the necessary files

    Go to chrome://extensions/

    Click the Reload button next to HintBot to see your updates

API Key Security

    Your config.js file is excluded from version control (via .gitignore)

    Never commit your actual API key

    Use config.example.js as a template for others

Contributing

    Fork the repository

    Create a feature branch

    Make your changes and test thoroughly

    Submit a pull request

License

This project is licensed under the MIT License. You are free to use and modify it as needed.
Troubleshooting

If something isn’t working:

    Ensure your API key is correctly added in config.js

    Reload the extension in chrome://extensions/

    Check your browser's developer console for errors

    Confirm that you're on a supported platform (LeetCode problem page)

Built by Shivam Thakur – Version 0.1