document.getElementById("menu-btn").addEventListener("click", function() {
    document.body.classList.toggle("menu-active");
});

document.getElementById("close-btn").addEventListener("click", function() {
    document.body.classList.remove("menu-active");
});

document.getElementById("overlay").addEventListener("click", function() {
    document.body.classList.remove("menu-active");
});
