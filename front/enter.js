window.addEventListener("load", () => {

    const message = document.getElementById("message");
    const password = document.getElementById("password");
    const name = document.getElementById("name");
    const character = document.getElementById("character");
    const timeMin = document.getElementById("time-min");
    const timeSec = document.getElementById("time-sec");
    const submit = document.getElementById("submit");

    submit.addEventListener("click", () => {

        message.innerText = "";

        const time = parseInt(timeMin.value) * 60 + parseInt(timeSec.value);

        if (isNaN(time)) {
            message.innerText = "Please enter a valid time.";
            return;
        }

        if (character.value === "") {
            message.innerText = "Please enter a character.";
            return;
        }

        fetch("http://" + document.location.hostname + ":8080/leaderboard", {
            method: "POST",
            body: JSON.stringify({
                password: password.value,
                character: character.value,
                name: name.value,
                time: parseInt(timeMin.value) * 60 + parseInt(timeSec.value)
            })
        }).then((res) => {

            if (res.ok) {
                name.value = "";
                timeMin.value = "";
                timeSec.value = "";
                name.focus();
            } else {
                res.json().then((data) => {
                    message.innerText = data.message;
                }).catch((err) => {
                    message.innerText = "An error occurred.";
                });
            }

        }).catch((err) => {
            message.innerText = "An error occurred.";
        });
    });
});
