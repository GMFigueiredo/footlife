# Football Career Simulator — Project Documentation

**Working title:** Untitled Football Career Simulator  
**Document status:** Foundation / living design document  
**Platform:** Offline-first browser game (desktop-first, responsive where practical)

## 1. Product vision

Create a deeply reactive football life simulator in which the player inhabits one footballer's entire career: childhood, development, matches, relationships, risk, reputation, wealth, setbacks, and legacy.

The game combines the personal-life storytelling of *RealLives* and *BitLife*, the systemic depth of Paradox-style simulations, and a football career fantasy that is centered on one player rather than club management. It deliberately avoids expensive 3D presentation. Its value comes from choices, probabilities, records, consequences, and a world that remembers what happened.

**Core promise:** If the player becomes the next Pelé, Maradona, or a uniquely controversial star, the game world recognizes it, reacts to it, and preserves the story.

## 2. Design pillars

1. **One life, one player.** The player controls a footballer, not a club.
2. **A world with memory.** Records, headlines, relationships, rivalries, scandals, and historic performances persist.
3. **Meaningful uncertainty.** Skills influence outcomes, but context, risk, luck, form, and pressure matter.
4. **Player agency over spectacle.** Choose actions in decisive moments; do not require arcade-level controls.
5. **Human stories, responsibly handled.** Country and life conditions shape opportunity without defining a person's worth or destiny. Sensitive themes are optional and configurable.
6. **Modding is a first-class feature.** Rules and content are data-driven, inspectable, replaceable, and extendable.
7. **No mandatory server.** The base game runs locally in a browser and saves locally.

## 3. Target player experience

A player can begin as a teenager from a modest background, make decisions around school, family, trials, friendships, and development, then experience football through decisive match moments. A great match can lead to a newspaper story, a contract offer, a rivalry, sponsor interest, a national-team call-up, or a historic record. A poor decision can affect trust, finances, health, relationships, or career trajectory.

The intended emotional arc is not merely “raise attributes and win trophies.” It is “tell me how this person became who they were.”

## 4. Game loop

```text
Create character → Live between matches → Train / recover / choose → Play match moments
       ↑                                                              ↓
       └──── Reputation, results, relationships, records, offers, and life consequences ────┘
```

### Seasonal rhythm

1. Review calendar, team context, objectives, and personal situation.
2. Make life and career decisions.
3. Train, recover, build relationships, and manage money.
4. Play or simulate a match using interactive decisive moments.
5. Receive match rating, news coverage, relationship changes, and consequences.
6. Progress through contracts, transfers, competitions, aging, and world events.

## 5. Character creation

Two supported modes:

| Mode | Purpose | Rule |
|---|---|---|
| Career | Main progression experience | Limited points; strengths require trade-offs. |
| Free mode | Sandbox and balancing tool | Unrestricted attributes and editable conditions. Clearly marked as a sandbox run. |

Attributes should initially be understandable and match-facing: finishing, passing, dribbling, first touch, pace, agility, strength, stamina, positioning, vision, composure, anticipation, bravery, professionalism, and temperament.

Separate long-term **personality/reputation traits** from football ability. Examples: disciplined, loyal, charismatic, outspoken, hot-headed, humble, flamboyant, resilient, and controversial.

## 6. Match-moment engine

The first game does **not** simulate detailed movement and decision-making for all 22 players. Instead, it runs an abstract match simulation that creates interactive, plausible player-involvement scenarios.

### Match state

The simulation maintains serializable state including:

- minute, score, stoppage time, possession tendency, and match importance;
- player role, tactical instruction, fitness, fatigue, morale, confidence, and form;
- team and opponent quality, style, tactical posture, discipline, and fatigue;
- weather, venue, pressure, cards, injuries, substitutions, and current momentum.

### Scenario flow

1. The broad simulator advances the match and determines possession flow and opportunity quality.
2. It decides whether the controlled player is involved, weighted by position, attributes, instructions, team style, and context.
3. It selects a scenario, presents the fiction, and offers choices.
4. The resolver calculates outcomes from skills, opposition, situation, risk, and seeded randomness.
5. Results update match state, ratings, confidence, statistics, news hooks, and future opportunities.

Initial scenario library:

- through ball / one-on-one;
- shot after a cutback;
- dribble against a defender;
- key pass in the final third;
- cross or aerial duel;
- loose-ball scramble;
- long-range shot;
- penalty, free kick, and corner;
- pressing/interception or defensive duel;
- retaliation/discipline decision;
- injury-risk decision.

The player may choose an **odds display mode**: exact percentages, qualitative risk labels, or no displayed odds. The underlying calculation remains the same.

### Design guardrails

- Do not let interactive moments produce implausible personal statistics without limits from role, opportunity, fatigue, and opposition.
- Ambitious plays should be lower probability but potentially memorable and high-impact.
- A player with suitable intelligence, pace, positioning, or technique should generate different *kinds* of moments, not only larger success percentages.
- The engine must use a seeded random generator so a match can be reproduced for debugging and balance testing.

## 7. Reactive world and narrative

Every meaningful event creates structured tags, not just text. For example, an extraordinary Champions League performance may emit:

`record_broken`, `historic_performance`, `global_attention`, `rivalry_fuel`, `sponsor_interest`.

Other systems consume those tags to generate:

- headlines, articles, broadcasts, and social reaction;
- sponsor interest and contract offers;
- supporters' sentiment and public reputation;
- teammate, family, agent, manager, and rival reactions;
- awards, records, and historical timelines;
- future callbacks in commentary and events.

The game should store both objective achievements (goals, trophies, records) and social interpretation (beloved, divisive, unreliable, clutch, mercenary, icon).

## 8. Life simulation and world data

Country and region profiles affect starting conditions, available opportunities, and event probabilities. Candidate dimensions include economic conditions, education, healthcare, conflict risk, infectious-disease risk, football participation, youth infrastructure, league wealth, league quality, and social/legal climate.

This information must be represented as probabilistic context—not immutable judgment about people from a place. The player can overcome constraints, and individual family circumstances can diverge substantially from national averages.

Sensitive themes (illness, war, discrimination, crime, gambling, doping, sexuality-related consequences, and violence) need content settings, respectful writing, and clear boundaries. Never present suffering as a trivial reward loop.

For the prototype, use Brazil as the real-world data context, divided by the five IBGE macroregions. Its clubs, people, competitions, media, sponsors, and names remain fictional. Use a deliberately small, authored data set; add broader real-world statistical snapshots only once the core simulation is enjoyable and the source/licensing/update policy is defined.

## 9. Economy, clubs, and sponsors

The long-term world includes clubs, leagues, agents, sponsors, salaries, endorsements, taxes, property, cars, investments, debts, gambling, and financial risk.

For the first playable prototype, scope this to:

- club wage;
- simple household budget;
- one contract renewal/transfer choice;
- one sponsor opportunity;
- savings and one meaningful financial decision.

Sponsors should have budgets, target audiences, risk tolerance, geographic interests, and reputation preferences. A controversial star may receive different offers than a dependable captain, rather than simply fewer offers.

## 10. Technical direction

### Chosen stack

| Concern | Choice | Reason |
|---|---|---|
| Game logic | TypeScript, framework-independent | Testable, deterministic, and easy to mod. |
| Application UI | React | Best fit for data-heavy screens, menus, accessibility, and long-form narrative. |
| Match presentation | Phaser 2D | Simple top-down pitch view now; optional richer visual layer later. |
| Persistence | IndexedDB | Local, browser-native save storage without a server. |
| Content and mods | JSON packs with schemas | Human-editable and portable. |
| Build tooling | Vite | Fast, simple browser development setup. |

### Non-negotiable boundaries

- Simulation is the source of truth; React and Phaser render it but do not own it.
- Saved games contain serializable simulation state, never UI or renderer objects.
- Randomness uses a stored seed and named random streams where needed.
- Content files use stable IDs rather than filenames or display names as references.
- Every rules change should be possible through a mod or clearly separated rules configuration where practical.

### Proposed project shape

```text
src/
  sim/          deterministic world, career, match, event, and economy logic
  content/      bundled data packs and schemas
  ui/           React screens and components
  match-view/   Phaser pitch renderer and presentation
  save/         IndexedDB saves, migration, import/export
  modding/      pack loading and validation
  tests/        simulation and scenario tests
```

## 11. Modding model

A mod pack declares an ID, version, dependencies, and content files. Packs can add or override countries, clubs, competitions, players, scenarios, events, sponsors, headlines, colors, and balance values.

Core rules should expose supported extension points rather than asking modders to edit source code. The game must validate mod data on load and report understandable errors.

Initial modding deliverables:

1. A documented sample league pack.
2. JSON schemas for all prototype data.
3. An import/export flow for local packs.
4. A developer toggle that exposes scenario inputs and random seed.

## 12. Prototype scope: first vertical slice

**Goal:** Prove that one season of a single footballer's life creates compelling, coherent stories.

Included:

- Brazil (using five IBGE macroregions), one fictional national league, and eight fictional clubs;
- a 10-year-old youth-player start and basic character creator;
- career and free-mode creation;
- a condensed youth phase from ages 10–14, then a small family/finance/training/relationship system;
- 10–15 match scenarios;
- match ratings, goals, assists, injuries, discipline, form, and season totals;
- basic club selection and one transfer/contract path;
- generated headlines and a permanent career timeline;
- local save/load and a sample mod pack.

Excluded until later:

- real-world country database and global birth simulation;
- full international football, continental competitions, and worldwide transfers;
- detailed 22-player tactical/movement simulation;
- deep marriage, family, crime, sponsorship, property, and investment systems;
- online multiplayer, cloud saves, or a backend.

## 13. Development roadmap

| Phase | Outcome | Exit criterion |
|---|---|---|
| 0. Design foundation | Rules, content format, and prototype data defined | A short season can be run on paper with no missing core decisions. |
| 1. Simulation kernel | Seeded time, characters, attributes, event queue, and saves | Tests can replay the same seeded career identically. |
| 2. Career loop | Creation, calendar, training, finance, and decisions | A player can progress through one off-pitch month. |
| 3. Match moments | Abstract match simulator and scenario choices | A complete match produces plausible stats and a match rating. |
| 4. Reactive presentation | News, records, timeline, offers, and consequences | A great or disastrous match changes future content visibly. |
| 5. Vertical-slice polish | One playable season, tuning, tutorial, and sample mod | A new player can finish a season and understand their story. |
| 6. World expansion | More leagues, countries, events, economics, and life systems | New data packs can expand content without code rewrites. |

## 14. Testing and balancing

The project needs automated simulation tests from the beginning. Run large batches of seeded careers and matches to inspect distributions: goals by position, injury rates, transfer rates, attribute growth, wealth, and rare historic performances.

Useful development tools:

- replay a match/career from its seed;
- inspect every factor behind a scenario outcome;
- simulate a season or thousand seasons without rendering;
- compare player results against expected ranges;
- enable free-mode extreme builds to expose broken probabilities.

## 15. Success criteria for the first prototype

The prototype is successful if a player can truthfully say:

1. “My attributes and decisions changed the kind of footballer I became.”
2. “Matches were tense because I made meaningful choices.”
3. “The game remembered an important thing I did.”
4. “A bad choice or bad luck created a story rather than feeling like arbitrary punishment.”
5. “I can imagine changing the league, clubs, or scenarios myself.”

## 16. Decisions made

- Start at age 10. The player is already talented enough to play for a local youth team.
- Ages 10–14 use condensed seasonal decisions and milestone events; this establishes personality and player style without requiring a full match calendar.
- From the first senior season, every match is interactive by default. Adult players may instead choose to simulate a match.
- Brazil supplies real-world geographic and statistical context through its IBGE macroregions. All teams, people, media, sponsors, and competitions are fictional.
- The interface is an in-world personal computer: messaging, documents, news, finance, social media, photos, and calendar are distinct applications.
- Life simulation advances by event-driven weeks. Match days and deadline events can interrupt the calendar.

## 17. Immediate next step

Implement the **simulation kernel**: seeded time, characters, attributes, the event queue, and saveable state. The companion prototype content specification supplies the concrete world to build against.
