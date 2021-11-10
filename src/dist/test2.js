var attackList = [{ attackMin: 0, attackMax: 150, zoneId: 1, levelMin: 1, levelMax: 4 },
    { attackMin: 151, attackMax: 300, zoneId: 1, levelMin: 5, levelMax: 10 },
    { attackMin: 301, attackMax: 400, zoneId: 2, levelMin: 1, levelMax: 10 },
    { attackMin: 401, attackMax: 520, zoneId: 3, levelMin: 1, levelMax: 10 },
    { attackMin: 521, attackMax: 670, zoneId: 4, levelMin: 1, levelMax: 10 },
    { attackMin: 671, attackMax: 870, zoneId: 5, levelMin: 1, levelMax: 10 },
    { attackMin: 871, attackMax: 990, zoneId: 6, levelMin: 1, levelMax: 10 },
    { attackMin: 991, attackMax: 1170, zoneId: 7, levelMin: 1, levelMax: 10 },
    { attackMin: 1171, attackMax: 1280, zoneId: 8, levelMin: 1, levelMax: 10 },
    { attackMin: 1281, attackMax: 1380, zoneId: 9, levelMin: 1, levelMax: 10 },
    { attackMin: 1380, attackMax: 99999099, zoneId: 10, levelMin: 1, levelMax: 10 }
];
function getLevelBoss(attackUser1, attackUser2) {
    var attack = (attackUser1 + attackUser2) / 2;
    var zone = { zoneId: attackList[0].zoneId, level: attackList[0].levelMin };
    for (var i = 0; i < attackList.length; i++) {
        if (attack <= attackList[i].attackMax && attack >= attackList[i].attackMin) {
            zone.zoneId = attackList[i].zoneId;
            var range = attackList[i].levelMax - attackList[i].levelMin;
            zone.level = attackList[i].levelMin + Math.round(Math.random() * range);
        }
    }
    console.log(zone);
    return zone;
}
getLevelBoss(151, 151);
