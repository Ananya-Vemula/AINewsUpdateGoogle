/**
 * CORPORATE AI INTELLIGENCE SUITE
 * 1. Generates 2-Page Executive Briefing (Google Doc)
 * 2. Auto-copies content to Outlook + Team Emails
 * 3. Archives weekly on Saturdays
 */

// --- CONFIGURATION ---
// Add as many emails as you want inside the brackets, separated by commas
const EMAIL_RECIPIENTS = [
  "YOUR_EMAIL_1",
  "YOUR_EMAIL_2"
]; 

const GEMINI_API_KEY = "YOUR_API_KEY"; 
const MODEL_PRIORITY = ["gemini-3-flash-preview", "gemini-2.5-flash"]; // Change the model as you wish

function createDailyAIBriefing() {
  const today = new Date();
  const dateStr = today.toLocaleDateString();
  
  // 1. HIGH-DENSITY PROMPT
  const prompt = `Act as a Chief AI Scientist. Today is ${dateStr}.
  Generate a high-density, technical executive briefing (approx 1500 words).
  
  I. SOTA RESEARCH (3 Papers):
  - Must be from last 48 hours.
  - Include "Technical Novelty" (e.g., new loss function, architecture change).
  - Include "Metrics" (e.g., 15% latency drop, 88% MMLU).
  
  II. TRENDING TOOLS (3 Repos):
  - Compare "Technical Edge" vs standard tools.
  
  III. EXECUTIVE STRATEGY:
  - 500 words on ROI, Corporate Implementation Risks, and Competitor Moves.
  
  Return ONLY a JSON object:
  {
    "intro": "Short strategic context of the day.",
    "research": [{"title": "...", "specs": "...", "metrics": "...", "link": "..."}],
    "tools": [{"name": "...", "edge": "...", "link": "..."}],
    "strategy": "Deep dive text for the manager...",
    "video": {"title": "...", "url": "..."}
  }`;

  // 2. FETCH DATA
  let data = null;
  for (let model of MODEL_PRIORITY) {
    try {
      const response = UrlFetchApp.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "post", contentType: "application/json", muteHttpExceptions: true,
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json", temperature: 0.2 }
        })
      });
      if (response.getResponseCode() === 200) {
        data = JSON.parse(JSON.parse(response.getContentText()).candidates[0].content.parts[0].text);
        break; 
      }
    } catch (e) { console.log(`Failed on ${model}: ${e.message}`); }
  }

  if (!data) throw new Error("All models failed. Check API Key or Quota.");

  // 3. STEP A: CREATE GOOGLE DOC
  const doc = DocumentApp.create(`AI Strategic Briefing - ${dateStr}`);
  const body = doc.getBody();
  body.clear();
  
  body.insertParagraph(0, `AI INTELLIGENCE: ${dateStr}`).setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  body.appendParagraph(data.intro).setItalic(true);
  
  body.appendParagraph("\nI. TECHNICAL RESEARCH SPECS").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  data.research.forEach(r => {
    body.appendParagraph(r.title).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendParagraph(`Technical Novelty: ${r.specs}`);
    body.appendParagraph(`Key Metrics: ${r.metrics}`).setBold(true);
    body.appendParagraph("Source Paper").setLinkUrl(r.link).setForegroundColor("#1155cc");
  });

  body.appendPageBreak(); 
  body.appendParagraph("II. EXECUTIVE STRATEGY & ROI").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(data.strategy);

  body.appendParagraph("\nIII. ENGINEER TOOLS").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  data.tools.forEach(t => {
    body.appendParagraph(`${t.name}: ${t.edge}`);
    body.appendParagraph("Repo Link").setLinkUrl(t.link).setForegroundColor("#1155cc");
  });
  
  doc.saveAndClose();
  const docUrl = doc.getUrl();

  // 4. STEP B: CONSTRUCT HTML EMAIL
  let htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: auto;">
      <h1 style="color: #202124; text-align: center;">🚀 AI Intelligence: ${dateStr}</h1>
      <p style="font-style: italic; color: #5f6368;">${data.intro}</p>
      <hr>
      
      <h2 style="color: #1a73e8;">I. TECHNICAL RESEARCH SPECS</h2>
      ${data.research.map(r => `
        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 5px;">${r.title}</h3>
          <p><b>Novelty:</b> ${r.specs}</p>
          <p style="background-color: #e8f0fe; padding: 10px; border-radius: 5px;"><b>Metrics:</b> ${r.metrics}</p>
          <a href="${r.link}" style="color: #1155cc;">Read Source Paper</a>
        </div>
      `).join('')}
      
      <h2 style="color: #1a73e8;">II. EXECUTIVE STRATEGY</h2>
      <p style="line-height: 1.6;">${data.strategy.replace(/\n/g, '<br>')}</p>
      
      <h2 style="color: #1a73e8;">III. ENGINEER TOOLS</h2>
      <ul>
        ${data.tools.map(t => `<li><b>${t.name}</b>: ${t.edge} (<a href="${t.link}">Repo</a>)</li>`).join('')}
      </ul>

      <br>
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        <p>Original Document: <a href="${docUrl}">${doc.getName()}</a></p>
        <p>Video of the Day: <a href="${data.video.url}">${data.video.title}</a></p>
      </div>
    </div>
  `;

  // 5. STEP C: SEND EMAIL TO ALL RECIPIENTS
  // Join the array with commas to send to multiple people at once
  MailApp.sendEmail({
    to: EMAIL_RECIPIENTS.join(","), 
    subject: `🚀 AI Strategic Briefing: ${dateStr}`,
    htmlBody: htmlBody
  });

  // 6. STEP D: ARCHIVE (Saturday Logic)
  CalendarApp.getDefaultCalendar().createEvent("📄 AI Report Sent", new Date(new Date().setHours(9,0,0)), new Date(new Date().setHours(9,30,0)), { description: docUrl });
  
  if (today.getDay() === 6) {
    const folder = DriveApp.createFolder(`AI Archive - ${dateStr}`);
    const files = DriveApp.searchFiles('title contains "AI Strategic Briefing -"');
    while (files.hasNext()) {
      const f = files.next();
      // Move files less than 7 days old
      if ((new Date() - f.getDateCreated()) < 604800000) f.moveTo(folder);
    }
  }
}
