# How to Change Product Status

This guide explains how to change product status on both the Status page and Products page.

## Available Status Types

1. **UNDETECTED** - Green (safe)
2. **UPDATING** - Amber/Yellow (maintenance)
3. **DETECTED** - Red (unsafe)

## Step-by-Step Instructions

### Changing Status on STATUS PAGE (status.html)

1. **Find the product** you want to change in `status.html`
2. **Look for the product card** (starts with `<div class="bg-gradient-to-b from-...`)
3. **Replace ALL color classes** in the product card:

**For UNDETECTED (Green):**
```html
<!-- Product card background -->
<div class="bg-gradient-to-b from-green-500/15 to-[#141419] ...">
  <!-- Status bar at top -->
  <div class="h-1 rounded-full w-full bg-gradient-to-r from-green-500 to-green-400"></div>
  
  <!-- Status badge -->
  <div class="bg-green-500/20 border-green-500/40 text-green-500 border text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-2">
    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
    <span>UNDETECTED</span>
  </div>
```

**For UPDATING (Amber):**
```html
<!-- Product card background -->
<div class="bg-gradient-to-b from-amber-500/15 to-[#141419] ...">
  <!-- Status bar at top -->
  <div class="h-1 rounded-full w-full bg-gradient-to-r from-amber-500 to-amber-400"></div>
  
  <!-- Status badge -->
  <div class="bg-amber-500/20 border-amber-500/40 text-amber-500 border text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-2">
    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
    <span>UPDATING</span>
  </div>
```

**For DETECTED (Red):**
```html
<!-- Product card background -->
<div class="bg-gradient-to-b from-red-500/15 to-[#141419] ...">
  <!-- Status bar at top -->
  <div class="h-1 rounded-full w-full bg-gradient-to-r from-red-500 to-red-400"></div>
  
  <!-- Status badge -->
  <div class="bg-red-500/20 border-red-500/40 text-red-500 border text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-2">
    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
    <span>DETECTED</span>
  </div>
```

### Changing Status on PRODUCTS PAGE (products.html)

1. **Find the product** you want to change in `products.html`
2. **Look for the product card** (starts with `<div class="bg-gradient-to-b from-...`)
3. **Replace the same color classes** as above

### Quick Color Reference

| Status | Background | Status Bar | Badge Background | Badge Border | Badge Text | Dot | Text |
|--------|------------|------------|------------------|--------------|------------|-----|------|
| UNDETECTED | `from-green-500/15` | `from-green-500 to-green-400` | `bg-green-500/20` | `border-green-500/40` | `text-green-500` | `bg-green-500` | UNDETECTED |
| UPDATING | `from-amber-500/15` | `from-amber-500 to-amber-400` | `bg-amber-500/20` | `border-amber-500/40` | `text-amber-500` | `bg-amber-500` | UPDATING |
| DETECTED | `from-red-500/15` | `from-red-500 to-red-400` | `bg-red-500/20` | `border-red-500/40` | `text-red-500` | `bg-red-500` | DETECTED |

## Important Notes

- **Always change BOTH pages** (status.html AND products.html) to keep them synchronized
- **Replace ALL instances** of the old color with the new color in the product card
- **Don't forget to change the status text** (UNDETECTED/UPDATING/DETECTED)
- **Keep the same structure** - only change colors and status text

## Example: Changing Rust from UPDATING to UNDETECTED

1. Open `status.html` and find the Rust product
2. Change `amber-500` to `green-500` in all places
3. Change `UPDATING` to `UNDETECTED`
4. Open `products.html` and repeat the same changes
5. Save both files

That's it! The status will now be updated on both pages.
