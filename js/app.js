document.querySelectorAll(".item--section3").forEach((el) => {
    el.addEventListener("click", (e) => {
        const clickedElement = event.target.closest(".item--section3");
        document.querySelectorAll(".item--section3").forEach((rel) => {
            rel.classList.remove("active");
        });
        clickedElement.classList.add("active");
    });
});
