import random
import json

fake_notes = [
"Amazing autonomous!",
"That climb was flawless.",
"Robot's speed is impressive.",
"Consistent scoring all day.",
"Needs more defensive power.",
"Drive team was on point.",
"Programming is top-notch.",
"Great intake design!",
"Defense was lacking.",
"Solid build quality.",
"Shoots incredibly fast!",
"Needs better reliability.",
"Impressive endgame strategy.",
"Slightly inconsistent shots.",
"Wow, that maneuver!",
"Could use more power.",
"Excellent driver skills.",
"Robot broke down early.",
"Creative engineering.",
"Very smooth operation.",
"Needs more reach.",
"Consistent climber.",
"Poor placement strategy.",
"Fantastic teamwork!",
"Overly complicated design.",
"Underwhelming performance.",
"Amazing recovery after failure.",
"Needs better weight distribution.",
"Strong manipulator.",
"Difficult to defend.",
"Impressive auto routine.",
"Could use more durability.",
"Let's fix the wiring!",
"Excellent programming logic.",
"Needs faster cycling.",
"Good job, team!",
"Underperformed today.",
"Solid design, needs tuning.",
"Impressive maneuverability.",
"A few glitches, overall good.",
]


def teamNumbers(teamCount):
    n = 120
    nums = []
    for i in range(1, teamCount+1):
        n += random.randint(5, 500)
        nums.append("{}".format(n))
    return nums


def matchSchedule(teamNumbers, matchCount):
    matches = []
    for i in range(matchCount):
        teams = list(teamNumbers)
        random.shuffle(teams)
        matches.append(teams[:6])
    return matches


def scoutMatch(matchNum, teams, matchType):

    red = teams[:3]
    blue = teams[3:]

    categories = ["auto", "coral", "algae", "driver", "end"]

    rankings = {}
    for cat in categories:
        random.shuffle(red)
        for rank, team in enumerate(red):
            if team not in rankings:
                rankings[team] = {}
            rankings[team][cat] = rank+1

        random.shuffle(blue)
        for rank, team in enumerate(blue):
            if team not in rankings:
                rankings[team] = {}
            rankings[team][cat] = rank+1

    notes = {}
    for team in rankings:
        if random.random() < 0.2:
            notes[team] = random.sample(fake_notes, 1)[0]

    return {
        "matchNumber": matchNum,
        "matchType": matchType,
        "rankings": rankings,
        "notes": notes,
    }


# write out as json
def writeMatchData(matchData):
    with open("data/nhdur_match{}.json".format(matchData["matchNumber"]), "w") as f:
        f.write(json.dumps(matchData))


def main():
    nums = teamNumbers(30)
    matches = matchSchedule(nums, 90)
    for matchNum, matchTeams in enumerate(matches):
        matchData = scoutMatch(matchNum+1, matchTeams, "qualification")
        writeMatchData(matchData)


if __name__ == '__main__':
    main()
