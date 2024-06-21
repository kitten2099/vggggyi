function buyItem(index) {
    const item = gameState.auctionItems[index];
    if (gameState.player.coins >= item.startingBid) {
        gameState.player.coins -= item.startingBid;
        addItemToInventory(item);
        gameState.auctionItems.splice(index, 1); // Remove item from auction
        updatePlayerStatus();
        renderAuctionItems();
    } else {
        alert('Niet genoeg munten om dit item te kopen.');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const gameState = {
        player: {
            name: 'Speler',
            level: 1,
            health: 100,
            maxHealth: 100,
            xp: 0,
            xpForNextLevel: 100,
            coins: 100,
            missions: [],
            currentDungeon: null,
            dungeonProgress: 0,
            selectedItem: null
        },
        auctionItems: [],
        inventoryItems: [
            { name: 'Hyperion', rarity: 'Mythic', damage: 50 },
            { name: 'Aspect of the End', rarity: 'Rare', damage: 20 },
            { name: 'Midas\' Sword', rarity: 'Legendary', damage: 40 }
        ],
        dungeons: []
    };

    const swords = [
        { name: 'Hyperion', rarity: 'Mythic', damage: 50 },
        { name: 'Aspect of the End', rarity: 'Rare', damage: 20 },
        { name: 'Midas\' Sword', rarity: 'Legendary', damage: 40 },
        { name: 'Pigman Sword', rarity: 'Legendary', damage: 35 },
        { name: 'Revenant Falchion', rarity: 'Epic', damage: 30 },
        { name: 'Livid Dagger', rarity: 'Epic', damage: 25 }
    ];

    const monsters = [
        { name: 'Zombie', health: 50, damage: 5, xp: 20 },
        { name: 'Skeleton', health: 40, damage: 7, xp: 25 },
        { name: 'Spider', health: 30, damage: 6, xp: 15 },
        // Add more monsters as needed
    ];

    function updatePlayerStatus() {
        document.getElementById('player-name').textContent = gameState.player.name;
        document.getElementById('player-level').textContent = gameState.player.level;
        document.getElementById('player-health').textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
        document.getElementById('player-coins').textContent = gameState.player.coins;
        const xpPercentage = (gameState.player.xp / gameState.player.xpForNextLevel) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercentage}%`;
    }

    function renderAuctionItems() {
        const auctionList = document.getElementById('auction-list');
        auctionList.innerHTML = '';
        gameState.auctionItems.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="${item.rarity.toLowerCase()}"><strong>${item.name}</strong> - Prijs: ${item.startingBid}</span>
                <button onclick="buyItem(${index})">Koop</button>
            `;
            auctionList.appendChild(listItem);
        });
    }

    function renderInventoryItems() {
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '';
        gameState.inventoryItems.forEach((item, index) => {
            const listItem = document.createElement('li');
            const requirement = item.name === 'Hyperion' ? ' (Level 100 vereist)' : '';
            listItem.innerHTML = `
                <span class="${item.rarity.toLowerCase()}"><strong>${item.name}</strong> (${item.rarity})${requirement}</span>
                <button onclick="selectItem(${index})">Selecteer</button>
            `;
            inventoryList.appendChild(listItem);
        });
    }

    function selectItem(index) {
        gameState.player.selectedItem = gameState.inventoryItems[index];
        alert(`Je hebt ${gameState.player.selectedItem.name} geselecteerd!`);
    }

    function addItemToAuction(item) {
        gameState.auctionItems.push(item);
        renderAuctionItems();
    }

    function addItemToInventory(item) {
        gameState.inventoryItems.push(item);
        renderInventoryItems();
    }

    function gainXP(amount) {
        gameState.player.xp += amount;
        if (gameState.player.xp >= gameState.player.xpForNextLevel) {
            gameState.player.level++;
            gameState.player.xp = 0;
            gameState.player.xpForNextLevel *= 1.5; // Increase XP required for next level
            gameState.player.maxHealth += 20; // Increase max health on level up
            gameState.player.health = gameState.player.maxHealth; // Heal to max health on level up
        }
        updatePlayerStatus();
    }

    function gainCoins(amount) {
        gameState.player.coins += amount;
        updatePlayerStatus();
    }

    function addRandomItemToAuction() {
        const randomSword = swords[Math.floor(Math.random() * swords.length)];
        const startingBid = Math.floor(Math.random() * 1000) + 100; // Random starting bid between 100 and 1100
        const newItem = { ...randomSword, startingBid };
        addItemToAuction(newItem);
    }

    function saveGame() {
        localStorage.setItem('gameState', JSON.stringify(gameState));
        alert('Game opgeslagen!');
    }

    function loadGame() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            Object.assign(gameState, JSON.parse(savedState));
            updatePlayerStatus();
            renderAuctionItems();
            renderInventoryItems();
            alert('Game geladen!');
        } else {
            alert('Geen opgeslagen game gevonden.');
        }
    }

    function addMission(description, rewardCoins, completionCondition) {
        gameState.player.missions.push({
            description,
            rewardCoins,
            completionCondition,
            completed: false
        });
    }

    function checkMissions() {
        gameState.player.missions.forEach(mission => {
            if (!mission.completed && mission.completionCondition()) {
                mission.completed = true;
                gameState.player.coins += mission.rewardCoins;
                alert(`Missie voltooid: ${mission.description}! Beloning: ${mission.rewardCoins} munten.`);
            }
        });
    }

    const craftingRecipes = {
        'Wooden Sword': {
            materials: [{ name: 'Wood', amount: 5 }],
            craft: () => addItemToInventory({ name: 'Wooden Sword', rarity: 'Common' })
        },
        // Add more recipes as needed
    };

    function craftItem(itemName) {
        const recipe = craftingRecipes[itemName];
        if (recipe) {
            const hasMaterials = recipe.materials.every(material => {
                const inventoryItem = gameState.inventoryItems.find(item => item.name === material.name);
                return inventoryItem && inventoryItem.amount >= material.amount;
            });

            if (hasMaterials) {
                recipe.materials.forEach(material => {
                    const inventoryItem = gameState.inventoryItems.find(item => item.name === material.name);
                    inventoryItem.amount -= material.amount;
                    if (inventoryItem.amount <= 0) {
                        gameState.inventoryItems.splice(gameState.inventoryItems.indexOf(inventoryItem), 1);
                    }
                });

                recipe.craft();
                renderInventoryItems();
            } else {
                alert('Niet genoeg materialen om dit item te craften.');
            }
        } else {
            alert('Crafting recept niet gevonden.');
        }
    }

    function initializeDungeons() {
        const dungeon1 = {
            name: 'Dungeon of Darkness',
            rooms: [
                { name: 'Room 1', monster: monsters[0] },
                { name: 'Room 2', monster: monsters[1] },
                { name: 'Boss Room', monster: { name: 'Dark Boss', health: 200, damage: 15, xp: 100 } }
            ],
            reward: { coins: 500, items: [{ name: 'Dark Sword', rarity: 'Legendary', damage: 50 }] }
        };
        gameState.dungeons.push(dungeon1);
    }

    function startDungeon(dungeonIndex) {
        const dungeon = gameState.dungeons[dungeonIndex];
        gameState.player.currentDungeon = dungeon;
        gameState.player.dungeonProgress = 0;
        alert(`Je bent begonnen aan de ${dungeon.name}!`);
        enterDungeonRoom();
    }

    function enterDungeonRoom() {
        const dungeon = gameState.player.currentDungeon;
        const room = dungeon.rooms[gameState.player.dungeonProgress];
        if (room) {
            const action = confirm(`Je bent aangekomen in ${room.name}. Monster: ${room.monster.name}. Wil je vechten?`);
            if (action) {
                fightMonster(room.monster);
            } else {
                alert('Je bent ontsnapt uit de dungeon.');
                gameState.player.currentDungeon = null;
                gameState.player.dungeonProgress = 0;
            }
        } else {
            alert(`Gefeliciteerd! Je hebt de ${dungeon.name} voltooid! Beloning: ${dungeon.reward.coins} munten.`);
            gameState.player.coins += dungeon.reward.coins;
            dungeon.reward.items.forEach(addItemToInventory);
            gameState.player.currentDungeon = null;
            gameState.player.dungeonProgress = 0;
        }
    }

    function fightMonster(monster) {
        if (!gameState.player.selectedItem) {
            alert('Selecteer eerst een item om mee te vechten!');
            return;
        }

        const playerDamage = gameState.player.selectedItem.damage;
        while (monster.health > 0 && gameState.player.health > 0) {
            // Player attacks monster
            monster.health -= playerDamage;
            if (monster.health <= 0) {
                alert(`Je hebt de ${monster.name} verslagen!`);
                gainXP(monster.xp);
                gameState.player.dungeonProgress++;
                enterDungeonRoom();
                return;
            }

            // Monster attacks player
            gameState.player.health -= monster.damage;
            if (gameState.player.health <= 0) {
                alert('Je bent verslagen!');
                gameState.player.currentDungeon = null;
                gameState.player.dungeonProgress = 0;
                gameState.player.health = gameState.player.maxHealth;
                return;
            }
        }
    }

    // Event listeners
    document.getElementById('gain-xp').addEventListener('click', () => gainXP(50));
    document.getElementById('gain-coins').addEventListener('click', () => gainCoins(100));
    document.getElementById('open-auction-house').addEventListener('click', () => {
        document.getElementById('auction-house').classList.toggle('hidden');
    });
    document.getElementById('open-inventory').addEventListener('click', () => {
        document.getElementById('inventory').classList.toggle('hidden');
    });
    document.getElementById('add-item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const itemName = document.getElementById('item-name').value;
        const startingBid = document.getElementById('starting-bid').value;
        const itemRarity = document.getElementById('item-rarity').value;
        addItemToAuction({ name: itemName, startingBid: parseInt(startingBid), rarity: itemRarity });
    });
    document.getElementById('add-random-item').addEventListener('click', addRandomItemToAuction);
    document.getElementById('craft-item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const craftItemName = document.getElementById('craft-item-name').value;
        craftItem(craftItemName);
    });
    document.getElementById('save-game').addEventListener('click', saveGame);
    document.getElementById('load-game').addEventListener('click', loadGame);
    document.getElementById('start-dungeon').addEventListener('click', () => startDungeon(0));

    // Initialize game
    updatePlayerStatus();
    renderAuctionItems();
    renderInventoryItems();
    initializeDungeons();
    addMission('Bereik level 5', 500, () => gameState.player.level >= 5);
});
