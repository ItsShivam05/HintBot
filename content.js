// 🚀 CONTENT SCRIPT LOADED - This should appear in console immediately
console.log("🚀 Content script loaded successfully on:", window.location.href);

// Enhanced extraction function with context
function extractProblemText() {
  console.log("🔍 Testing enhanced extraction...");

  // Try multiple selectors for title
  const titleSelectors = [
    ".text-title-large",
    "[data-cy='question-title']",
    ".text-xl.font-medium",
    ".css-v3d350",
    ".text-gray-7",
    "h4",
    ".text-lg",
  ];

  let title = null;
  for (const selector of titleSelectors) {
    title = document.querySelector(selector);
    if (title && title.textContent.trim()) break;
  }

  // Try multiple selectors for description
  const descSelectors = [
    ".elfjS",
    "[data-track-load='description_content']",
    ".text-body",
    ".css-1jqueqk",
    ".text-gray-7 p",
    ".description",
    ".question-content",
  ];

  let desc = null;
  for (const selector of descSelectors) {
    desc = document.querySelector(selector);
    if (desc && desc.textContent.trim()) break;
  }

  console.log("Title element:", title);
  console.log("Title text:", title?.textContent || "Not found");
  console.log("Description element:", desc);
  console.log(
    "Description text:",
    desc?.textContent?.substring(0, 100) || "Not found"
  );

  if (title && desc) {
    // Extract additional context for better AI prompts
    const context = extractProblemContext();

    let problemText = `${title.textContent.trim()}\n\n${desc.textContent.trim()}`;

    // Add difficulty if found
    if (context.difficulty) {
      problemText = `${title.textContent.trim()} (${
        context.difficulty
      })\n\n${desc.textContent.trim()}`;
    }

    // Add topic tags if found
    if (context.topics.length > 0) {
      problemText += `\n\nTopics: ${context.topics.join(", ")}`;
    }

    console.log(
      "✅ Enhanced problem extracted:",
      problemText.substring(0, 150) + "..."
    );
    console.log("📊 Context extracted:", context);

    return { success: true, problemText: problemText };
  } else {
    console.log("❌ Could not find problem elements");
    console.log("Available elements on page:");
    console.log("- H1 tags:", document.querySelectorAll("h1").length);
    console.log("- H2 tags:", document.querySelectorAll("h2").length);
    console.log("- H3 tags:", document.querySelectorAll("h3").length);
    console.log("- H4 tags:", document.querySelectorAll("h4").length);
    console.log("- Divs with text:", document.querySelectorAll("div").length);
    return { success: false, problemText: null };
  }
}

// Extract additional problem context
function extractProblemContext() {
  const context = {
    difficulty: null,
    topics: [],
    likes: null,
    acceptance: null,
    companies: [],
  };

  try {
    // Extract difficulty from LeetCode
    const difficultyElement = document.querySelector(
      '[diff], .text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard, .inline-flex[class*="text-difficulty"], [class*="text-olive"], [class*="text-yellow"], [class*="text-red"]'
    );
    if (difficultyElement) {
      const diffText =
        difficultyElement.innerText || difficultyElement.textContent;
      if (
        diffText.includes("Easy") ||
        difficultyElement.className.includes("olive")
      ) {
        context.difficulty = "Easy";
      } else if (
        diffText.includes("Medium") ||
        difficultyElement.className.includes("yellow")
      ) {
        context.difficulty = "Medium";
      } else if (
        diffText.includes("Hard") ||
        difficultyElement.className.includes("red")
      ) {
        context.difficulty = "Hard";
      }
    }

    // Alternative difficulty detection
    if (!context.difficulty) {
      const diffAlt = document.querySelector('[class*="text-difficulty"]');
      if (diffAlt) {
        const className = diffAlt.className;
        if (className.includes("easy")) context.difficulty = "Easy";
        else if (className.includes("medium")) context.difficulty = "Medium";
        else if (className.includes("hard")) context.difficulty = "Hard";
      }
    }

    // Extract topic tags with better filtering
    const topicElements = document.querySelectorAll(
      '[class*="tag"], [class*="topic"], .rounded-full, .bg-fill-3, [class*="badge"]'
    );
    const validTopics = new Set();

    topicElements.forEach((el) => {
      const text = el.textContent?.trim();
      if (
        text &&
        text.length > 2 &&
        text.length < 25 &&
        !text.includes("Company") &&
        !text.includes("companies") &&
        !text.match(/^\d+$/) && // Not just numbers
        !text.includes("Hint") &&
        !text.includes("Yes") &&
        !text.includes("No") &&
        !text.includes("Case") &&
        !text.includes("[") &&
        !text.includes("]")
      ) {
        // Filter out non-topic elements
        if (
          ![
            "Easy",
            "Medium",
            "Hard",
            "Premium",
            "Plus",
            "Topics",
            "Companies",
            "Hint",
            "Related Topics",
          ].includes(text)
        ) {
          validTopics.add(text);
        }
      }
    });

    context.topics = Array.from(validTopics).slice(0, 5); // Limit to 5 most relevant topics

    // Extract acceptance rate
    const acceptanceEl = document.querySelector('[class*="acceptance"]');
    if (acceptanceEl) {
      const match = acceptanceEl.innerText.match(/(\d+\.?\d*)%/);
      if (match) context.acceptance = match[1];
    }

    // Extract likes/dislikes
    const likeEl = document.querySelector(
      '[class*="like"], [data-track-load*="like"]'
    );
    if (likeEl) {
      const likeText = likeEl.innerText;
      const match = likeText.match(/(\d+)/);
      if (match) context.likes = parseInt(match[1]);
    }

    console.log("🔍 Extracted context:", context);
    return context;
  } catch (error) {
    console.error("❌ Error extracting context:", error);
    return context;
  }
}

// Extract code from LeetCode editor
function extractCodeFromEditor() {
  console.log("🔍 Attempting to extract code from editor...");

  // Try multiple selectors for LeetCode's code editor
  const editorSelectors = [
    ".monaco-editor .view-lines", // Monaco editor content
    ".CodeMirror-code", // CodeMirror editor
    '[data-cy="code-area"] .monaco-editor', // LeetCode specific
    ".monaco-editor textarea", // Monaco textarea
    "#editor textarea", // Generic editor
    '[role="textbox"]', // Generic text input
    ".ace_text-input", // Ace editor
  ];

  let code = null;
  let editorType = "unknown";

  for (const selector of editorSelectors) {
    const editorElement = document.querySelector(selector);
    if (editorElement) {
      console.log(`Found editor with selector: ${selector}`);

      if (selector.includes("monaco")) {
        // Monaco editor - try to get the model content
        editorType = "Monaco";
        // Monaco editors store content in a model, try to access it
        if (window.monaco && window.monaco.editor) {
          const editors = window.monaco.editor.getEditors();
          if (editors && editors.length > 0) {
            code = editors[0].getValue();
            console.log("✅ Got code from Monaco editor model");
            break;
          }
        }
        // Fallback: try to get text content
        code = editorElement.textContent || editorElement.innerText;
      } else if (selector.includes("CodeMirror")) {
        // CodeMirror editor
        editorType = "CodeMirror";
        const cmInstance = editorElement.CodeMirror;
        if (cmInstance) {
          code = cmInstance.getValue();
          console.log("✅ Got code from CodeMirror instance");
          break;
        }
        code = editorElement.textContent || editorElement.innerText;
      } else {
        // Generic text content
        editorType = "Generic";
        code =
          editorElement.value ||
          editorElement.textContent ||
          editorElement.innerText;
      }

      if (code && code.trim().length > 10) {
        console.log(
          `✅ Code extracted from ${editorType} editor:`,
          code.substring(0, 100) + "..."
        );
        break;
      }
    }
  }

  if (!code || code.trim().length < 10) {
    console.log("❌ Could not find code in editor");
    return { success: false, code: null, editorType: null };
  }

  // Clean up the code
  code = code.trim();

  // Remove common editor artifacts
  code = code.replace(/^\d+\s*/gm, ""); // Remove line numbers
  code = code.replace(/^[\s]*$\n/gm, ""); // Remove empty lines

  return { success: true, code: code, editorType: editorType };
}

// Test on page load (but don't do anything with the result since we're auto-hint now)
setTimeout(() => {
  extractProblemText();
}, 2000);

// Handle scan button - this is what the popup calls to get problem text
function setupMessageListener() {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.onMessage
  ) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "rescan") {
        console.log("🔄 Manual rescan requested");
        try {
          const result = extractProblemText();
          sendResponse(result);
        } catch (error) {
          console.error("❌ Error during rescan:", error);
          sendResponse({ success: false, problemText: null });
        }
      } else if (message.action === "extractCode") {
        console.log("💻 Code extraction requested");
        try {
          const result = extractCodeFromEditor();
          sendResponse(result);
        } catch (error) {
          console.error("❌ Error during code extraction:", error);
          sendResponse({ success: false, code: null, editorType: null });
        }
      }
      return true; // Keep the message channel open for async response
    });
    console.log("✅ Message listener setup complete");
  } else {
    console.error("❌ Chrome runtime APIs not available");
    // Retry after a short delay
    setTimeout(setupMessageListener, 100);
  }
}

// Setup message listener
setupMessageListener();

console.log("🎉 Content script setup complete");
