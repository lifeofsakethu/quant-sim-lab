# QuantSim Lab design direction

## Three approaches

### Theme Name: Signal Room
Very brief intro: A restrained dark editorial workspace where charts, classrooms, and code feel like instruments in a shared lab.
Probability: 0.07

### Theme Name: Field Notes
Very brief intro: A warm paper-and-ink study desk with annotated charts, tactile cards, and classroom notes.
Probability: 0.04

### Theme Name: Mint Circuit
Very brief intro: A focused dark interface with mint signals and chartreuse controls for fast, precise simulation work.
Probability: 0.09

## Chosen approach: Signal Room

### Design Movement
Digital editorialism with the discipline of Swiss information design and the tactile cues of a research notebook.

### Core Principles
1. Every panel should feel like a purposeful instrument, not a decorative card.
2. Use asymmetry and clear information hierarchy to make complex workflows readable.
3. Treat mint and chartreuse as signal colors, not gradients or decoration.
4. Make local/offline status explicit so trust is built into the interface.

### Color Philosophy
Near-black ink and blue-black slate create a quiet studio for concentration. Mint marks connected or healthy states; chartreuse marks actions and teacher control; warm gray text keeps dense data legible without visual glare.

### Layout Paradigm
A persistent rail anchors navigation while the workspace alternates between wide overview bands and split instrument panels. Classroom and workshop features open as dedicated lab modes instead of being hidden in generic settings.

### Signature Elements
- A hairline signal rail that marks the current mode.
- Small uppercase instrument labels paired with oversized editorial headings.
- Thin connector lines and node dots to make peer-to-peer state visible.

### Interaction Philosophy
Every meaningful action shows where data goes: local wallet, local classroom, or local peer channel. Controls use compact confirmations and immediate status feedback, with no implied server persistence.

### Animation
Use quick 140–220ms ease-out transitions for tabs, status chips, and drawer-like surfaces. P2P connection states pulse only while negotiating. Respect reduced-motion preferences and avoid decorative loops.

### Typography System
Use Space Grotesk for display headings and IBM Plex Mono for labels, balances, codes, and code snippets. Body copy uses a neutral system sans stack with generous line-height.

### Brand Essence
A local-first quantitative learning studio for teachers, students, and curious bot builders who want to practice markets together without surrendering control of their data. Personality: precise, candid, exploratory.

### Brand Voice
Headlines are direct and analytical. CTAs describe the action and its boundary. Microcopy names simulation limits plainly.
Example lines: “Run the signal. Inspect the fill.” and “No server. No mystery. Just the room you opened.”

### Wordmark & Logo
A compact Q-shaped mark made from two offset candlestick bars and an upward vector notch. The wordmark is a custom-spaced uppercase treatment, never a default logo font.

### Signature Brand Color
Signal mint: #70F2C2.

## Style Decisions
- Use generated imagery only for the major mode panels; the actual interaction surface remains deterministic HTML for clarity.
- Treat USDT as simulated paper value in the current client-only build. Never imply blockchain settlement or real transfers.
- P2P classroom data must be labeled local-only and use manual WebRTC signaling because there is no signaling server.
