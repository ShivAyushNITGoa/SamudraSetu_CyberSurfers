// Minimal ambient declarations to unblock builds/lints when types are unavailable

// Allow JSX without full React type packages installed
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Google Maps global namespace types
/// <reference types="@types/google.maps" />


