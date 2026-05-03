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
            monster[key] = 4 + 0.5 * (level)
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

if (group == "Elite") {
    monster["HP"] *= 2
} else if (group == "Solo") {
    monster["HP"] *= 4
}
monster["Level"] = level
monster["Role"] = role
monster["Group"] = group
if (group != "Minion") {
    monster["Multi-Dam"] = monster["Dam"]*multi_attack_mod["Dam"]
    monster["Multi-Atk"] = monster["Atk"] + multi_attack_mod["Atk"]
    monster["Limited-Dam"] = monster["Dam"]*limited_mod["Dam"]
    monster["Bld"] = monster["HP"] / 2
} else {
    document.getElementById("Non-Minion-Bld").innerHTML = ""
    document.getElementById("Non-Minion-Multi").innerHTML = ""
    document.getElementById("Bld").innerHTML = ""
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