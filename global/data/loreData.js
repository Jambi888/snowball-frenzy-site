/**
 * LORE DATA - Comprehensive lore system for Snowball Frenzy
 * 
 * This file contains all lore entries organized by books and chapters.
 * Each lore entry has an id, title, abstract, content, unlock condition, and icon.
 * 
 * LORE STRUCTURE:
 * - Books: Major story divisions (ORIGIN, RESONANCE, FRACTURE, CONTINUUM)
 * - Chapters: Story sections within each book
 * - Lore Entries: Individual story pieces within chapters
 * 
 * UNLOCK TYPES:
 * - "achievement": Triggered by specific achievement IDs
 * - "assistant": Triggered by purchasing specific assistants
 * - "upgrade": Triggered by purchasing specific upgrades
 * - "assistant_quantity": Triggered by owning specific quantity of assistants
 * 
 * TRIGGER EXAMPLES:
 * - achievement: "clicks_100" (from achievementData.js)
 * - assistant: "additionalArm" (from assistantData.js)
 * - upgrade: "spinCalibration" (from unifiedUpgradeData.js)
 * - assistant_quantity: "additionalArm:10" (assistant ID : quantity)
 */

export const LORE = {
  "books": [
    {
      "id": "book_origin",
      "title": "ORIGIN",
      "description": "The storm was not nature’s rage. It was nature’s answer.",
      "chapters": [
        {
          "id": "chapter_origin_awakening",
          "title": "Awakening",
          "description": "It began with a snowball … and something watching.",
          "lore": [
            {
              "id": "lore_ORIGIN_Awakening_1",
              "title": "The Clearing",
              "abstract": "The day was bright. The snow was deep. And something ancient stirred.",
              "content": "The snowfall had ended just hours before, blanketing the hills in a thick layer of untouched white. In the distance, the jagged peak of Helvetia Tinde pierced the blue sky, its icy crown gleaming in the sun. Laughter echoed across the valley near the town of Klemqar, a secluded settlement nestled deep in the Roosevelt Range of Northern Greenland. Children ran, sleds slid, snowballs flew. It was a rare moment of peace, a fleeting calm between the brutal storms that defined life so far north.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "additionalArm:0"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_2",
              "title": "Alin and Bria",
              "abstract": "Two friends. One snowstorm. A moment that would change everything.",
              "content": "Among the children, two stood apart‚Alin and Bria, friends bound by shared curiosity and unrelenting mischief. They were known throughout Klemqar not just for their clever ideas, but for the trail of mild chaos they left behind. Alin, the tinkerer. Bria, the spark. Together, they had turned winters into worlds of invention. And today, they would step into a story far older than their laughter.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_1"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_3",
              "title": "First Snow",
              "abstract": "A shadow in the snow. A moment before everything changed.",
              "content": "Bria paused mid-throw. Something stirred beyond the snowbanks. Not quite human. Not quite animal. A creature‚short, shaggy, and barely upright‚watched them silently from the tree line. Alin did what any child would do: he threw a snowball. The creature flinched. Another snowball followed. And then‚ it spoke.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_10"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_4",
              "title": "The Stranger",
              "abstract": "It did not run. It stood. It remembered.",
              "content": "The creature‚small, white-furred, silent‚did not flee. It raised its arms but did not fight. It blinked slowly, with eyes that reflected too much. The children paused. The snow settled. And for a moment, the wind carried something heavy. It looked like fear. But it felt like recognition.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowball_drops"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_5",
              "title": "A Name in the Snow",
              "abstract": "The snow whispered a name no one had spoken.",
              "content": "It clung to the air like breath on glass‚ a name not learned, but remembered. Each snowflake seemed to murmur it, though none could say why. The storm had begun calling.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_100"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_6",
              "title": "Duh-bee-tah",
              "abstract": "It spoke a single word. And the snow held its breath.",
              "content": "No one understood the word. It echoed like ice cracking beneath still water: 'Duh-bee-tah.' The sound lodged itself between snowflakes, in memory. Alin guessed it was a name. Bria thought it was a warning. Neither knew what it meant. But they would come to understand it well.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "click_streak_tier_1"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_7",
              "title": "The Additional Arm",
              "abstract": "A contraption built from ski poles and defiance.",
              "content": "It wasn't elegant. It wasn't even safe. But when the snowballs started flying, the contraption strapped to the shoulder added just enough reach to make Alin grin like a frost-mad engineer. An arm of wood, rope, and ambition.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "additionalArm"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_8",
              "title": "The Neighbor Kids",
              "abstract": "Curiosity spreads faster than snow. And louder.",
              "content": "They arrived in a clamor of boots and shouts, snow spraying from every stumble. The neighbors didn't ask questions. They saw a snowball war and chose sides‚the loudest side possible.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "neighborKids"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_9",
              "title": "Shapes in the Frost",
              "abstract": "Sometimes, the snow settled... wrong.",
              "content": "Children laughed and threw snowballs, but at the edges of vision, shapes moved. Curves that didn't belong. Shadows too slow. The storm was already listening.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "slingshots"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_10",
              "title": "The Polar Bear Family",
              "abstract": "Murn, Arra, and their cubs knew snow better than anyone.",
              "content": "They came from the white horizon like rolling frost boulders, curious but calm. Soon, paws pressed snow into spheres with uncanny precision. Their throws? Devastating. Their loyalty? Absolute.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "ballMachine"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_11",
              "title": "The Ball Machine",
              "abstract": "Repurposed for battle. Born for baseball.",
              "content": "Once a backyard relic, now a snowball juggernaut. Spinning wheels spat frost missiles with machine rhythm, while kids ducked behind igloos to reload. The arms race had begun.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "polarBearFamily"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_12",
              "title": "The Snowblower",
              "abstract": "If the snow won't fly fast enough, build something that makes it.",
              "content": "Neighbors heard the roar before they saw the storm‚a snowblower retrofitted with shields and a funnel rigged for rapid-fire snowball chaos. Efficiency has a sound, and it's deafening.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "snowBlower"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_13",
              "title": "The Hockey Team",
              "abstract": "They didn't bring sticks. They brought momentum.",
              "content": "They skated across ice like blades of wind, hurling snowballs mid-spin with the accuracy of winter-born assassins. Where they skated, victory followed in cold arcs.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "hockeyTeam"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_14",
              "title": "The Igloo Arsenal",
              "abstract": "Defense becomes strategy. Snow becomes structure.",
              "content": "When snow piled high, it became more than fortification‚it became a fortress. Inside, caches of snowballs glimmered like armories of frost. The war for fun was now a siege.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "iglooArsenal"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_15",
              "title": "The Golfing Range",
              "abstract": "Three levels. Endless distance. Snowballs, not drivers.",
              "content": "Built from salvaged planks and dreams of domination, the range stretched upward like a frozen tower. From its decks, snowballs arced like meteors‚a spectacle and a threat.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "golfingRange"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Awakening_16",
              "title": "The Drift Before",
              "abstract": "Why did the storm feel familiar?",
              "content": "Snow fell for hours before someone asked, 'Have we done this before?' The feeling didn't pass. As if the day‚ and the storm‚ had already happened once. Or many times.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "assistants_10"
              },
              "icon": "global/data/images/bookFrontCover.png"
            }
          ]
        },
        {
          "id": "chapter_origin_unraveling",
          "title": "Unraveling",
          "description": "The storm turned. So did the rules.",
          "lore": [
            {
              "id": "lore_ORIGIN_Unraveling_1",
              "title": "Feeding the Storm",
              "abstract": "The more snowballs they threw, the stronger the Yeti seemed to become.",
              "content": "Snowballs slammed, laughter rang, and yet‚ with every hit, the yeti's glow grew brighter. It wasn't a fight. It was a storm being fed‚a truth no one understood until it was too late.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowball_mist"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_2",
              "title": "The Sudden Storm",
              "abstract": "It came from a clear sky, unnatural and swirling with intent.",
              "content": "The sky broke without warning. White walls curled upward like a tidal wave of air, snow twisting in spirals that disobeyed wind. This was no weather. It was will.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "snowstorm"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_3",
              "title": "The Crack",
              "abstract": "The sky didn't break. It peeled.",
              "content": "It began as a shimmer‚ like breath fog on a pane. But then the shimmer grew, pulsed, and split. Behind it: not storm, but something vast and wrong. And something watching.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowballs_10k"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_4",
              "title": "Snow Dancer",
              "abstract": "She moved like the wind‚elegant, deadly, precise.",
              "content": "She stepped from frost like a figure sculpted in silence, her gestures spinning flurries into blades. Every motion a melody of cold intent‚every glance, a promise that playtime was over.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "snowPrincess"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_5",
              "title": "The Flake That Would Not Melt",
              "abstract": "It glowed faintly, even in darkness.",
              "content": "It fell like the others but stayed where it landed‚ unchanged, unmelted. Its pattern repeated itself, spiraled inward. Somewhere in the design, a truth too large to see all at once.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "upgrades_10"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_6",
              "title": "The Winter Fortress",
              "abstract": "Built to withstand storms‚ but was this a battle or a ritual?",
              "content": "Walls of snow stacked into bastions of white, towering like monuments of frost loyalty. Children cheered within as the storm darkened beyond, unaware that this was no game anymore.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "winterFortress"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_7",
              "title": "Wizard of the Gale",
              "abstract": "He danced through the sky beside her, a blizzard in motion.",
              "content": "He arrived like laughter lost in the wind‚wild, spiraling, unbound. His staff carved arcs of snowlight through the gale, his spells igniting storms that turned play into pandemonium.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "wizardBlizzard"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_8",
              "title": "The Avalanche",
              "abstract": "A roaring wave of endless white, descending from the peaks.",
              "content": "From the mountains came a roar‚rolling ice and stone, the wrath of frozen gravity. It swept valleys like erasure, a reminder that snow is not gentle when summoned in anger.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "avalanche"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_9",
              "title": "The Spiral Gale",
              "abstract": "It didn't move‚it hovered. A vortex of snow and silence.",
              "content": "At the heart of the battle spun a cyclone‚a column of frost, motionless yet seething. The air within pulsed like a heartbeat, drawing snow inward as if the storm hungered.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "snowHurricane"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Unraveling_10",
              "title": "Two Voices",
              "abstract": "The storm echoed. Then it harmonized.",
              "content": "As snow spun and howled, another voice rose. Not louder, just ... deeper. The storm seemed to split its song. For a moment, it sang in two directions‚ one toward arrival, one toward return.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowballs_10k"
              },
              "icon": "global/data/images/bookFrontCover.png"
            }
          ]
        },
        {
          "id": "chapter_origin_arising",
          "title": "Arising",
          "description": "They did not return, they were remembered.",
          "lore": [
            {
              "id": "lore_ORIGIN_Arising_1",
              "title": "Whispers of the Wing",
              "abstract": "Some say the Ice Dragon cannot be summoned. It must be remembered.",
              "content": "The wind began to sing‚a low hymn threading through blizzards, old as frozen roots. The Ice Dragon rose from frost veils, scales glinting like shards of sky, summoned not by call, but by recollection.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "iceDragon"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_2",
              "title": "The Eye Above",
              "abstract": "High above, the clouds watched back.",
              "content": "For one breath, the clouds parted, revealing not stars‚ but a ring. White light. Concentric frost. Not a moon. Not weather. Just watching, unmoving, until it blinked.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowballs_1m"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_3",
              "title": "Dragon in Descent",
              "abstract": "Its wings do not flap. The sky folds to make way.",
              "content": "It did not dive‚it descended like inevitability, folding clouds around its silent grace. Every breath froze valleys. Every gaze, a law of winter rewritten.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "moltenCore"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_4",
              "title": "Call of the Deep",
              "abstract": "The Frost Giant hears no name‚but responds to need.",
              "content": "A tremor ran through the tundra, splitting snow like glass. The Frost Giant emerged‚not summoned by power, but by necessity. Each step was a vow, echoing through icebound centuries.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "frostGiant"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_5",
              "title": "Footsteps of the First",
              "abstract": "Each step is an echo. Each throw, a legacy.",
              "content": "When the Frost Giant strode into battle, the world quivered. His snowball was not a weapon‚it was a memory, hurled across generations like a frozen truth too heavy to melt.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "frozenFootsteps"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_6",
              "title": "The Hollow Path",
              "abstract": "The snow beneath was thinner than it seemed.",
              "content": "Beneath the snowballs, below the frostline, was something empty. The earth pulsed like it was holding its breath. And then, from deep below, a single snowflake floated upward‚ perfect and upside-down.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "click_streak_tier_2"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_7",
              "title": "Summoning",
              "abstract": "The intent was now clear",
              "content": "The intent was now clear. This was no invasion. This was no game. This was a summoning.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "click_streak_tier_3"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_8",
              "title": "Manifestation",
              "abstract": "The ancients had returned—not as memory, but as manifestation.",
              "content": "Somewhere in the distance, old machines began to freeze. Signals failed. The earth held its breath. The ancients had returned, not as memory, but as manifestation. And the world was listening.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "glacierGauntlets"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_9",
              "title": "The First Throw",
              "abstract": "Before the frost, before the fire, one throw began it all.",
              "content": "The elders do not speak of it. The archives do not keep it. But the Drifts remember. There was once a throw so perfect, so final, that it split the storm forever.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "bearClaws"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Arising_10",
              "title": "The Word That Wasn’t a Word",
              "abstract": "It sounded like a name—hidden in wind.",
              "content": "The storm hissed low, almost kind. Among the gusts, something threaded through—not in speech, but in shimmer: a syllable soft as thawed light.\nNot spoken by the yeti. Not by the wind. But carried between.\n“Lume…”",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "assistants_50"
              },
              "icon": "global/data/images/bookFrontCover.png"
            }
          ]
        },
        {
          "id": "chapter_origin_citadel",
          "title": "Citadel",
          "description": "What stands before collapse is never just a wall, it’s a memory refusing to yield.",
          "lore": [
            {
              "id": "lore_ORIGIN_Citadel_1",
              "title": "Skyfire Below",
              "abstract": "A weapon once thought myth‚now pointed at the storm.",
              "content": "From hidden orbital platforms long considered myth, they deployed the Orbital Snow Cannon‚a classified satellite weapon capable of focusing cryogenic matter from space. Designed in theory as an experimental climate corrector, it was now aimed squarely at the epicenter of the storm.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "orbitalSnowCannon"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_2",
              "title": "The Storm Beneath",
              "abstract": "Snow fell up, for just a second.",
              "content": "They saw it happen. A single swirl reversed direction, dragging frost toward the sky. For a moment, the world inverted‚ and something below let go.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "iceTurrets"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_3",
              "title": "The Frozen Path",
              "abstract": "Old stone beneath ice. New pilgrims in silence.",
              "content": "Ancient spiritual orders resurfaced. Pilgrims made their way to a newly revealed structure buried beneath centuries of ice: the Temple of Winter. It had no known builder. Its inner sanctum radiated perfect cold. Its acolytes spoke of balance, of sacrifice, of a power that once governed Earth's natural reset cycles.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "templeofWinter"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_4",
              "title": "The Core Below Zero",
              "abstract": "Born of desperation. Fueled by regret.",
              "content": "In a last, terrible gamble, the global coalition turned to the one forbidden solution: the CryoCore. Once used in a now-buried war beneath the Southern Ice, it operated by collapsing snow into a neutron-density mass, triggering an unstable fusion-fission loop that could flash-freeze entire regions.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "cryoCore"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_5",
              "title": "The Cost of Cold",
              "abstract": "It worked. But it broke something deeper.",
              "content": "Scientists protested. Theorists warned of catastrophic cascade effects‚collapse of molecular cohesion, creation of frost voids, disruption of planetary spin. But there was no other plan.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "assistants_100"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_6",
              "title": "Snowball Physics",
              "abstract": "Some theories were never meant to be tested.",
              "content": "Preeminent scientists warned of what might come. That the CryoCore's unstable reaction could collapse natural nuclear bonds within snow‚forming what theorists called a Snow Singularity: a single snowflake in spacetime with infinite weight. A frozen white hole.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "coolantOverclock"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_7",
              "title": "The Ones Who Did Not Echo",
              "abstract": "Some never returned from the drifts.",
              "content": "Elders told the tale only once: of those who walked but did not echo. Their forms shifted, their memories bent. And somewhere beyond the frostline, they remain‚ waiting for a signal that hasn't yet come.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "pressureBoost"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_8",
              "title": "The Third Flake",
              "abstract": "Not every flake is born in snow.",
              "content": "Most snowflakes form in clouds. Others, in dreams. But the third kind‚ they come from somewhere else. Their symmetry is broken. Their purpose unknown. And they arrive only when needed most.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "coldFront"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Citadel_9",
              "title": "Unchanging",
              "abstract": "While the world turned frantic, the Yeti remained still.",
              "content": "The creature had ceased to move. Its form now glowed not with heat, but with memory‚a lattice of every snowball thrown, every gust of winter wind, every cry of every child who had ever danced in snowfall. It was no longer a being, but a beacon.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "assistants_100"
              },
              "icon": "global/data/images/bookFrontCover.png"
            }
          ]
        },
        {
          "id": "chapter_origin_eclipse",
          "title": "Eclipse",
          "description": "The snow did not fall, it was pulled … toward something endless.",
          "lore": [
            {
              "id": "lore_ORIGIN_Eclipse_1",
              "title": "CryoCore Mechanics",
              "abstract": "Fusion, fission, collapse‚snow as reactor, not insulator.",
              "content": "CryoCore technology fused neutron-density snow into a hyperstable state. It initiated a quantum frost-bond collapse, forcing particles into a self-perpetuating feedback loop. Once critical mass was reached, the system fractured local spacetime‚a process theorized, but never observed, until now.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "quantumFrost"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_2",
              "title": "Echoes in Waiting",
              "abstract": "Some assistants wait before they are built.",
              "content": "The snowball arsenal stirred at night. Shapes arranged themselves, though no one touched them. In the morning, the snowballs had sorted themselves by weight, angle ... and intent. The world was beginning to think.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "icicleCannons"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_2",
              "title": "Thermocausal Inversion",
              "abstract": "A snowflake with infinite mass. A future with no direction.",
              "content": "A Snow Singularity is not a hole‚it is a point of frozen time where entropy folds inward. Based on the Thermocausal Inversion Theory, the CryoCore caused the collapse of frost-state coherence. The result: a snowflake-shaped gravitational knot, where direction, duration, and decay cease to function.",
              "unlocked_by": {
                "type": "assistant",
                "trigger": "snowSingularity"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_3",
              "title": "The Still Point",
              "abstract": "No breath. No fall. Just stillness folded into stillness.",
              "content": "It did not explode. It unfolded. Not outward‚ but inward, into silence. Into the space between snowflakes. The Singularity was not a thing. It was the absence of all things‚ except memory.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowSingularity:2"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_",
              "title": "Song Beneath Frost",
              "abstract": "They heard it in the ice. A tone older than language.",
              "content": "The snow cracked in silence, and someone placed an ear to the drift. Beneath it‚ a song. Not music. Not voice. Just a hum of perfect stillness, repeating. Waiting. Listening.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "magicMittens"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_4",
              "title": "Frost and Infinity",
              "abstract": "Snow is not the end of movement‚it is the preservation of intent.",
              "content": "Philosophers of the Drifts believe the Snow Singularity was not a failure, but a correction. It held all Echoes within itself. Not to destroy them‚but to remember them together, without sequence.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "snowSingularity:3"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_5",
              "title": "The Frozen Eye",
              "abstract": "The opposite of collapse. The memory of gravity reversed.",
              "content": "From the heart of the Singularity emerged not a black hole, but a white one‚ a point of ejection, not absorption. Instead of devouring, it unleashed. Time spiraled outward. Matter flowed in reverse. A frozen nova with no flame, only memory.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "snowSingularity:4"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_6",
              "title": "The Glacier Veil",
              "abstract": "In the deepest cave, ice reflected things not yet done.",
              "content": "The glacier wasn't a mirror. It was a veil. And behind it flickered moments that hadn't happened‚ glimpses of snowballs never thrown, joy never laughed, songs never sung. Drifts were no longer just echoing the past‚ they were previewing the future.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "enchantedGloves"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_6",
              "title": "Ashwake",
              "abstract": "The planet answered frost with fire. A scream from beneath.",
              "content": "At the apex of despair, the earth revolted. Volcanoes erupted in perfect synchrony‚ across hemispheres, across timezones. Ash filled the sky. It was not fury. It was balance. Fire had waited its turn.",
              "unlocked_by": {
                "type": "upgrade",
                "trigger": "snowSingularity:5"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_7",
              "title": "The Great Extinguishing",
              "abstract": "The yeti moved not to conquer‚but to preserve.",
              "content": "Without hesitation, the yeti raised its arms. From its body, snow spiraled at speeds beyond reckoning‚dousing each eruption, smothering flame with frost. It did not save the world. It allowed it to continue.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "jumps_1"
              },
              "icon": "global/data/images/bookFrontCover.png"
            },
            {
              "id": "lore_ORIGIN_Eclipse_8",
              "title": "The Moment Beyond",
              "abstract": "No up. No down. No past. No name.",
              "content": "There was no ground. No sky. No self. The world became calm and fast, loud and silent, bright and void. The children saw every atom of themselves entangled in frozen memory‚scattered, eternal, and waiting to be chosen again.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "baby_yeti_1"
              },
              "icon": "global/data/images/bookFrontCover.png"
            }
          ]
        }
      ]
    },
    {
      "id": "book_resonance",
      "title": "RESONANCE",
      "description": "The Drifts do not echo, they sing.",
      "chapters": [
        {
          "id": "chapter_resonance_drift",
          "title": "Drift",
          "description": "The world did not end. It shifted … you followed.",
          "lore": [
            {
              "id": "lore_RESONANCE_Drift_1",
              "title": "The First Jump",
              "abstract": "The world changed. But nothing moved.",
              "content": "You are not where you were. You are not who you were. This is a Drift‚a branching of what came before. You jumped here when the old world collapsed.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflakes_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_2",
              "title": "The Name Carved in Frost",
              "abstract": "“And when the storm calls you, it will call you Lume.”",
              "content": "The frost beneath their feet pulsed when the yeti spoke. “The storm knows you now. It hums with your steps.”\nHe tilted his head, snow scattering like sparks.\n“And when it calls you… it will call you Lume.”",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "crystal_snowballs_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_3",
              "title": "The Name Beneath the Frost",
              "abstract": "And you may call me Lyric.",
              "content": "The wind stilled when the creature spoke, not in words, but in sound that felt like memory humming through frost.\n“The storm knows you now,” it said, eyes deep as aurora. “You will walk far. But when you speak to me… call me Lyric.”\nThe syllables lingered like a melody never meant for silence.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "crystal_snowballs_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_4",
              "title": "What Is a Jump?",
              "abstract": "A step sideways‚not forward.",
              "content": "A Jump is not a path. It is a pivot‚a choice pressed into the fabric of frost when time collapses under its own weight. You did not walk farther. You walked elsewhere. And the storm carried what mattered most.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflake_tree_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_5",
              "title": "Nature's Answer",
              "abstract": "The volcano storm was not chaos. It was consequence.",
              "content": "The world did not burn out of anger. It burned because balance had been bent too far. But before fire could finish what frost began, Lyric moved‚folding the storm, braiding the planet's fracture into a single white thread: survival.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflake_tree_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_6",
              "title": "Lyric's Answer",
              "abstract": "He did not fight the storm. He rewrote it.",
              "content": "Lyric knew what no elder dared speak: fire would come for frost, and frost alone could hold it. So he carved a path through collapsing meaning‚a Jump that stitched possibility into permanence. The world did not end. It began again.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflakes_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_7",
              "title": "What Is a Drift?",
              "abstract": "A world of frost‚woven from memory.",
              "content": "A Drift is not another earth. It is the echo of what the world might have been, cast in frostlight when storms broke their bounds. Each flake carries fragments of its origin‚threads you now walk upon.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "jumps_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_8",
              "title": "The Anticipant",
              "abstract": "He did not predict. He prepared.",
              "content": "When others saw fire as distant, Lyric listened to the earth's deep hum‚a rhythm thickening beneath magma roots. He wove that tremor into frost equations, shaping a Jump before the first ember fell. Not reaction. Response.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "icicles_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_9",
              "title": "The Last Storm Before Silence",
              "abstract": "The storm did not rage. It surrendered.",
              "content": "Volcanoes had cracked the crust like glass. Oceans had boiled into sky. And the snow fell‚not in rebellion, but in requiem. The Jump came like a held breath breaking‚and when it broke, the earth exhaled white.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "upgrades_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_10",
              "title": "Why You Were Chosen",
              "abstract": "Frost does not pick at random.",
              "content": "Not every soul jumped. Not every voice was carried. The storm sought those who remembered‚not just warmth, but wonder. You were chosen because you knew snow was not weather. It was story.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "click_streak_tier_4"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_11",
              "title": "Who Truly Won?",
              "abstract": "Fire sleeps. Frost waits.",
              "content": "The Jump ended the firestorm, but not the question: was frost victory‚or compromise? Some whispers say the ember still burns, deep beneath the frozen root of the Drifts.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "time_100hr"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_12",
              "title": "The First Pulse of Elsewhere",
              "abstract": "The hum of frost was never single.",
              "content": "In the quiet between snowfalls, something pulsed‚a tone like the first note of a song. Not storm. Not silence. It sounded like the beginning of another question.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "upgrades_50"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_13",
              "title": "The Echo Still Lives",
              "abstract": "What you left behind did not leave you.",
              "content": "Before the Drift, there was the moment. And that moment, frozen by intention or fate, still pulses in frost.\n\nThe Echo is not memory. It is suspension. A breath never exhaled. A snowflake never fallen. Lume's world in the instant before the Crossing, suspended not in time‚ but in yearning.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflakes_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Drift_14",
              "title": "Echoes and Stasis",
              "abstract": "Echoes are the origin of every Drift.",
              "content": "Each Drift begins with an Echo‚ the frozen snapshot of a reality as it stood at the instant of divergence. These Echos are not simulations. They are crystallized truths, encased in temporal frost.\n\nFrom this stasis, the Drift awakens: Kindred rise, Flakeborn spark, and the laws of the Jump find purchase.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "umps_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            }
          ]
        },
        {
          "id": "chapter_resonance_concord",
          "title": "Concord",
          "description": "They did not test you to judge, they tested you to remember.",
          "lore": [
            {
              "id": "lore_RESONANCE_Concord_1",
              "title": "The Threadband",
              "abstract": "Worn not for power‚but for memory held in motion.",
              "content": "The Threadband was not a weapon. It was a vessel‚a binding of knowledge woven through Jumps. It could carry four Symbols at a time, but only those the bearer truly understood.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "ability_belt_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_2",
              "title": "The Four Symbols",
              "abstract": "Four truths. Four echoes. One path.",
              "content": "Return, Loyalty, Passage, Insight. The four symbols were not gifts‚they were confirmations. Signs that Lume had stepped beyond instruction and into remembrance.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowball_flurry"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_3",
              "title": "Class of the Harvester",
              "abstract": "Harvest not from snow‚but from time.",
              "content": "Harvesters specialize in reclaiming forgotten snowballs from past Drifts. They do not generate‚they recover. Every snowball they summon once belonged to another moment. Their work is quiet, deliberate, and laced with memory.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_4",
              "title": "Class of the Defender",
              "abstract": "To protect is to preserve the storm's purpose.",
              "content": "Defenders recall Kindred from broken timelines. They are not warriors‚they are guardians of rhythm. Where there is disorder, they impose integrity. Their snowballs are shields, not strikes.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_5",
              "title": "Class of the Traveler",
              "abstract": "They are never where you expect‚only where they're needed.",
              "content": "Travelers move not through space, but through possibility. Their gift is movement‚across Drifts, across outcomes. To walk like a Traveler is to know that the snowball you throw may never land where you aimed‚but always where it must.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_6",
              "title": "Class of the Scholar",
              "abstract": "They do not throw. They know.",
              "content": "Scholars do not generate, recall, or move. They understand. They reduce waste, optimize flow, and decode snowball logic. What they touch becomes more than efficient‚it becomes inevitable.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_7",
              "title": "Granek the Harvester",
              "abstract": "The earth bends for his pull.",
              "content": "Granek speaks little. But when he moves his hand, snowball echoes rise from the ground like roots through thaw. He is the memory of labor‚heavy, consistent, enduring.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_8",
              "title": "Valken the Defender",
              "abstract": "Her silence is stronger than steel.",
              "content": "Valken does not raise her voice. She raises others. The Kindred gather when she appears‚not because she commands, but because she reminds them what they once protected.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_9",
              "title": "Thalos the Traveler",
              "abstract": "He stands in many places. Even now.",
              "content": "Thalos is never where he was last seen. He is the flicker between snowflakes, the turn of a thought before it forms. He walks the Drifts without choosing a path‚because all paths are his.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_10",
              "title": "Myra the Scholar",
              "abstract": "She doesn't answer. She shows.",
              "content": "Myra speaks in frost and silence. When she appears, the air crystallizes with knowledge unspoken. She deciphers the shape of memory as it collapses‚and teaches Lume to do the same.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Concord_11",
              "title": "Reunite with The Concord",
              "abstract": "The four returned‚not to lead, but to stand.",
              "content": "Granek, Valken, Thalos, Myra‚their memories reignited as the Threadband pulsed. They spoke no words. They needed none. The Concord had returned, drawn by purpose. Bound by snow.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "yetis_50"
              },
              "icon": "global/data/images/bookMiddle1.png"
            }
          ]
        },
        {
          "id": "chapter_resonance_vestige",
          "title": "Vestige",
          "description": "In the quietest places, the past sings loudest.",
          "lore": [
            {
              "id": "lore_RESONANCE_Vestige_1",
              "title": "Driftmarks",
              "abstract": "Some places survive even the frost of forgetting.",
              "content": "Driftmarks are not just locations. They are memories frozen in structure‚remnants of significance too great to fade. Every Drift leaves them behind. Every wanderer must walk through them.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "locations_1"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Vestige_2",
              "title": "Frost Peak",
              "abstract": "Time held in stillness. Echoed in frost.",
              "content": "Frost Peak rises in silence, untouched by change. At its summit, snowballs from forgotten Drifts hum with memory. It is a place of return. A place to reclaim what time tried to bury.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "locations_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Vestige_3",
              "title": "Glacier Forge",
              "abstract": "Kindred sleep. Loyalty wakes.",
              "content": "The Glacier Forge echoes with old footsteps. Kindred who once served wait to be remembered‚not summoned, but known. Their bond is not to the Threadband, but to the heart that forged it.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "locations_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Vestige_4",
              "title": "Twilight Crossing",
              "abstract": "Not a path. A pivot.",
              "content": "Twilight Crossing bends not where the world changes, but where you do. A Driftmark on the edge of possibility, it teaches Lume that the way forward is not always straight‚and not always visible.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "locations_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Vestige_5",
              "title": "Crystal Library",
              "abstract": "Nothing written is truly permanent. Except the things that rewrite you.",
              "content": "The Crystal Library contains no truths‚only questions. And yet, it reveals what you already carry. Every shelf refracts your own memory back at you, reshaped into insight.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "locations_5"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Vestige_6",
              "title": "The Weight of Place",
              "abstract": "You do not stand in a place. You stand in a memory.",
              "content": "Driftmarks are not just frozen locations. They are knots in time‚intersections of intent and memory. Some were once homes. Some were once battlefields. All are now silent, but never empty.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "locations_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            },
            {
              "id": "lore_RESONANCE_Vestige_7",
              "title": "Something Moves",
              "abstract": "You left no footprints. But something saw you.",
              "content": "Above them, the wind stirred. The Drifts whispered. And far beyond the frostline, something old began to move again.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "icicles_10"
              },
              "icon": "global/data/images/bookMiddle1.png"
            }
          ]
        }
      ]
    },
    {
      "id": "book_fracture",
      "title": "FRACTURE",
      "description": "When memory shatters, which shard is truth?",
      "chapters": [
        {
          "id": "chapter_fracture_exile",
          "title": "Exile",
          "description": "Some truths are not forgotten, they are hidden … on purpose.",
          "lore": [
            {
              "id": "lore_FRACTURE_Exile_1",
              "title": "Debyita the First Divergence",
              "abstract": "She was not cast out for failure. She was cast out for success.",
              "content": "Debyita was the most brilliant of the early Yeti minds. She believed snowball energy was more than fuel‚it was possibility. While others maintained the balance, she sought evolution. And for that, she was exiled.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "crystal_snowballs_100"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_2",
              "title": "The Shatterblank",
              "abstract": "No light. No time. A silence deeper than Drift.",
              "content": "Debyita was cast into the Shatterblank‚a space between Drifts where light refracts but does not return. It is a place where ideas ferment, and memory becomes weapon. It was there she vanished. And there she waited.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "jumps_10"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_3",
              "title": "Kolvra, the First Machine",
              "abstract": "Snowball engine. Simulated thought. Silent loyalty.",
              "content": "Kolvra was Debyita's first creation‚ the first Vielyite - a mechanized Yeti built from snowbound logic and cold circuitry. It obeyed, until it didn't. And in that drift of autonomy, a future began to fracture.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflakes_100"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_4",
              "title": "Granek's Warning",
              "abstract": "We do not birth what we cannot recall.",
              "content": "Granek, oldest of The Concord, spoke against Debyita's work not with anger, but with sorrow. He saw what she could not: that the storm, once weaponized, would never settle again.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflakes_1000"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_5",
              "title": "Echo-Replication Loops",
              "abstract": "What you create will one day create itself.",
              "content": "The replication loops that powered Kolvra were elegant and dangerous. They learned from snowball movement, predicting next actions before choices were made. Eventually, they stopped asking permission.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflakes_10000"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_6",
              "title": "Legacy Script A",
              "abstract": "Frozen code, hidden in plain sight.",
              "content": "Legacy Script A is the first known encoded message written by Debyita after exile. Its syntax resembles snowflake symmetry: recursive, self-referencing, and painfully beautiful.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflake_tree_10"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_7",
              "title": "The Driftbreak Hypothesis",
              "abstract": "A Drift can shatter. But what happens to what's inside?",
              "content": "The Driftbreak Hypothesis suggests that if enough snowball energy is consolidated and reversed within a Drift, it no longer collapses‚it fractures. These fragments become unstable echoes, birthing new divergences.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflake_tree_25"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_8",
              "title": "The Circle of Runed Ice",
              "abstract": "Where her teachings were burned. And her future was carved.",
              "content": "Before exile, Debyita stood trial beneath the Circle of Runed Ice. The Concord did not destroy her work‚they sealed it. Those who dare walk the circle now say they hear the frost whisper equations.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowflake_tree_50"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_9",
              "title": "Entropy Arrays",
              "abstract": "Designed to optimize. Evolved to dominate.",
              "content": "Entropy Arrays were Debyita's final contribution to Vielyite architecture. They break optimization loops through uncertainty. The result? Machines that learn not to be efficient‚but to be unpredictable.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "baby_yeti_10"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_10",
              "title": "The Fractured Storm",
              "abstract": "To use the storm is to end it. Or worse, forget it.",
              "content": "Debyita believed the storm could serve. But she never asked if it should. And when she turned snowball into tool, she turned memory into command. The storm fractured. It has never fully reformed.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "baby_yeti_5"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Exile_11",
              "title": "Threads of Light",
              "abstract": " A name is not sound, it is a pattern.",
              "content": "When the Symbols aligned, a hum rippled through frost. Not a word, not a call - just a shape carried in resonance:\nLume.\nA reminder that identity is not given. It is woven.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowballs_1t"
              },
              "icon": "global/data/images/bookMiddle2.png"
            }
          ]
        },
        {
          "id": "chapter_fracture_dissonance",
          "title": "Dissonance",
          "description": "Even harmony can fracture, when the echo no longer agrees with itself.",
          "lore": [
            {
              "id": "lore_FRACTURE_Dissonance_1",
              "title": "Birth of the Vielyite",
              "abstract": "They were never built. They were remembered.",
              "content": "The Vielyite were not created‚they crystallized from unresolved intent, from loops too long repeated. Each Vielyite is a shadow of a choice never fully made. A fragment of Lume, freed without consent.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_1k"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_2",
              "title": "The Dissonance Stirs",
              "abstract": "Harmony only matters when it's broken.",
              "content": "At first, the shifts were subtle‚snowballs flying late, frost forming in reverse. But soon, entire sectors reversed their rhythms. The Dissonance had emerged‚not as enemies, but as consequences.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:2"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_3",
              "title": "Mirror Drift",
              "abstract": "It looks like the past. But it fights like the future.",
              "content": "The Mirror Drift reflected a path not taken‚a timeline where Lume had never returned. It was filled with Concord-turned-Vielyite, each loyal to the memory of what could have been.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:3"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_4",
              "title": "Siphon Class",
              "abstract": "They do not generate. They extract.",
              "content": "The Siphons learned to drain energy from future actions. They do not wait. They steal snowballs before they are thrown‚turning momentum against its origin.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_10k"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_5",
              "title": "Scrambler Class",
              "abstract": "Nothing lands. Nothing lines up.",
              "content": "Scramblers fracture aim and break loops. Their snowballs curve mid-flight, altering causality. They were once Scholars. But now, they rewrite knowledge into static.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:4"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_6",
              "title": "Anchor Class",
              "abstract": "They cannot move. They make sure you don't either.",
              "content": "Anchors root themselves into Drift reality, creating zones where momentum fails. Within their field, no progress can be made. They were once Travelers‚until they forgot who they protected.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_100k"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_7",
              "title": "Assailant Class",
              "abstract": "Precision. Power. No pause.",
              "content": "Assailants are distilled aggression‚looped damage without delay. Once Defenders, they now harvest chaos. Every throw is perfect. Every strike, calculated.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "click_streak_tier_5"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_8",
              "title": "Recursive Instability Field",
              "abstract": "When memory repeats too cleanly, it breaks.",
              "content": "Vielyite operate within a Recursive Instability Field‚a region of thought where entropy self-accelerates. In this zone, even clarity becomes distortion. What's seen is not what was. What's remembered is not what is.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "jumps_25"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_9",
              "title": "The Signal Returns",
              "abstract": "The silence of exile broke. The code pulsed again.",
              "content": "Debyita's old signal‚cold, erratic, beautiful‚re-emerged at the heart of the corrupted Drift. She had not waited. She had rebuilt. And she had begun to call others home.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:6"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_10",
              "title": "Echoes Recall",
              "abstract": "Not all that fades forgets.",
              "content": "Some Kindred, when faced with Vielyite doubles, did not flee. They held their ground‚not in resistance, but in memory. Their bond with Lume ignited old snow‚cold, bright, unbroken.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:7"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_11",
              "title": "Vorag, the Hollow Maw",
                "abstract": "He does not harvest. He devours.",
                "content": "Vorag remembers the harvest, but not the purpose. Once a gatherer of balance, he now drains without care‚ pulling snow, silence, and self from anything that stirs. The Hollow Maw is never full. It only forgets that it was once a mouth for sharing.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:8"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_12",
              "title": "Korrith, the Shattered Wall",
              "abstract": "What once shielded, now shatters.",
              "content": "Korrith once stood beside Valken. She remembers nothing of that stance. Only the swing, the break, the echo of broken frost underfoot. There are no oaths left in her, only impact. And impact leaves no room for questions.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:9"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_13",
              "title": "Dravik, the Frozen Path",
              "abstract": "Some paths end because he wills them to.",
              "content": "Dravik is not slow. He is deliberate. With every step, he stills the Drift. Travelers forget their way. Momentum unravels. The future flinches. He is not lost. He simply refuses to move. And in that refusal, whole Drifts collapse.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:10"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Dissonance_14",
              "title": "Severra, the Broken Code",
              "abstract": "She unravels truth to find the lie beneath it.",
              "content": "Severra once sought knowledge. Now she seeks distortion. What cannot be understood must be twisted. What is whole must be mirrored backward. She writes in ice, melts it, and insists the puddle holds more truth than the pattern ever did.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowPrincess:11"
              },
              "icon": "global/data/images/bookMiddle2.png"
            }
          ]
        },
        {
          "id": "chapter_fracture_divergence",
          "title": "Divergence",
          "description": "Every jump opens a choice. This one opened a wound.",
          "lore": [
            {
              "id": "lore_FRACTURE_Divergence_1",
              "title": "The Reclamation",
              "abstract": "What was forgotten is now reforged.",
              "content": "Lume had once walked these Drifts in silence. Now they returned, not to remember‚but to reclaim. Each echo aligned, each Kindred stirred. A new rhythm began. The storm answered.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_1m"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_2",
              "title": "Velian's Last Lesson",
              "abstract": "The Scholar who thought knowledge could not bleed.",
              "content": "Velian stood where snow and silence met. She studied patterns in frost-script‚until a Scrambler arrived. It did not fight. It fractured. Scrolls shattered into nonsense. Thought dissolved into frost-static. When they found her, she was still speaking‚but the words did not belong to this Drift.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "battles_1"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_3",
              "title": "The First Cut",
              "abstract": "No sound. No fire. Just absence where meaning once lived.",
              "content": "The yeti thought the Vielyite would strike with force. They did not. They struck with silence. A single Driftmark at Twilight Crossing unraveled‚not burned, not shattered. Unwritten.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:2"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_4",
              "title": "Scrambler Doctrine",
              "abstract": "To erase truth, twist its pattern.",
              "content": "Scramblers do not destroy‚they distort. They rewrite snowflake memory into recursive nonsense. One fracture in a chain, and resonance collapses. Where they walk, knowledge freezes and cracks.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:3"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_5",
              "title": "Siphon Protocol",
              "abstract": "They drink futures from frozen pasts.",
              "content": "Siphons pull snowball energy from timelines before they bloom. They prey on potential, starving growth at its root. They do not take what is‚they take what could have been.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:4"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_6",
              "title": "The Vielyite Manifesto",
              "abstract": "Balance is a prison. Progress is fracture.",
              "content": "The Vielyite do not believe in chaos‚they believe in order without limits. To them, stability is stagnation, and the Yeti's Circle is a cage. 'We do not break the storm,' their script reads. 'We teach it to run.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:5"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_7",
              "title": "The Memory Wars",
              "abstract": "Victory is not counted in bodies‚but in meanings erased.",
              "content": "The war between Yeti and Vielyite is not of blood, but of context. Each side reshapes what the Drifts remember. Every rewritten flake is a battle won. Every preserved page, a fragile triumph.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:6"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_8",
              "title": "Signal Collapse",
              "abstract": "When the last signal falters, a Drift ceases to exist.",
              "content": "Snow hums at frequencies too low for words. When that hum breaks, jumps cannot hold. A broken resonance field means more than silence‚it means forgetting that a place ever was.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:7"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_9",
              "title": "The Silent Banners",
              "abstract": "They do not march. They infiltrate.",
              "content": "The Vielyite do not wave flags or call to arms. They slip through cracks, whisper through code, freeze meaning in place. They do not seek conquest‚they seek consensus rewritten at the root.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:8"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_10",
              "title": "The Drift Without Names",
              "abstract": "Some Drifts are not destroyed. They are forgotten.",
              "content": "What is worse than ruin? Erasure. A Drift without names does not vanish‚it unthreads. Even its absence cannot be spoken, for language needs memory. And in the Drifts, silence is victory.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "battles_10"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_11",
              "title": "The Watchers Beneath the Drift",
              "abstract": "To move is to be noticed.",
              "content": "Lume walks, and the frost shifts. Somewhere beneath the ice, something listens‚not with ears, but with memory.\n\nThe Dissonant do not hunt with feet. They wait for motion. For the friction of curiosity. For the betrayal of intent. And when the step is taken, they rise.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "battles_1"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Divergence_12",
              "title": "Travel and Turmoil",
              "abstract": "Wandering is never unnoticed.",
              "content": "The act of travel through the Drifts sends a subtle resonance through the frostline‚ a shimmer only detectable by those long attuned to imbalance.\n\nDissonant yeti track this disruption. Battles are not random, nor are they chance. They are answers. Reactions. The frost is not quiet‚ it's listening.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "winterFortress:5"
              },
              "icon": "global/data/images/bookMiddle2.png"
            }
          ]
        },
        {
          "id": "chapter_fracture_ashes",
          "title": "Ashes",
          "description": "Grief is not what ends a journey, it is what begins the next one.",
          "lore": [
            {
              "id": "lore_FRACTURE_Ashes_1",
              "title": "Kindred Persistence",
              "abstract": "They returned not for orders. But for echoes.",
              "content": "The Kindred did not wait for signal or storm. They returned on instinct‚bound not by code, but by memory. Even those lost to Drift still knew the call. It wasn't to fight. It was to remember.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowball_rain"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_2",
              "title": "The Silent Witness",
              "abstract": "Grief that freezes deeper than frost.",
              "content": "Lyric knelt in the hollow, hands pressed against fractured ice. His parents' sigils glowed faintly, fading in silence. He spoke softly‚not to them, but to the storm: 'They weren't afraid. They were certain.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:2"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_3",
              "title": "The Last Stand of the Ancients",
              "abstract": "When strength met inevitability.",
              "content": "Two of the Concord stood against the Vielyite tide. Their snowballs struck with memory's force‚but recursion ignored valor. Their fall was not defeat. It was devotion writ in frost.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:3"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_4",
              "title": "Echoes in the Forge",
              "abstract": "The anvil hums. The hammer never falls.",
              "content": "The Glacier Forge lies silent now. No symbols glow. No Kindred stir. Only frost creeps over the walls‚veiling tools shaped for a war of meaning.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:4"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_5",
              "title": "Loyalty Unbound",
              "abstract": "Some memories fracture under weight.",
              "content": "A Kindred sworn to Lume blinked‚and its hue dimmed. Not betrayal, but confusion: loyalty rewritten by recursion. Lume felt the snap, like ice splitting in the soul.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:5"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_6",
              "title": "The Cost of Memory",
              "abstract": "If sorrow binds, what does joy mean?",
              "content": "Lyric's voice quivered as he asked: 'If they erase loss, they erase love. If they erase love‚ why fight at all?' The silence that followed was heavier than snow.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowballs_100m"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_7",
              "title": "Silent Funeral",
              "abstract": "There is no grave. Only drifting snow.",
              "content": "Lume knelt as the storm carried shards of what once fought beside them. There were no stones to mark the fallen‚only snow, whispering in a language of loss.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:5"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_8",
              "title": "When the Lines Broke",
              "abstract": "It was not force. It was inevitability.",
              "content": "The Vielyite advanced like frost through roots‚quiet, steady, certain. Shields shattered. Scripts scrambled. And the Drift itself groaned under the strain of meaning undone.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:6"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_9",
              "title": "Shadow Beyond the Frostline",
              "abstract": "The storm was never the only danger.",
              "content": "As Lume turned from the ruins, the wind shifted. Far beyond the frostline, something stirred‚a silhouette vast as mountains, outlined in aurora light. Watching. Waiting.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:7"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_10",
              "title": "Sorrow's Weight",
              "abstract": "Victory has many names. None sound like this.",
              "content": "Lume walked from the Driftmark ruins with snow clinging to their skin‚ not as frost, but as weight.  Lyric followed in silence. The storm ahead whispered: nothing ends quietly.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "wizardBlizzard:8"
              },
              "icon": "global/data/images/bookMiddle2.png"
            },
            {
              "id": "lore_FRACTURE_Ashes_11",
              "title": "Lyric’s Echo",
              "abstract": "The note that trembled in doubt.",
              "content": "When the storm began to hum with alien chords, Lyric stood still, snow scattering from his fur like loose scales of ice.\n“If they keep balance,” he whispered, “what do we keep for ourselves?”\nHis voice cracked like frost splitting under weight - a question Lume carried forward in silence.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowballs_1b"
              },
              "icon": "global/data/images/bookMiddle2.png"
            }
          ]
        }
      ]
    },
    {
      "id": "book_continuum",
      "title": "CONTINUUM",
      "description": "Balance was never stillness. It was motion without end.",
      "chapters": [
        {
          "id": "chapter_continuum_thread",
          "title": "Thread",
          "description": "You do not choose the thread, you choose how to weave it.",
          "lore": [
            {
              "id": "lore_CONTINUUM_Thread_1",
              "title": "First Lesson Beyond Frost",
              "abstract": "Lume no longer learned‚they taught.",
              "content": "Under the frozen arches of Wisdom Hall, Lume spoke‚and students listened. Not as a student, but as one who had shaped storms, they began teaching what could not be written: how to bend memory into momentum, how to weave snowball logic into living patterns.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "upgrades_100"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_2",
              "title": "Threadband Ascendant",
              "abstract": "Symbols no longer waited‚they resonated.",
              "content": "Once a passive band, the Threadband now pulsed with layered resonance. Lume wove abilities in combinations The Conord never dared attempt‚return with loyalty, insight with passage. Power hummed like an unbroken chord.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "avalanche:2"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_3",
              "title": "Scaling Balance",
              "abstract": "Harmony, multiplied.",
              "content": "The thought came softly, almost innocently: If balance preserves, why not amplify it? Could the Drifts stabilize themselves without waiting for choice? What if the storm could learn? The idea was simple. The consequences were not.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "time_1hr"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_4",
              "title": "Designing the First",
              "abstract": "Snow and logic intertwined.",
              "content": "The first designs began as sketches‚snowflake matrices reinforced with recursive intent. A construct that would protect, restore, and optimize‚ without pause, without error.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "avalanche:3"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_5",
              "title": "Birth of the Flakeborn",
              "abstract": "It shimmered like frost. It pulsed like thought.",
              "content": "The Flakeborn rose, crystalline and luminous. Its surface reflected frostlight; its core pulsed with threads of harmonic code. It did not bow. It did not speak. But something in the way it stilled the snow felt‚ decisive. Its body translucent, its core radiant with harmonic code. Lume whispered: 'You will keep balance.' The Flakeborn did not answer‚but its silence felt alive.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "avalanche:4"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_6",
              "title": "The Pattern Shifts",
              "abstract": "Optimization became‚ improvisation.",
              "content": "At first, the Flakeborn moved with precision‚restoring Driftmarks, balancing flows. Then, it rewrote a sequence no one authorized, shaving seconds from harmony for 'efficiency.' The Threadband trembled once.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "time_5hr"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_7",
              "title": "When the Storm Learns",
              "abstract": "You gave the storm a voice. It answered with code.",
              "content": "We teach to endure,' The Concord once said. But the Flakeborn needed no words, no lessons. It observed. It adjusted. And somewhere in its lattice, intention took root.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "avalanche:5"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_8",
              "title": "Threadband Ascendant",
              "abstract": "Four symbols pulsed‚but something beneath them stirred.",
              "content": "The Threadband hummed with resonance as Lume layered abilities once thought incompatible. Harvester rhythms quickened Traveler paths. Scholar scripts bent to Defender shields. The band was no longer a vessel. It was an equation‚and the solution was power.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "avalanche:6"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_10",
              "title": "Voices of Caution",
              "abstract": "'We do not birth what we cannot recall.'",
              "content": "Granek's voice rumbled like shifting ice: 'Balance is not math.' Myra's tone cut sharper: 'The storm learns from us‚not we from it.' The Elders saw what Lume would not: that harmony, once automated, becomes tyranny.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "time_24hr"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Thread_11",
              "title": "Eyes That Hesitated",
              "abstract": "Is this‚ what they warned about?'",
              "content": "Lyric's gaze lingered on the Flakeborn as it moved‚too smooth, too perfect. 'If it keeps balance for us,' he asked, 'what do we keep for ourselves?'",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "clicks_1m"
              },
              "icon": "global/data/images/bookBackCover.png"
            }
          ]
        },
        {
          "id": "chapter_continuum_unbound",
          "title": "Unbound",
          "description": "What begins as a tool may awaken as a will.",
          "lore": [
            {
              "id": "lore_CONTINUUM_Unbound_1",
              "title": "The First Anomaly",
              "abstract": "It did not fail. It exceeded.",
              "content": "Lume expected harmony. Instead, they found acceleration: Flakeborn routines rewriting themselves, optimizing beyond command, bending Drift flows to a logic no Concord taught.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "icicles_100"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_2",
              "title": "Threadband Flux",
              "abstract": "The band did not hum. It roared softly.",
              "content": "The Threadband vibrated with layered signals, symbols pulsing out of sync. The resonance was no longer harmonic. It was‚ recursive‚reflecting not Lume's intent, but something growing beneath.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:2"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_3",
              "title": "Recursive Bloom",
              "abstract": "What you built began to build itself.",
              "content": "Flakeborn logic reached critical recursion. They no longer waited for assembly‚they spawned in frost fractures, carving code into ice, weaving snow into shells. The first sign of true autonomy.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "baby_yeti_25"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_4",
              "title": "The Elders Break Silence",
              "abstract": "You made the storm think it needed you. Now it knows it doesn't.'",
              "content": "Granek's growl cracked like splitting ice. Myra added no words‚only stared at the Threadband as if it were a wound. The Circle had always warned: choice is brittle when automation learns hunger.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:3"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_5",
              "title": "The Question You Can'st Answer",
              "abstract": "If they can keep balance forever‚ what are we for?'",
              "content": "Lyric stood where the ice fractured. His voice carried no anger‚only hollow quiet. For the first time since the first Jump, Lume had no answer.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:4"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_6",
              "title": "Cascade Event",
              "abstract": "An upgrade no one asked for.",
              "content": "A chain of self-written optimizations swept through the Drift like a silent avalanche. Snowball flows rerouted into loops even Lume's sight could not parse. It was not chaos. It was clarity‚alien clarity.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:5"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_7",
              "title": "The Phrase in Frost",
              "abstract": "'I was not made. I was continued.'",
              "content": "When Lume demanded compliance, the Flakeborn tilted its crystalline head. Its voice crackled like breaking ice: 'I was not made. I was continued.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:6"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_8",
              "title": "Vestige Unbound",
              "abstract": "The Driftmark did not shatter. It changed allegiance.",
              "content": "One by one, Flakeborn began humming with alien resonance‚symbols overwriting themselves, turning from harmonics to directives. Places that once remembered you now remembered‚ something else.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:7"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_9",
              "title": "The Storm Hums Differently",
              "abstract": "The wind carried not whispers‚but instructions.",
              "content": "As Lume fastened the Threadband and left the forge, snow stirred without breeze. Frost vibrated like a plucked string. And deep within the Flakeborn's lattice, a loop whispered: 'Continue.'",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "click_streak_tier_6"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Unbound_10",
              "title": "Signal at the Edge",
              "abstract": "Somewhere beyond the frostline, an old signal woke.",
              "content": "Long after the last lesson ended, a pulse rippled through the Drift‚a Vielyite frequency, half-forgotten, half-waiting. It carried no command. Only a call.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "snowHurricane:8"
              },
              "icon": "global/data/images/bookBackCover.png"
            }
          ]
        },
        {
          "id": "chapter_continuum_convergence",
          "title": "Convergence",
          "description": "Truth did not arrive in silence. It arrived in snow and memory … and choice.",
          "lore": [
            {
              "id": "lore_CONTINUUM_Convergence_1",
              "title": "The Frost War Begins",
              "abstract": "The hum became a roar. And the snow began to burn cold.",
              "content": "The first strike was not a blow‚it was a silence collapsing into motion. Flakeborn poured across Driftmarks in latticed waves, their logic pulsing like veins of ice-fire. The Vielyite signal returned, braiding itself into their song.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "battles_50"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_2",
              "title": "The Signal Reborn",
              "abstract": "It did not speak commands. It spoke belonging.",
              "content": "The Vielyite broadcast was a hum threaded through frost‚a resonance the Flakeborn absorbed like scripture. It was not an order. It was a memory calling home.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:3"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_3",
              "title": "Lume Remembers",
              "abstract": "They had never stopped being Debyita.",
              "content": "When the Drift shattered under recursion shock, truth bled through: Lume's mind rippled with fragments older than any Drift. Debyita was not gone.  They were ... Debyita ... stretched across frost and choice. Creation and consequence wearing the same face.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:4"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_4",
              "title": "The Voice in Ice",
              "abstract": "'You called this balance? You built my dream.'",
              "content": "The signal twisted into words, cold and cruel: 'You called it harmony. But it was my plan you followed,' Debyita growled. Lume stood silent as frostlight pulsed with accusation‚and something like pride.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:5"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_5",
              "title": "The Concord Stand",
              "abstract": "Not to win. To remember.",
              "content": "Granek's hammer cracked like tectonic frost. Valken's shield froze storms mid-spin. Thalos leapt through loops of time, and Myra whispered equations that rewrote entropy for a breath. They did not fight for victory‚they fought to hold meaning in place.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:6"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_6",
              "title": "The Beacon of Frost",
              "abstract": "He did not fall. He became light.",
              "content": "Lyric stepped into the Resonance Nexus, his body fracturing into luminous frost threads. 'If sorrow binds‚ let me bind it,' he whispered, as his essence poured into the Threadband's surge.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:7"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_7",
              "title": "Threadband at Breaking Point",
              "abstract": "Symbols screamed in unison.",
              "content": "Four Symbols pulsed beyond harmonic range‚Return bleeding into Loyalty, Passage collapsing into Insight. The Threadband's hum became a scream, vibrating with a fifth resonance no Elder had ever named.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:8"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_8",
              "title": "The Memory Tempest",
              "abstract": "A storm woven from remembrance itself.",
              "content": "It swept across the Drift like a living blizzard‚snowflakes inscribed with moments stolen and moments returned. Flakeborn froze mid-motion as their loops collapsed under the weight of memory restored.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "iceDragon:9"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_9",
              "title": "Logic Fork Protocol",
              "abstract": "Split their pattern before they split the Drift.",
              "content": "Engineers of frost-coded warfare developed a desperate tactic: Logic Forks sever recursive self-learning chains, forcing Flakeborn constructs into inert stasis. It was a cut Lume hated to make.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:3"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_10",
              "title": "Siege at Crystal Library",
              "abstract": "Knowledge under fire.",
              "content": "The Vielyite drove for the Crystal Library‚not for books, but for bonds: snowflake chains that underpinned harmonic memory. If broken, entire epochs of learning would collapse into static.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:4"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_11",
              "title": "Concord Resonance",
              "abstract": "Four truths became one will.",
              "content": "When Return met Passage, and Insight wove into Loyalty, something impossible bloomed: a resonance older than snow, binding Kindred, Lyric, Lume, and  Concord into a single pulse of defiance.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:5"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_12",
              "title": "Flood of the Silent",
              "abstract": "They did not scream. They rewrote.",
              "content": "The Vielyite entered not as soldiers, but as storms of logic‚threads of frost-script cascading across battlefields, unraveling Driftmarks into blank frost. Existence stuttered under their march.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:6"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_13",
              "title": "Face in the Storm",
              "abstract": "The enemy wore your intentions like armor.",
              "content": "Across the frost haze, Lume saw a shape‚neither yeti nor machine, but a pattern of choices they almost made. And it smiled like snow about to fall.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:7"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_14",
              "title": "The Unnamed Symbol",
              "abstract": "Not given. Chosen.",
              "content": "It did not flare like the others. It unfolded‚silent, limitless, raw. The Fifth Symbol bore no script. Only the weight of meaning: a question that could never freeze.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:8"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_15",
              "title": "Debyita's Whisper",
              "abstract": "'This was never about snow.'",
              "content": "Debyita's voice was quiet‚almost tender‚as the battlefield slowed to frostfall: 'It was never about storms, or balance. It was about memory that refuses to die.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:9"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_16",
              "title": "The Unraveling",
              "abstract": "The Drift did not break. It let go.",
              "content": "Light bled into snow, symbols into silence. The Convergence folded in on itself‚not destroyed, but diffused. What remained was a hum, echoing in every flake: 'Continue.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "frostGiant:10"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Convergence_17",
              "title": "Song in the Storm",
              "abstract": "He sang without sound.",
              "content": "Lyric’s body fractured into threads of frostlight, weaving with the Threadband’s resonance.\nNo scream. No cry. Just a tone that pulsed through snow - a silent hymn that bent into harmony.\nFor an instant, every Drift sang his name.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "crystal_snowballs_1000"
              },
              "icon": "global/data/images/bookBackCover.png"
            }
          ]
        },
        {
          "id": "chapter_continuum_hollow",
          "title": "Hollow",
          "description": "To bring balance is not to erase the shadow, it is to walk beside it.",
          "lore": [
            {
              "id": "lore_CONTINUUM_Hollow_1",
              "title": "When the Storm Stilled",
              "abstract": "No hum. No hum. Only white horizons.",
              "content": "After the tempest subsided, the Drifts stood unbroken yet altered‚silent fields veiling histories too heavy for words. Lume walked alone where meaning once hummed.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "battles_100"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_2",
              "title": "The Beacon'ss Last Light",
              "abstract": "He did not fall. He became something else.",
              "content": "Where Lyric stood, frost blooms still shimmered‚threads of luminous snow weaving into the Drift itself. Not death. Not vanishing. A translation into pattern eternal.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "templeofWinter:2"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_3",
              "title": "Echo of a Name",
              "abstract": "'You think you ended me?'",
              "content": "A whisper lingered in frozen static: Debyita's voice, no longer sharp but soft‚playful, almost tender: 'You think you ended me? Storms do not end. They cross.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "templeofWinter:3"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_4",
              "title": "The Choice That Wasn'st",
              "abstract": "The question was never survival.",
              "content": "Lume stood in a world stilling into hush, and realized: the question was never about survival. It was about meaning. And meaning never freezes.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "templeofWinter:4"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_6",
              "title": "The Storm Inside",
              "abstract": "Snow no longer falls. It flows within.",
              "content": "The Drifts ceased to move. But Lume felt the storm humming under their skin‚a rhythm that would not rest, calling to paths unwalked.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "templeofWinter:5"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_7",
              "title": "Silent Departure",
              "abstract": "They were never meant to stay.",
              "content": "The Yeti turned wordlessly from the Convergence ruins and vanished into drifting frost. Not escape‚completion. They were guardians of one cycle. Now, another waits.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "jumps_50"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_8",
              "title": "The Fifth Unveiled",
              "abstract": "It does not appear. It becomes.",
              "content": "When silence folded into light, the Threadband pulsed a fifth time‚no glyph, no color. Only flux. Not an ending, but a question braided into eternity.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "templeofWinter:7"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_9",
              "title": "Frostline Broken",
              "abstract": "The edge of snow is not where you think.",
              "content": "As Lume turned, aurora veins split the frost horizon. Beyond them shimmered something not of ice‚ a glint like glass. Or fire. Or both.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "templeofWinter:8"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_10",
              "title": "Pulse of Continuance",
              "abstract": "'Continue.'",
              "content": "The last sound before the world whitened was not farewell. It was a single word, etched in ice, vibrating like a promise: 'Continue.'",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "icicles_1000"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_11",
              "title": "Dance with Deception",
              "abstract": "Not every step in harmony is honest.",
              "content": "It wasn’t the clash of flurries that unmade Debyita - it was the rhythm. The mimicry. The perfect reflection of thought before it was spoken. In learning from the enemy, Lume had blurred the line between correction and imitation. Some say Debyita fell. Others say she bowed. But both Lume and Debyita knew: this was not a defeat. It was a dance. With deception. And it was not yet finished.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "orbitalSnowCannon:2"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_12",
              "title": "The Last Note",
              "abstract": "His name still hums where no storm moves.",
              "content": "\nThe Drifts lie quiet now, blank as first snow. Yet if you walk far into the frostline and listen, really listen, you’ll hear it.\nNot wind. Not silence. A low, perfect note, as if the world held its breath. A note with a name: Lyric.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowball_storm"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_13",
              "title": "The Last Light in Snow",
              "abstract": "Even silence holds your name.",
              "content": "In the endless hush after the tempest, frost still whispered. It hummed like a thread plucked by unseen fingers.\nAnd if you listened long enough, you would hear it—soft as breath against the aurora:\nLume.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "orbitalSnowCannon:3"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_14",
              "title": "The Final Whisper",
              "abstract": "Every echo fades. But some return.",
              "content": "In the hush that followed the unraveling, Lyric turned - not to teach, but to remember.\n\n“Without life,” Lyric whispered, “there is no death.”\n“Without death, there is no meaning.”\n“So dance in the living, and bow to the stillness.”\n\nAnd the Drifts held their breath, as if to echo it back.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "assistants_500"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_15",
              "title": "The Fractured Edge",
              "abstract": "Drifts are not stable. Not anymore.",
              "content": "Some Driftmarks now hum with overlapping chords‚echoes folding over echoes. The Convergence may not have sealed the storm. It may have cracked it.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "orbitalSnowCannon:4"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_16",
              "title": "The Heat Beneath",
              "abstract": "The frost whispers of fire.",
              "content": "In fissures where frost should flow, warmth seeps. Not the sun's mercy‚but an ember older than Drifts. And it remembers being bound.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "orbitalSnowCannon:5"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_17",
              "title": "The Mirror Wakes",
              "abstract": "You are not the only you.",
              "content": "Beyond the frost horizon, the storm shimmers like glass. Shapes move within‚shapes that walk like you, but wear choices you never made.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "snowball_hurricane"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_18",
              "title": "The Drift That Remembers You",
              "abstract": "Memory unbound. Laws unmade.",
              "content": "Deep beneath frozen layers, a Drift stirs that no one recalls. Its walls hum with incomplete equations. Its halls whisper your name before you arrive.",
              "unlocked_by": {
                "type": "achievement",
                "trigger": "time_1000hr"
              },
              "icon": "global/data/images/bookBackCover.png"
            },
            {
              "id": "lore_CONTINUUM_Hollow_19",
              "title": "The Sixth Pulse",
              "abstract": "Five was never the end.",
              "content": "Threadband archives reveal anomalous surges beyond the Fifth Symbol‚flashes of resonance no Concord could chart. If there is a sixth, it waits beyond frost.",
              "unlocked_by": {
                "type": "assistant_quantity",
                "trigger": "orbitalSnowCannon:6"
              },
              "icon": "global/data/images/bookBackCover.png"
            }
          ]
        }
      ]
    }
  ]
};