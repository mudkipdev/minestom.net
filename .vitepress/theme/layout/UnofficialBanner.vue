<template>
  <div class="unofficial-banner">
    This website is unofficial. For the official Minestom documentation, go to
    <a href="https://minestom.net" style="margin-left: 4px"><strong>minestom.net.</strong></a>
  </div>
</template>

<style>
:root {
  --banner-height: 2.25rem;
}

.unofficial-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-nav, 30);
  height: var(--banner-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  font-size: 0.875rem;
  background-color: var(--vp-c-warning-soft, #fff4d6);
  color: var(--vp-c-warning-1, #8f6d00);
  border-bottom: 1px solid var(--vp-c-warning-2, #e6c200);
}

.unofficial-banner a {
  color: inherit;
  text-decoration: underline;
}

body {
  padding-top: var(--banner-height);
}

.VPNav,
.VPLocalNav,
.VPSidebar {
  top: var(--banner-height) !important;
}

.VPSidebar {
  height: calc(100vh - var(--banner-height)) !important;
}

html {
  scroll-padding-top: calc(var(--banner-height) + var(--vp-nav-height));
}
</style>
