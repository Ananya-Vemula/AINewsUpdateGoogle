# Corporate AI Intelligence Suite 

An automated Google Apps Script that acts as a "Chief AI Scientist" for your team. Every morning, it scans for the latest AI research and tools, summarizes them into a strategic executive briefing, creates a Google Doc, and emails the report to your team.

**Perfect for:** AI Engineers, Tech Leads, and Corporate Strategists who need to stay on top of daily advancements without the noise.

## ✨ Features

* **Automated Research:** Uses Google Gemini (Flash/Pro) to find SOTA papers (last 48h) and trending GitHub tools.
* **Executive Briefing:** Generates a professional 2-page Google Doc with technical specs and ROI analysis.
* **Team Broadcast:** Sends a beautifully formatted HTML email to your distribution list.
* **Smart Archiving:** Automatically organizes weekly reports into Drive folders every Saturday.
* **Calendar Integration:** Logs every report in your Google Calendar for easy retrieval.

## 🛠️ Setup Guide

### Prerequisites
* A Google Account (Gmail/Workspace).
* A Gemini API Key (Get it free from [Google AI Studio](https://aistudio.google.com/)).

### Installation
1.  Go to [script.google.com](https://script.google.com/) and create a **New Project**.
2.  Copy the code from `Code.gs` in this repository and paste it into the script editor.
3.  **Configuration:**
    * Find `const EMAIL_RECIPIENTS` and add the email addresses you want to receive the report.
    * Find `const GEMINI_API_KEY` and paste your actual API key inside the quotes.
4.  Save the project (Floppy disk icon).

### Automation (Triggers)
To make this run automatically every morning:
1.  In the Apps Script editor, click on the **Clock Icon** (Triggers) on the left sidebar.
2.  Click **+ Add Trigger** (bottom right).
3.  **Function to run:** `createDailyAIBriefing`
4.  **Event source:** `Time-driven`
5.  **Type of time based trigger:** `Day timer`
6.  **Time of day:** Select your preferred time (e.g., `8am to 9am`).
7.  Click **Save**.

## ⚠️ Privacy Note
* This script runs entirely within your own Google account. 
* No data is sent to third parties other than the prompt sent to the Gemini API for processing.
* **IMPORTANT:** Never commit your `GEMINI_API_KEY` to a public GitHub repository. Use environment variables or keep the key private in your local script.
