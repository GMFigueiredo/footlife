# Second Step: World Bible and Content Data

## Goal

Turn the current playable loop into the beginning of a living football world. The second step should prioritize **authored data and simulation rules**, not additional cosmetic interface work. Those systems will make later screens, news, contracts, records, and stories meaningful.

## The data layers

### 1. Canonical football world

This is the fictional world the game owns. It is bundled with the game, has stable IDs, and can be replaced or extended by mods.

| Data set | First version |
|---|---|
| Nations | Brazil only, using real geographic/statistical context. |
| Regions | The five IBGE macroregions plus a small authored football profile for each. |
| Competitions | Liga Nacional Aurora and Copa da Aurora. |
| Clubs | The eight original clubs, with city, colors, finances, facilities, culture, tactics, and rivalries. |
| People | 18–22 generated but authored-template players per club, plus coaches, agents, family roles, journalists, and sponsors. |
| Records | League, cup, club, and player record categories with an empty/current holder and history. |

### 2. Country context data

Country data should describe conditions, not prescribe stories. Every number must have a source, year, methodology note, and update policy. The first Brazilian profile can carry fields such as:

- population and urbanization;
- income, inequality, education, and healthcare access;
- youth-football access and facilities;
- league wealth, league quality, scouting reach, and media intensity;
- health, safety, and climate event weights;
- social/legal context flags for later, responsibly written life events.

The game uses these as weighted inputs; a player is never reduced to a country score.

### 3. Story content

Write reusable event templates rather than isolated flavor text. A template has:

```text
conditions → choices → effects → follow-up flags → news/message hooks
```

The first content pack should target 40 events:

- 10 youth and academy events;
- 10 football/career events;
- 8 family and personal-life events;
- 6 money and sponsor events;
- 6 media, supporter, and social-media events.

## Football records system

Records are an essential early system because they let the game recognize history. Initial record categories:

- most goals in a league season;
- most assists in a league season;
- youngest senior scorer;
- most goals in one match;
- longest scoring streak;
- most league titles;
- most cup wins;
- club all-time goals and appearances;
- highest transfer fee;
- most international caps (reserved until international football exists).

Each record needs a current holder, value, date, competition/club context, and a list of previous holders. Breaking a record should emit tags that drive headline, fan, sponsor, and reputation reactions.

## Club data to define

Each of the eight clubs receives:

- identity: name, city, region, colors, nickname, founding year, supporter culture;
- football: reputation, budget, facilities, academy rating, tactical identity, pressure level;
- economy: wage budget, transfer budget, sponsor tier, average ticket demand;
- relationships: derbies, friendly rivals, regional rivals, board ambition;
- squad: a small position-balanced roster with attributes, potential, personality, contract, and status;
- history: 3–5 invented landmark achievements and a handful of existing club records.

## What we build immediately after the documents

1. Create JSON schemas and the first data files in `data/`.
2. Replace the hard-coded eight-club list in the prototype with those files.
3. Build a real fixture generator and standings calculator for the 14-match league season.
4. Add a record book screen and have matches update it.
5. Add a calendar advance action that produces training, personal, and news events between fixtures.

## What deliberately waits

- All countries and a global birth generator.
- Full transfers, agents, and sponsor economy.
- Continental/international competitions.
- Detailed family, romance, property, and social-media systems.
- Animated match movement and an expanded scenario library.

Those will become much easier once one league, one calendar, and one record system behave credibly.

## Definition of success

At the end of this step, a player should be able to play a full 14-match season in a populated fictional league, inspect every club and the standings, see their player statistics and records update, and encounter enough off-pitch content that two seasons do not tell the same story.
