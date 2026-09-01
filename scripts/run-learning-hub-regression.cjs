'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'learn.html'), 'utf8');
const results = [];

function run(id, fn) {
  try {
    fn();
    results.push({ id, status: 'PASS' });
  } catch (error) {
    results.push({ id, status: 'FAIL', error: error.message });
  }
}

const expectedGoals = [
  'weight',
  'general-lifestyle',
  'gut-microbiome',
  'digestive-reflux',
  'blood-pressure',
  'lipids-cholesterol',
  'metabolic-health',
  'fasting-autophagy',
  'parasite-pet-exposure',
  'food-ingredient',
  'sleep-movement-hydration',
  'help-me-choose',
  'other'
];

const goalMatches = [...html.matchAll(/data-learning-goal="([^"]+)"/g)].map((m) => m[1]);
const notYetBuiltMatches = [...html.matchAll(/data-destination-state="not-yet-built"/g)];
const availableMatches = [...html.matchAll(/data-destination-state="available"/g)];

run('LH-R01', () => assert.equal(goalMatches.length, 13, 'Learning Hub must expose exactly 13 goal cards'));
run('LH-R02', () => assert.deepEqual(goalMatches, expectedGoals, 'Learning Hub goal IDs/order changed unexpectedly'));
run('LH-R03', () => assert.equal(new Set(goalMatches).size, goalMatches.length, 'Learning Hub goal IDs must be unique'));
run('LH-R04', () => assert.equal(notYetBuiltMatches.length, 5, 'Exactly five current goal pathways should be truthfully marked not-yet-built'));
run('LH-R05', () => assert.equal(availableMatches.length, 8, 'Exactly eight current goal pathways should be marked available'));
run('LH-R06', () => assert.match(html, /not public release authority/i, 'Development/release boundary banner missing'));
run('LH-R07', () => assert.match(html, /not diagnoses or personalized treatment plans/i, 'Education/not-diagnosis boundary missing'));
run('LH-R08', () => assert.match(html, /does not claim a universal exact human autophagy clock/i, 'Autophagy no-universal-clock boundary missing'));
run('LH-R09', () => assert.match(html, /Pet ownership by itself does not prove a human parasitic infection/i, 'Pet ownership parasite-evidence boundary missing'));
run('LH-R10', () => assert.match(html, /Help Me Choose/i, 'Help Me Choose card missing'));
run('LH-R11', () => assert.match(html, /free goal-first routing tools/i, 'Help Me Choose free boundary missing'));
run('LH-R12', () => assert.match(html, /without being forced into a paid path/i, 'No-forced-paid-path boundary missing'));
run('LH-R13', () => assert.match(html, /UHH-WEBSITE-9\.5-DEVELOPMENT-2026-08-30/, '9.5 project metadata missing'));
run('LH-R14', () => assert.match(html, /href="gut-health\.html"/, 'Gut education route missing'));
run('LH-R15', () => assert.match(html, /href="digestive-conditions\.html"/, 'Digestive education route missing'));
run('LH-R16', () => assert.match(html, /href="metabolic-health\.html"/, 'Metabolic education route missing'));
run('LH-R17', () => assert.match(html, /href="parasites-candida\.html"/, 'Parasite education route missing'));
run('LH-R18', () => assert.match(html, /href="additives\.html"/, 'Food/additives education route missing'));
run('LH-R19', () => assert.match(html, /href="index\.html#goal-first"/, 'Help Me Choose route missing'));
run('LH-R20', () => assert.match(html, /Missing pathways are labeled honestly rather than presented as complete/i, 'Truthful unavailable-state copy missing'));

const failed = results.filter((result) => result.status !== 'PASS');
console.log(JSON.stringify({ suite: 'R-P2-05-LEARNING-HUB', results, pass: failed.length === 0 }, null, 2));
if (failed.length) process.exitCode = 1;
