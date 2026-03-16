# Medicare AI — Figma Design System & Component Structure
# Complete specification: tokens, frames, auto layout, variants, naming conventions
# Version: 1.0

================================================================================
## 1. FILE ARCHITECTURE — HOW TO ORGANISE THE FIGMA FILE
================================================================================

One Figma file. Multiple pages. Strict page order:

Page 01 — 🎨 Foundations          Design tokens, color styles, text styles, effects
Page 02 — 🧩 Components           All reusable components (the library)
Page 03 — 📐 Patterns             Composite patterns: cards, forms, lists, empty states
Page 04 — 🔐 Auth Flow            Login, Register, OTP screens
Page 05 — 🏠 Dashboard            Home dashboard all breakpoints
Page 06 — 🩺 Symptom Checker      Symptom input + result screens
Page 07 — 🖼️ Image Checker         Upload + result screens
Page 08 — 🚨 Emergency            Emergency services screen
Page 09 — 📚 Disease Library       Library grid + detail drawer
Page 10 — 🏥 Hospital Finder      Map + list view
Page 11 — 📱 Mobile Screens       All pages at 390px (iPhone 14)
Page 12 — 🌙 Dark Mode (Phase 2)  Future dark theme
Page 13 — 🧪 Playground           Scratch space — never ship from here

================================================================================
## 2. DESIGN TOKENS — FOUNDATIONS PAGE
================================================================================

SETUP: Use Figma Variables (not just Styles) for all tokens.
Collections → "Primitives" and "Semantic".
This enables light/dark mode switching and token aliasing.

────────────────────────────────────────────────────────────────────────────────
### 2.1 COLOUR TOKENS
────────────────────────────────────────────────────────────────────────────────

COLLECTION: Primitives/Color
(Raw values — never use directly in components, always alias via Semantic)

  Blue/50       #EBF4FF
  Blue/100      #DBEAFE
  Blue/200      #BFDBFE
  Blue/300      #93C5FD
  Blue/400      #60A5FA
  Blue/500      #3B82F6
  Blue/600      #0057D9    ← brand.primary
  Blue/700      #0047B8
  Blue/800      #1E3A8A
  Blue/900      #1E3064

  Green/50      #ECFDF5
  Green/100     #D1FAE5
  Green/400     #34D399
  Green/500     #10B981
  Green/600     #00B894    ← brand.secondary (verified, success)
  Green/700     #059669

  Red/50        #FEF2F2
  Red/100       #FEE2E2
  Red/400       #F87171
  Red/500       #EF4444
  Red/600       #E53E3E    ← brand.danger
  Red/700       #DC2626

  Orange/50     #FFF7ED
  Orange/100    #FFEDD5
  Orange/400    #FB923C
  Orange/500    #F97316
  Orange/600    #DD6B20    ← brand.warning / severity.moderate
  Orange/700    #C2410C

  Neutral/0     #FFFFFF    ← brand.card
  Neutral/50    #F7F9FC    ← brand.surface
  Neutral/100   #F1F5F9
  Neutral/200   #E4E8EF    ← brand.border
  Neutral/300   #CBD5E1
  Neutral/400   #94A3B8
  Neutral/500   #8A94A6    ← brand.muted
  Neutral/600   #64748B
  Neutral/700   #4A5568    ← brand.textLight
  Neutral/800   #334155
  Neutral/900   #1A202C    ← brand.text

COLLECTION: Semantic/Color
(These are what components reference — they alias primitives)

  -- Background
  bg/page               → Neutral/50     #F7F9FC
  bg/card               → Neutral/0      #FFFFFF
  bg/elevated           → Neutral/0      #FFFFFF
  bg/overlay            → Neutral/900    at 40% opacity (modal backdrop)
  bg/input              → Neutral/0      #FFFFFF
  bg/input-disabled     → Neutral/50     #F7F9FC
  bg/primary            → Blue/600       #0057D9
  bg/primary-hover      → Blue/700       #0047B8
  bg/primary-subtle     → Blue/50        #EBF4FF
  bg/danger             → Red/600        #E53E3E
  bg/danger-subtle      → Red/50         #FEF2F2
  bg/success            → Green/600      #00B894
  bg/success-subtle     → Green/50       #ECFDF5
  bg/warning-subtle     → Orange/50      #FFF7ED

  -- Text
  text/primary          → Neutral/900    #1A202C
  text/secondary        → Neutral/700    #4A5568
  text/muted            → Neutral/500    #8A94A6
  text/disabled         → Neutral/400    #94A3B8
  text/on-primary       → Neutral/0      #FFFFFF
  text/link             → Blue/600       #0057D9
  text/link-hover       → Blue/700       #0047B8
  text/danger           → Red/600        #E53E3E
  text/success          → Green/600      #00B894
  text/warning          → Orange/600     #DD6B20

  -- Border
  border/default        → Neutral/200    #E4E8EF
  border/strong         → Neutral/300    #CBD5E1
  border/focus          → Blue/600       #0057D9
  border/error          → Red/600        #E53E3E
  border/success        → Green/600      #00B894

  -- Severity (disease/urgency indicators)
  severity/mild-bg      → Green/50       #ECFDF5
  severity/mild-text    → Green/700      #059669
  severity/mild-border  → Green/400      #34D399
  severity/mod-bg       → Orange/50      #FFF7ED
  severity/mod-text     → Orange/700     #C2410C
  severity/mod-border   → Orange/400     #FB923C
  severity/sev-bg       → Red/50         #FEF2F2
  severity/sev-text     → Red/700        #DC2626
  severity/sev-border   → Red/400        #F87171

────────────────────────────────────────────────────────────────────────────────
### 2.2 TYPOGRAPHY TOKENS
────────────────────────────────────────────────────────────────────────────────

Font Families (add via Figma font picker):
  Primary:  DM Sans     — weights: 400, 500, 600, 700
  Fallback: Noto Sans   — Indian script support
  Mono:     JetBrains Mono — weight: 400 (used for phone numbers, OTP)

Figma Text Styles (create these exactly):

  CATEGORY: Display
  ┌──────────────────┬────────────┬────────┬────────────┬────────┬─────────────┐
  │ Style Name       │ Font       │ Weight │ Size       │ LH     │ LS          │
  ├──────────────────┼────────────┼────────┼────────────┼────────┼─────────────┤
  │ Display/2XL      │ DM Sans    │ 700    │ 48px       │ 56px   │ -0.96px     │
  │ Display/XL       │ DM Sans    │ 700    │ 40px       │ 48px   │ -0.80px     │
  │ Display/LG       │ DM Sans    │ 700    │ 32px       │ 40px   │ -0.64px     │
  └──────────────────┴────────────┴────────┴────────────┴────────┴─────────────┘

  CATEGORY: Heading
  ┌──────────────────┬────────────┬────────┬────────────┬────────┬─────────────┐
  │ Heading/H1       │ DM Sans    │ 700    │ 28px       │ 36px   │ -0.28px     │
  │ Heading/H2       │ DM Sans    │ 600    │ 24px       │ 32px   │ -0.24px     │
  │ Heading/H3       │ DM Sans    │ 600    │ 20px       │ 28px   │ -0.20px     │
  │ Heading/H4       │ DM Sans    │ 600    │ 16px       │ 24px   │ -0.16px     │
  │ Heading/H5       │ DM Sans    │ 500    │ 14px       │ 20px   │ 0           │
  └──────────────────┴────────────┴────────┴────────────┴────────┴─────────────┘

  CATEGORY: Body
  ┌──────────────────┬────────────┬────────┬────────────┬────────┬─────────────┐
  │ Body/LG-Regular  │ DM Sans    │ 400    │ 16px       │ 24px   │ 0           │
  │ Body/LG-Medium   │ DM Sans    │ 500    │ 16px       │ 24px   │ 0           │
  │ Body/MD-Regular  │ DM Sans    │ 400    │ 14px       │ 20px   │ 0           │
  │ Body/MD-Medium   │ DM Sans    │ 500    │ 14px       │ 20px   │ 0           │
  │ Body/MD-Semibold │ DM Sans    │ 600    │ 14px       │ 20px   │ 0           │
  │ Body/SM-Regular  │ DM Sans    │ 400    │ 12px       │ 16px   │ 0           │
  │ Body/SM-Medium   │ DM Sans    │ 500    │ 12px       │ 16px   │ 0           │
  │ Body/XS-Regular  │ DM Sans    │ 400    │ 10px       │ 14px   │ 0           │
  └──────────────────┴────────────┴────────┴────────────┴────────┴─────────────┘

  CATEGORY: Mono
  ┌──────────────────┬──────────────────┬────────┬────────────┬────────┬───────┐
  │ Mono/MD          │ JetBrains Mono   │ 400    │ 14px       │ 20px   │ 0     │
  │ Mono/LG          │ JetBrains Mono   │ 400    │ 18px       │ 24px   │ 0     │
  │ Mono/XL          │ JetBrains Mono   │ 700    │ 24px       │ 28px   │ 0     │
  └──────────────────┴──────────────────┴────────┴────────────┴────────┴───────┘

  Mono/XL is used for: OTP digit boxes, emergency phone numbers, confidence %

────────────────────────────────────────────────────────────────────────────────
### 2.3 SPACING TOKENS
────────────────────────────────────────────────────────────────────────────────

Figma Variables → Collection: Spacing (Number type)

  spacing/0     0
  spacing/1     4px
  spacing/2     8px
  spacing/3     12px
  spacing/4     16px
  spacing/5     20px
  spacing/6     24px
  spacing/8     32px
  spacing/10    40px
  spacing/12    48px
  spacing/16    64px
  spacing/20    80px
  spacing/24    96px

────────────────────────────────────────────────────────────────────────────────
### 2.4 BORDER RADIUS TOKENS
────────────────────────────────────────────────────────────────────────────────

  radius/none   0
  radius/sm     4px    — subtle rounding (tags, chips)
  radius/md     8px    — inputs, buttons, small cards
  radius/lg     12px   — cards, panels, modals
  radius/xl     16px   — large modal, auth card
  radius/full   9999px — pills, badges, avatars

────────────────────────────────────────────────────────────────────────────────
### 2.5 SHADOW TOKENS (Figma Effect Styles)
────────────────────────────────────────────────────────────────────────────────

  Shadow/card       x:0  y:1  blur:3   spread:0  color:#00000010
  Shadow/card-hover x:0  y:4  blur:12  spread:0  color:#0000001A
  Shadow/sidebar    x:4  y:0  blur:24  spread:0  color:#0000000F
  Shadow/modal      x:0  y:20 blur:40  spread:0  color:#00000020
  Shadow/focus-ring x:0  y:0  blur:0   spread:3  color:#0057D940

================================================================================
## 3. COMPONENT NAMING CONVENTION
================================================================================

Pattern:  [Category]/[ComponentName]/[Variant]

Rules:
  - PascalCase for component names
  - Slash-separated hierarchy (creates Figma sections automatically)
  - Variant properties use camelCase
  - Never abbreviate (use "Button" not "Btn")

Examples:
  ✅  Button/Primary/Default
  ✅  Form/Input/Error
  ✅  Navigation/SidebarItem/Active
  ✅  Feedback/Badge/Severity-Mild
  ❌  btn-primary        (wrong case, no hierarchy)
  ❌  Input_error        (underscore, no hierarchy)
  ❌  Nav/SItem          (abbreviation)

Property naming inside components:
  State:    Default | Hover | Focus | Active | Disabled | Loading
  Size:     XS | SM | MD | LG | XL
  Variant:  Primary | Secondary | Ghost | Danger | Success
  Boolean:  hasIcon (boolean) | showLabel (boolean) | isVerified (boolean)

================================================================================
## 4. COMPONENT LIBRARY — FULL INVENTORY
================================================================================

Each component below shows:
  NAME — naming convention
  FRAME — width × height (or Hug × Hug)
  LAYOUT — auto layout direction + gap + padding
  VARIANTS — property matrix
  NOTES — special instructions

────────────────────────────────────────────────────────────────────────────────
### 4.1 ATOMS (Primitive building blocks)
────────────────────────────────────────────────────────────────────────────────

──── Button/Primary ────────────────────────────────────────────────────────────
Frame:    Hug × 40px (MD), 36px (SM), 48px (LG)
Layout:   Horizontal, gap: 8px, padding: 10px 20px (MD)
Variants:
  size       = SM | MD | LG
  state      = Default | Hover | Focus | Disabled | Loading
  hasLeftIcon  = true | false
  hasRightIcon = true | false
  fullWidth    = false | true

Anatomy:
  [LeftIcon?] [Label] [RightIcon?]
  └─ LeftIcon: 16px icon, fill: text/on-primary
  └─ Label: Body/MD-Semibold, color: text/on-primary
  └─ Loading: replaces icon + label with 16px spinner

State fills:
  Default:  bg/primary, no border
  Hover:    bg/primary-hover
  Focus:    bg/primary + Shadow/focus-ring
  Disabled: bg/input-disabled, text/disabled, cursor: not-allowed
  Loading:  bg/primary-hover, spinner animated

Auto Layout constraints:
  - Frame: hug width UNLESS fullWidth=true (then Fill)
  - Min width: 80px (SM), 100px (MD), 120px (LG)

──── Button/Secondary ──────────────────────────────────────────────────────────
Same anatomy as Primary.
Default: bg/card, border: border/default, text: text/primary
Hover:   bg/bg-input, border: border/strong
Focus:   bg/card + Shadow/focus-ring

──── Button/Ghost ──────────────────────────────────────────────────────────────
No border. No background fill.
Default: transparent, text: text/link
Hover:   bg/bg-primary-subtle
Focus:   transparent + Shadow/focus-ring

──── Button/Danger ─────────────────────────────────────────────────────────────
Default: bg/danger, text: text/on-primary
Hover:   Red/700 (#DC2626)

──── Form/Input ────────────────────────────────────────────────────────────────
Frame:    Fill × 40px (MD), 48px (LG)
Layout:   Horizontal, gap: 8px, padding: 0 12px
Variants:
  size  = MD | LG
  state = Default | Hover | Focus | Filled | Error | Disabled

Anatomy:
  [PrefixIcon?] [InputText] [SuffixIcon?]
  └─ PrefixIcon: 16px, color: text/muted
  └─ InputText: Body/MD-Regular or Body/LG-Regular
    - Placeholder: color text/muted
    - Value: color text/primary
  └─ SuffixIcon: 16px (e.g. eye toggle for password)

Outer frame styles per state:
  Default:  border: 1px border/default, bg: bg/input, radius: radius/md
  Hover:    border: 1px border/strong
  Focus:    border: 1.5px border/focus + Shadow/focus-ring
  Error:    border: 1.5px border/error, bg: severity/sev-bg
  Disabled: border: 1px border/default, bg: bg/input-disabled, text: text/disabled

──── Form/Label ────────────────────────────────────────────────────────────────
Frame:    Hug × Hug
Layout:   Horizontal, gap: 4px, align: center
Anatomy:  [LabelText] [RequiredDot?]
  LabelText: Body/MD-Medium, text/primary
  RequiredDot: "•" Body/SM-Regular, text/danger (only if required=true)
Variants: required = false | true

──── Form/FieldGroup ────────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 6px
Anatomy:
  [Label]
  [Input]
  [HelperText? OR ErrorText?]
Variants:
  state = Default | Error | Success
  showHelper = true | false

HelperText: Body/SM-Regular, text/muted
ErrorText:  Body/SM-Regular, text/danger, with WarningIcon 12px prefix

──── Form/OTPInput ──────────────────────────────────────────────────────────────
Frame:    Hug × Hug
Layout:   Horizontal, gap: 8px
Anatomy:  6× OTPDigit frames
  OTPDigit Frame: 44px × 52px
    Border: 2px border/default, radius: radius/md
    Text: Mono/XL, text/primary, centered
  Variants:
    state = Empty | Filled | Focus | Error

──── Feedback/Badge ────────────────────────────────────────────────────────────
Frame:    Hug × 20px
Layout:   Horizontal, gap: 4px, padding: 2px 8px
Anatomy:  [Dot?] [Label]
  Dot: 6px circle filled with severity color
  Label: Body/XS-Regular, color matches severity

Variants:
  severity = mild | moderate | severe
  type     = dot | solid | outline

Severity mapping:
  mild:     bg/success-subtle, text/success, border: severity/mild-border
  moderate: bg/warning-subtle, text/warning, border: severity/mod-border
  severe:   bg/danger-subtle,  text/danger,  border: severity/sev-border

──── Feedback/Tag ───────────────────────────────────────────────────────────────
Frame:    Hug × 24px
Layout:   Horizontal, gap: 4px, padding: 3px 8px
Anatomy:  [Icon?] [Label] [CloseIcon?]
Variants:
  color      = default | blue | green | red | orange | purple
  dismissible = false | true

──── Feedback/Spinner ───────────────────────────────────────────────────────────
Frame:    16px × 16px (SM), 24px × 24px (MD), 32px × 32px (LG)
Shape:    Circle stroke, stroke-dash animation
Color:    Uses currentColor (inherits from parent)
Variants: size = SM | MD | LG

──── Feedback/Alert ─────────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Horizontal, gap: 12px, padding: 12px 16px
Anatomy:  [Icon 16px] [Content: Vertical] [CloseButton?]
  Content → [Title? Body/MD-Semibold] [Description Body/MD-Regular]
Variants:
  type      = info | success | warning | error
  closable  = false | true
  showTitle = false | true
Radius: radius/md

──── Navigation/SidebarItem ─────────────────────────────────────────────────────
Frame:    Fill × 40px
Layout:   Horizontal, gap: 12px, padding: 8px 12px
Anatomy:  [ActiveBar] [Icon 18px] [Label] [Badge?]
  ActiveBar: 2px × 20px rectangle, color: bg/primary (only visible when active=true)
  Icon: text/muted (default), text/primary (active)
  Label: Body/MD-Medium, text/secondary (default), text/primary (active)
  Badge: optional unread count bubble

Variants:
  state = Default | Hover | Active | Disabled
  collapsed = false | true  (label hidden, icon centered when collapsed)
  hasBadge  = false | true

State fills:
  Default: transparent
  Hover:   bg/bg-input (Neutral/50)
  Active:  bg/primary-subtle, ActiveBar visible

──── Navigation/Tab ─────────────────────────────────────────────────────────────
Frame:    Hug × 36px
Layout:   Horizontal, gap: 6px, padding: 8px 16px
Anatomy:  [Label] [CountBadge?]
Variants:
  state = Default | Hover | Active | Disabled
  hasBadge = false | true

TabList frame:
  Layout: Horizontal, gap: 4px, padding: 4px
  Fill: bg/bg-input, radius: radius/md
  Each Tab has radius: radius/md

──── Data/Avatar ────────────────────────────────────────────────────────────────
Frame:    32px × 32px (MD), 40px × 40px (LG), 24px × 24px (SM)
Shape:    Circle (radius: radius/full)
Anatomy:  [Image OR Initials]
  Image: fills circle, object-fit: cover
  Initials: Heading/H5 or Body/SM-Semibold, text/on-primary
  bg: bg/primary (fallback)
  Verified badge: 12px × 12px green CheckCircle, absolute bottom-right

Variants:
  size      = SM | MD | LG
  hasImage  = false | true
  isVerified = false | true

──── Data/ConfidenceBar ─────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 6px
Anatomy:  [LabelRow] [ProgressTrack]
  LabelRow: Horizontal, spread: [Label Body/SM-Medium] [Value Mono/MD text/primary]
  ProgressTrack: Fill × 8px, bg: Neutral/100, radius: radius/full
    └─ ProgressFill: % width based on value, radius: radius/full
       Color: Green ≥80%, Orange 60-79%, Red <60%

Variants: value = 0-100 (number variable)

────────────────────────────────────────────────────────────────────────────────
### 4.2 MOLECULES (Composed from atoms)
────────────────────────────────────────────────────────────────────────────────

──── Card/Feature ───────────────────────────────────────────────────────────────
Frame:    Fill × Hug (min 160px height)
Layout:   Vertical, gap: 16px, padding: 20px
bg: bg/card, border: 1px border/default, radius: radius/lg, shadow: Shadow/card
Hover: shadow: Shadow/card-hover, translateY: -2px

Anatomy:
  [IconBadge]       48px × 48px, radius: radius/md, bg: feature-specific
  [ContentGroup]    Vertical, gap: 4px
    [Title]         Heading/H4, text/primary
    [Description]   Body/SM-Regular, text/secondary, maxLines: 2
  [CTARow]          Horizontal, justify: flex-end
    [CTALabel]      Body/SM-Medium, text/link "Open →"

Variants:
  feature = symptomChecker | imageChecker | emergency | diseaseLibrary | hospitalFinder | history
  state   = Default | Hover

Feature-specific icon badge colours:
  symptomChecker: bg: Blue/50,   icon: Blue/600
  imageChecker:   bg: Purple/50, icon: Purple/600
  emergency:      bg: Red/50,    icon: Red/600
  diseaseLibrary: bg: Green/50,  icon: Green/600
  hospitalFinder: bg: Orange/50, icon: Orange/600
  history:        bg: Teal/50,   icon: Teal/600

──── Card/Disease ────────────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 12px, padding: 16px
bg: bg/card, border: 1px border/default, radius: radius/lg, shadow: Shadow/card
Hover: shadow: Shadow/card-hover, border: border/focus

Anatomy:
  [HeaderRow]  Horizontal, justify: space-between, align: center
    [Title]    Heading/H4, text/primary, maxLines: 2, truncate
    [SeverityBadge]
  [SymptomChips]  Horizontal, gap: 6px, wrap: true
    3× Tag/default chips for top symptoms
    "+N more" ghost tag if >3 symptoms
  [FooterRow]  Horizontal, justify: flex-end
    [CTAButton]  Button/Ghost "View Details →"

Variants:
  severity = mild | moderate | severe
  state    = Default | Hover | Selected

──── Card/HospitalCard ──────────────────────────────────────────────────────────
Frame:    Fill × Hug (as article)
Layout:   Vertical, gap: 0px (sections divided by internal padding)
bg: bg/card, border: 1px border/default, radius: radius/lg

Anatomy:
  [HeaderSection]   padding: 16px 16px 12px, Horizontal, gap: 12px
    [IconWrapper]   40px × 40px, bg: Blue/50, radius: radius/md
      [HospitalIcon] 20px, Blue/600
    [InfoGroup]     Vertical, gap: 2px, flex: 1, min-width: 0
      [NameRow]     Horizontal, gap: 6px, align: center
        [Name]      Heading/H5, text/primary, truncate
        [OpenBadge] "Open"/"Closed" Tag
      [Address]     Body/SM-Regular, text/muted, maxLines: 1, truncate
      [MetaRow]     Horizontal, gap: 12px
        [Distance]  Body/SM-Medium, text/secondary, Mono/SM
        [Type]      Body/SM-Regular, text/muted
    [RatingGroup]   Vertical, gap: 2px, align: flex-end
      [Stars]       12px star icons, Orange/500
      [Count]       Body/XS-Regular, text/muted

  [Divider]         1px, border/default

  [SpecialtyRow]    padding: 8px 16px, Horizontal, gap: 6px, wrap: true
    N× Specialty Tag chips

  [Divider]         1px, border/default

  [ActionRow]       padding: 12px 16px, Horizontal, gap: 8px, justify: flex-end
    [CallButton]    Button/Danger SM "📞 Call"
    [DirectionBtn]  Button/Secondary SM "🗺 Directions"
    [DetailsBtn]    Button/Ghost SM "ℹ Details"

Variants:
  isOpen     = true | false
  isSelected = false | true  (selected: border: border/focus 2px)
  hasPhoto   = false | true

──── Card/EmergencyContact ──────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Horizontal, gap: 12px, padding: 16px
bg: bg/card, border: 1px border/default, radius: radius/lg

Anatomy:
  [TypeIcon]    40px × 40px, radius: radius/md
    hospital:  bg: Red/50, icon: Red/600
    ambulance: bg: Orange/50, icon: Orange/600
    helpline:  bg: Blue/50, icon: Blue/600
  [ContentGroup] Vertical, gap: 4px, flex: 1, min-width: 0
    [Name]      Heading/H5, text/primary, truncate
    [Address]   Body/SM-Regular, text/muted, maxLines: 1
    [Badges]    Horizontal, gap: 6px
      [AvailBadge] "24/7" Tag/green if available_24h
      [Distance]   Body/SM-Medium Mono, text/secondary
  [ActionGroup] Vertical, gap: 6px, align: center
    [CallBtn]   Button/Danger SM min-h: 48px "📞 Call"
    [DirBtn]    Button/Ghost SM "🗺 Dir"

Variants:
  type         = hospital | ambulance | helpline | clinic | blood_bank
  available24h = false | true

──── Card/DiagnosisResult ───────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 0 (internal sections)
bg: bg/card, radius: radius/lg, shadow: Shadow/card
Left border accent: 4px × full-height, color = severity color

Anatomy:
  [HeaderSection]    padding: 20px, Vertical, gap: 12px
    [TopRow]         Horizontal, justify: space-between
      [DiseaseName]  Heading/H2, text/primary
      [SeverityBadge]
    [ConfidenceBar]
    [Description]    Body/MD-Regular, text/secondary

  [Divider]

  [SpecialistRow]    padding: 12px 20px, Horizontal, gap: 8px, align: center
    [DoctorIcon]     20px, text/muted
    [Label]          Body/MD-Regular, text/secondary "Consult a"
    [SpecialistLink] Body/MD-Semibold, text/link, underline

  [Divider]

  [ActionRow]        padding: 12px 20px, Horizontal, gap: 8px, justify: flex-end
    [SaveBtn]        Button/Secondary SM "Save Result"
    [NewCheckBtn]    Button/Ghost SM "Check Again"

Variants:
  severity = mild | moderate | severe

──── Card/ActivityCard ──────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Horizontal, gap: 12px, padding: 12px 16px
bg: bg/card, border: 1px border/default, radius: radius/lg

Anatomy:
  [TypeTag]      "Symptom" or "Image" Tag, color: blue or purple
  [ContentGroup] Vertical, gap: 2px, flex: 1, min-width: 0
    [ResultName] Body/MD-Semibold, text/primary, truncate
    [Timestamp]  Body/SM-Regular, text/muted, Intl.DateTimeFormat format
  [ViewLink]     Body/SM-Medium, text/link "View →"

Variants: type = symptom_check | image_check

──── Navigation/Header ──────────────────────────────────────────────────────────
Frame:    Fill × 64px (fixed)
Layout:   Horizontal, gap: 0, padding: 0 16px, align: center
bg: bg/card, border-bottom: 1px border/default

Sections (use Horizontal auto layout with spacer between):
  [LeftGroup]   Horizontal, gap: 8px, align: center
    [MenuToggle]  Button/Ghost 36px×36px (icon-only)
    [LogoMark]    32px × 32px, bg: bg/primary, radius: radius/md
    [AppName]     Heading/H4 "Medicare AI", text/primary (hidden on mobile)

  [Spacer]      flex: 1

  [RightGroup]  Horizontal, gap: 8px, align: center
    [LangSelector]  Component (see below)
    [NotifBell]     36px × 36px icon button with Badge overlay
    [UserMenu]      Horizontal, gap: 8px [Avatar/MD] [Name truncated] [VerifiedIcon?]

──── Navigation/LangSelector ────────────────────────────────────────────────────
Frame:    Hug × 36px
Layout:   Horizontal, gap: 6px, padding: 6px 12px
bg: bg/card, border: 1px border/default, radius: radius/md
Hover: bg: bg/bg-input, border: border/strong

Anatomy:
  [FlagEmoji]  16px text
  [LangLabel]  Body/SM-Medium, text/secondary (hidden on mobile < 768px)
  [ChevronDown] 14px icon, text/muted

Variants: language = en | hi | mr | ta | te | bn | gu

──── Navigation/Sidebar ─────────────────────────────────────────────────────────
Frame:    256px × Fill (Desktop expanded) | 64px × Fill (Desktop collapsed)
Layout:   Vertical, gap: 0
bg: bg/card, border-right: 1px border/default, shadow: Shadow/sidebar

Anatomy:
  [NavGroup]     Vertical, gap: 4px, padding: 16px 12px, flex: 1
    6× Navigation/SidebarItem
  [Divider]
  [BottomGroup]  Vertical, gap: 4px, padding: 12px
    3× Navigation/SidebarItem (WhatsNew, History, Settings)
  [UserCard]     Horizontal, gap: 8px, padding: 12px, bg: bg/bg-input, radius: radius/md
    [Avatar/SM] [UserInfo Vertical min-w-0] [VerifiedIcon]
    (hidden when collapsed=true)

Variants:
  collapsed = false | true
  device    = desktop | mobile (mobile = drawer overlay)

──── Overlay/Modal ───────────────────────────────────────────────────────────────
Frame:    480px × Hug (desktop) | Fill × Hug (mobile, bottom sheet)
Layout:   Vertical, gap: 0
bg: bg/card, radius: radius/xl, shadow: Shadow/modal

Anatomy:
  [ModalHeader]  Horizontal, padding: 20px 20px 16px, gap: 8px
    [Title]      Heading/H3, text/primary, flex: 1
    [CloseBtn]   Button/Ghost 32px × 32px icon-only
  [Divider]
  [ModalBody]    Vertical, padding: 20px, gap: 16px, overflow: scroll
    [slot: content]
  [ModalFooter]  Horizontal, padding: 16px 20px, gap: 8px, justify: flex-end
    [SecondaryBtn] [PrimaryBtn]

Variants:
  size    = SM (400px) | MD (480px) | LG (600px)
  hasFooter = false | true

──── Overlay/Drawer ──────────────────────────────────────────────────────────────
Frame:    400px × Fill (right-side sheet)
Layout:   Vertical, gap: 0
bg: bg/card, shadow: Shadow/modal
Position: fixed right, full height

Anatomy:
  [DrawerHeader]  padding: 20px, Horizontal
    [Title]       Heading/H3
    [CloseBtn]    Button/Ghost icon-only
  [Divider]
  [DrawerBody]    Vertical, padding: 20px, gap: 16px, overflow: scroll, flex: 1

Variants: width = SM (320px) | MD (400px) | LG (520px)

──── Overlay/Backdrop ───────────────────────────────────────────────────────────
Frame:    Fill × Fill
bg: Neutral/900 at 40% opacity

──── Form/DropZone ───────────────────────────────────────────────────────────────
Frame:    Fill × 200px
Layout:   Vertical, gap: 12px, align: center, justify: center
border: 2px dashed border/default, radius: radius/lg

Anatomy:
  [UploadIcon]      40px × 40px, text/muted
  [PrimaryText]     Body/LG-Medium, text/primary "Drag & drop an image here"
  [SecondaryRow]    Horizontal, gap: 8px, align: center
    [OrText]        Body/SM-Regular, text/muted "or"
    [BrowseBtn]     Button/Secondary SM "Browse files"
  [FormatHint]      Body/XS-Regular, text/muted "JPG, PNG, WEBP — Max 10 MB"

Variants:
  state = Idle | DragOver | Rejected | Uploaded

State fills:
  Idle:     border: dashed border/default, bg: transparent
  DragOver: border: dashed border/focus, bg: bg/primary-subtle
  Rejected: border: dashed border/error, bg: severity/sev-bg
  Uploaded: [replaced by ImagePreview component]

──── Form/SymptomSelect ──────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 8px

Anatomy:
  [SelectControl]  Fill × Hug, border: 1px border/default, radius: radius/md
    bg: bg/input, padding: 8px 12px
    [TagsRow]      Horizontal, gap: 6px, wrap: true, flex: 1
      N× Tag/blue dismissible
      [SearchInput] transparent, no border, Body/MD-Regular placeholder
    [ClearBtn]     16px × icon (only if tags present)

  [CountLabel]     Body/SM-Regular, text/muted "8 symptoms selected"

Variants:
  state = Default | Focus | Filled | Empty

──── Feedback/EmptyState ────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 12px, align: center, padding: 48px 24px

Anatomy:
  [Illustration]  80px × 80px (SVG placeholder or icon)
  [Title]         Heading/H4, text/primary, text-align: center
  [Description]   Body/MD-Regular, text/muted, text-align: center, maxLines: 3
  [CTAButton?]    Button/Primary or Button/Secondary (optional)

Variants:
  context = noHistory | noResults | noHospitals | error | locationDenied
  hasCTA  = false | true

──── Feedback/SkeletonLoader ────────────────────────────────────────────────────
Anatomy: Rectangles filled with shimmer gradient animation
  shimmer: linear-gradient(90deg, Neutral/100, Neutral/200, Neutral/100)
  Animation: backgroundPosition 0%→100% over 1.5s infinite

Component variants to match skeleton of:
  Skeleton/Card    — mimics Card/Disease
  Skeleton/Row     — mimics ActivityCard
  Skeleton/List    — 3 stacked Skeleton/Row

────────────────────────────────────────────────────────────────────────────────
### 4.3 ORGANISMS (Page-level sections)
────────────────────────────────────────────────────────────────────────────────

──── Section/WelcomeBanner ──────────────────────────────────────────────────────
Frame:    Fill × 160px (desktop), Fill × 140px (mobile)
Layout:   Horizontal, align: center, padding: 32px
bg: gradient Blue/600 → Blue/800 (linear, 135°), radius: radius/lg
overflow: hidden (for decorative circles)

Anatomy:
  [TextGroup]     Vertical, gap: 8px, flex: 1
    [DateLine]    Body/SM-Regular, text/on-primary at 70% opacity
    [Greeting]    Heading/H1 or Display/LG, text/on-primary
    [Subtitle]    Body/MD-Regular, text/on-primary at 80%
  [Illustration]  160px × 160px SVG, absolute right, partial overflow

──── Section/NationalHelplines ──────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 12px, padding: 16px
bg: Red/50, border: 1px Red/200, radius: radius/lg

Anatomy:
  [SectionTitle]  Body/MD-Semibold, Red/700 "National Helplines"
  [HelplineGrid]  Horizontal, gap: 12px, wrap: true
    5× HelplineButton component

HelplineButton:
  Frame: 160px × 80px (or Hug × 80px min)
  Layout: Vertical, gap: 4px, align: center, justify: center
  bg: bg/card, border: 1px Red/200, radius: radius/md
  [PhoneNumber]  Mono/XL, Red/600
  [Label]        Body/XS-Regular, text/muted
  Hover: bg: Red/50, border: Red/300

──── Section/FilterBar ───────────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Horizontal, gap: 8px, padding: 12px 0, wrap: true (mobile)
Position: sticky top: 64px (header height), z-index: 40
bg: bg/page (semi-transparent blur in production)

Anatomy:
  [SearchInput]   flex: 1, min-width: 200px, Form/Input with SearchIcon
  N× [FilterSelect]  Hug × 36px, antd Select styled to match design tokens
  [ActiveFilters]  Horizontal, gap: 6px, wrap: true
    N× Tag/dismissible for each active filter

──── Section/AccordionGroup ──────────────────────────────────────────────────────
Frame:    Fill × Hug
Layout:   Vertical, gap: 0
border: 1px border/default, radius: radius/lg
overflow: hidden

Anatomy:
  N× AccordionItem
  Each item divided by 1px border/default (except last)

AccordionItem:
  [Trigger]      Fill × 48px, Horizontal, gap: 12px, padding: 0 16px
    [Icon]       20px, text/muted
    [Label]      Body/MD-Semibold, text/primary
    [ChevronIcon] 16px, text/muted, rotates 180° when open
    Hover: bg: bg/bg-input
  [Content]      Fill × Hug, padding: 0 16px 16px, Vertical, gap: 8px
    [List]       Vertical, gap: 8px
      N× [ListItem] Horizontal, gap: 8px
        [Bullet] 6px circle, bg/primary
        [Text]   Body/MD-Regular, text/secondary

Variants: state = Closed | Open

──── Section/MapPanel ───────────────────────────────────────────────────────────
Frame:    Fill × Fill (sticky right panel on desktop)
bg: Neutral/100
Represents: Google Maps embed area (non-interactive in Figma)

Anatomy:
  [MapPlaceholder]  Fill × Fill, bg: Neutral/200
    [MapLabel]      Body/MD-Medium, text/muted centered "Google Maps"
  [MapControls]     Absolute, top-right, padding: 12px, Vertical, gap: 8px
    [ZoomIn]        Button/Secondary 36px × 36px "+"
    [ZoomOut]       Button/Secondary 36px × 36px "−"
    [MyLocation]    Button/Secondary 36px × 36px LocationIcon
  [ViewToggle]      Absolute, top-left, padding: 12px
    Navigation/Tab "📋 List | 🗺 Map" (mobile only)

================================================================================
## 5. PAGE FRAMES — LAYOUT STRUCTURE
================================================================================

────────────────────────────────────────────────────────────────────────────────
### 5.1 BREAKPOINTS
────────────────────────────────────────────────────────────────────────────────

Design at these widths (create separate frames per breakpoint):

  Mobile:   390px   (iPhone 14 — primary mobile target)
  Tablet:   768px   (iPad mini landscape / Android tablet)
  Desktop:  1280px  (most common laptop viewport)
  Wide:     1440px  (reference only — design scales from 1280px)

For each page, create frames at 390px and 1280px minimum.

────────────────────────────────────────────────────────────────────────────────
### 5.2 GRID SYSTEM
────────────────────────────────────────────────────────────────────────────────

Desktop (1280px):
  Columns: 12
  Gutter:  24px
  Margin:  32px

Tablet (768px):
  Columns: 8
  Gutter:  16px
  Margin:  24px

Mobile (390px):
  Columns: 4
  Gutter:  16px
  Margin:  16px

Sidebar-aware content area (desktop with sidebar open):
  Content max-width:  1140px (1280 - 256px sidebar - 32px*2 margin - 16px gap)
  Use Figma grid on the content area frame, not the full page frame

────────────────────────────────────────────────────────────────────────────────
### 5.3 PAGE FRAME TEMPLATES
────────────────────────────────────────────────────────────────────────────────

TEMPLATE: AppShell (Desktop 1280px)
Frame:    1280px × 900px (clip content, scroll implied)
Layout:   Vertical, gap: 0

Anatomy:
  [Header]         Fill × 64px  — Navigation/Header component
  [BodyRow]        Fill × 836px — Horizontal, gap: 0
    [Sidebar]      256px × Fill — Navigation/Sidebar component
    [MainContent]  Fill × Fill  — contains page-specific content
      padding: 32px
      max-width: 100% (constrained by parent)

TEMPLATE: AppShell (Mobile 390px)
Frame:    390px × 844px
Layout:   Vertical, gap: 0

Anatomy:
  [Header]         Fill × 56px  — Navigation/Header (no AppName text)
  [MainContent]    Fill × 788px — page content, padding: 16px
  [MobileNav]      hidden (sidebar is a drawer, triggered by header button)

================================================================================
## 6. AUTO LAYOUT RULES — CRITICAL FOR HANDOFF
================================================================================

These rules must be applied consistently. They are the most common source
of Figma-to-code mismatch.

RULE 1 — NEVER use absolute positioning inside auto layout frames.
  Exception: decorative elements (background circles, illustrations)
  Mark decorative absolutes clearly: layer name prefix "🎨 Deco/"

RULE 2 — Resizing modes
  Horizontal children inside a horizontal auto layout:
    - Fixed width items: Fixed × Fixed
    - Stretching items: Fill × Fixed
    - Content-sized items: Hug × Hug
  Apply "Fill container" for flex: 1 equivalents.

RULE 3 — Min/max width
  Use Figma's min/max width constraints for responsive components.
  Button: min-width 80px (SM), max-width none
  Input:  min-width 120px, max-width: Fill
  Card:   min-width 240px, max-width: Fill

RULE 4 — Wrap
  Enable "Wrap" in auto layout for tag groups, filter chips, specialty lists.
  Set "Alignment when wrapped" to Start.

RULE 5 — Gap between items vs padding
  ALWAYS use auto layout gap — never use spacer frames to create gaps.
  Exception: use a spacer frame ONLY for justify-between behavior.
  Spacer frame: 0px × 0px, Fill × Fixed, named "↔ Spacer"

RULE 6 — Text truncation
  For truncating text in fixed-width containers:
  - Set text layer to: Fixed width × Hug height
  - Enable "Truncate text" in text options
  - Never use a clip mask for text overflow

RULE 7 — Stroke alignment
  All border strokes: Inside alignment (matches CSS border-box)
  Focus rings: Outside alignment (matches CSS outline)

================================================================================
## 7. VARIANT PROPERTY MATRIX — COMPLETE LIST
================================================================================

For each component, these are the Figma variant properties to define.
Property names map directly to React prop names for seamless handoff.

┌────────────────────────┬──────────────────────────────────────────────────────┐
│ Component              │ Variant Properties                                   │
├────────────────────────┼──────────────────────────────────────────────────────┤
│ Button/Primary         │ size, state, hasLeftIcon, hasRightIcon, fullWidth    │
│ Button/Secondary       │ size, state, hasLeftIcon, hasRightIcon, fullWidth    │
│ Button/Ghost           │ size, state, hasIcon, iconOnly                       │
│ Button/Danger          │ size, state, hasLeftIcon                             │
│ Form/Input             │ size, state, hasPrefix, hasSuffix, type              │
│ Form/Label             │ required                                             │
│ Form/FieldGroup        │ state, showHelper                                    │
│ Form/OTPInput          │ state (per digit)                                    │
│ Form/DropZone          │ state                                                │
│ Form/SymptomSelect     │ state                                                │
│ Feedback/Badge         │ severity, type                                       │
│ Feedback/Tag           │ color, dismissible                                   │
│ Feedback/Alert         │ type, closable, showTitle                            │
│ Feedback/Spinner       │ size                                                 │
│ Feedback/EmptyState    │ context, hasCTA                                      │
│ Feedback/SkeletonLoader│ type (card/row/list)                                 │
│ Data/Avatar            │ size, hasImage, isVerified                           │
│ Data/ConfidenceBar     │ value (0–100)                                        │
│ Navigation/SidebarItem │ state, collapsed, hasBadge, feature                 │
│ Navigation/Tab         │ state, hasBadge                                      │
│ Navigation/Header      │ device (desktop/mobile)                              │
│ Navigation/Sidebar     │ collapsed, device                                    │
│ Navigation/LangSelector│ language                                             │
│ Card/Feature           │ feature, state                                       │
│ Card/Disease           │ severity, state                                      │
│ Card/Hospital          │ isOpen, isSelected, hasPhoto                         │
│ Card/Emergency         │ type, available24h                                   │
│ Card/DiagnosisResult   │ severity                                             │
│ Card/ActivityCard      │ type                                                 │
│ Overlay/Modal          │ size, hasFooter                                      │
│ Overlay/Drawer         │ width                                                │
│ Section/AccordionItem  │ state (open/closed)                                  │
└────────────────────────┴──────────────────────────────────────────────────────┘

================================================================================
## 8. FIGMA LAYER NAMING CONVENTION
================================================================================

Consistent naming makes inspect, handoff, and Figma-to-code mapping clean.

RULE: Name = what it IS, not what it LOOKS LIKE.
  ✅ "card/title"           (what it is)
  ❌ "Big Blue Rectangle"   (what it looks like)

Naming pattern:  category/descriptor

Prefix guide:
  btn/      — button or clickable element
  txt/      — text layer
  icon/     — icon (16px, 20px, 24px)
  img/      — image or illustration
  bg/       — background shape (non-interactive)
  border/   — stroke-only frame used as border
  divider/  — horizontal or vertical separator line
  badge/    — small indicator chip
  input/    — form input field
  card/     — card container
  slot/     — placeholder for swappable content
  🎨 Deco/  — purely decorative, aria-hidden in code

Section naming (capitalised):
  HEADER, SIDEBAR, MAIN-CONTENT, FOOTER (all caps = structural frames)

Page frame naming:
  [Page] / [Breakpoint] / [State]
  Examples:
    Dashboard / Desktop-1280 / Default
    Auth / Mobile-390 / OTP
    Emergency / Desktop-1280 / LocationDenied

================================================================================
## 9. TOKEN → TAILWIND → FIGMA MAPPING REFERENCE
================================================================================

Complete mapping so any token value can be traced across all three systems.

┌─────────────────────────┬────────────────────────┬──────────────────────────┐
│ Figma Token             │ Tailwind Class          │ CSS Value                │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ bg/primary              │ bg-brand-primary        │ #0057D9                  │
│ bg/primary-hover        │ hover:bg-brand-primaryH │ #0047B8                  │
│ bg/primary-subtle       │ bg-brand-primary/10     │ rgba(0,87,217,0.10)      │
│ bg/card                 │ bg-white                │ #FFFFFF                  │
│ bg/page                 │ bg-brand-surface        │ #F7F9FC                  │
│ bg/danger               │ bg-brand-danger         │ #E53E3E                  │
│ bg/danger-subtle        │ bg-red-50               │ #FEF2F2                  │
│ bg/success              │ bg-brand-secondary      │ #00B894                  │
│ bg/success-subtle       │ bg-green-50             │ #ECFDF5                  │
│ bg/warning-subtle       │ bg-orange-50            │ #FFF7ED                  │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ text/primary            │ text-brand-text         │ #1A202C                  │
│ text/secondary          │ text-brand-textLight    │ #4A5568                  │
│ text/muted              │ text-brand-muted        │ #8A94A6                  │
│ text/link               │ text-brand-primary      │ #0057D9                  │
│ text/on-primary         │ text-white              │ #FFFFFF                  │
│ text/danger             │ text-brand-danger       │ #E53E3E                  │
│ text/success            │ text-brand-secondary    │ #00B894                  │
│ text/warning            │ text-brand-warning      │ #DD6B20                  │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ border/default          │ border-brand-border     │ #E4E8EF                  │
│ border/focus            │ ring-brand-primary      │ #0057D9                  │
│ border/error            │ border-brand-danger     │ #E53E3E                  │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ severity/mild-bg        │ bg-green-50             │ #ECFDF5                  │
│ severity/mild-text      │ text-green-700          │ #059669                  │
│ severity/mod-bg         │ bg-orange-50            │ #FFF7ED                  │
│ severity/mod-text       │ text-orange-700         │ #C2410C                  │
│ severity/sev-bg         │ bg-red-50               │ #FEF2F2                  │
│ severity/sev-text       │ text-red-700            │ #DC2626                  │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ radius/sm               │ rounded-sm (4px)        │ 4px                      │
│ radius/md               │ rounded-[8px]           │ 8px                      │
│ radius/lg               │ rounded-card (12px)     │ 12px                     │
│ radius/xl               │ rounded-[16px]          │ 16px                     │
│ radius/full             │ rounded-full            │ 9999px                   │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ spacing/1 (4px)         │ p-1 / m-1 / gap-1      │ 4px                      │
│ spacing/2 (8px)         │ p-2 / m-2 / gap-2      │ 8px                      │
│ spacing/3 (12px)        │ p-3 / m-3 / gap-3      │ 12px                     │
│ spacing/4 (16px)        │ p-4 / m-4 / gap-4      │ 16px                     │
│ spacing/5 (20px)        │ p-5 / m-5 / gap-5      │ 20px                     │
│ spacing/6 (24px)        │ p-6 / m-6 / gap-6      │ 24px                     │
│ spacing/8 (32px)        │ p-8 / m-8 / gap-8      │ 32px                     │
│ spacing/10 (40px)       │ p-10 / m-10 / gap-10   │ 40px                     │
│ spacing/12 (48px)       │ p-12 / m-12 / gap-12   │ 48px                     │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ Shadow/card             │ shadow-card             │ 0 1px 3px #00000010      │
│ Shadow/card-hover       │ shadow-cardHover        │ 0 4px 12px #0000001A     │
│ Shadow/sidebar          │ shadow-sidebar          │ 4px 0 24px #0000000F     │
│ Shadow/focus-ring       │ ring-2 ring-brand-prim  │ 0 0 0 3px #0057D940      │
├─────────────────────────┼────────────────────────┼──────────────────────────┤
│ Body/MD-Regular         │ text-sm font-normal     │ 14px/20px DM Sans 400    │
│ Body/MD-Medium          │ text-sm font-medium     │ 14px/20px DM Sans 500    │
│ Body/MD-Semibold        │ text-sm font-semibold   │ 14px/20px DM Sans 600    │
│ Body/LG-Regular         │ text-base font-normal   │ 16px/24px DM Sans 400    │
│ Body/SM-Regular         │ text-xs font-normal     │ 12px/16px DM Sans 400    │
│ Heading/H1              │ text-2xl font-bold      │ 28px/36px DM Sans 700    │
│ Heading/H2              │ text-xl font-semibold   │ 24px/32px DM Sans 600    │
│ Heading/H3              │ text-lg font-semibold   │ 20px/28px DM Sans 600    │
│ Heading/H4              │ text-base font-semibold │ 16px/24px DM Sans 600    │
│ Mono/XL                 │ font-mono text-2xl bold │ 24px/28px JetBrains 700  │
└─────────────────────────┴────────────────────────┴──────────────────────────┘

================================================================================
## 10. FIGMA SETUP CHECKLIST
================================================================================

Before handing off to development, verify every item:

FOUNDATIONS PAGE
  ☐ All 9 Primitive color groups created as Variables
  ☐ All Semantic color aliases point to Primitives (not raw hex)
  ☐ All 22 Text Styles created with correct font/size/weight/LH
  ☐ All 6 Effect Styles (shadows) created
  ☐ Spacing scale created as Variables (Number type)
  ☐ Border radius scale created as Variables
  ☐ DM Sans and Noto Sans fonts loaded in Figma

COMPONENTS PAGE
  ☐ Every component uses Semantic color tokens (no raw hex values)
  ☐ Every component has all listed variants in property panel
  ☐ Variant properties named exactly as listed (match React props)
  ☐ All interactive states present: Default, Hover, Focus, Disabled
  ☐ All text layers use named Text Styles (not local overrides)
  ☐ No absolute positioned layers inside auto layout (except Deco/)
  ☐ All components have correct resizing: Hug or Fill (no fixed where flex intended)
  ☐ All frame names follow naming convention
  ☐ Components published to team library
  ☐ Deprecated variants marked with "🗑️" prefix in layer name

PAGE FRAMES
  ☐ Desktop (1280px) and Mobile (390px) frames for every page
  ☐ Grid overlay applied and visible in all frames
  ☐ Header and Sidebar use component instances (not detached)
  ☐ All cards/lists use component instances from library
  ☐ No lorem ipsum — all copy is real (or uses [PLACEHOLDER] markers)
  ☐ All images use real or representative placeholder images
  ☐ Overflow clips set correctly on scroll containers

HANDOFF READINESS
  ☐ Every component has a corresponding section in the PRD
  ☐ Token names match Tailwind config variable names exactly
  ☐ Figma "Dev Mode" links point to correct component source files
  ☐ Code Connect configured for each component (optional but recommended)
  ☐ Accessibility annotations added: focus order, aria-labels, roles
  ☐ Interaction prototypes linked for: Auth flow, Sidebar toggle, Drawer open/close
