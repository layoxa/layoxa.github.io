const texts = [
    {
        head: "Excellence in Quality:",
        text: "We promise top-notch software development, design, and marketing solutions. Each project sets new industry standards thanks to our precise internal processes.",
    },
    {
        head: "Continuous Learning:",
        text: "We're all about ongoing growth. Our team thrives on learning through training, workshops, and staying updated on the latest technologies",
    },
    {
        head: "Innovation and Creativity:",
        text: "We're all about fresh ideas. Our drive for innovation means clients get cutting-edge solutions that reshape their competitiveness.",
    },
    {
        head: "Teamwork and Communication:",
        text: "We believe in open talk and teamwork. Our crew communicates openly, ensuring smooth teamwork and knowledge sharing.",
    },
    {
        head: "Clients at the Core:",
        text: "Our clients' success is everything. We tailor solutions to fit their unique needs, with regular feedback helping us improve continuously.",
    },
];

document.querySelectorAll(".icon").forEach((el) => {
    el.addEventListener("mouseover", (e) => {
        const index = parseInt(el.getAttribute("data-idx"));
        const text = texts[index - 1];
        document.querySelector(".text-circle h1").textContent = text.head;
        document.querySelector(".text-circle p").textContent = text.text;
    });
});

const texts2 = [
    {
        head: "Our Unwavering Promise:",
        text: "At Leyoxa, our commitment goes beyond the ordinary. We're embarked on a mission to reshape global norms, setting humanity on a transformative journey. With steadfast determination, we're at the forefront of human advancement, breaking traditional barriers. Our dedication propels us towards a sustainable world, where each action shapes a brighter future. Rooted in our values is an unwavering pledge to ensure healthcare reaches every corner. Through innovative solutions, we bridge gaps, connecting communities to better care, fostering a healthier, fairer world. This isn't just talk; it's our devoted promise to drive humanity forward—progress, accessibility, and enduring sustainability.",
    },
    {
        head: "Putting You First: ",
        text: "At Leyoxa, our core promise revolves around your satisfaction. We go beyond the expected, delivering innovative solutions that ignite business growth while tackling unique challenges. We assure timely deliveries, transparent pricing, and lasting partnerships. Furthermore, we're committed to our world—contributing a portion of our profits to environmental and social causes. As trailblazers in software, design, and marketing, we share our insights, sparking progress across industries and beyond.",
    },
    {
        head: "Our Unwavering Promise:",
        text: "At Leyoxa, our commitment goes beyond the ordinary. We're embarked on a mission to reshape global norms, setting humanity on a transformative journey. With steadfast determination, we're at the forefront of human advancement, breaking traditional barriers. Our dedication propels us towards a sustainable world, where each action shapes a brighter future. Rooted in our values is an unwavering pledge to ensure healthcare reaches every corner. Through innovative solutions, we bridge gaps, connecting communities to better care, fostering a healthier, fairer world. This isn't just talk; it's our devoted promise to drive humanity forward—progress, accessibility, and enduring sustainability.",
    },
    {
        head: "Putting You First: ",
        text: "At Leyoxa, our core promise revolves around your satisfaction. We go beyond the expected, delivering innovative solutions that ignite business growth while tackling unique challenges. We assure timely deliveries, transparent pricing, and lasting partnerships. Furthermore, we're committed to our world—contributing a portion of our profits to environmental and social causes. As trailblazers in software, design, and marketing, we share our insights, sparking progress across industries and beyond.",
    },
    {
        head: "Our Unwavering Promise:",
        text: "At Leyoxa, our commitment goes beyond the ordinary. We're embarked on a mission to reshape global norms, setting humanity on a transformative journey. With steadfast determination, we're at the forefront of human advancement, breaking traditional barriers. Our dedication propels us towards a sustainable world, where each action shapes a brighter future. Rooted in our values is an unwavering pledge to ensure healthcare reaches every corner. Through innovative solutions, we bridge gaps, connecting communities to better care, fostering a healthier, fairer world. This isn't just talk; it's our devoted promise to drive humanity forward—progress, accessibility, and enduring sustainability.",
    },
];

document.querySelectorAll(".icon2").forEach((el) => {
    el.addEventListener("mouseover", (e) => {
        const index = parseInt(el.getAttribute("data-idx"));
        const text2 = texts2[index - 1];
        document.querySelector(".text-circle2 h1").textContent = text2.head;
        document.querySelector(".text-circle2 p").textContent = text2.text;
    });
});

document.querySelector(".footer-year").textContent = new Date().getFullYear();

const translate = () => {
    window.location.replace(
        "https://translate.google.com/translate?sl=en&tl=fa&hl=en&u=leyoxa.com&client=webapp"
    );
};

document.querySelector(".mobile-nav-ui svg").addEventListener("click", () => {
    document.querySelector(".mobile-nav-ui").classList.toggle("active");
});
document.querySelector(".mobile-nav svg").addEventListener("click", () => {
    document.querySelector(".mobile-nav-ui").classList.toggle("active");
});

window.addEventListener("scroll", () => {
    const nav = document.querySelector(".back--nav");
    const mobilenav = document.querySelector(".mobile-nav");
    const secondSection = document.querySelector(".header");
    if (window.scrollY > secondSection.offsetTop) {
        nav.classList.add("sticky-nav");
        mobilenav.classList.add("sticky-nav");
    } else {
        nav.classList.remove("sticky-nav");
        mobilenav.classList.remove("sticky-nav");
    }
});
