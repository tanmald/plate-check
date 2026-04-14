import posthog from 'posthog-js';

posthog.init('phc_kC8CRopNiQRtDSbDMuKDfR5c8Ea5mRrKnSANnrgffcSm', {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  defaults: '2026-01-30',
});

export default posthog;
