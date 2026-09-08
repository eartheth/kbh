const loginForm = document.getElementById("loginForm");
const secretInput = document.getElementById("secretCode");
const messageBox = document.getElementById("messageBox");

function sha256(ascii) {

    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    let mathPow = Math.pow;
    let maxWord = mathPow(2, 32);

    let lengthProperty = "length";

    let i, j;

    let result = "";

    let words = [];

    let asciiBitLength =
        ascii[lengthProperty] * 8;

    let hash = sha256.h = sha256.h || [];
    let k = sha256.k = sha256.k || [];

    let primeCounter = k[lengthProperty];

    let isComposite = {};

    for (
        let candidate = 2;
        primeCounter < 64;
        candidate++
    ) {

        if (!isComposite[candidate]) {

            for (
                i = 0;
                i < 313;
                i += candidate
            ) {
                isComposite[i] = candidate;
            }

            hash[primeCounter] =
                (mathPow(candidate, 0.5) * maxWord) | 0;

            k[primeCounter++] =
                (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }


    ascii += "\x80";

    while (
        ascii[lengthProperty] % 64 - 56
    ) {
        ascii += "\x00";
    }


    for (
        i = 0;
        i < ascii[lengthProperty];
        i++
    ) {

        j = ascii.charCodeAt(i);

        if (j >> 8) {
            return;
        }

        words[i >> 2] |=
            j << ((3 - i) % 4) * 8;
    }


    words[words[lengthProperty]] =
        ((asciiBitLength / maxWord) | 0);

    words[words[lengthProperty]] =
        asciiBitLength;


    for (
        j = 0;
        j < words[lengthProperty];
    ) {

        let w =
            words.slice(j, j += 16);

        let oldHash =
            hash.slice(0);

        hash =
            hash.slice(0, 8);


        for (
            i = 0;
            i < 64;
            i++
        ) {

            let i2 = i + j;

            let w15 = w[i - 15];
            let w2 = w[i - 2];

            let a = hash[0];
            let e = hash[4];


            let temp1 =
                hash[7]

                + (
                    rightRotate(e, 6)
                    ^ rightRotate(e, 11)
                    ^ rightRotate(e, 25)
                )

                + (
                    (e & hash[5])
                    ^ ((~e) & hash[6])
                )

                + k[i]

                + (
                    w[i] =
                    i < 16
                        ? w[i]
                        : (
                            w[i - 16]

                            + (
                                rightRotate(w15, 7)
                                ^ rightRotate(w15, 18)
                                ^ (w15 >>> 3)
                            )

                            + w[i - 7]

                            + (
                                rightRotate(w2, 17)
                                ^ rightRotate(w2, 19)
                                ^ (w2 >>> 10)
                            )
                        ) | 0
                );


            let temp2 =
                (
                    rightRotate(a, 2)
                    ^ rightRotate(a, 13)
                    ^ rightRotate(a, 22)
                )

                + (
                    (a & hash[1])
                    ^ (a & hash[2])
                    ^ (hash[1] & hash[2])
                );


            hash = [
                (temp1 + temp2) | 0,
                hash[0],
                hash[1],
                hash[2],
                (hash[3] + temp1) | 0,
                hash[4],
                hash[5],
                hash[6]
            ];
        }


        for (
            i = 0;
            i < 8;
            i++
        ) {

            hash[i] =
                (hash[i] + oldHash[i]) | 0;

        }

    }


    for (
        i = 0;
        i < 8;
        i++
    ) {

        for (
            j = 3;
            j + 1;
            j--
        ) {

            let b =
                (hash[i] >> (j * 8)) & 255;

            result +=
                (b < 16 ? "0" : "") +
                b.toString(16);
        }
    }


    return result;
}


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const secretCode = secretInput.value;

    messageBox.className = "message-box";
    messageBox.textContent = "";

    try {

        const response = await fetch("./users.json", {
            cache: "no-store"
        });

        console.log("users.json response:", response);

        if (!response.ok) {
            throw new Error(
                "users.json returned HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log("Loaded JSON:", data);

        const enteredHash = await sha256(secretCode);

        console.log("Entered hash:", enteredHash);
        console.log("Expected hash:", data.secretHash);


        if (enteredHash === data.secretHash) {

            sessionStorage.setItem("loggedIn", "true");

            messageBox.className =
                "message-box success";

            messageBox.textContent =
                "Access granted! Redirecting...";

            setTimeout(function () {

                window.location.href =
                    "portal.html";

            }, 500);

        } else {

            messageBox.className =
                "message-box error";

            messageBox.textContent =
                "Incorrect secret code.";

        }

    }

    catch (error) {

        console.error("LOGIN ERROR:", error);

        messageBox.className =
            "message-box error";

        messageBox.textContent =
            "Unable to login.";

    }

});