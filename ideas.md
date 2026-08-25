# Picture Deletion Review — Design Direction

## Three stylistic approaches

### Theme Name: Evidence Room
Very Brief Intro: A forensic editorial workspace that makes every deletion decision feel deliberate, visible, and reversible. Warm paper tones meet crisp evidence labels and high-contrast status marks.
Probability: 0.07

### Theme Name: Signal / Noise
Very Brief Intro: A restrained dark operator console that treats duplicate detection as signal extraction from visual noise. Cool graphite, electric chartreuse, and compact data density create a precise tool-like mood.
Probability: 0.04

### Theme Name: Archive Garden
Very Brief Intro: A calm archival interface with soft botanical hues, generous air, and an almost museum-like pace. Similarity groups feel like curated collections rather than raw file records.
Probability: 0.09

## Selected approach: Evidence Room

### Design Movement
Contemporary editorial information design with references to photographic contact sheets, museum cataloguing, and analog evidence folders.

### Core Principles
1. Make uncertainty explicit: the interface distinguishes exact duplicates from visual near-duplicates.
2. Keep the human in control: every deletion mark is a review state, never an irreversible action.
3. Use contrast as language: ink-black text, mineral paper surfaces, and a single vermilion action color create clear hierarchy.
4. Treat the image comparison as the primary artifact, not a decorative thumbnail.

### Color Philosophy
The canvas uses a warm bone paper tone to make the dashboard feel like a considered archive rather than a generic SaaS panel. Near-black ink provides editorial authority, muted olive indicates retained evidence, and vermilion marks attention-worthy deletion candidates without implying that deletion has happened. The ownable brand color is **Archive Vermilion** (#D95C3A), used sparingly for “review” states and the central mark.

### Layout Paradigm
A persistent left rail establishes the archive context while the main workspace uses an offset editorial composition: a compact statistical header, a broad review queue, and pair cards that alternate image emphasis. The layout avoids a centered marketing grid and instead feels like an open desk with pinned evidence.

### Signature Elements
1. A split-circle “compare / retain” symbol used as the logo, favicon, and section marker.
2. Small cataloguing labels with monospaced metadata and red review stamps.
3. A thin ruled “evidence line” that connects a candidate image to its suggested retained copy.

### Interaction Philosophy
Actions should feel like placing a small physical annotation: quick, reversible, and clearly acknowledged. Selecting a pair expands it in place; marking a candidate toggles the vermilion review stamp; filters update immediately without page navigation. Destructive wording is avoided because the website does not delete files.

### Animation
Use short 180ms ease-out transitions for filter changes, button states, and card expansion. Pair cards enter with a subtle 30ms stagger, like evidence being laid onto a desk. Avoid continuous motion; only the archive pulse in the logo may breathe gently. Respect reduced-motion preferences.

### Typography System
Use **DM Serif Display** for the main title and section headings, paired with **IBM Plex Sans** for body copy and controls. Use **IBM Plex Mono** for filenames, counts, and metadata labels. The hierarchy is editorial: large serif headlines, compact uppercase labels, and readable sans-serif descriptions.

### Brand Essence
A visual review desk for deciding which duplicate pictures to keep, built for people who want clarity before cleanup. Personality: **observant, measured, trustworthy**.

### Brand Voice
Headlines and CTAs sound like calm instructions from a careful archivist, never like an aggressive cleanup tool. Example lines: “Five pairs need your eyes.” “Mark the copy you can let go.”

### Wordmark & Logo
The mark is a bold split-circle: one half is a solid dark disc representing the retained original, the other is a vermilion outlined disc representing the review candidate. The wordmark uses DM Serif Display with a custom slash-like cut through the “o” in “Room.”

### Signature Brand Color
**Archive Vermilion — #D95C3A.** It is ownable, warm, and precise: more archival stamp than danger alert.

## Style Decisions

- Comparison surfaces use validated side-by-side evidence sheets from the scan rather than abstract UI placeholders.
- The split-circle compare/retain mark recurs in the navigation, evidence queue marker, method note, and footer signature.
- Archive Vermilion is reserved for review-state language: stamps, candidate marks, decision counts, and primary review actions.
- The evidence queue uses alternating card offsets and tonal shifts to preserve the open-desk editorial rhythm across the full review list.
