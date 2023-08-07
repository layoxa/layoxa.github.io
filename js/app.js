document.querySelectorAll(".item--section3").forEach((el) => {
    el.addEventListener("click", (e) => {
        const clickedElement = e.target.closest(".item--section3");
        document.querySelectorAll(".item--section3").forEach((rel) => {
            rel.classList.remove("active");
        });

        document.querySelector(
            ".img--section3"
        ).src = `/img/${clickedElement.getAttribute("data-idx")}.png`;
        clickedElement.classList.add("active");
    });
});

document.querySelector(".footer-year").textContent = new Date().getFullYear();

const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: true,
    autoplay: true,
    pagination: {
        el: ".swiper-pagination",
    },

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});
