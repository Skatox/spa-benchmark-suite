<section class="space-y-4">
  <h2 class="text-2xl font-semibold text-slate-900">About this app</h2>
  <p class="text-sm text-slate-600">
    This Svelte implementation follows the SPA benchmark specification with a focus on predictable
    rendering, client-side routing, and performance instrumentation. Explore the routes to inspect
    pagination, filtering, and form validation behaviours.
  </p>
  <ul class="list-disc space-y-2 pl-6 text-sm text-slate-600">
    <li>Svelte 4 with svelte-spa-router and custom writable stores for state management.</li>
    <li>Tailwind CSS utilities with Headless UI dialog components for accessible overlays.</li>
    <li>Mock API layer simulating latency, jitter, and error scenarios.</li>
    <li>Performance metrics emitted via <code>performance.mark</code> and Web Vitals observers.</li>
  </ul>
  <p class="text-sm text-slate-600">
    Review the project documentation for the expected metrics and interaction flows. Use the stress
    test mode on the items screen to validate responsiveness under bursty state updates.
  </p>
</section>
