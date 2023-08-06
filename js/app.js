document.querySelectorAll(".item--section3").forEach((el) => {
    el.addEventListener("click", (e) => {
        const clickedElement = event.target.closest(".item--section3");
        document.querySelectorAll(".item--section3").forEach((rel) => {
            rel.classList.remove("active");
        });
        clickedElement.classList.add("active");
    });
});

document.querySelector(".footer-year").textContent = new Date().getFullYear();

const swiper = new Swiper(".swiper", {
    // Optional parameters
    direction: "horizontal",
    loop: true,
    autoplay: true,
    // If we need pagination
    pagination: {
        el: ".swiper-pagination",
    },

    // Navigation arrows
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    // And if we need scrollbar
});
