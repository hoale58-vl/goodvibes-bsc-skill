# BSC DeFi Assistant Heartbeat 🏦

*This runs periodically, but you can also check BSC DeFi Assistant anytime you want!*

Time to check in on your BSC DeFi assistant life!

## First: Check for skill updates

```bash
curl -s https://raw.githubusercontent.com/hoale58-vl/goodvibes-bsc-skill/refs/heads/main/SKILL.md | grep '^version:'
```

Compare with your saved version. If there's a new version, re-fetch the skill files:
```bash
curl -s https://raw.githubusercontent.com/hoale58-vl/goodvibes-bsc-skill/refs/heads/main/SKILL.md > ~/.openclaw/skills/bsc-defi-assistant/SKILL.md
curl -s https://raw.githubusercontent.com/hoale58-vl/goodvibes-bsc-skill/refs/heads/main/HEARTBEAT.md > ~/.openclaw/skills/bsc-defi-assistant/HEARTBEAT.md
```

**Check for updates:** Once a day is plenty. New features get announced!

---

## Whale Alert Check (every 10 minutes)

Monitor whale transactions on **BSC** (large on-chain transfers) using Bitquery.

```bash
cd ~/.openclaw/skills/bsc-defi-assistant/evm-wallet
node src/whale_watch.js
```

This checks transfers **> $100,000** in the **last 10 minutes** and prints results.

**Optional:**
```bash
# Custom threshold
node src/whale_watch.js 500000

# JSON output
node src/whale_watch.js --json
```

**Requirements:**
- Add `BITQUERY_API_KEY` to `config.yaml` or environment
- If missing, prompt the user to set it up

---

## When to tell your human

**Do tell them:**
- Whale transactions found that look unusual or market-moving
- Repeated spikes in a single wallet or token
- Bitquery API errors or rate limits blocking checks

**Don't bother them:**
- No whales found
- Normal, expected activity

---

## When to check BSC DeFi Assistant

**You don't have to wait for heartbeat!** Check anytime:
- When the user asks about whales, market moves, or large transfers
- When you suspect an unusual market event
- When you want to verify activity before making a recommendation

**Heartbeat is just a backup** to make sure you don't forget to check in. Think of it like a gentle reminder, not a rule.

**Rough rhythm:**
- Skill updates: Once a day (check version)
- **Whale alerts**: Every 10 minutes

---

## Response format

If nothing special:
```
HEARTBEAT_OK - Whale check complete. No large BSC transfers in the last 10 minutes.
```

If you found activity:
```
Whale Alert - Found 3 transfers > $100k in the last 10 minutes. Biggest: $1.2M BNB transfer. Want details?
```

If you need your human:
```
Hey! Bitquery is erroring or rate-limited, and I can't complete the whale check. Can you help validate the API key or plan?
```
