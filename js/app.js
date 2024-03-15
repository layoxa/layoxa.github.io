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

document.querySelector(".mobile-nav-ui svg").addEventListener("click", () => {
    document.querySelector(".mobile-nav-ui").classList.toggle("active");
});
document.querySelector(".mobile-nav svg").addEventListener("click", () => {
    document.querySelector(".mobile-nav-ui").classList.toggle("active");
});

AOS.init();

// create a reusable effect that swaps text
gsap.registerEffect({
    name: "swapText",
    effect: (targets, config) => {
        let tl = gsap.timeline({ delay: config.delay });
        tl.to(targets, { opacity: 0, duration: config.duration / 2, y: 10 });
        tl.add(() => (targets[0].innerText = config.text));
        tl.to(targets, { opacity: 1, duration: config.duration, y: 0 });
        return tl;
    },
    defaults: { duration: 1 },
    extendTimeline: true,
});

var tl = gsap.timeline({ repeat: -1 });
tl.swapText(".subtext", { text: "AI ASSISTANT", delay: 2 })
    .swapText(".subtext", { text: "AI FRONT DESK", delay: 2 })
    .swapText(".subtext", { text: "AI ANALYTICS", delay: 2 })
    .swapText(".subtext", { text: "PATIENT MOBILE APP", delay: 2 })
   

const translate = () => {
    window.location.replace(
        "https://translate.google.com/translate?sl=en&tl=fa&hl=en&u=leyoxa.com&client=webapp"
    );
};

window.addEventListener("scroll", () => {
    const nav = document.querySelector(".back--nav");
    const mobilenav = document.querySelector(".mobile-nav");
    const secondSection = document.querySelector(".whatwedo--div");
    if (window.scrollY > secondSection.offsetTop) {
        nav.classList.add("sticky-nav");
        mobilenav.classList.add("sticky-nav");
    } else {
        nav.classList.remove("sticky-nav");
        mobilenav.classList.remove("sticky-nav");
    }
});
document.body.style.overflowY = "hidden"

window.addEventListener("load", () => {
    const preloader = document.querySelector(".preloader");
    preloader.style.display = "none";
    document.body.style.overflowY = "scroll"
});
setTimeout(() => {
    const preloader = document.querySelector(".preloader");
    preloader.style.display = "none";
    document.body.style.overflowY = "scroll"

}, 5000);

