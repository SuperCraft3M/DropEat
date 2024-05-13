window.addEventListener("load", () => {

    const update = () => {

        fetch("http://" + document.location.hostname + ":8080/leaderboard").then((res) => res.json()).then((res) => {

            const parent = document.getElementById("leaderboard");
            parent.innerText = "";

            for (const leaderboard of res.leaderboard.slice(0, 5)) {

                const child = document.createElement("div");
                child.className = "participant";

                const character = document.createElement("img");
                character.className = "character";
                if (leaderboard.character === "Humain")
                    character.src = "/imgs/human.png";
                else if (leaderboard.character === "Alien")
                    character.src = "/imgs/alien.png";
                else if (leaderboard.character === "Gorille")
                    character.src = "/imgs/gorille.png";

                const text = document.createElement("div");
                text.className = "text";

                const name = document.createElement("div");
                name.className = "name";
                name.innerText = leaderboard.name;

                const time = document.createElement("div");
                time.className = "time";
                time.innerText = formatDuration(leaderboard.time * 1000);

                text.appendChild(name);
                text.appendChild(time);

                child.appendChild(character);
                child.appendChild(text);

                parent.appendChild(child);
            }
        });
    }

    update();

    setInterval(() => update(), 5000);
});

const formatDuration = (time) => {

    const units = [
        {
            timeInSeconds: 365 * 24 * 60 * 60,
            singularName: "year",
            plurialName: "years"
        },
        {
            timeInSeconds: 30 * 24 * 60 * 60,
            singularName: "month",
            plurialName: "months"
        },
        {
            timeInSeconds: 24 * 60 * 60,
            singularName: "day",
            plurialName: "days"
        },
        {
            timeInSeconds: 60 * 60,
            singularName: "hour",
            plurialName: "hours"
        },
        {
            timeInSeconds: 60,
            singularName: "minute",
            plurialName: "minutes"
        },
        {
            timeInSeconds: 1,
            singularName: "second",
            plurialName: "seconds"
        }
    ];

    units.sort((a, b) => b.timeInSeconds - a.timeInSeconds);
    time /= 1000;

    let result = units.map((unit) => {

        let amount = 0;
        while (time >= unit.timeInSeconds) {
            amount++;
            time -= unit.timeInSeconds;
        }

        return amount > 0 ? `${amount} ${amount > 1 ? unit.plurialName : unit.singularName}` : null;

    }).filter((amount) => !!amount).join(", ");

    const i = result.lastIndexOf(",");
    if (i > 0) result = result.substring(0, i) + " et" + result.substring(i + 1);

    return result || "Moins d'une seconde";
}
