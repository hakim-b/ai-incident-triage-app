# Commercial & Sponsor Delivery Desk

The **Commercial & Sponsor Delivery Desk** is an AI-powered incident triage app that helps esports event organizers quickly identify and resolve sponsorship and advertising problems during live tournaments.

Its main goal is to **prevent costly sponsorship contract breaches by detecting important issues and immediately notifying the right people.**

## 1. What problem does it solve?

Imagine you're Devon Cole, responsible for managing sponsorships during a major esports tournament.

You're receiving dozens of WhatsApp messages, emails, and phone calls from sponsors such as Red Bull and Secretlab.

Some messages report serious problems, like a title sponsor's logo missing from the live broadcast. Others are minor requests, like adding a sponsor's social media handle to the credits.

Currently, Devon must manually:

1. Read every message.
2. Consult an Excel spreadsheet containing sponsorship contracts.
3. Determine the importance of the request.
4. Contact the appropriate person.

Each request takes approximately **12 minutes** to process. Delays can potentially cost the organization **$35,000 per tournament weekend** in missed placements and contractual penalties.

---

## 2. What does the app actually do?

### Step 1 — Receives sponsor messages

The app receives messages from sources such as:

* WhatsApp
* Outlook emails
* Phone-call transcripts

### Step 2 — Checks sponsorship contracts

The system identifies the sponsor and retrieves its contractual tier from the contract matrix.

### Step 3 — AI analyzes and classifies the issue

The AI determines the actual contractual stakes, summarizes the issue, and assigns a priority.

| Tier          | Priority | Example                                               | Route To                    |
| ------------- | -------- | ----------------------------------------------------- | --------------------------- |
| 🔴 **Tier 1** | Critical | Missing title sponsor logo / major contractual breach | **Master Control Switcher** |
| 🟠 **Tier 2** | Urgent   | Missing ribbons, banners, highlight tags              | **Motion Graphics Lead**    |
| 🟢 **Tier 3** | Routine  | Partner requests, swag, booth promotions              | **Post-Match Queue**        |

---

## 3. Example of how it works

### Incoming Message

> "URGENT FROM RED BULL: Our title sponsor logo is completely missing from the live broadcast! Fix immediately!"

### AI Analysis

**Tier 1 — Critical**

**Sponsor:** Red Bull
**Contract Tier:** 1

**Issue Detected:**
Missing title sponsor logo during a live broadcast, potentially violating the sponsorship agreement.

**Action:** Immediate override alert

**Route To:** Master Control Switcher

**Deadline:** Before the current round ends

The app produces the classification, summary, and routing decision. Actually sending alerts to production staff would require connecting it to a notification or dispatch system.

---

## 4. What makes the AI useful?

The important feature is that it understands the **actual business impact** of a message rather than simply looking for words like "URGENT."

For example:

### Message A

> "No rush at all, but our title sponsor logo isn't appearing on the broadcast."

Even though the message sounds relaxed, this could still be a **Tier 1 contractual breach**.

### Message B

> "URGENT!!! Can you make our booth banner slightly larger?"

Despite the word **URGENT**, this could be a routine request and shouldn't automatically become Tier 1.

The AI therefore focuses on:

* Sponsorship tier
* Contractual obligations
* Type of asset
* Severity of the issue
* Potential business impact

rather than simply detecting urgency-related keywords.

---

## 5. Contract Matrix Grounding

A particularly strong version of the app uses a small sponsor database that represents Devon's Excel contract matrix.

For example:

```json
[
  {
    "name": "Red Bull",
    "tier": 1
  },
  {
    "name": "Secretlab",
    "tier": 3
  }
]
```

When a message arrives, the backend can identify the sponsor before calling the AI.

For example:

```text
Message:
"URGENT FROM RED BULL: Title Sponsor logo is missing..."

Known sponsor:
Red Bull

Contract tier:
Tier 1
```

The AI then uses that information when making its classification.

This is stronger than simply asking an LLM to guess whether Red Bull is a Tier 1 sponsor.

---

## 6. What is the ultimate goal?

### From 12 minutes to seconds

The goal is to reduce the time required to process sponsor requests:

**Manual process:** ~12 minutes per request

**AI-assisted process:** seconds

The goal isn't simply to classify messages.

The real goal is to ensure that **critical sponsorship problems reach the right people while there's still time to fix them.**

---

## 7. One-sentence pitch

> **We're building an AI-powered sponsorship operations desk that analyzes incoming sponsor requests, checks contractual obligations, and routes critical issues to the right team in seconds — helping esports organizers avoid costly contract breaches.**

### In simple terms

**Sponsor sends message → AI understands the problem → checks the contract → determines severity → sends it to the right person.**
