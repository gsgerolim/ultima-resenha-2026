/*
====================================================
ÚLTIMA RESENHA – 2026
THERMAS DOS LARANJAIS
====================================================
*/


/* ================================================
   CONTAGEM REGRESSIVA
================================================ */

function updateCountdown() {

    const targetDate = new Date("2026-12-05T05:00:00-03:00").getTime();

    const now = new Date().getTime();

    const difference = targetDate - now;


    if (difference <= 0) {

        const days = document.getElementById("days");
        const hours = document.getElementById("hours");
        const minutes = document.getElementById("minutes");
        const seconds = document.getElementById("seconds");

        if (days) days.textContent = "000";
        if (hours) hours.textContent = "00";
        if (minutes) minutes.textContent = "00";
        if (seconds) seconds.textContent = "00";

        return;

    }


    const daysValue = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );


    const hoursValue = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
    );


    const minutesValue = Math.floor(
        (difference / (1000 * 60)) % 60
    );


    const secondsValue = Math.floor(
        (difference / 1000) % 60
    );


    const days = document.getElementById("days");
    const hours = document.getElementById("hours");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");


    if (days) {

        days.textContent =
            String(daysValue).padStart(3, "0");

    }


    if (hours) {

        hours.textContent =
            String(hoursValue).padStart(2, "0");

    }


    if (minutes) {

        minutes.textContent =
            String(minutesValue).padStart(2, "0");

    }


    if (seconds) {

        seconds.textContent =
            String(secondsValue).padStart(2, "0");

    }

}


updateCountdown();


setInterval(updateCountdown, 1000);


/* ================================================
   ANIMAÇÃO SUAVE DOS CARDS
================================================ */

document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(
        ".action-card, .detail-card, .step-card"
    );


    cards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {

            this.style.transition = "transform .2s ease";

        });

    });

});