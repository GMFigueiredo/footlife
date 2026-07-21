# Prototype Content Specification

**Status:** Approved starting point for the first playable vertical slice  
**Setting:** Brazil as real geographic/statistical context; all football-world entities are fictional.

## 1. Scope

The prototype covers a player's life from age 10 through their first senior season. It is not a complete Brazilian football pyramid or a global simulation. Its purpose is to prove the childhood-to-career story, match-moment gameplay, and reactive personal-computer interface.

Brazil is divided into its five IBGE macroregions. Regional context influences opportunity and event weighting; it never determines a player's potential.

| Birth region | Starting fiction | Football context |
|---|---|---|
| North | Long travel distances and smaller scouting network | Fewer elite facilities; strong community football. |
| Northeast | Dense local rivalries and passionate support | Many pathways, uneven resources, high visibility in regional tournaments. |
| Central-West | Growing cities and fewer traditional giants | More open route to first-team attention; travel-heavy calendar. |
| Southeast | Largest media and academy ecosystem | More elite opportunities and more competition for places. |
| South | Strong club infrastructure and cross-border influences | Stable youth pathways and tactically organized football. |

At creation, the player can select a region or choose **Random birth region**. A local youth club is generated from that selection.

## 2. Career timeline

### Ages 10–14: condensed youth phase

Each year contains a short set of defining choices and a season summary rather than fully interactive matches. These choices establish attributes, relationships, reputation, and recruitment pathways.

Example annual decisions:

- attend extra technical training or protect school performance;
- play up an age group or remain with friends;
- accept a long-distance trial or preserve family finances;
- confront bullying, report it, or walk away;
- use a small windfall for boots, household needs, or a risky opportunity;
- choose futsal, street football, athletics, or rest during the off-season.

At age 15, the player joins an academy, a semi-formal youth side, or an under-resourced local route based on their story. The prototype then jumps to the first senior season.

### Senior football

Every scheduled match is interactive by default and uses the match-moment system. Before kick-off, adult players can choose **simulate match**. Simulation still produces plausible results and consequences, but cannot benefit from the player's tactical decisions and provides less detail.

## 3. Fictional league and clubs

The prototype competition is the **Liga Nacional Aurora**, an eight-club double round-robin (14 league matches), followed by the **Copa da Aurora** knockout cup. It is deliberately compact so one season is finishable and testable.

All names, crests, kits, squads, stadiums, sponsors, and media outlets are original. The clubs take broad inspiration from the scale, culture, and regional distribution of Brazil's leading football institutions; they are not substitutes for real clubs.

| Club | Region / city fiction | Identity | Football profile |
|---|---|---|---|
| Estrela do Porto | North / Belém-inspired | Blue-and-amber river-port club | Fast transitions; talented but limited squad depth. |
| Atlético do Sol | Northeast / Recife-inspired | Red-and-white workers' club | Aggressive pressing; intense home atmosphere. |
| Maré Alta FC | Northeast / Salvador-inspired | Teal-and-black coastal giant | Technical wingers; emotional, high-variance football. |
| União Cerrado | Central-West / Brasília-inspired | Green-and-silver capital club | Athletic, organized, financially ambitious. |
| Ferro Paulista | Southeast / São Paulo-inspired | Charcoal-and-copper industrial club | Deep resources; tactical discipline and strong academy. |
| Aurora Carioca | Southeast / Rio-inspired | White-and-violet metropolitan club | Star power, flair, media attention, volatile dressing room. |
| Serra Dourada | Southeast / Belo Horizonte-inspired | Gold-and-navy mountain club | Balanced squad; patient possession football. |
| Pioneiros do Sul | South / Porto Alegre-inspired | Crimson-and-cream traditional club | Physical, resilient, and defensively demanding. |

## 4. Player model

### Core football attributes

Use a 1–20 scale in the prototype. Attribute growth is gradual and affected by age, training quality, playing time, personality, health, and choices.

| Group | Attributes |
|---|---|
| Technique | First touch, passing, dribbling, finishing, crossing, tackling, heading, set pieces |
| Physical | Pace, agility, strength, stamina, balance, jumping, injury resistance |
| Mental | Vision, anticipation, positioning, composure, decisions, work rate, bravery, teamwork |

### Personal dimensions

- **Wellbeing:** health, energy, stress, confidence, career momentum.
- **Relationships:** family, coach, teammates, agent, partner, supporters, media.
- **Reputation:** professionalism, charisma, flair, loyalty, controversy, leadership, sportsmanship.
- **Resources:** money, home security, education progress, network, sponsor interest, followers.

### Starting archetypes

Career mode uses a limited point budget and requires trade-offs. Free mode permits any valid 1–20 build and is intended for experimentation and balance testing.

- Clinical striker
- Creative playmaker
- Explosive winger
- Relentless box-to-box midfielder
- Commanding defender
- Sweeper goalkeeper

The archetype is a starting bias, not a locked position or destiny.

## 5. Match-moment library

Each moment includes an entry condition, available actions, resolution factors, outcomes, and narrative tags. The first release implements these twelve scenarios:

| Scenario | Example actions | Key factors |
|---|---|---|
| Through ball / one-on-one | finish early, round keeper, chip, square pass | pace, composure, finishing, keeper quality, angle |
| Cutback in the box | first-time shot, control then shoot, layoff | first touch, finishing, pressure, defender distance |
| Dribble duel | burst past, feint, protect ball, recycle | dribbling, agility, pace, defender tackling, support |
| Final-third pass | threaded pass, switch play, safe pass, shoot | vision, passing, decisions, teammate run, defensive line |
| Cross / aerial duel | attack near post, far post, hold position | heading, jumping, positioning, marker strength |
| Long-range chance | power shot, placed shot, seek pass | technique, composure, distance, sight line |
| Loose ball | shoot, shield, recover, draw foul | anticipation, bravery, balance, pressure |
| Pressing trigger | press, cut lane, hold shape, tactical foul | work rate, positioning, stamina, discipline |
| Defensive duel | tackle, jockey, intercept, clear | tackling, positioning, strength, attacker quality |
| Penalty | placed, power, panenka | composure, finishing, confidence, keeper research |
| Free kick / corner | shoot, cross, short routine | set pieces, technique, team routine, weather |
| Flashpoint | walk away, confront, appeal, retaliate | temperament, bravery, discipline, referee strictness |

The system selects moments according to the player's position, tactics, qualities, current match state, and opponent. A winger should receive more wide duels; a centre-back more defensive and aerial moments; an elite striker more high-value finishing involvement.

## 6. Event pool

Events are written as reusable templates with conditions and structured outcome tags. The prototype needs approximately 30, divided across:

- **Family and personal:** school pressure, family illness, celebration, friendship, relationship beginnings, housing stress.
- **Career:** trial invitation, academy promotion, coach conflict, position change, agent approach, contract offer, loan opportunity.
- **Money:** boots purchase, family request, first wage, sponsor offer, scam warning, emergency expense.
- **Public life:** local interview, social-media post, rumor, supporter praise, criticism after a poor match.
- **Health and discipline:** fatigue warning, minor injury, recovery choice, teammate dispute, media-training response.

Every template must specify its possible player choices, attribute/reputation changes, relationship changes, finance changes, future flags, and news hooks. Do not write one-off text that cannot have consequences.

## 7. Personal-computer interface

The game is presented as the footballer's private computer, not as a generic dashboard. The desktop is the home screen; each icon opens an in-world application.

| Application | Purpose |
|---|---|
| Calendar | Advance event-driven weeks; see training, matches, deadlines, birthdays, and recovery. |
| Messages | Chat-style conversations with family, teammates, coach, agent, partner, media, and sponsors. |
| Documents | Contracts, trial invites, medical reports, disciplinary notices, and official correspondence. |
| News | Fictional sports media, headlines, match reports, records, and longer features. |
| Photos | Defining moments, profile portrait, trophies, celebrations, and a visual career album. |
| Finance | Wages, expenses, savings, sponsor income, property, vehicles, and financial decisions. |
| Social | Followers, posts, replies, gossip, fan sentiment, and reputation consequences. |
| Career | Attributes, season statistics, club status, relationships, objectives, and record book. |

Visual direction: a warm, slightly imperfect personal computer rather than sterile corporate software. Use familiar app conventions, strong typography, a restrained sports palette, and the player's portrait/photos as emotional anchors. The match screen is the one exception: it uses a simple top-down pitch with circles, names, ball movement, and a focused choice panel.

## 8. Prototype season arc

1. Select or randomize a Brazilian macroregion; create a 10-year-old player.
2. Make four condensed youth-year decisions and receive yearly summaries.
3. Reach a first senior-club opportunity, with two or three credible routes.
4. Complete the Liga Nacional Aurora and Copa da Aurora season.
5. Make at least one contract, sponsor, personal, and social-media decision.
6. Finish with an end-of-season review: statistics, reputation, relationships, news archive, records, and next-season offers.

## 9. Implementation order

1. Create content schemas for regions, clubs, attributes, players, events, and scenarios.
2. Build the deterministic clock, player state, and save/load boundary.
3. Implement creation and the four condensed youth years.
4. Implement league schedule and match-moment resolver.
5. Add the personal-computer shell and Calendar, Messages, Career, and News applications.
6. Add Finance, Documents, Social, and Photos.
7. Run balance simulations and complete the sample season.
