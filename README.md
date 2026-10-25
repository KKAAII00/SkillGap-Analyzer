# SkillGap Analyzer

The assessment flow is **Employee Profile → Skills Analysis (including ESG) → Skill Gap Analysis → Training Recommendations → AI Growth Coach → Analysis Results**. The Skills Analysis page contains both role skills and ESG ratings: environmental (sustainability, climate awareness, resource management), social (diversity and inclusion, human rights, employee wellbeing), and governance (business ethics, compliance, transparency, risk management). ESG ratings feed into gap and readiness scores, prioritized training recommendations, and the Gemini coach profile. The demo uses Competent as a shared ESG development baseline; it is not a role-specific or regulatory standard. Unrated ESG competencies are excluded from scores and recommendations.

## Run on Windows

This version uses a local Python backend for the Gemini AI Growth Coach. The website can be served by the Python server or by XAMPP Apache.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey). Review Google AI's current pricing, quotas, and data-use terms before using employee information.
2. Open PowerShell in this project folder.
3. Set the key for this PowerShell window and start the site:

   ```powershell
   $env:GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE"
   python server.py
   ```

4. Keep PowerShell open. Visit [http://127.0.0.1:8000](http://127.0.0.1:8000), or, with XAMPP Apache running, visit [http://localhost/xampp/skillgap-analyzer/](http://localhost/xampp/skillgap-analyzer/).
5. Open **AI Growth Coach**, confirm the data-sharing notice, ask a question, and select **Ask Gemini**.

To stop the server, press `Ctrl+C`. The key is held in that PowerShell process; do not paste it into `app.js`, `index.html`, or a message. If you close PowerShell, set the key again before restarting the server.

If port 8000 is already in use, set a different local port before starting:

```powershell
$env:PORT = "8001"
python server.py
```

Then open [http://127.0.0.1:8001](http://127.0.0.1:8001).

## XAMPP

If this folder is `C:\xampp\htdocs\xampp\skillgap-analyzer`, XAMPP serves the page at [http://localhost/xampp/skillgap-analyzer/](http://localhost/xampp/skillgap-analyzer/). Start the Python backend separately from this folder using the commands above. Keep that PowerShell window open; the page uses it for Gemini requests.

## Privacy and deployment

The coach sends the selected target role, current role, career goals, role-skill ratings, rated ESG competencies, and conversation messages to Google's Gemini API after the user checks the consent box. The profile's employee-name field is excluded, but avoid putting names in goals or chat messages. Do not use sensitive personal, health, demographic, or performance-review information. This demo does not store AI conversation history on the server, but browser profile fields are saved in local storage.

This backend binds to the local computer only. When using the XAMPP-served page, its local API connection is restricted to localhost origins. Before publishing online, deploy behind HTTPS with proper user authentication, rate limiting, server-side secret storage, and an organization-approved privacy and retention policy. Never expose a Gemini key in browser JavaScript.

## Run tests

```powershell
python -m unittest
```
