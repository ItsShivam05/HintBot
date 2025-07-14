// 🚀 CONTENT SCRIPT LOADED - This should appear in console immediately
console.log("🚀 Content script loaded successfully on:", window.location.href);

// Enhanced extraction function with context
function testExtraction() {
  console.log("🔍 Testing enhanced extraction...");

  const title = document.querySelector(".text-title-large");
  const desc = document.querySelector(".elfjS");

  console.log("Title element:", title);
  console.log("Description element:", desc);

  if (title && desc) {
    // Extract additional context for better AI prompts
    const context = extractProblemContext();

    let problemText = `${title.innerText.trim()}\n\n${desc.innerText.trim()}`;

    // Add difficulty if found
    if (context.difficulty) {
      problemText = `${title.innerText.trim()} (${
        context.difficulty
      })\n\n${desc.innerText.trim()}`;
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

    // Copy to clipboard
    navigator.clipboard
      .writeText(problemText)
      .then(() => {
        console.log("✅ Copied to clipboard");
      })
      .catch((err) => {
        console.error("❌ Clipboard error:", err);
      });

    // Send to popup
    chrome.runtime.sendMessage({
      action: "sendProblem",
      content: problemText,
    });

    return true;
  } else {
    console.log("❌ Could not find problem elements");
    return false;
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

    // Extract topic tags
    const topicElements = document.querySelectorAll(
      '[class*="tag"], [class*="topic"], .rounded-full, .bg-fill-3'
    );
    topicElements.forEach((el) => {
      const text = el.innerText?.trim();
      if (
        text &&
        text.length > 0 &&
        text.length < 30 &&
        !text.includes("Company")
      ) {
        // Filter out non-topic elements
        if (!["Easy", "Medium", "Hard", "Premium", "Plus"].includes(text)) {
          context.topics.push(text);
        }
      }
    });

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

// Test on page load
setTimeout(testExtraction, 2000);

// Handle scan button
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "rescan") {
    console.log("🔄 Manual rescan requested");
    try {
      const success = testExtraction();
      sendResponse({ success: success || false });
    } catch (error) {
      console.error("❌ Error during rescan:", error);
      sendResponse({ success: false });
    }
  }
  return true; // Keep the message channel open for async response
});

console.log("🎉 Content script setup complete");
