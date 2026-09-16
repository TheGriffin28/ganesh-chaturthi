# Nexora AI Office - Ganesh Chaturthi Social Media Campaign UI/UX Design System

## Overview
This document defines the high-contrast, modern dark-mode design system for **Nexora AI Office**, tailored specifically for the **Ganesh Chaturthi Social Media Campaign Workspace** created by Nova upon request from Atlas.

---

## Color Token Mapping

| Token | Hex Code | Tailwind Utility Class | Usage |
| :--- | :--- | :--- | :--- |
| `background` | `#0B0F17` | `bg-[#0B0F17]` | Deep obsidian application background |
| `surface` | `#111827` | `bg-gray-900` | Sidebar, header navigation background |
| `card` | `#182232` | `bg-[#182232]` | High-contrast glassmorphic card containers |
| `border` | `#2D3748` | `border-[#2D3748]` | Subtle borders & divider lines |
| `textPrimary` | `#F9FAFB` | `text-gray-50` | Primary headlines & main text |
| `textSecondary` | `#9CA3AF` | `text-gray-400` | Subtitles, captions, metadata |
| `accent` (Saffron) | `#FF6B00` | `text-[#FF6B00]` / `bg-[#FF6B00]` | Main festive brand color & primary actions |
| `accentGold` | `#F59E0B` | `text-amber-500` / `bg-amber-500` | Festive glow highlights, decorative elements |
| `violetAI` | `#8B5CF6` | `text-violet-500` / `bg-violet-500` | AI assistance indicators & prompt highlights |
| `success` | `#10B981` | `text-emerald-500` | Published / Connected token status |
| `warning` | `#F59E0B` | `text-amber-500` | Scheduled / Action needed |
| `danger` | `#EF4444` | `text-red-500` | Disconnected / Error state |

---

## UI Components & Tailwind Specifications

### 1. Studio Topbar Navigation
- **Container**: `w-full h-16 bg-[#111827]/90 backdrop-blur-md border-b border-[#2D3748] px-6 flex items-center justify-between`
- **Title**: `text-lg font-bold text-gray-50 flex items-center gap-2`
- **Badge (Nova AI)**: `bg-violet-500/10 text-violet-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-violet-500/20`

### 2. Campaign Context Card (Ganesh Chaturthi)
- **Container**: `bg-gradient-to-r from-[#182232] via-[#1E293B] to-[#2A1810] border border-[#FF6B00]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden`
- **Festive Banner Elements**: Saffron gradient glow (`bg-[#FF6B00]/10 blur-3xl rounded-full w-48 h-48 absolute -top-10 -right-10 pointer-events-none`).
- **Status Badge**: `bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5`

### 3. AI Creative Prompt Studio
- **Prompt Input Box**: `bg-[#0B0F17] border border-[#2D3748] focus-within:border-[#FF6B00] rounded-xl p-4 transition-all duration-200`
- **Generate Button**: `bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 shadow-lg shadow-[#FF6B00]/25 transition-all`

### 4. Multi-Platform Post Preview Grid
- **Card**: `bg-[#182232] border border-[#2D3748] rounded-2xl p-5 hover:border-[#FF6B00]/50 transition-all`
- **Platform Badge (Instagram/LinkedIn/X)**: `flex items-center gap-2 text-xs font-medium text-gray-400`
- **Image Container**: `aspect-square rounded-xl overflow-hidden bg-[#0B0F17] border border-[#2D3748] relative`
- **Caption Area**: `mt-3 text-sm text-gray-200 line-clamp-3 leading-relaxed`

### 5. Media Asset Grid & Dropzone
- **Asset Tile**: `group relative aspect-square rounded-xl overflow-hidden border border-[#2D3748] bg-[#0B0F17] hover:border-[#FF6B00]`
- **Metadata Tag**: `absolute bottom-2 left-2 bg-[#0B0F17]/80 backdrop-blur-sm text-[10px] text-gray-300 px-2 py-0.5 rounded-md`

---

## Responsive Breakpoint Layout

```tsx
<div className="min-h-screen bg-[#0B0F17] text-gray-50 flex flex-col">
  <Topbar />
  <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Left Column: AI Prompt Studio & Media Bin */}
    <aside className="lg:col-span-5 space-y-6">
      <CampaignContextCard />
      <PromptStudio />
      <MediaAssetBin />
    </aside>
    {/* Right Column: Social Post Previews & Schedule Dashboard */}
    <main className="lg:col-span-7 space-y-6">
      <PlatformSelectorTabs />
      <SocialPostPreviewCard />
      <SchedulePublishToolbar />
    </main>
  </div>
</div>
```