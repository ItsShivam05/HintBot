// Import API key from secure config
// Make sure config.js is loaded before this script in manifest.json

// Enhanced problem analysis function
function analyzeProblem(problemText) {
  const analysis = {
    difficulty: "Medium", // Default
    topics: [],
    timeComplexity: "",
    hasExamples: false,
    constraints: "",
  };

  // Detect difficulty from common patterns
  const difficultyPatterns = [
    { pattern: /\b(easy|simple|basic|trivial)\b/i, level: "Easy" },
    { pattern: /\b(medium|moderate|intermediate)\b/i, level: "Medium" },
    { pattern: /\b(hard|difficult|challenging|complex)\b/i, level: "Hard" },
    { pattern: /\b(very hard|extremely hard|contest)\b/i, level: "Very Hard" },
  ];

  for (const { pattern, level } of difficultyPatterns) {
    if (pattern.test(problemText)) {
      analysis.difficulty = level;
      break;
    }
  }

  // Detect if it's from LeetCode and extract difficulty
  if (
    problemText.includes("Easy") ||
    problemText.includes("Medium") ||
    problemText.includes("Hard")
  ) {
    const diffMatch = problemText.match(/\b(Easy|Medium|Hard)\b/);
    if (diffMatch) analysis.difficulty = diffMatch[1];
  }

  // Detect common algorithm topics
  const topicPatterns = [
    { pattern: /\b(array|list|sort|search)\b/i, topic: "Arrays" },
    { pattern: /\b(tree|binary tree|bst)\b/i, topic: "Trees" },
    { pattern: /\b(graph|node|edge|dfs|bfs)\b/i, topic: "Graphs" },
    {
      pattern: /\b(dynamic programming|dp|memoization)\b/i,
      topic: "Dynamic Programming",
    },
    { pattern: /\b(string|substring|palindrome)\b/i, topic: "Strings" },
    { pattern: /\b(hash|map|dictionary)\b/i, topic: "Hash Tables" },
    { pattern: /\b(linked list|node|pointer)\b/i, topic: "Linked Lists" },
    { pattern: /\b(stack|queue|deque)\b/i, topic: "Stacks & Queues" },
    { pattern: /\b(recursive|recursion|backtrack)\b/i, topic: "Recursion" },
    {
      pattern: /\b(greedy|optimal|minimum|maximum)\b/i,
      topic: "Greedy Algorithms",
    },
  ];

  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(problemText)) {
      analysis.topics.push(topic);
    }
  }

  // Check for examples
  analysis.hasExamples = /example|input|output/i.test(problemText);

  // Extract constraints
  const constraintMatch = problemText.match(
    /constraint[s]?:?\s*(.+?)(?=\n\n|\n[A-Z]|$)/i
  );
  if (constraintMatch) {
    analysis.constraints = constraintMatch[1].trim();
  }

  return analysis;
}

// Enhanced AI prompt generator
function generateEnhancedPrompt(problemText, analysis) {
  const difficultyGuidance = {
    Easy: "Focus on intuitive approaches and fundamental concepts. Guide toward simple, working solutions.",
    Medium:
      "Balance efficiency with clarity. Highlight key algorithmic patterns and data structure choices.",
    Hard: "Emphasize crucial insights and advanced techniques. Focus on optimization and edge cases.",
    "Very Hard":
      "Provide deep algorithmic insights and complex pattern recognition. Highlight sophisticated approaches.",
  };

  const topicHints =
    analysis.topics.length > 0
      ? `Key topics: ${analysis.topics.join(", ")}. `
      : "";

  return `You are an expert competitive programmer and mentor. Analyze this ${
    analysis.difficulty
  } problem and provide exactly 3 progressive, connected hints.

${difficultyGuidance[analysis.difficulty]}
${topicHints}

CRITICAL REQUIREMENTS:
- Keep each hint SHORT (1 sentence maximum)
- NEVER give away the solution or detailed steps
- Each hint must BUILD ON the previous one
- Create a CONNECTED story that guides thinking step by step
- Focus on asking the right questions, not giving answers

PROGRESSIVE STRUCTURE:
1. **What to Notice**: Point out a key observation about the problem
2. **What This Means**: Build on hint 1 - what does that observation suggest?
3. **What to Focus On**: Build on hint 2 - what specific aspect should they consider?

EXAMPLES OF GOOD CONNECTED HINTS:
Hint 1: "Notice what happens when you process elements in a specific order"
Hint 2: "This ordering reveals a pattern in how information flows"
Hint 3: "Focus on what information you need to track during this flow"

EXAMPLES OF BAD HINTS (DON'T DO THIS):
- Long explanations or multiple sentences
- Unconnected random suggestions
- Specific implementation details

Problem:
${problemText}

Generate exactly 3 numbered hints (1 sentence each) that connect and build understanding step by step:`;
}

document.getElementById("hintBtn").addEventListener("click", async () => {
  const input = document.getElementById("problemInput").value.trim();
  const responseDiv = document.getElementById("response");

  if (!input) {
    responseDiv.textContent = "❗ Please enter a problem description.";
    return;
  }

  // Get API key from config
  const apiKey = window.config?.apiKey;

  // Check if API key is configured
  if (!apiKey || apiKey === "your_together_ai_api_key_here") {
    responseDiv.innerHTML = `
      <div style="text-align: center; padding: 12px; color: #dc3545;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔑</div>
        <div style="font-weight: 600; margin-bottom: 8px;">API Key Not Configured</div>
        <div style="font-size: 13px; line-height: 1.4;">
          Please set up your Together AI API key in the config.js file.
        </div>
      </div>
    `;
    return;
  }

  responseDiv.innerHTML = "⏳ Analyzing problem and generating hints...";

  try {
    // Analyze the problem for better context
    const analysis = analyzeProblem(input);
    const enhancedPrompt = generateEnhancedPrompt(input, analysis);

    console.log("Problem Analysis:", analysis);
    console.log("Enhanced Prompt:", enhancedPrompt);

    const res = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    console.log("Mistral Response:", data);

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      responseDiv.textContent = "❌ Could not generate hints.";
      return;
    }

    // Clear previous content
    responseDiv.innerHTML = "";

    // More robust hint parsing - try multiple patterns
    let hints = [];

    // Try different splitting patterns
    const splitPatterns = [
      /\n\d+\.\s+/, // "1. ", "2. ", "3. "
      /\n\d+:\s+/, // "1: ", "2: ", "3: "
      /\n\d+\)\s+/, // "1) ", "2) ", "3) "
      /\n(?=\d+[\.\):\s])/, // Any number followed by punctuation
      /\n(?=hint\s*\d+)/i, // "hint 1", "hint 2", etc.
    ];

    for (const pattern of splitPatterns) {
      hints = reply.split(pattern).filter((part) => part.trim().length > 0);
      if (hints.length >= 3) break;
    }

    // If still no good split, try manual extraction
    if (hints.length < 3) {
      const lines = reply.split("\n");
      hints = [];
      let currentHint = "";

      for (const line of lines) {
        if (/^\d+[\.\):\s]/.test(line.trim())) {
          if (currentHint.trim()) {
            hints.push(currentHint.trim());
          }
          currentHint = line;
        } else {
          currentHint += "\n" + line;
        }
      }
      if (currentHint.trim()) {
        hints.push(currentHint.trim());
      }
    }

    // Ensure we have exactly 3 hints and keep them concise
    if (hints.length < 3) {
      // Split long hints or create generic ones
      if (hints.length === 1 && hints[0].length > 200) {
        const sentences = hints[0]
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 0);
        hints = [
          sentences.slice(0, Math.ceil(sentences.length / 3)).join(".") + ".",
          sentences
            .slice(
              Math.ceil(sentences.length / 3),
              2 * Math.ceil(sentences.length / 3)
            )
            .join(".") + ".",
          sentences.slice(2 * Math.ceil(sentences.length / 3)).join(".") + ".",
        ];
      } else {
        while (hints.length < 3) {
          hints.push("Think about this problem step by step.");
        }
      }
    } else if (hints.length > 3) {
      hints = hints.slice(0, 3);
    }

    // Trim and ensure hints are complete sentences
    hints = hints.map((hint) => {
      let cleanHint = hint.replace(/^(\d+\. )?hint\s*\d+:\s*/i, "").trim();
      // Remove markdown formatting if present
      cleanHint = cleanHint.replace(/\*\*(.*?)\*\*/g, "$1");

      // If hint is too long, try to find a good breaking point
      if (cleanHint.length > 180) {
        // Look for sentence endings within reasonable length
        const sentences = cleanHint.split(/[.!?]+/);
        let result = "";

        for (let i = 0; i < sentences.length; i++) {
          const potentialResult =
            result + sentences[i] + (i < sentences.length - 1 ? "." : "");
          if (potentialResult.length <= 180) {
            result = potentialResult;
          } else {
            break;
          }
        }

        // If we got a complete sentence, use it
        if (result.length > 0 && result.endsWith(".")) {
          cleanHint = result;
        } else {
          // Otherwise, find the last complete word before 180 chars
          const words = cleanHint.split(" ");
          result = "";
          for (const word of words) {
            if ((result + word).length <= 180) {
              result += (result ? " " : "") + word;
            } else {
              break;
            }
          }
          cleanHint = result.trim();
          // Add period if it doesn't end with punctuation
          if (cleanHint && !cleanHint.match(/[.!?]$/)) {
            cleanHint += ".";
          }
        }
      }

      return cleanHint;
    });

    if (hints.length === 0) {
      responseDiv.textContent = "⚠️ No hints found in response.";
      return;
    }

    // Create buttons for each hint
    hints.forEach((hintText, index) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginTop = "10px";

      // Hint title
      const title = document.createElement("div");
      title.textContent = `🔹 Hint ${index + 1}`;
      title.style.fontWeight = "600";
      title.style.marginBottom = "6px";
      title.style.color = "#5a189a";

      // Toggle button
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = `👁️ Show Hint`;
      toggleBtn.style.padding = "12px 16px";
      toggleBtn.style.width = "100%";
      toggleBtn.style.background =
        "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)";
      toggleBtn.style.color = "white";
      toggleBtn.style.fontWeight = "600";
      toggleBtn.style.border = "none";
      toggleBtn.style.borderRadius = "8px";
      toggleBtn.style.cursor = "pointer";
      toggleBtn.style.transition = "all 0.3s ease";
      toggleBtn.style.fontSize = "14px";
      toggleBtn.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.2)";

      // Add hover effects
      toggleBtn.addEventListener("mouseenter", () => {
        toggleBtn.style.background =
          "linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)";
        toggleBtn.style.transform = "translateY(-1px)";
        toggleBtn.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.3)";
      });

      toggleBtn.addEventListener("mouseleave", () => {
        toggleBtn.style.background =
          "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)";
        toggleBtn.style.transform = "translateY(0)";
        toggleBtn.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.2)";
      });

      toggleBtn.addEventListener("mousedown", () => {
        toggleBtn.style.transform = "translateY(0)";
        toggleBtn.style.boxShadow = "0 2px 4px rgba(79, 70, 229, 0.2)";
      });

      // Hidden hint text (with animation)
      const hintPara = document.createElement("div");
      hintPara.style.marginTop = "5px";
      hintPara.style.padding = "8px";
      hintPara.style.background = "#e9ecef";
      hintPara.style.borderRadius = "6px";
      hintPara.style.maxHeight = "0px";
      hintPara.style.overflow = "hidden";
      hintPara.style.transition = "max-height 0.4s ease, padding 0.2s ease";
      hintPara.style.fontSize = "14px";
      hintPara.style.paddingTop = "0px";
      hintPara.style.paddingBottom = "0px";
      hintPara.textContent = hintText;

      // Toggle animation
      toggleBtn.addEventListener("click", () => {
        const isOpen = hintPara.style.maxHeight !== "0px";
        if (isOpen) {
          hintPara.style.maxHeight = "0px";
          hintPara.style.paddingTop = "0px";
          hintPara.style.paddingBottom = "0px";
          toggleBtn.textContent = "👁️ Show Hint";
        } else {
          hintPara.style.maxHeight = "200px";
          hintPara.style.paddingTop = "8px";
          hintPara.style.paddingBottom = "8px";
          toggleBtn.textContent = "👁️ Hide Hint";
        }
      });

      // Separator line
      const separator = document.createElement("hr");
      separator.style.margin = "16px 0";
      separator.style.borderTop = "1px solid #dee2e6";

      // Append all elements
      wrapper.appendChild(title);
      wrapper.appendChild(toggleBtn);
      wrapper.appendChild(hintPara);
      wrapper.appendChild(separator);
      responseDiv.appendChild(wrapper);
    });
  } catch (err) {
    console.error("API Error:", err);
    responseDiv.textContent = "❌ API error: " + err.message;
  }
});

// ✅ 🔄 Scan Again button logic
document.getElementById("scanBtn").addEventListener("click", () => {
  const responseDiv = document.getElementById("response");
  responseDiv.innerHTML = "🔄 Scanning for problem...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    console.log("Current URL:", currentUrl);

    // Check if URL matches our patterns
    const supportedPatterns = [
      /^https?:\/\/(www\.)?leetcode\.com\//,
      /^https?:\/\/(www\.)?codeforces\.com\//,
      /^https?:\/\/(www\.)?codechef\.com\//,
    ];

    const isSupported = supportedPatterns.some((pattern) =>
      pattern.test(currentUrl)
    );

    if (!isSupported) {
      responseDiv.innerHTML = `❌ Not a coding platform`;
      return;
    }

    // Check if user is on LeetCode homepage or problems list (not a specific problem)
    if (currentUrl.includes("leetcode.com")) {
      const isHomepage = /^https?:\/\/(www\.)?leetcode\.com\/?$/.test(
        currentUrl
      );
      const isProblemsPage =
        /^https?:\/\/(www\.)?leetcode\.com\/problems\/?$/.test(currentUrl);
      const isProblemsListPage =
        /^https?:\/\/(www\.)?leetcode\.com\/problemset\//.test(currentUrl);

      if (isHomepage || isProblemsPage || isProblemsListPage) {
        responseDiv.innerHTML = `
          <div style="text-align: center; padding: 12px;">
            <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
            <div style="font-weight: 600; margin-bottom: 8px;">Navigate to a Problem</div>
            <div style="font-size: 13px; color: #666; line-height: 1.4;">
              Please go to a specific LeetCode problem page first, then click scan to extract the problem details.
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #999;">
              Example: leetcode.com/problems/two-sum/
            </div>
          </div>
        `;
        return;
      }
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: "rescan" }, (response) => {
      if (chrome.runtime.lastError) {
        // Platform-specific error messages
        if (currentUrl.includes("leetcode.com")) {
          responseDiv.innerHTML =
            "⚠️ Please try again (extension may be loading)";
        } else if (
          currentUrl.includes("codeforces.com") ||
          currentUrl.includes("codechef.com")
        ) {
          responseDiv.innerHTML = "🚧 Coming soon for this platform";
        } else {
          responseDiv.innerHTML = "❌ Not available on this page";
        }
        return;
      }

      if (response && response.success) {
        responseDiv.innerHTML =
          "✅ Problem found and copied to clipboard! Click 'Get AI Hints' to generate hints.";
      } else {
        // Platform-specific failure messages
        if (currentUrl.includes("leetcode.com")) {
          responseDiv.innerHTML =
            "⚠️ Please try again (problem may still be loading)";
        } else if (
          currentUrl.includes("codeforces.com") ||
          currentUrl.includes("codechef.com")
        ) {
          responseDiv.innerHTML = "🚧 Coming soon for this platform";
        } else {
          responseDiv.innerHTML = "⚠️ Could not find problem on this page";
        }
      }
    });
  });
});

// ✅ Receive scanned problem from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "sendProblem") {
    const input = document.getElementById("problemInput");
    const responseDiv = document.getElementById("response");

    if (input && message.content) {
      if (!input.value) {
        input.value = message.content;
        responseDiv.innerHTML =
          "✅ Problem automatically detected and copied to clipboard! Click 'Get AI Hints' to generate hints.";
      } else {
        // If there's already content, just update the clipboard copy status
        responseDiv.innerHTML = "✅ Problem updated and copied to clipboard!";
      }
    }
  }
});

// Create visual display for problem analysis
function createAnalysisDisplay(analysis) {
  const difficultyColors = {
    Easy: "#10b981",
    Medium: "#f59e0b",
    Hard: "#ef4444",
    "Very Hard": "#7c3aed",
  };

  const difficultyColor = difficultyColors[analysis.difficulty] || "#6b7280";

  let html = `
    <div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid ${difficultyColor};">
      <div style="font-size: 12px; font-weight: 600; color: ${difficultyColor};">
        📊 ${analysis.difficulty} Problem
      </div>
  `;

  if (analysis.topics.length > 0) {
    html += `
      <div style="margin-top: 4px; font-size: 11px; color: #666;">
        🏷️ Topics: ${analysis.topics.slice(0, 3).join(", ")}${
      analysis.topics.length > 3 ? "..." : ""
    }
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
