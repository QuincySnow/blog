---
title: "Magpie Review: A Local AI Gateway for Coding Agents with Reversible Masking & Extensibility"
description: "Hands-on review and recommendation of Magpie (yetone/magpie): a unified local AI gateway for Claude Code, Pi, Codex, and Cursor. Exploring its dual-runtime architecture, full-duplex protocol translation, reversible privacy masking, and OpenCode/Pi compatible plugin ecosystem."
pubDatetime: 2026-11-06T00:00:00Z
modDatetime: 2026-11-06T00:00:00Z
draft: false
tags:
  - AI
  - Gateway
  - Privacy
  - Toolchain
  - Open Source
lang: en
---

*[中文版](/blog/posts/zh/2026-11-06-magpie-ai-gateway-privacy-masking-plugins)*

If you actively use terminal coding agents like Claude Code, Pi, Codex CLI, Cursor, Aider, or OpenCode in daily development, you have likely run into several persistent friction points:

1. **Configuration fragmentation**: Every agent manages its own configuration files, environment variables, and protocol formats (some require Anthropic Messages, others expect OpenAI Chat Completions or Responses, and others use Gemini). Changing an upstream provider, adding failover accounts, or pooling keys means re-configuring every tool individually.
2. **Exposed secrets & privacy risks**: In full-repo authorization mode, agents frequently read source code, configuration files, and test fixtures. API keys in `.env`, database passwords, internal API hosts, and personal data can easily be sent directly in plain text prompts to upstream model vendors.
3. **Siloed plugin ecosystems**: Adding account check-ins, token refresh cycles, or request interception rules often requires reinventing the wheel across separate agent ecosystems.

Recently, I tested an impressive open-source solution: **Magpie** (GitHub: [yetone/magpie](https://github.com/yetone/magpie)). Rather than a bare reverse proxy, it is a **high-performance local AI gateway built specifically for Coding Agents**.

In this article, I review its three standout architectural capabilities: **gateway routing and full-duplex translation**, **reversible local privacy masking**, and the **plugin and middleware ecosystem**, followed by quick setup examples for popular agents.

---

## What is Magpie?

Magpie is an AI gateway and management console running locally on your workstation. It launches a lightweight service listening by default on `127.0.0.1:3425`. Upstream, it transparently unifies all your coding agents; downstream, it connects to cloud model providers, API aggregators, subscriptions, and local runtimes (such as Ollama or LM Studio).

In short: **it pushes protocol adaptation, multi-account pooling, secret desensitization, and request modification down into a unified local gateway layer.**

---

## 1. High-Performance Gateway Architecture for Agents

Most existing AI gateways (like One API, New API, or LiteLLM) are centralized servers built for web applications. Few cater specifically to the low-latency, streaming-heavy demands of local CLI coding agents.

### Full-Duplex Protocol Translation
The agent protocol landscape is fragmented:
- Claude Code natively speaks the Anthropic Messages protocol.
- OpenAI Codex and OpenAI-compatible tools use Chat Completions or the Responses format.
- Google tools utilize Gemini's distinct API format.

Magpie features a **full-duplex protocol translation engine**. Regardless of what protocol your client sends, Magpie translates it into the upstream model's expected format on the fly, and streams the chunked response back in the client's expected format. This lets you point an Anthropic-only client directly to DeepSeek, Kimi, or GPT-4o with zero friction.

### Go + moejs Dual-Runtime Architecture
Local gateways must avoid adding perceptible latency or consuming excessive memory. Magpie uses a dual-runtime architecture:
- **Go Core Gateway**: Network I/O, connection pooling, concurrency dispatch, and routing are implemented entirely in Go for minimal footprint and maximum throughput.
- **Embedded `moejs` Engine**: For per-event streaming hooks and inline rewrites, Magpie embeds `moejs`—a lightweight JavaScript engine written in Go. Middleware runs inside the gateway's process memory without inter-process communication (IPC), maintaining sub-millisecond streaming responsiveness.
- **Isolated Bun Plugin Host**: Heavyweight plugin tasks (external network I/O, dynamic RAG context retrieval, or complex OAuth flows) execute in a separate Bun process via RPC, ensuring external plugin failures never crash the core gateway.

### Account Pooling & Load-Aware Scheduling
- **Failure Isolation & Cooling**: When an API key hits a rate limit (429) or upstream error (5xx), Magpie places that account into a temporary cooldown state and automatically falls back to secondary credentials, preventing long agent tasks from abruptly failing.
- **Busy Model Back-off**: When running shared subscriptions or high-concurrency requests, Magpie monitors upstream queue load. You can set a threshold (e.g., above 70% capacity) to automatically de-prioritize congested models in favor of idle endpoints.

---

## 2. Lossless & Reversible Local Privacy Masking

This is Magpie's most compelling feature for developers working with sensitive or commercial codebases.

### Mask on Request, Restore on Response
Traditional privacy proxies redact sensitive keywords or replace them with asterisks, which often breaks coding agents. Models lose track of program state, and tools write corrupted code back to disk.

Magpie implements a **two-way reversible pipeline**:
1. **Outbound (Agent → Vendor)**: Before a request leaves your machine, Magpie identifies sensitive values and substitutes them with deterministic, typed placeholders—such as `{{API_KEY_es6eu6jk}}`, `{{TERM_5hmsrhdc}}`, or `li.wei@acme-corp.cn`. The vendor server never receives real secrets.
2. **Inbound (Vendor → Agent)**: As the model streams its reply or triggers tool calls, Magpie dynamically swaps placeholders back into real values in local memory before emitting chunks to the agent.
3. **Seamless File Writes**: Because the agent receives real values, configuration files (like `.env`) and terminal commands are written correctly, while the cloud vendor remains completely unaware of real credentials.

```
[Agent Terminal] ──(With real keys)──> [Magpie Local Gateway] ──(Replaced with placeholders)──> [Cloud LLM]
                                               │                                                      │
[Agent Terminal] <──(Real keys restored)── [Magpie Local Gateway] <──(Streams placeholders)────────────┘
```

### Preserving Prompt Caching & Thinking Signatures
- **Deterministic Hashing Protects Prompt Caching**: The same real value consistently receives the identical hash placeholder throughout a session, preserving upstream prompt caching hit rates for providers like Anthropic and DeepSeek.
- **Thinking Signatures Remain Valid**: Cryptographic signatures on Claude thinking blocks and Gemini thought payloads are carefully preserved to prevent provider validation errors.
- **Tool Definitions Kept Intact**: Tool names, MCP server identifiers, UUIDs, and JSON schema structures are never altered; only descriptive schema text and parameter values undergo masking.

### Multi-Tier Detection Engine
Magpie uses three complementary detection tiers:
1. **Structural Regex**: Detects cloud API tokens (`sk-...`), private key headers (`BEGIN PRIVATE KEY`), JWTs, database connection URIs (`user:password@host`), phone numbers, identification numbers, and credit cards.
2. **Lightweight Local NER Model (AstrLink Guard)**: Regex struggles with unstructured natural names or addresses. Magpie includes AstrLink Guard, a compact 39MB model running locally via CPU or Apple Neural Engine to catch natural language entities.
3. **Fallback to Local Models**: For zero-exposure requirements, Magpie can route requests containing sensitive entities entirely to local Ollama or LM Studio models, avoiding cloud transmission entirely.

---

## 3. Plugin Ecosystem & Gateway Middleware

Rather than creating an isolated plugin format, Magpie integrates with established agent ecosystems.

### OpenCode & Pi Compatibility
- **OpenCode Provider Plugins**: Plugins written for OpenCode (`opencode-*-auth`) run directly in Magpie without modification.
- **Pi Extension Packages**: Pi extensions providing model providers can be recognized and converted into upstream gateway routes.
- **Extended Lifecycle Hooks**: Magpie adds hooks for `auth.usage` (real-time quota tracking), `auth.refresh` (automatic token renewal), and `auth.checkin` (daily provider check-in actions).

### Low-Latency Streaming Middleware
Using straightforward JavaScript, you can intercept and modify traffic via `moejs`:

```javascript
// alias.middleware.js: Model aliasing with response preservation
export const events = ["message_start"];

export function onRequest(body, ctx) {
  ctx.state.asked = body.model;
  // Route client requests for "fast" to deepseek-chat
  if (body.model === "fast") body.model = "deepseek/deepseek-chat";
  return body;
}

export function onEvent(ev, ctx) {
  // Restore original model name in stream so client validation passes
  ev.message.model = ctx.state.asked;
  return ev;
}
```

Community middleware options ready out-of-the-box include:
- `param-override`: Override temperature, max tokens, or specific model parameters.
- `model-map`: Regular-expression model mapping and aliasing.
- `system-prompt`: Inject unified organization or project constraints across all agents.
- `word-guard`: Bidirectional sensitive word filtering.
- `think-tags`: Strip reasoning `<think>...</think>` tags or map reasoning tokens to output text.

---

## Practical Setup: Connecting Major Agents

### 1. Install & Launch Magpie

On macOS or Linux:

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh
```

Or run via Docker:

```bash
docker run -d \
  --name magpie \
  -p 3425:3425 \
  -v ~/.config/magpie:/config/magpie \
  ghcr.io/yetone/magpie:latest
```

Open `http://127.0.0.1:3425` in your browser to access the web GUI. Under **Settings → Privacy**, enable **Mask secrets** and **Mask personal info**.

### 2. Connect Pi Agent

Configure Magpie as a custom provider in `~/.pi/agent/settings.json`:

```json
{
  "providers": {
    "magpie": {
      "baseUrl": "http://127.0.0.1:3425/v1",
      "apiKey": "magpie-local",
      "api": "openai-compatible"
    }
  }
}
```

In your Pi session, switch to the routed model:
```bash
/model magpie/claude-3-7-sonnet
```

### 3. Connect Claude Code

Claude Code supports overriding its endpoint via environment variables:

```bash
export ANTHROPIC_BASE_URL="http://127.0.0.1:3425"
export ANTHROPIC_API_KEY="magpie-local"

claude
```

### 4. Connect Codex & OpenAI-Compatible CLIs

For standard CLI tools:

```bash
export OPENAI_BASE_URL="http://127.0.0.1:3425/v1"
export OPENAI_API_KEY="magpie-local"
```

---

## Conclusion

Magpie addresses real architectural bottlenecks in local AI development workflows:
- Unifies configuration across diverse agents (Pi, Claude Code, Cursor, Codex).
- Solves sensitive data leakage without breaking prompt caching or file modifications through **reversible masking**.
- Extends seamlessly with existing OpenCode and Pi plugin packages.

Repository: [https://github.com/yetone/magpie](https://github.com/yetone/magpie)
