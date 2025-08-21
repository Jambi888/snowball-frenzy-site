/**
 * ACHIEVEMENT DATA - Comprehensive achievement system for Snowball Frenzy
 * 
 * This file contains all achievement definitions for the game, organized by category.
 * Each achievement has a unique ID, name, description, category, type, and unlock condition.
 * 
 * ACHIEVEMENT TYPES:
 * - "threshold": Unlocked when a specific stat reaches a target value
 * - "event": Unlocked when a specific game event occurs
 * 
 * ACHIEVEMENT CATEGORIES:
 * 
 * 1. CLICKS - Click power achievements (with multipliers)
 *    Examples: First Flakes (100 snowballs), Click Deity (1M snowballs)
 *    Stats: effective_clicks (includes all click multipliers)
 * 
 * 2. ECONOMY - Snowball accumulation achievements
 *    Examples: Snowball Collector (10K), Snowball Trillionaire (1T)
 *    Stats: lifetime_snowballs
 * 
 * 3. ASSISTANTS - Assistant ownership achievements
 *    Examples: Team Builder (10), Snowball Dynasty (1K)
 *    Stats: assistants_owned
 * 
 * 4. UPGRADES - Upgrade purchase achievements
 *    Examples: Upgrade Enthusiast (10), Upgrade Deity (500)
 *    Stats: upgrades_purchased (boosts + global + persistent)
 * 
 * 5. JUMPS - Prestige/jump completion achievements
 *    Examples: First Jump (1), Reality Architect (50)
 *    Stats: jumps_completed (analogNumber - 1)
 * 
 * 6. TIME - Play time achievements
 *    Examples: Dedicated Player (1hr), Snowball Immortal (1000hr)
 *    Stats: time_played_seconds
 * 
 * 7. STREAKS - Click streak achievements (event-based)
 *    Examples: Quick Fingers (Tier 1), Click God (Tier 6)
 *    Events: streakTierAchieved
 * 
 * 8. ABILITIES - Ability usage achievements
 *    Examples: Ability User (1), Combo Expert (10 combos)
 *    Stats: ability_belt_level (from battle progression)
 * 
 * 9. YETIS - Yeti interaction achievements
 *    Examples: Yeti Spotter (1), Yeti Master (100)
 *    Stats: yetis_spotted
 *    Events: rareYetiFound
 * 
 * 10. LOCATIONS - Location exploration achievements
 *     Examples: Explorer (1), World Master (all locations)
 *     Stats: locations_unlocked, travel_count
 * 
 * 11. ICICLES - Icicle harvesting achievements
 *     Examples: Icicle Harvester (1), Icicle Sage (1000)
 *     Stats: icicles_harvested
 *     Events: icicleLevelUp
 * 
 * 12. BATTLES - Battle victory achievements
 *     Examples: First Battle (1), Battle Legend (100)
 *     Stats: battles_won, battle_streak
 * 
 * 13. SPS - Snowballs Per Second achievements
 *     Examples: Snowball Mist (10 SPS), Snowball Hurricane (100K SPS)
 *     Stats: sps
 * 
 * 14. CRYSTAL SNOWBALLS - Crystal snowball collection
 *     Examples: Crystal Collector (1), Crystal Deity (10K)
 *     Stats: crystal_snowballs_collected
 * 
 * 15. SNOWFLAKES - Snowflake discovery achievements
 *     Examples: Snowflake Finder (1), Snowflake Deity (10K)
 *     Stats: snowflakes_found
 * 
 * 16. SNOWFLAKE TREE - Snowflake tree upgrade purchases
 *     Examples: Tree Planter (1), Tree Deity (50)
 *     Stats: snowflake_tree_purchases
 * 
 * 17. BABY YETI - Baby Yeti ownership achievements
 *     Examples: Baby Yeti Parent (1), Baby Yeti Empire (50)
 *     Stats: baby_yeti_owned
 * 
 * TRIGGER MECHANICS:
 * - Threshold achievements are checked every time relevant stats change
 * - Event achievements are triggered by specific game events via eventBus
 * - Progress is tracked in game.achievements.progress object
 * - Unlocked achievements are stored in game.achievements.unlocked array
 * - Timestamps are recorded in game.achievements.unlockedTimestamps
 * 
 * NOTIFICATION SYSTEM:
 * - Achievement unlocks trigger notifications via showAchievementNotification()
 * - EventBus emits 'achievementUnlocked' events for other systems
 * - UI updates automatically when achievements are unlocked
 * 
 * PROGRESSION SCALING:
 * - Most categories follow 1, 10, 100, 1000, 10000 progression
 * - Some categories use different scales based on game balance
 * - Event achievements are typically one-time unlocks
 * - SPS achievements have unique conditions and scaling
 */

export const ACHIEVEMENTS = {
  "achievements": [
    // Click Achievements
    {
      "id": "clicks_100",
      "name": "First Flakes",
      "description": "Generate 100 snowballs from clicks.",
      "category": "clicks",
      "type": "threshold",
      "condition": {
        "stat": "effective_clicks",
        "value": 100
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "clicks_1k",
      "name": "Click Master",
      "description": "Generate 1,000 snowballs from clicks.",
      "category": "clicks",
      "type": "threshold",
      "condition": {
        "stat": "effective_clicks",
        "value": 1000
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "clicks_10k",
      "name": "Click Legend",
      "description": "Generate 10,000 snowballs from clicks.",
      "category": "clicks",
      "type": "threshold",
      "condition": {
        "stat": "effective_clicks",
        "value": 10000
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "clicks_100k",
      "name": "Click God",
      "description": "Generate 100,000 snowballs from clicks.",
      "category": "clicks",
      "type": "threshold",
      "condition": {
        "stat": "effective_clicks",
        "value": 100000
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "clicks_1m",
      "name": "Click Deity",
      "description": "Generate 1,000,000 snowballs from clicks.",
      "category": "clicks",
      "type": "threshold",
      "condition": {
        "stat": "effective_clicks",
        "value": 1000000
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Snowball Economy Achievements
    {
      "id": "snowballs_10k",
      "name": "Snowball Collector",
      "description": "Accumulate 10,000 snowballs.",
      "category": "economy",
      "type": "threshold",
      "condition": {
        "stat": "lifetime_snowballs",
        "value": 10000
      },
      "icon": "<img src='./global/data/images/snowballs.png' alt='Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowballs_1m",
      "name": "Snowball Tycoon",
      "description": "Accumulate 1 million snowballs.",
      "category": "economy",
      "type": "threshold",
      "condition": {
        "stat": "lifetime_snowballs",
        "value": 1000000
      },
      "icon": "<img src='./global/data/images/snowballs.png' alt='Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowballs_100m",
      "name": "Snowball Empire",
      "description": "Accumulate 100 million snowballs.",
      "category": "economy",
      "type": "threshold",
      "condition": {
        "stat": "lifetime_snowballs",
        "value": 100000000
      },
      "icon": "<img src='./global/data/images/snowballs.png' alt='Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowballs_1b",
      "name": "Snowball Billionaire",
      "description": "Accumulate 1 billion snowballs.",
      "category": "economy",
      "type": "threshold",
      "condition": {
        "stat": "lifetime_snowballs",
        "value": 1000000000
      },
      "icon": "<img src='./global/data/images/snowballs.png' alt='Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowballs_1t",
      "name": "Snowball Trillionaire",
      "description": "Accumulate 1 trillion snowballs.",
      "category": "economy",
      "type": "threshold",
      "condition": {
        "stat": "lifetime_snowballs",
        "value": 1000000000000
      },
      "icon": "<img src='./global/data/images/snowballs.png' alt='Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Assistant Achievements
    {
      "id": "assistants_10",
      "name": "Team Builder",
      "description": "Own 10 assistants.",
      "category": "assistants",
      "type": "threshold",
      "condition": {
        "stat": "assistants_owned",
        "value": 10
      },
      "icon": "<img src='./global/data/images/assistants.png' alt='Assistants' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "assistants_50",
      "name": "Frosty Workforce",
      "description": "Own 50 assistants.",
      "category": "assistants",
      "type": "threshold",
      "condition": {
        "stat": "assistants_owned",
        "value": 50
      },
      "icon": "<img src='./global/data/images/assistants.png' alt='Assistants' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "assistants_100",
      "name": "Snowball Army",
      "description": "Own 100 assistants.",
      "category": "assistants",
      "type": "threshold",
      "condition": {
        "stat": "assistants_owned",
        "value": 100
      },
      "icon": "<img src='./global/data/images/assistants.png' alt='Assistants' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "assistants_500",
      "name": "Frost Legion",
      "description": "Own 500 assistants.",
      "category": "assistants",
      "type": "threshold",
      "condition": {
        "stat": "assistants_owned",
        "value": 500
      },
      "icon": "<img src='./global/data/images/assistants.png' alt='Assistants' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "assistants_1k",
      "name": "Snowball Dynasty",
      "description": "Own 1,000 assistants.",
      "category": "assistants",
      "type": "threshold",
      "condition": {
        "stat": "assistants_owned",
        "value": 1000
      },
      "icon": "<img src='./global/data/images/assistants.png' alt='Assistants' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Upgrade Achievements
    {
      "id": "upgrades_10",
      "name": "Upgrade Enthusiast",
      "description": "Buy 10 upgrades.",
      "category": "upgrades",
      "type": "threshold",
      "condition": {
        "stat": "upgrades_purchased",
        "value": 10
      },
      "icon": "<img src='./global/data/images/upgrades.png' alt='Upgrades' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "upgrades_50",
      "name": "Upgrade Master",
      "description": "Buy 50 upgrades.",
      "category": "upgrades",
      "type": "threshold",
      "condition": {
        "stat": "upgrades_purchased",
        "value": 50
      },
      "icon": "<img src='./global/data/images/upgrades.png' alt='Upgrades' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "upgrades_100",
      "name": "Upgrade Legend",
      "description": "Buy 100 upgrades.",
      "category": "upgrades",
      "type": "threshold",
      "condition": {
        "stat": "upgrades_purchased",
        "value": 100
      },
      "icon": "<img src='./global/data/images/upgrades.png' alt='Upgrades' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "upgrades_250",
      "name": "Upgrade Sage",
      "description": "Buy 250 upgrades.",
      "category": "upgrades",
      "type": "threshold",
      "condition": {
        "stat": "upgrades_purchased",
        "value": 250
      },
      "icon": "<img src='./global/data/images/upgrades.png' alt='Upgrades' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "upgrades_500",
      "name": "Upgrade Deity",
      "description": "Buy 500 upgrades.",
      "category": "upgrades",
      "type": "threshold",
      "condition": {
        "stat": "upgrades_purchased",
        "value": 500
      },
      "icon": "<img src='./global/data/images/upgrades.png' alt='Upgrades' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Jump Achievements
    {
      "id": "jumps_1",
      "name": "First Jump",
      "description": "Complete your first jump.",
      "category": "jumps",
      "type": "threshold",
      "condition": {
        "stat": "jumps_completed",
        "value": 1
      },
      "icon": "<img src='./global/data/images/jumps.png' alt='Jumps' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "jumps_5",
      "name": "Dimensional Traveler",
      "description": "Complete 5 jumps.",
      "category": "jumps",
      "type": "threshold",
      "condition": {
        "stat": "jumps_completed",
        "value": 5
      },
      "icon": "<img src='./global/data/images/jumps.png' alt='Jumps' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "jumps_10",
      "name": "Reality Hopper",
      "description": "Complete 10 jumps.",
      "category": "jumps",
      "type": "threshold",
      "condition": {
        "stat": "jumps_completed",
        "value": 10
      },
      "icon": "<img src='./global/data/images/jumps.png' alt='Jumps' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "jumps_25",
      "name": "Dimension Master",
      "description": "Complete 25 jumps.",
      "category": "jumps",
      "type": "threshold",
      "condition": {
        "stat": "jumps_completed",
        "value": 25
      },
      "icon": "<img src='./global/data/images/jumps.png' alt='Jumps' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "jumps_50",
      "name": "Reality Architect",
      "description": "Complete 50 jumps.",
      "category": "jumps",
      "type": "threshold",
      "condition": {
        "stat": "jumps_completed",
        "value": 50
      },
      "icon": "<img src='./global/data/images/jumps.png' alt='Jumps' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Time Played Achievements
    {
      "id": "time_1hr",
      "name": "Dedicated Player",
      "description": "Play for 1 hour.",
      "category": "time",
      "type": "threshold",
      "condition": {
        "stat": "time_played_seconds",
        "value": 3600
      },
      "icon": "<img src='./global/data/images/clock.png' alt='Time' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "time_5hr",
      "name": "Snowball Veteran",
      "description": "Play for 5 hours.",
      "category": "time",
      "type": "threshold",
      "condition": {
        "stat": "time_played_seconds",
        "value": 18000
      },
      "icon": "<img src='./global/data/images/clock.png' alt='Time' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "time_24hr",
      "name": "Snowball Master",
      "description": "Play for 24 hours.",
      "category": "time",
      "type": "threshold",
      "condition": {
        "stat": "time_played_seconds",
        "value": 86400
      },
      "icon": "<img src='./global/data/images/clock.png' alt='Time' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "time_100hr",
      "name": "Snowball Sage",
      "description": "Play for 100 hours.",
      "category": "time",
      "type": "threshold",
      "condition": {
        "stat": "time_played_seconds",
        "value": 360000
      },
      "icon": "<img src='./global/data/images/clock.png' alt='Time' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "time_1000hr",
      "name": "Snowball Immortal",
      "description": "Play for 1,000 hours.",
      "category": "time",
      "type": "threshold",
      "condition": {
        "stat": "time_played_seconds",
        "value": 3600000
      },
      "icon": "<img src='./global/data/images/clock.png' alt='Time' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Click Streak Achievements (based on highest tier achieved)
    {
      "id": "click_streak_tier_1",
      "name": "Quick Fingers",
      "description": "Achieve tier 1 click streak (1 second at 5+ clicks/sec).",
      "category": "streaks",
      "type": "threshold",
      "condition": {
        "stat": "highest_streak_tier",
        "value": 1
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "click_streak_tier_2",
      "name": "Rapid Fire",
      "description": "Achieve tier 2 click streak (5 seconds at 5+ clicks/sec).",
      "category": "streaks",
      "type": "threshold",
      "condition": {
        "stat": "highest_streak_tier",
        "value": 2
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "click_streak_tier_3",
      "name": "Lightning Clicks",
      "description": "Achieve tier 3 click streak (10 seconds at 5+ clicks/sec).",
      "category": "streaks",
      "type": "threshold",
      "condition": {
        "stat": "highest_streak_tier",
        "value": 3
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "click_streak_tier_4",
      "name": "Thunder Hands",
      "description": "Achieve tier 4 click streak (20 seconds at 5+ clicks/sec).",
      "category": "streaks",
      "type": "threshold",
      "condition": {
        "stat": "highest_streak_tier",
        "value": 4
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "click_streak_tier_5",
      "name": "Storm Master",
      "description": "Achieve tier 5 click streak (50 seconds at 5+ clicks/sec).",
      "category": "streaks",
      "type": "threshold",
      "condition": {
        "stat": "highest_streak_tier",
        "value": 5
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "click_streak_tier_6",
      "name": "Click God",
      "description": "Achieve tier 6 click streak (100 seconds at 5+ clicks/sec).",
      "category": "streaks",
      "type": "threshold",
      "condition": {
        "stat": "highest_streak_tier",
        "value": 6
      },
      "icon": "<img src='./global/data/images/clicks.png' alt='Clicks' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Ability Belt Level Achievements (based on battle progression)
    {
      "id": "ability_belt_1",
      "name": "Ability Belt Initiate",
      "description": "Reach ability belt level 1.",
      "category": "abilities",
      "type": "threshold",
      "condition": {
        "stat": "ability_belt_level",
        "value": 1
      },
      "icon": "<img src='./global/data/images/abilities.png' alt='Abilities' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "ability_belt_5",
      "name": "Ability Belt Apprentice",
      "description": "Reach ability belt level 5.",
      "category": "abilities",
      "type": "threshold",
      "condition": {
        "stat": "ability_belt_level",
        "value": 5
      },
      "icon": "<img src='./global/data/images/abilities.png' alt='Abilities' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "ability_belt_10",
      "name": "Ability Belt Adept",
      "description": "Reach ability belt level 10.",
      "category": "abilities",
      "type": "threshold",
      "condition": {
        "stat": "ability_belt_level",
        "value": 10
      },
      "icon": "<img src='./global/data/images/abilities.png' alt='Abilities' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "ability_belt_25",
      "name": "Ability Belt Master",
      "description": "Reach ability belt level 25.",
      "category": "abilities",
      "type": "threshold",
      "condition": {
        "stat": "ability_belt_level",
        "value": 25
      },
      "icon": "<img src='./global/data/images/abilities.png' alt='Abilities' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "ability_belt_50",
      "name": "Ability Belt Grandmaster",
      "description": "Reach ability belt level 50.",
      "category": "abilities",
      "type": "threshold",
      "condition": {
        "stat": "ability_belt_level",
        "value": 50
      },
      "icon": "<img src='./global/data/images/abilities.png' alt='Abilities' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "ability_belt_100",
      "name": "Ability Belt Legend",
      "description": "Reach ability belt level 100.",
      "category": "abilities",
      "type": "threshold",
      "condition": {
        "stat": "ability_belt_level",
        "value": 100
      },
      "icon": "<img src='./global/data/images/abilities.png' alt='Abilities' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Yeti Achievements
    {
      "id": "yetis_1",
      "name": "Yeti Spotter",
      "description": "Spot your first yeti.",
      "category": "yetis",
      "type": "threshold",
      "condition": {
        "stat": "yetis_spotted",
        "value": 1
      },
      "icon": "<img src='./global/data/images/yetis.png' alt='Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "yetis_10",
      "name": "Yeti Tracker",
      "description": "Spot 10 yetis.",
      "category": "yetis",
      "type": "threshold",
      "condition": {
        "stat": "yetis_spotted",
        "value": 10
      },
      "icon": "<img src='./global/data/images/yetis.png' alt='Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "yetis_50",
      "name": "Yeti Hunter",
      "description": "Spot 50 yetis.",
      "category": "yetis",
      "type": "threshold",
      "condition": {
        "stat": "yetis_spotted",
        "value": 50
      },
      "icon": "<img src='./global/data/images/yetis.png' alt='Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "yetis_100",
      "name": "Yeti Master",
      "description": "Spot 100 yetis.",
      "category": "yetis",
      "type": "threshold",
      "condition": {
        "stat": "yetis_spotted",
        "value": 100
      },
      "icon": "<img src='./global/data/images/yetis.png' alt='Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "yeti_rare_1",
      "name": "Rare Yeti Finder",
      "description": "Find a rare yeti variant.",
      "category": "yetis",
      "type": "event",
      "condition": {
        "event": "rareYetiFound",
        "variant": "any"
      },
      "icon": "<img src='./global/data/images/yetis.png' alt='Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Location Achievements (based on visited locations)
    {
      "id": "locations_1",
      "name": "Explorer",
      "description": "Visit your first location.",
      "category": "locations",
      "type": "threshold",
      "condition": {
        "stat": "locations_unlocked",
        "value": 1
      },
      "icon": "<img src='./global/data/images/locations.png' alt='Locations' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "locations_5",
      "name": "World Explorer",
      "description": "Visit 5 locations.",
      "category": "locations",
      "type": "threshold",
      "condition": {
        "stat": "locations_unlocked",
        "value": 5
      },
      "icon": "<img src='./global/data/images/locations.png' alt='Locations' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "locations_10",
      "name": "Globe Trotter",
      "description": "Visit 10 locations.",
      "category": "locations",
      "type": "threshold",
      "condition": {
        "stat": "locations_unlocked",
        "value": 10
      },
      "icon": "<img src='./global/data/images/locations.png' alt='Locations' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "locations_all",
      "name": "World Master",
      "description": "Visit all available locations.",
      "category": "locations",
      "type": "threshold",
      "condition": {
        "stat": "locations_unlocked",
        "value": 8
      },
      "icon": "<img src='./global/data/images/locations.png' alt='Locations' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "travel_100",
      "name": "Frequent Traveler",
      "description": "Travel 100 times.",
      "category": "locations",
      "type": "threshold",
      "condition": {
        "stat": "travel_count",
        "value": 100
      },
      "icon": "<img src='./global/data/images/locations.png' alt='Locations' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Icicle Achievements
    {
      "id": "icicles_1",
      "name": "Icicle Harvester",
      "description": "Harvest your first icicle.",
      "category": "icicles",
      "type": "threshold",
      "condition": {
        "stat": "icicles_harvested",
        "value": 1
      },
      "icon": "<img src='./global/data/images/icicles.png' alt='Icicles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "icicles_10",
      "name": "Icicle Collector",
      "description": "Harvest 10 icicles.",
      "category": "icicles",
      "type": "threshold",
      "condition": {
        "stat": "icicles_harvested",
        "value": 10
      },
      "icon": "<img src='./global/data/images/icicles.png' alt='Icicles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "icicles_100",
      "name": "Icicle Master",
      "description": "Harvest 100 icicles.",
      "category": "icicles",
      "type": "threshold",
      "condition": {
        "stat": "icicles_harvested",
        "value": 100
      },
      "icon": "<img src='./global/data/images/icicles.png' alt='Icicles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "icicles_1000",
      "name": "Icicle Sage",
      "description": "Harvest 1,000 icicles.",
      "category": "icicles",
      "type": "threshold",
      "condition": {
        "stat": "icicles_harvested",
        "value": 1000
      },
      "icon": "<img src='./global/data/images/icicles.png' alt='Icicles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "icicle_level_1",
      "name": "Level Up",
      "description": "Use an icicle to level up an assistant.",
      "category": "icicles",
      "type": "event",
      "condition": {
        "event": "icicleLevelUp",
        "level": 1
      },
      "icon": "<img src='./global/data/images/icicles.png' alt='Icicles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Battle Achievements
    {
      "id": "battles_1",
      "name": "First Battle",
      "description": "Win your first battle.",
      "category": "battles",
      "type": "threshold",
      "condition": {
        "stat": "battles_won",
        "value": 1
      },
      "icon": "<img src='./global/data/images/battles.png' alt='Battles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "battles_10",
      "name": "Battle Veteran",
      "description": "Win 10 battles.",
      "category": "battles",
      "type": "threshold",
      "condition": {
        "stat": "battles_won",
        "value": 10
      },
      "icon": "<img src='./global/data/images/battles.png' alt='Battles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "battles_50",
      "name": "Battle Master",
      "description": "Win 50 battles.",
      "category": "battles",
      "type": "threshold",
      "condition": {
        "stat": "battles_won",
        "value": 50
      },
      "icon": "<img src='./global/data/images/battles.png' alt='Battles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "battles_100",
      "name": "Battle Legend",
      "description": "Win 100 battles.",
      "category": "battles",
      "type": "threshold",
      "condition": {
        "stat": "battles_won",
        "value": 100
      },
      "icon": "<img src='./global/data/images/battles.png' alt='Battles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "battle_streak_5",
      "name": "Victory Streak",
      "description": "Win 5 battles in a row.",
      "category": "battles",
      "type": "threshold",
      "condition": {
        "stat": "battle_streak",
        "value": 5
      },
      "icon": "<img src='./global/data/images/battles.png' alt='Battles' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Snowballs per Second Achievements
    {
      "id": "snowball_mist",
      "name": "Snowball Mist",
      "description": "Generate 10+ snowballs per second.",
      "category": "sps",
      "type": "threshold",
      "condition": {
        "stat": "sps",
        "value": 10
      },
      "icon": "<img src='./global/data/images/sps.png' alt='SPS' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowball_flurry",
      "name": "Snowball Flurry",
      "description": "Generate 100+ snowballs per second.",
      "category": "sps",
      "type": "threshold",
      "condition": {
        "stat": "sps",
        "value": 100
      },
      "icon": "<img src='./global/data/images/sps.png' alt='SPS' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowball_rain",
      "name": "Snowball Rain",
      "description": "Generate 1,000+ snowballs per second.",
      "category": "sps",
      "type": "threshold",
      "condition": {
        "stat": "sps",
        "value": 1000
      },
      "icon": "<img src='./global/data/images/sps.png' alt='SPS' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowball_storm",
      "name": "Snowball Storm",
      "description": "Generate 10,000+ snowballs per second.",
      "category": "sps",
      "type": "threshold",
      "condition": {
        "stat": "sps",
        "value": 10000
      },
      "icon": "<img src='./global/data/images/sps.png' alt='SPS' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowball_hurricane",
      "name": "Snowball Hurricane",
      "description": "Generate 100,000+ snowballs per second.",
      "category": "sps",
      "type": "threshold",
      "condition": {
        "stat": "sps",
        "value": 100000
      },
      "icon": "<img src='./global/data/images/sps.png' alt='SPS' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Crystal Snowball Achievements
    {
      "id": "crystal_snowballs_1",
      "name": "Crystal Collector",
      "description": "Collect your first crystal snowball.",
      "category": "crystalSnowballs",
      "type": "threshold",
      "condition": {
        "stat": "crystal_snowballs_collected",
        "value": 1
      },
      "icon": "<img src='./global/data/images/crystalSnowballs.png' alt='Crystal Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "crystal_snowballs_10",
      "name": "Crystal Enthusiast",
      "description": "Collect 10 crystal snowballs.",
      "category": "crystalSnowballs",
      "type": "threshold",
      "condition": {
        "stat": "crystal_snowballs_collected",
        "value": 10
      },
      "icon": "<img src='./global/data/images/crystalSnowballs.png' alt='Crystal Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "crystal_snowballs_100",
      "name": "Crystal Master",
      "description": "Collect 100 crystal snowballs.",
      "category": "crystalSnowballs",
      "type": "threshold",
      "condition": {
        "stat": "crystal_snowballs_collected",
        "value": 100
      },
      "icon": "<img src='./global/data/images/crystalSnowballs.png' alt='Crystal Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "crystal_snowballs_1000",
      "name": "Crystal Sage",
      "description": "Collect 1,000 crystal snowballs.",
      "category": "crystalSnowballs",
      "type": "threshold",
      "condition": {
        "stat": "crystal_snowballs_collected",
        "value": 1000
      },
      "icon": "<img src='./global/data/images/crystalSnowballs.png' alt='Crystal Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "crystal_snowballs_10000",
      "name": "Crystal Deity",
      "description": "Collect 10,000 crystal snowballs.",
      "category": "crystalSnowballs",
      "type": "threshold",
      "condition": {
        "stat": "crystal_snowballs_collected",
        "value": 10000
      },
      "icon": "<img src='./global/data/images/crystalSnowballs.png' alt='Crystal Snowballs' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Snowflake Achievements
    {
      "id": "snowflakes_1",
      "name": "Snowflake Finder",
      "description": "Find your first snowflake.",
      "category": "snowflakes",
      "type": "threshold",
      "condition": {
        "stat": "snowflakes_found",
        "value": 1
      },
      "icon": "<img src='./global/data/images/snowflakes.png' alt='Snowflakes' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflakes_10",
      "name": "Snowflake Collector",
      "description": "Find 10 snowflakes.",
      "category": "snowflakes",
      "type": "threshold",
      "condition": {
        "stat": "snowflakes_found",
        "value": 10
      },
          "icon": "<img src='./global/data/images/snowflakes.png' alt='Snowflakes' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflakes_100",
      "name": "Snowflake Master",
      "description": "Find 100 snowflakes.",
      "category": "snowflakes",
      "type": "threshold",
      "condition": {
        "stat": "snowflakes_found",
        "value": 100
      },
      "icon": "<img src='./global/data/images/snowflakes.png' alt='Snowflakes' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflakes_1000",
      "name": "Snowflake Sage",
      "description": "Find 1,000 snowflakes.",
      "category": "snowflakes",
      "type": "threshold",
      "condition": {
        "stat": "snowflakes_found",
        "value": 1000
      },
      "icon": "<img src='./global/data/images/snowflakes.png' alt='Snowflakes' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflakes_10000",
      "name": "Snowflake Deity",
      "description": "Find 10,000 snowflakes.",
      "category": "snowflakes",
      "type": "threshold",
      "condition": {
        "stat": "snowflakes_found",
        "value": 10000
      },
      "icon": "<img src='./global/data/images/snowflakes.png' alt='Snowflakes' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Snowflake Tree Achievements
    {
      "id": "snowflake_tree_1",
      "name": "Tree Planter",
      "description": "Purchase your first snowflake tree upgrade.",
      "category": "snowflakeTree",
      "type": "threshold",
      "condition": {
        "stat": "snowflake_tree_purchases",
        "value": 1
      },
      "icon": "<img src='./global/data/images/snowflakeTree.png' alt='Snowflake Tree' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflake_tree_5",
      "name": "Tree Gardener",
      "description": "Purchase 5 snowflake tree upgrades.",
      "category": "snowflakeTree",
      "type": "threshold",
      "condition": {
        "stat": "snowflake_tree_purchases",
        "value": 5
      },
      "icon": "<img src='./global/data/images/snowflakeTree.png' alt='Snowflake Tree' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflake_tree_10",
      "name": "Tree Master",
      "description": "Purchase 10 snowflake tree upgrades.",
      "category": "snowflakeTree",
      "type": "threshold",
      "condition": {
        "stat": "snowflake_tree_purchases",
        "value": 10
      },
      "icon": "<img src='./global/data/images/snowflakeTree.png' alt='Snowflake Tree' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflake_tree_25",
      "name": "Tree Sage",
      "description": "Purchase 25 snowflake tree upgrades.",
      "category": "snowflakeTree",
      "type": "threshold",
      "condition": {
        "stat": "snowflake_tree_purchases",
        "value": 25
      },
      "icon": "<img src='./global/data/images/snowflakeTree.png' alt='Snowflake Tree' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "snowflake_tree_50",
      "name": "Tree Deity",
      "description": "Purchase 50 snowflake tree upgrades.",
      "category": "snowflakeTree",
      "type": "threshold",
      "condition": {
        "stat": "snowflake_tree_purchases",
        "value": 50
      },
      "icon": "<img src='./global/data/images/snowflakeTree.png' alt='Snowflake Tree' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },

    // Baby Yeti Achievements
    {
      "id": "baby_yeti_1",
      "name": "Baby Yeti Parent",
      "description": "Own your first Baby Yeti.",
      "category": "babyYeti",
      "type": "threshold",
      "condition": {
        "stat": "baby_yeti_owned",
        "value": 1
      },
      "icon": "<img src='./global/data/images/babyYetis.png' alt='Baby Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "baby_yeti_5",
      "name": "Baby Yeti Family",
      "description": "Own 5 Baby Yetis.",
      "category": "babyYeti",
      "type": "threshold",
      "condition": {
        "stat": "baby_yeti_owned",
        "value": 5
      },
      "icon": "<img src='./global/data/images/babyYetis.png' alt='Baby Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "baby_yeti_10",
      "name": "Baby Yeti Herd",
      "description": "Own 10 Baby Yetis.",
      "category": "babyYeti",
      "type": "threshold",
      "condition": {
        "stat": "baby_yeti_owned",
        "value": 10
      },
      "icon": "<img src='./global/data/images/babyYetis.png' alt='Baby Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "baby_yeti_25",
      "name": "Baby Yeti Colony",
      "description": "Own 25 Baby Yetis.",
      "category": "babyYeti",
      "type": "threshold",
      "condition": {
        "stat": "baby_yeti_owned",
        "value": 25
      },
      "icon": "<img src='./global/data/images/babyYetis.png' alt='Baby Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    },
    {
      "id": "baby_yeti_50",
      "name": "Baby Yeti Empire",
      "description": "Own 50 Baby Yetis.",
      "category": "babyYeti",
      "type": "threshold",
      "condition": {
        "stat": "baby_yeti_owned",
        "value": 50
      },
      "icon": "<img src='./global/data/images/babyYetis.png' alt='Baby Yetis' style='width: 24px; height: 24px; vertical-align: middle;'>",
      "unlocked_at": null
    }
  ]
};