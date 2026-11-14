# TimeBridge — IST ⇄ CST Converter & Date-Time Interval Calculator

A modern, responsive, zero-dependency web application engineered for converting dates and times between **Indian Standard Time (IST)** and **Central Standard Time (CST/CDT)**, and calculating precise durations and time intervals between any two dates/times.

---

## 🚀 Key Features

### 1. Bidirectional IST ⇄ CST Date & Time Converter
- **Instant Two-Way Conversion**: Convert with a single click or direction swap (IST ➔ CST or CST ➔ IST).
- **Comprehensive CST & US Timezone Variant Support**:
  - **US Central Time (Auto DST)**: Handles CST (UTC-6) during standard time and CDT (UTC-5) during Daylight Saving Time automatically.
  - **US Eastern Time (Auto DST)**: Handles EST (UTC-5) during standard time and EDT (UTC-4) during Daylight Saving Time automatically.
  - **Fixed CST**: Locks to UTC-6 (Standard Time).
  - **China Standard Time (CST)**: Option to convert to China CST (UTC+8).
- **Secondary Timezone Companion Badge**: Instant view of corresponding Eastern Time (when CST is active) or Central Time (when EST is active).
- **Day Shift Awareness**: Automatically flags `+1 Day (Next Day)`, `Same Day`, or `-1 Day (Previous Day)`.
- **Business Hours & Overlap Indicator**: Real-time status tags for both locations (`Standard Business Hours`, `Morning/Evening Stretch`, `Sleeping Hours`).
- **Interactive 24-Hour Scrubber with 1-Minute Precision**: Drag or nudge the 24-hour slider with granular **1-minute increments/decrements** (`step="1"`), plus dedicated `◀ -1 min`, `+1 min ▶`, `-5 min`, and `+5 min` stepper buttons and a real-time time badge.
- **5-Zone Synchronized Tracks**: The 24-hour slider displays **UTC**, **GMT (London)**, **IST (India)**, **CST (US Central)**, and **EST (US Eastern)** in aligned horizontal tracks with interactive selection.

### 2. Time & Date Interval Calculator ("Calculate Time Between Dates")
- **Customizable Start & End Points**: Specify both date, time (down to seconds), and individual timezones (IST, CST, EST, UTC, Local, etc.). Both Start and End cards include a quick **"Set to Now"** button.
- **Copy Duration to Clipboard**: One-click **"Copy Duration"** button to copy calculated days, hours, minutes, seconds, decimal hours, and working days to your clipboard.
- **Multi-Metric Breakdown**:
  - **Days, Hours, Minutes, Seconds**
  - **Total Hours** (e.g. `74.50 hrs`)
  - **Decimal Days** (e.g. `3.10 days`)
  - **Total Minutes** & **Total Seconds**
  - **Business / Working Days (Mon–Fri)** & weekend count
  - **Working Hours** (based on 8h/day standard)
- **Live Tick Mode**: Flip the toggle to watch the duration update live in real-time.
- **Normalized Cross-Reference Table**: View both start and end timestamps converted across IST, CST, EST, and UTC.

### 3. 24-Hour Overlap Matrix & Meeting Planner
- Hour-by-hour side-by-side alignment chart showing the entire day across IST, CST, and EST.
- Visual badges highlighting the **"Golden Handover Window"** (IST evening & CST/EST morning) for seamless handoffs and distributed team standups.

### 4. Live World Clocks (UTC, GMT, IST, CST, EST) & Theming
- Live real-time ticking clock tiles in the header for **UTC**, **GMT (London)**, **IST (India)**, **CST (US Central)**, and **EST (US Eastern)**.
- Dark & Light mode toggle with automatic persistence in `localStorage`.

---

## 🛠️ How to Run & Share with Your Team

Because TimeBridge uses standard modern web standards (`HTML5`, `CSS3`, `ECMAScript Intl`), **no installation or build steps are required**.

### 🌐 Option 1: Share with Your Office Team Over VPN (Recommended)

To host the tool live on your machine so teammates on the same office VPN can open it in their browsers:

1. Run the included sharing server:
   ```bash
   cd /Users/abharamb/.gemini/antigravity/scratch/timezone-converter
   ./start-server.sh
   # Or: python3 serve.py 8080
   ```
2. The terminal will automatically display the exact URLs for your team on the VPN, for example:
   ```text
   👉 Teammates on VPN: http://172.30.210.9:8080  (or your active VPN IP)
   💻 Local access:     http://localhost:8080
   ```
3. Send that URL to your team on Slack/Teams/Email. As long as they are connected to the office VPN, they can access and use TimeBridge immediately without installing anything.

### 📁 Option 2: Share the Folder / Zip Directly
Since the app is 100% self-contained client-side code:
- You can zip or send the `timezone-converter` folder to teammates.
- Anyone can simply double-click `index.html` to run it offline in their browser.

### 🐳 Option 3: Internal Docker / Kubernetes / Intranet
If your team wants permanent 24/7 hosting on an internal server:
- A `Dockerfile` is provided in the repository:
  ```bash
  docker build -t timebridge .
  docker run -d -p 80:80 timebridge
  ```
- Alternatively, push to your company's internal GitHub / GitLab and enable Pages.

### 💻 Option 4: Local Single-User Open
```bash
open /Users/abharamb/.gemini/antigravity/scratch/timezone-converter/index.html
```

---

## 🌐 Timezone Quick Reference

| Timezone | IANA Identifier | Standard Offset | Daylight Saving (DST) |
|---|---|---|---|
| **Indian Standard Time (IST)** | `Asia/Kolkata` | UTC +05:30 | No DST |
| **US Central Time (CST/CDT)** | `America/Chicago` | UTC -06:00 (CST) | UTC -05:00 (CDT, mid-March to early Nov) |
| **US Eastern Time (EST/EDT)** | `America/New_York` | UTC -05:00 (EST) | UTC -04:00 (EDT, mid-March to early Nov) |
| **China Standard Time (CST)** | `Asia/Shanghai` | UTC +08:00 | No DST |

* **IST vs. CST (Winter)**: IST is **11 hours and 30 minutes ahead** of CST.
* **IST vs. CDT (Summer)**: IST is **10 hours and 30 minutes ahead** of CDT.
* **IST vs. EST (Winter)**: IST is **10 hours and 30 minutes ahead** of EST.
* **IST vs. EDT (Summer)**: IST is **9 hours and 30 minutes ahead** of EDT.
