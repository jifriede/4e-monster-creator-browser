const base_monster = {
    HP: 0,
    AC: 14,
    NAD: 12,
    Atk: 3,
    Dam: 8,
    Init: 3
}
const per_level = {
    AC: 1,
    NAD: 1,
    Atk: 1,
    Dam: 1,
    Init: 1
}
const soldier_mod = {
    HP: 24,
    HP_per_level: 8,
    AC: 2,
    Init: 2
}
const brute_mod = {
    HP: 26,
    HP_per_level: 10,
    AC: -2,
    Dam: 0.75
}
const controller_mod = {
    HP: 24,
    HP_per_level: 8
}
const lurker_mod = {
    HP: 21,
    HP_per_level: 6,
    Init: 4
}
const skirmisher_mod = {
    HP: 24,
    HP_per_level: 8,
    Init: 2
}
const artillery_mod = {
    HP: 21,
    HP_per_level: 6,
    AC: -2,
    Atk: 1
}
const multi_attack_mod = {
    Atk: -2,
    Dam: 0.75
}
const limited_mod = {
    Dam: 1.25
}

const queryParams = new URLSearchParams(window.location.search)
let level = Number(queryParams.get("level")) || 1
let role = queryParams.get("role") || "Soldier"
let group = queryParams.get("group") || "Standard"
const role_mods = {
    "Soldier": soldier_mod,
    "Brute": brute_mod,
    "Controller": controller_mod,
    "Lurker": lurker_mod,
    "Skirmisher": skirmisher_mod,
    "Artillery": artillery_mod
}

let monster = base_monster
let role_mod = role_mods[role]
for (let key in monster) {
    if (group == "Minion") {
        if (key == "HP") {
            monster[key] = 1
        } else if (key == "Dam") {
            monster[key] = Math.round(4 + 0.5 * (level))
        } else {
            monster[key] += per_level[key] * (level)
        }
    } else {
        if (key == "HP") {
            monster[key] = role_mod[key] + role_mod[key + "_per_level"] * (level)
        } else {
            monster[key] += per_level[key] * (level)
            if (role_mod[key]) {
                if (key == "Dam") {
                    monster[key] *= role_mod[key]
                } else {
                    monster[key] += role_mod[key]
                }
            }
        }
    }
}

monster["Dam"] = Math.round(monster["Dam"])

if (group == "Elite") {
    monster["HP"] *= 2
} else if (group == "Solo") {
    monster["HP"] *= 4
}
monster["Level"] = level
monster["Role"] = role
monster["Group"] = group
if (group != "Minion") {
    monster["Multi-Dam"] = Math.round(monster["Dam"]*multi_attack_mod["Dam"])
    monster["Multi-Atk"] = monster["Atk"] + multi_attack_mod["Atk"]
    monster["Limited-Dam"] = Math.round(monster["Dam"]*limited_mod["Dam"])
    monster["Bld"] = Math.floor(monster["HP"] / 2)
} else {
    document.getElementById("Non-Minion-Bld").innerHTML = ""
    document.getElementById("Non-Minion-Multi").innerHTML = ""
    document.getElementById("Bld").innerHTML = ""
    document.querySelectorAll('.tooltiptext').forEach(el => { el.style.display = 'none' })
    document.querySelectorAll('.tooltip').forEach(el => {el.classList.remove('tooltip')})
}
console.log(monster)

for (let key in monster) {
    let element = document.getElementById(key)
    if (element) {
        element.innerText += String(monster[key])
    }
}
if (group == "Minion") {
    document.getElementById("Dam").innerText += " (no roll)"
}

inner_HTML_role_info ={
    Artillery: `
    <p>    
        Ranged damage and area of effect attacks. They need allies to draw off attacks. Consider the following powers:<br>    
        - Area burst for damage<br>    
        - Slow or daze a target<br>    
        - Step away from a target in melee
    </p>`,
    Brute: `
    <p>
        Specialize in melee attacks. They don't move around a lot. Consider the following powers:<br>
        - Deal extra damage when targeting a creature under certain conditions<br>
        - Make the target grant combat advantage<br>
        - Make the target vulnerable to a certain damage type
    </p>`,
    Controller: `
    <p>
        Just behind the front line, capable in melee. Good at short range in combat. Consider the following powers:<br>
        - Slide target<br>
        - Create zone on battlefield<br>
        - Invoke condition
    </p>`,
    Elite: `
    <p>
        Tougher and more of a threat than standards.<br>
        - 1 Action Point<br>
        - +2 on saves
    </p>`,
    Lurker: `
    <p>
        Abilities to avoid attacks. Often a big attack and defense every few rounds. Consider the following powers:<br>
        - Stealth with cover/concealment (instead of superior cover or total concealment)<br>
        - Benefit from invisibility (stealth)<br>
        - Gain combat advantage
    </p>`,
    Minion: `
    <p>
        Shock troops and cannon fodder. Use them as melee combatants placed between PCs and back-rank artillery or controllers.<br>
        - Make target grant combat advantage<br>
        - Penalty for moving/ignoring
    </p>`,
    Skirmisher: `
    <p>
        Use mobility to threaten PCs. Move to attack from sides and rear. Consider the following powers:<br>
        - Shift before/after attacks<br>
        - Benefit from moving
    </p>`,
    Soldier: `
    <p>
        Draw PC attacks and defend other monsters. Hinder PC movement. Consider the following powers:<br>
        - Mark target<br>
        - Grant restrain or immobilize<br>
        - Opportunity actions (move/attack)
    </p>`,
    Solo: `
    <p>
        While solos can lean toward certain roles, they never completely take on a role.<br>
        - 2 Action Points<br>
        - +5 on saves<br>
        - Needs a way to remove conditions
    </p>`,
}

role_info = document.getElementById("RoleInfo")
role_info.innerHTML = inner_HTML_role_info[role]
if (group != "Standard") {
    role_info.innerHTML += inner_HTML_role_info[group]
}

if (group != "Minion") {
    function determine_dice(damage, level){
        let mod = level/2 + 3
        let total_damage = Math.round(damage)
        let dice_damage = total_damage - mod
        let list_of_dice = []
        const dice_sizes = [6, 8, 10, 12]
        for (let num_dice = 1; num_dice <= 10; num_dice++) {
            for (let size of dice_sizes) {
                temp_dice_damage = Math.round(num_dice * (size + 1) / 2)
                if (Math.abs(temp_dice_damage - dice_damage) < 2) {
                    list_of_dice.push(`${num_dice}d${size}+${total_damage - temp_dice_damage}`)
                }
            }
        }
        return list_of_dice
    }

    document.getElementById("DamTooltip").innerHTML = `${determine_dice(monster["Dam"], monster["Level"]).join("; ")}`
    document.getElementById("MultiDamTooltip").innerHTML = `${determine_dice(monster["Multi-Dam"], monster["Level"]).join("; ")}`
    document.getElementById("LimitedDamTooltip").innerHTML = `${determine_dice(monster["Limited-Dam"], monster["Level"]).join("; ")}`
}